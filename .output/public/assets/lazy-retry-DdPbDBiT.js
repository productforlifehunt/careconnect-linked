var e=`import { lazy, type ComponentType } from "react";

/**
 * lazy() that survives a new publish: an open tab still asks for the old hashed chunk,
 * which no longer exists. Retry once, then reload the page once to get the new files;
 * if that already happened, render nothing instead of blanking the whole app.
 */
export function lazyRetry<T extends ComponentType<any>>(load: () => Promise<{ default: T }>, name: string) {
  return lazy(async () => {
    const key = \`chunk-reload:\${name}\`;
    try {
      const m = await load().catch(() => new Promise<{ default: T }>((r, j) => setTimeout(() => load().then(r, j), 800)));
      sessionStorage.removeItem(key);
      return m;
    } catch (e) {
      if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      console.error(\`Could not load \${name}\`, e);
      return { default: (() => null) as unknown as T };
    }
  });
}
`;export{e as default};