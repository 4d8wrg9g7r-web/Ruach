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
  //
  // "Error invoking postMessage: Java object is gone" comes from
  // navigation_performance_logger_android, a script Meta's Android in-app browser
  // (Facebook/Instagram/Messenger) injects into every page it opens to report
  // navigation timing back to the native app over a JS<->Java bridge. Fires when a
  // visitor closes/navigates away from that in-app browser while its own
  // beforeunload handler is still mid-flight -- a race entirely inside Meta's
  // injected instrumentation, not app code.
  ignoreErrors: ["NetworkError: A network error occurred.", "Error invoking postMessage: Java object is gone"],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
