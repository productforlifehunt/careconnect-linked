import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { VoiceAnswerButton } from "./VoiceAnswerButton";
import { PeopleAnswer } from "./PeopleAnswer";
import { AnswerValue, Question } from "@/features/esm/types";
import {
  matchSpokenOption,
  matchSpokenOptions,
  parseSpokenNumber,
  parseSpokenYesNo,
} from "@/features/esm/voice";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { isChineseLanguage, uiText } from "@/features/esm/i18n";

interface Props {
  question: Question;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  /** Extra options merged in at runtime, e.g. the participant's care network. */
  extraOptions?: { value: string; label: string }[];
}

const YESNO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export function QuestionField({ question, value, onChange, extraOptions }: Props) {
  const { i18n } = useTranslation();
  const isChinese = isChineseLanguage(i18n.language);
  const [heard, setHeard] = useState<string | null>(null);
  const [unmatched, setUnmatched] = useState(false);
  const options = [...(question.options ?? []), ...(extraOptions ?? [])];
  const scale = question.scale;

  const handleTranscript = (text: string) => {
    setHeard(text);
    setUnmatched(false);
    switch (question.type) {
      case "text":
      case "longtext":
        onChange(text);
        return;
      case "number": {
        const n = parseSpokenNumber(text);
        if (n === null) setUnmatched(true);
        else onChange(n);
        return;
      }
      case "yesno": {
        const yn = parseSpokenYesNo(text);
        if (!yn) setUnmatched(true);
        else onChange(yn);
        return;
      }
      case "single": {
        const hit = matchSpokenOption(text, options);
        if (!hit) setUnmatched(true);
        else onChange(hit.value);
        return;
      }
      case "multi": {
        const hits = matchSpokenOptions(text, options);
        if (!hits.length) setUnmatched(true);
        else onChange(hits.map((h) => h.value));
        return;
      }
      case "scale": {
        if (!scale) return;
        const n = parseSpokenNumber(text);
        if (n !== null && n >= scale.min && n <= scale.max) {
          onChange(n);
          return;
        }
        // Allow the end labels and any per-point label to be spoken.
        const labelOptions = [
          { value: String(scale.min), label: scale.minLabel },
          { value: String(scale.max), label: scale.maxLabel },
          ...Object.entries(scale.pointLabels ?? {}).map(([k, label]) => ({ value: k, label })),
        ];
        const hit = matchSpokenOption(text, labelOptions);
        if (hit) onChange(Number(hit.value));
        else setUnmatched(true);
        return;
      }
    }
  };

  const points = scale
    ? Array.from({ length: scale.max - scale.min + 1 }, (_, i) => scale.min + i)
    : [];

  return (
    <div id={`esm-q-${question.id}`} className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-medium leading-snug text-foreground">
            {question.text}
             {question.optional && <span className="ml-1 text-xs text-muted-foreground">{uiText(isChinese, "(optional)", "（选填）")}</span>}
          </p>
          {question.help && <p className="mt-1 text-sm text-muted-foreground">{question.help}</p>}
        </div>
        <VoiceAnswerButton onTranscript={handleTranscript} />
      </div>

      <div className="mt-3">
        {question.custom === "people" && (
          <PeopleAnswer
            value={Array.isArray(value) ? (value as string[]) : []}
            onChange={(people) => onChange(people)}
          />
        )}

        {question.type === "datetime" && !question.custom && (
          <Input
            type="datetime-local"
            className="max-w-[16rem]"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
          />
        )}

        {question.type === "text" && !question.custom && (
          <Input
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={uiText(isChinese, "Type or speak your answer", "请输入或使用语音回答")}
          />
        )}

        {question.type === "longtext" && (
          <Textarea
            rows={4}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={uiText(isChinese, "Type or speak your answer", "请输入或使用语音回答")}
          />
        )}

        {question.type === "number" && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="numeric"
              className="max-w-[10rem]"
              value={typeof value === "number" ? value : ""}
              onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
            />
            {question.unit && <span className="text-sm text-muted-foreground">{question.unit}</span>}
          </div>
        )}

        {(question.type === "single" || question.type === "yesno") && (
          <div className="flex flex-wrap gap-2">
            {(question.type === "yesno" ? YESNO : options).map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={value === option.value ? "default" : "outline"}
                className="h-auto whitespace-normal py-2 text-left"
                onClick={() => onChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        )}

        {question.type === "multi" && (
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((option) => {
              const selected = Array.isArray(value) && value.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-2 rounded-md border p-2 text-sm",
                    selected ? "border-primary bg-primary/5" : "border-border",
                  )}
                >
                  <Checkbox
                    checked={selected}
                    onCheckedChange={(checked) => {
                      const current = Array.isArray(value) ? value : [];
                      onChange(
                        checked ? [...current, option.value] : current.filter((v) => v !== option.value),
                      );
                    }}
                  />
                  <span className="leading-snug">{option.label}</span>
                </label>
              );
            })}
          </div>
        )}

        {question.type === "scale" && scale && (
          <div>
            <div className="flex flex-wrap gap-2">
              {points.map((point) => (
                <Button
                  key={point}
                  type="button"
                  variant={value === point ? "default" : "outline"}
                  className="min-w-[3rem]"
                  onClick={() => onChange(point)}
                >
                  {point > 0 && scale.min < 0 ? `+${point}` : point}
                </Button>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{scale.minLabel}</span>
              <span>{scale.maxLabel}</span>
            </div>
            {typeof value === "number" && scale.pointLabels?.[value] && (
              <p className="mt-1 text-sm text-foreground">{scale.pointLabels[value]}</p>
            )}
          </div>
        )}
      </div>

      {heard && (
        <p className="mt-2 text-xs text-muted-foreground">
            {uiText(isChinese, "Heard", "识别到")}：“{heard}”
          {unmatched && (
            <span className="ml-1 text-destructive">
              {uiText(isChinese, "— I could not match that to an answer. Please choose or speak again.", "— 无法匹配到选项，请手动选择或重新说一遍。")}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
