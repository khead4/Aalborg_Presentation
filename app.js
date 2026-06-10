const slides = Array.from(document.querySelectorAll(".slide"));
const slideNav = document.getElementById("slideNav");
const prevSlide = document.getElementById("prevSlide");
const nextSlide = document.getElementById("nextSlide");
const slideCount = document.getElementById("slideCount");
const progressBar = document.getElementById("progressBar");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalCopy = document.getElementById("modalCopy");
const modalLaunch = document.getElementById("modalLaunch");
const previewPane = document.getElementById("previewPane");
const livePane = document.getElementById("livePane");
const tabs = Array.from(document.querySelectorAll(".tab"));

let activeIndex = 0;

function pad(value) {
  return String(value).padStart(2, "0");
}

function buildNav() {
  slideNav.innerHTML = slides.map((slide, index) => `
    <button class="nav-item ${index === activeIndex ? "active" : ""}" type="button" data-slide="${index}">
      <span>${pad(index + 1)}</span>
      <strong>${slide.dataset.title || `Slide ${index + 1}`}</strong>
    </button>
  `).join("");
}

function updateSlide(index) {
  activeIndex = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === activeIndex);
  });
  Array.from(document.querySelectorAll(".nav-item")).forEach((item, itemIndex) => {
    item.classList.toggle("active", itemIndex === activeIndex);
  });
  slideCount.textContent = `${pad(activeIndex + 1)} / ${pad(slides.length)}`;
  progressBar.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
  const url = new URL(window.location.href);
  url.searchParams.set("slide", String(activeIndex + 1));
  window.history.replaceState({}, "", url);
}

function setTab(tabName) {
  tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.tab === tabName));
  document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
  document.getElementById(`${tabName}Pane`)?.classList.add("active");
}

function openModal(trigger) {
  const title = trigger.dataset.title || "Preview";
  const copy = trigger.dataset.copy || "";
  const src = trigger.dataset.src || "";
  const img = trigger.dataset.img || "";

  modalTitle.textContent = title;
  modalCopy.textContent = copy;
  modalLaunch.href = src || "#";
  modalLaunch.style.display = src ? "inline-flex" : "none";

  if (img) {
    previewPane.innerHTML = `<img src="${img}" alt="${title} preview">`;
  } else {
    previewPane.innerHTML = `<div class="fallback-preview"><div><strong>${title}</strong><p>${copy || "Open the live tab for this source."}</p></div></div>`;
  }

  if (src) {
    livePane.innerHTML = `<iframe src="${src}" title="${title} live view" loading="lazy"></iframe>`;
  } else {
    livePane.innerHTML = `<div class="fallback-preview">No live source is attached to this view.</div>`;
  }

  setTab("preview");
  modal.hidden = false;
}

function closeModal() {
  modal.hidden = true;
  livePane.innerHTML = "";
}

function initialSlideIndex() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = Number(params.get("slide"));
  if (Number.isFinite(fromQuery) && fromQuery > 0) return fromQuery - 1;
  const fromHash = Number(window.location.hash.replace("#", ""));
  if (Number.isFinite(fromHash) && fromHash > 0) return fromHash - 1;
  return 0;
}

buildNav();
updateSlide(initialSlideIndex());

slideNav.addEventListener("click", event => {
  const button = event.target.closest("[data-slide]");
  if (button) updateSlide(Number(button.dataset.slide));
});

prevSlide.addEventListener("click", () => updateSlide(activeIndex - 1));
nextSlide.addEventListener("click", () => updateSlide(activeIndex + 1));

document.addEventListener("keydown", event => {
  if (!modal.hidden && event.key === "Escape") {
    closeModal();
    return;
  }
  if (!modal.hidden) return;
  if (event.key === "ArrowRight" || event.key === "PageDown") updateSlide(activeIndex + 1);
  if (event.key === "ArrowLeft" || event.key === "PageUp") updateSlide(activeIndex - 1);
  if (event.key === "Home") updateSlide(0);
  if (event.key === "End") updateSlide(slides.length - 1);
});

document.querySelectorAll("[data-open-modal]").forEach(trigger => {
  trigger.addEventListener("click", () => openModal(trigger));
});

document.querySelectorAll("[data-close-modal]").forEach(button => {
  button.addEventListener("click", closeModal);
});

tabs.forEach(tab => {
  tab.addEventListener("click", () => setTab(tab.dataset.tab));
});

document.querySelectorAll("[data-carousel]").forEach(carousel => {
  const track = carousel.querySelector(".carousel-track");
  const prev = carousel.querySelector(".prev");
  const next = carousel.querySelector(".next");

  const scrollByCard = direction => {
    const card = track.querySelector("article");
    const amount = card ? card.getBoundingClientRect().width + 18 : 420;
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  };

  prev?.addEventListener("click", event => {
    event.stopPropagation();
    scrollByCard(-1);
  });
  next?.addEventListener("click", event => {
    event.stopPropagation();
    scrollByCard(1);
  });
});
