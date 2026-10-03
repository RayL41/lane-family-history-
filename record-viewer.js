(function () {
  "use strict";

  var allowed = /\.(?:jpe?g|gif|png|bmp|webp|pdf)(?:[?#].*)?$/i;
  var overlay = null;
  var oldOverflow = "";
  var oldScrollY = 0;

  function isLocalRecordLink(link) {
    var raw = link.getAttribute("href") || "";
    if (!allowed.test(raw)) return false;
    if (/^(?:mailto:|tel:|javascript:|data:|#)/i.test(raw)) return false;
    try {
      return new URL(link.href, window.location.href).origin === window.location.origin;
    } catch (e) {
      return true;
    }
  }

  function closeViewer() {
    if (!overlay) return;
    document.body.removeChild(overlay);
    overlay = null;
    document.documentElement.style.overflow = oldOverflow;
    window.scrollTo(0, oldScrollY);
  }

  function openViewer(link) {
    closeViewer();
    oldScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    oldOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    overlay = document.createElement("div");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.style.cssText = "position:fixed;z-index:2147483647;left:0;top:0;width:100%;height:100%;background:#fff;color:#111;display:flex;flex-direction:column;";

    var bar = document.createElement("div");
    bar.style.cssText = "flex:0 0 auto;padding:10px;background:#f2f2f2;border-bottom:2px solid #555;font:normal 18px Arial,sans-serif;display:flex;align-items:center;gap:12px;";

    var close = document.createElement("button");
    close.type = "button";
    close.innerHTML = "&larr; RETURN TO PREVIOUS PAGE";
    close.style.cssText = "font:bold 18px Arial,sans-serif;padding:10px 16px;cursor:pointer;background:#fff;border:2px solid #222;border-radius:4px;";
    close.onclick = closeViewer;

    var title = document.createElement("span");
    var cleanUrl = link.href.split("#")[0].split("?")[0];
    try { title.textContent = decodeURIComponent(cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1)); }
    catch (e) { title.textContent = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1); }

    bar.appendChild(close);
    bar.appendChild(title);
    overlay.appendChild(bar);

    var content = document.createElement("div");
    content.style.cssText = "flex:1 1 auto;min-height:0;overflow:auto;text-align:center;background:#fff;";

    if (/\.pdf(?:[?#].*)?$/i.test(link.href)) {
      var frame = document.createElement("iframe");
      frame.src = link.href;
      frame.title = title.textContent;
      frame.style.cssText = "display:block;width:100%;height:100%;border:0;";
      content.appendChild(frame);
    } else {
      var image = document.createElement("img");
      image.src = link.href;
      image.alt = title.textContent;
      image.style.cssText = "display:block;max-width:100%;height:auto;margin:0 auto;";
      content.appendChild(image);
    }

    overlay.appendChild(content);
    document.body.appendChild(overlay);
    close.focus();
  }

  document.addEventListener("click", function (event) {
    var node = event.target;
    while (node && node !== document && node.tagName !== "A") node = node.parentNode;
    if (!node || node.tagName !== "A" || !isLocalRecordLink(node)) return;
    event.preventDefault();
    openViewer(node);
  }, false);

  document.addEventListener("keydown", function (event) {
    if (overlay && (event.key === "Escape" || event.keyCode === 27)) closeViewer();
  }, false);
}());