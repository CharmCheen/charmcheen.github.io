document.addEventListener("DOMContentLoaded", () => {
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    const navigationLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')]
        .filter((link) => {
            const href = link.getAttribute("href");
            return href && href.length > 1;
        });
    const sections = navigationLinks
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    if (!("IntersectionObserver" in window) || sections.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        const visibleSection = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visibleSection) return;

        navigationLinks.forEach((link) => {
            const isCurrent = link.getAttribute("href") === `#${visibleSection.target.id}`;
            if (isCurrent) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
        });
    }, {
        rootMargin: "-20% 0px -65%",
        threshold: [0, 0.2, 0.5]
    });

    sections.forEach((section) => observer.observe(section));
});
