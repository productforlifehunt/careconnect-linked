import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, Users, UserPlus, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  useGroupLinkState, useJoinGroupByJoinCode, useRequestToJoinGroup,
  useAcceptInvitation, useDeclineInvitation, useJoinRequester, useAnswerJoinRequest,
  useGroupInvitePreview, useJoinGroupByAnyCode,
} from "@/hooks/use-care-data";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { cleanJoinCodeInput, JOIN_CODE_MAX_LENGTH } from "@/features/care-groups/join-link";

type Z = (cn: string, en: string) => string;

function useZ(): Z {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");
  return (cn: string, en: string) => (zh ? cn : en);
}

/**
 * Group onboarding, shown on the group's own page (/care-circle/<id>) to
 * anyone who is not a member yet. Everyone fills in their name inside the
 * group, then joins in one of three ways: accept a personal invitation, type
 * the join code, or ask the admins. Once they are in, the page simply shows
 * the group.
 */
export function GroupOnboarding({ groupId, inviteToken, onClearInvite }: {
  groupId: string;
  /** Token from an older per-link invitation (/join/<token> forwards here). */
  inviteToken?: string | null | undefined;
  onClearInvite?: (() => void) | undefined;
}) {
  const Z = useZ();
  const { user } = useAuth();
  const { data: state, isLoading: stateLoading, isError } = useGroupLinkState(groupId || null, !!user);
  const { data: tokenInvite, isLoading: tokenLoading } = useGroupInvitePreview(inviteToken || null);
  const joinByCode = useJoinGroupByJoinCode();
  const joinByToken = useJoinGroupByAnyCode();
  const requestJoin = useRequestToJoinGroup();
  const acceptInvite = useAcceptInvitation();
  const declineInvite = useDeclineInvitation();

  const [displayName, setDisplayName] = useState("");
  const [code, setCode] = useState("");
  const [requested, setRequested] = useState(false);
  const [declined, setDeclined] = useState(false);
  const appName = user?.full_name || "";
  const nameToSave = () => displayName.trim() || appName;

  const roleWord = (r?: string) => (r === "owner" ? Z("拥有者", "owner") : r === "admin" ? Z("管理员", "admin") : Z("普通成员", "member"));
  const groupName = state?.group_name || Z("护理小组", "Care group");
  const welcome = () => toast({ title: Z("已加入", "Joined"), description: Z(`欢迎加入「${groupName}」。`, `Welcome to ${groupName}.`) });
  const failed = (e: any) => toast({ title: Z("加入失败", "Could not join"), description: e?.message, variant: "destructive" });
  const tokenMatches = !!tokenInvite && String(tokenInvite.group_id) === String(state?.group_id || groupId);

  const nameField = (
    <div className="space-y-2">
      <Label htmlFor="group-display-name">{Z("您在这个小组里显示的名字", "Your name inside this group")}</Label>
      <Input id="group-display-name" value={displayName} placeholder={appName} onChange={(e) => setDisplayName(e.target.value)} />
      {appName && <p className="text-xs text-muted-foreground">{Z("不填就用您的名字：", "Leave empty to use your name: ")}{appName}</p>}
    </div>
  );

  const groupBox = (subtitle?: string) => (
    <div className="rounded-lg border bg-muted/30 p-3 flex items-start gap-2">
      <Users className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{groupName}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );

  let body: React.ReactNode;
  if (!user || stateLoading || (inviteToken && tokenLoading)) {
    body = <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  } else if (isError || !state?.found) {
    body = <Result icon="error" text={Z("找不到这个群组，链接可能有误。", "We couldn't find this group. The link may be wrong.")} />;
  } else if (state.my_status === "accepted") {
    // Just joined — the page switches to the group once the group list refreshes.
    body = (
      <div className="flex flex-col items-center gap-3 py-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{Z("正在打开群组…", "Opening the group…")}</p>
      </div>
    );
  } else if (!state.is_active) {
    body = <Result icon="error" text={Z(`「${groupName}」已停用，暂时不能加入。`, `${groupName} is no longer active, so it can't be joined.`)} />;
  } else if (state.my_status === "pending" && !declined) {
    body = (
      <div className="space-y-4 text-left">
        {groupBox(Z(`有人邀请您以${roleWord(state.my_invited_as)}的身份加入。`, `You were invited to join as ${roleWord(state.my_invited_as)}.`))}
        {nameField}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" disabled={declineInvite.isPending || acceptInvite.isPending}
            onClick={() => declineInvite.mutate(`${state.group_id}:`, {
              onSuccess: () => setDeclined(true),
              onError: (e: any) => toast({ title: Z("操作失败", "Something went wrong"), description: e?.message, variant: "destructive" }),
            })}>
            {Z("拒绝", "Decline")}
          </Button>
          <Button variant="coral" className="flex-1" disabled={acceptInvite.isPending || declineInvite.isPending}
            onClick={() => acceptInvite.mutate({ id: `${state.group_id}:`, displayName: nameToSave() }, { onSuccess: welcome, onError: failed })}>
            {acceptInvite.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : Z("接受邀请", "Accept invitation")}
          </Button>
        </div>
      </div>
    );
  } else if (tokenMatches && !declined) {
    body = (
      <div className="space-y-4 text-left">
        {groupBox(Z(`有人邀请您以${roleWord(tokenInvite!.invited_as)}的身份加入。`, `You were invited to join as ${roleWord(tokenInvite!.invited_as)}.`))}
        {nameField}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" disabled={joinByToken.isPending}
            onClick={() => { setDeclined(true); onClearInvite?.(); }}>
            {Z("不加入", "Not now")}
          </Button>
          <Button variant="coral" className="flex-1" disabled={joinByToken.isPending}
            onClick={() => joinByToken.mutate({ code: inviteToken!, displayName: nameToSave() }, { onSuccess: () => { welcome(); onClearInvite?.(); }, onError: failed })}>
            {joinByToken.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : Z("接受邀请", "Accept invitation")}
          </Button>
        </div>
      </div>
    );
  } else {
    body = (
      <div className="space-y-4 text-left">
        {groupBox(declined ? Z("您没有接受邀请。想加入的话，可以用加入码或向管理员申请。", "You didn't accept the invitation. You can still join with the code or ask the admins.") : undefined)}
        {nameField}
        {state.has_join_code && (
          <>
            <div className="space-y-2">
              <Label htmlFor="group-join-code">{Z("加入码", "Join code")}</Label>
              <Input id="group-join-code" value={code} maxLength={JOIN_CODE_MAX_LENGTH} autoComplete="off" inputMode="text"
                placeholder={Z("向群管理员要 6 位加入码", "Ask an admin for the 6-digit code")}
                onChange={(e) => setCode(cleanJoinCodeInput(e.target.value))} />
            </div>
            <Button variant="coral" className="w-full" disabled={!code || joinByCode.isPending}
              onClick={() => joinByCode.mutate({ groupId: state.group_id, code, displayName: nameToSave() }, {
                onSuccess: welcome,
                onError: (e: any) => toast({
                  title: Z("加入失败", "Could not join"),
                  description: /not correct/i.test(String(e?.message)) ? Z("加入码不对，请再核对一下。", "That join code is not correct.") : e?.message,
                  variant: "destructive",
                }),
              })}>
              <KeyRound className="h-4 w-4 mr-1" />{joinByCode.isPending ? Z("正在加入…", "Joining…") : Z("用加入码加入", "Join with code")}
            </Button>
          </>
        )}
        <div className={state.has_join_code ? "border-t pt-4 space-y-2" : "space-y-2"}>
          {requested ? (
            <p className="text-sm text-muted-foreground text-center">{Z("申请已发给群管理员，同意后您会在收件箱收到通知。", "Your request went to the group's admins. You'll get a notice when they answer.")}</p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                {state.has_join_code
                  ? Z("没有加入码？可以向群管理员申请。", "No join code? Ask the group's admins.")
                  : Z("这个群组没有设置加入码，请向群管理员申请。", "This group has no join code. Ask the group's admins to let you in.")}
              </p>
              <Button variant="outline" className="w-full" disabled={requestJoin.isPending}
                onClick={() => requestJoin.mutate(state.group_id, {
                  onSuccess: () => setRequested(true),
                  onError: (e: any) => toast({ title: Z("申请没发出去", "Request not sent"), description: e?.message, variant: "destructive" }),
                })}>
                <UserPlus className="h-4 w-4 mr-1" />{requestJoin.isPending ? Z("正在发送…", "Sending…") : Z("申请加入", "Ask to join")}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader><CardTitle>{Z("加入护理小组", "Join care group")}</CardTitle></CardHeader>
      <CardContent className="space-y-4 text-center">{body}</CardContent>
    </Card>
  );
}

function Result({ icon, text }: { icon: "error" | "done"; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {icon === "error" ? <XCircle className="h-10 w-10 text-destructive" /> : <CheckCircle2 className="h-10 w-10 text-primary" />}
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}

/** Shown on the group page to an admin who opened a join-request notice. */
export function JoinRequestPanel({ groupId, groupName, requesterId, onDone }: {
  groupId: string; groupName: string; requesterId: string; onDone: () => void;
}) {
  const Z = useZ();
  const { data: requester, isLoading } = useJoinRequester(groupId, requesterId);
  const answer = useAnswerJoinRequest();
  const [done, setDone] = useState<null | "approved" | "declined">(null);
  useEffect(() => { setDone(null); }, [requesterId]);
  const who = requester?.name || Z("这位用户", "This person");
  const reply = (approve: boolean) => answer.mutate({ groupId, requesterId, approve }, {
    onSuccess: () => setDone(approve ? "approved" : "declined"),
    onError: (e: any) => toast({ title: Z("操作失败", "Something went wrong"), description: e?.message, variant: "destructive" }),
  });

  let content: React.ReactNode;
  if (isLoading) {
    content = <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  } else if (done || requester?.status === "accepted") {
    const approved = done === "approved" || requester?.status === "accepted";
    content = (
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-foreground flex items-center gap-2">
          {approved ? <CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> : <XCircle className="h-5 w-5 text-muted-foreground shrink-0" />}
          {approved ? Z(`${who} 已经在「${groupName}」里了。`, `${who} is now in ${groupName}.`) : Z(`已拒绝 ${who} 的申请。`, `You declined ${who}'s request.`)}
        </p>
        <Button variant="outline" size="sm" onClick={onDone}>{Z("知道了", "OK")}</Button>
      </div>
    );
  } else {
    content = (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-foreground">{Z(`${who} 申请加入「${groupName}」`, `${who} asked to join ${groupName}`)}</p>
          <p className="text-xs text-muted-foreground">{Z("同意后对方以普通成员身份加入，之后可以在成员里调整身份。", "If you accept, they join as a member. You can change their role later under Members.")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" disabled={answer.isPending} onClick={() => reply(false)}>{Z("拒绝", "Decline")}</Button>
          <Button variant="coral" className="flex-1" disabled={answer.isPending} onClick={() => reply(true)}>{Z("同意", "Accept")}</Button>
        </div>
      </div>
    );
  }
  return <Card className="mb-4"><CardContent className="p-4">{content}</CardContent></Card>;
}
