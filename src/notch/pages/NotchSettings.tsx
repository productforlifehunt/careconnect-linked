import { useNotchAuth } from "@/notch/context/NotchAuthContext";

export default function NotchSettings() {
  const { user, logout } = useNotchAuth();
  return (
    <div className="nn-page-scroll">
      <div className="nn-page">
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Settings</div>
        <div style={{ border: "1px solid var(--nn-border)", borderRadius: 6, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "var(--nn-text-tertiary)", textTransform: "uppercase", letterSpacing: 1 }}>Account</div>
          <div style={{ margin: "8px 0" }}><strong>Email:</strong> {user?.user_email}</div>
          <div style={{ margin: "8px 0" }}><strong>Display name:</strong> {user?.user_display_name}</div>
          <div style={{ margin: "8px 0" }}><strong>User ID:</strong> {user?.user_id}</div>
        </div>
        <button className="nn-btn-primary" onClick={logout}>Log out</button>
      </div>
    </div>
  );
}
