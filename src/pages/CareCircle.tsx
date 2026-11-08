import { getStoredWPUser } from "@/services/wp-auth";
import { Suspense, useState, useMemo, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams, useLocation } from "@/lib/router-compat";
import { parseCareGroupLink, groupIdFromPath } from "@/features/care-groups/join-link";
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
  useUpdateCareGroup, useDeleteCareGroup,
  useGroupInvitations, useCancelInvitation,
  useMemberCategories, useCreateMemberCategory, useDeleteMemberCategory,
  useDeleteTask, useLeaveGroup, useShareTask,
} from "@/hooks/use-care-data";
import { useSite } from "@/contexts/SiteContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { lazyRetry } from "@/lib/lazy-retry";

// Sub-components
import { GroupTabsBar } from "@/components/care-circle/GroupTabsBar";
const GroupOnboarding = lazyRetry(
  () => import("@/components/care-circle/GroupOnboarding").then((m) => ({ default: m.GroupOnboarding })),
  "CareCircleGroupOnboarding",
);
const JoinRequestPanel = lazyRetry(
  () => import("@/components/care-circle/GroupOnboarding").then((m) => ({ default: m.JoinRequestPanel })),
  "CareCircleJoinRequestPanel",
);
const EditPostDialog = lazyRetry(
  () => import("@/components/care-circle/GroupDialogs").then((m) => ({ default: m.EditPostDialog })),
  "CareCircleEditPostDialog",
);
const AddCaredOneDialog = lazyRetry(
  () => import("@/components/care-circle/GroupDialogs").then((m) => ({ default: m.AddCaredOneDialog })),
  "CareCircleAddCaredOneDialog",
);
const HomeTab = lazyRetry(
  () => import("@/components/care-circle/tabs/HomeTab").then((m) => ({ default: m.HomeTab })),
  "CareCircleHomeTab",
);
const CalendarTab = lazyRetry(
  () => import("@/components/care-circle/tabs/CalendarTab").then((m) => ({ default: m.CalendarTab })),
  "CareCircleCalendarTab",
);
const AnnouncementsTab = lazyRetry(
  () => import("@/components/care-circle/tabs/AnnouncementsTab").then((m) => ({ default: m.AnnouncementsTab })),
  "CareCircleAnnouncementsTab",
);
const TasksTab = lazyRetry(
  () => import("@/components/care-circle/tabs/TasksTab").then((m) => ({ default: m.TasksTab })),
  "CareCircleTasksTab",
);
const CaredOnesTab = lazyRetry(
  () => import("@/components/care-circle/tabs/CaredOnesTab").then((m) => ({ default: m.CaredOnesTab })),
  "CareCircleCaredOnesTab",
);
const MessagesTab = lazyRetry(
  () => import("@/components/care-circle/tabs/MessagesTab").then((m) => ({ default: m.MessagesTab })),
  "CareCircleMessagesTab",
);
const WishesTab = lazyRetry(
  () => import("@/components/care-circle/tabs/WishesTab").then((m) => ({ default: m.WishesTab })),
  "CareCircleWishesTab",
);
const MembersTab = lazyRetry(
  () => import("@/components/care-circle/tabs/MembersTab").then((m) => ({ default: m.MembersTab })),
  "CareCircleMembersTab",
);
const GalleryTab = lazyRetry(
  () => import("@/components/care-circle/tabs/GalleryTab").then((m) => ({ default: m.GalleryTab })),
  "CareCircleGalleryTab",
);
const InviteMembersTab = lazyRetry(
  () => import("@/components/care-circle/tabs/InviteMembersTab").then((m) => ({ default: m.InviteMembersTab })),
  "CareCircleInviteMembersTab",
);
const MemberGroupsTab = lazyRetry(
  () => import("@/components/care-circle/tabs/MemberGroupsTab").then((m) => ({ default: m.MemberGroupsTab })),
  "CareCircleMemberGroupsTab",
);
const GroupLocationTab = lazyRetry(
  () => import("@/components/care-circle/tabs/GroupLocationTab").then((m) => ({ default: m.GroupLocationTab })),
  "CareCircleLocationTab",
);
const GroupSettingsTab = lazyRetry(
  () => import("@/components/care-circle/tabs/GroupSettingsTab").then((m) => ({ default: m.GroupSettingsTab })),
  "CareCircleSettingsTab",
);
const GroupHelpTab = lazyRetry(
  () => import("@/components/care-circle/tabs/GroupHelpTab").then((m) => ({ default: m.GroupHelpTab })),
  "CareCircleHelpTab",
);


