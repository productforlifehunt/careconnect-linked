import { useEffect } from "react";
import { useParams, useNavigate, Link } from "@/lib/router-compat";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useGroupInvitePreview } from "@/hooks/use-care-data";
import { useTranslation } from "react-i18next";
import { careGroupPath } from "@/features/care-groups/join-link";
import { withNext } from "@/lib/return-path";

/**
 * Older per-link invitations (/join/<token>) only forward to the group's one
 * page, /care-circle/<id>, which shows the invitation there.
 */
export default function JoinGroup() {
  const { code = "" } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { i18n } = useTranslation();
  const Z = (cn: string, en: string) => (i18n.language?.startsWith("zh") ? cn : en);
  const signedIn = !isLoading && isAuthenticated && !!user;
  const { data: preview, isError, isLoading: previewLoading } = useGroupInvitePreview(signedIn && code ? code : null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) navigate(withNext("/auth", `/join/${code}`), { replace: true });
  }, [isLoading, isAuthenticated, user, code, navigate]);

  useEffect(() => {
    if (preview?.group_id) navigate(`${careGroupPath(preview.group_id)}?invite=${encodeURIComponent(code)}`, { replace: true });
  }, [preview, code, navigate]);

  const failed = signedIn && (!code || isError || (!previewLoading && !preview));
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="py-8 flex flex-col items-center gap-3 text-center">
          {failed ? (
            <>
              <XCircle className="h-10 w-10 text-destructive" />
              <p className="text-muted-foreground">{Z("这个邀请链接无效或已过期。请向群管理员要群组链接。", "This invite link is invalid or expired. Ask an admin for the group link.")}</p>
              <Button asChild variant="outline"><Link to="/care-circle">{Z("返回我的护理小组", "Back to my care groups")}</Link></Button>
            </>
          ) : (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
