import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { Dt as MapPin, Gn as Bell, Kt as House, c as Users, j as Sparkles, l as User, wt as MessageCircle } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { i as groupIdFromPath } from "./join-link-DH4hH7JP.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { i as useNavigate$1, n as Navigate, r as useLocation$1 } from "./router-compat-CRbRSfhz.mjs";
import { n as Routes, t as Route } from "./path-routes-B91PmSg1.mjs";
import { t as ErrorBoundary } from "./ErrorBoundary-Cvh4ER8l.mjs";
import { t as RequireAuth } from "./RequireAuth-DeCqG_0H.mjs";
import { t as BrandMark } from "./BrandMark-D6cHrAws.mjs";
import { t as Auth } from "./Auth-BqiW80Ss.mjs";
import { t as JoinGroup } from "./JoinGroup-3N-GR60Q.mjs";
import { t as NotFound } from "./NotFound-BdCBu4WI.mjs";
import { n as GPSTracking } from "./BrowserOnlyPages-DUkU42HF.mjs";
import { t as CareCircle } from "./CareCircle-BSOfjOcI.mjs";
import { t as Inbox$1 } from "./Inbox-CuOFP8Kr.mjs";
import { t as Profile } from "./Profile-Sj_Cyyfu.mjs";
import { t as Onboarding } from "./Onboarding-BzGyHfuT.mjs";
import { t as AICompanion } from "./AICompanion-CAoRTlVW.mjs";
import { t as Index } from "./Index-BVQzB82Y.mjs";
import { n as PageBackButton, t as LanguageSwitcher } from "./PageBackButton-DeAQZdR1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SafetyApp-BlMTOrQm.js
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
		"data-inspector-id": "pages/safety/SafetyShell/SafetyShell/div/0",
		"data-inspector-source": "pages/safety/SafetyShell.tsx:39:5:6591491df2c63e4d5d27cc847f2dee41218164912ebe68dfbfb6d451065c768a:1",
		className: "flex min-h-dvh flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-50 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-14 w-full items-center gap-3 px-4 md:h-16",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						"data-inspector-id": "pages/safety/SafetyShell/SafetyShell/button/e6bc7e5afa4f",
						"data-inspector-source": "pages/safety/SafetyShell.tsx:42:11:8c368e75324f39218072cbe2158a018716f2db9df494990d6585f50bfb5db9fb:1",
						type: "button",
						onClick: () => navigate(isAuthenticated ? "/map" : "/"),
						className: "flex shrink-0 items-center gap-2",
						"aria-label": L("诺驰安全首页", "Notch Safety home"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {
								"data-inspector-id": "pages/safety/SafetyShell/SafetyShell/BrandMark/0",
								"data-inspector-source": "pages/safety/SafetyShell.tsx:49:15:ec2813b8bd62101ce834114730a9ba24cac852acf91bdcd077988e61b49b1d4d:1",
								size: 28,
								showWordmark: true
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex sm:hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {
								"data-inspector-id": "pages/safety/SafetyShell/SafetyShell/BrandMark/1",
								"data-inspector-source": "pages/safety/SafetyShell.tsx:52:15:190bb16d83f16a76ae8f327062bad10c2aca2150e401b72ad86d653925f5d9b6:1",
								size: 28
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/safety/SafetyShell/SafetyShell/div/1",
						"data-inspector-source": "pages/safety/SafetyShell.tsx:57:11:ec27fa9a2adc00d219cdb9346852a772363f26fc326853d26f2471da4b1b52e5:1",
						className: "ml-auto flex items-center gap-1",
						children: [
							isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "pages/safety/SafetyShell/SafetyShell/Button/d0cda6559bb3",
								"data-inspector-source": "pages/safety/SafetyShell.tsx:59:15:07f77ad16dcf60707111099b7ffe94ca8bfc5a0b826f92ea7219e3e2cfb16e6f:1",
								variant: isActive("/assistant") ? "secondary" : "ghost",
								size: "icon",
								onClick: () => navigate("/assistant"),
								"aria-label": L("安全助手", "Safety assistant"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-5 w-5" })
							}),
							isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "pages/safety/SafetyShell/SafetyShell/Button/d0cda6559bb3",
								"data-inspector-source": "pages/safety/SafetyShell.tsx:69:15:07f77ad16dcf60707111099b7ffe94ca8bfc5a0b826f92ea7219e3e2cfb16e6f:1",
								variant: "ghost",
								size: "icon",
								className: "relative",
								onClick: () => navigate("/inbox"),
								"aria-label": L("收件箱", "Inbox"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-5 w-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanguageSwitcher, {}),
							isAuthenticated ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "pages/safety/SafetyShell/SafetyShell/Button/d0cda6559bb3",
								"data-inspector-source": "pages/safety/SafetyShell.tsx:81:15:b1843aaa28fe69a2a6c65a9d4cdeec25fdfc52b7e4b8bc5c7595a84035418c9c:1",
								variant: "ghost",
								size: "icon",
								onClick: () => navigate("/me"),
								"aria-label": L("我的", "Me"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-5 w-5" })
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "pages/safety/SafetyShell/SafetyShell/Button/d0cda6559bb3",
								"data-inspector-source": "pages/safety/SafetyShell.tsx:85:15:6970da371e744c59590a2821b72181f990d6cf22b28f9d636e8f8e5ff564ef44:1",
								size: "sm",
								onClick: () => navigate("/auth"),
								children: L("登录", "Sign in")
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				"data-inspector-id": "pages/safety/SafetyShell/SafetyShell/main/0",
				"data-inspector-source": "pages/safety/SafetyShell.tsx:93:7:372015988870b27a0ebb16b9736264fdff278445d9a4349bafb3090465989fcb:1",
				className: `w-full flex-1 ${bare ? "" : "px-0 pb-20 md:px-4"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-4 pt-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageBackButton, {})
				}), children]
			}),
			isAuthenticated && !bare && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"data-inspector-id": "pages/safety/SafetyShell/SafetyShell/nav/0",
				"data-inspector-source": "pages/safety/SafetyShell.tsx:101:9:d90ebcc908dc06ce5d5600aef937915d0074fe339b8e29a8f735eb89df107517:1",
				className: "fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-[env(safe-area-inset-bottom)]",
				"aria-label": L("底部导航", "Bottom navigation"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "pages/safety/SafetyShell/SafetyShell/div/2",
					"data-inspector-source": "pages/safety/SafetyShell.tsx:105:11:6d03ec433924734c7b2e7650f0e32469f7b08c10e34888860c1c34a022e83ef1:1",
					className: "flex w-full",
					children: tabs.map((tab) => {
						const active = isActive(tab.url);
						const Icon = tab.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							"data-inspector-id": "pages/safety/SafetyShell/SafetyShell/button/ca6d65ab5199",
							"data-inspector-source": "pages/safety/SafetyShell.tsx:110:17:ca904882b6631c4b370d8cd02a036b03f523c6fcaa909d06b9d5911eb6cf0c5e:1",
							type: "button",
							onClick: () => navigate(tab.url),
							"aria-current": active ? "page" : void 0,
							className: `flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 text-[10px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-id": "pages/safety/SafetyShell/SafetyShell/span/0",
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
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/0",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:44:11:8112b8f29aadb668acc558255309d7cbee505a93537076f98ba24605e448db39:1",
			path: "/",
			element: !isLoading && isAuthenticated ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/map",
				replace: true
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Index, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/1",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:49:11:156d98441276fc7239fe7a398ef249100e8015c04f166d2e44feecaedf324fe6:1",
			path: "/onboarding",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Onboarding, {}) })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/2",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:50:11:e35eea3df1d0cec80ad17b88316c261704208449e906303491da0ab2f62c381c:1",
			path: "/map",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GPSTracking, {}) })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/3",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:51:11:c12cf0a6d0acc1b76947424943afd608045e97124374a77b96ffcae31bf47837:1",
			path: "/places",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GPSTracking, {}) })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/4",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:52:11:8096127a89eff9d19cd027fc67c8df5e4f4d90b40592f736247df006b8453148:1",
			path: "/circle",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CareCircle, {}) })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/5",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:54:11:34b6fbd0230b41d4fd1ce900733a652efe4d587f6d985e0c058d2507550dcae9:1",
			path: "/circle/:groupId",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CareCircle, {}) })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/6",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:55:11:51a84405ac8bfc5088e77021a6bddbdbf893f34e365be592f4a7872fccdc9f68:1",
			path: "/care-circle/:groupId",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleGroupAlias, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/7",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:56:11:fd27ad39df9e214b22663a525e910f0ee94caee9c9ebdcef482a530c12259b08:1",
			path: "/assistant",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AICompanion, {}) })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/8",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:58:11:3b11739a2a81ec30b0a8175858d2308f9e473534774cd191496c8dab35a5b30d:1",
			path: "/inbox",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox$1, {}) })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/9",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:59:11:beef4a725d2082b78baf6d1ca1411b63d7a008988462557f92224a902ed98490:1",
			path: "/alerts",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/inbox?tab=notifications",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/10",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:60:11:269f88eb52a85ee7abccbd3cd2cecc54e3d974c0e9952fdcfbf169cb2ef641a5:1",
			path: "/chat",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/inbox?tab=messages",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/11",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:61:11:a74a9521493bfc567369e6175de6130b1da301728548ad6db30ef1e29ba840d0:1",
			path: "/me",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Profile, {}) })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/12",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:62:11:fcdfa166cabd731460fe49c4fef2f93de1a272ee56e9d38565fe356420b9556a:1",
			path: "/auth",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Auth, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/13",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:63:11:28401766adc07833d583087fbb9dc980914d5cfef1636acba10b816f75506382:1",
			path: "/join/:code",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JoinGroup, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/14",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:65:11:9659e251c9cb17b153952b4f5151d8a1dbbb72b4bac99b9de177a2293c0ca3f4:1",
			path: "/dashboard",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/map",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/15",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:66:11:3097205a3e1a9fd57cb55ade0f30eb24846cc105cb32d0cbc89e3875a5ce3a5f:1",
			path: "/find",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/map",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/16",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:67:11:4e05a1314f692009f7b6930b49fd483ac9065cb55d2091e4cf837a6c8f795edf:1",
			path: "/care-circle",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/circle",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/17",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:68:11:c9883120f86bb1e3e06fb438a7e093299f3f5aab8485cfae4ee0552bec1255c6:1",
			path: "/notifications",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/inbox?tab=notifications",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/18",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:69:11:e9a0764d9ff0a5374a77baf666a012cdd68ebeb99dce94f8eb1460afe7a7c22a:1",
			path: "/messages",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/inbox?tab=messages",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/19",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:70:11:2b5230cb21732a9507653997d0b71c4054a20b41b525d4c3106420405d75c85f:1",
			path: "/ai-companion",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/assistant",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/20",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:71:11:ac32ebdc2a1f091abbda846ef03089e11d3eb0e316008ca6426f7ad96a3018a6:1",
			path: "/settings",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/me",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/21",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:72:11:a1d3e354eb9914363dedc4281a48f23c9b543d7ac5972b76937a84c0b2355bab:1",
			path: "/drives",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/map",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/22",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:73:11:718e7f6cd439fc3aeeaf36e4d0f684e7639727884b1967c13c35a78507ce3e5c:1",
			path: "/member/:userId",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/map",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			"data-inspector-id": "pages/safety/SafetyApp/SafetyApp/Route/23",
			"data-inspector-source": "pages/safety/SafetyApp.tsx:74:11:83a4567d2ec744d5b0714900cdd899dde5bfbaa2aae1990404928434ef4f19b5:1",
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
		"data-inspector-id": "pages/safety/SafetyApp/CircleGroupAlias/Navigate/0",
		"data-inspector-source": "pages/safety/SafetyApp.tsx:85:10:ab8cce968ce4b6711c61a9883d4a3c15e72fdef46390215ed0bd393199adeda0:1",
		to: id ? `/circle/${id}${location.search}` : "/circle",
		replace: true
	});
}
//#endregion
export { SafetyApp as default };
