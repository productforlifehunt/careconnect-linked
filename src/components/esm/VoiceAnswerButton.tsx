import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceRecorder } from "@/features/esm/voice";
import { cn } from "@/lib/utils";

interface Props {
  /** Called with the transcript once the recording has been turned into text. */
  onTranscript: (text: string) => void;
  label?: string;
  className?: string;
}

/** One microphone button: tap to record, tap again to stop and fill the answer. */
export function VoiceAnswerButton({ onTranscript, label = "Answer by voice", className }: Props) {
  const rec = useVoiceRecorder();

  const toggle = async () => {
    if (rec.isRecording) {
      const text = await rec.stop();
      if (text) onTranscript(text);
    } else {
      await rec.start();
    }
  };

  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      <Button
        type="button"
        size="sm"
        variant={rec.isRecording ? "destructive" : "secondary"}
        onClick={toggle}
        disabled={rec.isTranscribing}
        aria-label={rec.isRecording ? "Stop recording" : label}
      >
        {rec.isTranscribing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : rec.isRecording ? (
          <Square className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        <span className="ml-1 hidden sm:inline">
          {rec.isTranscribing ? "Listening…" : rec.isRecording ? "Stop" : "Speak"}
        </span>
      </Button>
      {rec.error && <p className="text-xs text-destructive max-w-[16rem] text-right">{rec.error}</p>}
    </div>
  );
}
