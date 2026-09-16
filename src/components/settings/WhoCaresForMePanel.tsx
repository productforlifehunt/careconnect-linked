import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { UserMinus, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { maskEmail } from "@/lib/utils";
import {
  fetchMyCaregiversWordPress,
  removeMyCaregiverWordPress,
  respondToCaregiverRequestWordPress,
} from "@/features/cared-ones/my-caregivers";

/**
 * "Who cares for me" — the other side of the cared-one link.
 *
 * Anyone who has added you can see the care information kept about you, so this
 * panel shows that list on your own settings page and lets you cut the link at
 * any time without asking them.
 */
export function WhoCaresForMePanel() {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (zh ? cn : en);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: caregivers, isLoading } = useQuery({
    queryKey: ["myCaregivers"],
    queryFn: fetchMyCaregiversWordPress,
  });

  const remove = useMutation({
    mutationFn: (userId: string) => removeMyCaregiverWordPress(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myCaregivers"] });
      toast({ title: Z("已解除，对方不再能看到你的信息", "Removed — they can no longer see your information") });
    },
    onError: (err: any) =>
      toast({ title: Z("解除失败", "Could not remove"), description: err?.message, variant: "destructive" }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          {Z("谁在照护我", "Who cares for me")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {Z(
            "下面这些人把你列为被照护的人，可以看到你的用药、签到、记录和位置共享。你可以随时解除。",
            "These people list you as the person they care for, so they can see your medicines, check-ins, notes and location sharing. You can end that at any time.",
          )}
        </p>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        ) : !caregivers || caregivers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {Z("目前没有人把你列为被照护的人。", "Nobody lists you as the person they care for.")}
          </p>
        ) : (
          <ul className="space-y-2">
            {caregivers.map((c) => (
              <li key={c.user_id} className="flex items-center gap-3 rounded-xl border p-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                  {c.avatar_url ? (
                    <img src={c.avatar_url} alt="" className="h-9 w-9 object-cover" />
                  ) : (
                    <span className="text-primary text-xs font-medium">
                      {(c.full_name || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {c.full_name || Z("未填写姓名", "No name set")}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{maskEmail(c.email)}</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                      <UserMinus className="h-4 w-4" />
                      {Z("解除", "Remove")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{Z("解除照护关系？", "End this care link?")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {Z(
                          "解除后，对方立刻看不到你的用药、签到、记录、文件和位置。",
                          "They immediately lose access to your medicines, check-ins, notes, documents and location.",
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{Z("取消", "Cancel")}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove.mutate(c.user_id)}>
                        {Z("解除", "Remove")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
