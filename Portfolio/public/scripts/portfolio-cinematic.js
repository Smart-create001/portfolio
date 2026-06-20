const nav = document.querySelector(".hero-nav");
const revealElements = document.querySelectorAll(".reveal");
const heroImage = document.querySelector(".hero-background img");
const heroIndexTrack = document.getElementById("heroIndexTrack");
const heroIndexItems = document.querySelectorAll(".hero-index-item");
const sectionAnchors = ["hero", "collections", "story", "contact"];
const sections = sectionAnchors
    .map((id) => document.getElementById(id))
    .filter(Boolean);
const rankingTrack = document.getElementById("rankingTrack");
const rankPrev = document.getElementById("rankPrev");
const rankNext = document.getElementById("rankNext");

let currentSlide = 0;

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.2
    }
);

revealElements.forEach((element) => revealObserver.observe(element));

const syncNav = () => {
    if (!nav) {
        return;
    }

    nav.classList.toggle("is-scrolled", window.scrollY > 24);
};

const syncParallax = () => {
    if (!heroImage) {
        return;
    }

    const offset = Math.min(window.scrollY * 0.08, 26);
    heroImage.style.transform = `scale(1.08) translateY(${offset}px)`;
};

const syncHeroIndex = () => {
    if (!heroIndexTrack || !heroIndexItems.length || !sections.length) {
        return;
    }

    const currentY = window.scrollY + window.innerHeight * 0.35;
    let activeIndex = 0;

    sections.forEach((section, index) => {
        if (currentY >= section.offsetTop) {
            activeIndex = index;
        }
    });

    heroIndexItems.forEach((item, index) => {
        item.classList.toggle("is-active", index === activeIndex);
    });

    heroIndexTrack.style.transform = `translateY(-${activeIndex * 2.05}rem)`;
};

const syncSlider = () => {
    if (!rankingTrack) {
        return;
    }

    const firstCard = rankingTrack.querySelector(".rank-card");
    if (!firstCard) {
        return;
    }

    const style = window.getComputedStyle(rankingTrack);
    const gap = parseFloat(style.columnGap || style.gap || "16");
    const slideWidth = firstCard.getBoundingClientRect().width + gap;
    rankingTrack.style.transform = `translateX(-${currentSlide * slideWidth}px)`;

    const totalSlides = rankingTrack.querySelectorAll(".rank-card").length;
    const visibleCards = window.innerWidth <= 760 ? 1 : window.innerWidth <= 980 ? 2 : 3;
    const maxSlide = Math.max(0, totalSlides - visibleCards);

    if (rankPrev) {
        rankPrev.classList.toggle("is-disabled", currentSlide <= 0);
    }

    if (rankNext) {
        rankNext.classList.toggle("is-disabled", currentSlide >= maxSlide);
    }
};

if (rankPrev) {
    rankPrev.addEventListener("click", () => {
        currentSlide = Math.max(0, currentSlide - 1);
        syncSlider();
    });
}

if (rankNext) {
    rankNext.addEventListener("click", () => {
        const totalSlides = rankingTrack ? rankingTrack.querySelectorAll(".rank-card").length : 0;
        const visibleCards = window.innerWidth <= 760 ? 1 : window.innerWidth <= 980 ? 2 : 3;
        const maxSlide = Math.max(0, totalSlides - visibleCards);
        currentSlide = Math.min(maxSlide, currentSlide + 1);
        syncSlider();
    });
}

window.addEventListener("scroll", () => {
    syncNav();
    syncParallax();
    syncHeroIndex();
});

window.addEventListener("resize", () => {
    const totalSlides = rankingTrack ? rankingTrack.querySelectorAll(".rank-card").length : 0;
    const visibleCards = window.innerWidth <= 760 ? 1 : window.innerWidth <= 980 ? 2 : 3;
    const maxSlide = Math.max(0, totalSlides - visibleCards);
    currentSlide = Math.min(currentSlide, maxSlide);
    syncSlider();
});

syncNav();
syncParallax();
syncHeroIndex();
syncSlider();
