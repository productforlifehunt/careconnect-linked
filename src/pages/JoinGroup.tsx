import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useJoinGroupByCode } from "@/hooks/use-care-data";
import { toast } from "@/hooks/use-toast";

/**
 * Magic-link group join: /join/:code
 * Reuses the existing care_group.join_code field — no new CCT needed.
 */
export default function JoinGroup() {
  const { code = "" } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const joinGroupByCode = useJoinGroupByCode();
  const [status, setStatus] = useState<"idle" | "joining" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Bounce to auth, returning to this exact link after login
      navigate(`/auth?next=${encodeURIComponent(`/join/${code}`)}`, { replace: true });
      return;
    }
    if (!code) {
      setStatus("error");
      setMessage("Invalid invite link.");
      return;
    }
    if (status !== "idle") return;
    setStatus("joining");
    joinGroupByCode.mutate(code, {
      onSuccess: (res: any) => {
        setStatus("success");
        setMessage(`You've joined ${res?.group_name || "the care group"}.`);
        toast({ title: "Joined", description: `Welcome to ${res?.group_name || "the group"}.` });
        setTimeout(() => navigate("/care-circle"), 1500);
      },
      onError: (err: any) => {
        setStatus("error");
        setMessage(err?.message || "This invite link is invalid or expired.");
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, code]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Care Group</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {status === "joining" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Adding you to the group…</p>
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
                <Link to="/care-circle">Go to Care Circle</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
