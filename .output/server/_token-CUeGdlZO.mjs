import "./_runtime.mjs";
import { B as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./_ssr/button-DgaEzEqC.mjs";
import { n as CardContent, t as Card } from "./_ssr/card-DGU2jav_.mjs";
import { Gt as IdCard, R as ShieldOff, ct as Phone, jt as LoaderCircle, nn as FileText } from "./_libs/lucide-react.mjs";
import { t as useTranslation } from "./_libs/react-i18next.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { r as useSite } from "./_ssr/SiteContext-Br0kF93Q.mjs";
import { x as fetchEmergencyContactsWordPress } from "./_ssr/source.wordpress-extended-FYtgdTd3.mjs";
import { l as fetchInformationCardCaredOneIdWordPress, u as fetchInformationCardContactIdsWordPress, zn as useSharedInformationCard } from "./_ssr/use-care-data-7GR_eJDG.mjs";
import { a as useParams$1, i as useNavigate$1 } from "./_ssr/router-compat-DbWBz8c6.mjs";
import { n as SheetLocationTag, r as useInfoSheetKnowledge, t as SheetAIPanel } from "./_ssr/info-sheet-parts-cOh0dpOg.mjs";
import { t as BrandMark } from "./_ssr/BrandMark-Czr1po2V.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_token-CUeGdlZO.js
var import_jsx_runtime = require_jsx_runtime();
function SharedInformationCard() {
	const { i18n } = useTranslation();
	const site = useSite();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const { token } = useParams$1();
	const navigate = useNavigate$1();
	const { data: card, isLoading, isError, error } = useSharedInformationCard(token || null);
	const denied = error?.reason;
	const { data: caredOneId } = useQuery({
		queryKey: ["sharedCardCaredOne", card?.id],
		queryFn: () => fetchInformationCardCaredOneIdWordPress(String(card?.id)),
		enabled: !!card?.id
	});
	const { data: contactIds } = useQuery({
		queryKey: ["sharedCardContactIds", card?.id],
		queryFn: () => fetchInformationCardContactIdsWordPress(String(card?.id)),
		enabled: !!card?.id
	});
	const { data: contacts } = useQuery({
		queryKey: [
			"sharedCardContacts",
			caredOneId,
			contactIds?.join(",")
		],
		queryFn: async () => {
			if (!caredOneId || !contactIds?.length) return [];
			const all = await fetchEmergencyContactsWordPress(String(caredOneId));
			const selected = new Set(contactIds.map(String));
			return (all || []).filter((contact) => selected.has(String(contact.id)));
		},
		enabled: !!caredOneId && !!contactIds
	});
	const knowledge = useInfoSheetKnowledge(caredOneId ? String(caredOneId) : null);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/div/0",
		"data-inspector-source": "pages/SharedInformationCard.tsx:53:7:517cf069b4dda4e3d391060a12d67b2afe19bcc84a71e2c41f4045bb0c3f36ce:1",
		className: "min-h-screen flex items-center justify-center bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/h1/bbeebd879e1d/0",
			"data-inspector-source": "pages/SharedInformationCard.tsx:54:9:d8ff92ab70b6f03ff0a4603088221fc513c95baaed2ad0002c696ecd2490e350:1",
			className: "sr-only",
			children: Z("正在加载信息卡", "Loading information card")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/Loader2/0",
			"data-inspector-source": "pages/SharedInformationCard.tsx:55:9:d5d215d0810a75c3753b16359fe15b0cd7ae95963855008c89d876d7e051c7b9:1",
			className: "h-6 w-6 animate-spin text-muted-foreground"
		})]
	});
	if (isError || !card) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/div/1",
		"data-inspector-source": "pages/SharedInformationCard.tsx:62:7:3e14e6625b2e3598c25403725c0e37b734d9f814ee899e2dd9ab2ce9776eb7eb:1",
		className: "min-h-screen flex items-center justify-center bg-background p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/div/2e8f13a33bb3/0",
			"data-inspector-source": "pages/SharedInformationCard.tsx:63:9:0d4e5dd40d67fd63efaf15ee06fe227e76548a534a997d430db99bae7ed6f8f1:1",
			className: "text-center max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldOff, {
					"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/ShieldOff/0",
					"data-inspector-source": "pages/SharedInformationCard.tsx:64:11:081b31050b2028fb2cb5bedbf2a4cd01118c17a8cdd2c2115cd49a7f8ee7dc87:1",
					className: "h-10 w-10 text-muted-foreground mx-auto mb-3"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/h1/bbeebd879e1d/1",
					"data-inspector-source": "pages/SharedInformationCard.tsx:65:11:24482a3ed80689e354571d1ddd1904add88d1c6c78d060c8f473f4700d33fd29:1",
					className: "text-lg font-semibold mb-1",
					children: Z("暂时无法查看这张信息卡", "This information card is unavailable")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/p/b3045eae3d59/0",
					"data-inspector-source": "pages/SharedInformationCard.tsx:66:11:524b88d37330a95265f552d39cc5b6e334e810a973f51a5df2e65cae42fdeea5:1",
					className: "text-sm text-muted-foreground",
					children: denied === "login" ? Z("这张信息卡目前不对访客开放。如果您是获准查看的亲友或护理者，请先登录；如需帮助，请联系被护理者的家人。", "This card is not open to visitors. Sign in if you have access, or contact the cared one’s family for help.") : denied === "forbidden" ? Z("这张信息卡目前不对您开放。如需查看，请联系被护理者的家人确认访问权限。", "This card is not currently available to you. Please contact the cared one’s family to request access.") : Z("未找到这张信息卡，或暂时无法加载。如需帮助，请联系被护理者的家人。", "This card could not be found or loaded. Please contact the cared one’s family for help.")
				}),
				denied === "login" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/Button/aebb01759859/0",
					"data-inspector-source": "pages/SharedInformationCard.tsx:72:13:886c39680680619f842bc51725282c12e7e1b1445c0d9b438bdd025f2286e9da:1",
					variant: "link",
					onClick: () => navigate("/auth", { state: { from: `/share/card/${token}` } }),
					className: "inline-block mt-4 text-sm font-medium text-primary underline",
					children: Z("登录", "Sign in")
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/div/2",
		"data-inspector-source": "pages/SharedInformationCard.tsx:80:5:6522dd5630c5532b531b30dd6f48504667ec319e02c30f079c9db8aae5ac6c6a:1",
		className: "min-h-screen bg-background py-8 px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/div/3",
			"data-inspector-source": "pages/SharedInformationCard.tsx:81:7:01c45e01d997b47c62b1dbe2256c97014c529e152300682b63aab5a1719bc79c:1",
			className: "max-w-md mx-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/Card/0",
				"data-inspector-source": "pages/SharedInformationCard.tsx:82:9:73602f248323b46519853e67974b6d547d80acaa047251fd94599666592ae1c9:1",
				className: "card-elevated",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/CardContent/75d4a7bd6f8b/0",
					"data-inspector-source": "pages/SharedInformationCard.tsx:83:11:e5e86fecd9c0607448417e8edf2c5adf70a550b8a48351e8f67dd74bda80bb5e:1",
					className: "p-6 space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/div/4",
							"data-inspector-source": "pages/SharedInformationCard.tsx:84:13:16b268d9aa91b80ed65521ff229307b7d6f34741a166fb34ff25098442df861c:1",
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/div/5",
								"data-inspector-source": "pages/SharedInformationCard.tsx:85:15:bf4116fdadcc51e15bf6645ccfa8811cab87014f976c6d7e264070cbd325efa7:1",
								className: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdCard, {
									"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/IdCard/0",
									"data-inspector-source": "pages/SharedInformationCard.tsx:86:17:e284899a76ade59a4d63304532b1323c91187247f637b70aa32682b46c951930:1",
									className: "h-5 w-5 text-primary"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/div/e89cb49c0565/0",
								"data-inspector-source": "pages/SharedInformationCard.tsx:88:15:54396a800b0d416812af825348b89ec989bb8001cc0a949713d8dd15c8a57fba:1",
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/h1/5b5b35cedb92/0",
										"data-inspector-source": "pages/SharedInformationCard.tsx:89:17:2178c8ddf4033f8aa9007cba53e81ee81252a2845c19677c9e9c8d32f4d2ab4a:1",
										className: "text-lg font-semibold leading-tight break-words",
										children: card.cared_ones_information_card_name || Z("被照护者信息卡", "Cared one information card")
									}),
									card.cared_ones_name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/p/67ea9c214070/0",
										"data-inspector-source": "pages/SharedInformationCard.tsx:92:42:82a8e7996b3227d6dc69143d98e411f8613b06809654d95555d14a30bf9b1b18:1",
										className: "text-sm text-muted-foreground mt-0.5",
										children: card.cared_ones_name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/div/7c2f489c1401/0",
										"data-inspector-source": "pages/SharedInformationCard.tsx:93:17:3ca98a006088acaaf6f5ab2839ba2b91c942367699b27a87cebd273e2d784a5a:1",
										className: "flex items-center gap-1 mt-1.5 flex-wrap",
										children: card.displays_location === "Yes" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetLocationTag, {
											"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/SheetLocationTag/0",
											"data-inspector-source": "pages/SharedInformationCard.tsx:94:56:8dbe56bbf5afe2d7448b8ba485dea3482d8e4e6e47f81aa9965ecb856e27d0cf:1",
											caredOneId: caredOneId ? String(caredOneId) : null,
											caredOneName: card.cared_ones_name || Z("被护理者", "Cared one")
										})
									})
								]
							})]
						}),
						card.cared_ones_description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/section/0",
							"data-inspector-source": "pages/SharedInformationCard.tsx:100:15:2e492ad6c88290bfa58fd2e6e1fd269b2d1803ae383d77ad1e06a7c5dd3cf777:1",
							className: "border-t pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/h2/bbeebd879e1d/0",
								"data-inspector-source": "pages/SharedInformationCard.tsx:101:17:354fce9afb1981e6d12c7c334c8f927685ee10722faa39c3820a2c3770d4113c:1",
								className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
										"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/FileText/0",
										"data-inspector-source": "pages/SharedInformationCard.tsx:102:19:4137183f080261ea05889f2c9a4446f3271568775c7d6816829732a289a1b8fe:1",
										className: "h-3 w-3"
									}),
									" ",
									Z("基本情况", "Background")
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/p/74db6624c29c/0",
								"data-inspector-source": "pages/SharedInformationCard.tsx:104:17:31880a753581c3012f70ac06c8e3b6618d502ad61870b609f41f5fcca093a2cb:1",
								className: "text-sm text-foreground whitespace-pre-wrap leading-relaxed",
								children: card.cared_ones_description
							})]
						}),
						card.cared_ones_information_card_description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/section/1",
							"data-inspector-source": "pages/SharedInformationCard.tsx:109:15:2e492ad6c88290bfa58fd2e6e1fd269b2d1803ae383d77ad1e06a7c5dd3cf777:1",
							className: "border-t pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/h2/bbeebd879e1d/1",
								"data-inspector-source": "pages/SharedInformationCard.tsx:110:17:c46110028f1176e721ec282ab993e61d37995583401b1d94a1a040ca7b936b0d:1",
								className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2",
								children: Z("这次的具体安排", "What's needed this time")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/p/aaed2d508452/0",
								"data-inspector-source": "pages/SharedInformationCard.tsx:111:17:c819d9c7ce8c3092fc35f7bd5b0dd0136e979afb668e47e46737d58bf381a977:1",
								className: "text-sm text-foreground whitespace-pre-wrap leading-relaxed",
								children: card.cared_ones_information_card_description
							})]
						}),
						!!contacts?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/section/2",
							"data-inspector-source": "pages/SharedInformationCard.tsx:116:15:2e492ad6c88290bfa58fd2e6e1fd269b2d1803ae383d77ad1e06a7c5dd3cf777:1",
							className: "border-t pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/h2/bbeebd879e1d/2",
								"data-inspector-source": "pages/SharedInformationCard.tsx:117:17:88cffbfef09ef619d31c84c63a7af1fb4eebd08666802fe2115f87c6cc464727:1",
								className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2",
								children: Z("紧急联系人", "Emergency contacts")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/div/2ceef507de8d/0",
								"data-inspector-source": "pages/SharedInformationCard.tsx:118:17:17d9d6c09ea299a8a60db95751c360e55c1db680a84cb8451206c49e7d794eb0:1",
								className: "space-y-2",
								children: contacts.map((contact) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/a/0",
									"data-inspector-source": "pages/SharedInformationCard.tsx:120:21:8f1dbcca9f456699aa8dbdd43edb0c07fef1b77410336d327326f8af392c5e46:1",
									href: `tel:${contact.phone}`,
									className: "flex items-start gap-3 rounded-md border p-3 hover:bg-accent transition",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, {
										"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/Phone/0",
										"data-inspector-source": "pages/SharedInformationCard.tsx:121:23:7b07fcc199fe7a5ff0d1c855875e3c6e1421755443119bf447aee6ed7de963f8:1",
										className: "h-4 w-4 text-primary shrink-0 mt-0.5"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/div/413587df01e2/0",
										"data-inspector-source": "pages/SharedInformationCard.tsx:122:23:3419996d9a0e0138ac301892b896a385b2c7f79134718d1e7e699e15472f92c3:1",
										className: "min-w-0 flex-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/div/9d48f46706a0/0",
												"data-inspector-source": "pages/SharedInformationCard.tsx:123:25:c6a804aea9ec5d6f7ce60bbbbec46a54df26ebe729bd459ab1e2e327bce87ae9:1",
												className: "text-sm font-medium truncate",
												children: contact.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/div/09d0691971f1/0",
												"data-inspector-source": "pages/SharedInformationCard.tsx:124:25:d7224e6bc8dd16aa9ce1ae16e2f6f2ab5e22052bc60ca08f0d248c9239076d70:1",
												className: "text-xs text-muted-foreground truncate",
												children: [contact.phone, contact.relationship ? ` • ${contact.relationship}` : ""]
											}),
											contact.content && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/div/06a29e1a7c33/0",
												"data-inspector-source": "pages/SharedInformationCard.tsx:125:45:a383a33a59acd6317a4f3c3f08614a964b572da3407bc2591515ed5957cb4cce:1",
												className: "text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap",
												children: contact.content
											}),
											contact.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/div/5a253621dbc7/0",
												"data-inspector-source": "pages/SharedInformationCard.tsx:126:45:a3891dd8797ac6eccc81544053c820b6c9938218cb0eda688c916d1c0d611736:1",
												className: "text-xs text-muted-foreground mt-0.5",
												children: contact.address
											}),
											contact.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/div/9476dd03fe5d/0",
												"data-inspector-source": "pages/SharedInformationCard.tsx:127:42:5f8178287df8b5e7a3146f39d662c1a03ac90f4b5fcd336cb192eb3345b0cb64:1",
												className: "text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap",
												children: contact.note
											})
										]
									})]
								}, contact.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetAIPanel, {
							"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/SheetAIPanel/0",
							"data-inspector-source": "pages/SharedInformationCard.tsx:135:13:11eb285e9c435102df76cc038e11450397099dffe0f2a5cf2165b01efb44dbc9:1",
							context: {
								sheetName: card.cared_ones_information_card_name,
								caredOneName: card.cared_ones_name,
								description: card.cared_ones_description,
								situationDetails: card.cared_ones_information_card_description,
								contacts: contacts || [],
								knowledge
							}
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/div/6",
				"data-inspector-source": "pages/SharedInformationCard.tsx:147:9:eca70036c8cdbb277b191d8bc2e40ac43addd5b23c6491c098399f1e31c6dd05:1",
				className: "mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {
					"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/BrandMark/0",
					"data-inspector-source": "pages/SharedInformationCard.tsx:148:11:b8e0ce79d9407efd9e713de04b379211cb874a7c4a70080b5ef85485eeef4a71:1",
					size: 20
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"data-inspector-id": "pages/SharedInformationCard/SharedInformationCard/span/5f6e3c63c5d5/0",
					"data-inspector-source": "pages/SharedInformationCard.tsx:149:11:ee42b035baa92b6b66c194da8c0d8bcda2e53d4d7fc14d2cdb40d6e2a82cc859:1",
					children: isCN ? `由${site.name}分享` : `Shared via ${site.name}`
				})]
			})]
		})
	});
}
var SplitComponent = SharedInformationCard;
//#endregion
export { SplitComponent as component };
