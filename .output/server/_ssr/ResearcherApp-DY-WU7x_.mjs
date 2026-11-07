import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { a as getWPToken, c as wpLogin, i as getStoredWPUser, l as wpLogout, s as wpEnsureFreshToken, u as wpRefreshToken } from "./wp-auth-DL1jfVY7.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { E as Square, Ft as Link2, J as Save, Nn as ChevronDown, X as RotateCw, at as Play, er as Archive, it as Plus, jt as LoaderCircle, n as X, p as Upload, pt as Pause, un as Download, ut as Pencil, y as Trash2 } from "../_libs/lucide-react.mjs";
import { S as wpAdminOps } from "./woocommerce-api-BoF1FQHg.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-HRlnwchH.mjs";
import { l as createServerFn } from "./createServerFn-Be1RckzI.mjs";
import { t as createSsrRpc } from "./createSsrRpc-CcGKyhES.mjs";
import { a as objectType, o as stringType } from "../_libs/zod.mjs";
import { t as supabase } from "./client-Bxio8ppI.mjs";
import { r as MessageResponse } from "./message-CMaqMwb8.mjs";
import { t as Switch } from "./switch-Coli7fra.mjs";
import { k as translateSurveyText, n as ESM_REL, r as ESM_SPEC, t as ESM_CCT } from "./backend-BMNT7eGe.mjs";
import { t as Slider } from "./slider-D5YvUsBT.mjs";
import { t as useServerFn } from "./useServerFn-BEMTK175.mjs";
import { t as Progress } from "./progress-DfJ-TYmP.mjs";
import { n as CollapsibleContent$1, r as CollapsibleTrigger$1, t as Collapsible$1 } from "../_libs/radix-ui__react-collapsible.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ResearcherApp-DY-WU7x_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Interview role takes priority over legacy rows containing both personal sections. */
function screeningRole(name, row) {
	if (/\bSecondary caregiver\b/i.test(name)) return "secondary";
	if (/\bPrimary caregiver\b/i.test(name)) return "primary";
	const primaryAge = Number(row["a02"]) > 0;
	return primaryAge === Number(row["a134"]) > 0 ? null : primaryAge ? "primary" : "secondary";
}
function screeningItemsForRole(role) {
	const personal = ESM_SPEC.filter((item) => item.cct === "318" && item.group.startsWith(role === "primary" ? "1." : "2."));
	return role === "primary" ? personal : [...personal, ...ESM_SPEC.filter((item) => item.cct === "318" && item.code.startsWith("1.7."))];
}
/** Only cite explicitly defined scale bounds, never infer them from option codes. */
function scaleRangeLabel(item) {
	return item.scale ? `Scale / 量表范围：${item.scale.min}–${item.scale.max}` : null;
}
/** Original document references, not storage IDs or generated answer-key order. */
function screeningSource(item, role) {
	const sharedSecondary = role === "secondary" && item.code.startsWith("1.7.");
	const heading = sharedSecondary ? (item.block || item.group).replace(/^1\.7\./, "2.2.") : item.block || item.group;
	const headingCode = heading.match(/^\d+(?:\.\d+)*/)?.[0] ?? "";
	const name = heading.replace(/^\d+(?:\.\d+)*\s+/, "");
	const chineseName = translateSurveyText(name, true) ?? name;
	const root = role === "secondary" || item.group.startsWith("2.") ? "Secondary caregiver screening / 其他护理者初筛" : "Primary caregiver screening / 主护理者初筛";
	const unnumbered = headingCode === "1.2.7" || headingCode === "1.2.8";
	const unnumberedSecondaryEducation = role === "secondary" && item.id === "c318_a136";
	const singleSectionItem = item.code === "1.6";
	const position = unnumbered ? ESM_SPEC.filter((candidate) => candidate.cct === item.cct && candidate.block === heading).findIndex((candidate) => candidate.id === item.id) + 1 : singleSectionItem ? 1 : Number(item.code.split(".").at(-1));
	const reference = unnumbered ? headingCode : item.code;
	const followup = item.otherFor ? " · Other detail (unnumbered follow-up) / 其他补充（原文未单独编号）" : / caregiver distress$/.test(item.label) ? " · Caregiver distress / 护理者困扰" : / severity$/.test(item.label) ? " · Severity / 严重程度" : "";
	return {
		chineseLabel: translateSurveyText(item.label, true) ?? item.label,
		source: `${root} · ${name} / ${chineseName}`,
		reference: sharedSecondary ? `Original section ${headingCode}, item ${position} / 原问卷 ${headingCode} 节，第 ${position} 题` : unnumberedSecondaryEducation ? "Original section 2.1, Education Level (unnumbered) / 原问卷 2.1 节，教育程度（原文未单独编号）" : unnumbered ? `Original section ${reference}, listed item ${position} / 原问卷 ${reference} 节，第 ${position} 项（原文未单独编号）` : singleSectionItem ? "Original section 1.6, sole item / 原问卷 1.6 节，唯一题目（原文未单独编号）" : `Original question ${reference} · Item ${position} / 原题号 ${reference} · 第 ${position} 题${followup}`
	};
}
function interviewDisplaySettings(meta) {
	const occasional = /\bP\s*-\s*C\s*\d+\b|occasional\s+secondary\s+caregiver/i.test(meta.title || "");
	return {
		playbackAllowed: typeof meta.playbackAllowed === "boolean" ? meta.playbackAllowed : !occasional,
		showPlayback: typeof meta.showPlayback === "boolean" ? meta.showPlayback : !occasional,
		showGenerate: typeof meta.showGenerate === "boolean" ? meta.showGenerate : true,
		showRaw: typeof meta.showRaw === "boolean" ? meta.showRaw : true
	};
}
/**
* Interview recordings: upload to private storage and generate an A/B,
* Chinese + English sentence-by-sentence transcript. Every Generate click
* transcribes the recording again from the audio itself (nothing cached).
*/
var FN_BASE = `https://${{
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/",
	"VITE_SUPABASE_PROJECT_ID": "fofewspvoaylmzzgpyrg",
	"VITE_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_4ZCLp6URt0IVeFm6-aSD4g_dxkJY7Ps",
	"VITE_SUPABASE_URL": "https://fofewspvoaylmzzgpyrg.supabase.co",
	"VITE_WP_BASE_URL": "https://app.challenged-dementia.com/afresh"
}["VITE_SUPABASE_PROJECT_ID"]}.supabase.co/functions/v1`;
var SEGMENT_SECONDS = 30;
function authHeaders() {
	return {
		"Content-Type": "application/json",
		apikey: {
			"BASE_URL": "/",
			"DEV": false,
			"MODE": "production",
			"PROD": true,
			"SSR": true,
			"TSS_DEV_SERVER": "false",
			"TSS_DEV_SSR_STYLES_BASEPATH": "/",
			"TSS_DEV_SSR_STYLES_ENABLED": "true",
			"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
			"TSS_INLINE_CSS_ENABLED": "false",
			"TSS_ROUTER_BASEPATH": "",
			"TSS_SERVER_FN_BASE": "/_serverFn/",
			"VITE_SUPABASE_PROJECT_ID": "fofewspvoaylmzzgpyrg",
			"VITE_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_4ZCLp6URt0IVeFm6-aSD4g_dxkJY7Ps",
			"VITE_SUPABASE_URL": "https://fofewspvoaylmzzgpyrg.supabase.co",
			"VITE_WP_BASE_URL": "https://app.challenged-dementia.com/afresh"
		}["VITE_SUPABASE_PUBLISHABLE_KEY"],
		Authorization: `Bearer ${{
			"BASE_URL": "/",
			"DEV": false,
			"MODE": "production",
			"PROD": true,
			"SSR": true,
			"TSS_DEV_SERVER": "false",
			"TSS_DEV_SSR_STYLES_BASEPATH": "/",
			"TSS_DEV_SSR_STYLES_ENABLED": "true",
			"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
			"TSS_INLINE_CSS_ENABLED": "false",
			"TSS_ROUTER_BASEPATH": "",
			"TSS_SERVER_FN_BASE": "/_serverFn/",
			"VITE_SUPABASE_PROJECT_ID": "fofewspvoaylmzzgpyrg",
			"VITE_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_4ZCLp6URt0IVeFm6-aSD4g_dxkJY7Ps",
			"VITE_SUPABASE_URL": "https://fofewspvoaylmzzgpyrg.supabase.co",
			"VITE_WP_BASE_URL": "https://app.challenged-dementia.com/afresh"
		}["VITE_SUPABASE_PUBLISHABLE_KEY"]}`,
		"x-wp-token": getWPToken() || ""
	};
}
async function audioFn(body) {
	const res = await fetch(`${FN_BASE}/interview-audio`, {
		method: "POST",
		headers: authHeaders(),
		body: JSON.stringify(body)
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
	return data;
}
var listRecordings = () => audioFn({ action: "list" }).then((d) => d.items);
var saveMeta = (path, meta) => audioFn({
	action: "save_meta",
	path,
	meta
}).then((d) => d.meta);
var listParticipantMeta = () => audioFn({ action: "list_participant_meta" }).then((d) => d.items);
var saveParticipantMeta = (participantId, meta) => audioFn({
	action: "save_participant_meta",
	participantId,
	meta
}).then((d) => d.meta);
var deleteRecording = (path) => audioFn({
	action: "delete",
	path
});
var preloadRecordingUrl = (path) => audioFn({
	action: "preload_url",
	path
}).then((d) => d.url);
var loadTranscriptArchive = (path, kind = "raw") => audioFn({
	action: "load_archive",
	path,
	kind
}).then((d) => d.archive);
var saveTranscriptArchive = (path, lines, kind = "raw") => audioFn({
	action: "save_archive",
	path,
	lines,
	kind
}).then((d) => d.archive);
var saveTextArchive = (path, text, kind) => audioFn({
	action: "save_archive",
	path,
	text,
	kind
}).then((d) => d.archive);
/** Researcher only: replaces names with codes, chunk by chunk, keeping one mapping. */
async function anonymizeLines(lines, onProgress) {
	const size = 100;
	const total = Math.ceil(lines.length / size);
	let names = {};
	const out = [];
	for (let i = 0; i < total; i++) {
		for (let attempt = 0;; attempt++) try {
			const res = await audioFn({
				action: "anonymize",
				lines: lines.slice(i * size, (i + 1) * size),
				names
			});
			out.push(...res.lines);
			names = res.names;
			break;
		} catch (e) {
			if (attempt >= 2 || /only the researcher|credits/i.test(String(e?.message))) throw e;
			await new Promise((r) => setTimeout(r, 3e3 * 2 ** attempt));
		}
		onProgress?.(i + 1, total);
	}
	return out;
}
async function uploadRecording(file) {
	const { path, token } = await audioFn({
		action: "upload_url",
		name: file.name
	});
	const { error } = await supabase.storage.from("interview-audio").uploadToSignedUrl(path, token, file, { contentType: file.type || "audio/mpeg" });
	if (error) throw new Error(error.message);
	return path;
}
/** Overwrites the audio of an existing recording; title, notes and archives stay as they are. */
async function replaceRecording(path, file) {
	const { token } = await audioFn({
		action: "replace_url",
		path
	});
	const { error } = await supabase.storage.from("interview-audio").uploadToSignedUrl(path, token, file, {
		contentType: file.type || "audio/mpeg",
		upsert: true
	});
	if (error) throw new Error(error.message);
}
var displayName = (path) => path.replace(/^\d+_/, "");
async function transcribeSegment(path, audio, previous, signal, segment, onTotal, offset) {
	for (let attempt = 0;; attempt++) {
		let res;
		try {
			res = await fetch(`${FN_BASE}/interview-transcribe`, {
				method: "POST",
				headers: authHeaders(),
				signal,
				body: JSON.stringify({
					path,
					...segment === void 0 ? { audio } : {
						segment,
						offset
					},
					previous: previous.map(({ s, zh }) => ({
						s,
						zh
					}))
				})
			});
		} catch (error) {
			if (signal.aborted) throw error;
			if (attempt < 3) {
				await new Promise((r) => setTimeout(r, 2e3 * 2 ** attempt + Math.random() * 1e3));
				continue;
			}
			throw new Error("The connection was interrupted after several retries. Please generate again.");
		}
		if (!res.ok || !res.body) {
			const data = await res.json().catch(() => ({}));
			if ((res.status === 429 || res.status >= 500) && attempt < 3) {
				await new Promise((r) => setTimeout(r, 2e3 * 2 ** attempt + Math.random() * 1e3));
				continue;
			}
			throw new Error(data?.error || `Transcription failed (${res.status})`);
		}
		const payload = await res.json().catch(() => ({}));
		if (segment !== void 0) {
			if (!Number.isInteger(payload.total) || payload.total < 1) throw new Error("Invalid transcription segment count");
			onTotal?.(payload.total, payload.nextOffset);
		}
		const text = String(payload?.content || "");
		const match = text.match(/\{[\s\S]*\}/);
		try {
			return (JSON.parse(match ? match[0] : text)?.lines ?? []).filter((l) => l && (l.zh || l.en)).map((l) => ({
				s: l.s === "B" ? "B" : "A",
				zh: String(l.zh ?? ""),
				en: String(l.en ?? "")
			}));
		} catch {
			return text.trim() ? [{
				s: "A",
				zh: text.trim(),
				en: ""
			}] : [];
		}
	}
}
/** Audio stays server-side; the browser receives transcription text only. */
async function generateTranscript(path, onProgress, onLines, signal) {
	if (/\.(wav|mp3)$/i.test(path)) {
		let total = 1;
		let offset;
		let finished = false;
		const complete = [];
		let previous = [];
		onProgress(0, total);
		for (let i = 0; i < total && !finished; i++) {
			if (signal.aborted) throw new DOMException("Stopped", "AbortError");
			const lines = (await transcribeSegment(path, "", previous, signal, i, (count, next) => {
				total = count;
				if (next === null) finished = true;
				else if (typeof next === "number") offset = next;
			}, offset)).map((line) => ({
				...line,
				t: i * SEGMENT_SECONDS
			}));
			if (lines.length) {
				onLines(lines);
				complete.push(...lines);
				previous = lines;
			}
			onProgress(i + 1, total);
		}
		return complete;
	}
	throw new Error("Server transcription supports WAV and MP3 recordings only.");
}
var speakerLabel = (speaker) => speaker === "A" ? "A — Interviewer / 访谈者" : "B — Interviewee / 受访者";
/** Format legacy text archives for reading/export without rewriting stored corrections. */
function appendixText(text) {
	return text.replace(/^(\d+\.\s*)(?:\[\d+:\d+(?::\d+)?\]\s*)?([AB])(?:\s*—\s*(?:Interviewer \/ 访谈者|Interviewee \/ 受访者))?\s*$/gm, (_match, number, speaker) => `${number}${speakerLabel(speaker)}`);
}
/** Plain-text transcript laid out like a paper appendix. */
function archiveToText(title, lines) {
	const head = [
		title,
		"Interview transcript and translation / 访谈转录与翻译",
		"A = Interviewer / 访谈者; B = Interviewee / 受访者",
		""
	];
	const body = lines.map((l, i) => [
		`${i + 1}. ${speakerLabel(l.s)}`,
		l.zh && `中文：${l.zh}`,
		l.en && `English: ${l.en}`
	].filter(Boolean).join("\n"));
	return `${head.join("\n")}\n${body.join("\n\n")}\n`;
}
function downloadBlob(blob, filename) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 3e4);
}
function downloadText(text, filename) {
	downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), filename);
}
var xmlEscape = (s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** Minimal Word document: one paragraph per text line, same content as the TXT export. */
async function textToDocx(text) {
	const { default: JSZip } = await import("../_libs/_361.mjs").then((m) => /* @__PURE__ */ __toESM(m.default));
	const paragraphs = text.split(/\r?\n/).map((line) => line ? `<w:p><w:r><w:t xml:space="preserve">${xmlEscape(line)}</w:t></w:r></w:p>` : "<w:p/>").join("");
	const zip = new JSZip();
	zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`);
	zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
	zip.file("word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
	zip.file("word/styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="SimSun"/><w:sz w:val="22"/><w:lang w:val="en-US" w:eastAsia="zh-CN"/></w:rPr></w:rPrDefault></w:docDefaults></w:styles>`);
	zip.file("word/document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr/></w:body></w:document>`);
	return zip.generateAsync({
		type: "blob",
		mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	});
}
async function downloadDocx(text, filename) {
	downloadBlob(await textToDocx(text), filename);
}
/** Explicit participant codes take precedence over legacy prose identifiers. */
function researchOrder(title) {
	const network = title.match(/\bP\s*-\s*CN\s*(\d+)\s*-\s*([AB])\s*(\d+)/i);
	if (network) return [
		0,
		Number(network[1]),
		network[2]?.toUpperCase() === "A" ? 0 : 1,
		Number(network[3])
	];
	const occasional = title.match(/\bP\s*-\s*C\s*(\d+)/i);
	if (occasional) return [
		1,
		Number(occasional[1]),
		0,
		0
	];
	const legacy = title.match(/\bNetwork\s*(\d+)/i);
	const caregiver = title.match(/\bCaregiver\s*(\d+)/i);
	if (legacy) return [
		0,
		Number(legacy[1]),
		/secondary caregiver/i.test(title) ? 1 : 0,
		Number(caregiver?.[1] || 0)
	];
	return [
		2,
		0,
		0,
		0
	];
}
function compareResearchTitles(a, b) {
	const left = researchOrder(a);
	const right = researchOrder(b);
	for (let i = 0; i < left.length; i++) {
		const difference = (left[i] ?? 0) - (right[i] ?? 0);
		if (difference) return difference;
	}
	return a.localeCompare(b);
}
/** One bounded request at a time; no recording URL, Blob URL or whole-file cache. */
var InterviewPlayback = class {
	path;
	update;
	error;
	context = null;
	source = null;
	controller = null;
	timer = null;
	offset = 0;
	size = 0;
	position = 0;
	duration = 0;
	start = 0;
	active = false;
	generation = 0;
	constructor(path, update, error) {
		this.path = path;
		this.update = update;
		this.error = error;
	}
	emit(buffering = false) {
		this.update({
			playing: this.active,
			buffering,
			position: this.position,
			duration: this.duration
		});
	}
	async play() {
		if (this.active) return;
		this.active = true;
		this.emit(true);
		try {
			this.context ??= new AudioContext();
			await this.context.resume();
			if (this.active) await this.next();
		} catch {
			this.pause();
			this.error("Playback unavailable / 录音无法播放");
		}
	}
	async next() {
		if (!this.active || !this.context) return;
		const generation = this.generation;
		const controller = new AbortController();
		this.controller = controller;
		this.emit(true);
		try {
			const response = await fetch(`https://${{
				"BASE_URL": "/",
				"DEV": false,
				"MODE": "production",
				"PROD": true,
				"SSR": true,
				"TSS_DEV_SERVER": "false",
				"TSS_DEV_SSR_STYLES_BASEPATH": "/",
				"TSS_DEV_SSR_STYLES_ENABLED": "true",
				"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
				"TSS_INLINE_CSS_ENABLED": "false",
				"TSS_ROUTER_BASEPATH": "",
				"TSS_SERVER_FN_BASE": "/_serverFn/",
				"VITE_SUPABASE_PROJECT_ID": "fofewspvoaylmzzgpyrg",
				"VITE_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_4ZCLp6URt0IVeFm6-aSD4g_dxkJY7Ps",
				"VITE_SUPABASE_URL": "https://fofewspvoaylmzzgpyrg.supabase.co",
				"VITE_WP_BASE_URL": "https://app.challenged-dementia.com/afresh"
			}["VITE_SUPABASE_PROJECT_ID"]}.supabase.co/functions/v1/interview-audio`, {
				method: "POST",
				signal: controller.signal,
				headers: {
					"Content-Type": "application/json",
					apikey: {
						"BASE_URL": "/",
						"DEV": false,
						"MODE": "production",
						"PROD": true,
						"SSR": true,
						"TSS_DEV_SERVER": "false",
						"TSS_DEV_SSR_STYLES_BASEPATH": "/",
						"TSS_DEV_SSR_STYLES_ENABLED": "true",
						"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
						"TSS_INLINE_CSS_ENABLED": "false",
						"TSS_ROUTER_BASEPATH": "",
						"TSS_SERVER_FN_BASE": "/_serverFn/",
						"VITE_SUPABASE_PROJECT_ID": "fofewspvoaylmzzgpyrg",
						"VITE_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_4ZCLp6URt0IVeFm6-aSD4g_dxkJY7Ps",
						"VITE_SUPABASE_URL": "https://fofewspvoaylmzzgpyrg.supabase.co",
						"VITE_WP_BASE_URL": "https://app.challenged-dementia.com/afresh"
					}["VITE_SUPABASE_PUBLISHABLE_KEY"],
					Authorization: `Bearer ${{
						"BASE_URL": "/",
						"DEV": false,
						"MODE": "production",
						"PROD": true,
						"SSR": true,
						"TSS_DEV_SERVER": "false",
						"TSS_DEV_SSR_STYLES_BASEPATH": "/",
						"TSS_DEV_SSR_STYLES_ENABLED": "true",
						"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
						"TSS_INLINE_CSS_ENABLED": "false",
						"TSS_ROUTER_BASEPATH": "",
						"TSS_SERVER_FN_BASE": "/_serverFn/",
						"VITE_SUPABASE_PROJECT_ID": "fofewspvoaylmzzgpyrg",
						"VITE_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_4ZCLp6URt0IVeFm6-aSD4g_dxkJY7Ps",
						"VITE_SUPABASE_URL": "https://fofewspvoaylmzzgpyrg.supabase.co",
						"VITE_WP_BASE_URL": "https://app.challenged-dementia.com/afresh"
					}["VITE_SUPABASE_PUBLISHABLE_KEY"]}`,
					"x-wp-token": getWPToken() || ""
				},
				body: JSON.stringify({
					action: "stream",
					path: this.path,
					offset: this.offset
				})
			});
			if (!response.ok) throw new Error("Playback unavailable");
			const nextHeader = response.headers.get("X-Next-Offset");
			const duration = Number(response.headers.get("X-Duration"));
			const position = Number(response.headers.get("X-Position"));
			const size = Number(response.headers.get("X-Recording-Size"));
			if (!nextHeader || !Number.isFinite(duration) || duration <= 0 || !Number.isFinite(position) || size < 1) throw new Error("Invalid stream");
			const data = await response.arrayBuffer();
			if (data.byteLength > 4000044) throw new Error("Invalid stream chunk");
			const buffer = await this.context.decodeAudioData(data);
			if (!this.active || generation !== this.generation) return;
			this.duration = duration;
			this.size = size;
			this.position = position;
			this.start = this.context.currentTime;
			const node = this.context.createBufferSource();
			node.buffer = buffer;
			node.connect(this.context.destination);
			this.source = node;
			this.emit();
			this.timer = setInterval(() => {
				if (!this.context) return;
				this.position = Math.min(duration, position + this.context.currentTime - this.start);
				this.emit();
			}, 200);
			node.onended = () => {
				if (this.timer) clearInterval(this.timer);
				this.timer = null;
				this.source = null;
				if (!this.active) return;
				if (nextHeader === "end") {
					this.offset = 0;
					this.position = 0;
					this.active = false;
					this.emit();
					return;
				}
				const offset = Number(nextHeader);
				if (!Number.isSafeInteger(offset) || offset <= this.offset) {
					this.pause();
					return;
				}
				this.offset = offset;
				this.next();
			};
			node.start();
		} catch (e) {
			if (controller.signal.aborted || generation !== this.generation) return;
			this.pause();
			this.error(e instanceof Error ? e.message : "Playback unavailable");
		}
	}
	pause() {
		this.active = false;
		this.generation++;
		this.controller?.abort();
		if (this.source) {
			this.source.onended = null;
			this.source.stop();
			this.source = null;
		}
		if (this.timer) clearInterval(this.timer);
		this.timer = null;
		this.emit();
	}
	seek(seconds) {
		const resume = this.active;
		this.pause();
		this.position = Math.max(0, Math.min(this.duration, seconds));
		this.offset = this.duration > 0 ? Math.min(this.size - 1, Math.floor(this.size * this.position / this.duration)) : 0;
		this.emit();
		if (resume) this.play();
	}
	dispose() {
		this.pause();
		this.context?.close();
		this.context = null;
	}
};
/** Native full-recording preload for the four explicitly consented demos only. */
var PreloadedInterviewPlayback = class {
	update;
	error;
	audio;
	ready;
	disposed = false;
	buffering = false;
	constructor(path, update, error) {
		this.update = update;
		this.error = error;
		this.audio = new Audio();
		this.audio.preload = "auto";
		this.audio.controls = false;
		this.audio.setAttribute("controlsList", "nodownload");
		this.audio.addEventListener("timeupdate", this.emit);
		this.audio.addEventListener("durationchange", this.emit);
		this.audio.addEventListener("play", this.emit);
		this.audio.addEventListener("pause", this.emit);
		this.audio.addEventListener("ended", this.emit);
		this.audio.addEventListener("waiting", this.waiting);
		this.audio.addEventListener("canplay", this.canplay);
		this.audio.addEventListener("error", this.failed);
		this.ready = preloadRecordingUrl(path).then((url) => {
			if (this.disposed) return;
			this.audio.src = url;
			this.audio.load();
		}).catch(() => {
			if (!this.disposed) this.error("Playback unavailable / 录音无法播放");
		});
	}
	emit = () => {
		if (this.disposed) return;
		this.update({
			playing: !this.audio.paused && !this.audio.ended,
			buffering: this.buffering,
			position: this.audio.currentTime || 0,
			duration: Number.isFinite(this.audio.duration) ? this.audio.duration : 0
		});
	};
	waiting = () => {
		this.buffering = true;
		this.emit();
	};
	canplay = () => {
		this.buffering = false;
		this.emit();
	};
	failed = () => {
		if (!this.disposed) {
			this.pause();
			this.error("Playback unavailable / 录音无法播放");
		}
	};
	async play() {
		await this.ready;
		if (this.disposed || !this.audio.src) return;
		try {
			await this.audio.play();
		} catch {
			this.failed();
		}
	}
	pause() {
		this.audio.pause();
		this.buffering = false;
		this.emit();
	}
	seek(seconds) {
		if (!Number.isFinite(this.audio.duration) || this.audio.duration <= 0) return;
		this.audio.currentTime = Math.max(0, Math.min(this.audio.duration, seconds));
		this.emit();
	}
	dispose() {
		this.disposed = true;
		this.audio.pause();
		this.audio.removeAttribute("src");
		this.audio.load();
	}
};
var DEMO_RECORDINGS = [
	"1792069468864_34.wav",
	"1790775526991_32.wav",
	"1791796863950_33_-edited.wav",
	"1791798861562_31_-edited.wav"
];
function isDemoRecording(path) {
	return DEMO_RECORDINGS.some((recording) => recording === path);
}
var getInterviewOverview = createServerFn({ method: "POST" }).inputValidator((input) => objectType({ path: stringType().min(1).max(299).refine((path) => !path.includes("/") && !path.includes("..")) }).parse(input)).handler(createSsrRpc("67e128ad68c960486299e70e46113a230090e687e571d0b30dcf28d7dc5f7de9"));
function InterviewOverview({ path }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [text, setText] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const generate = useServerFn(getInterviewOverview);
	const load = async () => {
		if (loading || text) return;
		setLoading(true);
		setError("");
		try {
			const result = await generate({ data: { path } });
			if (result.error) setError(result.error);
			else setText(result.text || "");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Overview unavailable / 概要暂不可用");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "features/interviews/InterviewOverview.tsx:24:10:3d575903e309f560020dfa2ea9f1109bb0f65295800df34e901a865936c2cd69:1",
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			className: "h-auto w-full justify-between whitespace-normal py-2 text-left",
			"aria-expanded": open,
			"aria-controls": "interview-overview",
			onClick: () => {
				setOpen(!open);
				if (!open && !text && !error) load();
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"data-inspector-source": "features/interviews/InterviewOverview.tsx:29:7:1b8ce0c8bbb32f855c5dd8a5214813b3e200acd625ee54ba93f7160e69880134:1",
				children: "View interview overview / 查看访谈概要"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `ml-2 h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}` })]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-source": "features/interviews/InterviewOverview.tsx:32:14:9439127f5abbf2e21a52e1dfd5ab359eec40adcf313277472a1a08a852b750f6:1",
			id: "interview-overview",
			className: "space-y-3 border-l-2 border-border pl-3 text-sm",
			"aria-busy": loading,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "features/interviews/InterviewOverview.tsx:33:7:9c4f90f191c4c1fd4c6d6ae81b786068e1dcdf3b18d132e9eb1e65e81d2dfbdd:1",
					className: "text-xs text-muted-foreground",
					children: "Gemini Flash · google/gemini-3.8-flash"
				}),
				loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					"data-inspector-source": "features/interviews/InterviewOverview.tsx:34:19:e0d8829b865a34129731e49f733bf3693b3aa014cfe3f91e587f4864ec38c5a7:1",
					role: "status",
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), "Preparing overview… / 正在生成概要…"]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "features/interviews/InterviewOverview.tsx:35:17:82899552cbdacce8d67164808e87f8a4ed9c472bf3c6dcfe5529aa57d65a752a:1",
					role: "alert",
					className: "break-words text-destructive",
					children: error
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => void load(),
					children: "Retry / 重试"
				}),
				text && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageResponse, { children: text })
			]
		})]
	});
}
/**
* Recruitment source is stored as free text (legacy values are long paragraphs),
* so "Other / 其他" keeps an editable text field and existing unlisted values
* are preserved instead of being discarded.
*/
var RECRUITMENT_SOURCES = [
	{
		value: "Research recruitment agency",
		label: "Research recruitment agency / 研究招募机构"
	},
	{
		value: "Community referral",
		label: "Community referral / 社区转介"
	},
	{
		value: "Hospital referral",
		label: "Hospital referral / 医院转介"
	},
	{
		value: "Online community (WeChat group, etc.)",
		label: "Online community (WeChat group, etc.) / 线上社群（微信群等）"
	},
	{
		value: "Family or friend referral",
		label: "Family or friend referral / 亲友转介"
	}
];
var OTHER = "__other__";
function RecruitmentSourceSelect({ id, value, onChange }) {
	const [customMode, setCustomMode] = (0, import_react.useState)(false);
	const listed = RECRUITMENT_SOURCES.some((o) => o.value === value);
	const showCustom = customMode || !listed && value !== "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/researcher/RecruitmentSourceSelect.tsx:24:5:6e2dc857fb79ecfacbaab047a0b28433be317d5176c05ec9184b6ea69b17bc6d:1",
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
			"data-inspector-source": "components/researcher/RecruitmentSourceSelect.tsx:25:7:9c41ac81b1c578cb8a2787e38493ccdfbdab9e5e2907a6294f2f0b532608e2cb:1",
			id,
			value: showCustom ? OTHER : value,
			onChange: (e) => {
				const next = e.target.value;
				if (next === OTHER) {
					setCustomMode(true);
					return;
				}
				setCustomMode(false);
				onChange(next);
			},
			className: "h-9 w-full max-w-md rounded-md border border-border bg-background px-3 text-sm text-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					"data-inspector-source": "components/researcher/RecruitmentSourceSelect.tsx:36:9:5106bfc93af5458597cdb8d26db1cb8c1c2d65ae1ffe77cf3b6e97f5fd02a8fb:1",
					value: "",
					children: "Select source / 选择来源"
				}),
				RECRUITMENT_SOURCES.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					"data-inspector-source": "components/researcher/RecruitmentSourceSelect.tsx:38:11:d7b7da7a2332cdca8f08a89ac18784248ce2250d33c0b0595d4e2edd0a9c92cb:1",
					value: o.value,
					children: o.label
				}, o.value)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					"data-inspector-source": "components/researcher/RecruitmentSourceSelect.tsx:40:9:6a5e001c58d609ea42e10c6776d3562363a72f6dedba34e633ab5dc01381dc04:1",
					value: OTHER,
					children: "Other / 其他（自行填写）"
				})
			]
		}), showCustom && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			"data-inspector-source": "components/researcher/RecruitmentSourceSelect.tsx:44:11:5cb5cfcb06c997f2a92a2cb07fa957ffb3969f9595e1ae3d57e08df46d01dfe7:1",
			htmlFor: `${id}-custom`,
			className: "block text-xs text-muted-foreground",
			children: "Custom source / 自定义来源"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
			id: `${id}-custom`,
			rows: 2,
			value,
			onChange: (e) => onChange(e.target.value)
		})] })]
	});
}
var Collapsible = Collapsible$1;
var CollapsibleTrigger = CollapsibleTrigger$1;
var CollapsibleContent = CollapsibleContent$1;
function RecruitmentSourceDetails({ value }) {
	if (!value) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Collapsible, {
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "outline",
				size: "sm",
				className: "group h-auto w-full justify-between whitespace-normal py-2 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"data-inspector-source": "components/researcher/RecruitmentSourceDetails.tsx:11:11:0b4fcb9fc745aa335fca79391e2fe0d60c255a83880291d59712ca8f59d68751:1",
					children: "Recruitment source / 招募来源"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "ml-2 h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none group-data-[state=open]:rotate-180" })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			"data-inspector-source": "components/researcher/RecruitmentSourceDetails.tsx:16:9:e0e3bfa9ef49feaaf440d4a2c77c15b6854f632e33234f401033b37497003dd9:1",
			className: "whitespace-pre-wrap break-words text-sm text-foreground",
			children: value
		}) })]
	});
}
var titleOf = (r) => r.meta?.title || displayName(r.path);
var interviewOrder = (a, b) => compareResearchTitles(titleOf(a), titleOf(b)) || a.path.localeCompare(b.path);
/**
* Interview records. Anyone with the page can listen and regenerate transcripts;
* only the signed-in researcher (`canEdit`) can add recordings and save title/notes/instructions.
*/
function InterviewsPanel({ canEdit }) {
	const [items, setItems] = (0, import_react.useState)(null);
	const [selected, setSelected] = (0, import_react.useState)(() => new URL(window.location.href).searchParams.get("rec") || "");
	const [error, setError] = (0, import_react.useState)("");
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const fileRef = (0, import_react.useRef)(null);
	const refresh = () => listRecordings().then((d) => {
		const ordered = [...d].sort(interviewOrder);
		setItems(ordered);
		setSelected((s) => s && ordered.some((r) => r.path === s) ? s : ordered[0]?.path || "");
	}).catch((e) => setError(e.message));
	(0, import_react.useEffect)(() => {
		refresh();
	}, []);
	(0, import_react.useEffect)(() => {
		if (!selected) return;
		const url = new URL(window.location.href);
		url.searchParams.set("rec", selected);
		window.history.replaceState({}, "", url.toString());
	}, [selected]);
	const onFile = async (file) => {
		if (!file) return;
		if (!file.type.startsWith("audio/") && !/\.(mp3|m4a|wav|aac|ogg|flac|webm)$/i.test(file.name)) {
			setError("Please choose an audio file. / 请选择音频文件");
			return;
		}
		if (file.size > 500 * 1024 * 1024) {
			setError("Recordings up to 500 MB are supported. / 最大 500 MB");
			return;
		}
		setError("");
		setUploading(true);
		try {
			const path = await uploadRecording(file);
			await saveMeta(path, {
				title: file.name.replace(/\.[^.]+$/, ""),
				recruitmentSource: "",
				notes: "",
				instructions: ""
			});
			await refresh();
			setSelected(path);
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setUploading(false);
			if (fileRef.current) fileRef.current.value = "";
		}
	};
	const current = items?.find((r) => r.path === selected);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:69:5:7ccbdb9e85c9f1a0ab7f5af816a7325b8df1c629e21aa2e55c9982b299e5cfe1:1",
		className: "mx-auto grid max-w-5xl gap-4 px-4 py-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:70:7:52fe09836450d5593c9504a22ab7b4bb3760d9c8b577752170be7e50eae52da2:1",
			className: "space-y-2",
			children: [
				canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:73:13:a1ce2a5c3c24e56e5ecadf022e571eb4324c7a81703b3d4e820db2d38265e5bb:1",
					ref: fileRef,
					type: "file",
					accept: "audio/*,.m4a,.mp3,.wav",
					className: "hidden",
					onChange: (e) => onFile(e.target.files?.[0])
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "w-full",
					onClick: () => fileRef.current?.click(),
					disabled: uploading,
					children: [uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), uploading ? "Uploading… / 上传中…" : "New interview / 新建访谈"]
				})] }),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:80:19:843e108e3dae9d54e88ddc09f84d1feac8e6908ff78697f237395c3a36013f5d:1",
					className: "text-sm text-destructive",
					children: error
				}),
				!items && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:81:20:f5ef539b15295177dc5bccede50f6252d62bc1dd477cd3d9799f1a7e2a2a402b:1",
					className: "text-sm text-muted-foreground",
					children: "Loading… / 加载中…"
				}),
				items?.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:82:33:e5313fb1800a3b2e26b7ece49c1d5317ff3bb76fb7f6ad2c2471ce944b070aca:1",
					className: "text-sm text-muted-foreground",
					children: "No recordings yet. / 暂无录音"
				}),
				items?.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:84:11:1b8ef6a0d1ba092bffc687c23e4023e5c58282032a0e7b996801d7146e5a3761:1",
					onClick: () => setSelected(r.path),
					className: `w-full rounded-md px-3 py-2 text-left text-sm ${r.path === selected ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:86:14:763909325fe5498b98a9ad7d0eb27fead1f5705059b3616f0823bb7dbe5e34ad:1",
						className: "whitespace-normal break-words font-medium leading-snug",
						children: titleOf(r)
					})
				}, r.path))
			]
		}), current ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Transcript, {
			rec: current,
			canEdit,
			onSaved: refresh,
			onDeleted: () => {
				setSelected("");
				refresh();
			}
		}, current.path) : null]
	});
}
function Transcript({ rec, canEdit, onSaved, onDeleted }) {
	const path = rec.path;
	const draftKey = `interview-meta-draft:${path}`;
	const [meta, setMetaState] = (0, import_react.useState)(() => {
		try {
			const d = JSON.parse(localStorage.getItem(draftKey) || "null");
			if (d && typeof d === "object") return {
				...rec.meta,
				...d
			};
		} catch {}
		return rec.meta;
	});
	const setMeta = (next) => {
		setMetaState(next);
		localStorage.setItem(draftKey, JSON.stringify(next));
	};
	const display = interviewDisplaySettings(meta);
	const playerVisible = canEdit || display.showPlayback;
	const playbackEnabled = canEdit || display.showPlayback && display.playbackAllowed;
	const generateVisible = canEdit || display.showGenerate;
	const rawVisible = canEdit || display.showRaw;
	const dirty = meta.title !== rec.meta.title || meta.notes !== rec.meta.notes || meta.instructions !== rec.meta.instructions || (meta.recruitmentSource || "") !== (rec.meta.recruitmentSource || "");
	const retry = (0, import_react.useRef)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [saved, setSaved] = (0, import_react.useState)("");
	const [lines, setLines] = (0, import_react.useState)([]);
	const [progress, setProgress] = (0, import_react.useState)(null);
	const [running, setRunning] = (0, import_react.useState)(false);
	const [complete, setComplete] = (0, import_react.useState)(false);
	const [needSignIn, setNeedSignIn] = (0, import_react.useState)(false);
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [archive, setArchive] = (0, import_react.useState)(null);
	const [editedArchive, setEditedArchive] = (0, import_react.useState)(null);
	const [anonArchive, setAnonArchive] = (0, import_react.useState)(null);
	const [textArchive, setTextArchive] = (0, import_react.useState)(null);
	const [anonTextArchive, setAnonTextArchive] = (0, import_react.useState)(null);
	const [archiveStatus, setArchiveStatus] = (0, import_react.useState)("loading");
	const [archiveAttempt, setArchiveAttempt] = (0, import_react.useState)(0);
	const archivesReady = archiveStatus === "ready";
	const [showArchive, setShowArchive] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [lineKind, setLineKind] = (0, import_react.useState)("edited");
	const [editLines, setEditLines] = (0, import_react.useState)([]);
	const [textDraft, setTextDraft] = (0, import_react.useState)(null);
	const [anonProgress, setAnonProgress] = (0, import_react.useState)("");
	const editedDraftKey = `interview-${lineKind}-draft:${path}`;
	const textDraftKey = (kind) => `interview-${kind}-draft:${path}`;
	const busy = editing || !!textDraft || !!anonProgress;
	const archiveOf = (kind) => ({
		raw: archive,
		edited: editedArchive,
		anonymized: anonArchive,
		text: textArchive,
		"anonymized-text": anonTextArchive
	})[kind];
	const setArchiveOf = (kind, value) => ({
		raw: setArchive,
		edited: setEditedArchive,
		anonymized: setAnonArchive,
		text: setTextArchive,
		"anonymized-text": setAnonTextArchive
	})[kind](value);
	const titleText = meta.title || displayName(path);
	const [showInstructions, setShowInstructions] = (0, import_react.useState)(false);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [buffering, setBuffering] = (0, import_react.useState)(false);
	const [playError, setPlayError] = (0, import_react.useState)("");
	const [position, setPosition] = (0, import_react.useState)(0);
	const [duration, setDuration] = (0, import_react.useState)(0);
	const abort = (0, import_react.useRef)(null);
	const player = (0, import_react.useRef)(null);
	const replaceInput = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setPlayError("");
		setPlaying(false);
		setBuffering(false);
		setPosition(0);
		setDuration(0);
		if (playbackEnabled && archivesReady) {
			const Playback = isDemoRecording(path) ? PreloadedInterviewPlayback : InterviewPlayback;
			player.current = new Playback(path, (state) => {
				setPlaying(state.playing);
				setBuffering(state.buffering);
				setPosition(state.position);
				setDuration(state.duration);
			}, setPlayError);
		}
		return () => {
			player.current?.dispose();
			player.current = null;
		};
	}, [
		path,
		playbackEnabled,
		archivesReady
	]);
	(0, import_react.useEffect)(() => {
		let active = true;
		setArchiveStatus("loading");
		setError("");
		Promise.all([
			loadTranscriptArchive(path, "raw"),
			loadTranscriptArchive(path, "edited"),
			loadTranscriptArchive(path, "anonymized"),
			loadTranscriptArchive(path, "text"),
			loadTranscriptArchive(path, "anonymized-text")
		]).then(([raw, edited, anonymized, text, anonymizedText]) => {
			if (!active) return;
			setArchive(raw);
			setEditedArchive(edited);
			setAnonArchive(anonymized);
			setTextArchive(text);
			setAnonTextArchive(anonymizedText);
			setArchiveStatus("ready");
		}).catch((e) => {
			if (!active) return;
			setArchiveStatus("error");
			setError(e instanceof Error ? e.message : String(e));
		});
		return () => {
			active = false;
			abort.current?.abort();
		};
	}, [path, archiveAttempt]);
	/** Runs a researcher-only action; if the sign-in has expired, asks for the password and retries. */
	const asResearcher = async (action) => {
		await wpEnsureFreshToken();
		try {
			await action();
			setNeedSignIn(false);
		} catch (e) {
			if (!/only the researcher/i.test(String(e?.message))) throw e;
			retry.current = action;
			setNeedSignIn(true);
			throw new Error("Your researcher sign-in has expired. Enter the password below — nothing you typed or generated is lost. / 研究者登录已过期，请在下方输入密码，已输入和已生成的内容都不会丢失。");
		}
	};
	const save = async () => {
		setSaving(true);
		setSaved("");
		setError("");
		try {
			await asResearcher(async () => {
				const stored = await saveMeta(path, meta);
				localStorage.removeItem(draftKey);
				setMetaState(stored);
				setSaved("Saved / 已保存");
				onSaved();
			});
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setSaving(false);
		}
	};
	const saveDisplay = async (key, value) => {
		if (!canEdit || saving) return;
		setSaving(true);
		setError("");
		try {
			await asResearcher(async () => {
				const stored = await saveMeta(path, { [key]: value });
				const next = {
					...meta,
					...interviewDisplaySettings(stored)
				};
				setMeta(next);
				onSaved();
			});
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setSaving(false);
		}
	};
	const generate = async () => {
		if (!archivesReady || running || busy || saving) return;
		abort.current?.abort();
		const ctrl = new AbortController();
		abort.current = ctrl;
		setLines([]);
		setShowArchive(false);
		setError("");
		setRunning(true);
		setProgress(null);
		setComplete(false);
		try {
			await generateTranscript(path, (done, total) => setProgress({
				done,
				total
			}), (l) => setLines((p) => [...p, ...l]), ctrl.signal);
			if (!ctrl.signal.aborted) setComplete(true);
		} catch (e) {
			if (e?.name !== "AbortError") setError(e instanceof Error ? e.message : String(e));
		} finally {
			setRunning(false);
		}
	};
	const storeArchive = async () => {
		if (!lines.length || !complete) return;
		if (archive && !window.confirm("A transcript archive already exists. Saving will overwrite it. Confirm? / 已有转录归档，保存将覆盖原有归档，确认覆盖？")) return;
		setSaving(true);
		setError("");
		try {
			await asResearcher(async () => {
				const savedArchive = await saveTranscriptArchive(path, lines);
				const check = await loadTranscriptArchive(path);
				if (!check || check.lines.length !== savedArchive.lines.length) throw new Error("Archive could not be verified after saving. / 归档保存后校验失败");
				setArchive(check);
				setSaved(`Transcript archive saved (${check.lines.length} sentences) / 转录归档已保存（${check.lines.length} 句）`);
			});
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setSaving(false);
		}
	};
	const startEditing = (kind = "edited") => {
		if (!canEdit || !archive) return;
		let source = kind === "edited" ? editedArchive?.lines || archive.lines : anonArchive?.lines || [];
		try {
			const draft = JSON.parse(localStorage.getItem(textDraftKey(kind)) || "null");
			if (Array.isArray(draft) && draft.length) source = draft;
		} catch {}
		if (!source.length) return;
		setLineKind(kind);
		setEditLines(source.map((line) => ({ ...line })));
		setEditing(true);
		setShowArchive(kind);
		setSaved("");
		setError("");
	};
	const generateEditedFromRaw = () => {
		if (!canEdit || busy || running || saving || !archive?.lines.length) return;
		const out = archive.lines.map((line) => ({ ...line }));
		localStorage.setItem(textDraftKey("edited"), JSON.stringify(out));
		setLineKind("edited");
		setEditLines(out);
		setEditing(true);
		setShowArchive("edited");
		setSaved("");
		setError("");
	};
	const generateManualAnonymized = () => {
		if (!canEdit || busy || running || saving || !editedArchive?.lines.length) return;
		const out = editedArchive.lines.map((line) => ({ ...line }));
		localStorage.setItem(textDraftKey("anonymized"), JSON.stringify(out));
		setLineKind("anonymized");
		setEditLines(out);
		setEditing(true);
		setShowArchive("anonymized");
		setSaved("");
		setError("");
	};
	const generateAnonymized = async () => {
		if (!canEdit || !editedArchive?.lines.length) return;
		if (anonArchive && !window.confirm("Generate a new anonymized version from the current Edited archive? The saved anonymized archive only changes when you save. / 用当前修订归档重新生成匿名版本？只有点保存才会覆盖已存的匿名归档。")) return;
		setError("");
		setSaved("");
		setAnonProgress("0");
		try {
			await asResearcher(async () => {
				const out = await anonymizeLines(editedArchive.lines, (d, t) => setAnonProgress(`${d}/${t}`));
				localStorage.setItem(textDraftKey("anonymized"), JSON.stringify(out));
				setLineKind("anonymized");
				setEditLines(out);
				setEditing(true);
				setShowArchive("anonymized");
			});
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setAnonProgress("");
		}
	};
	const changeLine = (index, update) => {
		const next = editLines.map((line, i) => i === index ? {
			...line,
			...update
		} : line);
		setEditLines(next);
		localStorage.setItem(editedDraftKey, JSON.stringify(next));
	};
	const storeEditedArchive = async () => {
		if (!canEdit || !editing || !editLines.some((line) => line.zh.trim() || line.en.trim())) return;
		const kind = lineKind;
		const label = kind === "edited" ? "Edited archive / 修订归档" : "Anonymized Edited archive / 匿名修订归档";
		if (archiveOf(kind) && !window.confirm(`Overwrite the existing ${label}? Other archives will not change. / 覆盖现有归档？其他归档不会改变。`)) return;
		setSaving(true);
		setError("");
		try {
			await asResearcher(async () => {
				const stored = await saveTranscriptArchive(path, editLines, kind);
				const check = await loadTranscriptArchive(path, kind);
				if (!check || JSON.stringify(check.lines) !== JSON.stringify(stored.lines)) throw new Error("Archive could not be verified after saving. / 归档保存后校验失败。");
				setArchiveOf(kind, check);
				setEditing(false);
				setShowArchive(kind);
				localStorage.removeItem(textDraftKey(kind));
				setSaved(`${label} saved / 已保存`);
			});
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setSaving(false);
		}
	};
	const startText = (kind, fresh) => {
		if (!canEdit) return;
		const src = kind === "text" ? editedArchive : anonArchive;
		let value = !fresh && archiveOf(kind)?.text || "";
		if (!fresh && localStorage.getItem(textDraftKey(kind))) value = localStorage.getItem(textDraftKey(kind)) || value;
		if (fresh || !value) {
			if (!src?.lines.length) return;
			value = archiveToText(titleText, src.lines);
		}
		setTextDraft({
			kind,
			value: appendixText(value)
		});
		setShowArchive(kind);
		setSaved("");
		setError("");
	};
	const storeText = async () => {
		if (!canEdit || !textDraft?.value.trim()) return;
		const kind = textDraft.kind;
		const value = appendixText(textDraft.value);
		if (archiveOf(kind) && !window.confirm("Overwrite the existing text archive? Other archives will not change. / 覆盖现有文本归档？其他归档不会改变。")) return;
		setSaving(true);
		setError("");
		try {
			await asResearcher(async () => {
				await saveTextArchive(path, value, kind);
				const check = await loadTranscriptArchive(path, kind);
				if (!check || check.text !== value) throw new Error("Archive could not be verified after saving. / 归档保存后校验失败。");
				setArchiveOf(kind, check);
				setTextDraft(null);
				setShowArchive(kind);
				localStorage.removeItem(textDraftKey(kind));
				setSaved("Text archive saved / 文本归档已保存");
			});
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setSaving(false);
		}
	};
	const fileBase = titleText.replace(/[\\/:*?"<>|]+/g, "_").slice(0, 80);
	const reSignIn = async () => {
		setSaving(true);
		setError("");
		try {
			await wpLogin("researcher", password);
			setPassword("");
			setNeedSignIn(false);
		} catch {
			setError("Wrong password. / 密码错误。");
			setSaving(false);
			return;
		}
		const action = retry.current;
		retry.current = null;
		if (!action) {
			setSaving(false);
			return;
		}
		try {
			await action();
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setSaving(false);
		}
	};
	const share = () => {
		const url = new URL(window.location.origin + window.location.pathname);
		url.searchParams.set("__site", "researcher");
		url.searchParams.set("tab", "interviews");
		url.searchParams.set("rec", path);
		navigator.clipboard?.writeText(url.toString());
		setSaved("Link copied / 链接已复制");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:370:5:ca58dfc20fbae0198e02d1b126f71b4c2aedc6fbb1576a0f9f4fad0a6e7ad6d3:1",
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3 pt-6",
				"aria-busy": archiveStatus === "loading",
				children: [
					archiveStatus === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						role: "status",
						"aria-label": "Loading interview / 加载访谈",
						className: "h-5 w-5 animate-spin text-muted-foreground"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:374:11:140dc3ce741ff03d6c7a420370b690c909eed61ada0c3129f6dbfe00d2656c4d:1",
						disabled: !archivesReady,
						className: "min-w-0 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InterviewOverview, { path }, path),
							canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:377:13:fc217957b0936f971793d9339d74ac109a1acc1aa32b8677ef382a31b9e9270e:1",
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:378:15:4230e0d31b1eb16fb101abf808f3d5c486d7f004ff4a2a98d5f85034e0895ac0:1",
										className: "text-xs text-muted-foreground",
										children: "Title / 标题"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: meta.title,
										onChange: (e) => setMeta({
											...meta,
											title: e.target.value
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:380:15:6ec997eeb456b51350f6a70f7235a91bc25a4467fedb1f0eb1d95ad2d4300db6:1",
										htmlFor: "interview-recruitment",
										className: "text-xs text-muted-foreground",
										children: "Recruitment source / 招募来源"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecruitmentSourceSelect, {
										id: "interview-recruitment",
										value: meta.recruitmentSource || "",
										onChange: (recruitmentSource) => setMeta({
											...meta,
											recruitmentSource
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:382:15:7b7a37e606a758f640209ce2973bd5dc2569743b91a0dbb8f6ac124acf72dd24:1",
										className: "text-xs text-muted-foreground",
										children: "Notes / 备注"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 2,
										value: meta.notes,
										onChange: (e) => setMeta({
											...meta,
											notes: e.target.value
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:384:15:48733b5f1e625c2cb3db536d4c7279f56a28898a4d1a9af5691dd915f6b20b9f:1",
										className: "text-xs text-muted-foreground",
										children: "Transcription instructions / 转录指令（例如 A/B 是谁、专有名词）"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 3,
										value: meta.instructions,
										onChange: (e) => setMeta({
											...meta,
											instructions: e.target.value
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:386:15:3ec2bc36c9290afbafb46370cfc5380936ce467e3aa8de455cae503c5a77f7d6:1",
										className: "flex flex-wrap items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												onClick: save,
												disabled: saving,
												children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-2 h-4 w-4" }), "Save / 保存"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "outline",
												onClick: share,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "mr-2 h-4 w-4" }), "Copy link / 复制链接"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:391:17:09bd8c0dad852570ff2259251ecbbe1cb53bfa83c7990d205d896341a276ebf5:1",
												ref: replaceInput,
												type: "file",
												accept: "audio/*",
												className: "hidden",
												onChange: async (e) => {
													const file = e.target.files?.[0];
													e.target.value = "";
													if (!file) return;
													setSaving(true);
													setError("");
													try {
														await asResearcher(async () => {
															await replaceRecording(path, file);
														});
														player.current?.pause();
														setPlaying(false);
														setPosition(0);
														player.current?.seek(0);
														setSaved("Recording replaced / 录音已替换");
														onSaved();
													} catch (err) {
														setError(err instanceof Error ? err.message : String(err));
													} finally {
														setSaving(false);
													}
												}
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "outline",
												disabled: saving,
												onClick: () => replaceInput.current?.click(),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mr-2 h-4 w-4" }), "Replace recording / 替换录音"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "destructive",
												disabled: saving,
												onClick: async () => {
													if (!window.confirm("Delete this recording and its notes? This cannot be undone. / 删除这条录音和备注？不可恢复。")) return;
													setSaving(true);
													setError("");
													try {
														await asResearcher(async () => {
															await deleteRecording(path);
															localStorage.removeItem(draftKey);
															onDeleted();
														});
													} catch (e) {
														setError(e instanceof Error ? e.message : String(e));
														setSaving(false);
													}
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 h-4 w-4" }), "Delete / 删除"]
											}),
											dirty && !saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:409:38:88c86f119f05f7e095898a055d2dbd107da8e0981f625f310ea3c3a0935d71c9:1",
												className: "text-sm text-destructive",
												children: "Unsaved changes — click Save / 有未保存的修改，请点保存"
											}),
											saved && !dirty && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:410:37:2a4b315130b5a990ec9a8aa33cabaeb538313f7b31e935b0f2cb03850b6d8230:1",
												className: "text-sm text-muted-foreground",
												children: saved
											})
										]
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:414:13:e82fa1c05e022622aba9ef83239fe6b999c3abc04c61da628137f26ab5ed290c:1",
								className: "space-y-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:415:15:301df052e7118e856ede8de21e72291f070ff68411f8962e80d715e455361c22:1",
										className: "font-medium text-foreground",
										children: rec.meta.title || displayName(path)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecruitmentSourceDetails, { value: rec.meta.recruitmentSource || "" }),
									rec.meta.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:418:17:17d9d6c09ea299a8a60db95751c360e55c1db680a84cb8451206c49e7d794eb0:1",
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:419:19:adee4debf0269aaecaac0d92f66cd58e41c422b6cfea17761a37c42426ea8589:1",
											className: "text-xs text-muted-foreground",
											children: "Notes / 备注"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:420:19:e1edd2c5550c21b5b14abd128a0fc4f8149e4439ecaed29aa0d84461835be857:1",
											className: "whitespace-pre-wrap text-sm text-foreground",
											children: rec.meta.notes
										})]
									}),
									rec.meta.instructions && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:424:17:17d9d6c09ea299a8a60db95751c360e55c1db680a84cb8451206c49e7d794eb0:1",
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "button",
											variant: "outline",
											size: "sm",
											className: "h-auto w-full justify-between whitespace-normal py-2 text-left",
											"aria-expanded": showInstructions,
											onClick: () => setShowInstructions((value) => !value),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:433:21:233cff988f096bbdb33d89badd75dba0794e2bea5fac86428dc322971ab09e6a:1",
												children: "Transcription and translation instructions / 转录与翻译指导"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `ml-2 h-4 w-4 shrink-0 transition-transform ${showInstructions ? "rotate-180" : ""}` })]
										}), showInstructions && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:437:21:7fabeefa22e02b828eba61ccf1cfc7991c60abb622c89e9d339d1ed188aa76a7:1",
											className: "space-y-3 rounded-md border border-border bg-muted p-3 text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:438:23:af7538e50ab5e9b957eefd7918db19d6b38834662e747ccb00fa09859692d8b5:1",
												className: "space-y-1 text-muted-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:439:25:91a1b27c963e9014f4d3bf7c42e24364a7eef2443bd0e2e278d603c4c3c86798:1",
													children: "These instructions identify dialect, informal expressions, homophones with different meanings, and similarly pronounced phrases that may be misheard in this interview."
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:440:25:04af5bdfd4ffe97b754951fc91e4fbe2141ad33883ffef66485970374824bb0e:1",
													children: "这些指导说明了访谈中容易出错的方言、非正式说法、中文同音异义词，以及发音近似、可能被听错的表述。"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:442:23:8e6ee120f15ad46c9dbbc1e4eb656ec6d201fbb761f3954e2688a7e21432651e:1",
												className: "whitespace-pre-wrap border-t border-border pt-3 text-foreground",
												children: rec.meta.instructions
											})]
										})]
									})
								]
							}),
							playerVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:450:13:d7a8ae14b95fac7b98d9935cb1197ace7ea293dff6c7b7544475b22afe317d0b:1",
								className: "flex items-center gap-3 rounded-md bg-muted px-3 py-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										disabled: !playbackEnabled,
										"aria-label": playing ? "Pause recording" : "Play recording",
										title: playing ? "Pause / 暂停" : "Play / 播放",
										onClick: () => {
											const element = player.current;
											if (!element) return;
											if (!playing) {
												setPlayError("");
												element.play();
											} else element.pause();
										},
										children: buffering && playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-5 w-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:459:15:a149def1687eb3ee494a72a75cc5328dae0df808cfdaf0097b97908a4bf13fac:1",
										className: "text-sm text-foreground",
										children: buffering && playing ? "Loading… / 加载中…" : "Play recording / 播放录音"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										disabled: !playbackEnabled || !duration,
										className: "min-w-0 flex-1",
										min: 0,
										max: duration || 1,
										step: .1,
										value: [Math.min(position, duration || 1)],
										"aria-label": "Recording position / 录音位置",
										onValueChange: ([next]) => {
											const element = player.current;
											if (!element || typeof next !== "number") return;
											element.seek(next);
										}
									})
								]
							}),
							playError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:468:25:81588d3b5b0789b3de1d147ef9829831f965be1a9a3a96940c3d971008f0685b:1",
								className: "text-sm text-destructive",
								children: playError
							}),
							canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:470:13:4f95eea8f78c03a4d4a2bcc2f443fbd5be2a570773a48045e0b76a47ee86a691:1",
								className: "space-y-3 border-t border-border pt-4",
								children: [
									["playbackAllowed", "Allow visitor playback / 允许访客播放"],
									["showPlayback", "Show visitor player / 显示访客播放器"],
									["showGenerate", "Show visitor Generate New / 显示访客重新生成"],
									["showRaw", "Show visitor Raw archive / 显示访客原始归档"]
								].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:472:17:c6762c3a9864e9c7d4bc09deec8cdcabe67d2b666c9d05c527f6348ee50d72e1:1",
									className: "flex items-center justify-between gap-3 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:473:19:72c2d99fe541a70643febdef5ff3a53121b8670d22f8eeaa318183d6ad5b81f5:1",
										children: label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										"aria-label": label,
										checked: display[key],
										disabled: saving,
										onCheckedChange: (value) => void saveDisplay(key, value)
									})]
								}, key))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:478:11:cdb1d9b011d87b901d702b6ec903bb2ce69a27ecb6c817f0bcfe6dfd8bff098a:1",
								className: "space-y-3 border-t border-border pt-5",
								children: [
									generateVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										className: "h-auto min-h-10 max-w-full whitespace-normal py-2 text-left",
										onClick: generate,
										disabled: !archivesReady || running || busy || saving,
										variant: canEdit ? "secondary" : "default",
										children: [running && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), "Generate New Raw Translation and Transcription / 生成新的原始翻译与转录 (may take 20–30 minutes)"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:484:13:6655717e661ce8198047f3483d6676bb69fb023c54df44ffe0760c8b8654c3fb:1",
										className: "text-sm text-foreground",
										children: "Click to generate new Raw transcription and translation from the raw recording. Both tasks use the Google Gemini 3.8 Flash model (model ID: google/gemini-3.8-flash) with the transcription and translation instructions shown above. / 点击后，从原始录音生成新的原始转录与翻译。两项任务均使用 Google Gemini 3.8 Flash 模型（model ID：google/gemini-3.8-flash），并采用上方展示的转录与翻译指导。"
									})] }),
									rawVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										className: "h-auto min-h-10 max-w-full whitespace-normal py-2 text-left",
										variant: "destructive",
										onClick: () => setShowArchive("raw"),
										disabled: !archive || editing,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { className: "mr-2 h-4 w-4" }), "View Raw Archived Translation and Transcription / 查看原始翻译与转录归档"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:490:13:882cb03174178d026b6ff9a863edee2968b746da3624f8070be997e377b66538:1",
										className: "text-sm text-foreground",
										children: "Click to read the saved Raw translation and transcription. / 点击查看已保存的原始翻译与转录。"
									})] }),
									running && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										onClick: () => abort.current?.abort(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "mr-2 h-4 w-4" }), "Stop / 停止"]
									}),
									canEdit && complete && !running && lines.length > 0 && !showArchive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										onClick: storeArchive,
										disabled: saving,
										children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-2 h-4 w-4" }), "Save to Raw transcript archive / 存入原始转录归档"]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:499:11:cdb1d9b011d87b901d702b6ec903bb2ce69a27ecb6c817f0bcfe6dfd8bff098a:1",
								className: "space-y-3 border-t border-border pt-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										className: "h-auto min-h-10 max-w-full whitespace-normal py-2 text-left",
										variant: "success",
										disabled: !editedArchive || busy,
										onClick: () => setShowArchive("edited"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { className: "mr-2 h-4 w-4" }), "View Edited Archived Translation and Transcription / 查看修订翻译与转录归档"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:503:13:a854a05897217b0c91399c5356494deb4561027919925d4a589d8a33f78bd711:1",
										className: "text-sm text-foreground",
										children: "Click to read the Edited archive. / 点击查看修订归档。"
									}),
									canEdit && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										disabled: saving || running || !archive?.lines.length,
										onClick: generateEditedFromRaw,
										children: "Generate from current Raw archive / 用当前原始归档生成"
									}),
									canEdit && archive && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										disabled: saving || running,
										onClick: () => startEditing("edited"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-2 h-4 w-4" }), "Edit transcript archive / 编辑转录归档"]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:507:11:cdb1d9b011d87b901d702b6ec903bb2ce69a27ecb6c817f0bcfe6dfd8bff098a:1",
								className: "space-y-3 border-t border-border pt-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										className: "h-auto min-h-10 max-w-full whitespace-normal py-2 text-left",
										variant: "success",
										disabled: !anonArchive || busy,
										onClick: () => setShowArchive("anonymized"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { className: "mr-2 h-4 w-4" }), "View Anonymized Edited Archived Translation and Transcription / 查看匿名修订翻译与转录归档"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:511:13:690ce8a381b7a15b0598e9eb1721e9cf7f91efab47e7333ae989d0c3c48e9254:1",
										className: "text-sm text-foreground",
										children: "Click to read the anonymized Edited archive. / 点击查看匿名修订归档。"
									}),
									canEdit && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										disabled: saving || running || !editedArchive,
										onClick: generateAnonymized,
										children: "Generate from current Edited archive / 用当前修订归档生成"
									}),
									canEdit && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "success",
										disabled: saving || running || !editedArchive?.lines.length,
										onClick: generateManualAnonymized,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-2 h-4 w-4" }), "Manually generate anonymization / 手动生成匿名化"]
									}),
									canEdit && anonArchive && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										disabled: saving || running,
										onClick: () => startEditing("anonymized"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-2 h-4 w-4" }), "Edit / 编辑"]
									}),
									anonProgress && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:515:30:c3d27cea54e0560817941bb3dd29a08ebfa71928d0c8bb87527464533b277f53:1",
										className: "flex items-center text-sm text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
											"Anonymizing… / 匿名化中… ",
											anonProgress
										]
									})
								]
							}),
							[[
								"text",
								"View Edited Archived Translation and Transcription in Text / 查看修订翻译与转录归档文本版",
								editedArchive,
								"edited"
							], [
								"anonymized-text",
								"View Anonymized Edited Archived Translation and Transcription in Text / 查看匿名修订翻译与转录归档文本版",
								anonArchive,
								"anonymized"
							]].map(([kind, label, src, suffix]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:518:13:0024f5844dba892da2c8439a5d31ffd79a7019b86b587d8c91d5b70589f14360:1",
								className: "space-y-3 border-t border-border pt-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										className: "h-auto min-h-10 max-w-full whitespace-normal py-2 text-left",
										variant: "success",
										disabled: !archiveOf(kind) || busy,
										onClick: () => setShowArchive(kind),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { className: "mr-2 h-4 w-4" }), label]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:522:15:564f3f474c450864afc0748000cc92d7b65f142ae9ae3f1bdc7ac26980548665:1",
										className: "text-sm text-foreground",
										children: kind === "text" ? "Click to read the Edited archive in text format. / 点击查看修订归档文本版。" : "Click to read the anonymized Edited archive in text format. / 点击查看匿名修订归档文本版。"
									}),
									archiveOf(kind)?.text && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										onClick: () => (() => {
											const text = archiveOf(kind)?.text;
											if (text) downloadText(appendixText(text), `${fileBase}-${kind}.txt`);
										})(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 h-4 w-4" }), "Download TXT / 下载 TXT"]
									}),
									archiveOf(kind)?.text && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										onClick: () => {
											const text = archiveOf(kind)?.text;
											if (text) downloadDocx(appendixText(text), `${fileBase}-${kind}.docx`).catch(() => setError("Word download failed. / Word 下载失败。"));
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 h-4 w-4" }), "Download Word / 下载 Word"]
									}),
									canEdit && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										disabled: saving || running || !src,
										onClick: () => startText(kind, true),
										children: [
											"Generate from current ",
											suffix === "edited" ? "Edited" : "Anonymized",
											" archive / 用当前",
											suffix === "edited" ? "修订" : "匿名",
											"归档生成"
										]
									}),
									canEdit && archiveOf(kind) && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										disabled: saving || running,
										onClick: () => startText(kind, false),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-2 h-4 w-4" }), "Edit / 编辑"]
									})
								]
							}, kind)),
							canEdit && (editing || textDraft) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:532:13:2082eeabaff57b7c8b364367d5eb760288b28e250d83df996a6b08cf2af6937c:1",
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "success",
									disabled: saving || (editing ? !editLines.some((line) => line.zh.trim() || line.en.trim()) : !textDraft?.value.trim()),
									onClick: editing ? storeEditedArchive : storeText,
									children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-2 h-4 w-4" }), editing ? lineKind === "edited" ? "Save to Edited archive / 存入修订归档" : "Save to Anonymized archive / 存入匿名归档" : "Save text archive / 存入文本归档"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									disabled: saving,
									onClick: () => {
										setEditing(false);
										setTextDraft(null);
										setShowArchive(false);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-2 h-4 w-4" }), "Cancel / 取消"]
								})]
							}),
							canEdit && !running && !complete && lines.length > 0 && !showArchive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:540:13:07a466c550b7cc6c318855f68e38a041ad7633d22069ace48bc0bff1a5c222b1:1",
								className: "text-sm text-muted-foreground",
								children: "This run was not completed, so it cannot be saved to the archive. Generate again and let it finish. / 本次生成未完成，不能存入归档；请重新生成并等待全部完成。"
							}),
							canEdit && needSignIn && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:543:13:fc08df83e0eb471eee3dae7e0b05d359dd8ce295100573b4b6bd7a7dafddcc47:1",
								className: "flex flex-wrap items-center gap-2",
								onSubmit: (e) => {
									e.preventDefault();
									reSignIn();
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "password",
									autoComplete: "current-password",
									placeholder: "Researcher password / 研究者密码",
									value: password,
									onChange: (e) => setPassword(e.target.value),
									className: "max-w-xs"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									disabled: saving || !password,
									children: "Sign in and continue / 登录并继续"
								})]
							}),
							saved && !canEdit ? null : saved && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:548:48:71dac4fba9ea985c5f8573068897c64afacab751502d78a2ac49b034385b971f:1",
								className: "text-sm text-muted-foreground",
								children: saved
							}),
							progress && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:550:13:16f67f86847ab5533c5e6d54ed6042f772b1e3af77ed438e82802871142ae904:1",
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: progress.total ? progress.done / progress.total * 100 : 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:552:15:8a3fdd12f5b3cae0ec89ea12aeb3382a260da7f6768a6d35fd921917a9d3a157:1",
									className: "text-xs text-muted-foreground",
									children: `${progress.done} / ${progress.total} sections · ${lines.length} sentences`
								})]
							}),
							running && !progress && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:555:36:32209d82e41dd260a74fb4b0fafc2bd1c054d9cf63aade2cd8a8411e7ab1f18a:1",
								className: "text-xs text-muted-foreground",
								children: "Downloading and reading audio… / 下载并读取录音…"
							})
						]
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:557:21:1a7a6b1b05fe5b656ffced7250ff9258445352be2ff2d4edb06a8da0837de168:1",
						className: "text-sm text-destructive",
						children: error
					}),
					archiveStatus === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "icon",
						"aria-label": "Retry loading archives / 重试加载归档",
						title: "Retry / 重试",
						onClick: () => setArchiveAttempt((value) => value + 1),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, { className: "h-4 w-4" })
					})
				]
			}) }),
			showArchive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:561:23:9529593fed872a82f9568d98d5288289a11fa2a91462a3d30dc5fc5c99f7d66e:1",
				className: "font-medium text-foreground",
				children: [{
					raw: "Raw archive / 原始归档",
					edited: "Edited archive / 修订归档",
					anonymized: "Anonymized Edited archive / 匿名修订归档",
					text: "Edited archive in text / 修订归档文本版",
					"anonymized-text": "Anonymized Edited archive in text / 匿名修订归档文本版"
				}[showArchive], (editing || textDraft) && " — editing, not saved yet / 编辑中，尚未保存"]
			}),
			showArchive && !editing && !textDraft && !archiveOf(showArchive) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:565:76:f9baf21939ae08ab65bfe874579756cf55a1cca6fe04229eb63b02d454c31b15:1",
				className: "text-sm text-muted-foreground",
				children: "No transcript archive has been saved yet. / 暂无已保存的转录归档"
			}),
			canEdit && textDraft ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				"aria-label": "Text archive",
				className: "min-h-[60vh] font-mono text-sm",
				value: textDraft.value,
				disabled: saving,
				onChange: (e) => {
					setTextDraft({
						...textDraft,
						value: e.target.value
					});
					localStorage.setItem(textDraftKey(textDraft.kind), e.target.value);
				}
			}) : (showArchive === "text" || showArchive === "anonymized-text") && archiveOf(showArchive)?.text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:570:9:1400762f958a4cf978183880f46ecc82fd04956874cad838d47d4ef070d3ae0a:1",
				className: "whitespace-pre-wrap rounded-md border border-border bg-card p-3 text-sm text-foreground",
				children: appendixText(archiveOf(showArchive)?.text || "")
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:572:7:4f5ae1ca7adb6b692b5e14ae188941fcb87d0860e8e34baeee15c77acda17240:1",
				className: "space-y-2",
				children: (showArchive === "text" || showArchive === "anonymized-text" ? [] : canEdit && editing ? editLines : showArchive ? archiveOf(showArchive)?.lines || [] : lines).map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:574:11:bfa7a323491f3ca398134627f703e89405ab0b725e5f377b9efb4c2dcf0c25e6:1",
					className: "flex gap-3 rounded-md border border-border bg-card p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:575:13:cf49613641fe48ba2642b4c1a5140376affc6b0c687bff7bc753e077fed10aa1:1",
						className: `mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${l.s === "A" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`,
						children: l.s
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:576:13:6293d317c0f67189fa4bc4318bdff814512ac69ffd623fba8c61b03f941852af:1",
						className: "min-w-0 flex-1 space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:577:15:69cddfafc879561973e3fc4bd0b17716fb92c3b240c9091c2cbcbd7fd574b170:1",
							className: "text-xs text-muted-foreground",
							children: [
								"#",
								i + 1,
								" · ",
								speakerLabel(l.s)
							]
						}), canEdit && editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:579:17:24c8d0e8ab9deaae5299a6fb8d05cffe9b5bc39af7615025110bbfa7089e9fa2:1",
								className: "flex items-center gap-2 text-sm",
								children: ["Speaker / 说话人", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:580:19:8d8c9537992d92e25c72cae885f33f0d40bca292d40821ea652010e75461ebb9:1",
									"aria-label": `Speaker ${i + 1}`,
									className: "rounded-md border border-input bg-background p-1 text-foreground",
									value: l.s,
									disabled: saving,
									onChange: (e) => changeLine(i, { s: e.target.value === "B" ? "B" : "A" }),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:580:241:8d8c9537992d92e25c72cae885f33f0d40bca292d40821ea652010e75461ebb9:0",
										value: "A",
										children: "A — Interviewer / 访谈者"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:580:289:8d8c9537992d92e25c72cae885f33f0d40bca292d40821ea652010e75461ebb9:0",
										value: "B",
										children: "B — Interviewee / 受访者"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								"aria-label": `Chinese transcript ${i + 1}`,
								value: l.zh,
								disabled: saving,
								onChange: (e) => changeLine(i, { zh: e.target.value })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								"aria-label": `English translation ${i + 1}`,
								value: l.en,
								disabled: saving,
								onChange: (e) => changeLine(i, { en: e.target.value })
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:584:23:baa84540e27ce81415dc0e1caacefb2fac3f1d877b12afb37f4e9d019944783f:0",
							className: "text-foreground",
							children: l.zh
						}), l.en && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "pages/researcher/InterviewsPanel.tsx:584:73:baa84540e27ce81415dc0e1caacefb2fac3f1d877b12afb37f4e9d019944783f:0",
							className: "text-sm text-muted-foreground",
							children: l.en
						})] })]
					})]
				}, i))
			})
		]
	});
}
function ResearchCodeLegend() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/esm/ResearchCodeLegend.tsx:2:10:b7e338dc7d64c565b1839f74963e26a20fd6b2a7b635b0f194ede33931902b40:1",
		className: "space-y-1 py-2 text-xs text-muted-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/esm/ResearchCodeLegend.tsx:3:5:0c8647a49c63967c7701ce5726325e7bc53a077c59cd74dbf102066700d0c251:1",
				children: "P = Participant / 参与者 · CN = Care Network / 护理网络"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/esm/ResearchCodeLegend.tsx:4:5:fa0804723fdac0d379c494368988ae6ac18b33f63f4dcc58fd0abe5f118a4e80:1",
				children: "A = Primary Caregiver / 主要护理者"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/esm/ResearchCodeLegend.tsx:5:5:14c8ef2bef73d1c7671069f825b4a8222bc30a1233cbc792cae4b4a391c34b44:1",
				children: "B = Secondary Caregiver belonging to the Care Network / 网络内次要护理者"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/esm/ResearchCodeLegend.tsx:6:5:16516617cbc89e679497bc54c7922c7e15e680faab0254d9fb1b8b45e7d15dd5:1",
				children: "C = Occasional Caregiver / 偶发护理者"
			})
		]
	});
}
function ParticipantDetails({ id, meta, canEdit, onSaved }) {
	const [draft, setDraft] = (0, import_react.useState)(meta);
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	async function save() {
		if (!canEdit || !draft.title.trim()) return;
		setSaving(true);
		setError("");
		try {
			await wpEnsureFreshToken();
			const stored = await saveParticipantMeta(id, draft);
			onSaved(stored);
			setDraft(stored);
			setEditing(false);
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/esm/ParticipantDetails.tsx:25:10:abbd2af76450b2323f3c94f9b9a9477fbbd7087b1a36272ae7abfc3466f49925:1",
		className: "mb-6 space-y-4 border-b border-border pb-4",
		children: [editing && canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				"data-inspector-source": "components/esm/ParticipantDetails.tsx:27:7:4d3b93aa606b1546ae2b0fc455d2d2f62e9d1591f91530aae416d130bbccf183:1",
				htmlFor: "participant-title",
				className: "text-xs text-muted-foreground",
				children: "Title / 标题（姓名与身份）"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id: "participant-title",
				value: draft.title,
				onChange: (e) => setDraft({
					...draft,
					title: e.target.value
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				"data-inspector-source": "components/esm/ParticipantDetails.tsx:29:7:8fad4e7b49b9eda6647bbb04261b069ac4e76b635b40d5ee83eb26c2284a96ff:1",
				htmlFor: "participant-recruitment",
				className: "text-xs text-muted-foreground",
				children: "Recruitment source / 招募来源"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecruitmentSourceSelect, {
				id: "participant-recruitment",
				value: draft.recruitmentSource,
				onChange: (recruitmentSource) => setDraft({
					...draft,
					recruitmentSource
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				"data-inspector-source": "components/esm/ParticipantDetails.tsx:31:7:ff58c163ac973b9fff97ba04f0e485e56238b3b7747666c0c04b441ea0ac1da9:1",
				htmlFor: "participant-notes",
				className: "text-xs text-muted-foreground",
				children: "Notes / 备注"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				id: "participant-notes",
				value: draft.notes,
				onChange: (e) => setDraft({
					...draft,
					notes: e.target.value
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/esm/ParticipantDetails.tsx:33:7:eba64024a6f893bccf795c7cd5b520cff2b51716f07e5a24b63086f2a457d624:1",
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: save,
					disabled: saving || !draft.title.trim(),
					children: saving ? "Saving… / 保存中…" : "Save / 保存"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					disabled: saving,
					onClick: () => {
						setDraft(meta);
						setEditing(false);
						setError("");
					},
					children: "Cancel / 取消"
				})]
			})
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/esm/ParticipantDetails.tsx:35:7:919c490554adb0f4265d98bc06f8e1fa44a45a5d434565e64af12b2df39a1a67:1",
				className: "break-words font-medium",
				children: meta.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecruitmentSourceDetails, { value: meta.recruitmentSource }, id),
			meta.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/esm/ParticipantDetails.tsx:37:22:43d9695b203894475242241e422487d6b6ab2d21e1d59a7cc77bc540677ad3e0:1",
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/esm/ParticipantDetails.tsx:37:49:43d9695b203894475242241e422487d6b6ab2d21e1d59a7cc77bc540677ad3e0:0",
					className: "text-xs text-muted-foreground",
					children: "Notes / 备注"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/esm/ParticipantDetails.tsx:37:108:43d9695b203894475242241e422487d6b6ab2d21e1d59a7cc77bc540677ad3e0:0",
					className: "whitespace-pre-wrap text-sm",
					children: meta.notes
				})]
			}),
			canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				onClick: () => {
					setDraft(meta);
					setEditing(true);
				},
				children: "Edit participant / 编辑参与者"
			})
		] }), error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			"data-inspector-source": "components/esm/ParticipantDetails.tsx:40:15:7174df6ba1adac21751d9250497823f673bb8a2b285e9e5e4fea4e61d14e2109:1",
			role: "alert",
			className: "text-sm text-destructive",
			children: error
		})]
	});
}
var RESEARCHER = "researcher";
var CCT_NO = {
	screening: "318",
	hourly: "319",
	daily: "317"
};
var INTERVIEW_PARTICIPANTS = [
	{
		aliases: ["张磊", "Zhang Lei"],
		title: "Network1, Caregiver1: Zhang Lei，34，Son，Primary caregiver"
	},
	{
		aliases: ["李婷", "Li Ting"],
		title: "Network1, Caregiver2: Li Ting，32，Daughter in law，Secondary caregiver"
	},
	{
		aliases: ["赵桂兰", "Zhao Guilan"],
		title: "Network2, Caregiver1: Zhao Guilan，69, Wife, Primary Caregiver"
	},
	{
		aliases: ["王海涛", "Wang Hai Tao"],
		title: "Network2, Caregiver2: Wang Hai Tao，40, Son, Secondary Caregiver"
	},
	{
		aliases: ["钱建华", "Qian Jianhua"],
		title: "Network2, Caregiver3: Qian Jianhua, friend of the PWD, Secondary Caregiver"
	},
	{
		aliases: ["孙志强", "Sun Zhiqiang"],
		title: "Network3, Caregiver1: Sun Zhiqiang，67, Son, Primary Caregiver, working"
	},
	{
		aliases: ["王慧兰", "Wang Huilan"],
		title: "Network3, Caregiver2: Wang Huilan，65, Daughter in law, Secondary Caregiver, working"
	},
	{
		aliases: ["王国强", "Wang Guoqiang"],
		title: "Network4, Caregiver1: Wang Guoqiang，husband, Primary Caregiver, working (retired working part time)"
	},
	{
		aliases: ["梁国强", "Liang Guoqiang"],
		title: "Network5, Caregiver1: Liang Guoqiang，57, Son, Primary Caregiver, working (middle school teacher)"
	},
	{
		aliases: ["梁静", "Liang Jing"],
		title: "Network5, Caregiver2: Liang Jing，27, Grand daughter, Secondary Caregiver, working"
	},
	{
		aliases: ["刘卫东", "Liu Weidong"],
		title: "Network6, Caregiver1: Liu Weidong, 73, husband, Primary Caregiver, retired"
	},
	{
		aliases: ["陈建国", "Chen Jianguo"],
		title: "Network7, Caregiver1: Chen Jianguo, husband, Primary Caregiver, retired"
	},
	{
		aliases: [
			"李淑芬",
			"Li Shufen",
			"lishufenesm01"
		],
		title: "Network7, Caregiver2: Li Shufen, 62, younger sister of the PWD, Secondary Caregiver, retired"
	},
	{
		aliases: ["陈志明", "Chen Zhiming"],
		title: "Network8, Caregiver1: Chen Zhiming，33，Son，Primary caregiver，working"
	},
	{
		aliases: [
			"林小梅",
			"林梅",
			"Lin Mei"
		],
		title: "Network8, Caregiver2: Lin Mei，31，Daughter in law，Secondary caregiver"
	}
];
var interviewParticipant = (name) => INTERVIEW_PARTICIPANTS.find((participant) => participant.aliases.includes(name));
function isResearcher() {
	return getStoredWPUser()?.user_login === RESEARCHER;
}
/** Researcher dashboard: every participant's answers; only the researcher account can edit. */
function ResearcherApp() {
	const [signedIn, setSignedIn] = (0, import_react.useState)(isResearcher());
	const [activeTab, setActiveTab] = (0, import_react.useState)(new URL(window.location.href).searchParams.get("tab") === "participants" ? "participants" : "interviews");
	(0, import_react.useEffect)(() => {
		const url = new URL(window.location.href);
		if (url.searchParams.get("__site") !== "researcher") {
			url.searchParams.set("__site", "researcher");
			window.history.replaceState({}, "", url.toString());
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (!signedIn) return;
		const renew = () => {
			wpEnsureFreshToken();
		};
		wpRefreshToken();
		const timer = window.setInterval(renew, 300 * 1e3);
		const onVisible = () => {
			if (document.visibilityState === "visible") renew();
		};
		document.addEventListener("visibilitychange", onVisible);
		window.addEventListener("focus", renew);
		return () => {
			window.clearInterval(timer);
			document.removeEventListener("visibilitychange", onVisible);
			window.removeEventListener("focus", renew);
		};
	}, [signedIn]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/researcher/ResearcherApp.tsx:91:5:1f3f5a39f19e1b2bccd04cea6e88041e30b82ef38b8b7a368169c1144ca8b2fd:1",
		className: "min-h-dvh bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			"data-inspector-source": "pages/researcher/ResearcherApp.tsx:92:7:d16a8f50f53a8ca78364c02df2f4ea7a4f911d61f53df9622914d882d8ea039d:1",
			className: "sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/researcher/ResearcherApp.tsx:93:9:c77bee4fef24ddf6da235067111f81b42a30d5454a3b837d9853b50567fc4d32:1",
				className: "mx-auto flex h-14 max-w-5xl items-center justify-between px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"data-inspector-source": "pages/researcher/ResearcherApp.tsx:94:11:b51aa68720d9a480ddad410da77b22c1396993ccebd8db7ff55fae610acb82ac:1",
					className: "font-semibold text-foreground",
					children: signedIn ? "Researcher dashboard" : "Interview records / 访谈记录"
				}), signedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => {
						wpLogout();
						setSignedIn(false);
					},
					children: "Sign out"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => setActiveTab("participants"),
					children: "Researcher sign in / 研究者登录"
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			value: activeTab,
			onValueChange: setActiveTab,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/researcher/ResearcherApp.tsx:103:9:ecebcbd12721c34afea4ddc0231a23b3adf8c94d49729a025279c8354164a9fe:1",
					className: "mx-auto max-w-5xl px-4 pt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResearchCodeLegend, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "participants",
						children: "Participants / 参与者"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "interviews",
						children: "Interviews / 访谈记录"
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "participants",
					children: signedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Login, { onDone: () => setSignedIn(true) })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "interviews",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InterviewsPanel, { canEdit: signedIn }, String(signedIn))
				})
			]
		})]
	});
}
function Login({ onDone }) {
	const [username, setUsername] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const submit = async (e) => {
		e.preventDefault();
		setError("");
		if (username.trim().toLowerCase() !== RESEARCHER) {
			setError("Only the researcher account can sign in here.");
			return;
		}
		setBusy(true);
		try {
			await wpLogin(RESEARCHER, password);
			if (!isResearcher()) {
				wpLogout();
				throw new Error("Only the researcher account can sign in here.");
			}
			onDone();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Sign-in failed");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		"data-inspector-source": "pages/researcher/ResearcherApp.tsx:145:5:af2562645cbcbf44a1304f5850d2a84367b8400fb4e1bcc4167edf35d2b1ee57:1",
		onSubmit: submit,
		className: "mx-auto mt-16 max-w-sm space-y-3 px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				"data-inspector-source": "pages/researcher/ResearcherApp.tsx:146:7:4775087feecf4d00e9deab01ba3c363a507d9ef54b398cd24a036469dda27cc6:1",
				className: "text-xl font-semibold text-foreground",
				children: "Researcher sign in"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Username",
				value: username,
				onChange: (e) => setUsername(e.target.value),
				autoComplete: "username"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "password",
				placeholder: "Password",
				value: password,
				onChange: (e) => setPassword(e.target.value),
				autoComplete: "current-password"
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "pages/researcher/ResearcherApp.tsx:149:17:72b0472c1a13b7928be44ce0c9d0e66f9e9bd7e49aedc4a21ff30c492df37660:1",
				className: "text-sm text-destructive",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				className: "w-full",
				disabled: busy,
				children: busy ? "Signing in…" : "Sign in"
			})
		]
	});
}
async function loadAll() {
	const kinds = [
		"screening",
		"hourly",
		"daily"
	];
	const [rels, tables, displayMetas, recordings] = await Promise.all([
		Promise.all(kinds.map((k) => wordpressFetch(`jet-rel/${ESM_REL[k]}`).catch(() => ({})))),
		Promise.all(kinds.map((k) => wordpressCCTFetch(ESM_CCT[k]).catch(() => []))),
		listParticipantMeta(),
		listRecordings()
	]);
	const byId = kinds.map((_, i) => new Map((tables[i] || []).map((r) => [String(r["id"] ?? r["_ID"]), r])));
	const map = /* @__PURE__ */ new Map();
	kinds.forEach((k, i) => {
		Object.entries(rels[i] || {}).forEach(([userId, links]) => {
			const p = map.get(userId) ?? {
				id: userId,
				name: `User ${userId}`,
				rows: {
					screening: [],
					hourly: [],
					daily: []
				}
			};
			(links || []).forEach((l) => {
				const row = byId[i].get(String(l.child_object_id));
				if (row) p.rows[k].push(row);
			});
			map.set(userId, p);
		});
	});
	const ids = [...map.keys()];
	if (ids.length) (await wpAdminOps("get_user_names", { ids }).catch(() => null) || []).forEach((u) => {
		const p = map.get(String(u.id));
		if (!p) return;
		const storedName = u.name || u.email || p.name;
		const known = interviewParticipant(storedName);
		p.name = known && recordings.find((r) => known.aliases.some((alias) => r.meta.title.includes(alias)))?.meta.title || known?.title || storedName;
	});
	map.forEach((p) => {
		p.sourceName = p.name;
		p.displayMeta = displayMetas[p.id] || {
			title: p.name,
			recruitmentSource: "",
			notes: ""
		};
		p.name = p.displayMeta.title;
		kinds.forEach((k) => p.rows[k].sort((a, b) => compareStudyRows(k, a, b)));
	});
	return [...map.values()].filter((p) => p.rows.screening.length + p.rows.hourly.length + p.rows.daily.length > 0).sort((a, b) => compareResearchTitles(a.name, b.name) || Number(a.id) - Number(b.id));
}
function Dashboard() {
	const [data, setData] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [selected, setSelected] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		loadAll().then((d) => {
			setData(d);
			setSelected(d[0]?.id ?? "");
		}).catch((e) => setError(String(e?.message || e)));
	}, []);
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		"data-inspector-source": "pages/researcher/ResearcherApp.tsx:205:21:cc5ee2bf09831bb0a0583bdc55a2f74dabfe192f9c156a007765b3ef6df41ce0:1",
		className: "p-6 text-destructive",
		children: error
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		"data-inspector-source": "pages/researcher/ResearcherApp.tsx:206:21:a13a67c482a077c89b511554201627000cefd9fb22ad9d1777f56266b9dcb3c9:1",
		className: "p-6 text-muted-foreground",
		children: "Loading all participants…"
	});
	const current = data.find((p) => p.id === selected);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/researcher/ResearcherApp.tsx:210:5:7ccbdb9e85c9f1a0ab7f5af816a7325b8df1c629e21aa2e55c9982b299e5cfe1:1",
		className: "mx-auto grid max-w-5xl gap-4 px-4 py-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			"data-inspector-source": "pages/researcher/ResearcherApp.tsx:211:7:49f8e3a15fa8390cd312ffdde8e419b0542162cb2224f26b0c6a171522a10f39:1",
			className: "space-y-1",
			children: data.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				"data-inspector-source": "pages/researcher/ResearcherApp.tsx:213:11:8c368e75324f39218072cbe2158a018716f2db9df494990d6585f50bfb5db9fb:1",
				onClick: () => setSelected(p.id),
				className: `w-full rounded-md px-3 py-2 text-left text-sm ${p.id === selected ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "pages/researcher/ResearcherApp.tsx:218:13:5c3ccf38e1f33ce01997f47100cd88e40cdd17792d29c057ba790a39fb725821:1",
					className: "whitespace-normal break-words font-medium leading-snug",
					children: p.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/researcher/ResearcherApp.tsx:219:13:8f3eb6cc415fee21d56d34c8d640cc49b0f5285526b95d18c0c4f11effdd9b92:1",
					className: "text-xs opacity-80",
					children: [
						p.rows.hourly.length,
						" hourly · ",
						p.rows.daily.length,
						" daily · ",
						p.rows.screening.length,
						" screening"
					]
				})]
			}, p.id))
		}), current && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "hourly",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParticipantDetails, {
					id: current.id,
					meta: current.displayMeta || {
						title: current.name,
						recruitmentSource: "",
						notes: ""
					},
					canEdit: isResearcher(),
					onSaved: (meta) => setData((rows) => rows?.map((p) => p.id === current.id ? {
						...p,
						name: meta.title,
						displayMeta: meta
					} : p).sort((a, b) => compareResearchTitles(a.name, b.name) || Number(a.id) - Number(b.id)) || [])
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "grid w-full grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "screening",
							children: [
								"Screening (",
								current.rows.screening.length,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "hourly",
							children: [
								"Hourly (",
								current.rows.hourly.length,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "daily",
							children: [
								"Daily (",
								current.rows.daily.length,
								")"
							]
						})
					]
				}),
				[
					"screening",
					"hourly",
					"daily"
				].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: k,
					className: "mt-4 space-y-3",
					children: [current.rows[k].length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "pages/researcher/ResearcherApp.tsx:233:48:7f6acab89e6108fb7d290fc03dfc84337ac41943eafa27df1f97ecda9193a6fb:1",
						className: "text-muted-foreground",
						children: "No answers yet."
					}), current.rows[k].map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnswerCard, {
						kind: k,
						row,
						participantName: current.sourceName || current.name,
						start: studyStart(current),
						studyDay: k === "daily" ? index + 1 : void 0,
						canEdit: isResearcher()
					}, row["id"]))]
				}, k))
			]
		}, current.id)]
	});
}
var HAN = /[\u4e00-\u9fff]/;
var TR_CACHE_KEY = "researcher-auto-translation-v2";
function readTrCache() {
	try {
		return JSON.parse(localStorage.getItem(TR_CACHE_KEY) || "{}");
	} catch {
		return {};
	}
}
var pending = null;
function autoTranslate(texts) {
	const cache = readTrCache();
	const missing = texts.filter((t) => !cache[t]);
	if (!missing.length) return Promise.resolve(cache);
	return new Promise((resolve, reject) => {
		if (!pending) {
			pending = {
				texts: /* @__PURE__ */ new Set(),
				waiters: [],
				fail: []
			};
			window.setTimeout(async () => {
				const batch = pending;
				pending = null;
				try {
					const list = [...batch.texts];
					const c = readTrCache();
					const chunks = [];
					for (let i = 0; i < list.length; i += 4) chunks.push(list.slice(i, i + 4));
					await Promise.all(chunks.map(async (chunk) => {
						for (let attempt = 0; attempt < 3; attempt++) {
							const { data, error } = await supabase.functions.invoke("ai?task=chat-translate", { body: { texts: chunk } });
							const out = data?.translations || [];
							if (!error && out.length) {
								chunk.forEach((t, j) => {
									if (out[j]) c[t] = out[j];
								});
								return;
							}
							await new Promise((r) => setTimeout(r, 2e3 * (attempt + 1)));
						}
					}));
					try {
						localStorage.setItem(TR_CACHE_KEY, JSON.stringify(c));
					} catch {}
					batch.waiters.forEach((w) => w(c));
				} catch (e) {
					batch.fail.forEach((f) => f(e));
				}
			}, 100);
		}
		missing.forEach((t) => pending.texts.add(t));
		pending.waiters.push(resolve);
		pending.fail.push(reject);
	});
}
/** Splits a stored timestamp (ISO text or unix seconds/ms) into a local day number and clock time. */
function parseStamp(value) {
	const text = String(value ?? "").trim();
	if (/^\d{9,13}$/.test(text) || /Z$|[+-]\d{2}:\d{2}$/.test(text)) {
		const d = /^\d+$/.test(text) ? new Date(text.length > 10 ? Number(text) : Number(text) * 1e3) : new Date(text);
		return {
			day: Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5),
			hour: d.getHours(),
			minute: String(d.getMinutes()).padStart(2, "0")
		};
	}
	const m = text.match(/(\d{4})-(\d{2})-(\d{2})/);
	const t = text.match(/(?:T|\s|^)(\d{1,2}):(\d{2})/);
	return {
		day: m ? Math.round(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 864e5) : null,
		hour: t ? Number(t[1]) : null,
		minute: t ? t[2] : ""
	};
}
/** When a row's answers happened: its first dated answer, else when it was saved. */
function rowStamp(kind, row) {
	const dated = ESM_SPEC.find((i) => i.cct === CCT_NO[kind] && (i.type === "datetime" || i.type === "date") && parseStamp(row[i.column]).day !== null);
	return dated ? row[dated.column] : row["created_at"];
}
/** Study answers run chronologically: day 1–7, then morning–evening within each day. */
function compareStudyRows(kind, a, b) {
	const left = parseStamp(rowStamp(kind, a));
	const right = parseStamp(rowStamp(kind, b));
	const leftDay = left.day ?? Number.POSITIVE_INFINITY;
	const rightDay = right.day ?? Number.POSITIVE_INFINITY;
	if (leftDay !== rightDay) return leftDay - rightDay;
	const leftMinutes = left.hour === null ? Number.POSITIVE_INFINITY : left.hour * 60 + Number(left.minute || 0);
	const rightMinutes = right.hour === null ? Number.POSITIVE_INFINITY : right.hour * 60 + Number(right.minute || 0);
	if (leftMinutes !== rightMinutes) return leftMinutes - rightMinutes;
	const createdOrder = String(a["created_at"] ?? "").localeCompare(String(b["created_at"] ?? ""));
	if (createdOrder !== 0) return createdOrder;
	return Number(a["id"] ?? a["_ID"] ?? 0) - Number(b["id"] ?? b["_ID"] ?? 0);
}
function studyStart(p) {
	const days = [...p.rows.hourly.map((r) => rowStamp("hourly", r)), ...p.rows.daily.map((r) => rowStamp("daily", r))].map((v) => parseStamp(v).day).filter((d) => d !== null);
	return days.length ? Math.min(...days) : null;
}
function studyTime(value, start, studyDay) {
	const { day, hour, minute } = parseStamp(value);
	const parts = [];
	const displayedDay = studyDay ?? (day !== null && start !== null ? day - start + 1 : null);
	if (displayedDay !== null) parts.push(`Study day ${displayedDay} / 研究第 ${displayedDay} 天`);
	if (hour !== null) parts.push(`${hour < 12 ? "上午" : "下午"} ${hour % 12 || 12}:${minute}`);
	return parts.length || day !== null ? parts.join(" · ") : String(value ?? "");
}
function AnswerCard({ kind, row: initialRow, participantName = "", start, studyDay, canEdit }) {
	const role = kind === "screening" ? screeningRole(participantName, initialRow) : null;
	const items = (0, import_react.useMemo)(() => kind === "screening" ? role ? screeningItemsForRole(role) : [] : ESM_SPEC.filter((i) => i.cct === CCT_NO[kind]), [kind, role]);
	const [row, setRow] = (0, import_react.useState)(initialRow);
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [draft, setDraft] = (0, import_react.useState)({});
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [saveError, setSaveError] = (0, import_react.useState)("");
	const [translations, setTranslations] = (0, import_react.useState)({});
	const [trError, setTrError] = (0, import_react.useState)(false);
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(false);
	const [deleted, setDeleted] = (0, import_react.useState)(false);
	const freeTexts = (0, import_react.useMemo)(() => items.filter((i) => !i.options && (i.type === "text" || i.type === "longtext")).map((i) => String(row[i.column] ?? "")).filter((t) => HAN.test(t)), [items, row]);
	(0, import_react.useEffect)(() => {
		if (!freeTexts.length) return;
		let alive = true;
		autoTranslate(freeTexts).then((c) => alive && setTranslations(c)).catch(() => alive && setTrError(true));
		return () => {
			alive = false;
		};
	}, [freeTexts]);
	const save = async () => {
		const changed = {};
		Object.entries(draft).forEach(([k, v]) => {
			if (String(v ?? "") !== String(row[k] ?? "")) changed[k] = v;
		});
		if (!Object.keys(changed).length) {
			setEditing(false);
			return;
		}
		setSaving(true);
		setSaveError("");
		try {
			await wpEnsureFreshToken();
			await wordpressCCTFetch(ESM_CCT[kind], {
				id: row["id"],
				method: "POST",
				body: changed
			});
			const fresh = await wordpressCCTFetch(ESM_CCT[kind], { id: row["id"] });
			setRow(fresh && typeof fresh === "object" && "id" in fresh ? fresh : {
				...row,
				...changed
			});
			setEditing(false);
		} catch (e) {
			setSaveError(e instanceof Error ? e.message : "Save failed");
		} finally {
			setSaving(false);
		}
	};
	const remove = async () => {
		setSaving(true);
		setSaveError("");
		try {
			await wpEnsureFreshToken();
			await wordpressCCTFetch(ESM_CCT[kind], {
				id: row["id"],
				method: "DELETE"
			});
			setDeleted(true);
		} catch (e) {
			setSaveError(e instanceof Error ? e.message : "Delete failed");
		} finally {
			setSaving(false);
			setConfirmDelete(false);
		}
	};
	if (deleted) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
		className: "flex flex-row items-center justify-between gap-2 pb-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-sm text-muted-foreground",
				children: studyTime(rowStamp(kind, row), start, studyDay)
			}),
			canEdit && !editing && !confirmDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/researcher/ResearcherApp.tsx:387:11:399695daa0d3e9f56cad751c79ccb0dea05106812f8a4c18a0a193723df16599:1",
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => {
						setDraft({ ...row });
						setEditing(true);
					},
					children: "Edit / 编辑"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "destructive",
					onClick: () => setConfirmDelete(true),
					children: "Delete / 删除"
				})]
			}),
			canEdit && confirmDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/researcher/ResearcherApp.tsx:393:11:519174b1da7ad64b3ddae5cf2cbb627244a355cf15cb35e2d2121a2f9e8381e2:1",
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-source": "pages/researcher/ResearcherApp.tsx:394:13:13bf7849e7f1796b16e9196682b7652168dae9a9400540ab3474d0bc02c6f45d:1",
						className: "text-sm text-destructive",
						children: "Delete this record? / 确定删除这条记录？"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						disabled: saving,
						onClick: () => setConfirmDelete(false),
						children: "Cancel / 取消"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "destructive",
						disabled: saving,
						onClick: remove,
						children: saving ? "Deleting… / 删除中…" : "Yes, delete / 确认删除"
					})
				]
			}),
			canEdit && editing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/researcher/ResearcherApp.tsx:400:11:399695daa0d3e9f56cad751c79ccb0dea05106812f8a4c18a0a193723df16599:1",
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					disabled: saving,
					onClick: () => {
						setEditing(false);
						setSaveError("");
					},
					children: "Cancel / 取消"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					disabled: saving,
					onClick: save,
					children: saving ? "Saving… / 保存中…" : "Save / 保存"
				})]
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
		kind === "screening" && !role && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			"data-inspector-source": "pages/researcher/ResearcherApp.tsx:407:43:89415cec73f54a029750a1fb7707c43f18ede2ab1e25ca4e6d25a2c519aa5c09:1",
			className: "text-sm text-destructive",
			children: "Caregiver role cannot be determined from this record. / 此记录无法确定护理者角色。"
		}),
		saveError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			"data-inspector-source": "pages/researcher/ResearcherApp.tsx:408:23:2c09a3dfe1ed8f105248a89fb0ab216fbd448d6f7ea9e0957290ef3984294058:1",
			className: "mb-2 text-sm text-destructive",
			children: saveError
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
			"data-inspector-source": "pages/researcher/ResearcherApp.tsx:409:9:00beaaa579961463e5737f85306e1f4e14b7c70048376aef0f9f3bfab9bcb3ec:1",
			className: "space-y-2 text-sm",
			children: items.map((item) => {
				const source = kind === "screening" ? screeningSource(item, role) : null;
				const range = scaleRangeLabel(item);
				const title = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-inspector-source": "pages/researcher/ResearcherApp.tsx:415:17:786371260d227a012d941f0a079eac3d8263f764317c8d2799dc224213249473:1",
						className: "block",
						children: [item.label, source && ` / ${source.chineseLabel}`]
					}),
					range && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-source": "pages/researcher/ResearcherApp.tsx:416:27:c17b4c65677a8151f1c3892bb9cc3eab8ec08ac0a5ee975c775478d4ba2f3d47:1",
						className: "block text-xs font-medium leading-relaxed text-foreground",
						children: range
					}),
					source && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-inspector-source": "pages/researcher/ResearcherApp.tsx:418:19:94eba06f7bb667ba19c3a406c028724d0c22ca73b08cf4604ae4c15f1650241e:1",
						className: "mt-1 block text-xs leading-relaxed",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-source": "pages/researcher/ResearcherApp.tsx:419:21:ddb4f8c1587790e53cb97299b57f75b0d1ea438068cbacdbf936e71f78aa3274:1",
							className: "block",
							children: source.source
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-source": "pages/researcher/ResearcherApp.tsx:420:21:d69ca7c2eee2b162fc477670fd54f7a0ce4fb62fbcb57b0bce76cae600f120f5:1",
							className: "block",
							children: source.reference
						})]
					})
				] });
				if (editing) {
					const v = draft[item.column] ?? "";
					const set = (val) => setDraft((d) => ({
						...d,
						[item.column]: val
					}));
					let field;
					if (item.options && item.type === "multi") {
						const chosen = String(v).split(",").map((c) => c.trim()).filter(Boolean);
						field = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "pages/researcher/ResearcherApp.tsx:432:19:e21811d50eb590897d473a7c62dd50da57df9b508ced96e4356fb6bcc6ac008d:1",
							className: "flex flex-wrap gap-3",
							children: item.options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								"data-inspector-source": "pages/researcher/ResearcherApp.tsx:434:23:e54845cd6b23541b5c65df0d1a049f4465c43b628a499e73a1c644466a25bffb:1",
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									"data-inspector-source": "pages/researcher/ResearcherApp.tsx:435:25:f39bf8bc6ecd8b39d70d1a7b65b3e49924562f1e27f41dbc21d6b885b2e799c0:1",
									type: "checkbox",
									checked: chosen.includes(o.value),
									onChange: (e) => set((e.target.checked ? [...chosen, o.value] : chosen.filter((c) => c !== o.value)).join(","))
								}), o.label]
							}, o.value))
						});
					} else if (item.options) field = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						"data-inspector-source": "pages/researcher/ResearcherApp.tsx:443:19:b72ccaefeec3433878e0c425aac74301678fb8a90deb92aa491646e07bee03f4:1",
						className: "w-full rounded-md border border-input bg-background px-2 py-1",
						value: String(v),
						onChange: (e) => set(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							"data-inspector-source": "pages/researcher/ResearcherApp.tsx:444:21:33082e0669f1238cff4db45aafa31372de5c1724e38724e0454c9c3aaf0bd1e6:1",
							value: "",
							children: "—"
						}), item.options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							"data-inspector-source": "pages/researcher/ResearcherApp.tsx:445:46:a7cd12232b4da39c2afb3974939dec6600a2fe9fdb93090c782a1805330f2893:1",
							value: o.value,
							children: o.label
						}, o.value))]
					});
					else if (item.type === "longtext" || item.type === "text") field = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: String(v),
						onChange: (e) => set(e.target.value),
						rows: item.type === "longtext" ? 4 : 2
					});
					else field = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: String(v),
						onChange: (e) => set(e.target.value)
					});
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/researcher/ResearcherApp.tsx:454:17:8b81b95e8eb439227d0fca022254b1c64206aed65d403a5aed0fe282360c4879:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							"data-inspector-source": "pages/researcher/ResearcherApp.tsx:455:19:cf39d147fc4a1a13dcaa66fc242bd194ee9ea7c010bfb7c90c37cac780c08c56:1",
							className: "mb-1 text-muted-foreground",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							"data-inspector-source": "pages/researcher/ResearcherApp.tsx:456:19:e49e5ebc05ea0fc172ca7fb9afe0e9fd8a1c8e2c888ddfbc969eb5c106966f37:1",
							children: field
						})]
					}, item.id);
				}
				const v = row[item.column];
				if (v === void 0 || v === null || v === "") return null;
				if (String(row[kind === "daily" ? "a01" : "a07"] ?? "").startsWith("Reconstructed context-mapping note /") && item.scale && String(v) === "0") return null;
				if ((item.type === "number" || (item.scale ? item.scale.min > 0 : false)) && String(v) === "0") return null;
				if (/ (severity|caregiver distress)$/.test(item.label)) {
					const symptom = item.label.replace(/ (severity|caregiver distress)$/, "");
					const present = items.find((p) => p.label.startsWith(`${symptom} present:`));
					if (present && row[present.column] !== "b01") return null;
				}
				const shown = item.options ? String(v).split(",").map((c) => item.options.find((o) => o.value === c.trim())?.label ?? c).join(", ") : item.type === "datetime" || item.type === "date" ? studyTime(v, start) : String(v);
				const isFree = !item.options && (item.type === "text" || item.type === "longtext") && HAN.test(String(v));
				const tr = isFree ? translations[String(v)] : void 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/researcher/ResearcherApp.tsx:484:15:fae0f440e4e249704d2536b5f89e0d9f90a77367f4ce93eed4f4c875d75b9534:1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							"data-inspector-source": "pages/researcher/ResearcherApp.tsx:485:17:08e7ae6e22b2e61d47cf4a8ba7eefb02a54494d61cbeeba55eecf44de48a2ef5:1",
							className: "text-muted-foreground",
							children: title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							"data-inspector-source": "pages/researcher/ResearcherApp.tsx:486:17:75e0dd1e44a807006da920574f6c7b572f2e6fc9820f91c82e896c9dc1b92d2f:1",
							className: "text-foreground whitespace-pre-wrap",
							children: shown
						}),
						isFree && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
							"data-inspector-source": "pages/researcher/ResearcherApp.tsx:488:19:3e2c02cb29261b57e05fd12179b81d000bfde760b63e6cc8b5b54cea1d54f7b5:1",
							className: "mt-1 rounded-md bg-muted px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "pages/researcher/ResearcherApp.tsx:489:21:764915fd5e881c4ef98d5cc3be4a6a7ec6c33233f539ec28d7a2c019d3e58448:1",
								className: "block text-xs text-muted-foreground",
								children: "Auto translation: OpenAI GPT-5 nano (model ID: openai/gpt-5-nano); reasoning_effort = none (explicit); reasoning budget not set. Verified response on 2026-10-21: gpt-5-nano-2025-08-07, reasoning_tokens = 0. The alias is not snapshot-pinned; cached translations have no per-result model record. / 自动翻译：OpenAI GPT-5 nano（模型 ID：openai/gpt-5-nano）；推理强度 reasoning_effort = none（显式设置）；未设置推理预算。2026-10-21 已核实的返回版本：gpt-5-nano-2025-08-07，推理 token 为 0。模型别名未锁定日期版本；缓存译文未逐条记录模型。"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "pages/researcher/ResearcherApp.tsx:490:21:043170af34cadc603e0996061a3403ed2116d9775397233a6cbea479245efeb2:1",
								className: "whitespace-pre-wrap text-foreground",
								children: tr ?? (trError ? "Translation unavailable right now." : "Translating…")
							})]
						})
					]
				}, item.id);
			})
		})
	] })] });
}
//#endregion
export { AnswerCard, ResearcherApp as default };
