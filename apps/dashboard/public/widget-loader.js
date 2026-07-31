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

    var launcher = document.createElement("button");
    launcher.type = "button";
    launcher.textContent = config.launcherLabel || "Ask a question";
    launcher.setAttribute("aria-label", config.launcherLabel || "Open resource assistant");
    setStyles(launcher, {
      position: "fixed",
      bottom: margin,
      zIndex: "2147483000",
      padding: "12px 18px",
      borderRadius: "999px",
      border: "none",
      color: "#ffffff",
      backgroundColor: config.primaryColor || "#2563EB",
      fontFamily: "system-ui, sans-serif",
      fontSize: "14px",
      cursor: "pointer",
      boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
    });
    launcher.style[side] = margin;

    var panel = document.createElement("div");
    setStyles(panel, {
      position: "fixed",
      bottom: "calc(" + margin + " + 60px)",
      width: panelWidth,
      height: panelHeight,
      maxHeight: "80vh",
      maxWidth: "90vw",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
      zIndex: "2147483000",
      display: "none",
    });
    panel.style[side] = margin;

    launcher.addEventListener("click", function () {
      isOpen = !isOpen;
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
