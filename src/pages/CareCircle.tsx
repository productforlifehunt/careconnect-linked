import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users, Plus, Loader2, Home, CalendarDays, Megaphone, Heart,
  ClipboardCheck, MessageSquare, Star, Image, Settings, ListTodo, KeyRound,
} from "lucide-react";
import {
  useCareGroups, useCreateCareGroup, useCareGroupMembers, useCareTasks, useCreateTask, useUpdateTaskStatus,
  useCareGroupPosts, useCreateGroupPost, useUpdateGroupPost, useDeleteGroupPost,
  useCareGroupGallery, useGroupCaredOnes,
  useGroupMessages, useSendMessage,
  useInviteToGroup, useUpdateMemberRole, useRemoveGroupMember,
  useUpdateCareGroup, useDeleteCareGroup, useJoinGroupByCode,
  useGroupInvitations, useCancelInvitation,
  useMemberCategories, useCreateMemberCategory, useDeleteMemberCategory,
  useDeleteTask, useLeaveGroup, useCreateJobPosting, useMyProfile,
} from "@/hooks/use-care-data";
import { useSite } from "@/contexts/SiteContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

// Sub-components
import { GroupSettingsDialog, EditPostDialog, AddCaredOneDialog } from "@/components/care-circle/GroupDialogs";
import { HomeTab } from "@/components/care-circle/tabs/HomeTab";
import { CalendarTab } from "@/components/care-circle/tabs/CalendarTab";
import { AnnouncementsTab } from "@/components/care-circle/tabs/AnnouncementsTab";
import { TasksTab } from "@/components/care-circle/tabs/TasksTab";
import { CaredOnesTab } from "@/components/care-circle/tabs/CaredOnesTab";
import { CheckInsTab } from "@/components/care-circle/tabs/CheckInsTab";
import { MessagesTab } from "@/components/care-circle/tabs/MessagesTab";
import { WishesTab } from "@/components/care-circle/tabs/WishesTab";
import { MembersTab } from "@/components/care-circle/tabs/MembersTab";
import { GalleryTab } from "@/components/care-circle/tabs/GalleryTab";

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [addCaredOneOpen, setAddCaredOneOpen] = useState(false);

  const joinGroupByCode = useJoinGroupByCode();

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
        ? { ...p, author: { id: p.author_id, full_name: m.display_name || m.profile?.full_name || null, avatar_url: m.profile?.avatar_url || null } }
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
  const createJob = useCreateJobPosting();

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
    createGroup.mutate({ name: newGroupName, description: newGroupDesc || undefined }, {
      onSuccess: () => { setNewGroupName(""); setNewGroupDesc(""); setCreateGroupOpen(false); toast({ title: t("careCircle.groupCreated", { group: site.careGroupSingular }) }); },
    });
  };

  const handleJoinByCode = () => {
    if (!joinCode.trim()) return;
    joinGroupByCode.mutate(joinCode, {
      onSuccess: () => { setJoinCode(""); setJoinCodeOpen(false); toast({ title: t("careCircle.joinedSuccess") }); },
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
          {isAdmin && <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)} title={t("careCircle.groupSettings")}><Settings className="h-4 w-4 mr-1" /> {isCN ? "群组设置" : "Group Settings"}</Button>}
          {canShowJoin && (
            <Dialog open={joinCodeOpen} onOpenChange={setJoinCodeOpen}>
              <DialogTrigger asChild><Button variant="outline" size="sm"><KeyRound className="h-4 w-4 mr-1" /> {t("careCircle.join")}</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t("careCircle.joinGroup")} {site.careGroupSingular}</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div><Label>{t("careCircle.joinCode")}</Label><Input value={joinCode} onChange={e => setJoinCode(e.target.value.trim())} placeholder={t("careCircle.joinCodePlaceholder")} /></div>
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
                <Button variant="coral" className="w-full" onClick={handleCreateGroup} disabled={createGroup.isPending || !newGroupName.trim()}>{t("common.create")} {site.careGroupSingular}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <GroupSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} activeGroup={activeGroup} activeGroupId={activeGroupId} isOwner={!!isOwner} updateGroup={updateGroup} deleteGroup={deleteGroup} onDeleteSuccess={() => setSelectedGroupId(null)} onLeaveGroup={handleLeaveGroup} />
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
        <div className="w-full pb-2">
          <TabsList className="flex w-full flex-wrap h-auto gap-1 mb-1 px-1 py-1">
            <TabsTrigger value="home" className="gap-1.5 text-xs"><Home className="h-3.5 w-3.5" /> <span className="max-w-[10rem] truncate">{activeGroup?.name || t("careCircle.home")}</span></TabsTrigger>
            <TabsTrigger value="calendar" className="gap-1.5 text-xs"><CalendarDays className="h-3.5 w-3.5" /> {t("careCircle.calendar")}</TabsTrigger>
            <TabsTrigger value="announcements" className="gap-1.5 text-xs"><Megaphone className="h-3.5 w-3.5" /> {t("careCircle.announcements")}</TabsTrigger>
            <TabsTrigger value="tasks" className="gap-1.5 text-xs"><ListTodo className="h-3.5 w-3.5" /> {t("careCircle.tasks")}</TabsTrigger>
            <TabsTrigger value="cared-ones" className="gap-1.5 text-xs"><Heart className="h-3.5 w-3.5" /> {isCN ? "群组被护理者" : `Group ${site.navLabels.caredOnes}`}</TabsTrigger>
            <TabsTrigger value="checkins" className="gap-1.5 text-xs"><ClipboardCheck className="h-3.5 w-3.5" /> {t("careCircle.checkIns")}</TabsTrigger>
            <TabsTrigger value="messages" className="gap-1.5 text-xs"><MessageSquare className="h-3.5 w-3.5" /> {t("messages.messages")}</TabsTrigger>
            <TabsTrigger value="wishes" className="gap-1.5 text-xs"><Star className="h-3.5 w-3.5" /> {t("careCircle.wellWishes")}</TabsTrigger>
            <TabsTrigger value="members" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" /> {t("careCircle.members")}</TabsTrigger>
            <TabsTrigger value="gallery" className="gap-1.5 text-xs"><Image className="h-3.5 w-3.5" /> {t("careCircle.gallery")}</TabsTrigger>
          </TabsList>
        </div>


        <TabsContent value="home" className="mt-4">
          <HomeTab statsLoading={membersLoading || tasksLoading} pendingTasksCount={pendingTasks.length} membersCount={(members || []).length} caredOnesCount={(groupCaredOnes || []).length} allPosts={allPostsWithAuthors} activeGroupId={activeGroupId} userId={profile?.id} isAdmin={!!isAdmin} memberCategories={memberCategories || []} members={members || []} createPost={createPost} onEditPost={setEditingPost} onTogglePin={handleTogglePin} onDeletePost={handleDeletePost} onNavigateTab={setActiveTab} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4"><CalendarTab tasks={tasks || []} /></TabsContent>
        <TabsContent value="announcements" className="mt-4"><AnnouncementsTab announcements={announcementsWithAuthors} announcementsLoading={announcementsLoading} activeGroupId={activeGroupId} userId={profile?.id} isAdmin={!!isAdmin} memberCategories={memberCategories || []} members={members || []} createPost={createPost} onEditPost={setEditingPost} onTogglePin={handleTogglePin} onDeletePost={handleDeletePost} /></TabsContent>
        <TabsContent value="tasks" className="mt-4"><TasksTab tasks={tasks || []} tasksLoading={tasksLoading} members={members || []} activeGroupId={activeGroupId} userId={profile?.id} isAdmin={!!isAdmin} memberCategories={memberCategories || []} createTask={createTask} updateTaskStatus={updateTaskStatus} deleteTask={deleteTask} createJob={createJob} /></TabsContent>
        <TabsContent value="cared-ones" className="mt-4"><CaredOnesTab groupCaredOnes={groupCaredOnes || []} isAdmin={!!isAdmin} onAddCaredOne={() => setAddCaredOneOpen(true)} /></TabsContent>
        <TabsContent value="checkins" className="mt-4"><CheckInsTab groupCaredOnes={groupCaredOnes || []} activeGroupId={activeGroupId} /></TabsContent>
        <TabsContent value="messages" className="mt-4"><MessagesTab groupMessages={groupMessages || []} userId={profile?.id} activeGroupId={activeGroupId} sendMessage={sendMessage} /></TabsContent>
        <TabsContent value="wishes" className="mt-4"><WishesTab wishes={wishesWithAuthors} wishesLoading={wishesLoading} activeGroupId={activeGroupId} userId={profile?.id} isAdmin={!!isAdmin} createPost={createPost} onEditPost={setEditingPost} onTogglePin={handleTogglePin} onDeletePost={handleDeletePost} /></TabsContent>
        <TabsContent value="members" className="mt-4"><MembersTab members={members || []} activeGroup={activeGroup} activeGroupId={activeGroupId} userId={profile?.id} isAdmin={!!isAdmin} isOwner={!!isOwner} currentMember={currentMember} pendingInvitations={pendingInvitations || []} memberCategories={memberCategories || []} inviteToGroup={inviteToGroup} updateRole={updateRole} removeMember={removeMember} cancelInvitation={cancelInvitation} createCategory={createCategory} deleteCategory={deleteCategory} /></TabsContent>
        <TabsContent value="gallery" className="mt-4"><GalleryTab gallery={gallery || []} activeGroupId={activeGroupId} /></TabsContent>
      </Tabs>
    </div>
  );
}
