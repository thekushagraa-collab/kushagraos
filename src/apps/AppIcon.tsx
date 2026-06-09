/* ============================================================================
   AppIcon — KushagraOS's own line-icon set, one per app, matched to function.
   Single 24×24 grid, 1.6 stroke, `currentColor` so each icon inherits the
   surrounding text/accent color and both themes. These are our own geometric
   marks (differentiation mandate) — not OS icon clones.
   ========================================================================== */

import type { AppId } from "../lib/store";

type Props = { id: AppId; className?: string };

const COMMON = {
  width: "100%",
  height: "100%",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Each icon is a small set of paths inside the shared 24×24 frame. */
const PATHS: Record<AppId, React.ReactNode> = {
  // About — operator / person
  about: (
    <>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  // Capabilities — connected nodes (a graph of services)
  capabilities: (
    <>
      <circle cx="6" cy="7" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="12" cy="17" r="2" />
      <path d="M7.6 8.4 10.6 15.4M16.6 7.5 13.2 15.6M8 7h8" />
    </>
  ),
  // Work — briefcase
  work: (
    <>
      <rect x="3.5" y="7.5" width="17" height="11" rx="2" />
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3.5 12h17" />
    </>
  ),
  // Origin — changelog timeline / branch
  origin: (
    <>
      <path d="M7 4v16" />
      <circle cx="7" cy="8" r="1.6" />
      <circle cx="7" cy="16" r="1.6" />
      <path d="M8.6 8h4a3 3 0 0 1 3 3v0M15.6 11h2" />
    </>
  ),
  // Telemetry — activity pulse (ECG)
  telemetry: (
    <path d="M3 13h3l2-6 3.5 11L16 9l1.5 4H21" />
  ),
  // Vision — eye
  vision: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  // Contact — send / paper plane
  contact: (
    <path d="M21 4 3.5 11.2l6.4 2.1M21 4l-5.2 16-3.4-7.3M21 4 11.9 12.8" />
  ),
  // Studio (Automation Center) — agent chip / CPU
  studio: (
    <>
      <rect x="7.5" y="7.5" width="9" height="9" rx="1.6" />
      <circle cx="12" cy="12" r="1.7" />
      <path d="M10 4v2.5M14 4v2.5M10 17.5V20M14 17.5V20M4 10h2.5M4 14h2.5M17.5 10H20M17.5 14H20" />
    </>
  ),
  // AI Lab — beaker / flask
  lab: (
    <>
      <path d="M9.5 4h5M10 4v5.5L5.7 17a2 2 0 0 0 1.8 3h9a2 2 0 0 0 1.8-3L14 9.5V4" />
      <path d="M8 14.5h8" />
    </>
  ),
  // Marketplace — storefront
  market: (
    <>
      <path d="M4 9.5 5.2 5h13.6L20 9.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-4 0Z" />
      <path d="M5 11v8h14v-8M10 19v-4.5h4V19" />
    </>
  ),
  // Client Mode — clipboard / scope + check
  client: (
    <>
      <rect x="5.5" y="4.5" width="13" height="16" rx="2" />
      <path d="M9 4.5h6v2.5H9zM8.5 12l2 2 4-4.5" />
    </>
  ),
  // Files — document
  files: (
    <>
      <path d="M7 3.5h7L18.5 8v12.5h-12V3.5Z" />
      <path d="M13.5 3.5V8H18M9 12.5h6M9 16h4.5" />
    </>
  ),
  // Integrations — plug / connector
  integrations: (
    <>
      <path d="M9 3.5v4M15 3.5v4" />
      <rect x="7" y="7.5" width="10" height="6" rx="1.6" />
      <path d="M12 13.5v3a3.5 3.5 0 0 1-3.5 3.5H8" />
    </>
  ),
  // Flow — workflow nodes
  flow: (
    <>
      <rect x="3.5" y="9.5" width="5" height="5" rx="1.3" />
      <rect x="15.5" y="4.5" width="5" height="5" rx="1.3" />
      <rect x="15.5" y="14.5" width="5" height="5" rx="1.3" />
      <path d="M8.5 12h3.5a1.5 1.5 0 0 1 1.5 1.5V17h2M13.5 11V8.5A1.5 1.5 0 0 1 15 7h.5" />
    </>
  ),
  // Atlas — outbound radar
  atlas: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      <circle cx="16.5" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  // Forge — content spark
  forge: (
    <>
      <path d="M12 3.5 13.7 9l5.5 1.6-4.4 3.4 1 5.5-3.8-3-3.8 3 1-5.5L4.8 10.6 10.3 9 12 3.5Z" />
    </>
  ),
  // AYRA assistant — voice waveform
  assistant: (
    <path d="M5 10v4M8.5 7v10M12 4v16M15.5 7v10M19 10v4" />
  ),
};

export function AppIcon({ id, className }: Props) {
  return (
    <svg {...COMMON} className={className}>
      {PATHS[id]}
    </svg>
  );
}
