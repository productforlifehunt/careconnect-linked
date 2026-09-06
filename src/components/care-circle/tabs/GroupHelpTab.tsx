import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Bot, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { invokeAI } from "@/lib/ai-service";
import { trimMessagesToCharLimit } from "@/lib/ai-memory";

interface GroupHelpTabProps {
  groupName?: string;
}

export function GroupHelpTab({ groupName }: GroupHelpTabProps) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const { toast } = useToast();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

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

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      const context = Z(
        `用户在护理群组${groupName ? `「${groupName}」` : ""}中提问，请用简单、口语化的中文回答，只解释这个护理群组里能做的事（首页、日历、任务、被护理者位置、对话、公告、祝福、相册、群组被护理者、成员、邀请成员、子群组、群组设置）。不要给医疗诊断。问题：${question.trim()}`,
        `The user is asking about their care group${groupName ? ` "${groupName}"` : ""}. Answer in plain, warm English and only explain what can be done inside this care group (Home, Calendar, Tasks, Cared One's Location, Messages, Announcements, Well Wishes, Gallery, Group Cared Ones, Members, Invite Members, Member Groups, Group Setting). Never give a medical diagnosis. Question: ${question.trim()}`
      );
      const reply = await invokeAI("general_chat", context, { title: Z("护理群组帮助", "Care group help") });
      setAnswer(reply);
    } catch (err: any) {
      toast({ title: Z("暂时问不到答案", "Could not get an answer right now"), description: err?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            placeholder={Z("例如：怎么把姐姐加进来？任务怎么只给夜班看？", "e.g. How do I add my sister? How do I show a task only to the night shift?")}
          />
          <Button variant="coral" onClick={ask} disabled={loading || !question.trim()}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Bot className="h-4 w-4 mr-2" />}
            {Z("提问", "Ask")}
          </Button>
          {answer && (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm text-foreground whitespace-pre-wrap">{answer}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
