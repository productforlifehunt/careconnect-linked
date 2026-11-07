//#region node_modules/.nitro/vite/services/ssr/assets/wp-session-middleware-BmhshzC4.js
var wp_session_middleware_default = "import { createMiddleware } from \"@tanstack/react-start\";\n\n/** WordPress owns app identity; attach its token, never a Cloud-auth identity. */\nexport const attachWordPressSession = createMiddleware({ type: \"function\" }).client(async ({ next }) => {\n  const token = window.localStorage.getItem(\"cc_wp_token\");\n  return next({ headers: token ? { \"X-WP-Token\": token } : {} });\n});";
//#endregion
export { wp_session_middleware_default as default };
