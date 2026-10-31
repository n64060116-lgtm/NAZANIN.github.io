/* ============================================================
   NAZANIN POSHTIBAN — PORTFOLIO INTERACTIONS
   Language switch, welcome screen, mobile navigation, and helpers
   ============================================================ */

(() => {
  "use strict";

  const EMAIL = "n64060116@gmail.com";
  const LANGUAGE_KEY = "nazanin-portfolio-language";
  const INTRO_KEY = "nazanin-intro-seen";
  const SUPPORTED_LANGUAGES = ["fa", "en"];

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  function safeStorageGet(storageName, key) {
    try {
      return window[storageName].getItem(key);
    } catch (_error) {
      return null;
    }
  }

  function safeStorageSet(storageName, key, value) {
    try {
      window[storageName].setItem(key, value);
    } catch (_error) {
      // Storage may be blocked for local files or private browsing.
    }
  }

  function applyLanguage(language) {
    const lang = SUPPORTED_LANGUAGES.includes(language) ? language : "fa";
    const root = document.documentElement;

    root.lang = lang;
    root.dir = lang === "fa" ? "rtl" : "ltr";
    root.dataset.lang = lang;

    $$('[data-fa][data-en]').forEach((element) => {
      const translatedText = element.getAttribute(`data-${lang}`);
      if (translatedText !== null) {
        element.textContent = translatedText;
      }
    });

    $$('[data-set-lang]').forEach((button) => {
      const isActive = button.dataset.setLang === lang;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    const skipLink = $(".skip-link");
    if (skipLink) {
      skipLink.textContent = lang === "fa" ? "رفتن به محتوای اصلی" : "Skip to main content";
    }

    const menuToggle = $("#menuToggle");
    if (menuToggle) {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute(
        "aria-label",
        lang === "fa"
          ? (isOpen ? "بستن منو" : "باز کردن منو")
          : (isOpen ? "Close menu" : "Open menu"),
      );
    }

    const enterButton = $("#enterSite");
    if (enterButton) {
      enterButton.setAttribute(
        "aria-label",
        lang === "fa" ? "ورود به پورتفولیو" : "Enter portfolio",
      );
    }

    safeStorageSet("localStorage", LANGUAGE_KEY, lang);
    preserveLanguageInInternalLinks(lang);
  }

  // Keep the selected language when moving between local HTML pages.
  // This is useful when the website is opened directly from a folder (file://).
  function preserveLanguageInInternalLinks(language) {
    document.querySelectorAll('a[href]').forEach((link) => {
      const originalHref = link.getAttribute("href");
      if (!originalHref || !/\.html(?:[?#]|$)/i.test(originalHref)) return;
      if (/^(?:[a-z]+:)?\/\//i.test(originalHref)) return;

      const hashIndex = originalHref.indexOf("#");
      const hash = hashIndex >= 0 ? originalHref.slice(hashIndex) : "";
      const beforeHash = hashIndex >= 0 ? originalHref.slice(0, hashIndex) : originalHref;
      const queryIndex = beforeHash.indexOf("?");
      const pagePath = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;
      const query = queryIndex >= 0 ? beforeHash.slice(queryIndex + 1) : "";
      const params = new URLSearchParams(query);
      params.set("lang", language);
      link.setAttribute("href", `${pagePath}?${params.toString()}${hash}`);
    });
  }

  const languageFromUrl = new URLSearchParams(window.location.search).get("lang");
  const savedLanguage = safeStorageGet("localStorage", LANGUAGE_KEY);
  applyLanguage(
    SUPPORTED_LANGUAGES.includes(languageFromUrl)
      ? languageFromUrl
      : (savedLanguage || "fa"),
  );

  $$('[data-set-lang]').forEach((button) => {
    button.addEventListener("click", () => applyLanguage(button.dataset.setLang));
  });

  // Welcome screen: the visitor can enter, skip, or press Escape.
  const introScreen = $("#introScreen");

  function closeIntro() {
    if (introScreen) {
      introScreen.classList.add("is-hidden");
    }
    safeStorageSet("sessionStorage", INTRO_KEY, "1");
  }

  if (introScreen) {
    if (safeStorageGet("sessionStorage", INTRO_KEY) === "1") {
      introScreen.classList.add("is-hidden");
    }

    $("#enterSite")?.addEventListener("click", closeIntro);
    $("#skipIntro")?.addEventListener("click", closeIntro);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeIntro();
      }
    });
  }

  // Mobile navigation. Close it after a navigation link is selected.
  const menuToggle = $("#menuToggle");
  const mainNav = $("#mainNav");

  function setMenuOpen(isOpen) {
    if (!menuToggle || !mainNav) return;

    mainNav.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      document.documentElement.lang === "fa"
        ? (isOpen ? "بستن منو" : "باز کردن منو")
        : (isOpen ? "Close menu" : "Open menu"),
    );
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      setMenuOpen(!mainNav.classList.contains("is-open"));
    });

    $$('a', mainNav).forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    });
  }

  // Reveal cards as they enter the viewport, unless reduced motion is preferred.
  const revealTargets = $$(".section-intro, .bio-card, .identity-panel, .interest-band, .skill-card, .honesty-note, .project-card, .project-endline, .certificate-band-inner, .journey-item, .contact-inner > *, .social-link, .contact-footer, .page-footer, .cert-hero-inner, .cert-toolbar, .certificate-card, .certificate-note, .detail-title, .detail-summary, .project-hero-visual, .detail-copy, .detail-aside, .detail-bottom, .inner-footer");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07 });

    revealTargets.forEach((element, index) => {
      element.classList.add("will-reveal");
      element.style.setProperty("--reveal-delay", `${(index % 5) * 70}ms`);
      observer.observe(element);
    });
  } else {
    revealTargets.forEach((element) => element.classList.add("in-view"));
  }

  // Email copy button with a fallback for browsers that block the Clipboard API.
  const copyEmailButton = $("#copyEmail");

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      showToast(document.documentElement.lang === "fa" ? "ایمیل کپی شد." : "Email copied.");
    } catch (_error) {
      const temporaryInput = document.createElement("textarea");
      temporaryInput.value = EMAIL;
      temporaryInput.setAttribute("readonly", "");
      temporaryInput.style.position = "fixed";
      temporaryInput.style.opacity = "0";
      document.body.appendChild(temporaryInput);
      temporaryInput.select();

      const copied = document.execCommand("copy");
      temporaryInput.remove();
      showToast(
        copied
          ? (document.documentElement.lang === "fa" ? "ایمیل کپی شد." : "Email copied.")
          : EMAIL,
      );
    }
  }

  copyEmailButton?.addEventListener("click", copyEmail);

  function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("is-visible");
    window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  // Keep the certificate card state in sync with whether its image loaded.
  $$(".certificate-card img").forEach((image) => {
    const updateImageState = () => {
      image.closest(".certificate-card")?.classList.toggle("has-image", image.naturalWidth > 0);
    };

    image.addEventListener("load", updateImageState);
    image.addEventListener("error", updateImageState);
    if (image.complete) updateImageState();
  });

  // N-CORE CREATIVE SYSTEM: animated code atmosphere + tiny interactive terminal.
  const neoReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Global decorative layers. They are generated locally and need no external assets.
  const neoGrid = document.createElement("div");
  neoGrid.className = "neo-grid-overlay";
  neoGrid.setAttribute("aria-hidden", "true");
  document.body.appendChild(neoGrid);

  const neoGlow = document.createElement("div");
  neoGlow.className = "neo-cursor-glow";
  neoGlow.setAttribute("aria-hidden", "true");
  document.body.appendChild(neoGlow);

  const neoProgress = document.createElement("div");
  neoProgress.className = "neo-scroll-progress";
  neoProgress.setAttribute("aria-hidden", "true");
  neoProgress.innerHTML = "<span></span>";
  document.body.appendChild(neoProgress);
  const neoProgressBar = $("span", neoProgress);
  let neoScrollQueued = false;
  const updateNeoProgress = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(100, (window.scrollY / maxScroll) * 100) : 0;
    neoProgressBar.style.width = `${progress}%`;
    neoScrollQueued = false;
  };
  window.addEventListener("scroll", () => {
    if (!neoScrollQueued) {
      window.requestAnimationFrame(updateNeoProgress);
      neoScrollQueued = true;
    }
  }, { passive: true });
  updateNeoProgress();

  // Mouse-following spotlight and subtle cursor glow.
  if (!neoReducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("pointermove", (event) => {
      neoGlow.style.transform = `translate3d(${event.clientX - 180}px,${event.clientY - 180}px,0)`;
      document.body.classList.add("neo-pointer-active");
      const card = event.target.closest?.(".project-card,.skill-card,.journey-item");
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
        card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
      }
    }, { passive: true });
    document.addEventListener("pointerleave", () => document.body.classList.remove("neo-pointer-active"));
  }

  // Animated syntax trails drift behind the page content.
  if (!neoReducedMotion) {
    const canvas = document.createElement("canvas");
    canvas.id = "neoCodeCanvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);
    const context = canvas.getContext("2d", { alpha: true });
    if (context) {
      const snippets = [
        "const future = build();", "</portfolio>", "function createIdea() { }", "0101 1010 0011",
        "while(learning) { grow(); }", "<div class='dream'>", "git commit -m 'first-step'",
        "print('hello, world')", "SELECT * FROM ideas;", "return creativity;", "#include <future>",
        "npm run imagination", "if (curious) explore();", "01001110 01010000", "</code>"
      ];
      let width = 0, height = 0, pixelRatio = 1, streams = [];
      const makeStreams = () => {
        const count = Math.max(10, Math.min(25, Math.round(width / 72)));
        streams = Array.from({ length: count }, (_, index) => ({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: .22 + Math.random() * .65,
          drift: (Math.random() - .5) * .18,
          text: snippets[index % snippets.length],
          alpha: .10 + Math.random() * .22,
          scale: .75 + Math.random() * .5,
          phase: Math.random() * Math.PI * 2,
          hue: Math.random() > .55 ? 188 : 257
        }));
      };
      const resizeCanvas = () => {
        pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        makeStreams();
      };
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas, { passive: true });
      let frame = 0;
      const drawCode = () => {
        context.clearRect(0, 0, width, height);
        streams.forEach((stream) => {
          stream.x -= stream.speed;
          stream.y += stream.drift;
          stream.phase += .012;
          if (stream.x < -360) {
            stream.x = width + Math.random() * 250;
            stream.y = Math.random() * height;
            stream.text = snippets[Math.floor(Math.random() * snippets.length)];
          }
          const pulse = .72 + Math.sin(stream.phase) * .28;
          context.save();
          context.globalAlpha = stream.alpha * pulse;
          context.translate(stream.x, stream.y);
          context.rotate(-.035);
          context.font = `${10 * stream.scale}px ui-monospace, SFMono-Regular, Consolas, monospace`;
          context.fillStyle = `hsl(${stream.hue} 72% 58%)`;
          context.shadowColor = `hsla(${stream.hue} 90% 70% / .48)`;
          context.shadowBlur = 9;
          context.fillText(stream.text, 0, 0);
          context.restore();
        });
        frame = window.requestAnimationFrame(drawCode);
      };
      drawCode();
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) window.cancelAnimationFrame(frame);
        else drawCode();
      });
    }
  }

  // A floating, friendly mini system with a working scan animation and theme switch.
  const neoDock = document.createElement("aside");
  neoDock.className = "neo-system-dock";
  neoDock.innerHTML = `
    <section class="neo-system-window" id="neoSystemWindow" aria-label="N-CORE mini system" hidden>
      <div class="neo-window-head">
        <div class="neo-window-title"><span class="neo-bot-face" aria-hidden="true">✦</span><span>N-CORE / MINI SYSTEM</span></div>
        <div style="display:flex;align-items:center;gap:9px"><span class="neo-window-meta">v2.6.10</span><button class="neo-window-close" id="neoClose" type="button" aria-label="Close mini system">×</button></div>
      </div>
      <div class="neo-window-body">
        <div class="neo-welcome-line"><span>●</span><span id="neoWelcome">سیستم خلاقیت آماده است، نازنین!</span><strong id="neoLiveStatus">ONLINE</strong></div>
        <div class="neo-terminal-screen" id="neoTerminal" aria-live="polite">
          <div class="neo-terminal-line"><span class="prompt">n-core@nazanin:~$</span> initialize_portfolio</div>
          <div class="neo-terminal-line"><span class="success">✓</span> creative modules loaded</div>
          <div class="neo-terminal-line"><span class="answer">→</span> waiting for your next idea<span class="neo-terminal-cursor"></span></div>
        </div>
        <div class="neo-system-meters">
          <div class="neo-meter"><div class="neo-meter-top"><span id="neoMeterOneLabel">خلاقیت</span><b>∞</b></div><div class="neo-meter-track"><span style="--meter:92%"></span></div></div>
          <div class="neo-meter"><div class="neo-meter-top"><span id="neoMeterTwoLabel">یادگیری</span><b>LIVE</b></div><div class="neo-meter-track"><span style="--meter:78%"></span></div></div>
        </div>
        <div class="neo-system-actions">
          <button class="neo-system-action" id="neoScan" type="button">⌁ اجرای اسکن خلاقیت</button>
          <button class="neo-system-action" id="neoTheme" type="button">✦ فعال‌سازی حالت نئون</button>
        </div>
        <div class="neo-window-foot"><span>MADE WITH CURIOSITY</span><b>● ALL SYSTEMS CUTE</b></div>
      </div>
    </section>
    <button class="neo-system-launcher" id="neoLauncher" type="button" aria-expanded="false" aria-controls="neoSystemWindow">
      <span class="neo-bot-face" aria-hidden="true">✦</span>
      <span class="neo-launch-copy"><b>N-CORE MINI</b><small id="neoLauncherSub">سیستم کوچک من · آنلاین</small></span>
      <span class="neo-launch-indicator" aria-hidden="true"></span>
    </button>`;
  document.body.appendChild(neoDock);

  const neoWindow = $("#neoSystemWindow", neoDock);
  const neoLauncher = $("#neoLauncher", neoDock);
  const neoTerminal = $("#neoTerminal", neoDock);
  const neoSetOpen = (open) => {
    neoWindow.hidden = !open;
    neoLauncher.setAttribute("aria-expanded", String(open));
    neoDock.classList.toggle("is-open", open);
  };
  neoLauncher.addEventListener("click", () => neoSetOpen(neoWindow.hidden));
  $("#neoClose", neoDock).addEventListener("click", () => neoSetOpen(false));

  const neoMessages = {
    fa: {
      launcher: "سیستم کوچک من · آنلاین", welcome: "سیستم خلاقیت آماده است، نازنین!", creativity: "خلاقیت", learning: "یادگیری",
      scan: "⌁ اجرای اسکن خلاقیت", theme: "✦ فعال‌سازی حالت نئون", scanning: "در حال اسکن ایده‌ها...", done: "اسکن کامل شد؛ آمادهٔ ساختن یک چیز تازه‌ای!",
      lines: ["checking imagination.core ...", "✓ curiosity module: active", "✓ code particles: flowing", "✓ portfolio mood: excellent", "→ new idea detected. let's build!"]
    },
    en: {
      launcher: "My tiny system · online", welcome: "Creative system is ready, Nazanin!", creativity: "Creativity", learning: "Learning",
      scan: "⌁ Run creativity scan", theme: "✦ Toggle neon mode", scanning: "Scanning your ideas...", done: "Scan complete. Ready to build something new!",
      lines: ["checking imagination.core ...", "✓ curiosity module: active", "✓ code particles: flowing", "✓ portfolio mood: excellent", "→ new idea detected. let's build!"]
    }
  };
  const neoLang = () => document.documentElement.lang === "en" ? "en" : "fa";
  const neoRefreshLabels = () => {
    const text = neoMessages[neoLang()];
    $("#neoLauncherSub", neoDock).textContent = text.launcher;
    $("#neoWelcome", neoDock).textContent = text.welcome;
    $("#neoMeterOneLabel", neoDock).textContent = text.creativity;
    $("#neoMeterTwoLabel", neoDock).textContent = text.learning;
    $("#neoScan", neoDock).textContent = text.scan;
    $("#neoTheme", neoDock).textContent = text.theme;
  };
  $$('[data-set-lang]').forEach((button) => button.addEventListener("click", () => window.setTimeout(neoRefreshLabels, 0)));
  neoRefreshLabels();

  const addNeoLine = (content, className = "answer") => {
    const line = document.createElement("div");
    line.className = "neo-terminal-line";
    const span = document.createElement("span");
    span.className = className;
    span.textContent = content;
    line.appendChild(span);
    neoTerminal.appendChild(line);
    neoTerminal.scrollTop = neoTerminal.scrollHeight;
  };

  $("#neoScan", neoDock).addEventListener("click", () => {
    const text = neoMessages[neoLang()];
    neoTerminal.innerHTML = "";
    addNeoLine("n-core@nazanin:~$ run creativity_scan", "prompt");
    addNeoLine(text.scanning, "pink");
    $("#neoLiveStatus", neoDock).textContent = "SCANNING";
    let index = 0;
    const runLine = () => {
      if (index >= text.lines.length) {
        addNeoLine(text.done, "success");
        $("#neoLiveStatus", neoDock).textContent = "ONLINE";
        launchNeoBurst();
        return;
      }
      addNeoLine(text.lines[index], index % 2 ? "success" : "answer");
      index += 1;
      window.setTimeout(runLine, 420);
    };
    window.setTimeout(runLine, 500);
  });

  let neoNeonMode = false;
  $("#neoTheme", neoDock).addEventListener("click", () => {
    neoNeonMode = !neoNeonMode;
    document.body.classList.toggle("neo-neon-mode", neoNeonMode);
    const button = $("#neoTheme", neoDock);
    button.textContent = neoNeonMode
      ? (neoLang() === "fa" ? "✧ خاموش‌کردن حالت نئون" : "✧ Disable neon mode")
      : neoMessages[neoLang()].theme;
    addNeoLine(neoNeonMode ? "neon_theme = ON" : "neon_theme = OFF", "pink");
  });

  function launchNeoBurst() {
    if (neoReducedMotion) return;
    const burst = document.createElement("span");
    burst.className = "neo-burst";
    burst.style.setProperty("--burst-y", `${18 + Math.random() * 62}vh`);
    burst.textContent = "const newIdea = () => createSomethingWonderful();  // ✦ N-CORE";
    document.body.appendChild(burst);
    burst.addEventListener("animationend", () => burst.remove(), { once: true });
  }

  // Add a compact terminal overlay to the monogram stage on the home page.
  const heroVisual = $(".hero-visual");
  if (heroVisual) {
    const heroTerminal = document.createElement("div");
    heroTerminal.className = "neo-hero-terminal";
    heroTerminal.setAttribute("aria-label", "Animated code terminal");
    heroTerminal.innerHTML = `
      <div class="neo-terminal-top"><span class="neo-terminal-lights"><i></i><i></i><i></i></span><span>NAZANIN / DEV MODE</span><span class="neo-terminal-status">LIVE</span></div>
      <div class="neo-terminal-code"><div class="code-muted">// building my next chapter</div><div><span class="code-purple">const</span> dream = <span class="code-pink">"big"</span>;</div><div><span class="code-cyan">while</span> (learning) { create(); }</div><div class="code-muted">&gt; future.status = "loading"<i class="neo-terminal-cursor"></i></div></div>`;
    heroVisual.appendChild(heroTerminal);
  }

  // Extend the N-CORE visual language through every lower section and inner page.
  const neoModuleSpecs = [
    { selector: ".about-section", code: "01", name: "PROFILE / JSON" },
    { selector: ".skills-section", code: "02", name: "SKILL MODULES" },
    { selector: ".projects-section", code: "03", name: "PROJECT DATABASE" },
    { selector: ".certificate-band", code: "04", name: "ACHIEVEMENT ARCHIVE" },
    { selector: ".journey-section", code: "05", name: "LEARNING TIMELINE" },
    { selector: ".contact-section", code: "06", name: "CONNECTION PORT" },
    { selector: ".cert-main", code: "07", name: "CERTIFICATE ARCHIVE" },
    { selector: ".inner-main", code: "08", name: "PROJECT INSPECTOR" }
  ];
  neoModuleSpecs.forEach((spec) => {
    const host = $(spec.selector);
    if (!host || host.querySelector(":scope > .neo-module-hud")) return;
    host.classList.add("neo-enhanced-section");
    const hud = document.createElement("div");
    hud.className = "neo-module-hud";
    hud.setAttribute("aria-hidden", "true");
    hud.innerHTML = `<span class="neo-hud-index">${spec.code}</span><span class="neo-hud-name">${spec.name}</span><span class="neo-hud-track"><i></i><i></i><i></i><i></i><i></i></span><b class="neo-hud-state">LIVE</b>`;
    host.prepend(hud);
  });

  // Skill cards become tiny live modules, without inventing proficiency scores.
  $$(".skill-card").forEach((card, index) => {
    if (card.querySelector(".neo-skill-live")) return;
    const live = document.createElement("div");
    live.className = "neo-skill-live";
    live.setAttribute("aria-hidden", "true");
    live.innerHTML = `<span>MODULE 0${index + 1} / ACTIVE</span><i class="neo-signal-bars"><b></b><b></b><b></b><b></b><b></b></i>`;
    card.appendChild(live);
  });

  // Project artwork receives an animated scanner and a small open-module cue.
  $$(".project-card .visual-art").forEach((art, index) => {
    if (art.querySelector(".neo-art-hud")) return;
    const hud = document.createElement("div");
    hud.className = "neo-art-hud";
    hud.setAttribute("aria-hidden", "true");
    hud.innerHTML = `<span>FILE_0${index + 1}.HTML</span><b>OPEN MODULE ↗</b>`;
    art.appendChild(hud);
  });

  // The journey list gets a circuit-like progress rail and softly pulsing checkpoints.
  $$(".journey-item").forEach((item, index) => {
    if (item.querySelector(".neo-checkpoint")) return;
    const node = document.createElement("span");
    node.className = "neo-checkpoint";
    node.setAttribute("aria-hidden", "true");
    node.textContent = String(index + 1).padStart(2, "0");
    item.appendChild(node);
  });

  // A decorative local terminal makes the contact area feel like a connection console.
  const contactEmail = $(".contact-email");
  if (contactEmail && !contactEmail.querySelector(".neo-connect-terminal")) {
    const terminal = document.createElement("div");
    terminal.className = "neo-connect-terminal";
    terminal.setAttribute("aria-label", "Connection terminal");
    terminal.innerHTML = `<div class="neo-connect-top"><span><i></i><i></i><i></i></span><b>n-core / connect.sh</b><em>READY</em></div><div class="neo-connect-command"><span>nazanin@portfolio:~$</span> open_connection(<strong>"hello"</strong>)<i></i></div><div class="neo-connect-response">✓ channel prepared · waiting for your message</div>`;
    contactEmail.prepend(terminal);
  }

  // Inner pages receive their own inspector header strip for visual continuity.
  const innerMain = $(".inner-main, .cert-main");
  if (innerMain) innerMain.classList.add("neo-inner-inspector");

  // Small depth tilt for pointer devices. Removed on touch and reduced-motion devices.
  if (!neoReducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $$(".project-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const dx = (event.clientX - rect.left) / rect.width - .5;
        const dy = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(900px) rotateX(${(-dy * 2.2).toFixed(2)}deg) rotateY(${(dx * 2.6).toFixed(2)}deg) translateY(-3px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

})();
