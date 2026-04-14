function openScreen(type){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));

  if(type==="calendar"){
    document.getElementById("calendarScreen").classList.add("active");
    return;
  }

  if(type==="drive"){
    window.location.href="https://1drv.ms/";
    return;
  }

  const urls={
    cargas:"https://josemanueljaimemorales.github.io/Cargas-sistemas-y-fuerzas/",
    fuerza:"https://josemanueljaimemorales.github.io/AKC-CON-REPORTE/",
    rutinas:"https://josemanueljaimemorales.github.io/RutinasAKC/",
    trabajo:"https://josemanueljaimemorales.github.io/TRABAJOGAVAKC/",
    basicos:"https://josemanueljaimemorales.github.io/Basicos_AKC/"
  };

  if(urls[type]){
    document.getElementById("viewerFrame").src=urls[type];
    document.getElementById("viewerScreen").classList.add("active");
  }
}

function goHome(){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById("home").classList.add("active");
  document.getElementById("viewerFrame").src="";
}
