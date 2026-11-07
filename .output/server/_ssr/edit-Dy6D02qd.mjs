import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as RequireAuth } from "./RequireAuth-CXvd5_cn.mjs";
import { t as SiteFeature } from "./SiteFeature-CQrN1JWZ.mjs";
import { t as CareFacilityForm } from "./CareFacilityForm-rVG4aang.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/edit-Dy6D02qd.js
var import_jsx_runtime = require_jsx_runtime();
function RouteFacilitiesIdEditPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFeature, {
		name: "facilities",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CareFacilityForm, {}) })
	});
}
//#endregion
export { RouteFacilitiesIdEditPage as component };
