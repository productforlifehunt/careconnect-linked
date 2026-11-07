var e=`/** Memory-only reads: coalesce pending work, expire after completion, reject stale generations. */
export function createReadCache<T>() {
  type Entry = { settledAt: number | null; promise: Promise<T> };
  const entries = new Map<string, Entry>();
  return {
    clear(fragment?: string) {
      if (!fragment) entries.clear();
      else for (const key of entries.keys()) if (key.includes(fragment)) entries.delete(key);
    },
    read(key: string, load: () => Promise<T>, ttl: number): Promise<T> {
      const hit = entries.get(key);
      if (hit && (hit.settledAt === null || Date.now() - hit.settledAt < ttl)) return hit.promise;
      const entry: Entry = { settledAt: null, promise: Promise.resolve().then(load) };
      entry.promise = entry.promise.then(value => {
        entry.settledAt = Date.now();
        return value;
      }, error => {
        if (entries.get(key) === entry) entries.delete(key);
        throw error;
      });
      entries.set(key, entry);
      return entry.promise;
    },
  };
}`;export{e as default};