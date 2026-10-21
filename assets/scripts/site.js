(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/ё/g, "е").trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  ready(function () {
    setupThemeToggle();
    setupSpoilers();
    setupCookiePanel();
    setupImageModal();
    setupSearch();
    setupTocToggles();
    setupNavboxToggles();
    setupWorkDropdowns();
    setupDisclosureMenus();
  });

  function setupThemeToggle() {
    const button = document.getElementById("theme-toggle");
    const key = document.body.dataset.themeKey || "saladFandomTheme";
    const root = document.documentElement;

    if (!button) {
      return;
    }

    function currentTheme() {
      return root.dataset.theme === "light" ? "light" : "dark";
    }

    function applyTheme(theme) {
      const nextTheme = theme === "light" ? "light" : "dark";
      root.dataset.theme = nextTheme;
      button.setAttribute("aria-pressed", nextTheme === "light" ? "true" : "false");
      button.title = nextTheme === "light" ? "Включить тёмную тему" : "Включить светлую тему";
    }

    try {
      const savedTheme = localStorage.getItem(key);
      if (savedTheme === "light" || savedTheme === "dark") {
        applyTheme(savedTheme);
      } else {
        applyTheme(currentTheme());
      }
    } catch (error) {
      applyTheme(currentTheme());
    }

    button.addEventListener("click", function () {
      const nextTheme = currentTheme() === "light" ? "dark" : "light";
      applyTheme(nextTheme);

      try {
        localStorage.setItem(key, nextTheme);
      } catch (error) {}
    });
  }

  function setupSpoilers() {
    const modal = document.getElementById("spoiler-modal");
    const accept = document.getElementById("accept-spoilers");
    const reject = document.getElementById("reject-spoilers");
    const key = document.body.dataset.spoilerKey || "saladFandomAcceptedSpoilers";

    if (!modal || !accept || !reject) {
      return;
    }

    if (localStorage.getItem(key) === "true") {
      modal.hidden = true;
      modal.classList.add("is-hidden");
    }

    accept.addEventListener("click", function () {
      localStorage.setItem(key, "true");
      modal.classList.add("is-hidden");
      window.setTimeout(function () {
        modal.hidden = true;
      }, 180);
    });

    reject.addEventListener("click", function () {
      if (history.length > 1) {
        history.back();
      } else {
        window.location.href = "about:blank";
      }
    });
  }

  function setupCookiePanel() {
    const panel = document.getElementById("cookie-panel");
    const close = document.getElementById("close-cookie-panel");
    const key = document.body.dataset.cookieKey || "saladFandomCookiePanelClosed";

    if (!panel || !close) {
      return;
    }

    if (localStorage.getItem(key) === "true") {
      panel.hidden = true;
    }

    close.addEventListener("click", function () {
      localStorage.setItem(key, "true");
      panel.hidden = true;
    });

    document.addEventListener("click", function (event) {
      if (event.target.closest("#close-cookie-panel")) {
        localStorage.setItem(key, "true");
        panel.hidden = true;
      }
    });
  }

  function setupImageModal() {
    const modal = document.getElementById("image-modal");
    const modalImage = modal ? modal.querySelector("img") : null;
    const modalCaption = modal ? modal.querySelector(".image-modal-caption") : null;
    const close = modal ? modal.querySelector(".image-modal-close") : null;

    if (!modal || !modalImage || !close) {
      return;
    }

    document.addEventListener("click", function (event) {
      const trigger = event.target.closest(".modal-trigger");
      if (!trigger) {
        return;
      }

      const image = trigger.querySelector("img");
      const caption = trigger.dataset.caption || "";
      modalImage.src = trigger.dataset.fullImage || image?.src || "";
      modalImage.alt = image?.alt || "";
      if (modalCaption) {
        modalCaption.textContent = caption;
        modalCaption.hidden = !caption;
      }
      modal.hidden = false;
      document.body.classList.add("modal-open");
      close.focus();
    });

    function closeModal() {
      modal.hidden = true;
      modalImage.removeAttribute("src");
      if (modalCaption) {
        modalCaption.textContent = "";
        modalCaption.hidden = true;
      }
      document.body.classList.remove("modal-open");
    }

    close.addEventListener("click", closeModal);
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hidden) {
        closeModal();
      }
    });
  }

  function setupSearch() {
    const form = document.querySelector(".site-search");
    const input = form ? form.querySelector("input") : null;
    const results = form ? form.querySelector(".search-results") : null;
    const dataNode = document.getElementById("search-index");

    if (!form || !input || !results || !dataNode) {
      return;
    }

    const index = JSON.parse(dataNode.textContent || "[]");
    let currentMatches = [];

    function render(matches) {
      currentMatches = matches;

      if (!matches.length) {
        results.hidden = true;
        results.innerHTML = "";
        return;
      }

      results.innerHTML = matches.map(function (item) {
        return [
          '<a href="', escapeHtml(item.url), '">',
          '<strong>', escapeHtml(item.title), '</strong>',
          '<em>', escapeHtml(item.summary), '</em>',
          '</a>'
        ].join("");
      }).join("");
      results.hidden = false;
    }

    input.addEventListener("input", function () {
      const query = normalize(input.value);
      if (query.length < 2) {
        render([]);
        return;
      }

      const matches = index.filter(function (item) {
        const haystack = normalize([item.title, item.summary].concat(item.aliases || []).join(" "));
        return haystack.includes(query);
      }).slice(0, 8);

      render(matches);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (currentMatches[0]) {
        window.location.href = currentMatches[0].url;
      }
    });

    document.addEventListener("click", function (event) {
      if (!form.contains(event.target)) {
        results.hidden = true;
      }
    });
  }

  function setupTocToggles() {
    document.querySelectorAll(".toc").forEach(function (toc) {
      const list = toc.querySelector(".toc-list");
      const button = toc.querySelector(".toc-toggle");

      if (!list || !button) {
        return;
      }

      function lockWidth() {
        if (toc.dataset.widthLocked === "true") {
          return;
        }

        const width = Math.ceil(toc.getBoundingClientRect().width);
        if (width > 0) {
          toc.style.width = width + "px";
          toc.dataset.widthLocked = "true";
        }
      }

      function setCollapsed(collapsed) {
        lockWidth();
        list.hidden = collapsed;
        toc.classList.toggle("is-collapsed", collapsed);
        button.textContent = collapsed ? "[показать]" : "[скрыть]";
        button.setAttribute("aria-expanded", collapsed ? "false" : "true");
      }

      requestAnimationFrame(lockWidth);

      button.addEventListener("click", function () {
        setCollapsed(!list.hidden);
      });
    });
  }

  function setupNavboxToggles() {
    document.querySelectorAll(".navbox").forEach(function (navbox) {
      const button = navbox.querySelector(".navbox-toggle");
      const row = navbox.querySelector(".navbox-body-row");

      if (!button || !row) {
        return;
      }

      function setCollapsed(collapsed) {
        row.hidden = collapsed;
        navbox.classList.toggle("is-collapsed", collapsed);
        button.textContent = collapsed ? "[развернуть]" : "[свернуть]";
        button.setAttribute("aria-expanded", collapsed ? "false" : "true");
      }

      setCollapsed(row.hidden);

      button.addEventListener("click", function () {
        setCollapsed(!row.hidden);
      });
    });
  }

  function setupWorkDropdowns() {
    const items = Array.from(document.querySelectorAll(".work-subnav-item"));
    const margin = 12;
    const submenuWidth = 348;

    function clampDropdown(item) {
      const dropdown = item.querySelector(".work-dropdown");

      if (!dropdown) {
        return;
      }

      dropdown.style.setProperty("--dropdown-shift", "0px");

      const rect = dropdown.getBoundingClientRect();
      if (!rect.width) {
        return;
      }

      let shift = 0;
      if (rect.left < margin) {
        shift = margin - rect.left;
      } else if (rect.right > window.innerWidth - margin) {
        shift = window.innerWidth - margin - rect.right;
      }

      dropdown.style.setProperty("--dropdown-shift", Math.round(shift) + "px");

      const finalLeft = rect.left + shift;
      const finalRight = rect.right + shift;
      const hasSubmenus = Boolean(dropdown.querySelector(".work-dropdown-panel.has-submenus"));
      const shouldOpenLeft = hasSubmenus && finalRight + submenuWidth > window.innerWidth - margin && finalLeft > submenuWidth;
      item.classList.toggle("is-submenu-left", shouldOpenLeft);
    }

    function scheduleClamp(item) {
      window.requestAnimationFrame(function () {
        clampDropdown(item);
      });
    }

    items.forEach(function (item) {
      item.addEventListener("mouseenter", function () {
        scheduleClamp(item);
      });
      item.addEventListener("focusin", function () {
        scheduleClamp(item);
      });
      item.addEventListener("touchstart", function () {
        scheduleClamp(item);
      }, { passive: true });
    });

    window.addEventListener("resize", function () {
      items.forEach(function (item) {
        const dropdown = item.querySelector(".work-dropdown");
        if (dropdown && window.getComputedStyle(dropdown).display !== "none") {
          scheduleClamp(item);
        }
      });
    });
  }

  function setupDisclosureMenus() {
    document.addEventListener("click", function (event) {
      document.querySelectorAll("details[open]").forEach(function (details) {
        if (!details.contains(event.target)) {
          details.open = false;
        }
      });
    });
  }
})();
