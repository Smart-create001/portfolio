const collectionHeader = document.getElementById("header");
const collectionRevealItems = document.querySelectorAll(".reveal");
const collectionNavToggle = document.getElementById("collectionNavToggle");
const collectionLinks = document.getElementById("collectionLinks");

const setCollectionMenu = (open) => {
    if (!collectionNavToggle || !collectionLinks) {
        return;
    }
    collectionLinks.classList.toggle("is-open", open);
    collectionNavToggle.setAttribute("aria-expanded", String(open));
    const icon = collectionNavToggle.querySelector("i");
    if (icon) {
        icon.className = open ? "uil uil-times" : "uil uil-bars";
    }
};

if (collectionNavToggle && collectionLinks) {
    collectionNavToggle.addEventListener("click", () => {
        setCollectionMenu(!collectionLinks.classList.contains("is-open"));
    });

    collectionLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setCollectionMenu(false));
    });

    document.addEventListener("click", (event) => {
        if (
            collectionLinks.classList.contains("is-open") &&
            !collectionLinks.contains(event.target) &&
            !collectionNavToggle.contains(event.target)
        ) {
            setCollectionMenu(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setCollectionMenu(false);
        }
    });
}

const collectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                collectionObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.2
    }
);

collectionRevealItems.forEach((item) => collectionObserver.observe(item));

const syncCollectionHeader = () => {
    if (!collectionHeader) {
        return;
    }

    collectionHeader.classList.toggle("is-scrolled", window.scrollY > 20);
};

window.addEventListener("scroll", syncCollectionHeader);
syncCollectionHeader();
