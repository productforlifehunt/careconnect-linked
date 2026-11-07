import "../_runtime.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/corrections-8s7iIkbf.js
function noteRole(title, fallback) {
	return /功能逻辑|数据逻辑/.test(title) ? "functional_note" : fallback;
}
/** Only server-read current page/element notes (never related notes, which are the trusted baseline) may become save targets. */
function attachCorrectionNotes(report, notes) {
	const records = /* @__PURE__ */ new Map();
	for (const note of notes) {
		const prev = records.get(note.id);
		const isCurrent = !!(note.current || prev?.current);
		if (!prev || prev.role === "related_note" || note.role === "functional_note") records.set(note.id, {
			...note,
			current: isCurrent
		});
		else records.set(note.id, {
			...prev,
			current: isCurrent
		});
	}
	const trusted = [...records.values()];
	return {
		...report,
		notes: trusted,
		findings: report.findings.map((finding) => ({
			...finding,
			suggestions: (finding.suggestions || []).filter((suggestion) => {
				if (suggestion.target === "code") return suggestion.noteId === null;
				const note = trusted.find((note) => note.id === suggestion.noteId);
				return !!note && !!note.current && note.role === suggestion.target;
			})
		}))
	};
}
function assertUnchangedNote(current, expected) {
	if (current.title !== expected.title || current.text !== expected.text || current.verified !== expected.verified) throw new Error("这条笔记在分析后已改变，未保存。请重新读取并分析，避免覆盖新修改。");
}
//#endregion
export { assertUnchangedNote, attachCorrectionNotes, noteRole };
