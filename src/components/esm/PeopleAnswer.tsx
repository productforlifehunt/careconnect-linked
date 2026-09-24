import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { VoiceAnswerButton } from "./VoiceAnswerButton";
import { QuestionField } from "./QuestionField";
import {
  cachedPeople,
  createPerson,
  fetchMyPeople,
  savePersonDetails,
  type EsmPerson,
} from "@/features/esm/people";
import { personDetailQuestions } from "@/features/esm/questionnaires";
import type { AnswerValue } from "@/features/esm/types";
import { cn } from "@/lib/utils";

interface Props {
  /** Chosen people: CCT320 row ids, or "just_me" (saved as CCT319 a26 = b01). */
  value: string[];
  onChange: (value: string[]) => void;
}

/** Picks the people involved in this hour; new people are saved by name, details are optional. */
export function PeopleAnswer({ value, onChange }: Props) {
  const [people, setPeople] = useState<EsmPerson[]>(() => cachedPeople());
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [detailsFor, setDetailsFor] = useState<EsmPerson | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState<Record<string, AnswerValue>>({});

  useEffect(() => {
    fetchMyPeople().then(setPeople).catch(() => undefined);
  }, []);

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  const add = async () => {
    if (!name.trim()) {
      toast.error("Give this person a name first.");
      return;
    }
    setSaving(true);
    try {
      const person = await createPerson(name.trim());
      setPeople((prev) => [person, ...prev]);
      onChange([...value, person.id]);
      setName("");
      setAdding(false);
      setDetailsFor(person);
      setShowDetails(false);
      setDetails({});
      toast.success(`${person.name} added.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save this person.");
    } finally {
      setSaving(false);
    }
  };

  const saveDetails = async () => {
    if (!detailsFor) return;
    setSaving(true);
    try {
      await savePersonDetails(detailsFor.id, details);
      toast.success(`Details for ${detailsFor.name} saved.`);
      setDetailsFor(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save these details.");
    } finally {
      setSaving(false);
    }
  };

  const choices = [{ id: "just_me", name: "Just me" }, ...people];

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {choices.map((person) => {
          const selected = value.includes(person.id);
          return (
            <label
              key={person.id}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm",
                selected ? "border-primary bg-primary/5" : "border-border",
              )}
            >
              <Checkbox checked={selected} onCheckedChange={() => toggle(person.id)} />
              <span className="leading-snug">{person.name}</span>
            </label>
          );
        })}
      </div>

      {detailsFor && (
        <div className="space-y-3 rounded-md border border-border p-3">
          {!showDetails ? (
            <>
              <p className="text-sm">
                Would you like to add a few details about {detailsFor.name}? This is optional — you can skip it.
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setShowDetails(true)}>
                  Add details
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDetailsFor(null)}>
                  Skip
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-medium">About {detailsFor.name} (all optional)</p>
              {personDetailQuestions
                .filter((q) => !q.showIf || q.showIf.equals.includes(String(details[q.showIf.id] ?? "")))
                .map((q) => (
                  <div key={q.id} className="space-y-1">
                    <p className="text-sm">
                      {q.code && <span className="mr-1 text-muted-foreground">{q.code}</span>}
                      {q.text}
                    </p>
                    <QuestionField
                      question={q}
                      value={details[q.id]}
                      onChange={(v) => setDetails((d) => ({ ...d, [q.id]: v }))}
                    />
                  </div>
                ))}
              <div className="flex gap-2">
                <Button size="sm" onClick={saveDetails} disabled={saving}>
                  {saving ? "Saving…" : "Save details"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDetailsFor(null)} disabled={saving}>
                  Later
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {adding ? (
        <div className="space-y-2 rounded-md border border-border p-3">
          <div className="flex items-center gap-2">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <VoiceAnswerButton onTranscript={(text) => setName(text)} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={add} disabled={saving}>
              {saving ? "Saving…" : "Save person"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
          Add someone
        </Button>
      )}
    </div>
  );
}
