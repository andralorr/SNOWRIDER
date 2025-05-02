document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("toggle-tema-global");
    const icon = document.getElementById("icon-tema-global");
    const body = document.body;
    const coverImg = document.getElementById("cover-img");

    function updateCoverImage(mode) {
        if (coverImg) {
            if (mode === "dark") {
                coverImg.src = "resurse/imagini/cover/cover-dark1366px.png";
                coverImg.srcset = `
                    resurse/imagini/cover/cover-dark200px.png 200w,
                    resurse/imagini/cover/cover-dark1366px.png 1366w
                `;
            } else {
                coverImg.src = "resurse/imagini/cover/cover1366px.png";
                coverImg.srcset = `
                    resurse/imagini/cover/cover200px.png 200w,
                    resurse/imagini/cover/cover1366px.png 1366w
                `;
            }
        }
    }

    const savedTheme = localStorage.getItem("tema-site") || "light";
    body.setAttribute("data-theme", savedTheme);
    toggle.checked = savedTheme === "dark";
    icon.classList.toggle("bi-moon", savedTheme !== "dark");
    icon.classList.toggle("bi-sun", savedTheme === "dark");
    updateCoverImage(savedTheme);

    toggle.addEventListener("change", function () {
        const isDark = toggle.checked;
        const mode = isDark ? "dark" : "light";
        body.setAttribute("data-theme", mode);
        icon.classList.toggle("bi-moon", !isDark);
        icon.classList.toggle("bi-sun", isDark);
        localStorage.setItem("tema-site", mode);
        updateCoverImage(mode);
    });
});
