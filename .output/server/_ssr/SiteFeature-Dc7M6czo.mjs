import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
import { t as NotFound } from "./NotFound-BdCBu4WI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SiteFeature-Dc7M6czo.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Release builds (beta / public) are a strict subset of the internal build:
* pages for a feature the running release drops show "not found", so no
* direct URL can reach them.
*/
function SiteFeature({ name, children }) {
	const { features } = useSite();
	if (!features[name]) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotFound, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
//#endregion
export { SiteFeature as t };
