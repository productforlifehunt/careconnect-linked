import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Bot } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAIAssistant } from "@/contexts/AIAssistantContext";
import { buildCareGroupHelpRequest } from "../../../../supabase/functions/_shared/ai-prompts";

interface GroupHelpTabProps {
  groupName?: string;
}

export function GroupHelpTab({ groupName }: GroupHelpTabProps) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const { openAssistant } = useAIAssistant();

  const guide: { title: string; body: string }[] = [
    {
      title: Z("首页", "Home"),
      body: Z("查看群组动态、待办任务数量和最新发布的内容。", "See group activity, how many tasks are open, and the newest posts."),
    },
    {
      title: Z("日历", "Calendar"),
      body: Z("按日期查看群组任务的时间安排。", "See group tasks laid out by date."),
    },
    {
      title: Z("任务", "Tasks"),
      body: Z("创建任务、指派给成员或子群组、标记完成。", "Create tasks, assign them to members or member groups, and mark them done."),
    },
    {
      title: Z("被护理者位置", "Cared One's Location"),
      body: Z("查看群组被护理者的最新位置、区域提醒与位置分享设置。", "See the latest location of the group's cared ones, zone alerts, and sharing settings."),
    },
    {
      title: Z("对话", "Messages"),
      body: Z("群组内的即时对话，所有成员都能看到。", "Real-time group conversation visible to every member."),
    },
    {
      title: Z("公告", "Announcements"),
      body: Z("重要通知，可置顶，可限定给特定子群组。", "Important notices — can be pinned and limited to specific member groups."),
    },
    {
      title: Z("祝福", "Well Wishes"),
      body: Z("给被护理者和家人的鼓励与祝福留言。", "Encouraging messages for the cared one and the family."),
    },
    {
      title: Z("相册", "Gallery"),
      body: Z("群组共享的照片。", "Photos shared inside the group."),
    },
    {
      title: Z("群组被护理者", "Group Cared Ones"),
      body: Z("把被护理者加入群组，并查看他们的健康资料。", "Add cared ones to the group and view their health details."),
    },
    {
      title: Z("成员", "Members"),
      body: Z("查看成员、设为管理员、标记被护理者、转移拥有权或移除成员。", "View members, make admins, mark cared ones, transfer ownership, or remove members."),
    },
    {
      title: Z("邀请成员", "Invite Members"),
      body: Z("按用户名/邮箱邀请，或创建可分享的邀请链接与邀请码。", "Invite by user search or email, or create shareable invite links and codes."),
    },
    {
      title: Z("子群组", "Member Groups"),
      body: Z("把成员分成「家人」「医疗团队」等子群组，用于限定帖子和任务的可见范围。", "Split members into groups like Family or Medical Team to scope posts and tasks."),
    },
    {
      title: Z("群组设置", "Group Setting"),
      body: Z("仅拥有者和管理员可见：修改名称、描述、私密性和我的群内显示名。", "Owners and admins only: change the name, description, privacy, and your in-group display name."),
    },
  ];

  const openHelp = () => openAssistant({
    id: `group-help-${groupName || "current"}`,
    title: Z("护理群组帮助", "Care group help"),
    contextPrompt: buildCareGroupHelpRequest("", groupName, !!isCN),
    starterPrompt: Z("请问我需要怎样使用这个护理群组？", "Ask me how to use this care group."),
  });

  return (
    <div className="space-y-4 max-w-3xl">
      <Card className="border-transparent card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><HelpCircle className="h-4 w-4" /> {Z("护理群组使用指南", "How to use this care group")}</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <dl className="divide-y">
            {guide.map((g) => (
              <div key={g.title} className="py-2.5">
                <dt className="text-sm font-medium text-foreground">{g.title}</dt>
                <dd className="text-xs text-muted-foreground mt-0.5">{g.body}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card className="border-transparent card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Bot className="h-4 w-4" /> {Z("问一句，AI 帮你解答", "Ask a question, AI will help")}</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 space-y-3">
          <p className="text-sm text-muted-foreground">{Z("使用同一个通用助手询问本群组的操作方法。", "Use the same assistant available throughout the app to ask how this group works.")}</p>
          <Button variant="coral" onClick={openHelp}><Bot className="h-4 w-4 mr-2" />{Z("打开助手", "Open assistant")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
