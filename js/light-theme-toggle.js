let currentTheme = localStorage.getItem("theme") || "dark";
document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        const bodyElement = document.body;
        bodyElement.classList.add("theme-transition");
      }, 300);
});

function pickTheme() {
    switch (currentTheme) {
        case "dark":
            root.classList.remove("dark");
            root.classList.add("light");
            localStorage.setItem("theme", "light");
            currentTheme = "light";
            break;

        case "light":
            root.classList.remove("light");
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
            currentTheme = "dark";
    }
}