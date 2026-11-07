import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as RequireAuth } from "./RequireAuth-DeCqG_0H.mjs";
import { t as SiteFeature } from "./SiteFeature-Dc7M6czo.mjs";
import { t as CareFacilityForm } from "./CareFacilityForm-BiKIaBU-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/new-BoqKhCUs.js
var import_jsx_runtime = require_jsx_runtime();
function RouteFacilitiesNewPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFeature, {
		name: "facilities",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CareFacilityForm, {}) })
	});
}
//#endregion
export { RouteFacilitiesNewPage as component };
