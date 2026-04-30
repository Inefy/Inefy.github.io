const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const counters = document.querySelectorAll("[data-count]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion && counters.length > 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const target = entry.target;
      const end = Number(target.dataset.count);
      let current = 0;
      const step = () => {
        current += 1;
        target.textContent = String(current);
        if (current < end) {
          window.requestAnimationFrame(step);
        }
      };

      step();
      observer.unobserve(target);
    });
  }, { threshold: 0.5 });

  counters.forEach((counter) => observer.observe(counter));
}
