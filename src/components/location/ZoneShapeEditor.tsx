import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { themeColor } from "@/lib/theme-color";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Circle, Crosshair, PenLine, Undo2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export type ZoneShape = "Radius" | "Polygon";

interface ZoneShapeEditorProps {
  shape: ZoneShape;
  onShapeChange: (shape: ZoneShape) => void;
  /** Centre as strings so the parent forms can stay text-driven. */
  latitude: string;
  longitude: string;
  onCenterChange: (lat: string, lng: string) => void;
  radiusMeters: string;
  onRadiusChange: (radius: string) => void;
  points: [number, number][];
  onPointsChange: (points: [number, number][]) => void;
  onUseMyLocation?: () => void;
  danger?: boolean;
}

/**
 * Map-based area picker: a simple radius circle, or a precise custom outline
 * drawn point by point. Shared by the GPS page and the safety Places page so
 * both write the same CCT 214 shape fields.
 */
export function ZoneShapeEditor({
  shape, onShapeChange, latitude, longitude, onCenterChange,
  radiusMeters, onRadiusChange, points, onPointsChange, onUseMyLocation, danger,
}: ZoneShapeEditorProps) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);

  const holderRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  // Keep the newest handlers reachable from the one-time click listener.
  const stateRef = useRef({ shape, points, onPointsChange, onCenterChange });
  stateRef.current = { shape, points, onPointsChange, onCenterChange };

  useEffect(() => {
    if (!holderRef.current || mapRef.current) return;
    const map = L.map(holderRef.current, { zoomControl: true }).setView([39.9042, 116.4074], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    map.getContainer().setAttribute("aria-label", Z("区域地图", "Zone map"));
    map.on("click", (e: L.LeafletMouseEvent) => {
      const s = stateRef.current;
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));
      if (s.shape === "Polygon") {
        s.onPointsChange([...s.points, [lat, lng]]);
      } else {
        s.onCenterChange(String(lat), String(lng));
      }
    });
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    // Dialogs animate open, so the map needs a size recheck once painted.
    const t = window.setTimeout(() => map.invalidateSize(), 250);
    return () => {
      window.clearTimeout(t);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // Redraw whichever shape is being edited.
  useEffect(() => {
    const map = mapRef.current;
    const group = layerRef.current;
    if (!map || !group) return;
    group.clearLayers();
    const color = danger ? "#ef4444" : themeColor("--primary", "#4c1d95");

    if (shape === "Polygon") {
      points.forEach(([lat, lng], i) => {
        L.circleMarker([lat, lng], { radius: 5, color: "#fff", weight: 2, fillColor: color, fillOpacity: 1 })
          .bindTooltip(String(i + 1), { permanent: false })
          .addTo(group);
      });
      if (points.length >= 3) {
        const poly = L.polygon(points, { color, weight: 2, fillOpacity: 0.15 }).addTo(group);
        map.fitBounds(poly.getBounds(), { padding: [30, 30] });
      } else if (points.length > 0) {
        if (points.length === 2) L.polyline(points, { color, weight: 2, dashArray: "5 5" }).addTo(group);
        map.panTo(points[points.length - 1]);
      }
      return;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const radius = Number(radiusMeters);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    L.circleMarker([lat, lng], { radius: 6, color: "#fff", weight: 3, fillColor: color, fillOpacity: 1 }).addTo(group);
    const circle = L.circle([lat, lng], {
      radius: Number.isFinite(radius) && radius > 0 ? radius : 200,
      color, weight: 2, fillOpacity: 0.12,
    }).addTo(group);
    map.fitBounds(circle.getBounds(), { padding: [30, 30] });
  }, [shape, points, latitude, longitude, radiusMeters, danger]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={shape === "Radius" ? "default" : "outline"}
          size="sm"
          onClick={() => onShapeChange("Radius")}
        >
          <Circle className="mr-2 h-4 w-4" />
          {Z("圆形范围", "Circle area")}
        </Button>
        <Button
          type="button"
          variant={shape === "Polygon" ? "default" : "outline"}
          size="sm"
          onClick={() => onShapeChange("Polygon")}
        >
          <PenLine className="mr-2 h-4 w-4" />
          {Z("定位范围", "Position area")}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {shape === "Polygon"
          ? Z("在地图上依次点击，围出准确范围，至少 3 个点。", "Tap the map point by point to trace the exact area — at least 3 points.")
          : Z("在地图上点一下就是中心点，再设置范围大小。", "Tap the map to set the centre, then choose how wide the area is.")}
      </p>

      <div ref={holderRef} className="h-64 w-full overflow-hidden rounded-xl border" />

      {shape === "Polygon" ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {isCN ? `已画 ${points.length} 个点` : `${points.length} point${points.length === 1 ? "" : "s"} placed`}
          </span>
          <Button
            type="button" variant="outline" size="sm"
            onClick={() => onPointsChange(points.slice(0, -1))}
            disabled={points.length === 0}
          >
            <Undo2 className="mr-1 h-4 w-4" />
            {Z("撤销上一个点", "Undo last point")}
          </Button>
          <Button
            type="button" variant="ghost" size="sm"
            onClick={() => onPointsChange([])}
            disabled={points.length === 0}
          >
            <XCircle className="mr-1 h-4 w-4" />
            {Z("全部清除", "Clear all")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <Label htmlFor="zone-shape-radius">{Z("范围大小（米）", "Area size (metres)")}</Label>
            <Input
              id="zone-shape-radius"
              inputMode="numeric"
              value={radiusMeters}
              onChange={(e) => onRadiusChange(e.target.value)}
            />
          </div>
          {onUseMyLocation && (
            <div className="flex items-end">
              <Button type="button" variant="outline" size="sm" onClick={onUseMyLocation}>
                <Crosshair className="mr-2 h-4 w-4" />
                {Z("用我现在的位置", "Use my current spot")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
