export type DataBackend = "wordpress";

export function getActiveDataBackend(): DataBackend {
  return "wordpress";
}

export function isWordPressBackend(): boolean {
  return true;
}
