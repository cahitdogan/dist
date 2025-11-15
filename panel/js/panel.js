const burgerButton = document.getElementById("burger-button");
const drawerRoot = document.getElementById("drawer-root")
const backdrop = document.getElementById("drawer-backdrop");
const drawer = document.getElementById("drawer");
const drawerCloseButton = document.querySelector("#drawer #top-container button");

burgerButton.addEventListener("click", () => {
    drawerRoot.style.visibility = "visible";
    drawer.style.transform = "translateX(0%)";
})

backdrop.addEventListener("click", () => {
    drawer.style.transform = "translateX(100%)";
    setTimeout(()=>drawerRoot.style.visibility = "hidden", 150);
});

drawerCloseButton.addEventListener("click", () => {
    drawer.style.transform = "translateX(100%)";
    setTimeout(()=>drawerRoot.style.visibility = "hidden", 150);
});