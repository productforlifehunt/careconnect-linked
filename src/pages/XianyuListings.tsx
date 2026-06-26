import cn1 from "@/assets/xianyu/cn1.png";
import cn2 from "@/assets/xianyu/cn2.png";
import cn3 from "@/assets/xianyu/cn3.png";
import en1 from "@/assets/xianyu/en1.png";
import en2 from "@/assets/xianyu/en2.png";
import en3 from "@/assets/xianyu/en3.png";

const Row = ({ images, label }: { images: string[]; label: string }) => (
  <section className="space-y-4">
    <h2 className="text-2xl font-semibold tracking-tight">{label}</h2>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {images.map((src, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm"
        >
          <img
            src={src}
            alt={`${label} screenshot ${i + 1}`}
            className="w-full h-auto block"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  </section>
);

export default function XianyuListings() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Xianyu Listings — Original & English Translation
        </h1>
        <p className="text-muted-foreground">
          Top row: original Chinese screenshots. Bottom row: same screenshots
          with all text translated to English.
        </p>
      </header>

      <Row images={[cn1, cn2, cn3]} label="Original (Chinese)" />
      <Row images={[en1, en2, en3]} label="Translated (English)" />
    </main>
  );
}
