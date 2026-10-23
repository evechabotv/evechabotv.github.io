/* ==================================================================
 * Cardfile — main.js
 * Vanilla JavaScript only. One function per feature, guard clauses,
 * progressive enhancement: without this file every section is visible.
 * ================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var statusEl = document.querySelector("[data-action-status]");

  function announce(msg) {
    if (!statusEl) return;
    statusEl.textContent = "";
    window.setTimeout(function () { statusEl.textContent = msg; }, 30);
  }

  /* ----------------------------------------------------------------
   * Light / dark theme. The <head> script sets the initial theme from
   * localStorage or the system; this wires up the toggle.
   * ---------------------------------------------------------------- */
  function initTheme() {
    var btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;
    var meta = document.querySelector('meta[name="theme-color"]');

    function apply(theme, store) {
      root.setAttribute("data-theme", theme);
      root.setAttribute("data-bs-theme", theme);
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      if (meta) meta.setAttribute("content", theme === "dark" ? "#0e1514" : "#2b4744");
      if (store) { try { localStorage.setItem("cardfile-theme", theme); } catch (e) {} }
    }

    apply(root.getAttribute("data-theme") === "dark" ? "dark" : "light", false);
    btn.addEventListener("click", function () {
      apply(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
    });

    // Follow the system setting until the visitor picks a theme.
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onChange = function (e) {
        var stored = null;
        try { stored = localStorage.getItem("cardfile-theme"); } catch (err) {}
        if (!stored) apply(e.matches ? "dark" : "light", false);
      };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
    }
  }

  /* ----------------------------------------------------------------
   * Tabs: links become ARIA tabs. Arrow keys / Home / End move between
   * them, the URL hash keeps each section deep-linkable, and Back /
   * Forward switch sections. Without JS the links simply jump.
   * ---------------------------------------------------------------- */
  function initTabs() {
    var list = document.querySelector("[data-tablist]");
    var sheet = document.querySelector(".sheet");
    if (!list || !sheet) return;
    var tabs = Array.prototype.slice.call(list.querySelectorAll(".tab"));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute("href").slice(1)); });
    if (!tabs.length || panels.some(function (p) { return !p; })) return;

    list.setAttribute("role", "tablist");
    list.setAttribute("aria-label", "Profile sections");
    Array.prototype.forEach.call(list.children, function (li) { li.setAttribute("role", "presentation"); });
    tabs.forEach(function (tab, i) {
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panels[i].id);
      panels[i].setAttribute("role", "tabpanel");
      panels[i].setAttribute("aria-labelledby", tab.id);
      panels[i].setAttribute("tabindex", "0");
    });

    var current = -1;

    function keepTabsInView() {
      var y = sheet.getBoundingClientRect().top + window.scrollY - 60;
      if (window.scrollY > y) window.scrollTo(0, Math.max(0, y));
    }

    function activate(index, opts) {
      opts = opts || {};
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.setAttribute("tabindex", on ? "0" : "-1");
        panels[i].hidden = !on;
      });
      if (opts.focus) tabs[index].focus();
      if (opts.push && index !== current) {
        try { history.pushState(null, "", "#" + panels[index].id); } catch (e) {}
      }
      if (opts.scroll) keepTabsInView();
      current = index;
    }

    function fromHash(initial) {
      var id = decodeURIComponent(location.hash.slice(1));
      var target = id ? document.getElementById(id) : null;
      var index = -1;
      if (target) {
        panels.forEach(function (p, i) { if (p.contains(target)) index = i; });
      }
      if (index === -1) {
        if (!initial && id) return;          // e.g. the skip link: leave panels alone
        index = 0;
      }
      activate(index, { scroll: !initial });
      if (target && target !== panels[index]) {
        target.scrollIntoView({ block: "start" });
      }
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function (e) {
        e.preventDefault();
        activate(i, { push: true, scroll: true });
      });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = tabs.length - 1;
        if (next === null) return;
        e.preventDefault();
        activate(next, { focus: true, push: true });
      });
    });

    window.addEventListener("popstate", function () { fromHash(false); });
    window.addEventListener("hashchange", function () { fromHash(false); });
    fromHash(true);
  }

  /* ----------------------------------------------------------------
   * Skill bars fill when they come into view (text levels are always
   * shown, so the bars are decorative).
   * ---------------------------------------------------------------- */
  function initSkillBars() {
    var bars = document.querySelectorAll(".skill-bar");
    if (!bars.length) return;
    if (!("IntersectionObserver" in window)) {
      bars.forEach(function (b) { b.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(function (b) { io.observe(b); });
  }

  /* ----------------------------------------------------------------
   * Portfolio filter: toggle buttons with aria-pressed and a live
   * status line for screen readers.
   * ---------------------------------------------------------------- */
  function initFilters() {
    var group = document.querySelector("[data-filters]");
    var works = document.querySelectorAll("[data-works] .work");
    if (!group || !works.length) return;
    var buttons = group.querySelectorAll("[data-filter]");
    var status = document.querySelector("[data-filter-status]");
    var names = { all: "", web: "website ", brand: "branding ", photo: "photography " };

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var filter = btn.getAttribute("data-filter");
        var shown = 0;
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
        works.forEach(function (w) {
          var match = filter === "all" || w.getAttribute("data-cat") === filter;
          var wasHidden = w.hidden;
          w.hidden = !match;
          if (match) {
            shown++;
            if (wasHidden) {
              w.classList.remove("is-entering");
              void w.offsetWidth;
              w.classList.add("is-entering");
            }
          }
        });
        if (status) status.textContent = "Showing " + shown + " " + (names[filter] || "") + "project" + (shown === 1 ? "" : "s");
      });
    });
  }

  /* ----------------------------------------------------------------
   * Lightbox on a native <dialog>: previous / next across the projects
   * currently shown by the filter, arrow keys, Esc and backdrop close.
   * ---------------------------------------------------------------- */
  function initLightbox() {
    var dialog = document.querySelector("[data-lightbox]");
    var openers = document.querySelectorAll("[data-works] .work-open");
    if (!dialog || !openers.length || typeof dialog.showModal !== "function") return;

    var media = dialog.querySelector("[data-lb-media]");
    var title = dialog.querySelector("[data-lb-title]");
    var meta = dialog.querySelector("[data-lb-meta]");
    var desc = dialog.querySelector("[data-lb-desc]");
    var role = dialog.querySelector("[data-lb-role]");
    var count = dialog.querySelector("[data-lb-count]");
    var list = [];
    var index = 0;
    var opener = null;

    function visible() {
      return Array.prototype.slice.call(document.querySelectorAll("[data-works] .work")).filter(function (w) { return !w.hidden; });
    }

    function render() {
      var work = list[index];
      if (!work) return;
      var thumb = work.querySelector(".thumb").cloneNode(true);
      thumb.removeAttribute("aria-hidden");
      var img = thumb.querySelector("img");
      if (img) img.loading = "eager";
      else thumb.setAttribute("aria-hidden", "true");
      media.innerHTML = "";
      media.appendChild(thumb);
      title.textContent = work.querySelector(".work-title").textContent;
      meta.textContent = work.querySelector(".work-meta").textContent;
      desc.textContent = work.querySelector(".work-desc").textContent;
      role.textContent = work.getAttribute("data-role") || "";
      count.textContent = (index + 1) + " / " + list.length;
    }

    function step(delta) {
      index = (index + delta + list.length) % list.length;
      render();
    }

    openers.forEach(function (btn) {
      btn.addEventListener("click", function () {
        list = visible();
        index = Math.max(0, list.indexOf(btn.closest(".work")));
        opener = btn;
        render();
        dialog.showModal();
      });
    });

    dialog.querySelector("[data-lb-close]").addEventListener("click", function () { dialog.close(); });
    dialog.querySelector("[data-lb-prev]").addEventListener("click", function () { step(-1); });
    dialog.querySelector("[data-lb-next]").addEventListener("click", function () { step(1); });
    dialog.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    });
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();   // click on the backdrop
    });
    dialog.addEventListener("close", function () {
      if (opener) {
        // Return focus to the project that is now showing, if it moved.
        var current = list[index] && list[index].querySelector(".work-open");
        (current || opener).focus();
      }
    });
  }

  /* ----------------------------------------------------------------
   * Download vCard: builds a vCard 3.0 file from the profile markup
   * (elements marked data-vcard), so editing the HTML updates it.
   * ---------------------------------------------------------------- */
  function initVCard() {
    var btn = document.querySelector("[data-vcard-download]");
    if (!btn || typeof Blob === "undefined") return;

    function field(name) { return document.querySelector('[data-vcard="' + name + '"]'); }
    function text(el) { return el ? el.textContent.replace(/\s+/g, " ").replace(/\u2011/g, "-").trim() : ""; }
    function esc(v) { return String(v).replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/([,;])/g, "\\$1"); }
    function fold(line) {
      var out = [];
      while (line.length > 74) { out.push(line.slice(0, 74)); line = " " + line.slice(74); }
      out.push(line);
      return out.join("\r\n");
    }

    btn.addEventListener("click", function () {
      var fn = text(field("fn"));
      if (!fn) return;
      var parts = fn.split(" ");
      var family = parts.length > 1 ? parts.pop() : "";
      var given = parts.join(" ");
      var email = field("email"), tel = field("tel"), url = field("url"), adr = field("adr");
      var lines = ["BEGIN:VCARD", "VERSION:3.0", "N:" + esc(family) + ";" + esc(given) + ";;;", "FN:" + esc(fn)];
      if (text(field("title"))) lines.push("TITLE:" + esc(text(field("title"))));
      if (email) lines.push("EMAIL;TYPE=INTERNET:" + email.getAttribute("href").replace(/^mailto:/, ""));
      if (tel) lines.push("TEL;TYPE=CELL,VOICE:" + tel.getAttribute("href").replace(/^tel:/, ""));
      if (url) lines.push("URL:" + url.getAttribute("href"));
      if (adr) lines.push("ADR;TYPE=WORK:;;;" + esc(adr.getAttribute("data-locality") || "") + ";;;" + esc(adr.getAttribute("data-country") || ""));
      if (text(field("note"))) lines.push("NOTE:" + esc(text(field("note"))));
      lines.push("REV:" + new Date().toISOString().replace(/\.\d+Z$/, "Z"), "END:VCARD");

      var vcf = lines.map(fold).join("\r\n") + "\r\n";
      var file = fn.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".vcf";
      var href = URL.createObjectURL(new Blob([vcf], { type: "text/vcard;charset=utf-8" }));
      var a = document.createElement("a");
      a.href = href;
      a.download = file;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(function () { URL.revokeObjectURL(href); }, 4000);
      announce("Saved " + file + " \u2014 open it to add " + given + " to your contacts.");
    });
  }

  /* ----------------------------------------------------------------
   * Print CV buttons — the print stylesheet does the layout.
   * ---------------------------------------------------------------- */
  function initPrint() {
    document.querySelectorAll("[data-print]").forEach(function (btn) {
      btn.addEventListener("click", function () { window.print(); });
    });
  }

  /* ----------------------------------------------------------------
   * Copy email to the clipboard.
   * ---------------------------------------------------------------- */
  function initCopy() {
    document.querySelectorAll("[data-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var value = btn.getAttribute("data-copy");
        var done = function () {
          btn.classList.add("is-done");
          btn.setAttribute("aria-label", "Email address copied");
          announce("Copied " + value + " to the clipboard.");
          window.setTimeout(function () {
            btn.classList.remove("is-done");
            btn.setAttribute("aria-label", "Copy email address");
          }, 2200);
        };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(value).then(done, function () { announce(value); });
        } else {
          var ta = document.createElement("textarea");
          ta.value = value;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); done(); } catch (e) { announce(value); }
          ta.remove();
        }
      });
    });
  }

  /* ----------------------------------------------------------------
   * Local time in the person's city (data-tz on the element).
   * ---------------------------------------------------------------- */
  function initClock() {
    var el = document.querySelector("[data-clock]");
    if (!el || !window.Intl) return;
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: el.getAttribute("data-tz") || undefined, timeZoneName: "short" });
    } catch (e) { return; }
    var tick = function () { el.textContent = fmt.format(new Date()); };
    tick();
    window.setInterval(tick, 30000);
  }

  /* ----------------------------------------------------------------
   * Contact form: browser-side validation and a success state.
   * Front-end only — connect it to a form service to receive mail.
   * ---------------------------------------------------------------- */
  function initContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;
    var success = form.querySelector("[data-success]");
    var controls = form.querySelectorAll("input[required], select[required], textarea[required]");

    function check(el) {
      var ok = el.checkValidity() && el.value.trim() !== "";
      var field = el.closest(".field");
      if (field) field.classList.toggle("is-invalid", !ok);
      el.setAttribute("aria-invalid", ok ? "false" : "true");
      return ok;
    }

    controls.forEach(function (el) {
      el.addEventListener("blur", function () { if (el.value) check(el); });
      el.addEventListener("input", function () {
        if (el.closest(".field").classList.contains("is-invalid")) check(el);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      controls.forEach(function (el) { if (!check(el) && !firstBad) firstBad = el; });
      if (firstBad) {
        form.classList.remove("is-sent");
        firstBad.focus();
        return;
      }
      form.classList.add("is-sent");
      form.reset();
      controls.forEach(function (el) { el.removeAttribute("aria-invalid"); });
      if (success) success.focus();
    });
  }

  initTheme();
  initTabs();
  initSkillBars();
  initFilters();
  initLightbox();
  initVCard();
  initPrint();
  initCopy();
  initClock();
  initContactForm();
})();
