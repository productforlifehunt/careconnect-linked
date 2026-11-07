import "../_runtime.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch, n as isNetworkAbort } from "./wordpress-client-b834cpZh.mjs";
import { n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
import { t as appScopeBody } from "./app-scope-Cq6C10CZ.mjs";
import { n as detectSite } from "./SiteContext-Br0kF93Q.mjs";
import { t as supabase } from "./client-Bxio8ppI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-CfmTn5iV.js
/**
* SINGLE FRONTEND AI MODULE — every AI call from the app goes through this file.
* Part 1: invokeAI / conversation memory (non-streaming; no modes anywhere).
* Part 2: streaming voice pipeline (SSE text + sentence-level TTS playback).
* Backend: the single `ai` edge function, routed by task only:
*   ?task=chat-chat (text→text, SSE; stream:false for one-shot JSON)
*   ?task=chat-voice (text→audio)
* Persona: supabase/functions/_shared/ai-prompts.ts (single registry).
*/
var CONVERSATION_SLUG = T.chatConversation.slug;
var CF = T.chatConversation.f;
var CT = T.chatConversation.opt.CHAT_TYPE;
var MESSAGE_SLUG = T.chatMessage.slug;
var MF = T.chatMessage.f;
var MT = T.chatMessage.opt.CHAT_MESSAGE_TYPE;
var REL_CONV_MESSAGE = R.conversationMessages;
function nowWPDateTime() {
	return (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
}
function conversationStorageKey(threadKey, caredOneId) {
	return `ai_conversation:${threadKey || "chat"}:${caredOneId ?? "none"}`;
}
var stripWp = (id) => id == null ? "" : String(id).replace(/^wp-/, "");
var numId = (id) => Number(stripWp(id));
async function ensureConversation(threadKey, options = {}) {
	const cachedId = options.conversationId || localStorage.getItem(conversationStorageKey(threadKey, options.caredOneId));
	if (cachedId) try {
		const existing = await wordpressCCTFetch(CONVERSATION_SLUG, { id: cachedId });
		const id = existing?.["id"] || existing?.["_ID"];
		if (id) {
			localStorage.setItem(conversationStorageKey(threadKey, options.caredOneId), String(id));
			return String(id);
		}
	} catch {}
	const result = await wordpressCCTFetch(CONVERSATION_SLUG, {
		method: "POST",
		body: {
			[CF.CHAT_TYPE]: CT.AI,
			[CF.CHAT_NAME]: options.title || "",
			[CF.LAST_MESSAGE_AT]: nowWPDateTime(),
			...appScopeBody("chatConversation")
		}
	});
	const createdId = String(result?.item_id || result?._ID || result?.id);
	if (createdId) localStorage.setItem(conversationStorageKey(threadKey, options.caredOneId), createdId);
	return createdId;
}
async function createMessage(conversationId, role, content) {
	const result = await wordpressCCTFetch(MESSAGE_SLUG, {
		method: "POST",
		body: {
			[MF.CHAT_MESSAGE_CONTENT]: content,
			[MF.CHAT_MESSAGE_TYPE]: role === "assistant" ? MT.AI : MT.TEXT
		}
	});
	const messageId = numId(result?.item_id || result?._ID || result?.id);
	const convoId = numId(conversationId);
	if (messageId && convoId) try {
		await wordpressFetch(`jet-rel/${REL_CONV_MESSAGE}`, {
			method: "POST",
			body: {
				parent_id: convoId,
				child_id: messageId,
				context: "child",
				store_items_type: "update"
			}
		});
	} catch {}
}
async function touchConversation(conversationId) {
	try {
		await wordpressCCTFetch(CONVERSATION_SLUG, {
			id: conversationId,
			method: "PUT",
			body: { [CF.LAST_MESSAGE_AT]: nowWPDateTime() }
		});
	} catch {}
}
/** Call the single `ai` edge function (Lovable AI Gateway) */
async function callAI(messages, contextPrompt, language) {
	const { data, error } = await supabase.functions.invoke("ai?task=chat-chat", { body: {
		messages,
		stream: false,
		site: detectSite(),
		...contextPrompt ? { contextPrompt } : {},
		...language ? { language } : {}
	} });
	if (error) {
		console.error("AI edge function error:", error);
		throw new Error(error.message || "AI service unavailable");
	}
	if (data?.error) throw new Error(data.error);
	return data?.reply || "";
}
var SkipPersistence = class extends Error {};
async function invokeAI(request, options = {}) {
	const userMessages = options.messages && options.messages.length > 0 ? options.messages.filter((m) => m.role !== "system") : [{
		role: "user",
		content: request
	}];
	const userMessage = userMessages.filter((m) => m.role === "user").at(-1)?.content || request;
	let conversationId = null;
	const shouldPersist = options.persist === true;
	try {
		if (!shouldPersist) throw new SkipPersistence();
		conversationId = await ensureConversation(options.threadKey || "chat", options);
		await createMessage(conversationId, "user", userMessage);
	} catch (e) {
		if (e instanceof SkipPersistence) conversationId = null;
		else if (isNetworkAbort(e)) console.debug("Chat CCT persistence skipped (request aborted)");
		else console.warn("Chat CCT persistence unavailable, continuing without:", e);
	}
	const reply = await callAI(userMessages, options.contextPrompt, options.language);
	if (conversationId) try {
		await createMessage(conversationId, "assistant", reply);
		await touchConversation(conversationId);
	} catch {}
	return reply;
}
/** Parse JSON from AI reply, stripping markdown fences if present */
function parseAIJson(reply) {
	try {
		let cleaned = reply.trim();
		if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
		return JSON.parse(cleaned);
	} catch {
		return null;
	}
}
var STREAM_URL = `${{
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
}["VITE_SUPABASE_URL"]}/functions/v1/ai?task=chat-chat`;
/** Sentence terminators we recognise (CJK + Latin). */
var SENTENCE_RE = /([。！？!?.;；]+["'”’)\\]）】]?)\s*/;
/** Minimum chars before we ship a fragment without seeing a terminator. */
var MIN_FRAGMENT_LEN = 80;
/** 1-frame silent wav — played during the click so Safari/iOS unlock playback. */
var SILENT_WAV = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
var AudioQueue = class {
	queue = [];
	playing = false;
	paused = false;
	nextExpectedIndex = 0;
	/**
	* ONE element for the whole queue. Browsers only allow playback on an element
	* that was started inside a user gesture, and our audio arrives later (after
	* the TTS request), so we create and unlock this element synchronously on the
	* click and then just swap its `src` per chunk.
	*/
	audio = null;
	aborted = false;
	onStart;
	onEnd;
	onPlayStateChange;
	startedOnce = false;
	finished = false;
	streamDone = false;
	constructor(opts) {
		this.onStart = opts.onStart;
		this.onEnd = opts.onEnd;
		this.onPlayStateChange = opts.onPlayStateChange;
	}
	/**
	* Must be called synchronously inside the user's click: creates the element
	* and starts a silent frame so later `src` swaps are allowed to play.
	*/
	unlock() {
		if (this.audio || typeof Audio === "undefined") return;
		const el = new Audio(SILENT_WAV);
		el.preload = "auto";
		this.audio = el;
		el.play().catch(() => {});
	}
	abort() {
		this.aborted = true;
		if (this.audio) {
			try {
				this.audio.pause();
			} catch {}
			this.audio.onended = null;
			this.audio.onerror = null;
		}
		for (const item of this.queue) try {
			if (item.url) URL.revokeObjectURL(item.url);
		} catch {}
		this.queue = [];
		this.playing = false;
		this.paused = false;
		this.onPlayStateChange?.("stopped");
	}
	pause() {
		if (!this.playing || this.paused || !this.audio) return;
		this.paused = true;
		try {
			this.audio.pause();
		} catch {}
		this.onPlayStateChange?.("paused");
	}
	resume() {
		if (!this.paused) return;
		this.paused = false;
		if (this.audio) {
			this.audio.play().catch(() => {});
			this.onPlayStateChange?.("playing");
		} else this.tryPlayNext();
	}
	isPaused() {
		return this.paused;
	}
	/** Mark that no more sentences will arrive — used to decide when to fire onEnd. */
	markStreamDone() {
		this.streamDone = true;
		this.maybeFinish();
	}
	push(item) {
		if (this.aborted) {
			try {
				if (item.url) URL.revokeObjectURL(item.url);
			} catch {}
			return;
		}
		this.queue.push(item);
		this.queue.sort((a, b) => a.index - b.index);
		this.tryPlayNext();
	}
	tryPlayNext() {
		if (this.playing || this.aborted || this.paused) return;
		const next = this.queue[0];
		if (!next || next.index !== this.nextExpectedIndex) {
			this.maybeFinish();
			return;
		}
		this.queue.shift();
		this.nextExpectedIndex += 1;
		if (!next.url) {
			this.tryPlayNext();
			return;
		}
		this.playing = true;
		if (!this.audio) this.audio = new Audio();
		const audio = this.audio;
		if (!this.startedOnce) {
			this.startedOnce = true;
			this.onStart?.();
		}
		this.onPlayStateChange?.("playing");
		const advance = () => {
			try {
				URL.revokeObjectURL(next.url);
			} catch {}
			audio.onended = null;
			audio.onerror = null;
			this.playing = false;
			this.tryPlayNext();
		};
		audio.onended = advance;
		audio.onerror = () => {
			console.error("Audio playback error in queue");
			advance();
		};
		audio.src = next.url;
		audio.play().catch((err) => {
			console.error("audio.play() failed:", err);
			advance();
		});
	}
	maybeFinish() {
		if (!this.finished && this.streamDone && !this.playing && this.queue.length === 0) {
			this.finished = true;
			this.onPlayStateChange?.("idle");
			this.onEnd?.();
		}
	}
};
async function fetchTTSBlobURL(text, voice, engine = "siliconflow") {
	const trimmed = text.trim();
	if (!trimmed) return null;
	try {
		const { data, error } = await supabase.functions.invoke("ai?task=chat-voice", { body: {
			text: trimmed,
			voice,
			format: "mp3",
			engine,
			site: detectSite()
		} });
		if (error || data?.error || !data?.audio) {
			console.error("TTS chunk failed:", error || data?.error);
			return null;
		}
		const binary = atob(data.audio);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
		const mime = data.format === "wav" ? "audio/wav" : "audio/mpeg";
		return URL.createObjectURL(new Blob([bytes], { type: mime }));
	} catch (err) {
		console.error("TTS chunk error:", err);
		return null;
	}
}
/**
* Stream a chat reply, emitting text deltas immediately and dispatching
* each completed sentence to TTS in parallel.
*
* Returns { controls, result }:
*   - controls: pause/resume/stop the audio playback (text streaming itself
*     is not pausable — only the audio queue).
*   - result: Promise resolving to the final full text once the SSE stream
*     ends (independent of whether audio finished playing).
*/
function streamChatWithVoice(messages, voice, handlers) {
	const audioQueue = new AudioQueue({
		onStart: handlers.onAudioStart,
		onEnd: handlers.onAllAudioEnd,
		onPlayStateChange: handlers.onPlayStateChange
	});
	audioQueue.unlock();
	if (handlers.signal) handlers.signal.addEventListener("abort", () => audioQueue.abort(), { once: true });
	return {
		controls: {
			pause: () => audioQueue.pause(),
			resume: () => audioQueue.resume(),
			stop: () => audioQueue.abort(),
			isPaused: () => audioQueue.isPaused()
		},
		result: (async () => {
			const resp = await fetch(STREAM_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
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
					}["VITE_SUPABASE_PUBLISHABLE_KEY"]}`
				},
				body: JSON.stringify({
					messages,
					site: detectSite(),
					language: handlers.language,
					contextPrompt: handlers.contextPrompt
				}),
				signal: handlers.signal ?? null
			});
			if (!resp.ok || !resp.body) {
				const errText = await resp.text().catch(() => "");
				audioQueue.abort();
				const err = /* @__PURE__ */ new Error(`Stream failed [${resp.status}]: ${errText.slice(0, 200)}`);
				handlers.onError?.(err);
				throw err;
			}
			if (!resp.ok || !resp.body) {
				const errText = await resp.text().catch(() => "");
				audioQueue.abort();
				const err = /* @__PURE__ */ new Error(`Stream failed [${resp.status}]: ${errText.slice(0, 200)}`);
				handlers.onError?.(err);
				throw err;
			}
			const reader = resp.body.getReader();
			const decoder = new TextDecoder();
			let textBuffer = "";
			let pending = "";
			let fullText = "";
			let chunkIndex = 0;
			const ttsPromises = [];
			const dispatchSentence = (sentence) => {
				const idx = chunkIndex++;
				handlers.onSentence?.(sentence);
				const p = fetchTTSBlobURL(sentence, voice, handlers.engine ?? "siliconflow").then((url) => {
					audioQueue.push({
						url: url || "",
						index: idx
					});
				});
				ttsPromises.push(p);
			};
			const flushSentencesFromPending = (force = false) => {
				while (true) {
					const match = pending.match(SENTENCE_RE);
					if (match && match.index !== void 0) {
						const end = match.index + match[0].length;
						const sentence = pending.slice(0, end).trim();
						pending = pending.slice(end);
						if (sentence) dispatchSentence(sentence);
						continue;
					}
					if (!force && pending.length >= MIN_FRAGMENT_LEN) {
						const breakRe = /[，,、 ]/g;
						let lastBreak = -1;
						let m;
						while ((m = breakRe.exec(pending)) !== null) if (m.index >= 30) lastBreak = m.index + 1;
						if (lastBreak > 0) {
							const fragment = pending.slice(0, lastBreak).trim();
							pending = pending.slice(lastBreak);
							if (fragment) dispatchSentence(fragment);
							continue;
						}
					}
					if (force && pending.trim()) {
						dispatchSentence(pending.trim());
						pending = "";
					}
					return;
				}
			};
			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					textBuffer += decoder.decode(value, { stream: true });
					let nl;
					while ((nl = textBuffer.indexOf("\n")) !== -1) {
						let line = textBuffer.slice(0, nl);
						textBuffer = textBuffer.slice(nl + 1);
						if (line.endsWith("\r")) line = line.slice(0, -1);
						if (!line || line.startsWith(":")) continue;
						if (!line.startsWith("data: ")) continue;
						const payload = line.slice(6).trim();
						if (payload === "[DONE]") {
							textBuffer = "";
							break;
						}
						try {
							const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
							if (delta) {
								fullText += delta;
								pending += delta;
								handlers.onTextDelta(delta, fullText);
								flushSentencesFromPending(false);
							}
						} catch {
							textBuffer = line + "\n" + textBuffer;
							break;
						}
					}
				}
				flushSentencesFromPending(true);
				await Promise.all(ttsPromises);
				audioQueue.markStreamDone();
				return fullText;
			} catch (err) {
				audioQueue.abort();
				const e = err instanceof Error ? err : new Error(String(err));
				handlers.onError?.(e);
				throw e;
			}
		})()
	};
}
/**
* Play arbitrary text through the same sentence-level pipeline (no LLM call).
* Used by the "Listen" button on a finished text-only reply.
*/
function speakTextStreaming(text, voice, handlers) {
	const audioQueue = new AudioQueue({
		onStart: handlers.onAudioStart,
		onEnd: handlers.onAllAudioEnd,
		onPlayStateChange: handlers.onPlayStateChange
	});
	audioQueue.unlock();
	if (handlers.signal) handlers.signal.addEventListener("abort", () => audioQueue.abort(), { once: true });
	const sentences = [];
	let pending = text;
	while (true) {
		const match = pending.match(SENTENCE_RE);
		if (match && match.index !== void 0) {
			const end = match.index + match[0].length;
			const s = pending.slice(0, end).trim();
			pending = pending.slice(end);
			if (s) sentences.push(s);
			continue;
		}
		if (pending.trim()) sentences.push(pending.trim());
		break;
	}
	const ttsPromises = sentences.map((s, idx) => {
		handlers.onSentence?.(s);
		return fetchTTSBlobURL(s, voice, handlers.engine ?? "siliconflow").then((url) => {
			audioQueue.push({
				url: url || "",
				index: idx
			});
		});
	});
	if (sentences.length === 0) audioQueue.markStreamDone();
	else Promise.all(ttsPromises).then(() => audioQueue.markStreamDone());
	return {
		pause: () => audioQueue.pause(),
		resume: () => audioQueue.resume(),
		stop: () => audioQueue.abort(),
		isPaused: () => audioQueue.isPaused()
	};
}
/**
* Pure text streaming — same SSE pipeline as voice mode, but NO TTS.
* Tokens arrive in real time so the UI bubble updates word-by-word.
* Returns an AbortController so the caller can cancel mid-stream.
*/
function streamChatTextOnly(messages, handlers) {
	const controller = new AbortController();
	const signal = handlers.signal ? mergeSignals(handlers.signal, controller.signal) : controller.signal;
	return {
		abort: () => controller.abort(),
		result: (async () => {
			const resp = await fetch(STREAM_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
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
					}["VITE_SUPABASE_PUBLISHABLE_KEY"]}`
				},
				body: JSON.stringify({
					messages,
					site: detectSite(),
					language: handlers.language,
					contextPrompt: handlers.contextPrompt
				}),
				signal
			});
			if (!resp.ok || !resp.body) {
				const errText = await resp.text().catch(() => "");
				const err = /* @__PURE__ */ new Error(`Stream failed [${resp.status}]: ${errText.slice(0, 200)}`);
				handlers.onError?.(err);
				throw err;
			}
			const reader = resp.body.getReader();
			const decoder = new TextDecoder();
			let textBuffer = "";
			let fullText = "";
			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					textBuffer += decoder.decode(value, { stream: true });
					let nl;
					while ((nl = textBuffer.indexOf("\n")) !== -1) {
						let line = textBuffer.slice(0, nl);
						textBuffer = textBuffer.slice(nl + 1);
						if (line.endsWith("\r")) line = line.slice(0, -1);
						if (!line || line.startsWith(":")) continue;
						if (!line.startsWith("data: ")) continue;
						const payload = line.slice(6).trim();
						if (payload === "[DONE]") {
							textBuffer = "";
							break;
						}
						try {
							const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
							if (delta) {
								fullText += delta;
								handlers.onTextDelta(delta, fullText);
							}
						} catch {
							textBuffer = line + "\n" + textBuffer;
							break;
						}
					}
				}
				handlers.onDone?.(fullText);
				return fullText;
			} catch (err) {
				const e = err instanceof Error ? err : new Error(String(err));
				handlers.onError?.(e);
				throw e;
			}
		})()
	};
}
function mergeSignals(a, b) {
	if (a.aborted) return a;
	if (b.aborted) return b;
	const ctrl = new AbortController();
	const onAbort = () => ctrl.abort();
	a.addEventListener("abort", onAbort, { once: true });
	b.addEventListener("abort", onAbort, { once: true });
	return ctrl.signal;
}
var AI_MEMORY_CHAR_LIMIT = 1e4;
/**
* Keep the newest messages whose total character count is within the limit.
* Drops oldest messages first. Always keeps at least the last message so a
* single long user prompt can still be sent.
*
* The count includes BOTH user messages and assistant replies — the model
* sees the full conversation, not just what the user typed.
*/
function trimMessagesToCharLimit(messages, limit = AI_MEMORY_CHAR_LIMIT) {
	if (!messages.length) return [];
	const chars = messages.map((m) => m.content?.length ?? 0);
	let total = chars.reduce((a, b) => a + b, 0);
	let start = 0;
	while (total > limit && start < messages.length - 1) {
		total -= chars[start] ?? 0;
		start++;
	}
	return messages.slice(start);
}
/**
* Records the microphone as PCM and encodes a complete 16 kHz mono WAV, then
* transcribes it through the same `ai` edge function (?task=voice-chat).
* WAV avoids MediaRecorder's headerless fragments and iOS Safari's mp4.
*/
function encodeWav(chunks, sampleRate, targetRate = 16e3) {
	const total = chunks.reduce((n, c) => n + c.length, 0);
	const merged = new Float32Array(total);
	let offset = 0;
	for (const c of chunks) {
		merged.set(c, offset);
		offset += c.length;
	}
	const ratio = sampleRate / targetRate;
	const outLength = ratio > 1 ? Math.floor(merged.length / ratio) : merged.length;
	const samples = new Int16Array(outLength);
	for (let i = 0; i < outLength; i++) {
		const v = merged[ratio > 1 ? Math.floor(i * ratio) : i] ?? 0;
		const clamped = Math.max(-1, Math.min(1, v));
		samples[i] = clamped < 0 ? clamped * 32768 : clamped * 32767;
	}
	const rate = ratio > 1 ? targetRate : sampleRate;
	const buffer = /* @__PURE__ */ new ArrayBuffer(44 + samples.length * 2);
	const view = new DataView(buffer);
	const writeStr = (pos, s) => {
		for (let i = 0; i < s.length; i++) view.setUint8(pos + i, s.charCodeAt(i));
	};
	writeStr(0, "RIFF");
	view.setUint32(4, 36 + samples.length * 2, true);
	writeStr(8, "WAVEfmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 1, true);
	view.setUint32(24, rate, true);
	view.setUint32(28, rate * 2, true);
	view.setUint16(32, 2, true);
	view.setUint16(34, 16, true);
	writeStr(36, "data");
	view.setUint32(40, samples.length * 2, true);
	new Int16Array(buffer, 44).set(samples);
	return new Blob([buffer], { type: "audio/wav" });
}
var VoiceRecorder = class {
	raw;
	stream = null;
	ctx = null;
	node = null;
	source = null;
	chunks = [];
	/** raw=true turns off echo cancellation/noise suppression/auto gain (needed for voice cloning, e.g. recording audio played from the same device). */
	constructor(raw = false) {
		this.raw = raw;
	}
	async start() {
		this.stream = await navigator.mediaDevices.getUserMedia({ audio: this.raw ? {
			echoCancellation: false,
			noiseSuppression: false,
			autoGainControl: false
		} : true });
		const Ctor = window.AudioContext || window.webkitAudioContext;
		this.ctx = new Ctor();
		this.chunks = [];
		this.source = this.ctx.createMediaStreamSource(this.stream);
		this.node = this.ctx.createScriptProcessor(4096, 1, 1);
		this.node.onaudioprocess = (e) => this.chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
		this.source.connect(this.node);
		this.node.connect(this.ctx.destination);
	}
	/** Stops recording and returns a complete WAV blob (null when nothing usable). */
	async stop() {
		try {
			this.stream?.getTracks().forEach((t) => t.stop());
		} catch {}
		try {
			this.node?.disconnect();
			this.source?.disconnect();
		} catch {}
		const rate = this.ctx?.sampleRate || 44100;
		const chunks = this.chunks;
		this.chunks = [];
		try {
			await this.ctx?.close();
		} catch {}
		this.ctx = null;
		this.node = null;
		this.source = null;
		this.stream = null;
		if (!chunks.length) return null;
		const blob = encodeWav(chunks, rate);
		return blob.size < 2048 ? null : blob;
	}
	cancel() {
		this.stop();
	}
};
/** Send a recorded clip to the shared `ai` function and get the text back. */
async function transcribeAudio(blob, language) {
	const buf = new Uint8Array(await blob.arrayBuffer());
	let binary = "";
	for (let i = 0; i < buf.length; i += 32768) binary += String.fromCharCode.apply(null, Array.from(buf.subarray(i, i + 32768)));
	const { data, error } = await supabase.functions.invoke("ai?task=voice-chat", { body: {
		audio: btoa(binary),
		mime: blob.type || "audio/wav",
		language
	} });
	if (error || data?.error) throw new Error(String(error?.message || data?.error || "transcription failed"));
	return String(data?.text || "").trim();
}
//#endregion
export { streamChatTextOnly as a, trimMessagesToCharLimit as c, speakTextStreaming as i, invokeAI as n, streamChatWithVoice as o, parseAIJson as r, transcribeAudio as s, VoiceRecorder as t };
