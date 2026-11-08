import { currentAppId } from "@/features/shared/app-id";
import { getStoredWPUser } from "@/services/wp-auth";

export function appSettingsQueryKey() {
  return ["appSettings", currentAppId(), getStoredWPUser()?.user_id] as const;
}
