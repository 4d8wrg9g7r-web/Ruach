(function () {
  "use strict";

  // Loader script (brief §8). Designed to:
  //  - load asynchronously (the <script> tag itself carries `defer`)
  //  - never touch host-page global CSS -- everything here is inline-styled and
  //    scoped to elements this script creates itself
  //  - fail silently rather than throwing into the host page's console/UI
  //  - keep the iframe uncreated until the visitor actually opens the launcher, so
  //    installing the widget has near-zero cost on host-page load
  //
  // Ten shell treatments (config.displayStyle), one buildXShell function each --
  // launcher position/shape, panel position/size, and the open/close animation all
  // vary; the chat content inside the iframe never does. Every shell shares
  // createIframe/listenForClose/setOpenClass so the actual behavior (postMessage
  // close, mobile full-screen collapse) can't drift between styles.

  var currentScript = document.currentScript;
  if (!currentScript) return;

  var widgetId = currentScript.getAttribute("data-widget-id");
  if (!widgetId) return;

  var origin;
  try {
    origin = new URL(currentScript.src).origin;
  } catch (e) {
    return;
  }

  var hostname = window.location.hostname;
  var configUrl = origin + "/api/widget/" + encodeURIComponent(widgetId) + "/config?host=" + encodeURIComponent(hostname);

  fetch(configUrl)
    .then(function (res) {
      if (!res.ok) return null;
      return res.json();
    })
    .then(function (config) {
      if (!config) return;
      mount(config);
    })
    .catch(function () {
      // Fail gracefully -- no launcher renders if the widget is unavailable.
    });

  // Real stylesheet + media query rather than a single inline clamp() -- a lone
  // clamp() tuned to look right on desktop (a small vw coefficient, since desktop
  // viewports are huge) barely moves at all across the *mobile* width range, so
  // small phones all got pinned to the same fixed floor regardless of how small
  // the screen actually was. This gives phones their own genuinely proportional
  // rule instead of inheriting desktop's. dvh (not vh) so a phone's address-bar
  // chrome doesn't inflate how big "80% of the viewport" actually renders; the
  // plain vh declaration first is a fallback for browsers that don't support dvh
  // (an unsupported later declaration is just ignored, keeping the earlier one).
  //
  // On mobile, a small floating panel doesn't work well -- the fixed positioning
  // + a nested-iframe vh-computation bug in mobile browsers made it appear to
  // drift/resize on its own. Rather than fight that, phones get a real full-screen
  // overlay instead (matches how most embeddable chat widgets behave on mobile).
  // Every shell's panel shares the .ruach-widget-panel class specifically so this
  // one override applies uniformly regardless of which of the 10 styles is active
  // -- INLINE is the only one that skips it (see buildInlineShell), since that
  // panel already lives in the page's own layout, not as an overlay.
  var STYLE_ID = "ruach-widget-panel-styles";
  if (!document.getElementById(STYLE_ID)) {
    var styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    styleEl.textContent =
      ".ruach-widget-panel{width:clamp(380px,26vw,440px);height:clamp(480px,65vh,720px);height:clamp(480px,65dvh,720px);max-width:90vw;max-height:80vh;max-height:80dvh;}" +
      "@media (max-width:640px){.ruach-widget-panel{" +
      "top:0!important;right:0!important;bottom:0!important;left:0!important;" +
      "width:100vw!important;height:100vh!important;height:100dvh!important;" +
      "max-width:100vw!important;max-height:100vh!important;max-height:100dvh!important;" +
      "border-radius:0!important;border:none!important;box-shadow:none!important;" +
      "transform:none!important;opacity:1!important;pointer-events:auto!important;display:none;" +
      "}.ruach-widget-panel[data-mobile-open='true']{display:flex!important;}}";
    document.head.appendChild(styleEl);
  }

  function isMobilePanel() {
    return window.matchMedia ? window.matchMedia("(max-width:640px)").matches : window.innerWidth <= 640;
  }

  var Z = "2147483000";

  function setStyles(el, styles) {
    for (var key in styles) {
      if (Object.prototype.hasOwnProperty.call(styles, key)) {
        el.style[key] = styles[key];
      }
    }
  }

  function createIframe(config) {
    var iframe = document.createElement("iframe");
    iframe.title = config.assistantName || "Resource assistant";
    iframe.src = origin + "/widget/embed/" + encodeURIComponent(widgetId) + "?host=" + encodeURIComponent(hostname);
    setStyles(iframe, { width: "100%", height: "100%", border: "none", flex: "1", minHeight: "0" });
    return iframe;
  }

  // The embed page's header close button posts this so the launcher (which owns
  // the panel's open/closed state) can hide it -- the iframe can't reach across
  // origins to toggle its own wrapper's display style directly.
  function listenForClose(setOpen) {
    window.addEventListener("message", function (event) {
      if (event.data && event.data.type === "ruach:close") setOpen(false);
    });
  }

  // Locks the host page's own scroll while the full-screen mobile panel is open --
  // without this, scrolling the host page underneath a `position:fixed` overlay
  // triggers a well-known iOS Safari bug where fixed elements visibly lag/jump
  // during the scroll instead of staying put. Shared by every overlay-panel shell.
  function lockMobileScroll(open) {
    if (isMobilePanel()) document.body.style.overflow = open ? "hidden" : "";
  }

  var SVG_NS = "http://www.w3.org/2000/svg";
  // A search/sparkle glyph rather than a chat-bubble icon -- this is meant to read
  // as "find a resource," not "open a support chat."
  var SPARKLE_PATH =
    "M9.94 15.5a2 2 0 0 0-1.44-1.44l-6.13-1.58a.5.5 0 0 1 0-.96l6.13-1.58a2 2 0 0 0 1.44-1.44l1.58-6.13a.5.5 0 0 1 .96 0l1.58 6.13a2 2 0 0 0 1.44 1.44l6.13 1.58a.5.5 0 0 1 0 .96l-6.13 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z";

  function sparkleIcon(size) {
    var icon = document.createElementNS(SVG_NS, "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("width", String(size));
    icon.setAttribute("height", String(size));
    icon.setAttribute("fill", "currentColor");
    icon.setAttribute("aria-hidden", "true");
    var path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", SPARKLE_PATH);
    icon.appendChild(path);
    return icon;
  }

  function brightenOnHover(el) {
    el.addEventListener("mouseenter", function () {
      el.style.filter = "brightness(1.08)";
    });
    el.addEventListener("mouseleave", function () {
      el.style.filter = "none";
    });
  }

  function accentGradientButton(config) {
    var btn = document.createElement("button");
    btn.type = "button";
    setStyles(btn, {
      border: "none",
      color: "#ffffff",
      background: config.primaryColor || "#161616",
      fontFamily: "system-ui, sans-serif",
      cursor: "pointer",
      transition: "filter 150ms ease",
    });
    brightenOnHover(btn);
    return btn;
  }

  function mount(config) {
    var side = config.launcherPosition === "BOTTOM_LEFT" ? "left" : "right";
    var builders = {
      BUBBLE: buildBubbleShell,
      GREETER: buildGreeterShell,
      SLIDE: buildSlideShell,
      TAB: buildTabShell,
      INLINE: buildInlineShell,
      DOCK: buildDockShell,
      PALETTE: buildPaletteShell,
      SHEET: buildSheetShell,
      RIBBON: buildRibbonShell,
      LINK: buildLinkShell,
    };
    var build = builders[config.displayStyle] || buildBubbleShell;
    build(config, side);
  }

  // ---------------------------------------------------------------------------
  // BUBBLE -- the original/default shell: a labeled pill, bottom corner, opens a
  // floating card anchored just above it.
  // ---------------------------------------------------------------------------
  function buildBubbleShell(config, side) {
    var margin = "20px";
    var isOpen = false;

    var launcher = accentGradientButton(config);
    launcher.setAttribute("aria-label", config.launcherLabel || "Find a resource");
    setStyles(launcher, {
      position: "fixed",
      bottom: margin,
      zIndex: Z,
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 18px",
      borderRadius: "16px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
    });
    launcher.style[side] = margin;
    launcher.appendChild(sparkleIcon(16));
    var label = document.createElement("span");
    label.textContent = config.launcherLabel || "Find a resource";
    launcher.appendChild(label);

    var panel = document.createElement("div");
    panel.className = "ruach-widget-panel";
    setStyles(panel, {
      position: "fixed",
      bottom: "calc(" + margin + " + 64px)",
      borderRadius: "22px",
      overflow: "hidden",
      border: "1px solid rgba(20, 17, 13, 0.08)",
      boxShadow: "0 1px 2px rgba(20,17,13,0.03), 0 20px 50px rgba(20,17,13,0.18)",
      zIndex: Z,
      display: "none",
    });
    panel.style[side] = margin;

    var iframeCreated = false;
    function setOpen(next) {
      isOpen = next;
      panel.style.display = isOpen ? "flex" : "none";
      panel.setAttribute("data-mobile-open", isOpen ? "true" : "false");
      launcher.style.display = isOpen ? "none" : "inline-flex";
      lockMobileScroll(isOpen);
      if (isOpen && !iframeCreated) {
        panel.appendChild(createIframe(config));
        iframeCreated = true;
      }
    }
    launcher.addEventListener("click", function () {
      setOpen(!isOpen);
    });
    listenForClose(setOpen);

    document.body.appendChild(panel);
    document.body.appendChild(launcher);
  }

  // ---------------------------------------------------------------------------
  // GREETER -- the bubble shell plus a persistent speech-bubble callout inviting
  // the first question; the callout hides once the panel is open.
  // ---------------------------------------------------------------------------
  function buildGreeterShell(config, side) {
    var margin = "20px";
    var isOpen = false;

    var greeting = document.createElement("div");
    greeting.textContent = "Have a question? I can help you find what you're looking for.";
    setStyles(greeting, {
      position: "fixed",
      bottom: "calc(" + margin + " + 68px)",
      maxWidth: "220px",
      background: "#ffffff",
      border: "1px solid rgba(20,17,13,0.1)",
      borderRadius: "12px",
      boxShadow: "0 8px 20px rgba(20,17,13,0.16)",
      padding: "12px 14px",
      fontFamily: "system-ui, sans-serif",
      fontSize: "13px",
      lineHeight: "1.5",
      color: "#161616",
      zIndex: Z,
      transition: "opacity 160ms ease",
    });
    greeting.style[side === "right" ? "borderBottomRightRadius" : "borderBottomLeftRadius"] = "3px";
    greeting.style[side] = margin;

    var launcher = accentGradientButton(config);
    launcher.setAttribute("aria-label", config.launcherLabel || "Find a resource");
    setStyles(launcher, {
      position: "fixed",
      bottom: margin,
      zIndex: Z,
      width: "52px",
      height: "52px",
      borderRadius: "999px",
      fontSize: "20px",
      boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });
    launcher.style[side] = margin;
    launcher.appendChild(sparkleIcon(18));

    var panel = document.createElement("div");
    panel.className = "ruach-widget-panel";
    setStyles(panel, {
      position: "fixed",
      bottom: "calc(" + margin + " + 64px)",
      borderRadius: "22px",
      overflow: "hidden",
      border: "1px solid rgba(20, 17, 13, 0.08)",
      boxShadow: "0 1px 2px rgba(20,17,13,0.03), 0 20px 50px rgba(20,17,13,0.18)",
      zIndex: Z,
      display: "none",
    });
    panel.style[side] = margin;

    var iframeCreated = false;
    function setOpen(next) {
      isOpen = next;
      panel.style.display = isOpen ? "flex" : "none";
      panel.setAttribute("data-mobile-open", isOpen ? "true" : "false");
      greeting.style.opacity = isOpen ? "0" : "1";
      greeting.style.pointerEvents = isOpen ? "none" : "auto";
      lockMobileScroll(isOpen);
      if (isOpen && !iframeCreated) {
        panel.appendChild(createIframe(config));
        iframeCreated = true;
      }
    }
    launcher.addEventListener("click", function () {
      setOpen(!isOpen);
    });
    listenForClose(setOpen);

    document.body.appendChild(panel);
    document.body.appendChild(greeting);
    document.body.appendChild(launcher);
  }

  // ---------------------------------------------------------------------------
  // SLIDE -- a small edge tab that pulls out a full-height drawer.
  // ---------------------------------------------------------------------------
  function buildSlideShell(config) {
    var isOpen = false;

    var launcher = document.createElement("button");
    launcher.type = "button";
    launcher.setAttribute("aria-label", config.launcherLabel || "Find a resource");
    launcher.textContent = config.launcherLabel || "Ask Us";
    setStyles(launcher, {
      position: "fixed",
      right: "0",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: Z,
      writingMode: "vertical-rl",
      border: "1px solid rgba(20,17,13,0.12)",
      borderRight: "none",
      background: "#ffffff",
      color: "#161616",
      fontFamily: "system-ui, sans-serif",
      fontSize: "13px",
      fontWeight: "600",
      padding: "16px 9px",
      borderRadius: "10px 0 0 10px",
      cursor: "pointer",
      boxShadow: "-4px 0 12px rgba(20,17,13,0.08)",
    });

    var panel = document.createElement("div");
    panel.className = "ruach-widget-panel";
    setStyles(panel, {
      position: "fixed",
      right: "0",
      top: "0",
      bottom: "0",
      zIndex: Z,
      width: "min(90vw, 400px)",
      height: "auto",
      maxHeight: "none",
      borderLeft: "1px solid rgba(20,17,13,0.08)",
      boxShadow: "-20px 0 44px rgba(20,17,13,0.16)",
      display: "flex",
      transform: "translateX(100%)",
      transition: "transform 220ms ease",
    });

    var iframeCreated = false;
    function setOpen(next) {
      isOpen = next;
      panel.style.transform = isOpen ? "translateX(0)" : "translateX(100%)";
      panel.setAttribute("data-mobile-open", isOpen ? "true" : "false");
      lockMobileScroll(isOpen);
      if (isOpen && !iframeCreated) {
        panel.appendChild(createIframe(config));
        iframeCreated = true;
      }
    }
    launcher.addEventListener("click", function () {
      setOpen(!isOpen);
    });
    listenForClose(setOpen);

    document.body.appendChild(panel);
    document.body.appendChild(launcher);
  }

  // ---------------------------------------------------------------------------
  // TAB -- a vertical edge tab that pops a mid-height card beside it, not a full
  // drawer (the SLIDE shell above covers the full-height case).
  // ---------------------------------------------------------------------------
  function buildTabShell(config) {
    var isOpen = false;

    var launcher = accentGradientButton(config);
    launcher.setAttribute("aria-label", config.launcherLabel || "Find a resource");
    launcher.textContent = config.launcherLabel || "Ask Us";
    setStyles(launcher, {
      position: "fixed",
      right: "0",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: Z,
      writingMode: "vertical-rl",
      fontSize: "13px",
      fontWeight: "600",
      padding: "16px 9px",
      borderRadius: "10px 0 0 10px",
      boxShadow: "-4px 0 14px rgba(20,17,13,0.14)",
    });

    var panel = document.createElement("div");
    panel.className = "ruach-widget-panel";
    setStyles(panel, {
      position: "fixed",
      right: "0",
      top: "50%",
      zIndex: Z,
      width: "min(90vw, 400px)",
      height: "clamp(420px, 60vh, 600px)",
      maxHeight: "80vh",
      borderRadius: "18px 0 0 18px",
      border: "1px solid rgba(20,17,13,0.08)",
      boxShadow: "-18px 0 36px rgba(20,17,13,0.16)",
      display: "flex",
      transform: "translate(100%, -50%)",
      opacity: "0",
      transition: "transform 220ms ease, opacity 220ms ease",
    });

    var iframeCreated = false;
    function setOpen(next) {
      isOpen = next;
      panel.style.transform = isOpen ? "translate(0, -50%)" : "translate(100%, -50%)";
      panel.style.opacity = isOpen ? "1" : "0";
      panel.setAttribute("data-mobile-open", isOpen ? "true" : "false");
      lockMobileScroll(isOpen);
      if (isOpen && !iframeCreated) {
        panel.appendChild(createIframe(config));
        iframeCreated = true;
      }
    }
    launcher.addEventListener("click", function () {
      setOpen(!isOpen);
    });
    listenForClose(setOpen);

    document.body.appendChild(panel);
    document.body.appendChild(launcher);
  }

  // ---------------------------------------------------------------------------
  // INLINE -- no launcher/overlay at all. Mounts directly into a placeholder the
  // church adds to their own page (<div id="ruach-widget-inline">). Falls back to
  // BUBBLE (with a console warning, not a silent no-op) if that element is missing
  // -- consistent with the loader's own "fail soft, not silent" philosophy, but a
  // church that picked INLINE and forgot the div should still get a working widget.
  // ---------------------------------------------------------------------------
  function buildInlineShell(config, side) {
    var target = document.getElementById("ruach-widget-inline");
    if (!target) {
      if (window.console && console.warn) {
        console.warn('Ruach widget: displayStyle is "INLINE" but no element with id="ruach-widget-inline" was found on the page. Falling back to the corner bubble.');
      }
      buildBubbleShell(config, side);
      return;
    }
    setStyles(target, { display: "flex", flexDirection: "column", overflow: "hidden", minHeight: "480px" });
    target.appendChild(createIframe(config));
  }

  // ---------------------------------------------------------------------------
  // DOCK -- a persistent bottom bar with a real-looking input; clicking it grows
  // the dock upward into a full conversation.
  // ---------------------------------------------------------------------------
  function buildDockShell(config) {
    var isOpen = false;
    var margin = "12px";

    // Deliberately NOT .ruach-widget-panel -- that shared class's mobile override
    // hides the whole element when closed (right, for every other shell, where
    // "closed" means only a separate small launcher button remains). DOCK's bar
    // IS the launcher, a child of this panel, and must stay visible on mobile even
    // when closed -- so it gets its own sizing, including its own mobile handling
    // below via isMobilePanel(), instead of opting into that rule.
    var panel = document.createElement("div");
    setStyles(panel, {
      position: "fixed",
      left: margin,
      right: margin,
      bottom: margin,
      zIndex: Z,
      width: "auto",
      maxWidth: "480px",
      margin: "0 auto",
      height: "56px",
      maxHeight: "56px",
      borderRadius: "18px",
      border: "1px solid rgba(20,17,13,0.1)",
      boxShadow: "0 10px 28px rgba(20,17,13,0.18)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      transition: "height 220ms ease, max-height 220ms ease",
    });

    var bar = document.createElement("button");
    bar.type = "button";
    bar.setAttribute("aria-label", config.launcherLabel || "Ask a question");
    setStyles(bar, {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "0 16px",
      height: "56px",
      minHeight: "56px",
      border: "none",
      background: "#ffffff",
      cursor: "pointer",
      fontFamily: "system-ui, sans-serif",
      textAlign: "left",
    });
    var barIcon = document.createElement("span");
    barIcon.style.color = config.primaryColor || "#161616";
    barIcon.appendChild(sparkleIcon(15));
    var barLabel = document.createElement("span");
    barLabel.textContent = config.inputPlaceholder || "Ask a question...";
    setStyles(barLabel, { flex: "1", fontSize: "14px", color: "#696661" });
    bar.appendChild(barIcon);
    bar.appendChild(barLabel);

    var iframeCreated = false;
    function setOpen(next) {
      isOpen = next;
      var mobile = isMobilePanel();
      setStyles(panel, {
        height: isOpen ? (mobile ? "80vh" : "clamp(480px,65vh,640px)") : "56px",
        maxHeight: isOpen ? (mobile ? "80dvh" : "80vh") : "56px",
        left: mobile ? "8px" : margin,
        right: mobile ? "8px" : margin,
        bottom: mobile ? "8px" : margin,
        maxWidth: mobile ? "none" : "480px",
      });
      bar.style.display = isOpen ? "none" : "flex";
      lockMobileScroll(isOpen);
      if (isOpen && !iframeCreated) {
        panel.appendChild(createIframe(config));
        iframeCreated = true;
      }
    }
    bar.addEventListener("click", function () {
      setOpen(!isOpen);
    });
    listenForClose(setOpen);

    panel.appendChild(bar);
    document.body.appendChild(panel);
  }

  // ---------------------------------------------------------------------------
  // PALETTE -- a minimal pill opens a centered, spotlight-style dialog over a
  // dimmed page.
  // ---------------------------------------------------------------------------
  function buildPaletteShell(config) {
    var isOpen = false;

    var launcher = document.createElement("button");
    launcher.type = "button";
    setStyles(launcher, {
      position: "fixed",
      right: "20px",
      bottom: "20px",
      zIndex: Z,
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      border: "1px solid rgba(20,17,13,0.14)",
      background: "#ffffff",
      color: "#696661",
      borderRadius: "999px",
      padding: "10px 16px",
      fontFamily: "system-ui, sans-serif",
      fontSize: "13px",
      cursor: "pointer",
      boxShadow: "0 4px 14px rgba(20,17,13,0.12)",
    });
    launcher.textContent = config.launcherLabel || "Ask a question";

    var scrim = document.createElement("div");
    setStyles(scrim, {
      position: "fixed",
      inset: "0",
      zIndex: Z,
      background: "rgba(20,17,13,0.4)",
      opacity: "0",
      pointerEvents: "none",
      transition: "opacity 180ms ease",
    });

    var panel = document.createElement("div");
    panel.className = "ruach-widget-panel";
    setStyles(panel, {
      position: "fixed",
      left: "50%",
      top: "10vh",
      zIndex: Z,
      borderRadius: "18px",
      border: "1px solid rgba(20,17,13,0.08)",
      boxShadow: "0 30px 70px rgba(20,17,13,0.34)",
      display: "flex",
      transform: "translate(-50%, -8px) scale(0.97)",
      opacity: "0",
      pointerEvents: "none",
      transition: "transform 180ms ease, opacity 180ms ease",
    });

    var iframeCreated = false;
    function setOpen(next) {
      isOpen = next;
      scrim.style.opacity = isOpen ? "1" : "0";
      scrim.style.pointerEvents = isOpen ? "auto" : "none";
      setStyles(panel, {
        transform: isOpen ? "translate(-50%, 0) scale(1)" : "translate(-50%, -8px) scale(0.97)",
        opacity: isOpen ? "1" : "0",
        pointerEvents: isOpen ? "auto" : "none",
      });
      panel.setAttribute("data-mobile-open", isOpen ? "true" : "false");
      launcher.style.display = isOpen ? "none" : "inline-flex";
      lockMobileScroll(isOpen);
      if (isOpen && !iframeCreated) {
        panel.appendChild(createIframe(config));
        iframeCreated = true;
      }
    }
    launcher.addEventListener("click", function () {
      setOpen(true);
    });
    scrim.addEventListener("click", function () {
      setOpen(false);
    });
    listenForClose(setOpen);

    document.body.appendChild(scrim);
    document.body.appendChild(panel);
    document.body.appendChild(launcher);
  }

  // ---------------------------------------------------------------------------
  // SHEET -- opens as a full-viewport, app-style sheet rising from the bottom.
  // ---------------------------------------------------------------------------
  function buildSheetShell(config, side) {
    var isOpen = false;
    var margin = "20px";

    var launcher = accentGradientButton(config);
    launcher.textContent = config.launcherLabel || "Chat with us";
    setStyles(launcher, {
      position: "fixed",
      bottom: margin,
      zIndex: Z,
      borderRadius: "999px",
      fontSize: "13px",
      fontWeight: "600",
      padding: "12px 20px",
      boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
    });
    launcher.style[side] = margin;

    var panel = document.createElement("div");
    panel.className = "ruach-widget-panel";
    setStyles(panel, {
      position: "fixed",
      inset: "0",
      zIndex: Z,
      width: "100vw",
      height: "100dvh",
      maxWidth: "100vw",
      maxHeight: "100dvh",
      borderRadius: "0",
      display: "flex",
      transform: "translateY(100%)",
      transition: "transform 240ms cubic-bezier(.22,1,.36,1)",
    });

    var iframeCreated = false;
    function setOpen(next) {
      isOpen = next;
      panel.style.transform = isOpen ? "translateY(0)" : "translateY(100%)";
      panel.setAttribute("data-mobile-open", isOpen ? "true" : "false");
      launcher.style.display = isOpen ? "none" : "inline-flex";
      lockMobileScroll(isOpen);
      if (isOpen && !iframeCreated) {
        panel.appendChild(createIframe(config));
        iframeCreated = true;
      }
    }
    launcher.addEventListener("click", function () {
      setOpen(!isOpen);
    });
    listenForClose(setOpen);

    document.body.appendChild(panel);
    document.body.appendChild(launcher);
  }

  // ---------------------------------------------------------------------------
  // RIBBON -- a full-width strip across the top of the page; opening drops a
  // panel down from beneath it.
  // ---------------------------------------------------------------------------
  function buildRibbonShell(config) {
    var isOpen = false;

    var launcher = document.createElement("button");
    launcher.type = "button";
    launcher.textContent = config.launcherLabel || "Have a question? Ask →";
    setStyles(launcher, {
      position: "fixed",
      left: "0",
      right: "0",
      top: "0",
      zIndex: Z,
      border: "none",
      borderBottom: "1px solid rgba(20,17,13,0.1)",
      background: "#f1efeb",
      color: "#815122",
      fontFamily: "system-ui, sans-serif",
      fontSize: "13px",
      fontWeight: "600",
      padding: "12px",
      cursor: "pointer",
      width: "100%",
    });

    var panel = document.createElement("div");
    panel.className = "ruach-widget-panel";
    setStyles(panel, {
      position: "fixed",
      left: "0",
      right: "0",
      top: "45px",
      zIndex: Z,
      width: "100%",
      height: "auto",
      maxWidth: "100%",
      maxHeight: "0",
      borderRadius: "0",
      borderBottom: "1px solid rgba(20,17,13,0.08)",
      boxShadow: "0 16px 34px rgba(20,17,13,0.14)",
      display: "flex",
      overflow: "hidden",
      transition: "max-height 240ms ease",
    });

    var iframeCreated = false;
    function setOpen(next) {
      isOpen = next;
      panel.style.maxHeight = isOpen ? "min(70vh, 560px)" : "0px";
      panel.setAttribute("data-mobile-open", isOpen ? "true" : "false");
      lockMobileScroll(isOpen);
      if (isOpen && !iframeCreated) {
        panel.appendChild(createIframe(config));
        iframeCreated = true;
      }
    }
    launcher.addEventListener("click", function () {
      setOpen(!isOpen);
    });
    listenForClose(setOpen);

    document.body.appendChild(launcher);
    document.body.appendChild(panel);
  }

  // ---------------------------------------------------------------------------
  // LINK -- the lightest footprint: quiet underlined text, no icon or bubble
  // chrome, opening a small, understated popover.
  // ---------------------------------------------------------------------------
  function buildLinkShell(config, side) {
    var margin = "16px";
    var isOpen = false;

    var launcher = document.createElement("button");
    launcher.type = "button";
    launcher.textContent = config.launcherLabel || "Questions? Ask here.";
    setStyles(launcher, {
      position: "fixed",
      bottom: margin,
      zIndex: Z,
      border: "none",
      borderBottom: "1px solid rgba(20,17,13,0.3)",
      background: "none",
      color: "#696661",
      fontFamily: "system-ui, sans-serif",
      fontSize: "13px",
      padding: "3px 1px",
      cursor: "pointer",
    });
    launcher.style[side] = margin;

    var panel = document.createElement("div");
    panel.className = "ruach-widget-panel";
    setStyles(panel, {
      position: "fixed",
      bottom: "calc(" + margin + " + 30px)",
      zIndex: Z,
      width: "300px",
      height: "360px",
      borderRadius: "12px",
      border: "1px solid rgba(20,17,13,0.1)",
      boxShadow: "0 14px 32px rgba(20,17,13,0.16)",
      display: "flex",
      opacity: "0",
      transform: "translateY(6px)",
      pointerEvents: "none",
      transition: "opacity 150ms ease, transform 150ms ease",
    });
    panel.style[side] = margin;

    var iframeCreated = false;
    function setOpen(next) {
      isOpen = next;
      panel.style.opacity = isOpen ? "1" : "0";
      panel.style.transform = isOpen ? "translateY(0)" : "translateY(6px)";
      panel.style.pointerEvents = isOpen ? "auto" : "none";
      panel.setAttribute("data-mobile-open", isOpen ? "true" : "false");
      lockMobileScroll(isOpen);
      if (isOpen && !iframeCreated) {
        panel.appendChild(createIframe(config));
        iframeCreated = true;
      }
    }
    launcher.addEventListener("click", function () {
      setOpen(!isOpen);
    });
    listenForClose(setOpen);

    document.body.appendChild(panel);
    document.body.appendChild(launcher);
  }
})();
