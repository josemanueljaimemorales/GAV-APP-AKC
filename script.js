function openScreen(type){
if(type==="cargas")url="https://josemanueljaimemorales.github.io/Cargas-sistemas-y-fuerzas/";
if(type==="calendar"){document.getElementById("calendarScreen").classList.add("active");return;}
let url="";
if(type==="fuerza")url="https://josemanueljaimemorales.github.io/AKC-CON-REPORTE/";
if(type==="rutinas")url="https://josemanueljaimemorales.github.io/RutinasAKC/";
if(type==="trabajo")url="https://josemanueljaimemorales.github.io/TRABAJOGAVAKC/";
if(type==="basicos")url="https://josemanueljaimemorales.github.io/Basicos_AKC/";
document.getElementById("viewerFrame").src=url;
document.getElementById("viewerScreen").classList.add("active");
}
function goHome(){
document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
document.getElementById("home").classList.add("active");
}
