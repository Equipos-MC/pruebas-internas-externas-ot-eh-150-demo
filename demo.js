// Static demonstration: no real records, network API, uploads or persistence.
const $=id=>document.getElementById(id);
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
const catalogPromise=fetch('catalog.json').then(r=>r.json());
async function api(path,options={}){
 if(options.method&&options.method!=='GET')throw new Error('Esta es una demostración visual. Drive y la lectura de PDF requieren la aplicación con servidor.');
 if(path==='/api/status')return {source:{mode:'demo'}};
 const url=new URL(path,location.origin),phase=url.searchParams.get('phase')||'mc';
 if(url.pathname.endsWith('/source'))return {url:'',preview_url:null};
 if(url.pathname.startsWith('/api/ipraf')){
  const labels=(await catalogPromise).ipraf;
  const make=n=>{const completed=(n-1)%15;return {unit:String(n).padStart(3,'0'),completed,total:14,progress:Math.round(completed/14*100),present:true,catalog:{data:{crane:'DEMO-OT-EH-150-'+String(n).padStart(3,'0')}},items:labels.map((label,i)=>({label,state:i<completed?'complete':'pending',value:i<completed?1:null,source:null}))};};
  const match=url.pathname.match(/^\/api\/ipraf\/(\d+)$/);if(match)return make(Number(match[1]));
  const items=Array.from({length:171},(_,i)=>make(i+1));return {items,average:Math.round(items.reduce((s,i)=>s+i.progress,0)/171),completed:items.filter(i=>i.completed===14).length,requirements:items.reduce((s,i)=>s+i.completed,0)};
 }
 const catalog=(await catalogPromise)[phase];
 function dossier(n){let index=0;const total=catalog.reduce((v,g)=>v+g.codes.length,0),completed=Math.round(total*([1,.8,.55,.25,0][(n-1)%5])),located=Math.round(completed*([1,.7,.5,0][(n-1)%4]));
 const inspections=catalog.map(g=>{const formats=g.codes.map(code=>{const found=index++<located;return {code,status:found?'pending':'missing',issues:[],pages:found?[{docid:code,page:1}]:[]};});return {name:g.name,expected:formats.length,located:formats.filter(f=>f.pages.length).length,formats};});
 return {unit:String(n).padStart(3,'0'),catalog:{data:{crane:`DEMO-OT-EH-150-${String(n).padStart(3,'0')}`}},total,completed,progress:Math.round(100*completed/total),located,documents:located?1:0,state:'pending',simulation:false,checks:[],files:[],inspections};}
 const match=url.pathname.match(/^\/api\/portfolio\/(\d+)$/);if(match)return dossier(Number(match[1]));
 if(url.pathname==='/api/portfolio'){const items=Array.from({length:171},(_,i)=>dossier(i+1));return {items,average:Math.round(items.reduce((s,i)=>s+i.progress,0)/171),uploaded:items.filter(i=>i.documents).length,validated:0,observations:0};}
 throw new Error('Acción no disponible en la demostración.');
}
window.addEventListener('forcal-preview',e=>{const dialog=el('dialog');dialog.style.cssText='width:800px;max-width:95vw;padding:32px';const code=e.detail.docid;dialog.append(el('h2',code),el('p','HOJA FICTICIA · SOLO DEMOSTRACIÓN'),el('p','Aquí se mostrará la hoja escaneada correspondiente al FOR-CAL seleccionado en la aplicación completa. Esta demostración no contiene documentos reales.'));const b=el('button','Volver al expediente','primary');b.onclick=()=>dialog.close();dialog.append(b);dialog.addEventListener('close',()=>dialog.remove());document.body.append(dialog);dialog.showModal();});
window.addEventListener('DOMContentLoaded',()=>window.dispatchEvent(new Event('forcal-ready')));
