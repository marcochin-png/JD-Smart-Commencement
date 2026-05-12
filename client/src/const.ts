export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

// Typography scale aligned to the compact hierarchy used on Home.tsx.
export const homeTypography = {
  pageTitle: "text-xl font-bold text-slate-900",
  subtitle: "text-sm text-slate-500 leading-relaxed",
  sectionLabel: "text-xs font-semibold uppercase tracking-wider text-slate-500",
  sectionHeading: "text-base font-semibold text-slate-800",
  cardHeading: "text-sm font-semibold text-slate-900",
  body: "text-sm text-slate-700 leading-relaxed",
  bodyMuted: "text-sm text-slate-600 leading-relaxed",
  helper: "text-xs text-slate-500 leading-relaxed",
  meta: "text-xs text-slate-600",
  button: "text-sm font-semibold",
  table: "text-sm text-slate-700",
  documentEyebrow: "text-sm font-bold text-slate-900 uppercase tracking-wide",
  documentTitle: "text-base font-semibold text-slate-900",
  documentSectionTitle: "text-base font-semibold underline text-slate-900",
  documentBody: "text-sm text-slate-900 leading-relaxed",
  documentHelper: "text-xs text-slate-600 leading-relaxed",
  documentMeta: "text-sm text-slate-600",
} as const;

export const homeTypographyScale = {
  pageTitle: "1.25rem",
  subtitle: "0.875rem",
  sectionHeading: "1rem",
  cardHeading: "0.875rem",
  body: "0.875rem",
  helper: "0.75rem",
  button: "0.875rem",
  metadata: "0.75rem",
} as const;

// Officer workflow typography uses the Home hierarchy but one readable step larger
// for denser back-office cards and document previews.
export const officerTypography = {
  pageTitle: "text-2xl font-bold text-slate-900",
  subtitle: "text-base text-slate-500 leading-relaxed",
  sectionLabel: "text-sm font-semibold uppercase tracking-wider text-slate-500",
  sectionHeading: "text-lg font-semibold text-slate-800",
  cardHeading: "text-base font-semibold text-slate-900",
  body: "text-base text-slate-700 leading-relaxed",
  bodyMuted: "text-base text-slate-600 leading-relaxed",
  helper: "text-sm text-slate-500 leading-relaxed",
  meta: "text-sm text-slate-600",
  button: "text-base font-semibold",
  table: "text-base text-slate-700",
  documentEyebrow: "text-base font-bold text-slate-900 uppercase tracking-wide",
  documentTitle: "text-lg font-semibold text-slate-900",
  documentSectionTitle: "text-base font-semibold underline text-slate-900",
  documentBody: "text-base text-slate-900 leading-7",
  documentHelper: "text-sm text-slate-600 leading-relaxed",
  documentMeta: "text-sm text-slate-600",
} as const;

export const officerWorkflowContainer = "max-w-[1400px] mx-auto px-6 md:px-10" as const;

export const officerWorkbenchStyles = {
  pageFrame: "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.82),rgba(240,245,250,0.96)_34%,rgba(234,241,248,1)_100%)]",
  sectionCard: "bg-white/94 rounded-[24px] border border-slate-200/90 shadow-[0_14px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm",
  softPanel: "rounded-2xl border border-slate-200/90 bg-[linear-gradient(180deg,#f8fbff,#f1f6fb)]",
  badge: "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
} as const;
