import { useEffect, useState, useCallback } from "react";
import { cctList, cctCreate, cctDelete, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";

/** Client-side favorites hook backed by nn_favorite CCT. */
export function useFavorites() {
  const { user } = useNotchAuth();
  const [favs, setFavs] = useState<Array<{ id: string; block_id: string }>>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setFavs([]); setLoading(false); return; }
    setLoading(true);
    try {
      const all = await cctList<any>(NN.favorite);
      setFavs(all.filter((f: any) => String(f.author_id) === String(user.user_id)).map((f: any) => ({ id: f.id, block_id: String(f.block_id) })));
    } catch (e) { console.error("fav load", e); }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const isFav = (blockId: string) => favs.some((f) => f.block_id === String(blockId));

  const toggle = async (blockId: string) => {
    const existing = favs.find((f) => f.block_id === String(blockId));
    if (existing) {
      await cctDelete(NN.favorite, existing.id);
    } else {
      await cctCreate(NN.favorite, { block_id: String(blockId), added_at: Math.floor(Date.now() / 1000) });
    }
    await load();
  };

  return { favs, isFav, toggle, loading, refresh: load };
}
