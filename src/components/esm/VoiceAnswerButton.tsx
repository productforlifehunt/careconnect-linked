import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceRecorder } from "@/features/esm/voice";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { isChineseLanguage, uiText } from "@/features/esm/i18n";

interface Props {
  /** Called with the transcript once the recording has been turned into text. */
  onTranscript: (text: string) => void;
  label?: string | undefined;
  className?: string | undefined;
}

/** One microphone button: tap to record, tap again to stop and fill the answer. */
export function VoiceAnswerButton({ onTranscript, label, className }: Props) {
  const rec = useVoiceRecorder();
  const { i18n } = useTranslation();
  const isChinese = isChineseLanguage(i18n.language);
  const accessibleLabel = label ?? uiText(isChinese, "Answer by voice", "使用语音回答");

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
         aria-label={rec.isRecording ? uiText(isChinese, "Stop recording", "停止录音") : accessibleLabel}
      >
        {rec.isTranscribing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : rec.isRecording ? (
          <Square className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        <span className="ml-1 hidden sm:inline">
          {rec.isTranscribing ? uiText(isChinese, "Listening…", "识别中…") : rec.isRecording ? uiText(isChinese, "Stop", "停止") : uiText(isChinese, "Speak", "语音")}
        </span>
      </Button>
      {rec.error && <p className="text-xs text-destructive max-w-[16rem] text-right">{rec.error}</p>}
    </div>
  );
}