export default function CareCircle() {
  const { t, i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const { toast } = useToast();
  const site = useSite();
  const qc = useQueryClient();
  const { data: groups, isLoading: groupsLoading, isFetching: groupsFetching } = useCareGroups();
  const createGroup = useCreateCareGroup();
  const navigate = useNavigate();
  const location = useLocation();
  /**
   * One page per group: /care-circle/<id> (NotchSafety: /circle/<id>). It is
   * also the link the group shares — members see the group, everyone else
   * sees the group onboarding right here. Older ?group=<id> links forward.
   */
  const base = location.pathname.startsWith("/circle") ? "/circle" : "/care-circle";
  const groupHref = useCallback((id: string | number) => `${base}/${String(id).replace(/^wp-/, "")}`, [base]);
  const [searchParams, setSearchParams] = useSearchParams();
  const pathGroup = groupIdFromPath(location.pathname);
  // The router may hand numbers back JSON-quoted ("27"); keep digits only.
  const legacyGroup = (searchParams.get("group") || "").replace(/\D/g, "") || null;
  const requesterId = (searchParams.get("request") || "").replace(/\D/g, "") || null;
  const inviteToken = (searchParams.get("invite") || "").replace(/"/g, "").trim() || null;
  const urlTab = (searchParams.get("tab") || "").replace(/"/g, "") || null;
  const [activeTab, setActiveTab] = useState(urlTab || "home");
  useEffect(() => { if (urlTab) setActiveTab(urlTab); }, [urlTab]);
  const dropParam = useCallback((key: string) => {
    setSearchParams((prev) => { const next = new URLSearchParams(prev); next.delete(key); return next; }, { replace: true });
  }, [setSearchParams]);

  // Without a group in the address, open the old ?group= one or the first of
  // mine, so the address always names the group on screen.
  useEffect(() => {
    // Only on the bare list address: while leaving for another page this
    // component can still see the new address and must not pull it back.
    const bare = location.pathname.replace(/\/+$/, "");
    if (bare !== base) return;
    if (typeof window !== "undefined" && window.location.pathname.replace(/\/+$/, "") !== base) return;
    if (pathGroup || groupsLoading) return;
    const target = legacyGroup || (!groupsFetching ? groups?.[0]?.id : null);
    if (!target) return;
    const rest = new URLSearchParams(searchParams);
    rest.delete("group");
    const qs = rest.toString();
    navigate(`${groupHref(target)}${qs ? `?${qs}` : ""}`, { replace: true });
  }, [pathGroup, legacyGroup, groupsLoading, groupsFetching, groups, searchParams, groupHref, navigate, location.pathname, base]);

  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [joinCodeOpen, setJoinCodeOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupMyName, setNewGroupMyName] = useState("");
  const [editingPost, setEditingPost] = useState<any>(null);
  const [addCaredOneOpen, setAddCaredOneOpen] = useState(false);

  const idOf = (v: any) => String(v ?? "").replace(/^wp-/, "");
  const urlGroup = pathGroup || legacyGroup;
  const myUrlGroup = urlGroup ? (groups || []).find((g: any) => idOf(g.id) === urlGroup) : undefined;
  // A group I'm not in (yet): show its onboarding instead of its content.
  const showOnboarding = !!pathGroup && !myUrlGroup && !groupsLoading;
  const activeGroupId: string | null = myUrlGroup ? myUrlGroup.id : (!urlGroup && groups && groups.length > 0 ? groups[0]!.id : null);
  const activeGroup = (groups || []).find((g: any) => g.id === activeGroupId);

  // Load data for the visible group tab only. Mounting every tab's query here
  // caused a large burst of unrelated WordPress reads when entering Care Teams.
  const isHomeTab = activeTab === "home";
  const needsTasks =
    isHomeTab || activeTab === "calendar" || activeTab === "tasks";
  const needsMemberCategories =
    isHomeTab ||
    ["tasks", "announcements", "wishes", "member-groups"].includes(activeTab);
  // The roster supplies the user's accepted relationship role used to gate
  // admin controls on every tab, so it remains a page-level permission read.
  const membersGroupId = activeGroupId;
  const tasksGroupId = needsTasks ? activeGroupId : null;
  const memberCategoriesGroupId = needsMemberCategories ? activeGroupId : null;
  const caredOnesGroupId =
    activeTab === "location" || activeTab === "cared-ones"
      ? activeGroupId
      : null;
  const postsGroupId = isHomeTab ? activeGroupId : null;
  const announcementsGroupId =
    activeTab === "announcements" ? activeGroupId : null;
  const wishesGroupId = activeTab === "wishes" ? activeGroupId : null;
  const galleryGroupId = activeTab === "gallery" ? activeGroupId : null;
  const messagesGroupId = activeTab === "messages" ? activeGroupId : null;
  const invitationsGroupId = activeTab === "invite" ? activeGroupId : null;

  const { data: members, isLoading: membersLoadingRaw } =
    useCareGroupMembers(membersGroupId);
  const membersLoading = !!membersGroupId && membersLoadingRaw;
  const { data: tasks, isLoading: tasksLoadingRaw } =
    // A missing groupId means "all of my tasks" in dashboard consumers.
    // Care Teams must wait until an accepted group is selected, or this page
    // starts an unrelated multi-relation task read while its groups load.
    useCareTasks(tasksGroupId, !!tasksGroupId);
  // Disabled react-query queries stay `isLoading` forever — only treat them as
  // loading when a group is actually selected, otherwise skeletons never clear.
  const tasksLoading = !!tasksGroupId && tasksLoadingRaw;
  const { data: allPosts } = useCareGroupPosts(postsGroupId);
  const { data: announcements, isLoading: announcementsLoading } =
    useCareGroupPosts(announcementsGroupId, "announcement");
  const { data: wishes, isLoading: wishesLoading } = useCareGroupPosts(
    wishesGroupId,
    "wish",
  );
  const { data: gallery, isLoading: galleryLoadingRaw } =
    useCareGroupGallery(galleryGroupId);
  const galleryLoading = !!galleryGroupId && galleryLoadingRaw;
  const { data: groupCaredOnes, isLoading: groupCaredOnesLoadingRaw } =
    useGroupCaredOnes(caredOnesGroupId);
  const groupCaredOnesLoading = !!caredOnesGroupId && groupCaredOnesLoadingRaw;
  const { data: groupMessages, isLoading: groupMessagesLoadingRaw } =
    useGroupMessages(messagesGroupId);
  const groupMessagesLoading = !!messagesGroupId && groupMessagesLoadingRaw;
  const { data: pendingInvitations, isLoading: invitationsLoadingRaw } =
    useGroupInvitations(invitationsGroupId);
  const invitationsLoading = !!invitationsGroupId && invitationsLoadingRaw;
  const { data: memberCategories, isLoading: memberCategoriesLoadingRaw } =
    useMemberCategories(memberCategoriesGroupId);
  const memberCategoriesLoading =
    !!memberCategoriesGroupId && memberCategoriesLoadingRaw;
  const tabLoading = (
    <div
      className="flex justify-center py-12"
      role="status"
      aria-label={t("common.loading", "Loading")}
    >
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

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
  // Group chat senders get the same in-group display name as post authors (REL 223 member name).
  const messagesWithSenders = useMemo(() => {
    const byId = new Map<string, any>((members || []).map((m: any) => [String(m.id), m]));
    return (groupMessages || []).map((msg: any) => {
      const m = byId.get(String(msg.sender_user_id || msg.sender_id || "").replace(/^wp-/, ""));
      return m ? { ...msg, sender: { full_name: m.display_name || null, avatar_url: m.profile?.avatar_url || null } } : msg;
    });
  }, [members, groupMessages]);


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

  // The logged-in WordPress account id is the identity on Rel 223; profile CCT
  // ids can be unrelated row ids and are not needed on this page.
  const currentUserId = String(getStoredWPUser()?.user_id || "").replace(/^wp-/, "");
  const currentMember = (members || []).find((m: any) => {
    const memberUserId = String(m.user_id || m.id || "").replace(/^wp-/, "");
    return currentUserId && memberUserId === currentUserId;
  });
  const isAdmin = currentMember?.is_owner || currentMember?.is_admin;
  const isOwner = currentMember?.is_owner;
  const pendingTasks = (tasks || []).filter((t: any) => t.status !== "completed");
  const caredOnesCount = (members || []).filter(
    (member: any) => member.is_cared_one,
  ).length;

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    createGroup.mutate({ name: newGroupName, description: newGroupDesc || undefined, displayName: newGroupMyName || undefined }, {
      onSuccess: () => { setNewGroupName(""); setNewGroupDesc(""); setNewGroupMyName(""); setCreateGroupOpen(false); toast({ title: t("careCircle.groupCreated", { group: site.careGroupSingular }) }); },
    });
  };

  // The box only opens the link someone sent; joining happens on that group's page.
  const handleJoinByCode = () => {
    const text = joinCode.trim();
    if (!text) return;
    const linkedGroupId = parseCareGroupLink(text);
    const oldInvite = text.match(/\/join\/([^/?#\s]+)/)?.[1];
    if (!linkedGroupId && !oldInvite) {
      toast({
        title: t("careCircle.failedToJoin"),
        description: isCN ? "请粘贴对方发给您的完整群组链接。" : "Please paste the full group link you were sent.",
        variant: "destructive",
      });
      return;
    }
    setJoinCodeOpen(false); setJoinCode("");
    navigate(linkedGroupId ? groupHref(linkedGroupId) : `/join/${oldInvite}`);
  };

  const handleLeaveGroup = () => {
    if (!activeGroupId || !currentUserId) return;
    leaveGroup.mutate(activeGroupId, {
      onSuccess: () => { navigate(base, { replace: true }); toast({ title: t("careCircle.leftGroup") }); },
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

  if (groupsLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            {site.navLabels.careGroups}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("careCircle.coordinateCare")}
          </p>
        </div>
        <div
          className="flex items-center justify-center gap-2 rounded-xl border py-16 text-sm text-muted-foreground"
          role="status"
          aria-label={t("common.loading", "Loading")}
        >
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{isCN ? "正在加载护理团队…" : "Loading your care teams…"}</span>
        </div>
      </div>
    );
  }

  const joinDialogBody = (
    <div className="space-y-4 mt-2">
      <div>
        <Label htmlFor="care-group-link-input">{isCN ? "群组链接" : "Group link"}</Label>
        <Input id="care-group-link-input" value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder={isCN ? "粘贴别人发给您的群组链接" : "Paste the group link you were sent"} />
        <p className="text-xs text-muted-foreground mt-1">{isCN ? "打开后会看到这个群组，在那里填名字、输入加入码或申请加入。" : "It opens that group, where you enter your name and the join code, or ask to join."}</p>
      </div>
      <Button variant="coral" className="w-full" onClick={handleJoinByCode} disabled={!joinCode.trim()}>{isCN ? "打开群组" : "Open group"}</Button>
    </div>
  );

  const groupChips = groups && groups.length > 0 ? (
    <div className="mb-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
        {isCN ? `我加入的${site.navLabels.careGroups}` : `My Joined ${site.navLabels.careGroups}`}
      </p>
      <div className="flex gap-2 flex-wrap">
        {groups.map((g: any) => (<Badge key={g.id} variant={activeGroupId === g.id ? "default" : "outline"} className="cursor-pointer whitespace-nowrap" onClick={() => navigate(groupHref(g.id))}>{g.name}</Badge>))}
      </div>
    </div>
  ) : null;

  if (showOnboarding && pathGroup) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{site.navLabels.careGroups}</h1>
        </div>
        {groupChips}
        <Suspense fallback={tabLoading}>
          <GroupOnboarding key={pathGroup} groupId={pathGroup} inviteToken={inviteToken} onClearInvite={() => dropParam("invite")} />
        </Suspense>
      </div>
    );
  }

  if (!pathGroup && urlGroup) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

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
                <div><Label>{isCN ? "我在此群组的显示名" : "My name in this group"}</Label><Input value={newGroupMyName} onChange={e => setNewGroupMyName(e.target.value)} placeholder={isCN ? "例如：大女儿 小丽" : "e.g. Lily (daughter)"} /></div>
                <Button variant="coral" className="w-full" onClick={handleCreateGroup} disabled={createGroup.isPending || !newGroupName.trim()}>{t("common.create")} {site.careGroupSingular}</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={joinCodeOpen} onOpenChange={setJoinCodeOpen}>
            <DialogTrigger asChild><Button variant="outline"><KeyRound className="h-4 w-4 mr-2" /> {t("careCircle.joinWithCode")}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("careCircle.joinGroup")} {site.careGroupSingular}</DialogTitle></DialogHeader>
              {joinDialogBody}
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
          <Dialog open={joinCodeOpen} onOpenChange={setJoinCodeOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><KeyRound className="h-4 w-4 mr-1" /> {t("careCircle.join")}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("careCircle.joinGroup")} {site.careGroupSingular}</DialogTitle></DialogHeader>
              {joinDialogBody}
            </DialogContent>
          </Dialog>
          <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> {t("careCircle.newGroup")}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("common.create")} {site.careGroupSingular}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div><Label>{t("careCircle.groupName")} *</Label><Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder={site.family === "challenged" ? "e.g. Dad's Dementia Team" : "e.g. Mom's Care Team"} /></div>
                <div><Label>{t("common.description")}</Label><Textarea value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder={t("careCircle.groupDesc")} /></div>
                <div><Label>{isCN ? "我在此群组的显示名" : "My name in this group"}</Label><Input value={newGroupMyName} onChange={e => setNewGroupMyName(e.target.value)} placeholder={isCN ? "例如：大女儿 小丽" : "e.g. Lily (daughter)"} /></div>
                <Button variant="coral" className="w-full" onClick={handleCreateGroup} disabled={createGroup.isPending || !newGroupName.trim()}>{t("common.create")} {site.careGroupSingular}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {editingPost && (
        <Suspense fallback={null}>
          <EditPostDialog post={editingPost} onClose={() => setEditingPost(null)} updatePost={updatePost} />
        </Suspense>
      )}
      {addCaredOneOpen && (
        <Suspense fallback={null}>
          <AddCaredOneDialog open={addCaredOneOpen} onOpenChange={setAddCaredOneOpen} activeGroupId={activeGroupId} />
        </Suspense>
      )}

      {groupChips}

      {requesterId && isAdmin && activeGroupId && (
        <Suspense fallback={null}>
          <JoinRequestPanel groupId={idOf(activeGroupId)} groupName={activeGroup?.name || ""} requesterId={requesterId} onDone={() => dropParam("request")} />
        </Suspense>
      )}

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
          <Suspense fallback={tabLoading}>
            <HomeTab
              statsLoading={membersLoading || tasksLoading}
              pendingTasksCount={pendingTasks.length}
              membersCount={(members || []).length}
              caredOnesCount={caredOnesCount}
              allPosts={allPostsWithAuthors}
              activeGroupId={activeGroupId}
              userId={currentUserId}
              isAdmin={!!isAdmin}
              memberCategories={memberCategories || []}
              members={members || []}
              createPost={createPost}
              onEditPost={setEditingPost}
              onTogglePin={handleTogglePin}
              onDeletePost={handleDeletePost}
              onNavigateTab={setActiveTab}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          {tasksLoading ? tabLoading : <Suspense fallback={tabLoading}><CalendarTab tasks={tasks || []} /></Suspense>}
        </TabsContent>
        <TabsContent value="tasks" className="mt-4">
          <Suspense fallback={tabLoading}>
            <TasksTab tasks={tasks || []} tasksLoading={tasksLoading} members={members || []} activeGroupId={activeGroupId} userId={currentUserId} isAdmin={!!isAdmin} memberCategories={memberCategories || []} createTask={createTask} updateTaskStatus={updateTaskStatus} deleteTask={deleteTask} shareTask={shareTask} />
          </Suspense>
        </TabsContent>
        <TabsContent value="location" className="mt-4">
          {groupCaredOnesLoading ? (
            tabLoading
          ) : (
            <Suspense fallback={tabLoading}>
              <GroupLocationTab groupCaredOnes={groupCaredOnes || []} />
            </Suspense>
          )}
        </TabsContent>
        <TabsContent value="messages" className="mt-4">
          {groupMessagesLoading ? (
            tabLoading
          ) : (
            <Suspense fallback={tabLoading}>
              <MessagesTab
                groupMessages={messagesWithSenders}
                userId={currentUserId}
                activeGroupId={activeGroupId}
                sendMessage={sendMessage}
              />
            </Suspense>
          )}
        </TabsContent>
        <TabsContent value="announcements" className="mt-4">
          <Suspense fallback={tabLoading}>
            <AnnouncementsTab announcements={announcementsWithAuthors} announcementsLoading={announcementsLoading} activeGroupId={activeGroupId} userId={currentUserId} isAdmin={!!isAdmin} memberCategories={memberCategories || []} members={members || []} createPost={createPost} onEditPost={setEditingPost} onTogglePin={handleTogglePin} onDeletePost={handleDeletePost} />
          </Suspense>
        </TabsContent>
        <TabsContent value="wishes" className="mt-4">
          <Suspense fallback={tabLoading}>
            <WishesTab wishes={wishesWithAuthors} wishesLoading={wishesLoading} activeGroupId={activeGroupId} userId={currentUserId} isAdmin={!!isAdmin} memberCategories={memberCategories || []} members={members || []} createPost={createPost} onEditPost={setEditingPost} onTogglePin={handleTogglePin} onDeletePost={handleDeletePost} />
          </Suspense>
        </TabsContent>
        <TabsContent value="gallery" className="mt-4">
          {galleryLoading ? (
            tabLoading
          ) : (
            <Suspense fallback={tabLoading}>
              <GalleryTab gallery={gallery || []} activeGroupId={activeGroupId} />
            </Suspense>
          )}
        </TabsContent>
        <TabsContent value="cared-ones" className="mt-4">
          {groupCaredOnesLoading || membersLoading ? (
            tabLoading
          ) : (
            <Suspense fallback={tabLoading}>
              <CaredOnesTab
                groupCaredOnes={groupCaredOnes || []}
                isAdmin={!!(isAdmin || currentMember)}
                onAddCaredOne={() => setAddCaredOneOpen(true)}
              />
            </Suspense>
          )}
        </TabsContent>
        <TabsContent value="members" className="mt-4">
          <Suspense fallback={tabLoading}>
            <MembersTab members={members || []} membersLoading={membersLoading} activeGroupId={activeGroupId} userId={currentUserId} isAdmin={!!isAdmin} isOwner={!!isOwner} currentMember={currentMember} updateRole={updateRole} removeMember={removeMember} />
          </Suspense>
        </TabsContent>
        <TabsContent value="invite" className="mt-4">
          {invitationsLoading || membersLoading ? (
            tabLoading
          ) : (
            <Suspense fallback={tabLoading}>
              <InviteMembersTab
                members={members || []}
                activeGroupId={activeGroupId}
                isAdmin={!!isAdmin}
                pendingInvitations={pendingInvitations || []}
                inviteToGroup={inviteToGroup}
                cancelInvitation={cancelInvitation}
              />
            </Suspense>
          )}
        </TabsContent>
        <TabsContent value="member-groups" className="mt-4">
          {memberCategoriesLoading || membersLoading ? (
            tabLoading
          ) : (
            <Suspense fallback={tabLoading}>
              <MemberGroupsTab
                members={members || []}
                memberCategories={memberCategories || []}
                activeGroupId={activeGroupId}
                userId={currentUserId}
                isAdmin={!!isAdmin}
                createCategory={createCategory}
                deleteCategory={deleteCategory}
              />
            </Suspense>
          )}
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <Suspense fallback={tabLoading}>
            <GroupSettingsTab activeGroup={activeGroup} activeGroupId={activeGroupId} isAdmin={!!isAdmin} isOwner={!!isOwner} myDisplayName={currentMember?.display_name || ""} updateGroup={updateGroup} deleteGroup={deleteGroup} onDeleteSuccess={() => { navigate(base, { replace: true }); setActiveTab("home"); }} onLeaveGroup={handleLeaveGroup} />
          </Suspense>
        </TabsContent>
        <TabsContent value="help" className="mt-4">
          <Suspense fallback={tabLoading}>
            <GroupHelpTab groupName={activeGroup?.name} groupId={activeGroup?.id ? String(activeGroup.id) : undefined} />
          </Suspense>
        </TabsContent>
      </Tabs>

    </div>
  );
}
