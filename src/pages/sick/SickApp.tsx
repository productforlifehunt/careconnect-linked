import sickNotice from "@/assets/sick-notice.jpg.asset.json";

/**
 * Sick-leave notice micro site (`/?__site=sick`).
 *
 * One picture and nothing else: no words, no header, no footer, no care-app
 * brand and no navigation. The picture is deliberately hard to save by
 * accident — right-click, drag-and-drop, text selection and the mobile
 * long-press callout are all intercepted by a transparent layer, and the page
 * offers no download control. A determined visitor can still screenshot the
 * screen or open the browser's network panel: a browser cannot display a
 * picture without the browser having received it, so this deters saving, it
 * does not make extraction impossible.
 */
export default function SickApp() {
  return (
    <div
      className="relative flex min-h-dvh w-full select-none items-center justify-center overflow-hidden bg-background"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <img
        src={sickNotice.url}
        alt="Sick leave notice"
        draggable={false}
        className="sick-notice-img pointer-events-none h-auto max-h-dvh w-auto max-w-full select-none object-contain"
      />
      {/*
        Transparent layer over the picture: right-click and long-press land
        here, so the browser never sees a picture under the cursor and offers
        no "Save image as" / "Download image" entry.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  );
}
