import { Link } from "react-router-dom";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import { ArrowRight, FileText, LayoutGrid, MessageSquare, Share2, Sparkles, Star } from "lucide-react";

export default function NotchLanding() {
  const path = useNotchPath();
  return (
    <div className="notch-app" style={{ minHeight: "100vh", background: "var(--nn-bg)", color: "var(--nn-text)" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 20 }}>
          <span style={{ fontSize: 26 }}>📓</span> Notch Note
        </div>
        <nav style={{ display: "flex", gap: 8 }}>
          <Link to={path("/auth")} className="nn-topbar-btn" style={{ fontSize: 14 }}>Log in</Link>
          <Link to={path("/auth?mode=signup")} className="nn-btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            Get Notch Note free <ArrowRight size={14} style={{ marginLeft: 6 }} />
          </Link>
        </nav>
      </header>

      <section style={{ padding: "60px 32px 40px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 700, lineHeight: 1.05, margin: "12px 0 20px", letterSpacing: -1 }}>
          Write, plan, share.<br />
          <span style={{ background: "linear-gradient(90deg,#eb5757,#f5a623,#2383e2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            With Notch Note.
          </span>
        </h1>
        <p style={{ fontSize: 20, color: "var(--nn-text-secondary)", maxWidth: 620, margin: "0 auto 32px", lineHeight: 1.5 }}>
          The connected workspace where better, faster work happens. Pages, databases, and collaboration — all in one place.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to={path("/auth?mode=signup")} className="nn-btn-primary" style={{ textDecoration: "none", padding: "12px 22px", fontSize: 15 }}>
            Get Notch Note free
          </Link>
          <Link to={path("/auth")} className="nn-topbar-btn" style={{ padding: "12px 22px", fontSize: 15, border: "1px solid var(--nn-border-strong)" }}>
            Sign in
          </Link>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
        {[
          { icon: <FileText size={22} />, title: "Pages & sub-pages", body: "Infinitely nestable pages with a fast block editor and slash commands." },
          { icon: <LayoutGrid size={22} />, title: "Databases", body: "Table, board, calendar, gallery and list views over the same data." },
          { icon: <MessageSquare size={22} />, title: "Comments", body: "Discuss right inside the doc. Never lose context again." },
          { icon: <Share2 size={22} />, title: "Sharing", body: "Invite teammates by email or publish to the web with one click." },
          { icon: <Star size={22} />, title: "Favorites & templates", body: "Star pages, save layouts as templates and spin them up instantly." },
          { icon: <Sparkles size={22} />, title: "Fast & minimal", body: "A calm, Notion-familiar canvas that stays out of your way." },
        ].map((f) => (
          <div key={f.title} style={{ border: "1px solid var(--nn-border)", borderRadius: 10, padding: 22, background: "var(--nn-bg)" }}>
            <div style={{ color: "var(--nn-blue)", marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 16 }}>{f.title}</div>
            <div style={{ color: "var(--nn-text-secondary)", fontSize: 14, lineHeight: 1.5 }}>{f.body}</div>
          </div>
        ))}
      </section>

      <footer style={{ borderTop: "1px solid var(--nn-border)", padding: "24px 32px", textAlign: "center", color: "var(--nn-text-tertiary)", fontSize: 13 }}>
        Notch Note · A connected workspace
      </footer>
    </div>
  );
}
