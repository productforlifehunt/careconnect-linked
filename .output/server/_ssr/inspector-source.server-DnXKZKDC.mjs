import "../_runtime.mjs";
import { i as readSource } from "./live-index-BLLbE6S2.mjs";
import { n as gatherSourceEvidence, r as matchesSourceRoute } from "./source-evidence-CU6qfiqX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inspector-source.server-DnXKZKDC.js
var ROUTES = /* #__PURE__ */ Object.assign({
	"/src/routes/$.tsx": () => import("../_-C2misPks.mjs").then((m) => m["default"]),
	"/src/routes/accompanied/$id.tsx": () => import("../_id-DgvLLoWq.mjs").then((m) => m["default"]),
	"/src/routes/accompanied/index.tsx": () => import("./accompanied-C40Kfiqw.mjs").then((m) => m["default"]),
	"/src/routes/ai-companion.tsx": () => import("./ai-companion-DrW8g0mm.mjs").then((m) => m["default"]),
	"/src/routes/ai.tsx": () => import("./ai-CAWm2sJJ.mjs").then((m) => m["default"]),
	"/src/routes/appointments.tsx": () => import("./appointments-37FYyWmZ.mjs").then((m) => m["default"]),
	"/src/routes/articles/$id.tsx": () => import("../_id-C4NtTG3Y.mjs").then((m) => m["default"]),
	"/src/routes/articles/index.tsx": () => import("./articles-C-C8D57j.mjs").then((m) => m["default"]),
	"/src/routes/assistant.tsx": () => import("./assistant-DNeBIHlF.mjs").then((m) => m["default"]),
	"/src/routes/auth.tsx": () => import("./auth-rz3pqF3E.mjs").then((m) => m["default"]),
	"/src/routes/awared/$id.tsx": () => import("../_id-YSaN6Rob.mjs").then((m) => m["default"]),
	"/src/routes/awared/index.tsx": () => import("./awared-NCwAEd45.mjs").then((m) => m["default"]),
	"/src/routes/become-caregiver.tsx": () => import("./become-caregiver-CkpLGkRN.mjs").then((m) => m["default"]),
	"/src/routes/bookings.tsx": () => import("./bookings-QNxoigRF.mjs").then((m) => m["default"]),
	"/src/routes/brand-compare.tsx": () => import("./brand-compare-Cn_Md-Rg.mjs").then((m) => m["default"]),
	"/src/routes/calendar.tsx": () => import("./calendar-XGp7Pp-A.mjs").then((m) => m["default"]),
	"/src/routes/care-circle.tsx": () => import("./care-circle-DEAPb6jM.mjs").then((m) => m["default"]),
	"/src/routes/care-circle_.$groupId.tsx": () => import("./care-circle_._groupId-36XDs3gt.mjs").then((m) => m["default"]),
	"/src/routes/cared/$id.tsx": () => import("../_id-BPiiMv4x.mjs").then((m) => m["default"]),
	"/src/routes/cared/index.tsx": () => import("./cared-C-olKKVx.mjs").then((m) => m["default"]),
	"/src/routes/cared-ones/$personId/$card.tsx": () => import("../_card-D7GxsJ5P.mjs").then((m) => m["default"]),
	"/src/routes/cared-ones/$personId/index.tsx": () => import("../_personId-BvZTdubd.mjs").then((m) => m["default"]),
	"/src/routes/cared-ones/index.tsx": () => import("./cared-ones-C2jWBcVw.mjs").then((m) => m["default"]),
	"/src/routes/caregiver/$id.tsx": () => import("../_id-Cz-2G8xF.mjs").then((m) => m["default"]),
	"/src/routes/caregiver-setting.tsx": () => import("./caregiver-setting-V9rWED5f.mjs").then((m) => m["default"]),
	"/src/routes/cart.tsx": () => import("./cart-BmoU1cGm.mjs").then((m) => m["default"]),
	"/src/routes/chat.tsx": () => import("./chat-BVptk7af.mjs").then((m) => m["default"]),
	"/src/routes/check-ins.tsx": () => import("./check-ins-6VJXu1Az.mjs").then((m) => m["default"]),
	"/src/routes/checkin.tsx": () => import("./checkin-BiVcyxLO.mjs").then((m) => m["default"]),
	"/src/routes/community/$id.tsx": () => import("../_id-CuwUnP9g.mjs").then((m) => m["default"]),
	"/src/routes/community/index.tsx": () => import("./community-CnavtSen.mjs").then((m) => m["default"]),
	"/src/routes/companion.tsx": () => import("./companion-DmMKkMa0.mjs").then((m) => m["default"]),
	"/src/routes/coped/$id.tsx": () => import("../_id-DXmAXUhh.mjs").then((m) => m["default"]),
	"/src/routes/coped/index.tsx": () => import("./coped-B-sLP47E.mjs").then((m) => m["default"]),
	"/src/routes/dashboard.tsx": () => import("./dashboard-DCaA7UNj.mjs").then((m) => m["default"]),
	"/src/routes/delete-after-read.tsx": () => import("./delete-after-read-Dc2j9FBo.mjs").then((m) => m["default"]),
	"/src/routes/documents.tsx": () => import("./documents-hksL6dEs.mjs").then((m) => m["default"]),
	"/src/routes/facilities/$id/edit.tsx": () => import("./edit-OYy_8M9q.mjs").then((m) => m["default"]),
	"/src/routes/facilities/new.tsx": () => import("./new-BfU1AZWG.mjs").then((m) => m["default"]),
	"/src/routes/facility/$id.tsx": () => import("../_id-CtqginFI.mjs").then((m) => m["default"]),
	"/src/routes/favorite-caregiver.tsx": () => import("./favorite-caregiver-DbbgXmqQ.mjs").then((m) => m["default"]),
	"/src/routes/find.tsx": () => import("./find-B5RWSvrp.mjs").then((m) => m["default"]),
	"/src/routes/get-started.tsx": () => import("./get-started-CcLkmMt_.mjs").then((m) => m["default"]),
	"/src/routes/group/$groupId.tsx": () => import("../_groupId-DRDvplao.mjs").then((m) => m["default"]),
	"/src/routes/help.tsx": () => import("./help-D6i1z6RT.mjs").then((m) => m["default"]),
	"/src/routes/how-it-works.tsx": () => import("./how-it-works-TuUo7-5R.mjs").then((m) => m["default"]),
	"/src/routes/inbox.tsx": () => import("./inbox-B4TW6FCJ.mjs").then((m) => m["default"]),
	"/src/routes/index.tsx": () => import("./routes-QfOm3G2N.mjs").then((m) => m["default"]),
	"/src/routes/join/$code.tsx": () => import("../_code-96-J3fuP.mjs").then((m) => m["default"]),
	"/src/routes/learn.tsx": () => import("./learn-c0Xf7hva.mjs").then((m) => m["default"]),
	"/src/routes/medicine.tsx": () => import("./medicine-B32993hb.mjs").then((m) => m["default"]),
	"/src/routes/messages.tsx": () => import("./messages-C1jc253j.mjs").then((m) => m["default"]),
	"/src/routes/notifications.tsx": () => import("./notifications-CUzCtJny.mjs").then((m) => m["default"]),
	"/src/routes/onboarding.tsx": () => import("./onboarding-m7EDmr6i.mjs").then((m) => m["default"]),
	"/src/routes/order-confirmation.tsx": () => import("./order-confirmation-Bu79cLpd.mjs").then((m) => m["default"]),
	"/src/routes/places.tsx": () => import("./places-DlZMgCvr.mjs").then((m) => m["default"]),
	"/src/routes/profile.tsx": () => import("./profile-USZa4THl.mjs").then((m) => m["default"]),
	"/src/routes/reset-password.tsx": () => import("./reset-password-DsSfGfVR.mjs").then((m) => m["default"]),
	"/src/routes/resources.tsx": () => import("./resources-TNBTsCso.mjs").then((m) => m["default"]),
	"/src/routes/safed/$id.tsx": () => import("../_id-DRyOg1su.mjs").then((m) => m["default"]),
	"/src/routes/safed/index.tsx": () => import("./safed-BrulMAdH.mjs").then((m) => m["default"]),
	"/src/routes/search-care-facility.tsx": () => import("./search-care-facility-BPK7A4MX.mjs").then((m) => m["default"]),
	"/src/routes/search-caregiver.tsx": () => import("./search-caregiver-HN1_gvfH.mjs").then((m) => m["default"]),
	"/src/routes/search-local-caregiver.tsx": () => import("./search-local-caregiver-CkNJEX6h.mjs").then((m) => m["default"]),
	"/src/routes/search-remote-caregiver.tsx": () => import("./search-remote-caregiver-DrOZTQs6.mjs").then((m) => m["default"]),
	"/src/routes/search.tsx": () => import("./search-BqotzKOQ.mjs").then((m) => m["default"]),
	"/src/routes/settings.tsx": () => import("./settings-nkVBq9-2.mjs").then((m) => m["default"]),
	"/src/routes/share/card/$token.tsx": () => import("../_token-CN46iLYc.mjs").then((m) => m["default"]),
	"/src/routes/share/note.tsx": () => import("./note-DkEPHJIN.mjs").then((m) => m["default"]),
	"/src/routes/sync-test-draftbit.tsx": () => import("./sync-test-draftbit-B-wCeDIf.mjs").then((m) => m["default"]),
	"/src/routes/tasks.tsx": () => import("./tasks-DG0msbf_.mjs").then((m) => m["default"]),
	"/src/routes/trust-safety.tsx": () => import("./trust-safety-U-9F-YEe.mjs").then((m) => m["default"]),
	"/src/routes/welcome.tsx": () => import("./welcome-DJzr3I0f.mjs").then((m) => m["default"]),
	"/src/routes/xianyu-listings.tsx": () => import("./xianyu-listings-Cn6pigE4.mjs").then((m) => m["default"])
});
var APPS = /* #__PURE__ */ Object.assign({
	"/src/pages/consent/ConsentApp.tsx": () => import("./ConsentApp-Cb3qrzxE.mjs").then((m) => m["default"]),
	"/src/pages/esm/EsmApp.tsx": () => import("./EsmApp-BsvtH12d.mjs").then((m) => m["default"]),
	"/src/pages/researcher/ResearcherApp.tsx": () => import("./ResearcherApp-D_t5xhgl.mjs").then((m) => m["default"]),
	"/src/pages/safety/SafetyApp.tsx": () => import("./SafetyApp-DK_KSYOk.mjs").then((m) => m["default"]),
	"/src/pages/sick/SickApp.tsx": () => import("./SickApp-dElIkLUz.mjs").then((m) => m["default"])
});
/** Authenticated callers resolve the deployment's own source, never trust a client code summary. */
async function readInspectionSource(selection) {
	const site = new URLSearchParams(selection.page.split("?")[1] || "").get("__site");
	const roots = [];
	if (site) {
		for (const [file, load] of Object.entries(APPS)) if (((await load()).match(/__site[=",\s]+([a-z_]+)/)?.[1] || (file.includes("/safety/") ? "notchsafety" : file.includes("/esm/") ? "esm_survey" : file.split("/")[3])) === site) roots.push(file.replace("/src/", ""));
	}
	if (!roots.length) {
		const found = (await Promise.all(Object.entries(ROUTES).map(async ([file]) => {
			const relative = file.replace("/src/", "");
			const pattern = (await readSource(relative))?.match(/createFileRoute\(["']([^"']+)["']\)/)?.[1];
			return pattern && matchesSourceRoute(pattern, selection.page) ? {
				file: relative,
				pattern
			} : null;
		}))).filter((match) => match !== null);
		found.sort((a, b) => (a.pattern.match(/[$:]/g)?.length || 0) - (b.pattern.match(/[$:]/g)?.length || 0));
		if (found[0]) roots.push(found[0].file);
	}
	const evidence = await gatherSourceEvidence(roots, readSource);
	if (!roots.length) evidence.omissions.unshift(`无法确定 ${selection.page} 的实际页面代码；不能仅分析笔记。`);
	return evidence;
}
//#endregion
export { readInspectionSource };
