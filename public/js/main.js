//NOTIFICATIONS
const msgs = document.querySelectorAll(".alert");

msgs.forEach((msg) => {
  msg.style.display = "block";
  setTimeout(deleteMsgs, 5000);
  function deleteMsgs() {
    msg.style.display = "none";
  }
});

//OPEN/CLOSE MENU
const openMenu = document.querySelector("#open-menu");
const openMenuButton = document.querySelector("#menu");

const categories = document.querySelectorAll("#category-menu");

openMenuButton.addEventListener("click", () => {
  openMenu.style.display = "flex";
  openMenu.classList.add("animation-open-menu");
});

categories.forEach((category) => {
  category.addEventListener("click", () => {
    openMenu.classList.remove("animation-open-menu");
    openMenu.classList.add("animation-close-menu");
    setTimeout(() => {
      openMenu.classList.remove("animation-close-menu");
      openMenu.style.display = "none";
    }, 1000);
  });
});
