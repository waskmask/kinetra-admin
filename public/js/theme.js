document.addEventListener("DOMContentLoaded", function () {
  const languageSwitcher = document.getElementById("languageSwitcher");
  const logoutButton = document.getElementById("logout");

  if (languageSwitcher) {
    languageSwitcher.addEventListener("change", function () {
      const selectedLang = this.value;

      // Set cookie for 30 days
      document.cookie = `i18n=${selectedLang}; path=/; max-age=${
        60 * 60 * 24 * 30
      }; SameSite=Lax`;

      // Reload the page to apply language change
      window.location.reload();
    });
  }

  const langBtn = document.getElementById("languageToggle");
  const langLabel = document.getElementById("languageLabel");

  if (langBtn && langLabel) {
    // Read current lang from cookie
    function getLangFromCookie() {
      const match = document.cookie.match(/(?:^|;) *i18n=([^;]*)/);
      return match ? decodeURIComponent(match[1]) : "en"; // default to en
    }

    // Set initial label
    const currentLang = getLangFromCookie();
    langLabel.textContent = currentLang === "de" ? "EN" : "DE";

    // Toggle language on click
    langBtn.addEventListener("click", () => {
      const newLang = currentLang === "de" ? "en" : "de";
      document.cookie = `i18n=${newLang}; path=/; max-age=${
        60 * 60 * 24 * 30
      }; SameSite=Lax`;
      window.location.reload();
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      window.location.href = "/logout";
    });
  }

  const huser = document.querySelector(".huser");

  if (huser) {
    const topTrigger = huser.querySelector(".top");
    const dropdown = huser.querySelector(".dropDown");

    // Toggle show on click
    topTrigger.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent bubbling up to document
      dropdown.classList.toggle("show");
    });

    // Hide dropdown on outside click
    document.addEventListener("click", function (e) {
      if (!huser.contains(e.target)) {
        dropdown.classList.remove("show");
      }
    });
  }

  const fullScreenBtn = document.getElementById("fullscreenToggle");

  if (fullScreenBtn) {
    const icon = fullScreenBtn.querySelector("i");

    fullScreenBtn.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });

    document.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement) {
        icon.classList.remove("bi-fullscreen");
        icon.classList.add("bi-fullscreen-exit");
      } else {
        icon.classList.remove("bi-fullscreen-exit");
        icon.classList.add("bi-fullscreen");
      }
    });
  }

  window.reload = function () {
    location.reload();
  };
});
