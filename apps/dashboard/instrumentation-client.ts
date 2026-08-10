import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0,
  // Chrome's internal font-loading machinery (next/font's self-hosted Google Fonts
  // @font-face fetch) surfaces a failed request as an unhandled promise rejection --
  // DOMException code 19 (NETWORK_ERR), message "NetworkError: A network error
  // occurred." -- when a visitor's browser drops the font fetch mid-request (flaky
  // connection, VPN, or an extension interfering with the subresource fetch). It's
  // browser-side noise with no app code behind it (see RUACH-2), not a real bug.
  ignoreErrors: ["NetworkError: A network error occurred."],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
