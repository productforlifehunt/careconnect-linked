import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

/**
 * Recruitment source is stored as free text (legacy values are long paragraphs),
 * so "Other / 其他" keeps an editable text field and existing unlisted values
 * are preserved instead of being discarded.
 */
export const RECRUITMENT_SOURCES = [
  { value: "Research recruitment agency", label: "Research recruitment agency / 研究招募机构" },
  { value: "Community referral", label: "Community referral / 社区转介" },
  { value: "Hospital referral", label: "Hospital referral / 医院转介" },
  { value: "Online community (WeChat group, etc.)", label: "Online community (WeChat group, etc.) / 线上社群（微信群等）" },
  { value: "Family or friend referral", label: "Family or friend referral / 亲友转介" },
] as const;

const OTHER = "__other__";

export function RecruitmentSourceSelect({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  const [customMode, setCustomMode] = useState(false);
  const listed = RECRUITMENT_SOURCES.some((o) => o.value === value);
  const showCustom = customMode || (!listed && value !== "");
  return (
    <div className="space-y-2">
      <select
        id={id}
        value={showCustom ? OTHER : value}
        onChange={(e) => {
          const next = e.target.value;
          if (next === OTHER) { setCustomMode(true); return; }
          setCustomMode(false);
          onChange(next);
        }}
        className="h-9 w-full max-w-md rounded-md border border-border bg-background px-3 text-sm text-foreground"
      >
        <option value="">Select source / 选择来源</option>
        {RECRUITMENT_SOURCES.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
        <option value={OTHER}>Other / 其他（自行填写）</option>
      </select>
      {showCustom && (
        <>
          <label htmlFor={`${id}-custom`} className="block text-xs text-muted-foreground">Custom source / 自定义来源</label>
          <Textarea id={`${id}-custom`} rows={2} value={value} onChange={(e) => onChange(e.target.value)} />
        </>
      )}
    </div>
  );
}
