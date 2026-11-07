var e=`export function inboxCounts(
  notifications: readonly { is_read?: boolean }[] = [],
  conversations: readonly { unread_count?: unknown }[] = [],
) {
  const unreadNotifications = notifications.filter((n) => !n.is_read).length;
  // Conversation source exposes one unread flag per thread, not message volume.
  const unreadMessages = conversations.filter((c) => Number(c.unread_count) > 0).length;
  return {
    unreadNotifications,
    unreadMessages,
    unread: unreadNotifications + unreadMessages,
    total: notifications.length + conversations.length,
    read: notifications.length + conversations.length - unreadNotifications - unreadMessages,
  };
}`;export{e as default};