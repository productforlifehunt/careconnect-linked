import "./_runtime.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-Cq0p9aKs.js
var manifest = {
	"1e7513ea11ab0f03772e681b4f51a6657b641e09ec7fbf3ebbcf9bab04236011": {
		functionName: "explainReadWrite_createServerFn_handler",
		importer: () => import("./_ssr/inspector-ai.functions-C1lp8pdq.mjs")
	},
	"2ee085be7ed96707ef92a5fc66dd70944c88e13f4f05f4088bcb3efce17ee805": {
		functionName: "updateRelatedNote_createServerFn_handler",
		importer: () => import("./_ssr/inspector-notes.functions-D2rTkRAZ.mjs")
	},
	"365dfa0e02c1ec2266223abc440777ff8542bba00a3a9377675879bb85ef1d35": {
		functionName: "listRelatedNotes_createServerFn_handler",
		importer: () => import("./_ssr/inspector-notes.functions-D2rTkRAZ.mjs")
	},
	"43690a4d3d9aa2699c75ba38700c15cd6046e109e43a5a2683337aac4f01af13": {
		functionName: "loadInspectorNotes_createServerFn_handler",
		importer: () => import("./_ssr/inspector-notes.functions-D2rTkRAZ.mjs")
	},
	"4b95470b37060ed8a3242601bbc3e284db14472436be2cc47d75bd58c365fb26": {
		functionName: "linkRelatedNote_createServerFn_handler",
		importer: () => import("./_ssr/inspector-notes.functions-D2rTkRAZ.mjs")
	},
	"67e128ad68c960486299e70e46113a230090e687e571d0b30dcf28d7dc5f7de9": {
		functionName: "getInterviewOverview_createServerFn_handler",
		importer: () => import("./_ssr/interview-overview.functions-DOBuES9q.mjs")
	},
	"6f7891540b48800a8ccd2ff7ea8f642add416c7c64a217d55e8937106d706e41": {
		functionName: "unlinkRelatedNote_createServerFn_handler",
		importer: () => import("./_ssr/inspector-notes.functions-D2rTkRAZ.mjs")
	},
	"7955a7df5aef9c063bb7cccf15e6a4567156df200fc56b9178be64857c5b0ba0": {
		functionName: "selectInspectorNote_createServerFn_handler",
		importer: () => import("./_ssr/inspector-notes.functions-D2rTkRAZ.mjs")
	},
	"7a2c7294467f56a028fcf0ff17c2ac4ab9fd538f70a58128b77796a6961e6e9d": {
		functionName: "loadAllInspectorNotes_createServerFn_handler",
		importer: () => import("./_ssr/inspector-notes.functions-D2rTkRAZ.mjs")
	},
	"a55074f9a2c3679f0fcb680587f5991c765b0801c777fe5b0cdee20e526c1390": {
		functionName: "submitNoteCorrection_createServerFn_handler",
		importer: () => import("./_ssr/inspector-notes.functions-D2rTkRAZ.mjs")
	},
	"c19ad123684bff70e7873b6d6439947839fdde14c75f5dd01ba436b12a96ae8e": {
		functionName: "searchInspectorNotes_createServerFn_handler",
		importer: () => import("./_ssr/inspector-notes.functions-D2rTkRAZ.mjs")
	},
	"c7b660e60c90ac67defafa5cfd4fbf45668c3236ae3e39736cf4bc752c27dcf6": {
		functionName: "analyzeSiteNote_createServerFn_handler",
		importer: () => import("./_ssr/inspector-ai.functions-C1lp8pdq.mjs")
	},
	"c7f4965852721a31cbb1d12971fecb7b5e8aca26875d68e10daa9a9485f78230": {
		functionName: "saveInspectorNote_createServerFn_handler",
		importer: () => import("./_ssr/inspector-notes.functions-D2rTkRAZ.mjs")
	},
	"ca1f8a9e8361ca9963078f940ce58a9c2b0e44bc15e0f6f3c80362529fd8907c": {
		functionName: "familyVoiceAction_createServerFn_handler",
		importer: () => import("./_ssr/family-voice.functions-cUmug5za.mjs")
	},
	"ea746736277ceb9aea07e443526e8f12d7462737856a591b0e804c5328ac90a3": {
		functionName: "chatAboutCorrection_createServerFn_handler",
		importer: () => import("./_ssr/inspector-ai.functions-C1lp8pdq.mjs")
	},
	"f41ba9d83bea6f205fd3c150915b515c7827685c773d495d0fb3f9d8c3540f5d": {
		functionName: "checkNoteConflicts_createServerFn_handler",
		importer: () => import("./_ssr/inspector-ai.functions-C1lp8pdq.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ??= await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
