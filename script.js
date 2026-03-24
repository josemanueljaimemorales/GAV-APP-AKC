function openLink(type) {

  let url = "";

  if (type === "fuerza") {
    url = "https://josemanueljaimemorales.github.io/AKC_PRO_MASTER/";
  }

  if (type === "rutinas") {
    url = "https://josemanueljaimemorales.github.io/RutinasAKC/";
  }

  if (type === "trabajo") {
    url = "https://josemanueljaimemorales.github.io/TRABAJOGAVAKC/";
  }

  document.getElementById("viewer").innerHTML =
    `<iframe src="${url}"></iframe>`;

  window.scrollTo(0, document.body.scrollHeight);
}

function toggleCalendar() {
  document.getElementById("calendar").classList.toggle("hidden");
}
