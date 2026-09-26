function openScreen(type){
  const screens = document.querySelectorAll(".screen");
  screens.forEach(screen=>screen.classList.remove("active"));

  if(type === "calendar"){
    const cal = document.getElementById("calendarScreen");
    if(cal) cal.classList.add("active");
    return;
  }

  if(type === "drive"){
    window.location.replace("https://1drv.ms/f/c/55b6a939d4276db6/IgC0lYRLCSV9RpVYk3zc2vS3AfivHxtZwoq3bszrudWQqbw");
    return;
  }

  if(type === "normativos"){
    openPasswordModal();
    return;
  }

  const urls = {
    cargas: "https://josemanueljaimemorales.github.io/Cargas-sistemas-y-fuerzas/",
    SISTEMAS: "https://josemanueljaimemorales.github.io/Sistemas-AKC/",
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

function openPasswordModal(){
  const modal = document.getElementById("passwordModal");
  const input = document.getElementById("normativosPassword");
  const error = document.getElementById("passwordError");
  if(!modal) return;
  modal.classList.add("active");
  modal.setAttribute("aria-hidden","false");
  if(input){
    input.value = "";
    setTimeout(()=>input.focus(),50);
  }
  if(error) error.textContent = "";
}

function closePasswordModal(){
  const modal = document.getElementById("passwordModal");
  const input = document.getElementById("normativosPassword");
  const error = document.getElementById("passwordError");
  if(modal){
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden","true");
  }
  if(input) input.value = "";
  if(error) error.textContent = "";
  goHome();
}

function checkNormativosPassword(){
  const input = document.getElementById("normativosPassword");
  const error = document.getElementById("passwordError");
  const password = input ? input.value : "";

  if(password !== "Akcgav"){
    if(error) error.textContent = "Contraseña incorrecta.";
    if(input){
      input.value = "";
      input.focus();
    }
    return;
  }

  const modal = document.getElementById("passwordModal");
  if(modal){
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden","true");
  }
  if(input) input.value = "";
  openNormativos();
}

function openNormativos(){
  const frame = document.getElementById("viewerFrame");
  const viewer = document.getElementById("viewerScreen");
  if(!frame || !viewer) return;
  frame.src = "https://josemanueljaimemorales.github.io/NormativosAKC/";
  viewer.classList.add("active");
}

function goHome(){
  const screens = document.querySelectorAll(".screen");
  screens.forEach(screen=>screen.classList.remove("active"));
  const home = document.getElementById("home");
  const frame = document.getElementById("viewerFrame");
  if(home) home.classList.add("active");
  if(frame) frame.src = "";
}

document.addEventListener("keydown",(event)=>{
  const modal = document.getElementById("passwordModal");
  if(!modal || !modal.classList.contains("active")) return;
  if(event.key === "Escape") closePasswordModal();
  if(event.key === "Enter") checkNormativosPassword();
});

window.addEventListener("load",()=>{
  const screens = document.querySelectorAll(".screen");
  const home = document.getElementById("home");
  screens.forEach(screen=>screen.classList.remove("active"));
  if(home) home.classList.add("active");
});
