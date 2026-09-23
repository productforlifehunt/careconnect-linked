import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { VoiceAnswerButton } from "./VoiceAnswerButton";
import { cachedPeople, createPerson, fetchMyPeople, type EsmPerson } from "@/features/esm/people";
import { cn } from "@/lib/utils";

interface Props {
  /** Chosen people: row ids from the study people table, or "just_me". */
  value: string[];
  onChange: (value: string[]) => void;
}

/** Picks the people involved in this hour, and adds new ones as real records. */
export function PeopleAnswer({ value, onChange }: Props) {
  const [people, setPeople] = useState<EsmPerson[]>(() => cachedPeople());
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", relationship: "", role: "", notes: "" });

  useEffect(() => {
    fetchMyPeople().then(setPeople).catch(() => undefined);
  }, []);

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  const add = async () => {
    if (!form.name.trim()) {
      toast.error("Give this person a name first.");
      return;
    }
    setSaving(true);
    try {
      const person = await createPerson({
        name: form.name.trim(),
        relationship: form.relationship.trim(),
        role: form.role.trim(),
        notes: form.notes.trim(),
      });
      setPeople((prev) => [person, ...prev]);
      onChange([...value, person.id]);
      setForm({ name: "", relationship: "", role: "", notes: "" });
      setAdding(false);
      toast.success(`${person.name} added.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save this person.");
    } finally {
      setSaving(false);
    }
  };

  const choices = [{ id: "just_me", name: "Just me", relationship: "", role: "", notes: "" }, ...people];

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {choices.map((person) => {
          const selected = value.includes(person.id);
          return (
            <label
              key={person.id}
              className={cn(
                "flex cursor-pointer items-start gap-2 rounded-md border p-2 text-sm",
                selected ? "border-primary bg-primary/5" : "border-border",
              )}
            >
              <Checkbox checked={selected} onCheckedChange={() => toggle(person.id)} />
              <span className="leading-snug">
                {person.name}
                {person.relationship && (
                  <span className="block text-xs text-muted-foreground">{person.relationship}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      {adding ? (
        <div className="space-y-2 rounded-md border border-border p-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <VoiceAnswerButton onTranscript={(text) => setForm((f) => ({ ...f, name: text }))} />
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Relationship to you, e.g. my sister"
              value={form.relationship}
              onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))}
            />
            <VoiceAnswerButton onTranscript={(text) => setForm((f) => ({ ...f, relationship: text }))} />
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="What they do, e.g. drives to appointments"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            />
            <VoiceAnswerButton onTranscript={(text) => setForm((f) => ({ ...f, role: text }))} />
          </div>
          <div className="flex items-start gap-2">
            <Textarea
              rows={2}
              placeholder="Anything else worth noting (optional)"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
            <VoiceAnswerButton onTranscript={(text) => setForm((f) => ({ ...f, notes: text }))} />
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
