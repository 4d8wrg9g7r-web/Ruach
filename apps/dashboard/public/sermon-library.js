(function () {
  "use strict";

  // Sermon library embed loader. Unlike widget-loader.js (a floating launcher), this
  // mounts an inline, filterable message archive into the host page's own layout --
  // meant for a church's sermon page, replacing a site builder's limited sermon
  // engine. Usage:
  //
  //   <div id="ruach-sermon-library"></div>
  //   <script src="https://<app>/sermon-library.js" data-widget-id="<publicWidgetId>" defer></script>
  //
  // Optional attributes on the script tag:
  //   data-target="#some-element"  mount somewhere other than #ruach-sermon-library
  //   data-chat="off"               hide the "Not sure where to start?" chat box
  //
  // Without a matching target element, the library is inserted right where the
  // script tag sits. Like widget-loader.js, this never touches host-page CSS and
  // fails silently. The iframe grows to fit its content via a postMessage from the
  // embed page, so the host page scrolls naturally with no nested scrollbar.

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

  function mount() {
    var selector = currentScript.getAttribute("data-target") || "#ruach-sermon-library";
    var container = null;
    try {
      container = document.querySelector(selector);
    } catch (e) {
      container = null;
    }
    if (!container) {
      container = document.createElement("div");
      if (currentScript.parentNode) currentScript.parentNode.insertBefore(container, currentScript);
      else return;
    }
    if (container.getAttribute("data-ruach-mounted") === "true") return;
    container.setAttribute("data-ruach-mounted", "true");

    var src =
      origin +
      "/widget/library/" +
      encodeURIComponent(widgetId) +
      "?host=" +
      encodeURIComponent(window.location.hostname) +
      (currentScript.getAttribute("data-chat") === "off" ? "&chat=off" : "");

    var iframe = document.createElement("iframe");
    iframe.title = "Sermon library";
    iframe.src = src;
    iframe.setAttribute("loading", "lazy");
    iframe.style.width = "100%";
    iframe.style.border = "none";
    iframe.style.display = "block";
    // Starting height until the embed reports its real one.
    iframe.style.height = "900px";
    container.appendChild(iframe);

    window.addEventListener("message", function (event) {
      if (event.origin !== origin || event.source !== iframe.contentWindow) return;
      var data = event.data;
      if (data && data.type === "ruach:library-height" && typeof data.height === "number" && data.height > 0) {
        iframe.style.height = Math.ceil(data.height) + "px";
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
