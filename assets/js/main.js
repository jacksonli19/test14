const navMenu = document.getElementById("nav-menu");
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.querySelectorAll(".nav__link");
const header = document.getElementById("header");
const sections = document.querySelectorAll("section[id]");
const homeSection = document.querySelector(".home");
const typingTitles = document.querySelectorAll(".home .section__title");
const scrollFxElements = document.querySelectorAll(".section__header, .intro__content, .about__content, .notice .container, .course-card");

navToggle?.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("show-menu");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("show-menu");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

const updateHeader = () => {
  header.classList.toggle("shadow-header", window.scrollY >= 40);
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const updateActiveLink = () => {
  if (sections.length === 0) {
    return;
  }

  let currentSection = sections[0];

  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 180) {
      currentSection = section;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${currentSection.id}`);
  });
};

window.addEventListener("scroll", updateActiveLink, { passive: true });
updateActiveLink();

if (homeSection) {
  homeSection.addEventListener("pointermove", (event) => {
    const rect = homeSection.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    homeSection.style.setProperty("--mx", `${x}%`);
    homeSection.style.setProperty("--my", `${y}%`);
  });
}

const typeTitle = (title) => {
  if (title.dataset.typed === "true") {
    return;
  }

  const fullText = title.dataset.typingText;
  let index = 0;
  title.dataset.typed = "true";

  const typeNextCharacter = () => {
    index += 1;
    title.textContent = fullText.slice(0, index);

    if (index < fullText.length) {
      window.setTimeout(typeNextCharacter, 42);
    }
  };

  typeNextCharacter();
};

const typingObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        typeTitle(entry.target);
        typingObserver.unobserve(entry.target);
      }
    });
  },
  {
    rootMargin: "0px 0px 10% 0px",
    threshold: 0.18,
  }
);

typingTitles.forEach((title) => {
  const fullText = title.textContent.trim();
  title.dataset.typingText = fullText;
  title.setAttribute("aria-label", fullText);
  title.style.minHeight = `${title.getBoundingClientRect().height}px`;
  title.textContent = "";
  title.classList.add("typing-title");
  typingObserver.observe(title);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        return;
      }

      if (entry.boundingClientRect.top > 0) {
        entry.target.classList.remove("is-visible");
      }
    });
  },
  {
    rootMargin: "0px 0px 12% 0px",
    threshold: 0.12,
  }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

scrollFxElements.forEach((element) => {
  element.classList.add("is-scroll-fx");

  const section = element.closest("section");

  if (element.classList.contains("section__header")) {
    const sectionId = section?.id;
    const focusSections = ["home", "usage", "about"];
    element.dataset.fx = focusSections.includes(sectionId) ? "focus" : "sweep";
  }

  if (element.matches(".notice .container")) {
    element.dataset.fx = "notice";
  }
});

const updateScrollFx = () => {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  if (homeSection) {
    const rect = homeSection.getBoundingClientRect();
    const progress = clamp((0 - rect.top) / Math.max(1, rect.height - viewportHeight * .2));
    homeSection.style.setProperty("--scroll-zoom", progress.toFixed(3));
  }

  scrollFxElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    let progress = clamp((viewportHeight * .92 - rect.top) / (viewportHeight * .72));

    if (rect.bottom <= viewportHeight * 1.03 && rect.top >= 0) {
      progress = 1;
    }

    element.style.setProperty("--scroll-reveal", easeOutCubic(progress).toFixed(3));
  });
};

let scrollFrame = 0;
const requestScrollFx = () => {
  if (scrollFrame) {
    return;
  }

  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = 0;
    updateScrollFx();
  });
};

window.addEventListener("scroll", requestScrollFx, { passive: true });
window.addEventListener("resize", requestScrollFx);
window.addEventListener("load", requestScrollFx);
updateScrollFx();
