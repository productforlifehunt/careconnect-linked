import "../_runtime.mjs";
import { a as TSS_SERVER_FUNCTION } from "./createServerFn-Be1RckzI.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-Q63YeH9j.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/createSsrRpc-DWUsQYVr.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
export { createSsrRpc as t };
