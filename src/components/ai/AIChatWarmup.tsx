import { ArrowUp, Bot, Loader2 } from "lucide-react";
import type { FormEvent } from "react";

/** Small, usable composer shown while the full chat code is being prepared. */
export function AIChatWarmup({
  isChinese,
  autoFocus = false,
  value,
  queuedPrompt,
  onChange,
  onSubmit,
}: {
  isChinese: boolean;
  autoFocus?: boolean | undefined;
  value: string;
  queuedPrompt?: string | null | undefined;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = value.trim();
    if (!message || queuedPrompt) return;
    onSubmit(message);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        <div className="flex max-w-[90%] items-start gap-2 rounded-2xl rounded-tl-sm bg-muted/70 px-3 py-2.5 text-sm text-foreground">
          <Bot className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            {isChinese
              ? "你好，我可以帮你处理照护相关的问题。"
              : "Hi, I’m here to help with care-related questions."}
          </p>
        </div>
        {queuedPrompt ? (
          <>
            <p className="ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2.5 text-sm text-primary-foreground">
              {queuedPrompt}
            </p>
            <div
              role="status"
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {isChinese ? "正在连接助手…" : "Connecting to the assistant…"}
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            {isChinese
              ? "可以直接输入，准备完成后会立即发送。"
              : "Type now. Your message will send as soon as the assistant is ready."}
          </p>
        )}
      </div>
      <form onSubmit={submit} className="flex items-end gap-2 border-t p-3">
        <label className="sr-only" htmlFor="ai-chat-warmup-input">
          {isChinese ? "输入消息" : "Type a message"}
        </label>
        <textarea
          id="ai-chat-warmup-input"
          name="message"
          autoFocus={autoFocus}
          rows={1}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={!!queuedPrompt}
          placeholder={isChinese ? "说点什么…" : "Type a message…"}
          className="max-h-28 min-h-10 flex-1 resize-y rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!value.trim() || !!queuedPrompt}
          aria-label={isChinese ? "发送消息" : "Send message"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
