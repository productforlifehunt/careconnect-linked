import { s as __toESM } from "../_runtime.mjs";
import { n as cn } from "./utils-CcHv9xqZ.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/card-Cz5iPbNd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Card = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	"data-inspector-source": "components/ui/card.tsx:6:3:ad25ca00aad5cb24571fb20f0f1c2621cdfa5b4f5a3a2dd5d80fab3f1346fb07:1",
	ref,
	className: cn("rounded-lg border bg-card text-card-foreground shadow-xs", className),
	...props
}));
Card.displayName = "Card";
var CardHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	"data-inspector-source": "components/ui/card.tsx:12:5:8563b24c5af46f9c3845d49102ebd3689c742355be06208dd12cf05c9b635812:1",
	ref,
	className: cn("flex flex-col space-y-1.5 p-6", className),
	...props
}));
CardHeader.displayName = "CardHeader";
var CardTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
	"data-inspector-source": "components/ui/card.tsx:19:5:61df07e2db0e408317e90d65e480d47147d4a4f0c9fc51137b1e627a088fb31d:1",
	ref,
	className: cn("text-2xl font-semibold leading-none tracking-tight", className),
	...props
}));
CardTitle.displayName = "CardTitle";
var CardDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
	"data-inspector-source": "components/ui/card.tsx:26:5:8d05000a4a939d7efc8a4a2d1f1d7da07a725d0b7cdd7479fd204fa871aca6c8:1",
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
CardDescription.displayName = "CardDescription";
var CardContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	"data-inspector-source": "components/ui/card.tsx:32:37:bfa7f117b5e03406bfdf2f0789bf021fb1d5f87093592ca6a1ab1ebeeb16ecb7:1",
	ref,
	className: cn("p-6 pt-0", className),
	...props
}));
CardContent.displayName = "CardContent";
var CardFooter = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	"data-inspector-source": "components/ui/card.tsx:38:5:49a92b7582b2f2c931a23c4daa6b3e0da929422e9ad11b5f95e802fd0069053f:1",
	ref,
	className: cn("flex items-center p-6 pt-0", className),
	...props
}));
CardFooter.displayName = "CardFooter";
//#endregion
export { CardTitle as a, CardHeader as i, CardContent as n, CardDescription as r, Card as t };
