// 🔥 CAMBIO DE PANTALLAS
function openScreen(type){

  const screens = document.querySelectorAll(".screen");

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
    window.location.replace("https://1drv.ms/f/c/55b6a939d4276db6/IgC0lYRLCSV9RpVYk3zc2vS3AfivHxtZwoq3bszrudWQqbw");
    return;
  }

  // 🔐 NORMATIVOS AKC: pedir contraseña cada vez
  if(type === "normativos"){
    const password = window.prompt("Contraseña para entrar a Normativos AKC:");

    if(password !== "Akcgav"){
      window.alert("Contraseña incorrecta.");
      goHome();
      return;
    }
  }

  // 🌐 URLs internas
  const urls = {
    cargas: "https://josemanueljaimemorales.github.io/Cargas-sistemas-y-fuerzas/",
    SISTEMAS: "https://josemanueljaimemorales.github.io/Sistemas-AKC/",
    normativos: "https://josemanueljaimemorales.github.io/NormativosAKC/",
    fuerza: "https://josemanueljaimemorales.github.io/AKC-CON-REPORTE/",
    FuerzaFIG: "https://josemanueljaimemorales.github.io/FUERZAFIG/",
    rutinas: "https://josemanueljaimemorales.github.io/RutinasAKC/",
    trabajo: "https://josemanueljaimemorales.github.io/TRABAJOGAVAKC/",
    basicos: "https://josemanueljaimemorales.github.io/Basicos_AKC/"
  };

  const frame = document.getElementById("viewerFrame");
  const viewer = document.getElementById("viewerScreen");

  if(!urls[type]){
    goHome();
    return;
  }

  if(frame) frame.src = "";

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
