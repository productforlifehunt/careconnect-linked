import "../_runtime.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as bytesToBase64 } from "./provider.server-CerZpRIt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/audio.server-CY2mmHLG.js
var BUCKET = "family-voice-audio";
function privateAudio(url, key) {
	if (!url || !key) throw new Error("Private voice audio storage is not configured");
	const client = createClient(url, key, {
		auth: {
			persistSession: false,
			autoRefreshToken: false
		},
		global: { fetch: (input, init) => {
			const headers = new Headers(init?.headers);
			if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
			headers.set("apikey", key);
			return fetch(input, {
				...init,
				headers
			});
		} }
	});
	return {
		async save(path, base64, mime) {
			const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
			const { error } = await client.storage.from(BUCKET).upload(path, bytes, {
				contentType: mime,
				upsert: false
			});
			if (error) throw new Error("Original recording was not saved. / 原始录音未能保存。");
		},
		async read(path) {
			if (!path || !path.startsWith("recordings/")) throw new Error("No original recording / 没有原始录音");
			const { data, error } = await client.storage.from(BUCKET).download(path);
			if (error || !data) throw new Error("Original recording could not be read");
			return bytesToBase64(new Uint8Array(await data.arrayBuffer()));
		},
		async remove(path) {
			if (!path) return;
			const { error } = await client.storage.from(BUCKET).remove([path]);
			if (error) throw new Error("Recording was not deleted");
		}
	};
}
//#endregion
export { privateAudio };
