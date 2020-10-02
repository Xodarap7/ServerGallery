const btns = document.querySelectorAll("#btn");

btns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    if (confirm("Вы уверены?")) {
      return;
    } else {
      e.preventDefault();
    }
  });
});
