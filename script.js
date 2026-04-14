function openScreen(type){

  // 🔴 Oculta todas las pantallas
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));

  // 📅 Pantalla interna (calendario)
  if(type==="calendar"){
    document.getElementById("calendarScreen").classList.add("active");
    return;
  }

  // ☁️ OneDrive (NO funciona en iframe)
  if(type==="drive"){
    window.location.href = "https://1drv.ms/f/c/55b6a939d4276db6/ErZtJ9Q5qbYggFX4OQAAAAABVtoRkonNs_t";
    return;
  }

  // 🌐 URLs externas (iframe)
  const urls = {
    cargas: "https://josemanueljaimemorales.github.io/Cargas-sistemas-y-fuerzas/",
    fuerza: "https://josemanueljaimemorales.github.io/AKC-CON-REPORTE/",
    rutinas: "https://josemanueljaimemorales.github.io/RutinasAKC/",
    trabajo: "https://josemanueljaimemorales.github.io/TRABAJOGAVAKC/",
    basicos: "https://josemanueljaimemorales.github.io/Basicos_AKC/"
  };

  // 📺 Cargar en pantalla tipo app
  if(urls[type]){
    document.getElementById("viewerFrame").src = urls[type];
    document.getElementById("viewerScreen").classList.add("active");
  }
}

// 🏠 Regresar al inicio
function goHome(){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById("home").classList.add("active");

  // 🔄 Limpia iframe (mejor rendimiento)
  document.getElementById("viewerFrame").src = "";
}
