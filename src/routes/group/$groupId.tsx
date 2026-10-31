import { createFileRoute, redirect } from "@tanstack/react-router";

/** Older shared address: forwards to the group's one page, /care-circle/<id>. */
export const Route = createFileRoute("/group/$groupId")({
  beforeLoad: ({ params, location }) => {
    const id = String(params.groupId || "").replace(/\D/g, "");
    const search = location.searchStr ? (location.searchStr.startsWith("?") ? location.searchStr : `?${location.searchStr}`) : "";
    throw redirect({ href: id ? `/care-circle/${id}${search}` : "/care-circle", replace: true });
  },
});
