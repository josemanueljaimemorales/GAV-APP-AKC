const content = document.getElementById('content');
const backBtn = document.getElementById('backBtn');

const MONTHS = {
  ENERO:1,FEBRERO:2,MARZO:3,ABRIL:4,MAYO:5,JUNIO:6,
  JULIO:7,AGOSTO:8,SEPTIEMBRE:9,OCTUBRE:10,NOVIEMBRE:11,DICIEMBRE:12
};
const MONTH_NAMES = Object.keys(MONTHS);
let days = [];
let months = [];
let specialEvents = { competencia:[], eventos:[], descansos:[] };
let selectedDate = null;
let assignmentData = { athletes: [], competitions: [] };

const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const clean = v => String(v ?? '').trim();
const upper = v => clean(v).toUpperCase();
const dateKey = d => `${d.year}-${String(d.month).padStart(2,'0')}-${String(d.day).padStart(2,'0')}`;


function cycleLabel(){
  if(!months.length) return 'CICLO';
  const first=months[0], last=months[months.length-1];
  return `${first.year}–${last.year}`;
}

// Descansos obligatorios oficiales en México (Art. 74 LFT).
// Se calculan por el año real de cada fecha del MACRO, nunca por un año fijo.
function officialHoliday(year, month, day){
  const fixed = {
    '1-1':'Año Nuevo',
    '5-1':'Día del Trabajo',
    '9-16':'Independencia de México',
    '12-25':'Navidad'
  };
  const key=`${month}-${day}`;
  if(fixed[key]) return fixed[key];
  const d=new Date(Date.UTC(year,month-1,day));
  const dow=d.getUTCDay();
  // Primer lunes de febrero: Constitución.
  if(month===2 && dow===1 && day>=1 && day<=7) return 'Día de la Constitución';
  // Tercer lunes de marzo: Natalicio de Benito Juárez.
  if(month===3 && dow===1 && day>=15 && day<=21) return 'Natalicio de Benito Juárez';
  // Tercer lunes de noviembre: Revolución Mexicana.
  if(month===11 && dow===1 && day>=15 && day<=21) return 'Revolución Mexicana';
  return '';
}

function nationalDateLabel(year,month,day){
  // Fechas nacionales/conmemorativas; NO son descansos obligatorios.
  const fixed={
    '2-24':'Día de la Bandera',
    '5-5':'Batalla de Puebla',
    '9-13':'Niños Héroes',
    '10-12':'Día de la Nación Pluricultural',
    '11-2':'Día de Muertos',
    '11-20':'Aniversario de la Revolución Mexicana'
  };
  return fixed[`${month}-${day}`] || '';
}

function dateEventLabels(d){
  const labels=[];
  const official=officialHoliday(d.year,d.month,d.day);
  if(official) labels.push({type:'F',title:official});
  const national=nationalDateLabel(d.year,d.month,d.day);
  if(national && !official) labels.push({type:'N',title:national});
  return labels;
}

async function reloadPlanData(){
  const [macroBuf,assignmentBuf]=await Promise.all([
    fetch('./MACRO_26_27.xlsx',{cache:'no-store'}).then(r=>{if(!r.ok) throw Error('No se encontró MACRO_26_27.xlsx'); return r.arrayBuffer();}),
    fetch('./ASIGNACION DE COMPETENCIAS.xlsx',{cache:'no-store'}).then(r=>{if(!r.ok) throw Error('No se encontró ASIGNACION DE COMPETENCIAS.xlsx'); return r.arrayBuffer();})
  ]);
  const macroWb=XLSX.read(macroBuf,{type:'array',cellDates:true});
  const assignmentWb=XLSX.read(assignmentBuf,{type:'array',cellDates:true});
  days=readCalendar(macroWb);
  assignmentData=readAssignments(assignmentWb);
  buildMonths();
  buildSpecialEvents();
}

function printCalendar(){
  const btn=document.getElementById('printCalendarBtn');
  if(btn) { btn.disabled=true; btn.textContent='ACTUALIZANDO…'; }
  reloadPlanData().then(()=>{
    const html=buildPrintableCalendar();
    const w=window.open('','_blank');
    if(!w) throw Error('El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para este sitio.');
    w.document.open(); w.document.write(html); w.document.close();
  }).catch(err=>alert(err.message)).finally(()=>{
    const b=document.getElementById('printCalendarBtn');
    if(b){b.disabled=false;b.textContent='IMPRIMIR / GUARDAR PDF';}
  });
}

