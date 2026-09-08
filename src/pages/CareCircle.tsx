import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users, Plus, Loader2, Home, CalendarDays, Megaphone, Heart,
  MessageSquare, Star, Image, Settings, ListTodo, KeyRound,
  MapPin, UserPlus, Tag, HelpCircle,
} from "lucide-react";

import {
  useCareGroups, useCreateCareGroup, useCareGroupMembers, useCareTasks, useCreateTask, useUpdateTaskStatus,
  useCareGroupPosts, useCreateGroupPost, useUpdateGroupPost, useDeleteGroupPost,
  useCareGroupGallery, useGroupCaredOnes,
  useGroupMessages, useSendMessage,
  useInviteToGroup, useUpdateMemberRole, useRemoveGroupMember,
  useUpdateCareGroup, useDeleteCareGroup, useJoinGroupByAnyCode,
  useGroupInvitations, useCancelInvitation,
  useMemberCategories, useCreateMemberCategory, useDeleteMemberCategory,
  useDeleteTask, useLeaveGroup, useShareTask, useMyProfile,
} from "@/hooks/use-care-data";
import { useSite } from "@/contexts/SiteContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

// Sub-components
import { EditPostDialog, AddCaredOneDialog } from "@/components/care-circle/GroupDialogs";
import { GroupTabsBar } from "@/components/care-circle/GroupTabsBar";
import { HomeTab } from "@/components/care-circle/tabs/HomeTab";
import { CalendarTab } from "@/components/care-circle/tabs/CalendarTab";
import { AnnouncementsTab } from "@/components/care-circle/tabs/AnnouncementsTab";
import { TasksTab } from "@/components/care-circle/tabs/TasksTab";
import { CaredOnesTab } from "@/components/care-circle/tabs/CaredOnesTab";
import { MessagesTab } from "@/components/care-circle/tabs/MessagesTab";
import { WishesTab } from "@/components/care-circle/tabs/WishesTab";
import { MembersTab } from "@/components/care-circle/tabs/MembersTab";
import { GalleryTab } from "@/components/care-circle/tabs/GalleryTab";
import { InviteMembersTab } from "@/components/care-circle/tabs/InviteMembersTab";
import { MemberGroupsTab } from "@/components/care-circle/tabs/MemberGroupsTab";
import { GroupLocationTab } from "@/components/care-circle/tabs/GroupLocationTab";
import { GroupSettingsTab } from "@/components/care-circle/tabs/GroupSettingsTab";
import { GroupHelpTab } from "@/components/care-circle/tabs/GroupHelpTab";


