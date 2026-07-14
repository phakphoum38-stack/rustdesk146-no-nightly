export const version = "1.4.9";

export const LANGS = { en: {} } as const;

export const KEY_MAP: Record<string, string> = {
  ArrowDown: "DownArrow",
  ArrowLeft: "LeftArrow",
  ArrowRight: "RightArrow",
  ArrowUp: "UpArrow",
  Backspace: "Backspace",
  CapsLock: "CapsLock",
  Control: "Control",
  Delete: "Delete",
  End: "End",
  Enter: "Return",
  Escape: "Escape",
  Home: "Home",
  Insert: "Insert",
  Meta: "Meta",
  NumLock: "NumLock",
  PageDown: "PageDown",
  PageUp: "PageUp",
  Pause: "Pause",
  PrintScreen: "Snapshot",
  ScrollLock: "Scroll",
  Shift: "Shift",
  " ": "Space",
  Tab: "Tab",
  Alt: "Alt",
  F1: "F1",
  F2: "F2",
  F3: "F3",
  F4: "F4",
  F5: "F5",
  F6: "F6",
  F7: "F7",
  F8: "F8",
  F9: "F9",
  F10: "F10",
  F11: "F11",
  F12: "F12"
};

export function checkIfRetry(type: string, _title: string, text: string): boolean {
  const value = `${type} ${text}`.toLowerCase();
  return value.includes("timeout") || value.includes("network") || value.includes("relay");
}
