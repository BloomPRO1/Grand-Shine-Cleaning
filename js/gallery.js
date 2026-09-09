/* ---------- Gallery: live photos from Google Drive ----------
   The business owner just drops photos into a shared Drive folder;
   this fetches that folder's image list client-side and renders it.
   No key here can write, delete, or see anything outside this one
   folder, and it only works because the folder is link-shared.

   Setup required (see project notes): the Drive folder must be shared
   as "Anyone with the link – Viewer", and DRIVE_API_KEY below must be
   a Google Cloud API key restricted to the Drive API + this site's
   domain(s). */

(function () {
  "use strict";

  var DRIVE_FOLDER_ID = "1dv7J3JLVxEF3GKZ92K4zdDz6M6lae2cc";
  var DRIVE_API_KEY = "AIzaSyCRKbUEQYI9XBeGsxslNrgFiZMqV0kPujk";

  var loadingEl = document.getElementById("gallery-loading");
  var gridEl = document.getElementById("gallery-grid");
  var emptyEl = document.getElementById("gallery-empty");

  if (!gridEl) return; // not on the gallery page

  function showEmpty() {
    if (loadingEl) loadingEl.hidden = true;
    if (emptyEl) emptyEl.hidden = false;
  }

  if (!DRIVE_API_KEY || DRIVE_API_KEY.indexOf("PASTE_") === 0) {
    showEmpty();
    return;
  }

  var photos = []; // { id, name }

  function driveImageUrl(id, width) {
    return "https://lh3.googleusercontent.com/d/" + id + "=w" + width;
  }

  function renderGrid() {
    var frag = document.createDocumentFragment();

    photos.forEach(function (photo, index) {
      var item = document.createElement("button");
      item.type = "button";
      item.className = "gallery-item reveal in-view";
      item.setAttribute("data-index", index);

      var img = document.createElement("img");
      img.src = driveImageUrl(photo.id, 600);
      img.alt = photo.name || "Grand Shine Cleaning project photo";
      img.loading = "lazy";

      item.appendChild(img);
      item.addEventListener("click", function () { openLightbox(index); });
      frag.appendChild(item);
    });

    gridEl.appendChild(frag);
    if (loadingEl) loadingEl.hidden = true;
    gridEl.hidden = false;
  }

  function fetchPhotos() {
    var q = "'" + DRIVE_FOLDER_ID + "' in parents and trashed = false and mimeType contains 'image/'";
    var url = "https://www.googleapis.com/drive/v3/files"
      + "?q=" + encodeURIComponent(q)
      + "&fields=" + encodeURIComponent("files(id,name)")
      + "&orderBy=" + encodeURIComponent("createdTime desc")
      + "&pageSize=100"
      + "&key=" + encodeURIComponent(DRIVE_API_KEY);

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("Drive API error " + res.status);
        return res.json();
      })
      .then(function (data) {
        photos = (data.files || []);
        if (!photos.length) {
          showEmpty();
          return;
        }
        renderGrid();
      })
      .catch(function (err) {
        console.error("Gallery: could not load photos from Drive.", err);
        showEmpty();
      });
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImage = document.getElementById("lightbox-image");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxClose = document.getElementById("lightbox-close");
  var lightboxPrev = document.getElementById("lightbox-prev");
  var lightboxNext = document.getElementById("lightbox-next");
  var currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  function updateLightbox() {
    var photo = photos[currentIndex];
    if (!photo) return;
    lightboxImage.src = driveImageUrl(photo.id, 1600);
    lightboxImage.alt = photo.name || "Grand Shine Cleaning project photo";
    lightboxCaption.textContent = photo.name || "";
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + photos.length) % photos.length;
    updateLightbox();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % photos.length;
    updateLightbox();
  }

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener("click", showPrev);
  if (lightboxNext) lightboxNext.addEventListener("click", showNext);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (!lightbox || lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "ArrowRight") showNext();
  });

  fetchPhotos();
})();
