var e=`import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveParticipantMeta, type ParticipantMeta } from "@/features/interviews/transcribe";
import { wpEnsureFreshToken } from "@/services/wp-auth";
import { RecruitmentSourceSelect } from "@/components/researcher/RecruitmentSourceSelect";
import { RecruitmentSourceDetails } from "@/components/researcher/RecruitmentSourceDetails";

export function ParticipantDetails({ id, meta, canEdit, onSaved }: { id: string; meta: ParticipantMeta; canEdit: boolean; onSaved: (meta: ParticipantMeta) => void }) {
  const [draft, setDraft] = useState(meta);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    if (!canEdit || !draft.title.trim()) return;
    setSaving(true); setError("");
    try {
      await wpEnsureFreshToken();
      const stored = await saveParticipantMeta(id, draft);
      onSaved(stored); setDraft(stored); setEditing(false);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setSaving(false); }
  }
  return <div className="mb-6 space-y-4 border-b border-border pb-4">
    {editing && canEdit ? <>
      <label htmlFor="participant-title" className="text-xs text-muted-foreground">Title / 标题（姓名与身份）</label>
      <Input id="participant-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
      <label htmlFor="participant-recruitment" className="text-xs text-muted-foreground">Recruitment source / 招募来源</label>
      <RecruitmentSourceSelect id="participant-recruitment" value={draft.recruitmentSource} onChange={(recruitmentSource) => setDraft({ ...draft, recruitmentSource })} />
      <label htmlFor="participant-notes" className="text-xs text-muted-foreground">Notes / 备注</label>
      <Textarea id="participant-notes" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
      <div className="flex gap-2"><Button onClick={save} disabled={saving || !draft.title.trim()}>{saving ? "Saving… / 保存中…" : "Save / 保存"}</Button><Button variant="outline" disabled={saving} onClick={() => { setDraft(meta); setEditing(false); setError(""); }}>Cancel / 取消</Button></div>
    </> : <>
      <p className="break-words font-medium">{meta.title}</p>
      <RecruitmentSourceDetails key={id} value={meta.recruitmentSource} />
      {meta.notes && <div className="space-y-2"><p className="text-xs text-muted-foreground">Notes / 备注</p><p className="whitespace-pre-wrap text-sm">{meta.notes}</p></div>}
      {canEdit && <Button size="sm" variant="outline" onClick={() => { setDraft(meta); setEditing(true); }}>Edit participant / 编辑参与者</Button>}
    </>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}`;export{e as default};