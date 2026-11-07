import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageResponse } from "@/components/ai-elements/message";
import { getInterviewOverview } from "@/lib/interview-overview.functions";

export function InterviewOverview({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const generate = getInterviewOverview;
  const load = async () => {
    if (loading || text) return;
    setLoading(true); setError("");
    try {
      const result = await generate({ data: { path } });
      if (result.error) setError(result.error);
      else setText(result.text || "");
    } catch (e) { setError(e instanceof Error ? e.message : "Overview unavailable / 概要暂不可用"); }
    finally { setLoading(false); }
  };
  return <div className="space-y-3">
    <Button variant="outline" className="h-auto w-full justify-between whitespace-normal py-2 text-left"
      aria-expanded={open} aria-controls="interview-overview" onClick={() => {
        setOpen(!open); if (!open && !text && !error) void load();
      }}>
      <span>View interview overview / 查看访谈概要</span>
      <ChevronDown className={`ml-2 h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
    </Button>
    {open && <div id="interview-overview" className="space-y-3 border-l-2 border-border pl-3 text-sm" aria-busy={loading}>
      <p className="text-xs text-muted-foreground">Gemini Flash · google/gemini-3.8-flash</p>
      {loading && <p role="status" className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Preparing overview… / 正在生成概要…</p>}
      {error && <p role="alert" className="break-words text-destructive">{error}</p>}
      {error && <Button size="sm" variant="outline" onClick={() => void load()}>Retry / 重试</Button>}
      {text && <MessageResponse>{text}</MessageResponse>}
    </div>}
  </div>;
}