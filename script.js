function openScreen(type){

  // 🔴 Oculta TODAS las pantallas primero
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));

  // 📅 Calendario (pantalla interna)
  if(type==="calendar"){
    document.getElementById("calendarScreen").classList.add("active");
    return;
  }

  // 🌐 URLs externas
  const urls = {
    cargas: "https://josemanueljaimemorales.github.io/Cargas-sistemas-y-fuerzas/",
    fuerza: "https://josemanueljaimemorales.github.io/AKC-CON-REPORTE/",
    rutinas: "https://josemanueljaimemorales.github.io/RutinasAKC/",
    trabajo: "https://josemanueljaimemorales.github.io/TRABAJOGAVAKC/",
    basicos: "https://josemanueljaimemorales.github.io/Basicos_AKC/",
    drive: "https://1drv.ms/f/c/55b6a939d4276db6/ErZtJ9Q5qbYggFX4OQAAAAABVtoRkonNs_t"
  };

  // 📺 Abrir en el viewer
  if(urls[type]){
    document.getElementById("viewerFrame").src = urls[type];
    document.getElementById("viewerScreen").classList.add("active");
  }
}

// 🏠 Regresar al home
function goHome(){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById("home").classList.add("active");

  // 🔄 Limpia el iframe (opcional pero pro)
  document.getElementById("viewerFrame").src = "";
}
