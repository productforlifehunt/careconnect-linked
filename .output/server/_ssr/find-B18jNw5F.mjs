import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { i as getStoredWPUser } from "./wp-auth-DL1jfVY7.mjs";
import { Dt as MapPin, jt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as fetchWPUserProfile } from "./wp-users-C2nRIR2f.mjs";
import { A as useCareGroups, In as useSetLocationSharingFlags, On as useRespondToLocationRequest, nn as useLocationSharingFlags, yr as useUserCaredOnes, zt as useGroupCaredOnes } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { t as Switch } from "./switch-Coli7fra.mjs";
import { n as getCurrentPosition } from "./geolocation-BbrvI7XV.mjs";
import { t as LocationCard } from "./LocationCard-C1cmRDPS.mjs";
import { t as RequireAuth } from "./RequireAuth-C-F4CYYW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/find-B18jNw5F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var bare = (v) => String(v ?? "").replace(/^wp-/, "");
/** Button tabs of people, then the standard location card of the chosen one. */
function PeopleSwitcher({ people, empty }) {
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const active = people.find((p) => p.id === selectedId) || people[0];
	if (!people.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/FindCaredOnes/PeopleSwitcher/div/0",
		"data-inspector-source": "pages/FindCaredOnes.tsx:29:7:a441eedc99a003d090a60c648e52461b913a1247f7636ce3b4d482f05bf65484:1",
		className: "text-center py-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
			"data-inspector-id": "pages/FindCaredOnes/PeopleSwitcher/MapPin/0",
			"data-inspector-source": "pages/FindCaredOnes.tsx:30:9:a9f259d9897c3084a14eb102d8cbc24005d5c24e5a3fd3c065788ce9dfe90d75:1",
			className: "h-10 w-10 text-muted-foreground/30 mx-auto mb-3"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			"data-inspector-id": "pages/FindCaredOnes/PeopleSwitcher/p/2e1cfa82b035/0",
			"data-inspector-source": "pages/FindCaredOnes.tsx:31:9:d3acc7bd3705ec24165c6e09d3e94b437578e27f0bc7d6bdd3f96ef18bfc80a7:1",
			className: "text-muted-foreground",
			children: empty
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/FindCaredOnes/PeopleSwitcher/div/3edb0abc748c/0",
		"data-inspector-source": "pages/FindCaredOnes.tsx:36:5:ca58dfc20fbae0198e02d1b126f71b4c2aedc6fbb1576a0f9f4fad0a6e7ad6d3:1",
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-inspector-id": "pages/FindCaredOnes/PeopleSwitcher/div/48aaf12f56d6/0",
			"data-inspector-source": "pages/FindCaredOnes.tsx:37:7:17c694d4a95917d5e2b777445eca091098ab2da6abbc2f97cfcc558f975ba767:1",
			className: "flex gap-2 flex-wrap",
			children: people.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				"data-inspector-id": "pages/FindCaredOnes/PeopleSwitcher/Button/85babebeebbd/0",
				"data-inspector-source": "pages/FindCaredOnes.tsx:39:11:47cae6c397af9fc15f44226715596dccff01a16a9c7dd46d09ff0d7bc631108d:1",
				size: "sm",
				variant: active?.id === p.id ? "default" : "outline",
				onClick: () => setSelectedId(p.id),
				children: p.name
			}, p.id))
		}), active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationCard, {
			"data-inspector-id": "pages/FindCaredOnes/PeopleSwitcher/LocationCard/0",
			"data-inspector-source": "pages/FindCaredOnes.tsx:44:18:b817a546d3d0ba9ff73bcfe96b11f980d0e11c74c0b11604cee12f47393f4b78:1",
			caredOneId: active.id,
			caredOneName: active.name
		}, active.id)]
	});
}
function GroupsTab({ Z }) {
	const { data: groups, isLoading } = useCareGroups();
	const list = groups || [];
	const [groupId, setGroupId] = (0, import_react.useState)(null);
	const activeGroup = list.find((g) => String(g.id) === groupId) || list[0];
	const { data: groupCaredOnes, isLoading: loadingPeople } = useGroupCaredOnes(activeGroup ? String(activeGroup.id) : null);
	const people = (groupCaredOnes || []).map((c) => ({
		id: bare(c.user_id || c.id),
		name: c.full_name || c.name || Z("被护理者", "Cared one")
	}));
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
		"data-inspector-id": "pages/FindCaredOnes/GroupsTab/Loader2/0",
		"data-inspector-source": "pages/FindCaredOnes.tsx:59:25:b6409011f30d8d8572de7b24db7e0f3e245886e215a51e669784976c969a3459:1",
		className: "h-5 w-5 animate-spin text-muted-foreground"
	});
	if (!list.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		"data-inspector-id": "pages/FindCaredOnes/GroupsTab/p/bbeebd879e1d/0",
		"data-inspector-source": "pages/FindCaredOnes.tsx:60:28:d2e62c050854a6e930697dca0a3b33e0940164ad0f6f85e8cfe72de57d26e93b:1",
		className: "text-muted-foreground py-8 text-center",
		children: Z("你还没有加入护理群组。", "You are not in a care group yet.")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/FindCaredOnes/GroupsTab/div/73a8b342ef99/0",
		"data-inspector-source": "pages/FindCaredOnes.tsx:62:5:ca58dfc20fbae0198e02d1b126f71b4c2aedc6fbb1576a0f9f4fad0a6e7ad6d3:1",
		className: "space-y-4",
		children: [list.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-inspector-id": "pages/FindCaredOnes/GroupsTab/div/1700db85aa59/0",
			"data-inspector-source": "pages/FindCaredOnes.tsx:64:9:88260343f5a96c63fba0a0b56f3501d00ded876e458cd5a41fa4a52d5dda3f9d:1",
			className: "flex gap-2 flex-wrap",
			children: list.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				"data-inspector-id": "pages/FindCaredOnes/GroupsTab/Button/391c48107d15/0",
				"data-inspector-source": "pages/FindCaredOnes.tsx:66:13:2aec335d4576481077bb8dd2f0e4edc08b7f986fabd460fe188449eee1447a43:1",
				size: "sm",
				variant: String(activeGroup?.id) === String(g.id) ? "secondary" : "ghost",
				onClick: () => setGroupId(String(g.id)),
				children: g.name || g.title || Z("护理群组", "Care group")
			}, g.id))
		}), loadingPeople ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			"data-inspector-id": "pages/FindCaredOnes/GroupsTab/Loader2/1",
			"data-inspector-source": "pages/FindCaredOnes.tsx:73:9:d2a934923eb997029e2ca5fe18b7f1c3407c11df3e7d48b846808b14a695d661:1",
			className: "h-5 w-5 animate-spin text-muted-foreground"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeopleSwitcher, {
			"data-inspector-id": "pages/FindCaredOnes/GroupsTab/PeopleSwitcher/0",
			"data-inspector-source": "pages/FindCaredOnes.tsx:75:9:0ec5f7c14bc46fbead911978f875119f2b980bb6384f0c7ad377abdd64e360ba:1",
			people,
			empty: Z("这个群组还没有被护理者。", "This group has no cared ones yet.")
		}, String(activeGroup?.id))]
	});
}
function MeTab({ Z }) {
	const { toast } = useToast();
	const me = bare(getStoredWPUser()?.user_id);
	const { data: flags } = useLocationSharingFlags(me || null);
	const setFlags = useSetLocationSharingFlags();
	const save = (patch) => setFlags.mutate({
		userId: me,
		...patch
	}, { onError: (e) => toast({
		title: Z("保存失败", "Could not save"),
		description: e?.message,
		variant: "destructive"
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/FindCaredOnes/MeTab/div/969a86fbb5a9/0",
		"data-inspector-source": "pages/FindCaredOnes.tsx:91:5:ca58dfc20fbae0198e02d1b126f71b4c2aedc6fbb1576a0f9f4fad0a6e7ad6d3:1",
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			"data-inspector-id": "pages/FindCaredOnes/MeTab/Card/0",
			"data-inspector-source": "pages/FindCaredOnes.tsx:92:7:5f47867b21ed71838d4b4fe032dea0e543b7f07ad6934c3a08d575c591e6cd09:1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				"data-inspector-id": "pages/FindCaredOnes/MeTab/CardContent/0",
				"data-inspector-source": "pages/FindCaredOnes.tsx:93:9:83c85fbf8e378ed6e507fd1031bc5905623bd799af588ae8f5a7e150af3f535e:1",
				className: "p-4 space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					"data-inspector-id": "pages/FindCaredOnes/MeTab/label/0",
					"data-inspector-source": "pages/FindCaredOnes.tsx:94:11:08651888b29cf885a7321ed078d25fd16b6fff3b7cbce90d2b5e92eec0471d94:1",
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-inspector-id": "pages/FindCaredOnes/MeTab/span/0",
						"data-inspector-source": "pages/FindCaredOnes.tsx:95:13:09cade9a279055bd5987335540b6f44af79a40aa369fd64a471111d0bcd503ea:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-id": "pages/FindCaredOnes/MeTab/span/bbeebd879e1d/0",
							"data-inspector-source": "pages/FindCaredOnes.tsx:96:15:e9c48cd1b35c518d088b5478f44ff905a83964c22f89461378fe4c1e1f09952c:1",
							className: "block text-sm font-medium",
							children: Z("开启实时位置分享", "Live location sharing")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-id": "pages/FindCaredOnes/MeTab/span/bbeebd879e1d/1",
							"data-inspector-source": "pages/FindCaredOnes.tsx:97:15:ab5d51fcebbb41b038b0288c19be4f53991a571cf86c4dbac123767a503c9630:1",
							className: "block text-xs text-muted-foreground",
							children: Z("开启后，应用打开时每 3 分钟更新一次你的位置，照顾你的人可以看到。", "While the app is open, your location updates every 3 minutes for the people who care for you.")
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						"data-inspector-id": "pages/FindCaredOnes/MeTab/Switch/90a23d9add55/0",
						"data-inspector-source": "pages/FindCaredOnes.tsx:99:13:76c48bab9493553482da5fced3568b294d47dba617a8d661a755914ea27188d9:1",
						checked: !!flags?.shareOn,
						disabled: setFlags.isPending,
						onCheckedChange: (v) => save({ shareOn: v })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					"data-inspector-id": "pages/FindCaredOnes/MeTab/label/1",
					"data-inspector-source": "pages/FindCaredOnes.tsx:101:11:08651888b29cf885a7321ed078d25fd16b6fff3b7cbce90d2b5e92eec0471d94:1",
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-inspector-id": "pages/FindCaredOnes/MeTab/span/1",
						"data-inspector-source": "pages/FindCaredOnes.tsx:102:13:09cade9a279055bd5987335540b6f44af79a40aa369fd64a471111d0bcd503ea:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-id": "pages/FindCaredOnes/MeTab/span/bbeebd879e1d/2",
							"data-inspector-source": "pages/FindCaredOnes.tsx:103:15:3c07dab94a2a8ecf0f2a15b570991b20317aea20809b9108bbae451a2529e787:1",
							className: "block text-sm font-medium",
							children: Z("允许紧急位置请求", "Allow emergency location requests")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-id": "pages/FindCaredOnes/MeTab/span/bbeebd879e1d/3",
							"data-inspector-source": "pages/FindCaredOnes.tsx:104:15:31c497b3704b584afcd5a518cebce3407387a1cba1f95b3ca01c45cef7b40a1b:1",
							className: "block text-xs text-muted-foreground",
							children: Z("开启后，紧急时护理者不需要你确认就能拿到你的位置。", "In an emergency your caregiver can get your location without asking you first.")
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						"data-inspector-id": "pages/FindCaredOnes/MeTab/Switch/40066e25c767/0",
						"data-inspector-source": "pages/FindCaredOnes.tsx:106:13:51c5f3579714f7d125ffbdbe026b7f7ad7613c651e20ac45ac90a6b662eb70bb:1",
						checked: !!flags?.emergencyAllowed,
						disabled: setFlags.isPending,
						onCheckedChange: (v) => save({ emergencyAllowed: v })
					})]
				})]
			})
		}), me && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationCard, {
			"data-inspector-id": "pages/FindCaredOnes/MeTab/LocationCard/0",
			"data-inspector-source": "pages/FindCaredOnes.tsx:110:14:94773885b096c0ab675df7d3505b8d5998d1dfd7b5038ef13fd4bd4a23e4c17c:1",
			caredOneId: me,
			caredOneName: Z("我", "Me")
		})]
	});
}
/**
* /find — Me / My people (REL 219) / My groups (REL 223, members marked as
* cared one). Every person opens the same standard LocationCard.
*/
function FindCaredOnes() {
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const { toast } = useToast();
	const { data: caredOnes, isLoading } = useUserCaredOnes();
	const [tab, setTab] = (0, import_react.useState)("people");
	const people = (0, import_react.useMemo)(() => (caredOnes || []).filter((c) => !c.invitation_status || c.invitation_status === "accepted").map((c) => ({
		id: bare(c.user_id ?? c.cared_one?.id),
		name: c.cared_one?.full_name || Z("被护理者", "Cared one")
	})).filter((p) => p.id), [caredOnes, isCN]);
	const [requesterId, setRequesterId] = (0, import_react.useState)(null);
	const [emergency, setEmergency] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const q = new URLSearchParams(window.location.search);
		setRequesterId(q.get("request_from"));
		setEmergency(q.get("emergency") === "1");
	}, []);
	const { data: requester } = useQuery({
		queryKey: ["locationRequester", requesterId],
		queryFn: () => fetchWPUserProfile(String(requesterId)),
		enabled: !!requesterId
	});
	const respond = useRespondToLocationRequest();
	const [locating, setLocating] = (0, import_react.useState)(false);
	const clearRequest = () => {
		setRequesterId(null);
		const url = new URL(window.location.href);
		url.searchParams.delete("request_from");
		url.searchParams.delete("emergency");
		window.history.replaceState({}, "", url.toString());
	};
	const answer = async (accept) => {
		if (!requesterId) return;
		let position;
		if (accept) {
			setLocating(true);
			position = await getCurrentPosition({ timeout: 15e3 });
			setLocating(false);
			if (!position) {
				toast({
					title: Z("拿不到你的位置", "Could not get your location"),
					description: Z("请在浏览器或手机设置里允许本应用使用位置后再试。", "Allow location access for this app in your browser or phone settings, then try again."),
					variant: "destructive"
				});
				return;
			}
		}
		respond.mutate({
			requesterId,
			accept,
			position
		}, {
			onSuccess: () => {
				toast({ title: accept ? Z("已允许，实时位置分享已开启 ✓", "Allowed — live sharing is on ✓") : Z("已告诉对方暂不分享", "They were told you are not sharing") });
				clearRequest();
			},
			onError: (e) => toast({
				title: Z("操作失败", "Failed"),
				description: e?.message,
				variant: "destructive"
			})
		});
	};
	const requesterName = requester?.full_name || Z("你的护理者", "Your caregiver");
	const busy = locating || respond.isPending;
	const tabs = [
		{
			key: "me",
			label: Z("我", "Me")
		},
		{
			key: "people",
			label: Z("我的亲友", "My people")
		},
		{
			key: "groups",
			label: Z("我的群组", "My groups")
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/div/557817a648f0/0",
		"data-inspector-source": "pages/FindCaredOnes.tsx:185:5:42a6a900787903223edc1b23ddee650bb8cba81f4cdcfc9803ac2e1e52a5b644:1",
		className: "container mx-auto max-w-5xl px-4 py-6 space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/h1/bbeebd879e1d/0",
				"data-inspector-source": "pages/FindCaredOnes.tsx:186:7:14acadada52953e959641158e600732a383b11b1ec64b425dc7ed00d7ae8c463:1",
				className: "text-2xl font-bold",
				children: Z("定位", "Find")
			}),
			requesterId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/Card/0",
				"data-inspector-source": "pages/FindCaredOnes.tsx:189:9:7d06289576f9dd202e06d92cbabd6e2eaab8d8e5c344a6d050934116a13b64e5:1",
				className: "border-primary/30",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/CardContent/68f1a36a8672/0",
					"data-inspector-source": "pages/FindCaredOnes.tsx:190:11:7aa790bda8113d57a98f49cf99ddb23390a0510f7819e0d5985fd4122e0b6f0a:1",
					className: "p-4 space-y-3",
					children: emergency ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/p/45ffdddd66ae/0",
							"data-inspector-source": "pages/FindCaredOnes.tsx:193:17:4650c3328c05c59ab2fefd6eb1834cffcb525f4fcb295380eca8a384bda882d9:1",
							className: "font-semibold",
							children: Z(`${requesterName}发出了紧急位置请求`, `${requesterName} sent an emergency location request`)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/p/bbeebd879e1d/0",
							"data-inspector-source": "pages/FindCaredOnes.tsx:194:17:2c15d11cc25b699a770b202beace9ea5ecf110274f1dc96dd343397cf558fe7e:1",
							className: "text-sm text-muted-foreground",
							children: Z("如果你允许紧急请求，你的位置已自动发送，不需要操作。", "If you allow emergency requests, your location was sent automatically — nothing to do.")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/Button/f282849ec6fb/0",
							"data-inspector-source": "pages/FindCaredOnes.tsx:195:17:ef82d7d0f0f2264c94227534310bcba4b347fcae51d382d52aa49a52d035935b:1",
							variant: "outline",
							onClick: clearRequest,
							children: Z("知道了", "OK")
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/p/45ffdddd66ae/1",
							"data-inspector-source": "pages/FindCaredOnes.tsx:199:17:e81560084a916212266ff6fcc4f4dfd27bad4851fa46ca38b46b50f25f509b24:1",
							className: "font-semibold",
							children: Z(`${requesterName}请求查看你的位置，是否允许？`, `${requesterName} asks to see your location. Allow?`)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/p/bbeebd879e1d/1",
							"data-inspector-source": "pages/FindCaredOnes.tsx:200:17:c41528c0e902dd72fecbc6874bde188e1ab1bc2b9417b3c3604a5129ff3c3320:1",
							className: "text-sm text-muted-foreground",
							children: Z("允许后会开启实时位置分享，可以随时在「我」里关掉。", "Allowing turns on live sharing. You can turn it off any time under Me.")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/div/0",
							"data-inspector-source": "pages/FindCaredOnes.tsx:201:17:d6cb68489e88d8d81fe5aad5052531f800af0e416f6310d2261f47a04fb07fe0:1",
							className: "flex gap-2 flex-wrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/Button/530d8d9e0021/0",
								"data-inspector-source": "pages/FindCaredOnes.tsx:202:19:19197a7390f18b30bf50d0006a1d8e939bf1d02e88c62668fbfdbd48451c9d54:1",
								onClick: () => answer(true),
								disabled: busy,
								children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
									"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/Loader2/0",
									"data-inspector-source": "pages/FindCaredOnes.tsx:203:29:cf1f1440ae686820774ee0b353c6cd58ea4b6aa3d2b100890cb401b4985c578b:1",
									className: "h-4 w-4 animate-spin mr-2"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
									"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/MapPin/0",
									"data-inspector-source": "pages/FindCaredOnes.tsx:203:81:cf1f1440ae686820774ee0b353c6cd58ea4b6aa3d2b100890cb401b4985c578b:1",
									className: "h-4 w-4 mr-2"
								}), Z("允许", "Allow")]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/Button/2419a23476a6/0",
								"data-inspector-source": "pages/FindCaredOnes.tsx:206:19:d9fb36da9b125831dd530fa36718c2df0ef5c80f2896ba1f69c6a9a860b64497:1",
								variant: "outline",
								onClick: () => answer(false),
								disabled: busy,
								children: Z("不允许", "Decline")
							})]
						})
					] })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/div/098c67988bb9/0",
				"data-inspector-source": "pages/FindCaredOnes.tsx:214:7:d115b9388741c5b2da418e621cfe3d5c83ab48702248e84e220ff4a05fd42ef7:1",
				className: "flex gap-1 border-b border-border",
				children: tabs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/button/8b19698e9f09/0",
					"data-inspector-source": "pages/FindCaredOnes.tsx:216:11:65ee8350e19e5d598aefe2fc6f9682fa8de0db89042fda6e02bfdce92db20d50:1",
					type: "button",
					onClick: () => setTab(t.key),
					className: `px-4 py-2.5 text-sm font-medium border-b-2 ${tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
					children: t.label
				}, t.key))
			}),
			tab === "me" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeTab, {
				"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/MeTab/0",
				"data-inspector-source": "pages/FindCaredOnes.tsx:223:24:e04ebb0134fa387ab911aadd9efe1f99d55c2b8b3d20eee6c30f4ea9627a79d7:1",
				Z
			}),
			tab === "people" && (isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/Loader2/1",
				"data-inspector-source": "pages/FindCaredOnes.tsx:225:11:a24926b8bc92da8321d4821fbaa11a7f0cc37617868a2e97202c2f51d2c54099:1",
				className: "h-5 w-5 animate-spin text-muted-foreground"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeopleSwitcher, {
				"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/PeopleSwitcher/0",
				"data-inspector-source": "pages/FindCaredOnes.tsx:226:11:8f15107b7efe6c549593698d19e11d3879905e0034ec458b492cf7f48893bfd2:1",
				people,
				empty: Z("你还没有被护理者，先在「被护理者」页面添加。", "You have no cared ones yet — add one on the Cared Ones page first.")
			})),
			tab === "groups" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroupsTab, {
				"data-inspector-id": "pages/FindCaredOnes/FindCaredOnes/GroupsTab/0",
				"data-inspector-source": "pages/FindCaredOnes.tsx:227:28:739d600ca50e9c36ebd9150fff8fbaca60d1cecb8c6d42dd10e4f27bb95a4944:1",
				Z
			})
		]
	});
}
function RouteFindPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, {
		"data-inspector-id": "routes/find/RouteFindPage/RequireAuth/0",
		"data-inspector-source": "routes/find.tsx:4:10:b4b789e68085c565164a81b6058b3e327b888abd2e1362ac1df5ccf585dda930:1",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FindCaredOnes, {
			"data-inspector-id": "routes/find/RouteFindPage/FindCaredOnes/0",
			"data-inspector-source": "routes/find.tsx:4:23:b4b789e68085c565164a81b6058b3e327b888abd2e1362ac1df5ccf585dda930:1"
		})
	});
}
//#endregion
export { RouteFindPage as component };
