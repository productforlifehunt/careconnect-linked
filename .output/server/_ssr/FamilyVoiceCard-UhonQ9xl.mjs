import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Input } from "./input-JWLlmFeK.mjs";
import { t as Textarea } from "./textarea-ZNemOC_7.mjs";
import { E as Square, Pn as Check, _n as CloudUpload, at as Play, et as RefreshCw, jt as LoaderCircle, n as X, ut as Pencil, xt as Mic, y as Trash2 } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-CCayJGqJ.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { c as updateSavedFamilyVoice, i as onFamilyVoicesChanged, n as listFamilyVoices, o as saveFamilyVoiceRecording, r as loadSavedFamilyVoices, s as savedVoiceAudio, t as importLocalFamilyVoices } from "./family-voices-BRkSukdj.mjs";
import { n as FAMILY_VOICE_STATE } from "./schema-C7za4mA0.mjs";
import { s as transcribeAudio, t as VoiceRecorder } from "./ai-CfmTn5iV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/FamilyVoiceCard-UhonQ9xl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SAMPLE_ZH = "今天天气不错，我刚吃完饭。家里一切都好，你别担心。等会儿有人来帮忙，你跟他好好说话。我晚点再给你打电话。";
var SAMPLE_EN = "The weather is nice today and I just had lunch. Everything at home is fine, don't worry. Someone is coming to help soon, please be kind to them. I'll call you again later.";
function FamilyVoiceCard({ caredOneId, caredOneName }) {
	const { i18n } = useTranslation();
	const zh = i18n.language?.startsWith("zh");
	const id = String(caredOneId).replace(/^wp-/, "");
	const [voices, setVoices] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [loadFailed, setLoadFailed] = (0, import_react.useState)(false);
	const [localCount, setLocalCount] = (0, import_react.useState)(0);
	const [label, setLabel] = (0, import_react.useState)("");
	const [recording, setRecording] = (0, import_react.useState)(false);
	const [seconds, setSeconds] = (0, import_react.useState)(0);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const [draftName, setDraftName] = (0, import_react.useState)("");
	const [previewVoiceId, setPreviewVoiceId] = (0, import_react.useState)("");
	const [previewText, setPreviewText] = (0, import_react.useState)("");
	const [playingId, setPlayingId] = (0, import_react.useState)(null);
	const audio = (0, import_react.useRef)(null);
	const rec = (0, import_react.useRef)(null);
	const timer = (0, import_react.useRef)(null);
	const secs = (0, import_react.useRef)(0);
	const dictationRec = (0, import_react.useRef)(null);
	const [dictating, setDictating] = (0, import_react.useState)(false);
	const [transcribing, setTranscribing] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let alive = true;
		const load = () => {
			setLoading(true);
			loadSavedFamilyVoices(id).then((rows) => {
				if (!alive) return;
				setVoices(rows);
				setLoadFailed(false);
				setLocalCount(listFamilyVoices(id).filter((v) => !rows.some((r) => r.voiceId === v.voiceId)).length);
			}).catch((e) => {
				if (alive) {
					setLoadFailed(true);
					setError(e instanceof Error ? e.message : "Voices could not be loaded");
				}
			}).finally(() => {
				if (alive) setLoading(false);
			});
		};
		load();
		const unsubscribe = onFamilyVoicesChanged(load);
		return () => {
			alive = false;
			unsubscribe();
		};
	}, [id]);
	(0, import_react.useEffect)(() => {
		setPreviewVoiceId((current) => voices.some((v) => v.id === current) ? current : voices[0]?.id || "");
	}, [voices]);
	(0, import_react.useEffect)(() => () => {
		audio.current?.pause();
		if (timer.current) clearInterval(timer.current);
		rec.current?.cancel();
		dictationRec.current?.cancel();
	}, []);
	const startDictation = async () => {
		if (recording || busy || dictating || transcribing) return;
		setError(null);
		audio.current?.pause();
		setPlayingId(null);
		const recorder = new VoiceRecorder();
		dictationRec.current = recorder;
		try {
			await recorder.start();
			setDictating(true);
		} catch {
			recorder.cancel();
			dictationRec.current = null;
			setError(zh ? "无法使用麦克风，请允许麦克风权限。" : "Microphone unavailable — please allow access.");
		}
	};
	const stopDictation = async () => {
		const recorder = dictationRec.current;
		dictationRec.current = null;
		setDictating(false);
		if (!recorder) return;
		setTranscribing(true);
		setError(null);
		try {
			const blob = await recorder.stop();
			if (!blob) throw new Error(zh ? "没有录到声音，请再说一次。" : "Nothing was recorded — please try again.");
			const text = await transcribeAudio(blob, zh ? "zh" : "en");
			if (!text) throw new Error(zh ? "没听清，请再说一次。" : "Didn't catch that — please try again.");
			setPreviewText((current) => [current.trim(), text].filter(Boolean).join(" ").slice(0, 2e3));
		} catch (e) {
			setError((zh ? "语音输入失败：" : "Voice input failed: ") + (e instanceof Error ? e.message : String(e)));
		} finally {
			setTranscribing(false);
		}
	};
	const start = async () => {
		setError(null);
		try {
			rec.current = new VoiceRecorder(true);
			await rec.current.start();
			setRecording(true);
			setSeconds(0);
			secs.current = 0;
			timer.current = window.setInterval(() => {
				secs.current += 1;
				setSeconds(secs.current);
				if (secs.current >= 60) stop();
			}, 1e3);
		} catch {
			setError(zh ? "无法使用麦克风，请允许麦克风权限。" : "Microphone unavailable — please allow access.");
		}
	};
	const stop = async () => {
		if (timer.current) {
			clearInterval(timer.current);
			timer.current = null;
		}
		const r = rec.current;
		rec.current = null;
		setRecording(false);
		if (!r) return;
		const blob = await r.stop();
		if (!blob || secs.current < 10) {
			setError(zh ? "录音太短，请连续朗读 10–20 秒。" : "Too short — read for 10–20 seconds.");
			return;
		}
		const pcm = new Int16Array(await blob.slice(44).arrayBuffer());
		let peak = 0;
		for (let i = 0; i < pcm.length; i++) {
			const a = Math.abs(pcm[i] ?? 0);
			if (a > peak) peak = a;
		}
		if (peak < 300) {
			setError(zh ? "没有录到声音：麦克风收到的是静音。请检查浏览器麦克风权限、系统输入设备是否选对、是否静音，然后靠近麦克风重新录。" : "No sound was captured — the microphone recorded silence. Check mic permission, the selected input device and mute, then record again closer to the mic.");
			return;
		}
		setBusy("new");
		try {
			const voice = await saveFamilyVoiceRecording(id, label.trim() || (zh ? "亲友声音" : "Family voice"), blob);
			if (voice.state !== FAMILY_VOICE_STATE.ready) setError((zh ? "原始录音已保存，复刻未完成：" : "Original saved; cloning incomplete: ") + voice.error);
			setLabel("");
		} catch (e) {
			setError((zh ? "声音复刻失败：" : "Voice cloning failed: ") + (e?.message || ""));
		} finally {
			setBusy(null);
		}
	};
	const test = async (v, text) => {
		audio.current?.pause();
		setPlayingId(null);
		setBusy(v.id);
		setError(null);
		try {
			const { audioBase64 } = await savedVoiceAudio(v, text?.trim() || (zh ? `你好，我是${v.label}。` : `Hi, it's ${v.label}.`));
			const player = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
			player.volume = 1;
			audio.current = player;
			player.onended = () => setPlayingId(null);
			player.onerror = () => {
				setPlayingId(null);
				setError(zh ? "音频播放失败，请重新试听。" : "Audio playback failed. Please try again.");
			};
			await player.play();
			setPlayingId(v.id);
		} catch (e) {
			setPlayingId(null);
			setError((zh ? "试听失败：" : "Preview failed: ") + (e?.message || ""));
		} finally {
			setBusy(null);
		}
	};
	const saveName = async (v) => {
		if (!draftName.trim()) return;
		try {
			await updateSavedFamilyVoice("rename", v, draftName.trim());
			setEditingId(null);
		} catch {
			setError(zh ? "改名未保存，请重试。" : "Name was not saved. Please try again.");
		}
	};
	const remove = async (v) => {
		if (playingId === v.id) {
			audio.current?.pause();
			setPlayingId(null);
		}
		setBusy(v.id);
		try {
			await updateSavedFamilyVoice("delete", v);
		} catch {
			setError(zh ? "声音未删除，已保留，请重试。" : "Voice was not deleted. It has been kept; please retry.");
		} finally {
			setBusy(null);
		}
	};
	const original = async (v) => {
		setBusy(v.id);
		setError(null);
		audio.current?.pause();
		try {
			const result = await savedVoiceAudio(v);
			const player = new Audio(`data:${result.mime};base64,${result.audioBase64}`);
			player.volume = 1;
			audio.current = player;
			await player.play();
			setPlayingId(v.id);
			player.onended = () => setPlayingId(null);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Original recording unavailable");
		} finally {
			setBusy(null);
		}
	};
	const retry = async (v) => {
		setBusy(v.id);
		setError(null);
		try {
			await updateSavedFamilyVoice("retry", v);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Retry failed");
		} finally {
			setBusy(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/div/0",
		"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:171:5:ca58dfc20fbae0198e02d1b126f71b4c2aedc6fbb1576a0f9f4fad0a6e7ad6d3:1",
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/h2/0",
				"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:173:9:6c698202993257fe33e198d4b1bce6eed31ada8b354a289e1e6ef6f2fd561de1:1",
				className: "text-lg font-semibold text-foreground",
				children: zh ? "亲友声音" : "Family Voices"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/p/0",
				"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:174:9:b2f0a238223c5c6503b9874bcb3b135c0f53dc3a8524def68f71dd8a6333cbc1:1",
				className: "text-sm text-muted-foreground",
				children: zh ? `${caredOneName}的亲友声音` : `${caredOneName}'s family voices`
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/div/1",
				"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:179:7:a330f53e633bde11aec66864898e596d0e2a910a16146d64dffa99d7a2135e86:1",
				className: "border-t pt-4 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/Input/744d70175e3f",
						"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:180:9:7004dd9ded8e8a60d992c2c58eeec5a48d89af1482040106ebf9f41f12b1db1a:1",
						value: label,
						onChange: (e) => setLabel(e.target.value),
						placeholder: zh ? "这是谁的声音，例如：女儿小红" : "Whose voice, e.g. daughter Amy"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/div/2",
						"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:181:9:3a721ad901562cb7e95d499c4ca9d0649eb640b8407cadc963c25b139cf053b4:1",
						className: "rounded-lg bg-muted/50 p-3 text-sm text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/p/1",
							"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:182:11:c5c5f1d8e5a037551edbb533ab11df98041f2d97696b98e539bccdcdeee53bc4:1",
							className: "mb-1 text-xs text-muted-foreground",
							children: zh ? "在安静的地方，用平常的语气朗读（建议 10–20 秒；读完可手动停止，最长 60 秒）：" : "In a quiet place, read naturally (10–20 seconds recommended; stop when finished, up to 60 seconds):"
						}), zh ? SAMPLE_ZH : SAMPLE_EN]
					}),
					recording ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/Button/6c45cb72a36e",
						"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:186:11:d87991ccd3684086c9c950e4adb8ebd6b129128c73f14b62419c276d124e5244:1",
						onClick: () => void stop(),
						variant: "destructive",
						className: "w-full",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "h-4 w-4 mr-1" }),
							" ",
							zh ? `停止并复刻（${seconds} 秒）` : `Stop & clone (${seconds}s)`
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/Button/cced28c6dc3f",
						"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:190:11:d4911e87d0f5ac9f3665e49b69e5b7bcdfd914ea209ad67b92c84b46f22dcda8:1",
						onClick: () => void start(),
						disabled: loading || loadFailed || busy !== null || dictating || transcribing,
						className: "w-full",
						children: [busy === "new" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mr-1 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "h-4 w-4 mr-1" }), busy === "new" ? zh ? "正在复刻声音…" : "Cloning voice…" : zh ? "开始录音" : "Start recording"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/div/3",
				"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:197:7:293654f1b55fbd0f45154f2452fafc5ae095e31fc8cfd19257d608f7f96df07e:1",
				className: "space-y-2",
				children: [
					loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/Loader2/0",
						"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:198:21:9f33ba4433b58e5cfbeb1ded04869051c43fe62c8caf36ec45008214dfa7443b:1",
						className: "h-5 w-5 animate-spin",
						"aria-label": zh ? "正在读取声音" : "Loading voices"
					}),
					loadFailed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/Button/afece5179522",
						"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:199:24:2c77dee386add8481f2878bf071fafbb07597d6e1550ca1f703cd35767639903:1",
						variant: "outline",
						onClick: () => {
							window.dispatchEvent(new Event("family-voices-changed"));
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4 mr-1" }), zh ? "重新读取" : "Retry loading"]
					}),
					localCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/p/2",
							"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:200:55:99bbeceebb07267249e53a75d5f6af77aa34dc169f314df76cee8e336f63daa2:1",
							className: "text-sm text-muted-foreground",
							children: zh ? `另有 ${localCount} 个旧声音尚未储存；没有原始录音。` : `${localCount} older voices not yet saved; original recordings unavailable.`
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/Button/1177c5834db4",
							"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:200:225:99bbeceebb07267249e53a75d5f6af77aa34dc169f314df76cee8e336f63daa2:1",
							variant: "outline",
							disabled: loading || loadFailed || busy !== null,
							onClick: async () => {
								setBusy("import");
								try {
									await importLocalFamilyVoices(id);
								} catch (e) {
									setError(e instanceof Error ? e.message : "Import failed");
								} finally {
									setBusy(null);
								}
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "h-4 w-4 mr-1" }), zh ? "储存" : "Save"]
						})]
					}),
					!loading && !loadFailed && voices.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/p/3",
						"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:201:60:7b7e926f35e7c958c8b876701c72116025dc752a2da844a2f811e9f9ccd8c59e:1",
						className: "text-sm text-muted-foreground",
						children: zh ? "还没有录制的声音。" : "No voices yet."
					}),
					voices.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/div/4",
						"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:203:11:cd60d271c5ca80a400144235f7415ebcc64dbe833b69c1789b30910bef76236b:1",
						className: "flex flex-wrap items-center gap-2 rounded-lg border p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/div/5",
								"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:204:13:f46ae6889abb1a936ade348011002481ba6b7aa9a819fbf62faaa3d7d137babb:1",
								className: "min-w-0 flex-1",
								children: [
									editingId === v.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/Input/e1efce62c587",
												"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:207:19:2b6c49290e9d4d87963295deb37bf561dfff037edb421c2320879de4a7218526:1",
												autoFocus: true,
												"aria-label": zh ? "声音名称" : "Voice name",
												value: draftName,
												onChange: (e) => setDraftName(e.target.value),
												onKeyDown: (e) => {
													if (e.key === "Enter") saveName(v);
													if (e.key === "Escape") setEditingId(null);
												}
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/Button/500d6d95ad89",
												"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:208:19:094212d5ae649e12b4b7c8d2a8888d131fed414b7577b5a80780c2cc9e9d835f:1",
												size: "icon",
												variant: "ghost",
												disabled: !draftName.trim(),
												onClick: () => saveName(v),
												"aria-label": zh ? "保存名称" : "Save name",
												title: zh ? "保存名称" : "Save name",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/Button/a492e4620da1",
												"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:209:19:b7435fee0158f88e4ef027a89b0387025a70b3b0d141412aff26acfe25503c6c:1",
												size: "icon",
												variant: "ghost",
												onClick: () => setEditingId(null),
												"aria-label": zh ? "取消改名" : "Cancel rename",
												title: zh ? "取消改名" : "Cancel rename",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
											})
										]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/p/4",
										"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:211:19:28fbc37b523da43a3e3aeaa7aede48d5311830222657856b0dca70fdff17d44c:1",
										className: "font-medium text-foreground break-words",
										children: v.label
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/p/5",
										"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:212:15:39c399a48b75394418e31c04b72f270fd1bf2ed8c1e6f7a87c7ee6648232df45:1",
										className: "text-xs text-muted-foreground",
										children: new Date(v.createdAt).toLocaleString()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/p/6",
										"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:213:15:f347c5ebd2382dc57dbf4e3638c7095854976dc5a3f55ae5025645bedcdb379a:1",
										className: "text-xs text-muted-foreground",
										children: [v.audioSaved ? zh ? "原始录音已保存" : "Original recording saved" : zh ? "旧声音，无原始录音" : "Older voice, no original recording", v.state !== FAMILY_VOICE_STATE.ready ? zh ? " · 复刻未完成" : " · Cloning incomplete" : ""]
									}),
									v.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/p/7",
										"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:214:27:03a433ac3f548ffdd6041b638f32420878c9b9e38fd7095a990a17306f98997e:1",
										className: "text-xs text-destructive",
										children: v.error
									})
								]
							}),
							editingId !== v.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/Button/564f91557e67",
								"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:216:36:8d30b18fe8b919f55ea5fca7a6b51c9c9ecf1f559e3577ac210a0b540831d53b:1",
								size: "sm",
								variant: "ghost",
								onClick: () => {
									setEditingId(v.id);
									setDraftName(v.label);
								},
								"aria-label": zh ? `改名：${v.label}` : `Rename: ${v.label}`,
								title: zh ? "改名" : "Rename",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
							}),
							v.audioSaved && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/Button/e0aa47724ebe",
								"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:217:30:92edeac2df4ac56fdbed7a2fd7de5198904cc6fbabe4d897f089dcd5fbd9383f:1",
								size: "sm",
								variant: "ghost",
								onClick: () => void original(v),
								disabled: busy !== null || recording,
								"aria-label": zh ? "听原始录音" : "Play original recording",
								title: zh ? "听原始录音" : "Play original recording",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "h-4 w-4 mr-1" }), zh ? "原音" : "Original"]
							}),
							v.audioSaved && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/Button/cccce3142a42",
								"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:218:30:c450005e91707c680370574c30a55ea90f30186f57efc45e504c7843ea17d076:1",
								size: "sm",
								variant: "ghost",
								onClick: () => void retry(v),
								disabled: busy !== null || recording,
								"aria-label": zh ? "从原始录音重新复刻" : "Reclone original recording",
								title: zh ? "从原始录音重新复刻" : "Reclone original recording",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/Button/6ebc85045927",
								"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:219:13:6600c3ab8eaaa816e0b32af8ac2975e2737e0bf7b50cd25feb022ba082596767:1",
								size: "sm",
								variant: "outline",
								onClick: () => void test(v),
								disabled: busy !== null || recording || v.state !== FAMILY_VOICE_STATE.ready,
								"aria-label": zh ? "试听" : "Preview",
								title: zh ? "试听" : "Preview",
								children: busy === v.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/Button/b4b47bda7a09",
								"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:222:13:6819c2c765d65f56186c270b8fcb3f5a2114f52bc0efb0eb7cc048e67404a3a9:1",
								size: "sm",
								variant: "ghost",
								onClick: () => void remove(v),
								disabled: busy !== null || recording,
								"aria-label": zh ? "删除" : "Delete",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
							})
						]
					}, v.id))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3 border-t pt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/h3/0",
						"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:229:9:0f02533c703c0f2eabff01a4fe052b9eca1c6f87f5ecaceb58368aef3c73417e:1",
						className: "font-semibold text-foreground",
						children: zh ? "文字试听" : "Text preview"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/Select/6f776b0047b1",
						"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:230:9:8cfece35bcb3e46cdd35d48b834b03a1e1dab1d749574efdf42c1ed36f292d55:1",
						value: previewVoiceId,
						onValueChange: setPreviewVoiceId,
						disabled: !voices.length || busy !== null,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/SelectTrigger/0",
							"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:231:11:6c92881cf7f9278bca56ae5744a27330493edd8db5b5df39a02e1db0a802eef7:1",
							"aria-label": zh ? "试听声音" : "Preview voice",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {
								"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/SelectValue/0",
								"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:231:69:6c92881cf7f9278bca56ae5744a27330493edd8db5b5df39a02e1db0a802eef7:1",
								placeholder: zh ? "选择亲友声音" : "Choose a family voice"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
							"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/SelectContent/0",
							"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:232:11:18a73db58f993da2dfd7f8b0b60ba2c74b5f2891b250b3cf717df64b62412223:1",
							children: voices.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/SelectItem/0",
								"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:232:45:18a73db58f993da2dfd7f8b0b60ba2c74b5f2891b250b3cf717df64b62412223:1",
								value: v.id,
								children: v.label
							}, v.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/Textarea/f592f0b56272",
						"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:234:9:5914ad387941b8e57008b5435d8a2545c4e1d4129b3744a23fdcadc6c188a497:1",
						"aria-label": zh ? "试听文字" : "Preview text",
						value: previewText,
						onChange: (e) => setPreviewText(e.target.value),
						maxLength: 2e3,
						placeholder: zh ? "输入想让亲友声音说的话…" : "Enter the words for this voice…",
						className: "min-h-24"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/div/6",
						"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:235:9:f697fc11a1246dd6ca34e8fc22a710448faf7cef63f0c56a97f8d929a3ca6a39:1",
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/Button/c4a105e089fa",
								"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:236:11:81cdfffcd8ac2f347ac409d6eb3287b522e22bb87e27ce132333e2adb38585ca:1",
								variant: dictating ? "destructive" : "outline",
								disabled: recording || busy !== null || transcribing,
								onClick: () => void (dictating ? stopDictation() : startDictation()),
								children: [transcribing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : dictating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "mr-2 h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "mr-2 h-4 w-4" }), transcribing ? zh ? "正在转成文字…" : "Transcribing…" : dictating ? zh ? "停止并转文字" : "Stop & transcribe" : zh ? "语音输入" : "Voice input"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/Button/2ee209f9a568",
								"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:240:11:71b31d9e9e9ac6dcf606b52d1902f9b816085e88cba771a0a0dfb86e48d5aacc:1",
								disabled: !previewText.trim() || !previewVoiceId || busy !== null || recording || dictating || transcribing,
								onClick: () => {
									const voice = voices.find((v) => v.id === previewVoiceId);
									if (voice) test(voice, previewText);
								},
								children: [busy === previewVoiceId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "mr-2 h-4 w-4" }), busy === previewVoiceId ? zh ? "正在合成…" : "Synthesizing…" : zh ? "合成并播放" : "Synthesize & play"]
							}),
							playingId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/Button/998fd24d6f9f",
								"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:243:25:2281558e1a06211fc7c2b75c9a23f9a499279384c9e3f3ff93ff8c7eb730d8a4:1",
								variant: "outline",
								onClick: () => {
									audio.current?.pause();
									setPlayingId(null);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "mr-2 h-4 w-4" }), zh ? "停止播放" : "Stop playback"]
							})
						]
					})
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-id": "components/cared-ones/FamilyVoiceCard/FamilyVoiceCard/p/8",
				"data-inspector-source": "components/cared-ones/FamilyVoiceCard.tsx:246:17:fdb3063c335e245381a49ea2fe18f2ddfb0542fb0c1ffcf845ec4f321eea1d3d:1",
				role: "alert",
				className: "text-sm text-destructive",
				children: error
			})
		]
	});
}
//#endregion
export { FamilyVoiceCard };
