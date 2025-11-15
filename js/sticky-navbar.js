const navbar = document.querySelector("header");
const navbarContainer = document.querySelector("header > .container");

window.addEventListener("scroll", function() {
    navbar.classList.toggle("fixed", window.scrollY > 0);
})