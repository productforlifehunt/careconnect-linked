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
  try {
    const stream = await streamChatCompletion({
      model: MODEL,
      messages: [{ role: 'system', content: system || CONFLICT_INSTRUCTIONS }, { role: 'user', content: context }],
      reasoning_effort: 'low',
      response_format: { type: 'json_object' },
    }, { maxRetries: 0 });
    let text = '';
    for await (const event of stream) {
      for (const choice of event.choices) text += choice.delta.content || '';
    }
    if (!text.trim()) return { error: 'AI 没有返回内容，核查未完成。', status: 422 };
    try { return { report: validateConflictReport(text, noteIds, requireCode) }; }
    catch { return { error: 'AI 返回的核查报告不完整或格式错误，不能认定一致；请重新分析。', status: 422 }; }
  } catch (error) {
    if (error instanceof GatewayError) return { error: error.message, status: error.httpStatus || 502 };
    return { error: error instanceof Error ? error.message : 'AI 分析暂不可用，核查未完成。', status: 502 };
  }
}

export async function compareNotes(payload: string) {
  const data = JSON.parse(payload) as { note: { cct: string }; related: { cct: string }[] };
  const ids = [...new Set([data.note, ...data.related].map(n => n.cct.replace('CCT324 #', '')))];
  return explainInspection(payload, 'full', CONFLICT_INSTRUCTIONS + '\n此次只提供注释文字，必须标记 codeCompared=false 并列出缺少代码证据的疑点；仍逐对比对全部注释。', ids, true);
}
