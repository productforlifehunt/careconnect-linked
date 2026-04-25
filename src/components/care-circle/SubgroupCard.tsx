import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Users as UsersIcon, X, ChevronDown } from "lucide-react";
import { useSubgroupMembers, useAddMemberToSubgroup, useRemoveMemberFromSubgroup } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";

function toNum(id: string | number | undefined | null): number {
  return Number(String(id ?? "").replace(/^wp-/, ""));
}

interface SubgroupCardProps {
  subgroup: { id: string; name: string; color?: string | null };
  members: Array<{ user_id?: string; id?: string; profile?: { full_name?: string | null; avatar_url?: string | null } }>;
  isAdmin: boolean;
  onDelete: () => void;
}

export function SubgroupCard({ subgroup, members, isAdmin, onDelete }: SubgroupCardProps) {
  const { toast } = useToast();
  const { data: assignedIds = [], isLoading } = useSubgroupMembers(subgroup.id);
  const addMember = useAddMemberToSubgroup();
  const removeMember = useRemoveMemberFromSubgroup();
  const [pickerOpen, setPickerOpen] = useState(false);

  const assignedSet = new Set(assignedIds);
  const assignedMembers = members.filter((m) => assignedSet.has(toNum(m.user_id || m.id)));

  const toggle = (uid: number, checked: boolean) => {
    if (checked) {
      addMember.mutate({ subgroupId: subgroup.id, userId: uid }, {
        onSuccess: () => toast({ title: "Added to sub-group" }),
      });
    } else {
      removeMember.mutate({ subgroupId: subgroup.id, userId: uid }, {
        onSuccess: () => toast({ title: "Removed from sub-group" }),
      });
    }
  };

  return (
    <Card className="border-transparent card-elevated">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: subgroup.color || "hsl(var(--primary))" }}
            />
            <p className="text-sm font-semibold text-foreground truncate">{subgroup.name}</p>
            <Badge variant="secondary" className="text-[10px] h-4">{assignedMembers.length}</Badge>
          </div>
          {isAdmin && (
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={onDelete}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {assignedMembers.length === 0 ? (
              <p className="text-xs text-muted-foreground">No members assigned yet.</p>
            ) : assignedMembers.map((m) => (
              <Badge key={m.user_id || m.id} variant="outline" className="text-[11px] gap-1 pr-1">
                <UsersIcon className="h-2.5 w-2.5" />
                <span className="truncate max-w-[120px]">{m.profile?.full_name || `Member`}</span>
                {isAdmin && (
                  <button
                    onClick={() => toggle(toNum(m.user_id || m.id), false)}
                    className="ml-0.5 hover:bg-destructive/20 rounded p-0.5"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        )}
        {isAdmin && (
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs w-full">
                Manage members <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2 max-h-72 overflow-y-auto" align="start">
              {members.length === 0 ? (
                <p className="text-xs text-muted-foreground p-2">No group members.</p>
              ) : members.map((m) => {
                const uid = toNum(m.user_id || m.id);
                if (!uid) return null;
                const checked = assignedSet.has(uid);
                return (
                  <label key={uid} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-1.5 py-1">
                    <Checkbox checked={checked} onCheckedChange={(c) => toggle(uid, !!c)} />
                    <span className="text-sm text-foreground flex-1 truncate">
                      {m.profile?.full_name || `Member ${uid}`}
                    </span>
                  </label>
                );
              })}
            </PopoverContent>
          </Popover>
        )}
      </CardContent>
    </Card>
  );
}
