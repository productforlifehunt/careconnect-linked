import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Eye, Users, User, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface VisibilityValue {
  /** Sub-group (private member group) numeric ids selected for visibility. */
  subgroupIds: number[];
  /** Specific user numeric ids selected for visibility. */
  userIds: number[];
}

interface VisibilityPickerProps {
  value: VisibilityValue;
  onChange: (next: VisibilityValue) => void;
  memberCategories?: Array<{ id: string; name: string; color?: string | null }>;
  members?: Array<{ user_id?: string; id?: string; profile?: { full_name?: string | null; avatar_url?: string | null } }>;
}

function toNum(id: string | number | undefined | null): number {
  return Number(String(id ?? "").replace(/^wp-/, ""));
}

/**
 * VisibilityPicker — pick sub-groups and/or specific users a post/task is visible to.
 * Empty selection = visible to everyone in the group (per PRD spec).
 */
export function VisibilityPicker({ value, onChange, memberCategories = [], members = [] }: VisibilityPickerProps) {
  const [open, setOpen] = useState(false);
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);

  const totalSelected = value.subgroupIds.length + value.userIds.length;
  const label = totalSelected === 0
    ? Z("所有人", "Everyone")
    : Z(`已选 ${totalSelected} 项`, `${totalSelected} selected`);

  const toggleSubgroup = (id: number) => {
    const exists = value.subgroupIds.includes(id);
    onChange({
      ...value,
      subgroupIds: exists ? value.subgroupIds.filter((x) => x !== id) : [...value.subgroupIds, id],
    });
  };
  const toggleUser = (id: number) => {
    const exists = value.userIds.includes(id);
    onChange({
      ...value,
      userIds: exists ? value.userIds.filter((x) => x !== id) : [...value.userIds, id],
    });
  };
  const reset = () => onChange({ subgroupIds: [], userIds: [] });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Eye className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
          <span className="text-xs">{label}</span>
          {totalSelected > 0 && (
            <Badge variant="secondary" className="ml-2 h-4 px-1 text-[10px]">
              {totalSelected}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-3 border-b">
          <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" /> {Z("谁可以看到？", "Who can see this?")}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {Z("留空则对整个群组可见。", "Leave empty to share with the whole group.")}
          </p>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {memberCategories.length > 0 && (
            <div className="p-3 border-b">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                <Tag className="h-3 w-3" /> {Z("子分组", "Sub-groups")}
              </p>
              <div className="space-y-1.5">
                {memberCategories.map((cat) => {
                  const num = toNum(cat.id);
                  const checked = value.subgroupIds.includes(num);
                  return (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-1.5 py-1 -mx-1.5">
                      <Checkbox checked={checked} onCheckedChange={() => toggleSubgroup(num)} />
                      <span className="text-sm text-foreground flex-1 truncate">{cat.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {members.length > 0 && (
            <div className="p-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                <User className="h-3 w-3" /> {Z("指定成员", "Specific members")}
              </p>
              <div className="space-y-1.5">
                {members.map((m) => {
                  const uid = toNum(m.user_id || m.id);
                  if (!uid) return null;
                  const checked = value.userIds.includes(uid);
                  const name = (m as any).display_name || m.profile?.full_name || Z("未填姓名", "No name");
                  return (
                    <label key={uid} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-1.5 py-1 -mx-1.5">
                      <Checkbox checked={checked} onCheckedChange={() => toggleUser(uid)} />
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {m.profile?.avatar_url ? (
                          <img src={m.profile.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <span className="text-primary text-[10px] font-medium">{name[0]}</span>
                        )}
                      </div>
                      <span className="text-sm text-foreground flex-1 truncate">{name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {memberCategories.length === 0 && members.length === 0 && (
            <div className="p-6 text-center">
              <Users className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                {Z("还没有子分组或成员。在「成员」标签创建子分组以限制可见性。", "No sub-groups or members yet. Create sub-groups in Members tab to limit visibility.")}
              </p>
            </div>
          )}
        </div>

        {totalSelected > 0 && (
          <div className="p-2 border-t flex justify-between items-center bg-muted/20">
            <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground">
              {Z("重置", "Reset")}
            </button>
            <button onClick={() => setOpen(false)} className="text-xs font-medium text-primary hover:underline">
              {Z("完成", "Done")}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export const EMPTY_VISIBILITY: VisibilityValue = { subgroupIds: [], userIds: [] };
