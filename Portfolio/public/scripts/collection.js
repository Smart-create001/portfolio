const collectionHeader = document.getElementById("header");
const collectionRevealItems = document.querySelectorAll(".reveal");

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
