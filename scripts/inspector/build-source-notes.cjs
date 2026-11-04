/* Offline source audit only: no browser, WordPress requests or credential reads. */
const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '../..');
const outDir = process.argv[2] || '/tmp/source-audit';
const inventory = JSON.parse(fs.readFileSync(path.join(outDir, 'inventory.json'), 'utf8'));
const reports = fs.readdirSync(outDir).filter(f => f.endsWith('-detail.json')).flatMap(f => {
  const data = JSON.parse(fs.readFileSync(path.join(outDir, f), 'utf8'));
  return Array.isArray(data) ? data : data.entries || [];
});
const parsed = new Map();
function read(file) {
  if (parsed.has(file)) return parsed.get(file);
  const absolute = path.join(root, 'src', file);
  if (!fs.existsSync(absolute)) return null;
  const text = fs.readFileSync(absolute, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const definitions = [], imports = new Map();
  function resolve(spec) {
    const base = spec.startsWith('@/') ? spec.slice(2) : spec.startsWith('.') ? path.normalize(path.join(path.dirname(file), spec)) : '';
    if (!base) return null;
    const clean = base.replace(/\.(tsx?|jsx?)$/, '');
    return [clean + '.ts', clean + '.tsx', clean + '/index.ts', clean + '/index.tsx'].find(p => fs.existsSync(path.join(root, 'src', p))) || null;
  }
  function visit(n) {
    if (ts.isImportDeclaration(n) && n.importClause) {
      const target = resolve(n.moduleSpecifier.text);
      const b = n.importClause.namedBindings;
      if (target && b && ts.isNamedImports(b)) for (const e of b.elements) imports.set(e.name.text, { file: target, name: e.propertyName?.text || e.name.text });
      if (target && n.importClause.name) imports.set(n.importClause.name.text, { file: target, name: 'default' });
    }
    if (ts.isVariableDeclaration(n) || ts.isFunctionDeclaration(n) || ts.isParameter(n)) {
      const names = [];
      if (n.name && ts.isIdentifier(n.name)) names.push(n.name.text);
      else if (n.name && (ts.isObjectBindingPattern(n.name) || ts.isArrayBindingPattern(n.name))) for (const e of n.name.elements) if (e.name && ts.isIdentifier(e.name)) names.push(e.name.text);
      for (const name of names) definitions.push({ name, node: n, at: n.getStart(sf) });
    }
    ts.forEachChild(n, visit);
  }
  visit(sf);
  const entry = { text, sf, definitions, imports }; parsed.set(file, entry); return entry;
}
function prose(expr) {
  const sf = ts.createSourceFile('expression.tsx', 'const result = ' + expr, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const init = sf.statements[0]?.declarationList?.declarations[0]?.initializer;
  const describe = n => {
    if (!n) return expr;
    if (ts.isParenthesizedExpression(n) || ts.isAsExpression(n)) return describe(n.expression);
    if (ts.isStringLiteral(n)) return n.text ? `固定文字“${n.text}”` : '空文字';
    if (ts.isNumericLiteral(n)) return `数字 ${n.text}`;
    if (n.kind === ts.SyntaxKind.NullKeyword) return '不显示内容';
    if (ts.isConditionalExpression(n)) return `先判断「${n.condition.getText(sf)}」：成立时用${describe(n.whenTrue)}，否则用${describe(n.whenFalse)}`;
    if (ts.isBinaryExpression(n)) {
      const op = n.operatorToken.kind;
      if (op === ts.SyntaxKind.BarBarToken) return `先取${describe(n.left)}；它为 0、空文字、false、null 或 undefined 时，改用${describe(n.right)}`;
      if (op === ts.SyntaxKind.QuestionQuestionToken) return `先取${describe(n.left)}；只有 null 或 undefined 时才改用${describe(n.right)}`;
      if (op === ts.SyntaxKind.AmpersandAmpersandToken) return `只有「${n.left.getText(sf)}」成立才显示${describe(n.right)}`;
      if (op === ts.SyntaxKind.PlusToken) return `${describe(n.left)}加上${describe(n.right)}（具体是数值加法还是文字拼接，取决于输入类型）`;
      if (op === ts.SyntaxKind.MinusToken) return `${describe(n.left)}减去${describe(n.right)}`;
      if (op === ts.SyntaxKind.SlashToken) return `${describe(n.left)}除以${describe(n.right)}`;
      if (op === ts.SyntaxKind.AsteriskToken) return `${describe(n.left)}乘以${describe(n.right)}`;
    }
    if (ts.isPropertyAccessExpression(n) && n.name.text === 'length') return `「${n.expression.getText(sf)}」的长度（数组是条数，文字是字符数）`;
    if (ts.isCallExpression(n)) {
      const call = n.expression.getText(sf), args = n.arguments.map(a => a.getText(sf));
      if (call.endsWith('.filter')) return `从「${n.expression.expression.getText(sf)}」只保留满足「${args[0]}」的项`;
      if (call.endsWith('.slice')) return `取「${n.expression.expression.getText(sf)}」从 ${args[0] || 0} 到 ${args[1] || '末尾'} 的部分（结束位置不包含）`;
      if (call.endsWith('.toFixed')) return `把「${n.expression.expression.getText(sf)}」保留 ${args[0]} 位小数`;
      if (call === 'Math.round') return `把${describe(n.arguments[0])}四舍五入到整数`;
      if (call.endsWith('.map')) return `把「${n.expression.expression.getText(sf)}」逐项按「${args[0]}」转换后显示`;
      if (call === 't' || call === 'Z') return `当前语言的界面文字（${args.join('，')}）`;
      if (/^format/.test(call)) return `用 ${call} 把「${args.join('，')}」转换为显示格式`;
      return `调用 ${call}，传入「${args.join('，')}」，显示它返回的结果`;
    }
    if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) return '该分支的界面内容';
    return `「${n.getText(sf)}」`;
  };
  return describe(init);
}
const ignored = new Set(['true','false','null','undefined','Math','Date','Number','String','Array','Object','t','Z','cn']);
function identifiers(code) {
  return [...new Set([...code.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, '').matchAll(/(?<![.\w$])([A-Za-z_$][\w$]*)/g)].map(m => m[1]).filter(n => !ignored.has(n)))];
}
function traces(file, expressions, line) {
  const found = [], seen = new Set();
  let queue = identifiers(expressions.join(' ')).map(name => ({ file, name, line, depth: 0 }));
  while (queue.length && found.length < 16) {
    const q = queue.shift(), key = q.file + ':' + q.name;
    if (seen.has(key) || q.depth > 4) continue;
    seen.add(key);
    const p = read(q.file); if (!p) continue;
    const at = p.sf.getPositionOfLineAndCharacter(Math.min(q.line - 1, p.text.split('\n').length - 1), 0);
    const hits = p.definitions.filter(d => d.name === q.name && d.at <= at);
    let hit = hits[hits.length - 1] || p.definitions.find(d => d.name === q.name);
    if (!hit) {
      const imp = p.imports.get(q.name);
      if (imp && imp.name !== 'default') queue.push({ ...imp, line: 100000, depth: q.depth + 1 });
      continue;
    }
    const n = hit.node, position = p.sf.getLineAndCharacterOfPosition(n.getStart(p.sf)).line + 1;
    if (ts.isParameter(n)) { found.push({ file: q.file, line: position, name: q.name, text: `「${q.name}」是这个函数接收的输入，不能把其他同名变量当作它的数据来源。` }); continue; }
    const code = n.getText(p.sf);
    const init = ts.isVariableDeclaration(n) ? n.initializer?.getText(p.sf) : null;
    found.push({ file: q.file, line: position, name: q.name, text: init ? `「${q.name}」在这里赋值：${prose(init)}。` : `「${q.name}」是此处定义的处理函数，调用后按函数内部条件返回结果。`, code });
    for (const name of identifiers(init || code)) if (name !== q.name) queue.push({ file: q.file, name, line: position, depth: q.depth + 1 });
  }
  return found;
}
const now = new Date().toISOString();
const notes = [], coverage = [];
const domTags = { Card: 'div', CardContent: 'div', CardHeader: 'div', CardTitle: 'div', Button: 'button', Badge: 'div', Input: 'input', Textarea: 'textarea', Link: 'a' };
for (const item of inventory) {
  const p = read(item.file); if (!p) continue;
  const expressionText = item.expressions.join('\n');
  const trace = traces(item.file, item.expressions, item.line);
  const tokens = new Set(identifiers(expressionText + '\n' + trace.map(t => t.code || '').join('\n')));
  const facts = reports.filter(r => (r.files || []).some(f => f.replace(/^src\//, '').replace(/:\d+.*$/, '') === item.file) && (r.symbols || []).some(s => tokens.has(s) || expressionText.includes(s)));
  const local = item.expressions.map(e => `显示规则：${prose(e)}。`).join('\n');
  const detail = facts.map(f => typeof f.text === 'string' ? f.text : JSON.stringify(f.text)).join('\n\n');
  const text = `【源码核查注释；不是当前数据库记录快照】\n\n${detail || '这处的说明按实际显示表达式及它的赋值位置编写，没有凭屏幕上的同一个数字去猜字段。'}\n\n${local || '这是一组重复内容的外层；内部逐项显示，外层本身不是另外一条数据。'}\n\n` + trace.map(t => t.text + `（${t.file}:${t.line}）`).join('\n') + `\n\n显示位置：${item.file}:${item.line}。源码可以确认这个数字怎样算，不能单凭源码确认当前这一条的记录 ID 或输入笔数；这里没有伪造当前值。`;
  const digest = crypto.createHash('sha256').update(p.text.split('\n').slice(item.line - 1, item.endLine).join('\n')).digest('hex');
  const key = `source|${item.file}|${item.line}|${item.tag}|${digest.slice(0, 12)}`;
  notes.push({ key, scope: 'element', page: '', label: `${item.tag} ${item.file}:${item.line}`, text: text.slice(0, 20000), updatedAt: now, source: { file: item.file, line: item.line, endLine: item.endLine, tag: domTags[item.tag] || item.tag, digest } });
  coverage.push({ ...item, sourceNote: key, humanAudit: facts.length > 0, tracedBindings: trace.length });
}
const unique = [...new Map(notes.map(n => [n.key, n])).values()];
fs.writeFileSync(path.join(outDir, 'source-notes.json'), JSON.stringify(unique));
fs.writeFileSync(path.join(outDir, 'coverage.json'), JSON.stringify(coverage, null, 2));
console.log(JSON.stringify({ nodes: inventory.length, notes: unique.length, humanAuditedNodes: coverage.filter(n => n.humanAudit).length, expressionsOnly: coverage.filter(n => !n.humanAudit).length, reportEntries: reports.length }));