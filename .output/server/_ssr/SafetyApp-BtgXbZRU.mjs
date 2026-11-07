import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { Dt as MapPin, Gn as Bell, Kt as House, c as Users, j as Sparkles, l as User, wt as MessageCircle } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { i as groupIdFromPath } from "./join-link-DH4hH7JP.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { i as useNavigate$1, n as Navigate, r as useLocation$1 } from "./router-compat-3gk8yjav.mjs";
import { n as Routes, t as Route } from "./path-routes-CJPpVmKM.mjs";
import { t as ErrorBoundary } from "./ErrorBoundary-KylBmK6w.mjs";
import { t as RequireAuth } from "./RequireAuth-CXvd5_cn.mjs";
import { t as BrandMark } from "./BrandMark-DkcdUUQ8.mjs";
import { t as Auth } from "./Auth-CpSKluq7.mjs";
import { t as JoinGroup } from "./JoinGroup-DdKGqYwt.mjs";
import { t as NotFound } from "./NotFound-DjDhFFgE.mjs";
import { n as GPSTracking } from "./BrowserOnlyPages-CBVNxPVN.mjs";
import { t as CareCircle } from "./CareCircle-CHzX3kbI.mjs";
import { t as Inbox$1 } from "./Inbox-DR4GkR7j.mjs";
import { t as Profile } from "./Profile-B5PZXWXp.mjs";
import { t as Onboarding } from "./Onboarding-l8UGp5JA.mjs";
import { t as AICompanion } from "./AICompanion-CIRnmmRu.mjs";
import { t as Index } from "./Index-DNFGzEHH.mjs";
import { n as PageBackButton, t as LanguageSwitcher } from "./PageBackButton-CozXDlPV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SafetyApp-BtgXbZRU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* NotchSafety app shell — one persistent header on every screen and one
* navigation model that scales from phone (bottom bar) to tablet/desktop
* (inline top nav). Family-locator vocabulary only.
*/
function SafetyShell({ children }) {
	const { i18n } = useTranslation();
	const zh = i18n.language?.startsWith("zh");
	const L = (cn, en) => zh ? cn : en;
	const location = useLocation$1();
	const navigate = useNavigate$1();
	const { isAuthenticated } = useAuth();
	const tabs = [
		{
			url: "/map",
			label: L("地图", "Map"),
			icon: MapPin
		},
		{
			url: "/places",
			label: L("地点", "Places"),
			icon: House
		},
		{
			url: "/inbox",
			label: L("收件箱", "Inbox"),
			icon: MessageCircle
		},
		{
			url: "/circle",
			label: L("圈子", "Circle"),
			icon: Users
		},
		{
			url: "/me",
			label: L("我的", "Me"),
			icon: User
		}
	];
	const isActive = (url) => location.pathname === url || location.pathname.startsWith(url + "/");
	const bare = location.pathname === "/" || location.pathname.startsWith("/auth") || location.pathname.startsWith("/join");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/safety/SafetyShell.tsx:39:5:6591491df2c63e4d5d27cc847f2dee41218164912ebe68dfbfb6d451065c768a:1",
		className: "flex min-h-dvh flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				"data-inspector-source": "pages/safety/SafetyShell.tsx:40:7:2df3cbc4e57a6b9ee97ab8eebcb8a86191d3a80c382d1e299a8841ab0687f373:1",
				className: "sticky top-0 z-50 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/safety/SafetyShell.tsx:41:9:dd479f4fcc6636fae29f5f9ca8ca3d424ae5f5b51117f7da02cd82a46096d619:1",
					className: "flex h-14 w-full items-center gap-3 px-4 md:h-16",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						"data-inspector-source": "pages/safety/SafetyShell.tsx:42:11:8c368e75324f39218072cbe2158a018716f2db9df494990d6585f50bfb5db9fb:1",
						type: "button",
						onClick: () => navigate(isAuthenticated ? "/map" : "/"),
						className: "flex shrink-0 items-center gap-2",
						"aria-label": L("诺驰安全首页", "Notch Safety home"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-source": "pages/safety/SafetyShell.tsx:48:13:04e7eb064c208d01217f3acd52c715a87b7826ccaa87b273320b6ff93d7f1c35:1",
							className: "hidden sm:flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {
								size: 28,
								showWordmark: true
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-source": "pages/safety/SafetyShell.tsx:51:13:9893ef8ce014c1f90680ddda364a2364736f29cac10ffbd125714b4b6c10f496:1",
							className: "flex sm:hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { size: 28 })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/safety/SafetyShell.tsx:57:11:ec27fa9a2adc00d219cdb9346852a772363f26fc326853d26f2471da4b1b52e5:1",
						className: "ml-auto flex items-center gap-1",
						children: [
							isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: isActive("/assistant") ? "secondary" : "ghost",
								size: "icon",
								onClick: () => navigate("/assistant"),
								"aria-label": L("安全助手", "Safety assistant"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-5 w-5" })
							}),
							isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "relative",
								onClick: () => navigate("/inbox"),
								"aria-label": L("收件箱", "Inbox"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-5 w-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanguageSwitcher, {}),
							isAuthenticated ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								onClick: () => navigate("/me"),
								"aria-label": L("我的", "Me"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-5 w-5" })
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => navigate("/auth"),
								children: L("登录", "Sign in")
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				"data-inspector-source": "pages/safety/SafetyShell.tsx:93:7:372015988870b27a0ebb16b9736264fdff278445d9a4349bafb3090465989fcb:1",
				className: `w-full flex-1 ${bare ? "" : "px-0 pb-20 md:px-4"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "pages/safety/SafetyShell.tsx:94:9:7018cced0e8e4d13ad88a0f1da050fb7e03619ef5bc5d977e0d059a309a9fc6d:1",
					className: "px-4 pt-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageBackButton, {})
				}), children]
			}),
			isAuthenticated && !bare && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"data-inspector-source": "pages/safety/SafetyShell.tsx:101:9:d90ebcc908dc06ce5d5600aef937915d0074fe339b8e29a8f735eb89df107517:1",
				className: "fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-[env(safe-area-inset-bottom)]",
				"aria-label": L("底部导航", "Bottom navigation"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "pages/safety/SafetyShell.tsx:105:11:6d03ec433924734c7b2e7650f0e32469f7b08c10e34888860c1c34a022e83ef1:1",
					className: "flex w-full",
					children: tabs.map((tab) => {
						const active = isActive(tab.url);
						const Icon = tab.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							"data-inspector-source": "pages/safety/SafetyShell.tsx:110:17:ca904882b6631c4b370d8cd02a036b03f523c6fcaa909d06b9d5911eb6cf0c5e:1",
							type: "button",
							onClick: () => navigate(tab.url),
							"aria-current": active ? "page" : void 0,
							className: `flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 text-[10px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "pages/safety/SafetyShell.tsx:120:19:7a0aaa1fa1b612842ab089e2aba5b830fa75885a545e8fbd3b8a0ac38dfaee14:1",
								className: "w-full truncate text-center leading-tight",
								children: tab.label
							})]
						}, tab.url);
					})
				})
			})
		]
	});
}
/**
* NotchSafety — a *variant* of the care app, not a second app.
*
* It uses the shared public homepage with family-location content, plus this
* shell (header + bottom bar, family-locator wording). Every functional screen
* is the exact same file the care app uses; the path only picks which tab opens.
*/
function SafetyApp() {
	const location = useLocation$1();
	const { isAuthenticated, isLoading } = useAuth();
	(0, import_react.useEffect)(() => {
		const url = new URL(window.location.href);
		if (url.searchParams.get("__site") !== "notchsafety") {
			url.searchParams.set("__site", "notchsafety");
			window.history.replaceState({}, "", url.toString());
		}
	}, [location.pathname]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SafetyShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Routes, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/",
			element: !isLoading && isAuthenticated ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/map",
				replace: true
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Index, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/onboarding",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Onboarding, {}) })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/map",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GPSTracking, {}) })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/places",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GPSTracking, {}) })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/circle",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CareCircle, {}) })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/circle/:groupId",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CareCircle, {}) })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/care-circle/:groupId",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleGroupAlias, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/assistant",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AICompanion, {}) })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/inbox",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox$1, {}) })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/alerts",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/inbox?tab=notifications",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/chat",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/inbox?tab=messages",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/me",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Profile, {}) })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/auth",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Auth, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/join/:code",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JoinGroup, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/dashboard",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/map",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/find",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/map",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/care-circle",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/circle",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/notifications",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/inbox?tab=notifications",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/messages",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/inbox?tab=messages",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/ai-companion",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/assistant",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/settings",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/me",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/drives",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/map",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/member/:userId",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/map",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "*",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotFound, {})
		})
	] }) }) });
}
/** /care-circle/<id> (the shared group link) opens the same group under /circle. */
function CircleGroupAlias() {
	const location = useLocation$1();
	const id = groupIdFromPath(location.pathname);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: id ? `/circle/${id}${location.search}` : "/circle",
		replace: true
	});
}
//#endregion
export { SafetyApp as default };
