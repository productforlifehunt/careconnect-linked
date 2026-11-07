import "../_runtime.mjs";

//#region node_modules/@lovable.dev/ai-gateway/dist/models-DxUJGvue.js
var GatewayError = class extends Error {
	attemptCount;
	httpStatus;
	outcome;
	retryable;
	retryAfter;
	recovery;
	ids;
	remote;
	constructor(message, details = {}) {
		super(message);
		this.attemptCount = details.attemptCount ?? 1;
		this.httpStatus = details.httpStatus;
		this.outcome = details.outcome ?? "unknown";
		this.retryable = details.retryable;
		this.retryAfter = details.retryAfter;
		this.recovery = details.recovery;
		this.ids = details.ids;
		this.remote = details.remote;
	}
	toJSON() {
		return {
			attemptCount: this.attemptCount,
			name: this.name,
			code: this.code,
			message: this.message,
			httpStatus: this.httpStatus,
			outcome: this.outcome,
			retryable: this.retryable,
			retryAfter: this.retryAfter,
			recovery: this.recovery,
			ids: this.ids,
			remote: this.remote
		};
	}
};
var ConfigurationError = class extends GatewayError {
	code = "configuration_error";
	name = "ConfigurationError";
};
var RequestRejectedError = class extends GatewayError {
	code = "request_rejected";
	name = "RequestRejectedError";
};
var AuthenticationError = class extends GatewayError {
	code = "authentication_error";
	name = "AuthenticationError";
};
var PermissionDeniedError = class extends GatewayError {
	code = "permission_denied";
	name = "PermissionDeniedError";
};
var PaymentRequiredError = class extends GatewayError {
	code = "payment_required";
	name = "PaymentRequiredError";
};
var RateLimitError = class extends GatewayError {
	code = "rate_limited";
	name = "RateLimitError";
};
var OperationFailedError = class extends GatewayError {
	code = "operation_failed";
	name = "OperationFailedError";
};
var NetworkError = class extends GatewayError {
	code = "network_error";
	name = "NetworkError";
};
var TimeoutError = class extends GatewayError {
	code = "timeout";
	name = "TimeoutError";
};
var CancelledError = class extends GatewayError {
	code = "cancelled";
	name = "CancelledError";
};
var InvalidResponseError = class extends GatewayError {
	code = "invalid_response";
	name = "InvalidResponseError";
};
var UnknownGatewayError = class extends GatewayError {
	code = "unknown";
	name = "UnknownGatewayError";
};
var sdkHeaders = {
	"X-Lovable-AIG-SDK": "lovable-ai-gateway-sdk",
	"X-Lovable-AIG-SDK-Version": "0.1.11"
};
var TransportConfigurationError = class extends Error {
	reason;
	constructor(reason) {
		super(reason);
		this.reason = reason;
	}
};
function readEnv(name) {
	const runtime = globalThis;
	try {
		return (runtime.Deno?.env.get(name) ?? runtime.process?.env[name])?.trim() || void 0;
	} catch {
		throw new TransportConfigurationError("environment");
	}
}
function resolveConfiguration(options = {}) {
	if (typeof window !== "undefined" && typeof document !== "undefined") throw new TransportConfigurationError("server_only");
	const apiKey = options.apiKey?.trim() || readEnv("LOVABLE_API_KEY");
	if (!apiKey) throw new TransportConfigurationError("missing_credentials");
	const baseURL = (readEnv("LOVABLE_AI_GATEWAY_URL") ?? "https://ai.gateway.lovable.dev").replace(/\/+$/, "");
	try {
		const url = new URL(baseURL);
		if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error();
	} catch {
		throw new TransportConfigurationError("invalid_url");
	}
	return {
		apiKey,
		baseURL
	};
}
function sendRequest(path, init, configuration) {
	const headers = new Headers(init.headers);
	headers.set("Lovable-API-Key", configuration.apiKey);
	for (const [name, value] of Object.entries(sdkHeaders)) headers.set(name, value);
	return fetch(`${configuration.baseURL}${path}`, {
		...init,
		headers,
		redirect: init.redirect ?? "manual"
	});
}
function object(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function responseDetails(context, body) {
	const token = (value) => typeof value === "string" && /^[\w .:/[\]-]{1,200}$/.test(value) ? context.redact(value) : void 0;
	const root = object(body);
	const nested = object(root.error);
	const error = root.error !== void 0 ? nested : root;
	const props = object(root.props);
	const metadata = object(error.metadata);
	const headers = context.response.headers;
	const retryAfter = headers.get("Retry-After");
	return {
		attemptCount: context.attemptCount,
		httpStatus: context.response.status,
		retryAfter: parseRetryAfter(retryAfter),
		retryable: typeof props.retryable === "boolean" ? props.retryable : void 0,
		ids: {
			requestId: token(headers.get("X-Request-Id")) ?? token(root.request_id),
			logId: token(headers.get("X-Lovable-AIG-Log-ID")),
			runId: token(headers.get("X-Lovable-AIG-Run-ID")),
			jobId: root.object === "video" ? token(root.id) : void 0,
			providerRequestId: token(headers.get("request-id"))
		},
		remote: {
			type: token(error.type),
			code: typeof error.code === "number" && Number.isFinite(error.code) ? error.code : token(error.code),
			param: token(error.param),
			provider: token(metadata.provider_name),
			requires: token(props.requires)
		}
	};
}
function interrupted(cause, details) {
	const name = object(cause).name;
	if (name === "AbortError") return new CancelledError("The request was cancelled. Cancellation does not confirm that remote work stopped.", {
		...details,
		retryable: false
	});
	if (name === "TimeoutError") return new TimeoutError("The request timed out before its result was confirmed.", details);
	if (cause instanceof TypeError) return new NetworkError("The connection failed before the response was fully received.", details);
}
function parseRetryAfter(value) {
	if (!value || value.length > 128) return void 0;
	value = value.trim();
	if (/^\d+(?:\.\d+)?$/.test(value)) {
		const milliseconds = Number(value) * 1e3;
		return Number.isFinite(milliseconds) ? milliseconds : void 0;
	}
	if (!/^[A-Za-z]/.test(value)) return void 0;
	const timestamp = Date.parse(value);
	return Number.isFinite(timestamp) ? Math.max(0, timestamp - Date.now()) : void 0;
}
function newGatewayError(failure) {
	if ("cause" in failure && failure.cause instanceof GatewayError) return failure.cause;
	if (failure.kind === "transport") {
		if (failure.cause instanceof TransportConfigurationError) return new ConfigurationError({
			server_only: "@lovable.dev/ai-gateway can only be used on the server.",
			missing_credentials: "LOVABLE_API_KEY is missing from the server environment.",
			environment: "The server could not read the AI Gateway environment configuration.",
			invalid_url: "LOVABLE_AI_GATEWAY_URL must be a valid HTTP or HTTPS URL.",
			invalid_retry_options: "Retry options must be nonnegative safe integers; retryWaitBudgetMs must not exceed 2147483647."
		}[failure.cause.reason], {
			attemptCount: 0,
			outcome: "not_started",
			retryable: false,
			recovery: {
				action: "contact_admin",
				message: "Ask the app owner to correct the server configuration."
			}
		});
		return interrupted(failure.cause, { attemptCount: failure.attemptCount }) ?? new UnknownGatewayError("The AI Gateway request failed for an unrecognized reason.", { attemptCount: failure.attemptCount });
	}
	if (failure.kind === "response") {
		const details = responseDetails(failure);
		return interrupted(failure.cause, details) ?? new InvalidResponseError("AI Gateway returned an invalid response.", details);
	}
	const details = responseDetails(failure, failure.body);
	const root = object(failure.body);
	if (failure.kind === "stream") return new OperationFailedError(root.object === "video" && root.status === "failed" ? "AI Gateway video generation failed." : "AI Gateway reported a stream failure.", {
		...details,
		outcome: "failed",
		retryable: false
	});
	const status = failure.response.status;
	const native = root.error === void 0 && root.status === status && typeof root.type === "string";
	const type = details.remote?.type;
	const requires = details.remote?.requires;
	if (native && [
		400,
		401,
		402,
		403,
		413,
		429
	].includes(status)) details.outcome = "not_started";
	const message = `AI Gateway request failed (HTTP ${status}).`;
	if (status === 429) return new RateLimitError("AI Gateway is rate limiting this request.", {
		...details,
		retryable: details.retryable ?? true,
		recovery: details.retryable === false ? void 0 : {
			action: "wait",
			message: "Honor Retry-After when present; retry only when replay is safe."
		}
	});
	if (status === 401 && root.error === void 0) return new AuthenticationError("AI Gateway rejected the app's credentials.", {
		...details,
		retryable: false,
		recovery: {
			action: "contact_admin",
			message: "Ask the app owner to check the server's Lovable API key."
		}
	});
	if (status === 402 && root.error === void 0) return new PaymentRequiredError("AI Gateway rejected the request for payment reasons. Ask the workspace owner to review credits and pending generations.", {
		...details,
		recovery: requires === "top_up" ? {
			action: "add_credits",
			message: "The workspace owner needs to add credits before trying again."
		} : void 0
	});
	if (status === 403) return new PermissionDeniedError("AI Gateway denied access to this operation.", {
		...details,
		retryable: false,
		recovery: requires === "admin_action" ? {
			action: "contact_admin",
			message: "Ask a workspace admin to review AI access or spending limits."
		} : requires === "model_change" ? {
			action: "fix_request",
			message: "Choose an eligible model with the user's approval, or ask the admin to review the workspace policy."
		} : void 0
	});
	if ([
		400,
		404,
		409,
		413,
		422
	].includes(status)) return new RequestRejectedError(message, {
		...details,
		retryable: false,
		recovery: status === 409 || status === 404 ? void 0 : {
			action: "fix_request",
			message: "Correct the rejected input before submitting another request."
		}
	});
	if (status === 499 && native && type === "request_cancelled") return new CancelledError("AI Gateway reported that the request was cancelled.", {
		...details,
		retryable: false
	});
	if (status === 408 || status === 504) return new TimeoutError("AI Gateway did not confirm a result before the request timed out.", details);
	if (status >= 500 || Object.keys(object(root.error)).length > 0) return new OperationFailedError(message, {
		...details,
		retryable: details.retryable ?? (status >= 500 ? true : void 0)
	});
	return new UnknownGatewayError(message, details);
}
function retryPolicy(options) {
	const maxRetries = options.maxRetries ?? 2;
	const retryWaitBudgetMs = options.retryWaitBudgetMs ?? 1e4;
	if (!Number.isSafeInteger(maxRetries) || maxRetries < 0 || !Number.isSafeInteger(retryWaitBudgetMs) || retryWaitBudgetMs < 0 || retryWaitBudgetMs > 2147483647) throw new TransportConfigurationError("invalid_retry_options");
	return {
		maxRetries,
		retryWaitBudgetMs
	};
}
function canRetry(error, options, body) {
	if (error.retryable === false || options.signal?.aborted) return false;
	if (!(options.body == null || typeof options.body === "string" || options.body instanceof Blob || options.body instanceof FormData || options.body instanceof URLSearchParams || options.body instanceof ArrayBuffer || ArrayBuffer.isView(options.body))) return false;
	if (["GET", "HEAD"].includes((options.method ?? "GET").toUpperCase())) return error.code === "network_error" || error.code === "timeout" || error.code === "rate_limited" || error.code === "operation_failed" && [
		500,
		502,
		503,
		504
	].includes(error.httpStatus ?? 0);
	if (error.httpStatus !== 429 || !body || typeof body !== "object") return false;
	const envelope = body;
	return envelope.status === 429 && envelope.type === "rate_limited" && envelope.error === void 0;
}
function retryDelay(error, retryIndex) {
	const ceiling = Math.min(500 * 2 ** retryIndex, 3e4);
	return (error.retryAfter ?? 0) + Math.floor(Math.random() * (ceiling + 1));
}
function abortCause(cause, signal) {
	if (!signal?.aborted) return cause;
	return new DOMException(signal.reason?.name === "TimeoutError" ? "Timed out" : "Cancelled", signal.reason?.name === "TimeoutError" ? "TimeoutError" : "AbortError");
}
function waitForRetry(delay, signal) {
	return new Promise((resolve, reject) => {
		let timer;
		const abort = () => {
			clearTimeout(timer);
			signal?.removeEventListener("abort", abort);
			reject(abortCause(void 0, signal));
		};
		if (signal?.aborted) {
			abort();
			return;
		}
		timer = setTimeout(() => {
			signal?.removeEventListener("abort", abort);
			resolve();
		}, delay);
		signal?.addEventListener("abort", abort, { once: true });
	});
}
async function readErrorBodySafely(response) {
	if (!response.body) return void 0;
	const reader = response.body.getReader();
	let timer;
	try {
		return await Promise.race([(async () => {
			const decoder = new TextDecoder();
			let body = "";
			let bytes = 0;
			while (true) {
				const { done, value } = await reader.read();
				if (done) return JSON.parse(body + decoder.decode());
				bytes += value.byteLength;
				if (bytes > 16384) return void 0;
				body += decoder.decode(value, { stream: true });
			}
		})(), new Promise((resolve) => {
			timer = setTimeout(() => resolve(void 0), 1e3);
		})]);
	} catch {
		return;
	} finally {
		clearTimeout(timer);
		reader.cancel().catch(() => void 0);
	}
}
function responseError(cause, context) {
	return newGatewayError({
		kind: "response",
		...context,
		cause: abortCause(cause, context.signal)
	});
}
async function request(path, options, readResponse, opts = {}) {
	let configuration;
	let policy;
	try {
		configuration = resolveConfiguration(opts);
		policy = retryPolicy(opts);
		options.signal?.throwIfAborted();
	} catch (cause) {
		throw newGatewayError({
			kind: "transport",
			attemptCount: 0,
			cause: abortCause(cause, options.signal)
		});
	}
	let attemptCount = 0;
	let remainingWaitMs = policy.retryWaitBudgetMs;
	while (true) {
		let body;
		let error;
		try {
			options.signal?.throwIfAborted();
			attemptCount++;
			const response = await sendRequest(path, options, configuration);
			const context = {
				response,
				attemptCount,
				redact: (value) => value.replaceAll(configuration.apiKey, "[redacted]"),
				signal: options.signal ?? void 0
			};
			if (!response.ok && !(options.redirect === "manual" && response.status === 302)) {
				body = await readErrorBodySafely(response);
				options.signal?.throwIfAborted();
				throw newGatewayError({
					kind: "http",
					...context,
					body
				});
			}
			try {
				return await readResponse(response, context);
			} catch (cause) {
				throw responseError(cause, context);
			}
		} catch (cause) {
			error = newGatewayError({
				kind: "transport",
				attemptCount,
				cause: abortCause(cause, options.signal)
			});
		}
		if (attemptCount > policy.maxRetries || !canRetry(error, options, body)) throw error;
		const delay = retryDelay(error, attemptCount - 1);
		if (delay > remainingWaitMs) throw error;
		remainingWaitMs -= delay;
		try {
			await waitForRetry(delay, options.signal);
		} catch (cause) {
			throw newGatewayError({
				kind: "transport",
				attemptCount,
				cause: abortCause(cause, options.signal)
			});
		}
	}
}
function headers(options) {
	const value = new Headers();
	if (options?.runId) value.set("X-Lovable-AIG-Run-ID", options.runId);
	if (options?.metadata) value.set("X-Lovable-AIG-Metadata", JSON.stringify(options.metadata));
	return value;
}
function requestJSON(path, payload, reader, options, fields = {}) {
	const requestHeaders = headers(options);
	requestHeaders.set("Content-Type", "application/json");
	return request(path, {
		method: "POST",
		headers: requestHeaders,
		body: JSON.stringify({
			...payload,
			...fields
		}),
		signal: options?.signal
	}, reader, options);
}
//#endregion
//#region node_modules/@lovable.dev/ai-gateway/dist/index.js
function responseHeaders(response, init) {
	const headers = new Headers();
	for (const name of ["Content-Type", "X-Lovable-AIG-Run-ID"]) {
		const value = response.headers.get(name);
		if (value) headers.set(name, value);
	}
	new Headers(init?.headers).forEach((value, name) => headers.set(name, value));
	return headers;
}
function readBody(response, context) {
	const body = response.body;
	if (!body) throw new Error("Missing response body");
	let reader;
	return new ReadableStream({
		async pull(controller) {
			try {
				reader ??= body.getReader();
				const { done, value } = await reader.read();
				if (done) {
					controller.close();
					reader.releaseLock();
				} else controller.enqueue(value);
			} catch (cause) {
				controller.error(responseError(cause, context));
				reader?.cancel().catch(() => void 0);
			}
		},
		async cancel(reason) {
			if (reader) await reader.cancel(reason);
			else await body.cancel(reason);
		}
	}, { highWaterMark: 0 });
}
async function* readLines(body) {
	const reader = body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";
	let skipLF = false;
	try {
		while (true) {
			const { value, done } = await reader.read();
			buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
			if (skipLF && buffer.length > 0) {
				if (buffer[0] === "\n") buffer = buffer.slice(1);
				skipLF = false;
			}
			let boundary;
			while ((boundary = buffer.search(/[\r\n]/)) !== -1) {
				const line = buffer.slice(0, boundary);
				const cr = buffer[boundary] === "\r";
				buffer = buffer.slice(boundary + 1);
				if (cr) {
					if (buffer[0] === "\n") buffer = buffer.slice(1);
					else if (buffer.length === 0) skipLF = true;
				}
				yield line;
			}
			if (done) return;
		}
	} finally {
		await reader.cancel().catch(() => void 0);
		reader.releaseLock();
	}
}
async function* readEvents(body, context) {
	let data = [];
	let event = "";
	try {
		for await (const line of readLines(body)) if (line === "") {
			if (data.length > 0) {
				const payload = data.join("\n");
				if (payload === "[DONE]") return;
				const parsed = JSON.parse(payload);
				const record = parsed !== null && typeof parsed === "object" ? parsed : void 0;
				if (event === "error" || record?.type === "error" || record?.type === "response.failed" || record?.error) throw newGatewayError({
					kind: "stream",
					...context,
					body: parsed
				});
				yield record && event && !record.type ? {
					...record,
					type: event
				} : parsed;
			}
			data = [];
			event = "";
		} else if (!line.startsWith(":")) {
			const colon = line.indexOf(":");
			const field = colon === -1 ? line : line.slice(0, colon);
			const value = colon === -1 ? "" : line.slice(colon + 1).replace(/^ /, "");
			if (field === "data") data.push(value);
			if (field === "event") event = value;
		}
	} catch (cause) {
		throw responseError(cause, context);
	}
}
function readStream(response, context) {
	if (response.headers.get("Content-Type")?.split(";", 1)[0]?.trim().toLowerCase() !== "text/event-stream") throw new Error("Expected an SSE response");
	const body = readBody(response, context);
	let consumed = false;
	function claim() {
		if (consumed) throw new TypeError("The stream has already been consumed");
		consumed = true;
	}
	return {
		runId: response.headers.get("X-Lovable-AIG-Run-ID") ?? void 0,
		[Symbol.asyncIterator]() {
			claim();
			return readEvents(body, context);
		},
		toResponse(init) {
			claim();
			return new Response(body, {
				status: response.status,
				...init,
				headers: responseHeaders(response, init)
			});
		}
	};
}
/**
* Stream a chat completion as typed gateway SSE events.
*
* Consume once with `for await` or `toResponse()`; delivered streams are never
* automatically restarted. For OpenAI JSON output, prefer strict `json_schema`
* when supported; `json_object` requires an explicit JSON instruction in `messages`.
*
* Gemini Google Search uses the tool and citation contract described in
* {@link generateChatCompletion}.
*/
function streamChatCompletion(payload, options) {
	return requestJSON("/v1/chat/completions", payload, readStream, options, { stream: true });
}
new TextEncoder();
//#endregion
export { GatewayError as n, streamChatCompletion as t };
