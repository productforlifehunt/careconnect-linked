import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Loader2, Users as UsersIcon, X, ChevronDown, Check, Clock, Crown, Shield, MoreVertical, UserPlus } from "lucide-react";
import {
  useSubgroupMemberRecords, useAddMemberToSubgroup, useRemoveMemberFromSubgroup,
  useApproveSubgroupMember, useDeclineSubgroupMember, useRequestJoinSubgroup,
  useUpdateSubgroupMemberRole,
} from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";

function toNum(id: string | number | undefined | null): number {
  return Number(String(id ?? "").replace(/^wp-/, ""));
}

interface SubgroupCardProps {
  subgroup: { id: string; name: string; color?: string | null };
  members: Array<{ user_id?: string; id?: string; profile?: { full_name?: string | null; avatar_url?: string | null } }>;
  isAdmin: boolean;
  onDelete: () => void;
  currentUserId?: string | number | null;
}

export function SubgroupCard({ subgroup, members, isAdmin, onDelete, currentUserId }: SubgroupCardProps) {
  const { toast } = useToast();
  const { data: records = [], isLoading } = useSubgroupMemberRecords(subgroup.id);
  const addMember = useAddMemberToSubgroup();
  const removeMember = useRemoveMemberFromSubgroup();
  const approveMember = useApproveSubgroupMember();
  const declineMember = useDeclineSubgroupMember();
  const requestJoin = useRequestJoinSubgroup();
  const updateRole = useUpdateSubgroupMemberRole();
  const [pickerOpen, setPickerOpen] = useState(false);

  const meUid = toNum(currentUserId);
  const accepted = records.filter((r) => r.status === "accepted");
  const pending = records.filter((r) => r.status === "pending");
  const acceptedSet = new Set(accepted.map((r) => r.user_id));
  const allKnownSet = new Set(records.map((r) => r.user_id));

  const myRecord = meUid ? records.find((r) => r.user_id === meUid) : undefined;
  const iAmSubgroupAdmin = !!myRecord && (myRecord.is_owner || myRecord.is_admin);
  const canManage = isAdmin || iAmSubgroupAdmin;

  // Show accepted members as chips
  const memberChips = accepted.map((rec) => {
    const m = members.find((mm) => toNum(mm.user_id || mm.id) === rec.user_id);
    return { rec, name: m?.profile?.full_name || `Member ${rec.user_id}` };
  });

  const togglePicker = (uid: number, checked: boolean) => {
    if (checked) {
      addMember.mutate({ subgroupId: subgroup.id, userId: uid, status: "accepted" }, {
        onSuccess: () => toast({ title: "Added to sub-group" }),
        onError: () => toast({ title: "Failed to add", variant: "destructive" }),
      });
    } else {
      removeMember.mutate({ subgroupId: subgroup.id, userId: uid }, {
        onSuccess: () => toast({ title: "Removed from sub-group" }),
      });
    }
  };

  const handleApprove = (uid: number) => {
    approveMember.mutate({ subgroupId: subgroup.id, userId: uid }, {
      onSuccess: () => toast({ title: "Request approved" }),
    });
  };
  const handleDecline = (uid: number) => {
    declineMember.mutate({ subgroupId: subgroup.id, userId: uid }, {
      onSuccess: () => toast({ title: "Request declined" }),
    });
  };
  const handleRequestJoin = () => {
    requestJoin.mutate({ subgroupId: subgroup.id }, {
      onSuccess: () => toast({ title: "Join request sent" }),
      onError: () => toast({ title: "Failed to send request", variant: "destructive" }),
    });
  };

  const renderRoleIcon = (rec: { is_owner: boolean; is_admin: boolean }) => {
    if (rec.is_owner) return <Crown className="h-2.5 w-2.5 text-warning" />;
    if (rec.is_admin) return <Shield className="h-2.5 w-2.5 text-primary" />;
    return <UsersIcon className="h-2.5 w-2.5" />;
  };

  return (
    <Card className="border-transparent card-elevated">
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: subgroup.color || "hsl(var(--primary))" }}
            />
            <p className="text-sm font-semibold text-foreground truncate">{subgroup.name}</p>
            <Badge variant="secondary" className="text-[10px] h-4">{accepted.length}</Badge>
            {canManage && pending.length > 0 && (
              <Badge variant="outline" className="text-[10px] h-4 gap-0.5 border-warning/40 text-warning">
                <Clock className="h-2.5 w-2.5" /> {pending.length}
              </Badge>
            )}
          </div>
          {isAdmin && (
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={onDelete} aria-label="Delete sub-group">
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Members list */}
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {memberChips.length === 0 ? (
              <p className="text-xs text-muted-foreground">No members yet.</p>
            ) : memberChips.map(({ rec, name }) => (
              <Badge key={rec.user_id} variant="outline" className="text-[11px] gap-1 pr-1">
                {renderRoleIcon(rec)}
                <span className="truncate max-w-[120px]">{name}</span>
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="ml-0.5 hover:bg-muted rounded p-0.5" aria-label="Member options">
                        <MoreVertical className="h-2.5 w-2.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => updateRole.mutate({ subgroupId: subgroup.id, userId: rec.user_id, role: "owner" })}>
                        <Crown className="h-3 w-3 mr-2 text-warning" /> Make owner
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateRole.mutate({ subgroupId: subgroup.id, userId: rec.user_id, role: "admin" })}>
                        <Shield className="h-3 w-3 mr-2 text-primary" /> Make admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateRole.mutate({ subgroupId: subgroup.id, userId: rec.user_id, role: "nothing special" })}>
                        <UsersIcon className="h-3 w-3 mr-2" /> Set as member
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => togglePicker(rec.user_id, false)}
                      >
                        <X className="h-3 w-3 mr-2" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </Badge>
            ))}
          </div>
        )}

        {/* Pending requests (admins only) */}
        {canManage && pending.length > 0 && (
          <div className="mb-2 rounded-md border border-warning/30 bg-warning/5 p-2">
            <p className="text-[11px] font-semibold text-warning mb-1.5 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Pending requests
            </p>
            <div className="space-y-1">
              {pending.map((rec) => {
                const m = members.find((mm) => toNum(mm.user_id || mm.id) === rec.user_id);
                const name = m?.profile?.full_name || `User ${rec.user_id}`;
                return (
                  <div key={rec.user_id} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-foreground truncate flex-1">{name}</span>
                    <Button
                      size="sm" variant="success"
                      className="h-6 px-2 text-[11px]"
                      onClick={() => handleApprove(rec.user_id)}
                      disabled={approveMember.isPending}
                    >
                      <Check className="h-3 w-3 mr-0.5" /> Approve
                    </Button>
                    <Button
                      size="sm" variant="ghost"
                      className="h-6 px-2 text-[11px] text-destructive hover:bg-destructive/10"
                      onClick={() => handleDecline(rec.user_id)}
                      disabled={declineMember.isPending}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer actions */}
        {canManage ? (
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs w-full">
                <UserPlus className="h-3 w-3 mr-1" /> Manage members <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2 max-h-72 overflow-y-auto" align="start">
              {members.length === 0 ? (
                <p className="text-xs text-muted-foreground p-2">No group members.</p>
              ) : members.map((m) => {
                const uid = toNum(m.user_id || m.id);
                if (!uid) return null;
                const checked = acceptedSet.has(uid);
                const isPending = !checked && allKnownSet.has(uid);
                return (
                  <label key={uid} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-1.5 py-1">
                    <Checkbox checked={checked} onCheckedChange={(c) => togglePicker(uid, !!c)} />
                    <span className="text-sm text-foreground flex-1 truncate">
                      {m.profile?.full_name || `Member ${uid}`}
                    </span>
                    {isPending && <Badge variant="outline" className="text-[9px] h-4 border-warning/40 text-warning">pending</Badge>}
                  </label>
                );
              })}
            </PopoverContent>
          </Popover>
        ) : myRecord?.status === "pending" ? (
          <Button variant="outline" size="sm" className="h-7 text-xs w-full" disabled>
            <Clock className="h-3 w-3 mr-1" /> Request pending
          </Button>
        ) : !myRecord && meUid ? (
          <Button
            variant="outline" size="sm" className="h-7 text-xs w-full"
            onClick={handleRequestJoin} disabled={requestJoin.isPending}
          >
            {requestJoin.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <UserPlus className="h-3 w-3 mr-1" />}
            Request to join
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
