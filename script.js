// 🔥 CAMBIO DE PANTALLAS
function openScreen(type){

  // Ocultar todas las pantallas
  document.querySelectorAll(".screen").forEach(screen=>{
    screen.classList.remove("active");
  });

  // 📅 CALENDARIO (pantalla interna)
  if(type === "calendar"){
    document.getElementById("calendarScreen").classList.add("active");
    return;
  }

  // 📂 DRIVE / ONEDRIVE (SALIR DE LA APP)
  if(type === "drive"){
    window.location.href = "https://1drv.ms/f/c/55b6a939d4276db6/ErZtJ9Q5qbYggFX4OQAAAAABVtoRkonNs_t";
    return;
  }

  // 🌐 PÁGINAS INTERNAS (iframe)
  const urls = {
    cargas: "https://josemanueljaimemorales.github.io/Cargas-sistemas-y-fuerzas/",
    fuerza: "https://josemanueljaimemorales.github.io/AKC-CON-REPORTE/",
    rutinas: "https://josemanueljaimemorales.github.io/RutinasAKC/",
    trabajo: "https://josemanueljaimemorales.github.io/TRABAJOGAVAKC/",
    basicos: "https://josemanueljaimemorales.github.io/Basicos_AKC/"
  };

  // Mostrar viewer si existe URL
  if(urls[type]){
    document.getElementById("viewerFrame").src = urls[type];
    document.getElementById("viewerScreen").classList.add("active");
  }
}

// 🔙 REGRESAR AL HOME
function goHome(){

  document.querySelectorAll(".screen").forEach(screen=>{
    screen.classList.remove("active");
  });

  document.getElementById("home").classList.add("active");

  // Limpiar iframe
  document.getElementById("viewerFrame").src = "";
}

// 🔥 INICIO LIMPIO SIEMPRE EN HOME
window.addEventListener("load", () => {

  document.querySelectorAll(".screen").forEach(screen=>{
    screen.classList.remove("active");
  });

  document.getElementById("home").classList.add("active");

});
