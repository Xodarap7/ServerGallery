const icons = document.querySelectorAll(".material-icons");

icons.forEach((icon) => {
  icon.addEventListener("click", (e) => {
    if (confirm("Вы уверены?")) {
      return;
    } else {
      e.preventDefault();
    }
  });
});
