import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as RequireAuth } from "./RequireAuth-ZXtI8ZPo.mjs";
import { t as SiteFeature } from "./SiteFeature-Diz6swln.mjs";
import { t as CareFacilityForm } from "./CareFacilityForm-B0bCQ-i8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/new-DI3Rcvgx.js
var import_jsx_runtime = require_jsx_runtime();
function RouteFacilitiesNewPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFeature, {
		"data-inspector-id": "routes/facilities/new/RouteFacilitiesNewPage/SiteFeature/0",
		"data-inspector-source": "routes/facilities/new.tsx:5:10:15ef1a0a73331b4382f164d350c4fdd8d7882198842431663d0fddddb711886d:1",
		name: "facilities",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, {
			"data-inspector-id": "routes/facilities/new/RouteFacilitiesNewPage/RequireAuth/0",
			"data-inspector-source": "routes/facilities/new.tsx:5:41:15ef1a0a73331b4382f164d350c4fdd8d7882198842431663d0fddddb711886d:1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CareFacilityForm, {
				"data-inspector-id": "routes/facilities/new/RouteFacilitiesNewPage/CareFacilityForm/0",
				"data-inspector-source": "routes/facilities/new.tsx:5:54:15ef1a0a73331b4382f164d350c4fdd8d7882198842431663d0fddddb711886d:1"
			})
		})
	});
}
//#endregion
export { RouteFacilitiesNewPage as component };