export default function CareCircle() {
  const { t, i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const { toast } = useToast();
  const site = useSite();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const qc = useQueryClient();
  const { data: groups, isLoading: groupsLoading } = useCareGroups();
  const createGroup = useCreateCareGroup();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("home");

  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [joinCodeOpen, setJoinCodeOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupMyName, setNewGroupMyName] = useState("");
  const [joinMyName, setJoinMyName] = useState("");
  const [editingPost, setEditingPost] = useState<any>(null);
  const [addCaredOneOpen, setAddCaredOneOpen] = useState(false);

  const joinGroupByCode = useJoinGroupByAnyCode();

  const activeGroupId = selectedGroupId || (groups && groups.length > 0 ? groups[0].id : null);
  const activeGroup = (groups || []).find((g: any) => g.id === activeGroupId);

  const { data: members, isLoading: membersLoadingRaw } = useCareGroupMembers(activeGroupId);
  const membersLoading = !!activeGroupId && membersLoadingRaw;
  const { data: tasks, isLoading: tasksLoadingRaw } = useCareTasks(activeGroupId);
  // Disabled react-query queries stay `isLoading` forever — only treat them as
  // loading when a group is actually selected, otherwise skeletons never clear.
  const tasksLoading = !!activeGroupId && tasksLoadingRaw;
  const { data: allPosts } = useCareGroupPosts(activeGroupId);
  const { data: announcements, isLoading: announcementsLoading } = useCareGroupPosts(activeGroupId, "announcement");
  const { data: wishes, isLoading: wishesLoading } = useCareGroupPosts(activeGroupId, "wish");
  const { data: gallery } = useCareGroupGallery(activeGroupId);
  const { data: groupCaredOnes } = useGroupCaredOnes(activeGroupId);
  const { data: groupMessages } = useGroupMessages(activeGroupId);
  const { data: pendingInvitations } = useGroupInvitations(activeGroupId);
  const { data: memberCategories } = useMemberCategories(activeGroupId);

  /**
   * Posts carry only the WP author id (CCT `cct_author_id`); the display name
   * lives on the Rel 223 membership meta. Resolve it here so every tab shows a
   * real member name instead of a generic placeholder.
   */
  const withAuthors = useCallback((list: any[] | undefined) => {
    const byId = new Map<string, any>((members || []).map((m: any) => [String(m.id), m]));
    return (list || []).map((p: any) => {
      const m = p.author_id ? byId.get(String(p.author_id).replace(/^wp-/, "")) : null;
      return m
        ? { ...p, author: { id: p.author_id, full_name: m.display_name || null, avatar_url: m.profile?.avatar_url || null } }
        : p;
    });
  }, [members]);
  const allPostsWithAuthors = useMemo(() => withAuthors(allPosts), [withAuthors, allPosts]);
  const announcementsWithAuthors = useMemo(() => withAuthors(announcements), [withAuthors, announcements]);
  const wishesWithAuthors = useMemo(() => withAuthors(wishes), [withAuthors, wishes]);


  const createTask = useCreateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const createPost = useCreateGroupPost();
  const updatePost = useUpdateGroupPost();
  const deletePost = useDeleteGroupPost();
  const sendMessage = useSendMessage();
  const inviteToGroup = useInviteToGroup();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveGroupMember();
  const updateGroup = useUpdateCareGroup();
  const deleteGroup = useDeleteCareGroup();
  const cancelInvitation = useCancelInvitation();
  const createCategory = useCreateMemberCategory();
  const deleteCategory = useDeleteMemberCategory();
  const leaveGroup = useLeaveGroup();
  const shareTask = useShareTask();

  const currentUserId = String(profile?.id || profile?.user_id || "").replace(/^wp-/, "");
  const currentMember = (members || []).find((m: any) => {
    const memberUserId = String(m.user_id || m.id || "").replace(/^wp-/, "");
    return currentUserId && memberUserId === currentUserId;
  });
  const isAdmin = currentMember?.is_owner || currentMember?.is_admin;
  const isOwner = currentMember?.is_owner;
  const canShowJoin = !profileLoading && !membersLoading && !!currentUserId && !!activeGroupId && !currentMember;
  const pendingTasks = (tasks || []).filter((t: any) => t.status !== "completed");

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    createGroup.mutate({ name: newGroupName, description: newGroupDesc || undefined, displayName: newGroupMyName || undefined }, {
      onSuccess: () => { setNewGroupName(""); setNewGroupDesc(""); setNewGroupMyName(""); setCreateGroupOpen(false); toast({ title: t("careCircle.groupCreated", { group: site.careGroupSingular }) }); },
    });
  };

  const handleJoinByCode = () => {
    if (!joinCode.trim()) return;
    joinGroupByCode.mutate({ code: joinCode, displayName: joinMyName || undefined }, {
      onSuccess: () => { setJoinCode(""); setJoinMyName(""); setJoinCodeOpen(false); toast({ title: t("careCircle.joinedSuccess") }); },
      onError: (err: any) => toast({ title: t("careCircle.failedToJoin"), description: err.message, variant: "destructive" }),
    });
  };

  const handleLeaveGroup = () => {
    if (!activeGroupId || !profile?.id) return;
    leaveGroup.mutate(activeGroupId, {
      onSuccess: () => { setSelectedGroupId(null); toast({ title: t("careCircle.leftGroup") }); },
      onError: (err: any) => toast({ title: t("common.error"), description: err.message, variant: "destructive" }),
    });
  };

  const handleTogglePin = (post: any) => {
    updatePost.mutate({ id: post.id, is_pinned: !post.is_pinned }, {
      onSuccess: () => toast({ title: post.is_pinned ? t("careCircle.unpinned") : t("careCircle.pinned") }),
    });
  };

  const handleDeletePost = (postId: string) => {
    deletePost.mutate(postId, { onSuccess: () => toast({ title: t("careCircle.postDeleted") }) });
  };

  if (groupsLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  if (!groups || groups.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 text-center">
        <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("careCircle.noGroupsYet", { groups: site.navLabels.careGroups })}</h1>
        <p className="text-muted-foreground mb-6">{t("careCircle.createGroupDesc", { group: site.careGroupSingular.toLowerCase() })}</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
            <DialogTrigger asChild><Button variant="coral"><Plus className="h-4 w-4 mr-2" /> {t("common.create")} {site.careGroupSingular}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("common.create")} {site.careGroupSingular}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div><Label>{t("careCircle.groupName")} *</Label><Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder={site.family === "challenged" ? "e.g. Dad's Dementia Team" : "e.g. Mom's Care Team"} /></div>
                <div><Label>{t("common.description")}</Label><Textarea value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder={t("careCircle.groupDesc")} /></div>
                <div><Label>{isCN ? "我在此群组的显示名" : "My name in this group"}</Label><Input value={newGroupMyName} onChange={e => setNewGroupMyName(e.target.value)} placeholder={profile?.full_name || (isCN ? "例如：大女儿 小丽" : "e.g. Lily (daughter)")} /></div>
                <Button variant="coral" className="w-full" onClick={handleCreateGroup} disabled={createGroup.isPending || !newGroupName.trim()}>{t("common.create")} {site.careGroupSingular}</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={joinCodeOpen} onOpenChange={setJoinCodeOpen}>
            <DialogTrigger asChild><Button variant="outline"><KeyRound className="h-4 w-4 mr-2" /> {t("careCircle.joinWithCode")}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("careCircle.joinGroup")} {site.careGroupSingular}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div><Label>{t("careCircle.joinCode")}</Label><Input value={joinCode} onChange={e => setJoinCode(e.target.value.trim())} placeholder={t("careCircle.joinCodePlaceholder")} /></div>
                <div><Label>{isCN ? "我在此群组的显示名" : "My name in this group"}</Label><Input value={joinMyName} onChange={e => setJoinMyName(e.target.value)} placeholder={profile?.full_name || (isCN ? "例如：大女儿 小丽" : "e.g. Lily (daughter)")} /></div>
                <Button variant="coral" className="w-full" onClick={handleJoinByCode} disabled={joinGroupByCode.isPending || !joinCode.trim()}>{t("careCircle.joinGroup")}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-5">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{site.navLabels.careGroups}</h1>
          <p className="text-sm text-muted-foreground">{t("careCircle.coordinateCare")}</p>
        </div>
        <div className="flex gap-2">
          {canShowJoin && (
            <Dialog open={joinCodeOpen} onOpenChange={setJoinCodeOpen}>
              <DialogTrigger asChild><Button variant="outline" size="sm"><KeyRound className="h-4 w-4 mr-1" /> {t("careCircle.join")}</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t("careCircle.joinGroup")} {site.careGroupSingular}</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div><Label>{t("careCircle.joinCode")}</Label><Input value={joinCode} onChange={e => setJoinCode(e.target.value.trim())} placeholder={t("careCircle.joinCodePlaceholder")} /></div>
                  <div><Label>{isCN ? "我在此群组的显示名" : "My name in this group"}</Label><Input value={joinMyName} onChange={e => setJoinMyName(e.target.value)} placeholder={profile?.full_name || (isCN ? "例如：大女儿 小丽" : "e.g. Lily (daughter)")} /></div>
                <Button variant="coral" className="w-full" onClick={handleJoinByCode} disabled={joinGroupByCode.isPending || !joinCode.trim()}>{t("careCircle.joinGroup")}</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> {t("careCircle.newGroup")}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("common.create")} {site.careGroupSingular}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div><Label>{t("careCircle.groupName")} *</Label><Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder={site.family === "challenged" ? "e.g. Dad's Dementia Team" : "e.g. Mom's Care Team"} /></div>
                <div><Label>{t("common.description")}</Label><Textarea value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder={t("careCircle.groupDesc")} /></div>
                <div><Label>{isCN ? "我在此群组的显示名" : "My name in this group"}</Label><Input value={newGroupMyName} onChange={e => setNewGroupMyName(e.target.value)} placeholder={profile?.full_name || (isCN ? "例如：大女儿 小丽" : "e.g. Lily (daughter)")} /></div>
                <Button variant="coral" className="w-full" onClick={handleCreateGroup} disabled={createGroup.isPending || !newGroupName.trim()}>{t("common.create")} {site.careGroupSingular}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <EditPostDialog post={editingPost} onClose={() => setEditingPost(null)} updatePost={updatePost} />
      <AddCaredOneDialog open={addCaredOneOpen} onOpenChange={setAddCaredOneOpen} activeGroupId={activeGroupId} />

      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
          {isCN ? `我加入的${site.navLabels.careGroups}` : `My Joined ${site.navLabels.careGroups}`}
        </p>
        <div className="flex gap-2 flex-wrap">
          {groups.map((g: any) => (<Badge key={g.id} variant={activeGroupId === g.id ? "default" : "outline"} className="cursor-pointer whitespace-nowrap" onClick={() => setSelectedGroupId(g.id)}>{g.name}</Badge>))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <GroupTabsBar
          activeTab={activeTab}
          onSelect={setActiveTab}
          allLabel={isCN ? "全部标签" : "All tabs"}
          isCN={isCN}
          tabs={[
            { value: "home", label: t("careCircle.home"), icon: Home },
            { value: "calendar", label: t("careCircle.calendar"), icon: CalendarDays },
            { value: "tasks", label: t("careCircle.tasks"), icon: ListTodo },
            { value: "location", label: isCN ? "被护理者位置" : "Cared One's Location", icon: MapPin },
            { value: "messages", label: t("messages.messages"), icon: MessageSquare },
            { value: "announcements", label: t("careCircle.announcements"), icon: Megaphone },
            { value: "wishes", label: t("careCircle.wellWishes"), icon: Star },
            { value: "gallery", label: t("careCircle.gallery"), icon: Image },
            { value: "cared-ones", label: isCN ? "群组被护理者" : `Group ${site.navLabels.caredOnes}`, icon: Heart },
            { value: "members", label: t("careCircle.members"), icon: Users },
            { value: "invite", label: isCN ? "邀请成员" : "Invite Members", icon: UserPlus },
            { value: "member-groups", label: isCN ? "子群组" : "Member Groups", icon: Tag },
            ...(isAdmin ? [{ value: "settings", label: isCN ? "群组设置" : "Group Setting", icon: Settings }] : []),
            { value: "help", label: isCN ? "使用指南与帮助" : "How to & Help", icon: HelpCircle },
          ]}
        />



        <TabsContent value="home" className="mt-4">
          <HomeTab statsLoading={membersLoading || tasksLoading} pendingTasksCount={pendingTasks.length} membersCount={(members || []).length} caredOnesCount={(groupCaredOnes || []).length} allPosts={allPostsWithAuthors} activeGroupId={activeGroupId} userId={profile?.id} isAdmin={!!isAdmin} memberCategories={memberCategories || []} members={members || []} createPost={createPost} onEditPost={setEditingPost} onTogglePin={handleTogglePin} onDeletePost={handleDeletePost} onNavigateTab={setActiveTab} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4"><CalendarTab tasks={tasks || []} /></TabsContent>
        <TabsContent value="tasks" className="mt-4"><TasksTab tasks={tasks || []} tasksLoading={tasksLoading} members={members || []} activeGroupId={activeGroupId} userId={profile?.id} isAdmin={!!isAdmin} memberCategories={memberCategories || []} createTask={createTask} updateTaskStatus={updateTaskStatus} deleteTask={deleteTask} shareTask={shareTask} /></TabsContent>
        <TabsContent value="location" className="mt-4"><GroupLocationTab groupCaredOnes={groupCaredOnes || []} /></TabsContent>
        <TabsContent value="messages" className="mt-4"><MessagesTab groupMessages={groupMessages || []} userId={profile?.id} activeGroupId={activeGroupId} sendMessage={sendMessage} /></TabsContent>
        <TabsContent value="announcements" className="mt-4"><AnnouncementsTab announcements={announcementsWithAuthors} announcementsLoading={announcementsLoading} activeGroupId={activeGroupId} userId={profile?.id} isAdmin={!!isAdmin} memberCategories={memberCategories || []} members={members || []} createPost={createPost} onEditPost={setEditingPost} onTogglePin={handleTogglePin} onDeletePost={handleDeletePost} /></TabsContent>
        <TabsContent value="wishes" className="mt-4"><WishesTab wishes={wishesWithAuthors} wishesLoading={wishesLoading} activeGroupId={activeGroupId} userId={profile?.id} isAdmin={!!isAdmin} memberCategories={memberCategories || []} members={members || []} createPost={createPost} onEditPost={setEditingPost} onTogglePin={handleTogglePin} onDeletePost={handleDeletePost} /></TabsContent>
        <TabsContent value="gallery" className="mt-4"><GalleryTab gallery={gallery || []} activeGroupId={activeGroupId} /></TabsContent>
        <TabsContent value="cared-ones" className="mt-4"><CaredOnesTab groupCaredOnes={groupCaredOnes || []} isAdmin={!!(isAdmin || currentMember)} onAddCaredOne={() => setAddCaredOneOpen(true)} /></TabsContent>
        <TabsContent value="members" className="mt-4"><MembersTab members={members || []} activeGroupId={activeGroupId} userId={profile?.id} isAdmin={!!isAdmin} isOwner={!!isOwner} currentMember={currentMember} updateRole={updateRole} removeMember={removeMember} /></TabsContent>
        <TabsContent value="invite" className="mt-4"><InviteMembersTab members={members || []} activeGroupId={activeGroupId} isAdmin={!!isAdmin} pendingInvitations={pendingInvitations || []} inviteToGroup={inviteToGroup} cancelInvitation={cancelInvitation} /></TabsContent>
        <TabsContent value="member-groups" className="mt-4"><MemberGroupsTab members={members || []} memberCategories={memberCategories || []} activeGroupId={activeGroupId} userId={profile?.id} isAdmin={!!isAdmin} createCategory={createCategory} deleteCategory={deleteCategory} /></TabsContent>
        <TabsContent value="settings" className="mt-4"><GroupSettingsTab activeGroup={activeGroup} activeGroupId={activeGroupId} isAdmin={!!isAdmin} isOwner={!!isOwner} myDisplayName={currentMember?.display_name || ""} updateGroup={updateGroup} deleteGroup={deleteGroup} onDeleteSuccess={() => { setSelectedGroupId(null); setActiveTab("home"); }} onLeaveGroup={handleLeaveGroup} /></TabsContent>
        <TabsContent value="help" className="mt-4"><GroupHelpTab groupName={activeGroup?.name} groupId={activeGroup?.id ? String(activeGroup.id) : undefined} /></TabsContent>
      </Tabs>

    </div>
  );
}
