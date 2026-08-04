(function () {
  "use strict";

  // Loader script (brief §8). Designed to:
  //  - load asynchronously (the <script> tag itself carries `defer`)
  //  - never touch host-page global CSS -- everything here is inline-styled and
  //    scoped to elements this script creates itself
  //  - fail silently rather than throwing into the host page's console/UI
  //  - keep the iframe uncreated until the visitor actually opens the launcher, so
  //    installing the widget has near-zero cost on host-page load

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

  function mount(config) {
    var isOpen = false;
    var iframeCreated = false;
    var panelWidth = "380px";
    var panelHeight = "600px";
    var margin = "20px";
    var side = config.launcherPosition === "BOTTOM_LEFT" ? "left" : "right";

    // A search/sparkle glyph rather than a chat-bubble icon -- this is meant to read
    // as "find a resource," not "open a support chat." Hand-written SVG (no icon
    // library reachable from a dependency-free vanilla script).
    var SPARKLE_PATH =
      "M9.94 15.5a2 2 0 0 0-1.44-1.44l-6.13-1.58a.5.5 0 0 1 0-.96l6.13-1.58a2 2 0 0 0 1.44-1.44l1.58-6.13a.5.5 0 0 1 .96 0l1.58 6.13a2 2 0 0 0 1.44 1.44l6.13 1.58a.5.5 0 0 1 0 .96l-6.13 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z";

    var launcher = document.createElement("button");
    launcher.type = "button";
    launcher.setAttribute("aria-label", config.launcherLabel || "Find a resource");
    setStyles(launcher, {
      position: "fixed",
      bottom: margin,
      zIndex: "2147483000",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 18px",
      borderRadius: "16px",
      border: "none",
      color: "#ffffff",
      backgroundColor: config.primaryColor || "#161616",
      fontFamily: "system-ui, sans-serif",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
      transition: "filter 150ms ease",
    });
    launcher.style[side] = margin;

    // Brightness filter rather than computing a darker/lighter shade of
    // config.primaryColor -- works for any org's brand color with no color-math.
    launcher.addEventListener("mouseenter", function () {
      launcher.style.filter = "brightness(1.08)";
    });
    launcher.addEventListener("mouseleave", function () {
      launcher.style.filter = "none";
    });

    var svgNs = "http://www.w3.org/2000/svg";
    var icon = document.createElementNS(svgNs, "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("width", "16");
    icon.setAttribute("height", "16");
    icon.setAttribute("fill", "currentColor");
    icon.setAttribute("aria-hidden", "true");
    var iconPath = document.createElementNS(svgNs, "path");
    iconPath.setAttribute("d", SPARKLE_PATH);
    icon.appendChild(iconPath);
    launcher.appendChild(icon);

    var label = document.createElement("span");
    label.textContent = config.launcherLabel || "Find a resource";
    launcher.appendChild(label);

    var panel = document.createElement("div");
    setStyles(panel, {
      position: "fixed",
      bottom: "calc(" + margin + " + 64px)",
      width: panelWidth,
      height: panelHeight,
      maxHeight: "80vh",
      maxWidth: "90vw",
      borderRadius: "22px",
      overflow: "hidden",
      border: "1px solid rgba(20, 17, 13, 0.08)",
      boxShadow: "0 1px 2px rgba(20,17,13,0.03), 0 20px 50px rgba(20,17,13,0.18)",
      zIndex: "2147483000",
      display: "none",
    });
    panel.style[side] = margin;

    function setOpen(next) {
      isOpen = next;
      panel.style.display = isOpen ? "block" : "none";
      if (isOpen && !iframeCreated) {
        var iframe = document.createElement("iframe");
        iframe.title = config.assistantName || "Resource assistant";
        var embedUrl = origin + "/widget/embed/" + encodeURIComponent(widgetId) + "?host=" + encodeURIComponent(hostname);
        iframe.src = embedUrl;
        setStyles(iframe, { width: "100%", height: "100%", border: "none" });
        panel.appendChild(iframe);
        iframeCreated = true;
      }
    }

    launcher.addEventListener("click", function () {
      setOpen(!isOpen);
    });

    // The embed page's header close button posts this so the launcher (which owns
    // the panel's open/closed state) can hide it -- the iframe can't reach across
    // origins to toggle its own wrapper's display style directly.
    window.addEventListener("message", function (event) {
      if (event.data && event.data.type === "ruach:close") {
        setOpen(false);
      }
    });

    document.body.appendChild(panel);
    document.body.appendChild(launcher);
  }

  function setStyles(el, styles) {
    for (var key in styles) {
      if (Object.prototype.hasOwnProperty.call(styles, key)) {
        el.style[key] = styles[key];
      }
    }
  }
})();
