import { Navigate } from "@/lib/router-compat";

// Old address: becoming a caregiver now happens on the caregiver settings page.
export default function BecomeCaregiver() {
  return <Navigate to="/caregiver-setting" replace />;
}
