import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { Zn as ArrowLeft, en as Globe } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { C as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { b as runSettingSkill, r as LANGUAGES$1 } from "./ai-dynamic-knowledge-C5tnjGCy.mjs";
import { a as DropdownMenuTrigger, n as DropdownMenuContent, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-DwzEkV7i.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PageBackButton-B4jLOjc0.js
var import_jsx_runtime = require_jsx_runtime();
var LANGUAGES = LANGUAGES$1;
function LanguageSwitcher() {
	const { t, i18n } = useTranslation();
	const currentLang = i18n.language;
	const selectLanguage = (code) => {
		runSettingSkill("set-language", code);
		i18n.changeLanguage(code);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		"data-inspector-id": "components/LanguageSwitcher/LanguageSwitcher/DropdownMenuTrigger/0",
		"data-inspector-source": "components/LanguageSwitcher.tsx:27:7:b84fb8808c63b3f9d82a70e024e498baac61a3dc439acf376a6cea11f6698435:1",
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			"data-inspector-id": "components/LanguageSwitcher/LanguageSwitcher/Button/0",
			"data-inspector-source": "components/LanguageSwitcher.tsx:28:9:15aebd750108368c823a137ee104c137f0161a81c5e357b34e3685d48b28eba8:1",
			variant: "ghost",
			size: "sm",
			className: "gap-1.5 px-2 text-muted-foreground hover:text-foreground",
			title: t("language.label"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-4 w-4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"data-inspector-id": "components/LanguageSwitcher/LanguageSwitcher/span/0",
					"data-inspector-source": "components/LanguageSwitcher.tsx:30:11:1737399898cf98ef9ad3675894782d39435e01f2d62e618f9b3e2c792e2b2087:1",
					className: "text-xs font-medium uppercase leading-none",
					children: (currentLang || "en").split("-")[0]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"data-inspector-id": "components/LanguageSwitcher/LanguageSwitcher/span/1",
					"data-inspector-source": "components/LanguageSwitcher.tsx:31:11:820d095d2ac26a7820414556c5e7eb92ee15f7c4fd08ddbcaa7f2c8f75386bbb:1",
					className: "sr-only",
					children: t("language.label")
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
		"data-inspector-id": "components/LanguageSwitcher/LanguageSwitcher/DropdownMenuContent/0",
		"data-inspector-source": "components/LanguageSwitcher.tsx:34:7:296ec7e92bb2e580aee6e0ff078fa1326cd4ca5c4b640dc25b6426389cc28a19:1",
		align: "end",
		className: "max-h-80 overflow-y-auto bg-card border shadow-lg z-[60]",
		children: LANGUAGES.map((lang) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			"data-inspector-id": "components/LanguageSwitcher/LanguageSwitcher/DropdownMenuItem/b0cbfd12d0f8",
			"data-inspector-source": "components/LanguageSwitcher.tsx:36:11:6cf6ab0c47ce7aa8ecbdc37029622b4c5e0f3a6496821b3ded67e63893ff0ae2:1",
			onClick: () => selectLanguage(lang.code),
			className: currentLang === lang.code ? "bg-accent font-medium" : "",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"data-inspector-id": "components/LanguageSwitcher/LanguageSwitcher/span/2",
				"data-inspector-source": "components/LanguageSwitcher.tsx:41:13:6d095679979a6d7645142daaaf6b1481460d1e7f57615a793e1664719699774a:1",
				className: "mr-2",
				children: lang.flag
			}), t(`language.${lang.code}`)]
		}, lang.code))
	})] });
}
/** Shared at the start of page content; direct-entry pages return to the site's home. */
function PageBackButton() {
	const router = useRouter();
	const { i18n } = useTranslation();
	const label = i18n.language?.startsWith("zh") ? "返回" : "Back";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		"data-inspector-id": "components/layout/PageBackButton/PageBackButton/Button/7754cadd2945",
		"data-inspector-source": "components/layout/PageBackButton.tsx:12:5:ef5b438f73b5cb4e7da51d50da5c0bf126b6e6d0075bc8f48e9849c97aba2ba8:1",
		type: "button",
		variant: "ghost",
		size: "icon",
		className: "min-h-11 min-w-11 shrink-0",
		"aria-label": label,
		title: label,
		"data-page-back": true,
		onClick: () => {
			if (router.history.canGoBack()) router.history.back();
			else router.navigate({ to: "/" });
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-5 w-5" })
	});
}
//#endregion
export { PageBackButton as n, LanguageSwitcher as t };
