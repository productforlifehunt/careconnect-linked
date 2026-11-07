import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { En as CircleCheck, nn as FileText } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ConsentApp-ffBhHOwY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Informed-consent micro site (`/?__site=consent`).
*
* One static bilingual page for study participants: it states the interview
* study per standard consent convention and collects a single confirmation
* tap. It deliberately shows no care-app brand or navigation, keeps the
* ethics approval fields unnumbered (the approval letter's number and date
* fields are blank — never invent values), and persists nothing to any
* backend; the confirmation is a local, per-browser marker only.
*/
var STORAGE_KEY = "consent-confirmed:hznu-caregiver-study";
function localDate() {
	const d = /* @__PURE__ */ new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			"data-inspector-id": "pages/consent/ConsentApp/Section/h3/0",
			"data-inspector-source": "pages/consent/ConsentApp.tsx:26:7:378e69582d73d04b28b14df8344915e58277b9158b081bfc10c736292d5c3cdc:1",
			className: "text-base font-semibold text-foreground",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-inspector-id": "pages/consent/ConsentApp/Section/div/0",
			"data-inspector-source": "pages/consent/ConsentApp.tsx:27:7:271ddbdf5d64ffb7675375c1f19df757b3ef509021c1c8dd6daab56bb4219421:1",
			className: "text-sm leading-relaxed text-muted-foreground space-y-1",
			children
		})]
	});
}
function ConsentApp() {
	const [confirmed, setConfirmed] = (0, import_react.useState)(() => {
		try {
			return typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY) === "1";
		} catch {
			return false;
		}
	});
	const [confirmedAt, setConfirmedAt] = (0, import_react.useState)(null);
	const confirm = () => {
		const today = localDate();
		setConfirmed(true);
		setConfirmedAt(today);
		try {
			window.localStorage.setItem(STORAGE_KEY, "1");
		} catch {}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-dvh bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-2xl px-4 py-10 sm:py-14",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "text-center space-y-2 mb-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
									className: "h-5 w-5",
									"aria-hidden": "true"
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-bold tracking-tight text-foreground",
							children: "Informed Consent · 知情同意书"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "School of Nursing, Hangzhou Normal University · 杭州师范大学护理学院"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "pt-6 space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-muted/60 p-4 space-y-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold text-foreground",
									children: "Study: A Study of Home-Based Care and Caregiver Needs for People with Alzheimer's Disease"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold text-foreground",
									children: "项目名称：《阿尔茨海默症患者居家照顾现状与照顾者需求研究》"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Investigators: Jiang Guowei (doctoral candidate, principal investigator); Prof. Cao Shihua (co-supervising professor) · 项目负责人：江国维（博士生）；曹世华（合作博士生导师）"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "This study protocol and its informed consent form have been reviewed and approved by the Ethics Committee of the School of Nursing, Hangzhou Normal University. 本研究方案与知情同意书已经杭州师范大学护理学院伦理委员会审查通过。"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-semibold text-foreground",
									children: "English"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
									title: "1. Purpose of the study",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "You are invited to take part in a research study about home-based care for people with Alzheimer's disease and the needs of their family caregivers. The study aims to understand caregiving situations, common caregiving difficulties, how caregivers obtain knowledge and support, and how they cooperate with other caregivers, so that better caregiving support tools and services can be developed." })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
									title: "2. What participation involves",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "You may be asked to complete questionnaires, record your caregiving experiences over one week using a study platform, where you may write text or record voice or video, and take part in interviews. Taking part in each part of the study is your own choice." })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
									title: "3. Voluntary participation",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Participation is entirely voluntary. You may decline to answer any question or withdraw from the study at any time, without any penalty and without affecting any care or service you receive." })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
									title: "4. Risks and discomforts",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The study is expected to involve minimal risk. Some questions may touch on stressful caregiving experiences; you may skip any of them." })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
									title: "5. Privacy and confidentiality",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Your information will be stored securely, used only for this research, and handled in a way that protects your identity. Audio or video recordings are made only with your permission and are used only for research analysis. Results will be reported in written form, including anonymized quotations from interviews, and will not include any information that could identify you personally. Audio and video recordings will not be presented or played in any publication or public presentation of this study." })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
									title: "6. Contact",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "If you have any questions about the study or your rights as a participant, please contact the research team." })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border-t border-border",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-semibold text-foreground",
									children: "中文"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
									title: "一、研究目的",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "邀请您参加一项关于失智症患者居家照护及其家庭护理者需求的研究。研究希望了解护理者的照护情况、常见照护困难、照护知识与支持的获取方式，以及与其他护理者的合作情况，以便为开发更好的照护支持工具和服务提供依据。" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
									title: "二、参加内容",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "参加本研究可能需要您填写问卷，在一周内通过研究平台记录照护经历（可文字记录，也可语音或视频记录），并参加访谈。是否参加每一部分，均由您自行决定。" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
									title: "三、自愿参加",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "参加本研究完全自愿。您可以拒绝回答任何问题，也可以随时退出研究，这不会给您带来任何不利影响，也不会影响您获得的任何护理或服务。" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
									title: "四、风险与不适",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "本研究预期风险很小。部分问题可能涉及照护中压力较大的经历，您可以随时跳过。" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
									title: "五、隐私与保密",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "您的信息将被安全保存，仅用于本研究，并以保护您身份的方式处理。录音或录像仅在您允许的情况下进行，且仅用于研究分析。研究结果仅以文字形式呈现（包括引用访谈中的匿名原话），不会包含任何能够识别您个人身份的信息。录音与录像文件均不会在研究发表或公开演示中呈现。" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
									title: "六、联系方式",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "如您对本研究或作为参加者的权利有任何疑问，请与研究团队联系。" })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border-t border-border",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/consent/ConsentApp/ConsentApp/div/0",
							"data-inspector-source": "pages/consent/ConsentApp.tsx:164:13:ffa5068b2e51f2ff323fc8c1cc14dada55436c2f5011e3d8d64bbf57cc336bbf:1",
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm leading-relaxed text-foreground",
									children: "I have read and understood the information above, my questions have been answered, and I voluntarily agree to take part in this study."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm leading-relaxed text-foreground",
									children: "我已阅读并理解以上内容，我的疑问已得到解答，我自愿同意参加本研究。"
								}),
								confirmed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-3 rounded-lg border border-border bg-muted/60 p-4",
									role: "status",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
										className: "mt-0.5 h-5 w-5 shrink-0 text-primary",
										"aria-hidden": "true"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-foreground",
											children: "Consent confirmed · 已确认知情同意"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											"data-inspector-id": "pages/consent/ConsentApp/ConsentApp/p/0",
											"data-inspector-source": "pages/consent/ConsentApp.tsx:177:21:51c0f092e7c089af42019991739f7fa035345d18e177586028620e424b2135ee:1",
											className: "text-muted-foreground",
											children: [
												"Date: ",
												confirmedAt ?? "—",
												" · 日期：",
												confirmedAt ?? "—",
												"（本机记录）"
											]
										})]
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "pages/consent/ConsentApp/ConsentApp/Button/3f267c2ab422",
									"data-inspector-source": "pages/consent/ConsentApp.tsx:183:17:2704da883920a659068ebf2d7c80c43707e6d670bb120e845c831b3f372c9f8e:1",
									size: "lg",
									className: "w-full",
									onClick: confirm,
									children: "确认同意 · I agree"
								})
							]
						})
					]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-center text-xs text-muted-foreground",
					children: "Informed consent · 知情同意书 — School of Nursing, Hangzhou Normal University"
				})
			]
		})
	});
}
//#endregion
export { ConsentApp as default };
