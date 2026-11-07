var e=`import { createMiddleware } from "@tanstack/react-start";

/** WordPress owns app identity; attach its token, never a Cloud-auth identity. */
export const attachWordPressSession = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const token = window.localStorage.getItem("cc_wp_token");
  return next({ headers: token ? { "X-WP-Token": token } : {} });
});`;export{e as default};