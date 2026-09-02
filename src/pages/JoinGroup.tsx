import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useJoinGroupByCode, useGroupInvitePreview } from "@/hooks/use-care-data";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function JoinGroup() {
  const { code = "" } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const joinGroupByCode = useJoinGroupByCode();
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (zh ? cn : en);
  const [status, setStatus] = useState<"idle" | "naming" | "joining" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [displayName, setDisplayName] = useState("");
  const { data: preview, isLoading: previewLoading } = useGroupInvitePreview(code || null);
  const roleWord = preview?.invited_as === "owner"
    ? Z("拥有者", "owner")
    : preview?.invited_as === "admin"
      ? Z("管理员", "admin")
      : Z("普通成员", "member");

  // Bible: the join form must let the user pick an in-group display name
  // (Rel 223 a55). Placeholder = their app name; blank submit stores that name.
  const appName = user?.full_name || "";

  useEffect(() => {
    // Wait for the session to hydrate — redirecting while auth is still loading
    // bounced already signed-in users to the sign-in screen.
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      navigate(`/auth?next=${encodeURIComponent(`/join/${code}`)}`, { replace: true });
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage(Z("邀请链接无效。", "Invalid invite link."));
      return;
    }
    if (status === "idle") setStatus("naming");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, user, code]);

  const handleJoin = () => {
    setStatus("joining");
    joinGroupByCode.mutate({ token: code, displayName: displayName.trim() || appName }, {
      onSuccess: (res: any) => {
        setStatus("success");
        const groupName = res?.group_name || Z("该护理小组", "the care group");
        if (res?.already_member) {
          setMessage(Z(`您已经是 ${groupName} 的成员。`, `You're already a member of ${groupName}.`));
          toast({ title: Z("已是成员", "Already a member"), description: Z(`正在打开 ${groupName}…`, `Opening ${groupName}…`) });
        } else {
          setMessage(Z(`您已加入 ${groupName}。`, `You've joined ${groupName}.`));
          toast({ title: Z("已加入", "Joined"), description: Z(`欢迎加入 ${groupName}。`, `Welcome to ${groupName}.`) });
        }
        setTimeout(() => navigate("/care-circle"), 1500);
      },
      onError: (err: any) => {
        setStatus("error");
        setMessage(err?.message || Z("此邀请链接无效或已过期。", "This invite link is invalid or expired."));
      },
    });
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{Z("加入护理小组", "Join Care Group")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {status === "naming" && (
            <div className="space-y-4 text-left">
              <div className="rounded-lg border bg-muted/30 p-3">
                {previewLoading ? (
                  <p className="text-sm text-muted-foreground">{Z("正在查看这个邀请…", "Checking this invitation…")}</p>
                ) : preview ? (
                  <>
                    <p className="text-sm font-medium text-foreground">{preview.group_name || Z("护理小组", "Care group")}</p>
                    <p className="text-xs text-muted-foreground">{Z(`您将以${roleWord}的身份加入。`, `You'll join as a ${roleWord}.`)}</p>
                    {preview.note && <p className="text-xs text-muted-foreground mt-1">{preview.note}</p>}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{Z("填好名字后我们再确认这个邀请。", "We'll check this invitation once you've entered your name.")}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-display-name">{Z("您在这个小组里显示的名字", "Your name inside this group")}</Label>
                <Input
                  id="group-display-name"
                  value={displayName}
                  placeholder={appName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {Z("不修改就用您的名字：", "Leave it as is to use your name: ")}{appName}
                </p>
              </div>
              <Button variant="coral" className="w-full" onClick={handleJoin}>
                {Z("加入护理小组", "Join care group")}
              </Button>
            </div>
          )}
          {status === "joining" && (

            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">{Z("正在将您加入小组…", "Adding you to the group…")}</p>
            </div>
          )}
          {status === "success" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <p>{message}</p>
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <XCircle className="h-10 w-10 text-destructive" />
              <p className="text-muted-foreground">{message}</p>
              <Button asChild variant="outline">
                <Link to="/care-circle">{Z("前往护理圈", "Go to Care Circle")}</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
