// 🔥 CAMBIO DE PANTALLAS
function openScreen(type){

  // Ocultar todas las pantallas
  document.querySelectorAll(".screen").forEach(screen=>{
    screen.classList.remove("active");
  });

  // 👉 Pantalla interna (calendario)
  if(type === "calendar"){
    document.getElementById("calendarScreen").classList.add("active");
    return;
  }

  // 👉 Enlace externo (Drive)
  if(type === "drive"){
    window.location.href = "https://1drv.ms/";
    return;
  }

  // 👉 URLs que se abren dentro de la app
  const urls = {
    cargas: "https://josemanueljaimemorales.github.io/Cargas-sistemas-y-fuerzas/",
    fuerza: "https://josemanueljaimemorales.github.io/AKC-CON-REPORTE/",
    rutinas: "https://josemanueljaimemorales.github.io/RutinasAKC/",
    trabajo: "https://josemanueljaimemorales.github.io/TRABAJOGAVAKC/",
    basicos: "https://josemanueljaimemorales.github.io/Basicos_AKC/"
  };

  // 👉 Mostrar pantalla viewer
  if(urls[type]){
    document.getElementById("viewerFrame").src = urls[type];
    document.getElementById("viewerScreen").classList.add("active");
  }
}

// 🔙 REGRESAR AL HOME
function goHome(){

  // Ocultar todo
  document.querySelectorAll(".screen").forEach(screen=>{
    screen.classList.remove("active");
  });

  // Mostrar home
  document.getElementById("home").classList.add("active");

  // Limpiar iframe
  document.getElementById("viewerFrame").src = "";
}

// 🔥 ASEGURAR INICIO LIMPIO
window.addEventListener("load", () => {

  document.querySelectorAll(".screen").forEach(screen=>{
    screen.classList.remove("active");
  });

  document.getElementById("home").classList.add("active");

});
