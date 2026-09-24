import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QuestionField } from "./QuestionField";
import { AnswerMap, AnswerValue, Question, Questionnaire } from "@/features/esm/types";
import { clearDraft, getDraft, saveDraft } from "@/features/esm/store";

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
  const [step, setStep] = useState(() => Math.min(Math.max(initialStep, 0), questionnaire.groups.length - 1));

  useEffect(() => {
    saveDraft(draftId, answers);
  }, [draftId, answers]);

  const group = questionnaire.groups[step];
  const questions = useMemo(
    () => group.questions.filter((q) => visible(q, answers)),
    [group, answers],
  );
  const isLast = step === questionnaire.groups.length - 1;

  const set = (id: string, value: AnswerValue) => setAnswers((prev) => ({ ...prev, [id]: value }));

  const missing = questions.filter(
    (q) => !q.optional && (answers[q.id] === undefined || answers[q.id] === null || answers[q.id] === "" ||
      (Array.isArray(answers[q.id]) && (answers[q.id] as string[]).length === 0)),
  );

  const next = () => {
    if (missing.length) {
      const first = missing[0];
      toast.error(
        `${missing.length} question${missing.length > 1 ? "s" : ""} still need an answer — start with "${first.code ? `${first.code} ` : ""}${first.text}".`,
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
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {questionnaire.title} · step {step + 1} of {questionnaire.groups.length}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">
          {group.code ? `${group.code} ` : ""}{group.title}
        </h1>
        {group.description && <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>}
        {step === 0 && questionnaire.intro && (
          <p className="mt-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">{questionnaire.intro}</p>
        )}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((step + 1) / questionnaire.groups.length) * 100}%` }}
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
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>
        ) : onCancel ? (
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        ) : null}
        <Button className="flex-1" onClick={next}>{isLast ? submitLabel : "Next"}</Button>
      </div>
    </div>
  );
}