function printDayEvents(d){
  const parts=[];
  for(const type of ['competencia','eventos','descansos']){
    const e=specialEvents[type].find(x=>x.days.some(y=>y.key===d.key));
    if(e) parts.push(`<span class="p-tag ${type}">${type==='competencia'?'C':type==='eventos'?'E':'D'} ${esc(e.title)}</span>`);
  }
  dateEventLabels(d).forEach(x=>parts.push(`<span class="p-tag ${x.type==='F'?'official':'national'}">${x.type} ${esc(x.title)}</span>`));
  return parts.join('');
}

function buildPrintableCalendar(){
  const first=months[0], last=months[months.length-1];
  const logoUrl=new URL('../../logo.png',location.href).href;
  const cycle=`${first?.name || ''} ${first?.year || ''} – ${last?.name || ''} ${last?.year || ''}`;
  const competitionCols=assignmentData.competitions;
  const monthsHtml=months.map(m=>{
    const byDate=new Map(m.days.map(d=>[d.day,d]));
    const firstDate=new Date(Date.UTC(m.year,m.month-1,1));
    const start=(firstDate.getUTCDay()+6)%7;
    const daysInMonth=new Date(Date.UTC(m.year,m.month,0)).getUTCDate();
    let cells='';
    for(let i=0;i<start;i++) cells+='<div class="p-cell empty"></div>';
    for(let day=1;day<=daysInMonth;day++){
      const d=byDate.get(day);
      if(!d){ cells+=`<div class="p-cell"><div class="p-day">${day}</div></div>`; continue; }
      cells+=`<div class="p-cell"><div class="p-day">${day}</div><div class="p-dow">${esc(d.dow||'')}</div><div class="p-events">${printDayEvents(d)}</div></div>`;
    }
    return `<section class="p-month"><h2>${esc(monthLabel(m))}</h2><div class="p-weekdays"><b>L</b><b>M</b><b>M</b><b>J</b><b>V</b><b>S</b><b>D</b></div><div class="p-grid">${cells}</div></section>`;
  }).join('');

  const athleteRows=assignmentData.athletes.map(a=>{
    const cells=competitionCols.map(c=>a.assignments[c.key]?'✓':'').join('</td><td>');
    return `<tr><td>${esc(a.name)}</td><td>${esc(a.level)}</td><td>${cells}</td></tr>`;
  }).join('');
  const headers=competitionCols.map(c=>`<th>${esc(c.title)}</th>`).join('');
  const legend=`<div class="p-legend"><span><b>C</b> Competencia</span><span><b>E</b> Evento</span><span><b>D</b> Descanso/puente/vacaciones del MACRO</span><span><b>F</b> Festivo oficial</span><span><b>N</b> Fecha nacional/conmemorativa (no necesariamente descanso)</span></div>`;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Plan Anual ${esc(cycle)}</title><style>
  @page{size:landscape;margin:9mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#142033;margin:0;font-size:9px;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.p-head{display:flex;justify-content:space-between;align-items:center;background:#07111f;color:#fff;border-radius:8px;padding:10px 14px;margin-bottom:9px;border-bottom:4px solid #1597ff}.p-brand{display:flex;align-items:center;gap:12px}.p-brand img{width:62px;height:42px;object-fit:contain;background:#fff;border-radius:5px;padding:3px}.p-head h1{margin:0;font-size:18px;letter-spacing:.05em}.p-head p{margin:3px 0 0;color:#c9d7e8;font-size:9px}.p-head .brand{text-align:right;font-weight:800;font-size:10px;letter-spacing:.1em;color:#fff}.p-head .brand small{display:block;color:#8fbbe3;font-weight:600;letter-spacing:.04em;margin-top:3px}.p-month{break-inside:avoid;margin-bottom:9px}.p-month h2{font-size:11px;margin:0 0 3px;text-transform:uppercase;color:#07111f;border-left:4px solid #1597ff;padding-left:6px}.p-weekdays,.p-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:1px}.p-weekdays b{text-align:center;font-size:8px;background:#07111f;color:#fff;padding:3px}.p-cell{min-height:39px;border:1px solid #cbd4df;padding:2px;overflow:hidden;background:#fff}.p-cell.empty{background:#f4f7fa}.p-day{font-weight:800;font-size:9px;color:#07111f}.p-dow{font-size:7px;color:#718096}.p-events{display:flex;flex-direction:column;gap:1px}.p-tag{font-size:6.5px;line-height:1.05;padding:1px 2px;border-radius:2px;border:1px solid #aeb9c7}.p-tag.competencia{background:#fff0f0;border-color:#d56b6b}.p-tag.eventos{background:#eef7ff;border-color:#75aee0}.p-tag.descansos{background:#eef9f3;border-color:#76b996}.p-tag.official{background:#fff6df;border-color:#d5a640;font-weight:800}.p-tag.national{background:#f1f1f1;border-color:#aaa;font-style:italic}.p-legend{display:flex;gap:9px;flex-wrap:wrap;border-top:2px solid #07111f;padding:5px 0;margin-top:4px}.p-legend span{white-space:nowrap}.p-legend b{font-weight:900}.assign{break-before:page}.assign-head{display:flex;align-items:center;gap:10px;border-bottom:3px solid #1597ff;padding-bottom:6px;margin-bottom:7px}.assign-head img{width:48px;height:32px;object-fit:contain}.assign h2{font-size:14px;margin:0;color:#07111f}.assign .sub{margin-bottom:6px;color:#5c6878}.table-wrap{overflow:visible}table{border-collapse:collapse;width:100%;font-size:7px}th,td{border:1px solid #aeb9c7;padding:2px;text-align:center}th:first-child,td:first-child{text-align:left;white-space:nowrap}th{background:#07111f;color:#fff;font-size:6.5px}tbody tr:nth-child(even){background:#f4f7fa}.note{margin-top:5px;color:#5c6878;font-size:7px}.print-footer{margin-top:8px;border-top:1px solid #cbd4df;padding-top:4px;text-align:right;font-size:7px;color:#6b7280}@media print{button{display:none}}
  </style></head><body><header class="p-head"><div class="p-brand"><img src="${logoUrl}" alt="Águilas KC"><div><h1>ÁGUILAS DE KIDS CENTER</h1><p>PLAN ANUAL · CONCENTRADO DEL CICLO: ${esc(cycle)}</p></div></div><div class="brand">CALENDARIO PARA FAMILIAS<small>GIMNASIA ARTÍSTICA VARONIL · ÁGUILAS KC</small></div></header>${monthsHtml}${legend}<section class="assign"><div class="assign-head"><img src="${logoUrl}" alt="Águilas KC"><div><h2>ATLETAS Y ASIGNACIÓN A COMPETENCIAS</h2><div class="sub">Concentrado generado directamente de ASIGNACIÓN DE COMPETENCIAS al momento de imprimir.</div></div></div><div class="table-wrap"><table><thead><tr><th>ATLETA</th><th>NIVEL</th>${headers}</tr></thead><tbody>${athleteRows || '<tr><td colspan="99">Sin atletas registrados.</td></tr>'}</tbody></table></div><div class="note">F = festivo oficial en México. N = fecha nacional/conmemorativa. Los domingos no se consideran automáticamente descansos.</div><div class="print-footer">ÁGUILAS DE KIDS CENTER · PLAN ANUAL</div></section><script>window.onload=()=>setTimeout(()=>window.print(),250);</script></body></html>`;
}

function init(){
  reloadPlanData()
    .then(renderHome)
    .catch(err=>{
      content.innerHTML = `<div class="error"><h2>No se pudo cargar el Plan Anual</h2><p>${esc(err.message)}</p></div>`;
    });
}

function normalizeName(v){
  return String(v ?? '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
}

function competitionTokens(v){
  let t=normalizeName(v)
    .replace(/\b(?:19|20)\d{2}\b/g,' ')
    .replace(/\b\d{1,2}\b/g,' ')
    .replace(/\b(?:DE|DEL|LA|EL|Y|O|PARA|POR|EN)\b/g,' ')
    .replace(/\b(?:COPA|CAMPEONATO|COMPETENCIA|TORNEO|CONTROL|EVENTO)\b/g,' ')
    .replace(/\b(?:PROBABLE|FECHA|PRIMER|PRIMERO|SEGUNDO|SEGUNDA|1ER|2DO|2DA)\b/g,' ')
    .replace(/\bSELECTIVOS?\b/g,'SELECTIVO')
    .replace(/\bNACIONALES?\b/g,'NACIONAL')
    .replace(/\bESTATALES?\b/g,'ESTATAL')
    .replace(/\bINVITATIONALS?\b/g,'INVITATIONAL')
    .replace(/\bCUPS?\b/g,'CUP')
    .replace(/\s+/g,' ').trim();
  return new Set(t ? t.split(' ') : []);
}

function competitionMatchScore(a,b){
  const na=normalizeName(a), nb=normalizeName(b);
  if(!na || !nb) return 0;
  if(na===nb) return 100;
  if(na.includes(nb) || nb.includes(na)) return 92;

  const A=competitionTokens(a), B=competitionTokens(b);
  if(!A.size || !B.size) return 0;
  let common=0;
  A.forEach(x=>{ if(B.has(x)) common++; });
  const union=new Set([...A,...B]).size;
  const minSize=Math.min(A.size,B.size);
  const coverage=common/minSize;
  const jaccard=common/union;

  // Requerimos una coincidencia fuerte para no mezclar competencias distintas.
  if(coverage===1) return 80 + jaccard*10;
  if(coverage>=0.75 && jaccard>=0.50) return 65 + jaccard*10;
  return jaccard*50;
}

function readAssignments(wb){
  const ws = wb.Sheets[wb.SheetNames[0]];
  if(!ws) throw Error('No existe la hoja de asignación de competencias');
  const matrix = XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
  const header = matrix[0] || [];
  const venueRow = matrix.findIndex((row,i)=>i>0 && row.some(cell=>/^\s*SEDE(?:S| DE COMPETENCIAS)?\s*[:\n]?/i.test(clean(cell))));
  const competitions = [];
  for(let c=2;c<header.length;c++){
    const title = clean(header[c]);
    if(title && title.toUpperCase()!=='PARTICIPACION'){
      competitions.push({key:`c${c}`, title, column:c, venue:venueRow>=0 ? clean(matrix[venueRow]?.[c]).replace(/^SEDE\s*[:\n]?\s*/i,'').trim() : ''});
    }
  }
  const athletes = [];
  for(let r=1;r<matrix.length;r++){
    if(r===venueRow) continue;
    const name=clean(matrix[r]?.[0]);
    if(!name || /^(SEDE|SEDES|SEDE DE COMPETENCIAS)$/i.test(name)) continue;
    const level=clean(matrix[r]?.[1]);
    const assignments={};
    competitions.forEach(comp=>{
      const value=upper(matrix[r]?.[comp.column]);
      assignments[comp.key]=value==='SI';
    });
    athletes.push({name,level,assignments});
  }
  return {athletes,competitions};
}

function assignmentColumnsForEvent(event){
  const title=clean(event?.title || '');
  if(!title) return [];

  // 1) Coincidencia EXACTA entre la descripción del MACRO y el encabezado
  // de ASIGNACION. Esta es la vía principal y evita cualquier alias manual.
  const normalizedTitle=normalizeName(title);
  const exact=assignmentData.competitions.find(comp =>
    normalizeName(comp.title) === normalizedTitle
  );
  if(exact) return [exact];

  // 2) Si el nombre cambió ligeramente (año, prefijos, etc.), usamos
  // coincidencia por contenido, pero nunca inventamos una competencia.
  const scored=assignmentData.competitions
    .map(comp=>({comp,score:competitionMatchScore(title,comp.title)}))
    .filter(x=>x.score>=65)
    .sort((a,b)=>b.score-a.score);

  if(!scored.length) return [];

  const best=scored[0];
  if(best.score>=92) return [best.comp];

  const threshold=Math.max(65,best.score-8);
  return scored.filter(x=>x.score>=threshold).map(x=>x.comp);
}

function athletesForEvent(event){
  const cols=assignmentColumnsForEvent(event);
  if(!cols.length) return [];
  return assignmentData.athletes.filter(a=>cols.some(c=>a.assignments[c.key]));
}

function venuesForEvent(event){
  const cols=assignmentColumnsForEvent(event);
  return [...new Set(cols.map(c=>clean(c.venue)).filter(Boolean))];
}

function eventForAssignment(comp){
  const key=normalizeName(comp?.title || '');
  if(!key) return null;

  const scored=specialEvents.competencia
    .map(e=>({event:e,score:competitionMatchScore(comp.title,e.title)}))
    .filter(x=>x.score>=65)
    .sort((a,b)=>b.score-a.score);

  return scored.length ? scored[0].event : null;
}

function competitionsForAthlete(athlete){
  return assignmentData.competitions
    .filter(c=>athlete.assignments[c.key])
    .map(c=>({assignment:c,event:eventForAssignment(c)}));
}

function readCalendar(wb){
  const ws = wb.Sheets['macro gral'];
  if(!ws) throw Error('No existe la hoja "macro gral"');
  const matrix = XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
  const fillRow = row => {
    let last='';
    return row.map(v=>{if(!['',null,undefined].includes(v)) last=clean(v); return last;});
  };

  // SheetJS conserva los rangos combinados de Excel en ws['!merges'].
  // Para NIVEL DE DESEMPEÑO TECNICO y CARGA DE FUERZA, el valor no está
  // en una sola fila: está distribuido verticalmente (ALTO/MEDIO/BAJO y
  // 60-80%/45-60%) y cada bloque está combinado horizontalmente.
  // Si usamos fillRow sobre una sola fila, se termina repitiendo un valor
  // incorrecto para muchos días. Aquí resolvemos el valor real de cada
  // columna respetando las celdas combinadas del Excel.
  const mergedValueAt = (row1,col1) => {
    const r=row1-1, c=col1-1;
    const direct=ws[XLSX.utils.encode_cell({r,c})];
    if(direct && clean(direct.v)!=='') return clean(direct.v);
    const merges=ws['!merges']||[];
    for(const m of merges){
      if(r>=m.s.r && r<=m.e.r && c>=m.s.c && c<=m.e.c){
        const top=ws[XLSX.utils.encode_cell({r:m.s.r,c:m.s.c})];
        return top ? clean(top.v) : '';
      }
    }
    return '';
  };

  const technicalForColumn = col => {
    // Prioridad por fila: ALTO, MEDIO, BAJO; solo una de las tres
    // corresponde a cada bloque del calendario.
    for(const row of [11,12,13]){
      const value=mergedValueAt(row,col);
      if(value) return value;
    }
    return '';
  };

  const forceForColumn = col => {
    // Las cargas están en las filas 15 y 16 y también están combinadas
    // horizontalmente por bloques.
    for(const row of [15,16]){
      const value=mergedValueAt(row,col);
      if(value) return value;
    }
    return '';
  };

  const monthRow = fillRow(matrix[0]||[]);
  const dayRow = matrix[1]||[];
  const dowRow = matrix[2]||[];
  const periodRow = fillRow(matrix[3]||[]);
  const stageRow = fillRow(matrix[4]||[]);
  const weekRow = fillRow(matrix[6]||[]);
  const unitRow = fillRow(matrix[8]||[]);
  const descRow = fillRow(matrix[9]||[]);

  let year=2026, previousMonth=0;
  const out=[];
  for(let c=1;c<monthRow.length;c++){
    const monthName=upper(monthRow[c]);
    const month=MONTHS[monthName];
    const dayNum=Number(dayRow[c]);
    if(!month || !Number.isFinite(dayNum) || dayNum<1 || dayNum>31) continue;
    if(previousMonth && month < previousMonth) year++;
    previousMonth=month;
    const d = {
      year,month,monthName,day:dayNum,dow:clean(dowRow[c]),
      period:clean(periodRow[c]),stage:clean(stageRow[c]),week:clean(weekRow[c]),
      unit:clean(unitRow[c]),description:clean(descRow[c]),
      technical:technicalForColumn(c+1),
      force:forceForColumn(c+1)
    };
    d.key=dateKey(d);
    out.push(d);
  }
  return out;
}

function buildMonths(){
  const map=new Map();
  for(const d of days){
    const key=`${d.year}-${d.month}`;
    if(!map.has(key)) map.set(key,{key,year:d.year,month:d.month,name:d.monthName,days:[]});
    map.get(key).days.push(d);
  }
  months=[...map.values()].sort((a,b)=>a.year-b.year||a.month-b.month);
}

function classify(d){
  const t=upper(d.description);

  // IMPORTANTE:
  // "D" en la fila de unidad NO significa que sea un descanso para este módulo.
  // Los domingos son descanso natural y nunca se listan.
  // Un descanso/vacación/puente solo existe cuando está EXPRESAMENTE
  // indicado en la descripción del Excel.
  if(/DESCANS|VACACION|PUENTE/.test(t)) return 'descansos';

  // La columna "Unidad de entrenamiento" es la fuente oficial de clasificación:
  // C = Competencia, E = Evento. No se intenta adivinar por el nombre de la descripción.
  const unit = upper(d.unit).replace(/\s+/g,'');
  if(unit==='C') return 'competencia';
  if(unit==='E') return 'eventos';
  return null;
}

function eventTitleKey(text){
  // Quita fechas y números de día para que, por ejemplo,
  // "Copa AGPAC 14 de noviembre" y "Copa AGPAC 15 de noviembre"
  // se consideren el mismo evento.
  return upper(text)
    .replace(/\b\d{1,2}\s*(?:AL|A|[-/] )?\s*\d{1,2}\b/g,'')
    .replace(/\b\d{1,2}\s+DE\s+(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)\b/g,'')
    .replace(/\b\d{1,2}[-/]\d{1,2}(?:[-/]\d{2,4})?\b/g,'')
    .replace(/\s+/g,' ').trim();
}

function nextDay(a,b){
  return (new Date(b.year,b.month-1,b.day)-new Date(a.year,a.month-1,a.day))===86400000;
}

function buildSpecialEvents(){
  const result={competencia:[],eventos:[],descansos:[]};
  const sorted=days.slice().sort((a,b)=>a.key.localeCompare(b.key));

  // COMPETENCIAS: se agrupan únicamente días consecutivos que pertenecen
  // al mismo nombre de competencia. El nombre se toma del Excel, quitando
  // solamente las fechas que cambian de un día al siguiente.
  let i=0;
  while(i<sorted.length){
    const d=sorted[i];
    if(classify(d)!=='competencia' || !d.description){i++;continue;}
    const key=eventTitleKey(d.description);
    let end=d, j=i+1;
    while(j<sorted.length){
      const n=sorted[j];
      if(classify(n)==='competencia' && n.description && nextDay(end,n) && eventTitleKey(n.description)===key){
        end=n; j++;
      } else break;
    }
    result.competencia.push({id:`competencia-${d.key}`,type:'competencia',title:d.description,start:d,end,days:sorted.filter(x=>x.key>=d.key&&x.key<=end.key)});
    i=j;
  }

  // EVENTOS: aparecen solamente cuando realmente existe un evento en el Excel.
  // No se generan automáticamente por domingos ni por días ordinarios.
  i=0;
  while(i<sorted.length){
    const d=sorted[i];
    if(classify(d)!=='eventos' || !d.description){i++;continue;}
    const key=eventTitleKey(d.description);
    let end=d,j=i+1;
    while(j<sorted.length){
      const n=sorted[j];
      if(classify(n)==='eventos' && n.description && nextDay(end,n) && eventTitleKey(n.description)===key){end=n;j++;}
      else break;
    }
    result.eventos.push({id:`eventos-${d.key}`,type:'eventos',title:d.description,start:d,end,days:sorted.filter(x=>x.key>=d.key&&x.key<=end.key)});
    i=j;
  }

  // DESCANSOS: solo descansos explícitos del Excel (D/descanso/vacaciones/puente),
  // excluyendo TODOS los domingos porque son descanso natural.
  i=0;
  while(i<sorted.length){
    const d=sorted[i];
    if(classify(d)!=='descansos' || !d.description){i++;continue;}
    const key=eventTitleKey(d.description);
    let end=d,j=i+1;
    while(j<sorted.length){
      const n=sorted[j];
      if(classify(n)==='descansos' && n.description && nextDay(end,n) && eventTitleKey(n.description)===key){end=n;j++;}
      else break;
    }
    result.descansos.push({id:`descansos-${d.key}`,type:'descansos',title:d.description,start:d,end,days:sorted.filter(x=>x.key>=d.key&&x.key<=end.key)});
    i=j;
  }

  Object.keys(result).forEach(k=>result[k].sort((a,b)=>a.start.key.localeCompare(b.start.key)));
  specialEvents=result;
}

function formatDate(d,withYear=true){
  const base=`${d.day} de ${d.monthName.toLowerCase()}`;
  return withYear ? `${base} de ${d.year}` : base;
}
function formatRange(e){
  if(e.start.key===e.end.key) return formatDate(e.start);
  return `${formatDate(e.start)} al ${formatDate(e.end)}`;
}
function monthLabel(m){return `${m.name[0]+m.name.slice(1).toLowerCase()} ${m.year}`;}

function shell(title,subtitle=''){
  content.innerHTML=`<section class="hero"><div class="eyebrow">PLAN ANUAL ${cycleLabel()}</div><h2>${esc(title)}</h2>${subtitle?`<p>${esc(subtitle)}</p>`:''}</section>`;
}

function renderHome(){
  backBtn.style.visibility='hidden';
  content.innerHTML=`
    <section class="hero">
      <div class="eyebrow">PLAN ANUAL ${cycleLabel()}</div>
      <h2>Calendario de entrenamiento</h2>
      <p>Consulta cada mes por día y accede directamente a competencias, eventos y descansos.</p>
    </section>
    <section class="print-action"><button class="print-calendar-btn" id="printCalendarBtn">IMPRIMIR / GUARDAR PDF</button><small>Genera el concentrado actualizado y abre la impresión. En el diálogo elige <b>Guardar como PDF</b> para obtener el archivo PDF.</small></section>
    <section class="quick-actions">
      <button class="quick competition" data-list="competencia"><strong>COMPETENCIAS</strong><span>${specialEvents.competencia.length} registradas · asignaciones</span><b>›</b></button>
      <button class="quick athletes" data-athletes><strong>ATLETAS</strong><span>${assignmentData.athletes.length} atletas asignados</span><b>›</b></button>
      <button class="quick event" data-list="eventos"><strong>EVENTOS</strong><span>${specialEvents.eventos.length} registrados</span><b>›</b></button>
      <button class="quick rest" data-list="descansos"><strong>DESCANSOS</strong><span>${specialEvents.descansos.length} registrados</span><b>›</b></button>
    </section>
    <section class="month-list">
      <div class="section-title"><span>MESES</span><small>Orden cronológico</small></div>
      ${months.map((m,i)=>`<button class="month-card" data-month-key="${esc(m.key)}"><span>${String(i+1).padStart(2,'0')}</span><strong>${esc(monthLabel(m))}</strong><em>${m.days.length} días</em><b>›</b></button>`).join('')}
    </section>`;
  document.querySelectorAll('[data-month-key]').forEach(b=>b.onclick=()=>showMonth(b.dataset.monthKey));
  document.querySelectorAll('[data-list]').forEach(b=>b.onclick=()=>showSpecialList(b.dataset.list));
  document.querySelector('[data-athletes]')?.addEventListener('click',showAthletesList);
  document.getElementById('printCalendarBtn')?.addEventListener('click',printCalendar);
}

function showMonth(key){
  const m=months.find(x=>x.key===key); if(!m)return;
  backBtn.style.visibility='visible'; backBtn.onclick=renderHome;
  content.innerHTML=`
    <section class="month-head"><div class="eyebrow">PLAN ANUAL</div><h2>${esc(monthLabel(m))}</h2><p>${m.days.length} días registrados</p></section>
    <section class="day-list">
      ${m.days.map(d=>dayCard(d)).join('')}
    </section>`;
  bindDayActions();
  if(selectedDate) focusDate(selectedDate,false);
}

function dayCard(d){
  const hasSpecial=classify(d);
  return `<article class="day-card ${hasSpecial?'special':''}" id="day-${esc(d.key)}" data-date="${esc(d.key)}">
    <div class="date"><strong>${esc(d.day)}</strong><span>${esc(d.dow)}</span></div>
    <div class="day-main">
      <div class="date-label">${esc(d.monthName.toLowerCase())}</div>
      <p class="description">${esc(d.description || 'Sin descripción')}</p>
      <div class="day-meta">
        ${d.technical?`<span><small>Nivel técnico</small>${esc(d.technical)}</span>`:''}
        ${d.force?`<span><small>Carga de fuerza</small>${esc(d.force)}</span>`:''}
      </div>
    </div>
    ${hasSpecial?`<button class="day-link" data-special-date="${esc(d.key)}">${hasSpecial==='competencia'?'Ver competencia':hasSpecial==='eventos'?'Ver evento':'Ver descanso'} ›</button>`:''}
  </article>`;
}

function bindDayActions(){
  document.querySelectorAll('[data-special-date]').forEach(b=>b.onclick=()=>openSpecialByDate(b.dataset.specialDate));
}

function showSpecialList(type){
  const list=specialEvents[type]||[];
  const title=type==='competencia'?'Competencias':type==='eventos'?'Eventos':'Descansos';
  backBtn.style.visibility='visible'; backBtn.onclick=renderHome;
  content.innerHTML=`<section class="hero"><div class="eyebrow">PLAN ANUAL</div><h2>${title}</h2><p>Fechas en orden cronológico.</p></section>
  <section class="special-list">${list.length?list.map(e=>specialCard(e)).join(''):'<div class="empty">No hay registros.</div>'}</section>`;
  document.querySelectorAll('[data-event-id]').forEach(b=>b.onclick=()=>openSpecial(b.dataset.eventId,type));
}

function specialCard(e){
  const label=e.type==='competencia'?'COMPETENCIA':e.type==='eventos'?'EVENTO':'DESCANSO';
  const athletes=e.type==='competencia'?athletesForEvent(e):[];
  const extra=e.type==='competencia'?` · ${athletes.length} atletas`:'';
  const venue=e.type==='competencia' ? venuesForEvent(e) : [];
  const venueText=venue.length ? ` · ${venue.join(' / ')}` : '';
  return `<button class="special-card ${esc(e.type)}" data-event-id="${esc(e.id)}"><span class="tag">${label}</span><strong>${esc(e.title)}</strong><small>${esc(formatRange(e))}${extra}${esc(venueText)}</small><b>›</b></button>`;
}

function findEvent(id,type){return (specialEvents[type]||[]).find(e=>e.id===id);}
function openSpecialByDate(key){
  for(const type of ['competencia','eventos','descansos']){
    const e=(specialEvents[type]||[]).find(x=>x.days.some(d=>d.key===key));
    if(e){openSpecial(e.id,type);return;}
  }
}
function openSpecial(id,type){
  const e=findEvent(id,type); if(!e)return;
  backBtn.style.visibility='visible'; backBtn.onclick=()=>showSpecialList(type);
  const athletes=e.type==='competencia'?athletesForEvent(e):[];
  const athleteSection=e.type==='competencia' ? `
    <section class="assigned-athletes">
      <div class="subsection-head"><div><span>ATLETAS ASIGNADOS</span><small>${athletes.length} atletas</small></div></div>
      ${athletes.length ? `<div class="athlete-grid">${athletes.map(a=>`<button class="athlete-chip" data-athlete="${esc(a.name)}"><strong>${esc(a.name)}</strong><span>Nivel ${esc(a.level)}</span>›</button>`).join('')}</div>` : '<div class="empty small">No hay atletas asignados a esta competencia.</div>'}
    </section>` : '';
  content.innerHTML=`
    <section class="event-detail ${esc(type)}">
      <div class="eyebrow">${type==='competencia'?'COMPETENCIA':type==='eventos'?'EVENTO':'DESCANSO'}</div>
      <h2>${esc(e.title)}</h2>
      <div class="event-range">${esc(formatRange(e))}</div>
      ${e.type==='competencia' && venuesForEvent(e).length ? `<div class="competition-venue"><small>SEDE</small><strong>${esc(venuesForEvent(e).join(' · '))}</strong></div>` : ''}
      <div class="event-description"><small>DESCRIPCIÓN</small><p>${esc(e.title)}</p></div>
      ${athleteSection}
      <button class="calendar-jump" id="calendarJump">VER EN CALENDARIO GENERAL ›</button>
    </section>`;
  document.querySelectorAll('[data-athlete]').forEach(b=>b.onclick=()=>showAthleteDetail(b.dataset.athlete, e.id));
  document.getElementById('calendarJump').onclick=()=>{
    selectedDate=e.start.key;
    const m=months.find(x=>x.days.some(d=>d.key===e.start.key));
    if(m) showMonth(m.key);
  };
}

function showAthletesList(){
  backBtn.style.visibility='visible'; backBtn.onclick=renderHome;
  content.innerHTML=`<section class="hero"><div class="eyebrow">PLAN ANUAL</div><h2>Atletas</h2><p>Selecciona un atleta para consultar las competencias que tiene asignadas.</p></section>
  <section class="athlete-list">
    ${assignmentData.athletes.map(a=>`<button class="athlete-row" data-athlete-row="${esc(a.name)}"><div><strong>${esc(a.name)}</strong><small>Nivel ${esc(a.level)}</small></div><span>${competitionsForAthlete(a).length} competencias ›</span></button>`).join('')}
  </section>`;
  document.querySelectorAll('[data-athlete-row]').forEach(b=>b.onclick=()=>showAthleteDetail(b.dataset.athleteRow));
}

function showAthleteDetail(name,returnEventId=null){
  const athlete=assignmentData.athletes.find(a=>normalizeName(a.name)===normalizeName(name));
  if(!athlete)return;
  backBtn.style.visibility='visible';
  backBtn.onclick=()=>returnEventId ? openSpecial(returnEventId,'competencia') : showAthletesList();
  const items=competitionsForAthlete(athlete);
  content.innerHTML=`<section class="athlete-detail">
    <div class="eyebrow">ATLETA</div>
    <h2>${esc(athlete.name)}</h2>
    <div class="athlete-level">Nivel ${esc(athlete.level)}</div>
    <div class="subsection-head"><div><span>COMPETENCIAS ASIGNADAS</span><small>${items.length} competencias</small></div></div>
    <section class="athlete-competitions">
      ${items.length ? items.map(({assignment,event})=>`
        <button class="athlete-competition ${event?'linked':''}" data-athlete-event="${event?esc(event.id):''}" data-athlete-event-type="competencia">
          <div><strong>${esc(assignment.title)}</strong><small>${event?esc(formatRange(event)):'Fecha pendiente en Plan Anual'}</small></div>
          <span>${event?'Ver competencia ›':'Asignada'}</span>
        </button>`).join('') : '<div class="empty">Este atleta no tiene competencias con SI en el archivo de asignación.</div>'}
    </section>
  </section>`;
  document.querySelectorAll('[data-athlete-event]').forEach(b=>{
    if(b.dataset.athleteEvent) b.onclick=()=>openSpecial(b.dataset.athleteEvent,'competencia');
  });
}

function focusDate(key,scroll=true){
  document.querySelectorAll('.day-card.highlight').forEach(x=>x.classList.remove('highlight'));
  const el=document.getElementById(`day-${key}`);
  if(el){el.classList.add('highlight'); if(scroll)el.scrollIntoView({behavior:'smooth',block:'center'});}
}

init();
