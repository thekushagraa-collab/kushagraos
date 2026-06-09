/* ============================================================================
   KushagraOS — theme helper
   Day/Night duality: "night" = Nocturne (graphite), "day" = Atelier (ivory).
   Single source of truth for applying + persisting the theme on <html>.
   ========================================================================== */

export type Theme = "night" | "day";

export const THEME_STORAGE_KEY = "kos-theme";

const THEME_COLOR: Record<Theme, string> = {
  night: "#08080C",
  day: "#F4F2EC",
};

/** Read the theme the no-FOUC bootstrap (index.html) already committed to. */
export function getInitialTheme(): Theme {
  if (typeof document !== "undefined") {
    const fromDom = document.documentElement.getAttribute("data-theme");
    if (fromDom === "night" || fromDom === "day") return fromDom;
  }
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "day"
      : "night";
  }
  return "night";
}

/** Apply a theme to the document and persist the choice. Side-effect only. */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);

  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]:not([media])',
  );
  if (meta) meta.content = THEME_COLOR[theme];

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* storage unavailable (private mode) — non-fatal */
  }
}

export const nextTheme = (theme: Theme): Theme =>
  theme === "night" ? "day" : "night";
