import { z } from 'zod';
import { streamChatCompletion, GatewayError } from '@lovable.dev/ai-gateway';
import { CONFLICT_INSTRUCTIONS } from '@/features/inspector/conflict-prompt';
import { validateConflictReport, type ConflictReport } from '@/features/inspector/conflict-report';

const BASE = "https://app.challenged-dementia.com/afresh/wp-json";
const MODEL = "openai/gpt-6-luna";

export async function verifyResearcher(token: string): Promise<void> {
  if (!token) throw new Error("请先用研究员账号登录 / Please sign in as the researcher.");
  const res = await fetch(`${BASE}/wp/v2/users/me?context=edit`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("无法验证登录 / Session could not be verified.");
  const user = await res.json() as { username?: string; slug?: string };
  if ((user.username || user.slug) !== "researcher") throw new Error("只有研究员账号可以使用 / Researcher account only.");
}

export async function explainInspection(context: string, _mode: "full" | "origin" = "full", system?: string, noteIds: string[] = [], requireCode = true): Promise<{ report?: ConflictReport; error?: string; status?: number }> {
  let lastError = 'AI 分析暂不可用，核查未完成。'; let lastStatus = 502;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const stream = await streamChatCompletion({
        model: MODEL,
        messages: [{ role: 'system', content: system || CONFLICT_INSTRUCTIONS }, { role: 'user', content: context }],
        reasoning_effort: 'low',
        response_format: { type: 'json_object' },
      }, { maxRetries: 0 });
      let text = ''; let finish: string | null = null;
      for await (const event of stream) {
        for (const choice of event.choices) { text += choice.delta.content || ''; if (choice.finish_reason) finish = choice.finish_reason; }
      }
      if (finish !== 'stop') { lastError = `AI 输出在中途中断（第 ${attempt} 次，结束原因：${finish ?? '连接中断'}），核查未完成。`; lastStatus = 502; continue; }
      if (!text.trim()) { lastError = 'AI 没有返回内容，核查未完成。'; lastStatus = 422; continue; }
      try { return { report: validateConflictReport(text, noteIds, requireCode) }; }
      catch (e) { console.error('[inspector] report rejected', e, text.slice(0, 2000)); lastError = `AI 返回的核查报告格式错误，不能认定一致；请重新分析。原因：${e instanceof z.ZodError ? e.issues.slice(0, 3).map(i => `${i.path.join('.')} ${i.message}`).join('；') : e instanceof Error ? e.message : String(e)}`; lastStatus = 422; }
    } catch (error) {
      lastError = error instanceof Error ? `${error.message}（第 ${attempt} 次）` : lastError;
      lastStatus = error instanceof GatewayError ? (error.httpStatus || 502) : 502;
      if (error instanceof GatewayError && error.httpStatus && error.httpStatus < 500 && error.httpStatus !== 429) break;
    }
  }
  return { error: lastError, status: lastStatus };
}

export async function compareNotes(payload: string) {
  const data = JSON.parse(payload) as { note: { cct: string }; related: { cct: string }[] };
  const ids = [...new Set([data.note, ...data.related].map(n => n.cct.replace('CCT324 #', '')))];
  return explainInspection(payload, 'full', CONFLICT_INSTRUCTIONS + '\n此次只提供注释文字，必须标记 codeCompared=false 并列出缺少代码证据的疑点；仍逐对比对全部注释。', ids, true);
}
