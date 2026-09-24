import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QuestionField } from "./QuestionField";
import { AnswerMap, AnswerValue, Question, Questionnaire } from "@/features/esm/types";
import { clearDraft, getDraft, saveDraft } from "@/features/esm/store";
import { useTranslation } from "react-i18next";
import { isChineseLanguage, localizeQuestionnaire, uiText } from "@/features/esm/i18n";

interface Props {
  questionnaire: Questionnaire;
  /** Draft key — answers are kept under this key until the survey is submitted. */
  draftId: string;
  extraOptionsByQuestion?: Record<string, { value: string; label: string }[]>;
  onSubmit: (answers: AnswerMap) => void | Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
  initialStep?: number;
}

function visible(question: Question, answers: AnswerMap): boolean {
  if (!question.showIf) return true;
  const given = answers[question.showIf.id] ?? null;
  if (Array.isArray(given)) return given.some((v) => question.showIf!.equals.includes(v));
  return question.showIf.equals.includes(given);
}

/** Walks a questionnaire one group at a time, saving a draft as you go. */
export function SurveyRunner({
  questionnaire,
  draftId,
  extraOptionsByQuestion,
  onSubmit,
  submitLabel = "Submit",
  onCancel,
  initialStep = 0,
}: Props) {
  const [answers, setAnswers] = useState<AnswerMap>(() => getDraft(draftId));
  const { i18n } = useTranslation();
  const isChinese = isChineseLanguage(i18n.language);
  const displayQuestionnaire = useMemo(() => localizeQuestionnaire(questionnaire, isChinese), [questionnaire, isChinese]);
  const [step, setStep] = useState(() => Math.min(Math.max(initialStep, 0), displayQuestionnaire.groups.length - 1));

  useEffect(() => {
    saveDraft(draftId, answers);
  }, [draftId, answers]);

  useEffect(() => {
    setStep(Math.min(Math.max(initialStep, 0), displayQuestionnaire.groups.length - 1));
  }, [displayQuestionnaire.groups.length, initialStep]);

  const group = displayQuestionnaire.groups[step];
  const questions = useMemo(
    () => group.questions.filter((q) => visible(q, answers)),
    [group, answers],
  );
  const isLast = step === displayQuestionnaire.groups.length - 1;

  const set = (id: string, value: AnswerValue) => setAnswers((prev) => ({ ...prev, [id]: value }));

  const missing = questions.filter(
    (q) => !q.optional && (answers[q.id] === undefined || answers[q.id] === null || answers[q.id] === "" ||
      (Array.isArray(answers[q.id]) && (answers[q.id] as string[]).length === 0)),
  );

  const next = () => {
    if (missing.length) {
      const first = missing[0];
      toast.error(
        isChinese
          ? `还有 ${missing.length} 个问题需要回答，请先完成“${first.text}”。`
          : `${missing.length} question${missing.length > 1 ? "s" : ""} still need an answer — start with “${first.text}”.`,
      );
      document
        .getElementById(`esm-q-${first.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (isLast) {
      onSubmit(answers);
      clearDraft(draftId);
      return;
    }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-4">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{displayQuestionnaire.title}</p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">
          {group.title}
        </h1>
        {group.description && <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>}
        {step === 0 && displayQuestionnaire.intro && (
          <p className="mt-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">{displayQuestionnaire.intro}</p>
        )}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((step + 1) / displayQuestionnaire.groups.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((q) => (
          <QuestionField
            key={q.id}
            question={q}
            value={answers[q.id] ?? null}
            onChange={(v) => set(q.id, v)}
            extraOptions={extraOptionsByQuestion?.[q.id]}
          />
        ))}
      </div>

      <div className="sticky bottom-16 mt-6 flex gap-2 rounded-lg border border-border bg-background/95 p-3 backdrop-blur">
        {step > 0 ? (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>{uiText(isChinese, "Back", "上一步")}</Button>
        ) : onCancel ? (
          <Button variant="outline" onClick={onCancel}>{uiText(isChinese, "Cancel", "取消")}</Button>
        ) : null}
        <Button className="flex-1" onClick={next}>{isLast ? (isChinese ? ({ Submit: "提交", "Save this entry": "保存这条记录", "Finish today": "完成今日记录", "Finish the entry survey": "完成初始问卷" }[submitLabel] ?? "提交") : submitLabel) : uiText(isChinese, "Next", "下一步")}</Button>
      </div>
    </div>
  );
}
