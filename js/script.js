/* Grand Shine Cleaning — site scripts */
(function () {
  "use strict";

  /* ---------- Lock date pickers so past ("expired") dates can't be picked ---------- */
  (function () {
    var d = new Date();
    var todayISO = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    document.querySelectorAll('input[type="date"]').forEach(function (input) {
      input.min = todayISO;
    });
  })();

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

  /* ---------- Quote/contact forms (submit via FormSubmit.co) ---------- */
  // Shared by the standalone Contact page form and the Services page
  // "Learn more" popup form — both post to the same inbox.
  function bindQuoteForm(form, successMessage, errorMessage) {
    if (!form) return;
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalLabel = submitBtn ? submitBtn.textContent : "";

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (errorMessage) errorMessage.classList.remove("show");
      if (successMessage) successMessage.classList.remove("show");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }

      fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Request failed");
          if (successMessage) {
            successMessage.classList.add("show");
            successMessage.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          form.reset();
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
            submitBtn.textContent = originalLabel;
          }
        });
    });
  }

  // Pre-select "Service Required" when arriving via a service's "Learn more"
  // link, e.g. contact.html?service=window
  var serviceSelect = document.getElementById("service");
  if (serviceSelect) {
    var requestedService = new URLSearchParams(window.location.search).get("service");
    if (requestedService && serviceSelect.querySelector('option[value="' + requestedService + '"]')) {
      serviceSelect.value = requestedService;
    }
  }

  bindQuoteForm(
    document.getElementById("contact-form"),
    document.getElementById("form-success"),
    document.getElementById("form-error")
  );

  /* ---------- Services page: "Learn more" opens an in-page popup ---------- */
  /* with the service details on the left and a quote form on the right, */
  /* instead of navigating away to the Contact page. */
  var serviceModal = document.getElementById("service-modal");
  if (serviceModal) {
    var modalCloseBtn = document.getElementById("service-modal-close");
    var modalOverlay = serviceModal.querySelector("[data-modal-dismiss]");
    var modalIcon = document.getElementById("modal-service-icon");
    var modalBadge = document.getElementById("modal-service-badge");
    var modalTitle = document.getElementById("modal-service-title");
    var modalDesc = document.getElementById("modal-service-desc");
    var modalFeatures = document.getElementById("modal-service-features");
    var modalServiceSelect = document.getElementById("modal-service-select");
    var lastFocusedEl = null;

    /* ---------- Photo carousel (swipe/arrows/dots) ---------- */
    var carouselEl = document.getElementById("modal-carousel");
    var carouselTrack = document.getElementById("modal-carousel-track");
    var carouselDots = document.getElementById("modal-carousel-dots");
    var carouselPrev = document.getElementById("modal-carousel-prev");
    var carouselNext = document.getElementById("modal-carousel-next");
    var carouselSlide = 0;
    var carouselCount = 0;
    var touchStartX = null;
    var carouselTimer = null;
    var CAROUSEL_INTERVAL = 4000;

    function stopCarouselAutoplay() {
      if (carouselTimer) {
        clearInterval(carouselTimer);
        carouselTimer = null;
      }
    }

    function startCarouselAutoplay() {
      stopCarouselAutoplay();
      if (carouselCount > 1) {
        carouselTimer = setInterval(function () {
          goToSlide(carouselSlide + 1);
        }, CAROUSEL_INTERVAL);
      }
    }

    function goToSlide(index) {
      if (!carouselCount) return;
      carouselSlide = (index + carouselCount) % carouselCount;
      carouselTrack.style.transform = "translateX(-" + (carouselSlide * 100) + "%)";
      carouselDots.querySelectorAll(".modal-carousel-dot").forEach(function (dot, i) {
        dot.classList.toggle("active", i === carouselSlide);
      });
    }

    function renderCarousel(images) {
      carouselTrack.innerHTML = "";
      carouselDots.innerHTML = "";
      carouselSlide = 0;
      carouselCount = images.length;
      carouselEl.classList.toggle("single", carouselCount <= 1);

      images.forEach(function (photo, i) {
        var img = document.createElement("img");
        img.src = photo.src;
        img.alt = photo.alt || "";
        carouselTrack.appendChild(img);

        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "modal-carousel-dot" + (i === 0 ? " active" : "");
        dot.setAttribute("aria-label", "Go to photo " + (i + 1));
        dot.addEventListener("click", function () { goToSlide(i); startCarouselAutoplay(); });
        carouselDots.appendChild(dot);
      });
      carouselTrack.style.transform = "translateX(0)";
      startCarouselAutoplay();
    }

    if (carouselPrev) carouselPrev.addEventListener("click", function () { goToSlide(carouselSlide - 1); startCarouselAutoplay(); });
    if (carouselNext) carouselNext.addEventListener("click", function () { goToSlide(carouselSlide + 1); startCarouselAutoplay(); });
    if (carouselTrack) {
      carouselTrack.addEventListener("touchstart", function (e) {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });
      carouselTrack.addEventListener("touchend", function (e) {
        if (touchStartX === null) return;
        var deltaX = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(deltaX) > 40) goToSlide(carouselSlide + (deltaX < 0 ? 1 : -1));
        touchStartX = null;
        startCarouselAutoplay();
      });
    }
    if (carouselEl) {
      carouselEl.addEventListener("mouseenter", stopCarouselAutoplay);
      carouselEl.addEventListener("mouseleave", startCarouselAutoplay);
    }

    function openServiceModal(trigger) {
      var card = trigger.closest(".service-card");
      if (!card) return;

      var cardImageWrap = card.querySelector(".service-card-image");
      var cardImage = card.querySelector(".service-card-image img");
      var cardIcon = card.querySelector(".service-icon");
      var cardBadge = card.querySelector(".badge");
      var cardTitle = card.querySelector("h3");
      var cardDesc = card.querySelector(".service-card-body > p");
      var cardFeatures = card.querySelector(".service-features");
      var slug = trigger.getAttribute("data-service") || "";

      var galleryData = cardImageWrap ? cardImageWrap.getAttribute("data-gallery") : "";
      var images = galleryData
        ? galleryData.split(";;").map(function (entry) {
            var parts = entry.split("|");
            return { src: parts[0], alt: parts[1] || "" };
          })
        : cardImage
          ? [{ src: cardImage.src, alt: cardImage.alt }]
          : [];
      renderCarousel(images);

      if (cardIcon) modalIcon.innerHTML = cardIcon.innerHTML;
      if (cardBadge) modalBadge.textContent = cardBadge.textContent;
      if (cardTitle) modalTitle.textContent = cardTitle.textContent;
      if (cardDesc) modalDesc.textContent = cardDesc.textContent;
      if (cardFeatures) modalFeatures.innerHTML = cardFeatures.innerHTML;
      if (modalServiceSelect && slug && modalServiceSelect.querySelector('option[value="' + slug + '"]')) {
        modalServiceSelect.value = slug;
      }

      lastFocusedEl = trigger;
      serviceModal.classList.add("open");
      serviceModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      if (modalCloseBtn) modalCloseBtn.focus();
    }

    function closeServiceModal() {
      serviceModal.classList.remove("open");
      serviceModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      stopCarouselAutoplay();
      if (lastFocusedEl) lastFocusedEl.focus();
    }

    document.querySelectorAll(".js-learn-more").forEach(function (btn) {
      btn.addEventListener("click", function () { openServiceModal(btn); });
    });
    if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeServiceModal);
    if (modalOverlay) modalOverlay.addEventListener("click", closeServiceModal);
    document.addEventListener("keydown", function (e) {
      if (!serviceModal.classList.contains("open")) return;
      if (e.key === "Escape") closeServiceModal();
      if (e.key === "ArrowLeft") { goToSlide(carouselSlide - 1); startCarouselAutoplay(); }
      if (e.key === "ArrowRight") { goToSlide(carouselSlide + 1); startCarouselAutoplay(); }
    });

    bindQuoteForm(
      document.getElementById("modal-contact-form"),
      document.getElementById("modal-form-success"),
      document.getElementById("modal-form-error")
    );
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
