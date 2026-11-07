import { s as __toESM } from "../_runtime.mjs";
import { n as cn } from "./utils-CcHv9xqZ.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { an as EyeOff, in as Eye } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/password-input-_moxnRCs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PasswordInput = import_react.forwardRef(({ className, ...props }, ref) => {
	const [showPassword, setShowPassword] = import_react.useState(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "components/ui/password-input/PasswordInput/div/0",
		"data-inspector-source": "components/ui/password-input.tsx:10:7:36b3ec7cb76d89ac106a21ec524105b589fc9632bbe5c8744f38fbddfd87d49d:1",
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			"data-inspector-id": "components/ui/password-input/PasswordInput/input/0",
			"data-inspector-source": "components/ui/password-input.tsx:11:9:2347c48cc7d674b8aafe9d7f0292f073e1761629e180454d45eb08ab8b4c6600:1",
			type: showPassword ? "text" : "password",
			className: cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
			ref,
			...props
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			"data-inspector-id": "components/ui/password-input/PasswordInput/button/0f2141900b90/0",
			"data-inspector-source": "components/ui/password-input.tsx:20:9:531de094e543e84b931063f332398a1934478c8e89ae2777f66c01dc07111df8:1",
			type: "button",
			tabIndex: -1,
			className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
			onClick: () => setShowPassword((prev) => !prev),
			"aria-label": showPassword ? "Hide password" : "Show password",
			children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, {
				"data-inspector-id": "components/ui/password-input/PasswordInput/EyeOff/0",
				"data-inspector-source": "components/ui/password-input.tsx:28:13:476d5aa184b7275247df4a682ce196ebc0ae94add1c79bcc19e0de0367d33d5c:1",
				className: "h-4 w-4"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {
				"data-inspector-id": "components/ui/password-input/PasswordInput/Eye/0",
				"data-inspector-source": "components/ui/password-input.tsx:30:13:4d189784d6653bb9f850b52ad2e4b8af1e14895a1b0c145ef8a8be2473ee50d2:1",
				className: "h-4 w-4"
			})
		})]
	});
});
PasswordInput.displayName = "PasswordInput";
//#endregion
export { PasswordInput as t };
