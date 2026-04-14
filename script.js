// 🔥 CAMBIO DE PANTALLAS
function openScreen(type){

  const screens = document.querySelectorAll(".screen");

  // Ocultar todas
  screens.forEach(screen=>{
    screen.classList.remove("active");
  });

  // 📅 CALENDARIO
  if(type === "calendar"){
    const cal = document.getElementById("calendarScreen");
    if(cal) cal.classList.add("active");
    return;
  }

  // 📂 DRIVE (sale de la app)
  if(type === "drive"){
    window.location.href = "https://1drv.ms/f/c/55b6a939d4276db6/ErZtJ9Q5qbYggFX4OQAAAAABVtoRkonNs_t";
    return;
  }

  // 🌐 URLs internas
  const urls = {
    cargas: "https://josemanueljaimemorales.github.io/Cargas-sistemas-y-fuerzas/",
    fuerza: "https://josemanueljaimemorales.github.io/AKC-CON-REPORTE/",
    rutinas: "https://josemanueljaimemorales.github.io/RutinasAKC/",
    trabajo: "https://josemanueljaimemorales.github.io/TRABAJOGAVAKC/",
    basicos: "https://josemanueljaimemorales.github.io/Basicos_AKC/"
  };

  const frame = document.getElementById("viewerFrame");
  const viewer = document.getElementById("viewerScreen");

  // 🔥 seguridad
  if(!urls[type]){
    goHome();
    return;
  }

  // Limpiar antes de cargar
  if(frame) frame.src = "";

  // Cargar nueva URL
  if(frame && viewer){
    frame.src = urls[type];
    viewer.classList.add("active");
  }
}

// 🔙 REGRESAR AL HOME
function goHome(){

  const screens = document.querySelectorAll(".screen");

  screens.forEach(screen=>{
    screen.classList.remove("active");
  });

  const home = document.getElementById("home");
  const frame = document.getElementById("viewerFrame");

  if(home) home.classList.add("active");

  // limpiar iframe
  if(frame) frame.src = "";
}

// 🔥 INICIO LIMPIO
window.addEventListener("load", () => {

  const screens = document.querySelectorAll(".screen");
  const home = document.getElementById("home");

  screens.forEach(screen=>{
    screen.classList.remove("active");
  });

  if(home) home.classList.add("active");

});
