/* eslint-disable */

const isDraftbitSandbox =
  typeof window !== "undefined" &&
  (
    window.location.hostname.endsWith("sandbox.draftbit.dev") ||
    window.location.hostname.endsWith("sandbox.stagingbit.com") ||
    window.location.hostname === "localhost" ||
    window.location.hostname.startsWith("127.")
  );

if (isDraftbitSandbox) {
  // Conditionals forced from the builder's Component Tree (see branchOverrides.ts
  // in iframe-element-picker). The app can render before the picker finishes
  // loading, so the helper the babel plugin's wrapped conditionals call is
  // defined here. It reads the overrides the picker stored before the reload
  // that applies them, takes the reload marker out of window.name before the
  // theme bootstrap below reads it, and records which conditionals run.
  (function () {
    const RELOAD_MARKER = '\n__draftbit_branch_reload__:';
    let overrides = {};
    try {
      const stored = JSON.parse(window.sessionStorage.getItem('draftbit-branch-overrides') || '{}');
      if (stored && typeof stored === 'object') overrides = stored;
    } catch (e) {}
    let reloadedFor = null;
    try {
      const index = window.name.indexOf(RELOAD_MARKER);
      if (index !== -1) {
        reloadedFor = window.name.slice(index + RELOAD_MARKER.length);
        window.name = window.name.slice(0, index);
      }
    } catch (e) {}
    const loaded = JSON.stringify(
      Object.entries(overrides).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
    );
    window.__draftbitBranchOverrides = overrides;
    window.__draftbitBranchFailedReloadFor =
      reloadedFor !== null && reloadedFor !== loaded ? reloadedFor : null;
    window.__draftbitBranchSeen = window.__draftbitBranchSeen || {};
    window.__draftbitBranch = function (key, value) {
      const seen = window.__draftbitBranchSeen;
      if (!seen[key]) {
        seen[key] = true;
        if (typeof window.__draftbitBranchSeenChanged === 'function') {
          window.__draftbitBranchSeenChanged();
        }
      }
      const current = window.__draftbitBranchOverrides;
      return current && Object.prototype.hasOwnProperty.call(current, key) ? current[key] : value;
    };
  })();

  // Errors thrown after a forced conditional ran may not happen with the real
  // condition, so the builder keeps them out of the agent's logs
  function isForcedBranchActive() {
    const overrides = window.__draftbitBranchOverrides || {};
    const seen = window.__draftbitBranchSeen || {};
    return Object.keys(overrides).some((key) => seen[key]);
  }

  // Runtime errors need to be posted back to the builder window, even before
  // iframe-element-picker finishes loading and initializes its trusted origin.
  const BUILDER_ORIGIN = "https://next.draftbit.com";
  const PREVIEW_RUNTIME_ERROR_DEDUPE_WINDOW_MS = 5000;

  function getCurrentRoute() {
    return window.location
      ? `${window.location.pathname}${window.location.search}${window.location.hash}`
      : undefined;
  }

  function getRuntimeErrorMessage(value, fallbackMessage) {
    if (typeof value === 'string' && value.trim()) return value;
    if (value instanceof Error) return value.message || value.name || fallbackMessage;
    if (value && typeof value.message === 'string' && value.message.trim()) return value.message;
    try {
      const stringified = JSON.stringify(value);
      return stringified && stringified !== '{}' ? stringified : fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  }

  function getRuntimeErrorStack(value) {
    if (value instanceof Error && typeof value.stack === 'string') return value.stack;
    if (value && typeof value.stack === 'string') return value.stack;
    return undefined;
  }

  function normalizeRuntimeErrorPayload(payload) {
    return {
      type: 'preview-runtime-error',
      errorKind: payload.errorKind,
      message: payload.message,
      stack: payload.stack,
      filename: payload.filename,
      lineNumber: Number.isFinite(payload.lineNumber) ? payload.lineNumber : undefined,
      columnNumber: Number.isFinite(payload.columnNumber) ? payload.columnNumber : undefined,
      route: payload.route || getCurrentRoute(),
      overridesActive: isForcedBranchActive(),
    };
  }

  function reportPreviewRuntimeError(payload) {
    const normalizedPayload = normalizeRuntimeErrorPayload(payload);
    // The browser may fire duplicate events for the same crash; collapse those
    // so the builder only gets one visible notification per failure signature.
    const signature = [
      normalizedPayload.errorKind,
      normalizedPayload.message,
      normalizedPayload.stack || '',
      normalizedPayload.filename || '',
      normalizedPayload.lineNumber || '',
      normalizedPayload.columnNumber || '',
      normalizedPayload.route || '',
    ].join('|');
    const now = Date.now();

    if (
      window.__draftbitLastPreviewRuntimeErrorSignature === signature &&
      typeof window.__draftbitLastPreviewRuntimeErrorTimestamp === 'number' &&
      now - window.__draftbitLastPreviewRuntimeErrorTimestamp <=
        PREVIEW_RUNTIME_ERROR_DEDUPE_WINDOW_MS
    ) {
      return;
    }

    window.__draftbitLastPreviewRuntimeErrorSignature = signature;
    window.__draftbitLastPreviewRuntimeErrorTimestamp = now;

    window.__draftbitPendingPreviewRuntimeError = normalizedPayload;
    const reporter = window.__draftbitPreviewRuntimeErrorReporter;
    if (typeof reporter === 'function') {
      reporter(normalizedPayload);
      return;
    }

    // Fall back to a direct postMessage so early startup errors still surface
    // before the child helper is ready.
    try {
      window.parent.postMessage(normalizedPayload, BUILDER_ORIGIN);
    } catch (error) {
      console.warn('[draftbit preview runtime error] failed to post message', error);
    }
  }

  if (!window.__draftbitPreviewRuntimeErrorBridgeInstalled) {
    window.__draftbitPreviewRuntimeErrorBridgeInstalled = true;

    window.addEventListener('error', (event) => {
      const error = event.error;
      reportPreviewRuntimeError({
        errorKind: 'error',
        message: getRuntimeErrorMessage(
          error ?? event.message,
          'Unknown preview runtime error',
        ),
        stack: getRuntimeErrorStack(error),
        filename: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      reportPreviewRuntimeError({
        errorKind: 'unhandledrejection',
        message: getRuntimeErrorMessage(reason, 'Unhandled promise rejection'),
        stack: getRuntimeErrorStack(reason),
      });
    });
  }

  import('@draftbit/iframe-element-picker').then(({ Child }) => {
    // Once the child helper is ready, route future runtime errors through the
    // same typed iframe messaging path used by the rest of preview events.
    window.__draftbitPreviewRuntimeErrorReporter = (payload) => {
      Child.reportRuntimeError(payload);
    };
    Child.init("https://next.draftbit.com", import.meta.env.VITE_PROJECT_PATH, false);
    if (window.__draftbitPendingPreviewRuntimeError) {
      Child.reportRuntimeError(window.__draftbitPendingPreviewRuntimeError);
    }

    if (import.meta.hot) {
      let renderGeneration;
      const beforeUpdate = () => {
        window.__draftbitPendingPreviewRuntimeError = undefined;
        window.__draftbitLastPreviewRuntimeErrorSignature = undefined;
        renderGeneration = Child.beginPreviewRender();
      };
      const afterUpdate = () => {
        if (renderGeneration !== undefined) void Child.finishPreviewRender(renderGeneration);
      };
      const updateError = ({ err }) => {
        reportPreviewRuntimeError({
          errorKind: 'error',
          message: err.message || 'Preview update failed',
          stack: err.stack,
        });
      };
      import.meta.hot.on('vite:beforeUpdate', beforeUpdate);
      import.meta.hot.on('vite:afterUpdate', afterUpdate);
      import.meta.hot.on('vite:error', updateError);
      import.meta.hot.dispose(() => {
        import.meta.hot.off('vite:beforeUpdate', beforeUpdate);
        import.meta.hot.off('vite:afterUpdate', afterUpdate);
        import.meta.hot.off('vite:error', updateError);
      });
    }

  }).catch(() => {});



  // Canvas previews pass the theme before app initialization without changing the app URL.
  const urlParams = new URLSearchParams(window.location.search);
  const themeFromUrl = urlParams.get('theme');
  const themeFromFrame = /^draftbit-preview-theme:(light|dark)$/.exec(window.name)?.[1];
  window.previewTheme = (themeFromFrame ?? themeFromUrl) === 'dark' ? 'dark' : 'light';

  // Wrap window.matchMedia to intercept queries to light/dark mode, so we can control it.
  const originalMatchMedia = window.matchMedia;

  // Get theme from window.previewTheme property set by the parent
  function isForcedDark() {
    if (typeof window.previewTheme !== 'undefined') {
      return window.previewTheme === 'dark';
    }
    return originalMatchMedia.call(window, '(prefers-color-scheme: dark)')?.matches ?? false;
  }


  // State: true = dark, false = light
  let forcedDark = isForcedDark();

  // Keep track of listeners
  const isDarkListeners = new Set();
  const isLightListeners = new Set();

  // Cache mock MediaQueryList objects so the same reference is returned for the same query.
  // This is important for hooks using useSyncExternalStore which require stable references.
  const darkMql = {
    get matches() { return forcedDark; },
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener(event, callback) {
      if (event === 'change') isDarkListeners.add(callback);
    },
    removeEventListener(event, callback) {
      if (event === 'change') isDarkListeners.delete(callback);
    },
    addListener(callback) { isDarkListeners.add(callback); },
    removeListener(callback) { isDarkListeners.delete(callback); },
    dispatchEvent(event) {
      isDarkListeners.forEach(fn => fn(event));
      return true;
    }
  };

  const lightMql = {
    get matches() { return !forcedDark; },
    media: '(prefers-color-scheme: light)',
    onchange: null,
    addEventListener(event, callback) {
      if (event === 'change') isLightListeners.add(callback);
    },
    removeEventListener(event, callback) {
      if (event === 'change') isLightListeners.delete(callback);
    },
    addListener(callback) { isLightListeners.add(callback); },
    removeListener(callback) { isLightListeners.delete(callback); },
    dispatchEvent(event) {
      isLightListeners.forEach(fn => fn(event));
      return true;
    }
  };

  window.matchMedia = function(query) {
    const reg = /^\s*\(\s*prefers-color-scheme\s*:\s*(light|dark)\s*\)\s*$/;
    const match = query.match(reg);
    if (match) {
      return match[1] === 'dark' ? darkMql : lightMql;
    }
    // fallback for other media queries
    return originalMatchMedia.call(window, query);
  };

  // Function to toggle dark/light
  window.setIsDark = function(isDark) {
    if (/^draftbit-preview-theme:(light|dark)$/.test(window.name)) {
      window.name = 'draftbit-preview-theme:' + (isDark ? 'dark' : 'light');
    }
    forcedDark = isDark;

    // Update window.previewTheme property
    window.previewTheme = isDark ? 'dark' : 'light';

    // Dispatch "change" events to light/dark listeners
    isDarkListeners.forEach(fn => fn(new MediaQueryListEvent('change', {matches: isDark})));
    isLightListeners.forEach(fn => fn(new MediaQueryListEvent('change', {matches: !isDark})));

  };

}
