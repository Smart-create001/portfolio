const nav = document.querySelector(".hero-nav");
const revealElements = document.querySelectorAll(".reveal");
const heroImage = document.querySelector(".hero-background img");
const heroIndex = document.getElementById("heroIndex");
const heroIndexTrack = document.getElementById("heroIndexTrack");
const heroIndexItems = document.querySelectorAll(".hero-index-item");
const sectionAnchors = ["hero", "collections", "story", "contact"];
const sections = sectionAnchors
    .map((id) => document.getElementById(id))
    .filter(Boolean);
const rankingTrack = document.getElementById("rankingTrack");
const rankPrev = document.getElementById("rankPrev");
const rankNext = document.getElementById("rankNext");
const navToggle = document.getElementById("navToggle");
const heroLinks = document.getElementById("heroLinks");

let currentSlide = 0;
let activeSectionIndex = 0;
let heroIndexIdleTimer = null;

const wakeHeroIndex = (isSectionChange = false) => {
    if (!heroIndex) {
        return;
    }

    heroIndex.classList.remove("is-idle");
    heroIndex.classList.add("is-awake");

    if (isSectionChange) {
        heroIndex.classList.remove("is-section-change");
        void heroIndex.offsetWidth;
        heroIndex.classList.add("is-section-change");

        window.setTimeout(() => {
            heroIndex.classList.remove("is-section-change");
        }, 760);
    }

    if (heroIndexIdleTimer) {
        window.clearTimeout(heroIndexIdleTimer);
    }

    heroIndexIdleTimer = window.setTimeout(() => {
        heroIndex.classList.add("is-idle");
        heroIndex.classList.remove("is-awake");
    }, 1000);
};

const setMenu = (open) => {
    if (!navToggle || !heroLinks) {
        return;
    }
    heroLinks.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    const icon = navToggle.querySelector("i");
    if (icon) {
        icon.className = open ? "uil uil-times" : "uil uil-bars";
    }
};

if (navToggle && heroLinks) {
    navToggle.addEventListener("click", () => {
        setMenu(!heroLinks.classList.contains("is-open"));
    });

    heroLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setMenu(false));
    });

    // Tap outside the menu closes it
    document.addEventListener("click", (event) => {
        if (
            heroLinks.classList.contains("is-open") &&
            !heroLinks.contains(event.target) &&
            !navToggle.contains(event.target)
        ) {
            setMenu(false);
        }
    });

    // Escape key closes it
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setMenu(false);
        }
    });
}

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
    let nextSectionIndex = 0;

    sections.forEach((section, index) => {
        if (currentY >= section.offsetTop) {
            nextSectionIndex = index;
        }
    });

    heroIndexItems.forEach((item, index) => {
        item.classList.toggle("is-active", index === nextSectionIndex);
    });

    heroIndexTrack.style.transform = `translateY(-${nextSectionIndex * 2.05}rem)`;

    if (nextSectionIndex !== activeSectionIndex) {
        activeSectionIndex = nextSectionIndex;
        wakeHeroIndex(true);
        return;
    }

    wakeHeroIndex(false);
};

const getVisibleCards = () =>
    window.innerWidth <= 760 ? 1 : window.innerWidth <= 980 ? 2 : 3;

const getTotalSlides = () =>
    rankingTrack ? rankingTrack.querySelectorAll(".rank-card").length : 0;

const getMaxSlide = () => Math.max(0, getTotalSlides() - getVisibleCards());

const getSlideWidth = () => {
    if (!rankingTrack) {
        return 0;
    }
    const firstCard = rankingTrack.querySelector(".rank-card");
    if (!firstCard) {
        return 0;
    }
    const style = window.getComputedStyle(rankingTrack);
    const gap = parseFloat(style.columnGap || style.gap || "16");
    return firstCard.getBoundingClientRect().width + gap;
};

// --- Pagination dots (mainly for mobile) ---
let sliderDots = null;
if (rankingTrack) {
    const viewport = rankingTrack.closest(".ranking-viewport");
    const slider = rankingTrack.closest(".ranking-slider");
    if (slider && viewport) {
        sliderDots = document.createElement("div");
        sliderDots.className = "slider-dots";
        sliderDots.setAttribute("role", "tablist");
        sliderDots.setAttribute("aria-label", "Collection pages");
        viewport.insertAdjacentElement("afterend", sliderDots);
    }
}

