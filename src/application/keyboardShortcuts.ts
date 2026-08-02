export type ShortcutAction = "inspect" | "apply" | "start_job";
export function shortcutAction(event: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "shiftKey">): ShortcutAction | null {
  if (!(event.ctrlKey || event.metaKey) || event.shiftKey) return null;
  if (event.key.toLowerCase() === "i") return "inspect";
  if (event.key.toLowerCase() === "enter") return "apply";
  if (event.key.toLowerCase() === "j") return "start_job";
  return null;
}
