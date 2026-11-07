var e=`import { useEffect, useState } from "react";
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
import { useTranslation } from "react-i18next";
import { isChineseLanguage, localizeQuestionnaire, uiText } from "@/features/esm/i18n";

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
  const { i18n } = useTranslation();
  const zh = isChineseLanguage(i18n.language);

  useEffect(() => {
    fetchMyPeople().then(setPeople).catch(() => undefined);
  }, []);

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  const add = async () => {
    if (!name.trim()) {
       toast.error(uiText(zh, "Give this person a name first.", "请先填写这个人的姓名。"));
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
       toast.success(uiText(zh, \`\${person.name} added.\`, \`已添加 \${person.name}。\`));
    } catch (err) {
       toast.error(zh ? "无法保存此人，请重试。" : (err instanceof Error ? err.message : "Could not save this person."));
    } finally {
      setSaving(false);
    }
  };

  const saveDetails = async () => {
    if (!detailsFor) return;
    setSaving(true);
    try {
      await savePersonDetails(detailsFor.id, details);
       toast.success(uiText(zh, \`Details for \${detailsFor.name} saved.\`, \`\${detailsFor.name} 的资料已保存。\`));
      setDetailsFor(null);
    } catch (err) {
       toast.error(zh ? "无法保存这些资料，请重试。" : (err instanceof Error ? err.message : "Could not save these details."));
    } finally {
      setSaving(false);
    }
  };

  const choices = [{ id: "just_me", name: uiText(zh, "Just me", "只有我") }, ...people];
  const localizedDetails = localizeQuestionnaire({ id: "person", title: "", groups: [{ id: "person", title: "", questions: personDetailQuestions }] }, zh).groups[0]!.questions;

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
                 {uiText(zh, \`Would you like to add a few details about \${detailsFor.name}? This is optional — you can skip it.\`, \`是否补充一些关于 \${detailsFor.name} 的资料？这是选填内容，可以跳过。\`)}
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setShowDetails(true)}>
                   {uiText(zh, "Add details", "补充资料")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDetailsFor(null)}>
                   {uiText(zh, "Skip", "跳过")}
                </Button>
              </div>
            </>
          ) : (
            <>
               <p className="text-sm font-medium">{uiText(zh, \`About \${detailsFor.name} (all optional)\`, \`关于 \${detailsFor.name}（全部选填）\`)}</p>
               {localizedDetails
                .filter((q) => !q.showIf || q.showIf.equals.includes(String(details[q.showIf.id] ?? "")))
                .map((q) => (
                  <div key={q.id} className="space-y-1">
                     <p className="text-sm">{q.text}</p>
                    <QuestionField
                      question={q}
                      value={details[q.id]!}
                      onChange={(v) => setDetails((d) => ({ ...d, [q.id]: v }))}
                    />
                  </div>
                ))}
              <div className="flex gap-2">
                <Button size="sm" onClick={saveDetails} disabled={saving}>
                   {saving ? uiText(zh, "Saving…", "保存中…") : uiText(zh, "Save details", "保存资料")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDetailsFor(null)} disabled={saving}>
                   {uiText(zh, "Later", "稍后")}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {adding ? (
        <div className="space-y-2 rounded-md border border-border p-3">
          <div className="flex items-center gap-2">
             <Input placeholder={uiText(zh, "Name", "姓名")} value={name} onChange={(e) => setName(e.target.value)} />
            <VoiceAnswerButton onTranscript={(text) => setName(text)} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={add} disabled={saving}>
               {saving ? uiText(zh, "Saving…", "保存中…") : uiText(zh, "Save person", "保存人员")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)} disabled={saving}>
               {uiText(zh, "Cancel", "取消")}
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
           {uiText(zh, "Add someone", "添加人员")}
        </Button>
      )}
    </div>
  );
}
`;export{e as default};