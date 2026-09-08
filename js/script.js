/* Grand Shine Cleaning — site scripts */
(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */
  var hamburger = document.getElementById("hamburger");
  var mainNav = document.getElementById("main-nav");

  if (hamburger && mainNav) {
    hamburger.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("open");
      hamburger.classList.toggle("open", isOpen);
      hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Close menu when a plain nav link is clicked (not the mobile dropdown toggle)
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (link.classList.contains("dropdown-toggle") && window.innerWidth <= 960) {
          return;
        }
        mainNav.classList.remove("open");
        hamburger.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Mobile Services dropdown toggle ---------- */
  var dropdownToggle = document.querySelector(".has-dropdown .dropdown-toggle");
  var dropdownParent = document.querySelector(".has-dropdown");

  if (dropdownToggle && dropdownParent) {
    dropdownToggle.addEventListener("click", function (e) {
      if (window.innerWidth <= 960) {
        e.preventDefault();
        dropdownParent.classList.toggle("mobile-open");
      }
    });
  }

  /* ---------- Generic filter tabs (Services + Gallery pages) ---------- */
  function initFilters(barSelector, itemSelector) {
    var bar = document.querySelector(barSelector);
    if (!bar) return;
    var buttons = bar.querySelectorAll(".filter-btn");
    var items = document.querySelectorAll(itemSelector);

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var filter = btn.getAttribute("data-filter");

        items.forEach(function (item) {
          var category = item.getAttribute("data-category");
          var show = filter === "all" || filter === category;
          item.hidden = !show;
        });
      });
    });
  }

  initFilters(".services-filter", ".service-item");

  /* ---------- Hero video carousel ---------- */
  var heroBg = document.getElementById("hero-video-bg");
  var heroDotsWrap = document.getElementById("hero-video-dots");

  if (heroBg && heroDotsWrap) {
    var heroVideos = Array.prototype.slice.call(heroBg.querySelectorAll(".hero-video"));
    var heroDots = Array.prototype.slice.call(heroDotsWrap.querySelectorAll(".hero-dot"));
    var heroIndex = 0;

    function showHeroVideo(index) {
      heroIndex = (index + heroVideos.length) % heroVideos.length;
      heroVideos.forEach(function (video, i) {
        if (i === heroIndex) {
          video.classList.add("active");
          video.currentTime = 0;
          video.play().catch(function () {});
        } else {
          video.classList.remove("active");
          video.pause();
        }
      });
      heroDots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === heroIndex);
      });
    }

    heroVideos.forEach(function (video, i) {
      video.addEventListener("ended", function () { showHeroVideo(i + 1); });
    });
    heroDots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showHeroVideo(parseInt(dot.getAttribute("data-index"), 10));
      });
    });

    // Swipe support (touch) — swipe left = next, swipe right = previous
    var touchStartX = null;
    heroBg.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    heroBg.addEventListener("touchend", function (e) {
      if (touchStartX === null) return;
      var deltaX = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaX) > 40) {
        showHeroVideo(heroIndex + (deltaX < 0 ? 1 : -1));
      }
      touchStartX = null;
    }, { passive: true });
  }

  /* ---------- Contact form (submits via FormSubmit.co) ---------- */
  var contactForm = document.getElementById("contact-form");
  var successMessage = document.getElementById("form-success");
  var errorMessage = document.getElementById("form-error");

  // Pre-select "Service Required" when arriving via a service's "Learn more"
  // link, e.g. contact.html?service=window
  var serviceSelect = document.getElementById("service");
  if (serviceSelect) {
    var requestedService = new URLSearchParams(window.location.search).get("service");
    if (requestedService && serviceSelect.querySelector('option[value="' + requestedService + '"]')) {
      serviceSelect.value = requestedService;
    }
  }

  if (contactForm) {
    var submitBtn = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      if (errorMessage) errorMessage.classList.remove("show");
      if (successMessage) successMessage.classList.remove("show");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }

      fetch(contactForm.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(contactForm)
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Request failed");
          if (successMessage) {
            successMessage.classList.add("show");
            successMessage.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          contactForm.reset();
        })
        .catch(function () {
          if (errorMessage) {
            errorMessage.classList.add("show");
            errorMessage.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Request a Quote";
          }
        });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- Current year in footer ---------- */
  var yearEl = document.getElementById("current-year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }
})();
