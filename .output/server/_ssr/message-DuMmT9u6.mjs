import { s as __toESM } from "../_runtime.mjs";
import { n as Ui } from "../_libs/streamdown+[...].mjs";
import { n as cn } from "./utils-CcHv9xqZ.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as B } from "../_libs/@streamdown/cjk+[...].mjs";
import { t as G } from "../_libs/shiki+streamdown__code.mjs";
import { t as h } from "../_libs/@streamdown/math+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/message-DuMmT9u6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Message = ({ className, from, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	"data-inspector-id": "components/ai-elements/message/Message/div/0",
	"data-inspector-source": "components/ai-elements/message.tsx:38:3:3fbe75bfc5505fc00e553f787bb249524fa16d3fbfca048c6cd623d8a51d5619:1",
	className: cn("group flex w-full max-w-[95%] flex-col gap-2", from === "user" ? "is-user ml-auto justify-end" : "is-assistant", className),
	...props
});
var MessageContent = ({ children, className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	"data-inspector-id": "components/ai-elements/message/MessageContent/div/0",
	"data-inspector-source": "components/ai-elements/message.tsx:55:3:3fbe75bfc5505fc00e553f787bb249524fa16d3fbfca048c6cd623d8a51d5619:1",
	className: cn("is-user:dark flex w-fit min-w-0 max-w-full flex-col gap-2 overflow-hidden text-sm", "group-[.is-user]:ml-auto group-[.is-user]:rounded-lg group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground", "group-[.is-assistant]:text-foreground", className),
	...props,
	children
});
(0, import_react.createContext)(null);
var streamdownPlugins = {
	cjk: B,
	code: G,
	math: h,
	mermaid: {
		name: "mermaid",
		type: "diagram",
		language: "mermaid",
		getMermaid(initialConfig) {
			let config = initialConfig;
			return {
				initialize(nextConfig) {
					config = nextConfig;
				},
				async render(id, source) {
					const { createMermaidPlugin } = await import("../_libs/_360.mjs");
					return createMermaidPlugin().getMermaid(config).render(id, source);
				}
			};
		}
	}
};
var MessageResponse = (0, import_react.memo)(({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ui, {
	"data-inspector-id": "components/ai-elements/message/MessageResponse/Streamdown/0",
	"data-inspector-source": "components/ai-elements/message.tsx:348:5:f8dc993478c0c94cadda773b82ab9be7efdab567b796d0d17d472c103a76fef8:1",
	className: cn("size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className),
	plugins: streamdownPlugins,
	...props
}), (prevProps, nextProps) => prevProps.children === nextProps.children && nextProps.isAnimating === prevProps.isAnimating);
MessageResponse.displayName = "MessageResponse";
//#endregion
export { MessageContent as n, MessageResponse as r, Message as t };
