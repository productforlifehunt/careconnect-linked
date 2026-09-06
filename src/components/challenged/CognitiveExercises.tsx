import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Puzzle, RefreshCw, Loader2, CheckCircle, Wand2 } from "lucide-react";
import { invokeAI, parseAIJson } from "@/lib/ai-service";
import { useTranslation } from "react-i18next";

interface ExerciseItem {
  emoji?: string;
  label?: string;
  prompt?: string;
  answer?: string;
  sequence?: string;
  question?: string;
  hint?: string;
}

interface Exercise {
  title: string;
  description: string;
  type: "memory" | "word" | "pattern" | "recall" | "music";
  difficulty: "easy" | "medium";
  items: ExerciseItem[];
  encouragement: string;
}

export function CognitiveExercises() {
  const { t } = useTranslation();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [completed, setCompleted] = useState(false);

  const generate = async () => {
    setLoading(true);
    setRevealed(new Set());
    setCompleted(false);
    try {
      const reply = await invokeAI("cognitive_exercise", "Generate a fun, gentle cognitive exercise suitable for someone living with early-to-mid stage dementia. Make it warm and encouraging.", { persist: false });
      const parsed = parseAIJson<Exercise>(reply);
      if (parsed) setExercise(parsed);
    } catch (err) {
      console.error("Exercise generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const revealItem = (idx: number) => {
    const next = new Set(revealed);
    next.add(idx);
    setRevealed(next);
    if (exercise && next.size >= exercise.items.length) {
      setCompleted(true);
    }
  };

  return (
    <Card className="border-transparent card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Puzzle className="h-5 w-5 text-primary" />
          {t("cognitive.brainGames")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!exercise && !loading ? (
          <div className="text-center py-6 space-y-3">
            <Wand2 className="h-10 w-10 text-primary mx-auto" />
            <p className="text-muted-foreground">{t("cognitive.readyToExercise")}</p>
            <Button onClick={generate} className="rounded-full px-6">
              {t("cognitive.startGame")}
            </Button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t("cognitive.creatingExercise")}</span>
          </div>
        ) : exercise ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-foreground text-lg">{exercise.title}</h3>
              <p className="text-sm text-muted-foreground">{exercise.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {exercise.items.map((item, i) => {
                const isRevealed = revealed.has(i);
                return (
                  <Button
                    key={i}
                    variant={isRevealed ? "default" : "outline"}
                    className={`h-auto py-4 flex-col gap-1 text-center transition-all ${
                      isRevealed ? "bg-primary/10 text-primary border-primary/30" : ""
                    }`}
                    onClick={() => revealItem(i)}
                  >
                    {item.emoji && (
                      <span className="text-2xl">{item.emoji}</span>
                    )}
                    <span className="text-sm font-medium">
                      {isRevealed
                        ? item.label || item.answer || item.sequence || item.question
                        : item.prompt || item.label || item.question || t("cognitive.tapToReveal")}
                    </span>
                    {isRevealed && item.hint && (
                      <span className="text-xs text-muted-foreground">{item.hint}</span>
                    )}
                  </Button>
                );
              })}
            </div>

            {completed && (
              <div className="text-center p-4 rounded-xl bg-success/10 border border-success/20">
                <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-sm font-medium text-success">{exercise.encouragement}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generate} className="flex-1">
                <RefreshCw className="h-3 w-3 mr-1" /> {t("cognitive.newGame")}
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