let renderedDotCount = -1;
const renderDots = () => {
    if (!sliderDots) {
        return;
    }
    const count = getMaxSlide() + 1;
    if (count === renderedDotCount) {
        return;
    }
    renderedDotCount = count;
    sliderDots.innerHTML = "";
    for (let i = 0; i < count; i += 1) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Go to collection ${i + 1}`);
        dot.addEventListener("click", () => goToSlide(i));
        sliderDots.appendChild(dot);
    }
};

const updateDots = () => {
    if (!sliderDots) {
        return;
    }
    Array.from(sliderDots.children).forEach((dot, i) => {
        dot.classList.toggle("is-active", i === currentSlide);
    });
};

const syncSlider = () => {
    if (!rankingTrack) {
        return;
    }
    renderDots();
    rankingTrack.style.transform = `translateX(-${currentSlide * getSlideWidth()}px)`;

    const maxSlide = getMaxSlide();
    if (rankPrev) {
        rankPrev.classList.toggle("is-disabled", currentSlide <= 0);
    }
    if (rankNext) {
        rankNext.classList.toggle("is-disabled", currentSlide >= maxSlide);
    }
    updateDots();
};

const goToSlide = (index) => {
    currentSlide = Math.min(Math.max(0, index), getMaxSlide());
    syncSlider();
};

if (rankPrev) {
    rankPrev.addEventListener("click", () => goToSlide(currentSlide - 1));
}

if (rankNext) {
    rankNext.addEventListener("click", () => goToSlide(currentSlide + 1));
}

// --- Touch / pointer swipe ---
const viewportEl = rankingTrack ? rankingTrack.closest(".ranking-viewport") : null;
if (viewportEl && rankingTrack) {
    let startX = 0;
    let startY = 0;
    let baseOffset = 0;
    let dragging = false;
    let axisLocked = false;
    let moved = false;

    const onDown = (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }
        startX = event.clientX;
        startY = event.clientY;
        baseOffset = -currentSlide * getSlideWidth();
        dragging = true;
        axisLocked = false;
        moved = false;
    };

    const onMove = (event) => {
        if (!dragging) {
            return;
        }
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        // Decide once whether this is a horizontal swipe or a vertical scroll
        if (!axisLocked) {
            if (Math.abs(dx) < 6 && Math.abs(dy) < 6) {
                return;
            }
            if (Math.abs(dy) > Math.abs(dx)) {
                dragging = false; // let the page scroll vertically
                return;
            }
            axisLocked = true;
            viewportEl.classList.add("is-dragging");
            rankingTrack.classList.add("is-dragging");
        }

        moved = true;
        const max = getMaxSlide() * getSlideWidth();
        let next = baseOffset + dx;
        // soft resistance past the edges
        if (next > 0) {
            next *= 0.35;
        } else if (next < -max) {
            next = -max + (next + max) * 0.35;
        }
        rankingTrack.style.transform = `translateX(${next}px)`;
    };

    const onUp = (event) => {
        if (!dragging && !axisLocked) {
            return;
        }
        dragging = false;
        viewportEl.classList.remove("is-dragging");
        rankingTrack.classList.remove("is-dragging");

        if (axisLocked) {
            const dx = event.clientX - startX;
            const threshold = Math.max(40, getSlideWidth() * 0.18);
            if (dx <= -threshold) {
                goToSlide(currentSlide + 1);
            } else if (dx >= threshold) {
                goToSlide(currentSlide - 1);
            } else {
                syncSlider(); // snap back
            }
        }
        axisLocked = false;
    };

    viewportEl.addEventListener("pointerdown", onDown);
    viewportEl.addEventListener("pointermove", onMove);
    viewportEl.addEventListener("pointerup", onUp);
    viewportEl.addEventListener("pointercancel", onUp);
    viewportEl.addEventListener("pointerleave", onUp);

    // Prevent an accidental card tap from navigating after a real swipe
    rankingTrack.addEventListener(
        "click",
        (event) => {
            if (moved) {
                event.preventDefault();
                event.stopPropagation();
                moved = false;
            }
        },
        true
    );
}

window.addEventListener("scroll", () => {
    syncNav();
    syncParallax();
    syncHeroIndex();
});

window.addEventListener("resize", () => {
    currentSlide = Math.min(currentSlide, getMaxSlide());
    syncSlider();
    wakeHeroIndex(false);
});

syncNav();
syncParallax();
syncHeroIndex();
syncSlider();
