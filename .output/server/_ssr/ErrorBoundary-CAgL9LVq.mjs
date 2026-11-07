import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { _ as TriangleAlert } from "../_libs/lucide-react.mjs";
import { n as friendlyMessage, r as friendlyRetryLabel, t as friendlyErrorTitle } from "./use-toast-D8d_MLWg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ErrorBoundary-CAgL9LVq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ErrorBoundary = class extends import_react.Component {
	constructor(props) {
		super(props);
		this.state = {
			hasError: false,
			error: null
		};
	}
	static getDerivedStateFromError(error) {
		return {
			hasError: true,
			error
		};
	}
	componentDidCatch(error, errorInfo) {
		console.error("ErrorBoundary caught:", error, errorInfo);
	}
	render() {
		if (this.state.hasError) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-id": "components/ErrorBoundary/module/div/0",
			"data-inspector-source": "components/ErrorBoundary.tsx:33:9:15cdfa98292b3c94417425b7f804a42c1d2b9da4ca9e30bb55c64ff09ad02402:1",
			className: "flex flex-col items-center justify-center min-h-[40vh] gap-4 px-4 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					"data-inspector-id": "components/ErrorBoundary/module/AlertTriangle/0",
					"data-inspector-source": "components/ErrorBoundary.tsx:34:11:91d5a7f70806b5e40cd392cea2d8b715bbfb9fa436b00ff7e31c9ee3fcf55231:1",
					className: "h-12 w-12 text-destructive/60"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					"data-inspector-id": "components/ErrorBoundary/module/h1/68b3f43a9b9b/0",
					"data-inspector-source": "components/ErrorBoundary.tsx:35:11:1533169459dab91b64f8586f002ff5daa42e0748bf27030f8e7b656541b5d5bd:1",
					className: "text-lg font-semibold text-foreground",
					children: friendlyErrorTitle()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "components/ErrorBoundary/module/p/f3ac74bc4756/0",
					"data-inspector-source": "components/ErrorBoundary.tsx:36:11:9d3cd80b4559fd5dac96595c8265341d77cad23b0de74ddd690d72b022b1705c:1",
					className: "text-sm text-muted-foreground max-w-md",
					children: friendlyMessage(this.state.error)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					"data-inspector-id": "components/ErrorBoundary/module/Button/b278cea1ab6c/0",
					"data-inspector-source": "components/ErrorBoundary.tsx:39:11:47da7afe0ed7722377b8ff6b7acd0c92a749325efdb93d76a13647f443d0fa2f:1",
					variant: "outline",
					onClick: () => {
						this.setState({
							hasError: false,
							error: null
						});
						window.location.reload();
					},
					children: friendlyRetryLabel()
				})
			]
		});
		return this.props.children;
	}
};
//#endregion
export { ErrorBoundary as t };
