/* Modo Juego: la hélice. Un punto gira y avanza en el tiempo; su sombra de costado es el seno y desde arriba, el coseno.
   El alumno ajusta A, B, h y D para atravesar los aros. Se carga solo al entrar al modo. Vista 3D con Three.js (vendor/) y vista 2D en canvas. */
import * as THREE from './vendor/three.min.js';

const el=id=>document.getElementById(id),PI=Math.PI,TWO=2*PI;
const LENGTH=12,SCALE=LENGTH/(2*TWO),WALL=4.5,RING_RADIUS=.34,RINGS=7;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const dark=()=>document.documentElement.dataset.theme==='dark';
const theme=()=>dark()
 ?{bg:'#0f1a2e',grid:'#2a3a5c',gridCenter:'#3b4d74',helix:'#b79af7',sine:'#54ddd0',cosine:'#ffb169',ball:'#f4d989',ring:'#7c8db3',hit:'#4ade80',miss:'#f87171',circle:'#8f7ad6',text:'#b0bdd5',axis:'#5c6c8c'}
 :{bg:'#eef1f8',grid:'#d3d9e8',gridCenter:'#b9c2d8',helix:'#6c46df',sine:'#007e78',cosine:'#b95206',ball:'#d98a00',ball2:'#f59d38',ring:'#8a95ad',hit:'#15803d',miss:'#c53652',circle:'#9a86e0',text:'#4c5c75',axis:'#939eb2'};

const round=v=>Math.abs(v)<1e-8?'0':Number(v.toFixed(2)).toString();
function angle(v){for(let d=1;d<=12;d++){const n=Math.round(v/PI*d);if(Math.abs(v-n*PI/d)<1e-6){if(!n)return '0';return (n<0?'−':'')+(Math.abs(n)===1?'':Math.abs(n))+'π'+(d===1?'':'/'+d);}}return round(v);}
const value=(p,t)=>({x:p.A*Math.cos(p.B*(t-p.h)),y:p.A*Math.sin(p.B*(t-p.h))+p.D});
const ringTimes=Array.from({length:RINGS},(_,k)=>-TWO+.5+(2*TWO-1)*k/(RINGS-1));

const LEVELS=[
 {title:'Nivel 1 · La altura',free:['A'],intro:'Solo podés cambiar A. Mirá qué tan ancha es la hélice y qué tan alta la onda.'},
 {title:'Nivel 2 · Las vueltas',free:['A','B'],intro:'Ahora también B: cuántas vueltas da la hélice mientras avanza el tiempo.'},
 {title:'Nivel 3 · La línea media',free:['A','B','D'],intro:'D sube o baja toda la hélice. Fijate dónde quedan los aros.'},
 {title:'Nivel 4 · El corrimiento',free:['A','B','h'],intro:'h corre la hélice en el tiempo. Compará el punto de partida con el primer aro.'},
 {title:'Nivel 5 · Todo junto',free:['A','B','h','D'],intro:'Los cuatro parámetros libres. Pensá primero, lanzá después.'}
];
const pick=list=>list[Math.floor(Math.random()*list.length)];
const START={A:1,B:1,h:0,D:0};
function makeTarget(level){
 const free=levelFree(level);
 for(let tries=0;tries<50;tries++){
  const t={A:free.includes('A')?pick([1,1.5,2,2.5,3]):START.A,B:free.includes('B')?pick([.5,1,1.5,2]):START.B,h:free.includes('h')?pick([PI/4,-PI/4,PI/2,-PI/2,PI,3*PI/4]):START.h,D:free.includes('D')?pick([-1.5,-1,-.5,.5,1,1.5]):START.D};
  if(free.some(k=>Math.abs(t[k]-START[k])>1e-9))return t;
 }
 return {A:2,B:1,h:0,D:0};
}
const levelFree=level=>level<LEVELS.length?LEVELS[level].free:['A','B','h','D'];
const levelTitle=level=>level<LEVELS.length?LEVELS[level].title:`Nivel ${level+1} · Al azar`;
const levelIntro=level=>level<LEVELS.length?LEVELS[level].intro:'Todos los parámetros libres y un objetivo nuevo cada vez.';

let level=0,target=null,player={...START},launches=0,hits=[],solved=false,view3d=true,best={};
try{best=JSON.parse(localStorage.getItem('trigolab-juego')||'{}')||{};}catch{best={};}
const totalStars=()=>Object.values(best).reduce((a,b)=>a+b,0);

/* ---------- Tres dimensiones ---------- */
let renderer=null,scene=null,camera=null,helixMesh=null,sineLine=null,cosineLine=null,circleLine=null,radiusLine=null,ball=null,sineDot=null,cosineDot=null,ringMeshes=[],floorGrid=null,wallGrid=null,spherical=null,lookAt=null,frame=0,needsRender=true,animating=null;
class Helix extends THREE.Curve{constructor(p){super();this.p=p;}getPoint(u,optionalTarget=new THREE.Vector3()){const t=-TWO+2*TWO*u,v=value(this.p,t);return optionalTarget.set(v.x,v.y,t*SCALE);}}
function webglAvailable(){try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'));}catch{return false;}}
function setup3d(){
 const canvas=el('game-gl');
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
 scene=new THREE.Scene();
 camera=new THREE.PerspectiveCamera(42,1,.1,100);
 lookAt=new THREE.Vector3(0,-.4,0);spherical=new THREE.Spherical(17,1.1,-.75);
 scene.add(new THREE.HemisphereLight(0xffffff,0x334466,.9));
 const sun=new THREE.DirectionalLight(0xffffff,1.1);sun.position.set(6,10,8);scene.add(sun);
 grids();
 const lineGeometry=()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(3*241),3));return g;};
 sineLine=new THREE.Line(lineGeometry(),new THREE.LineBasicMaterial({color:'#54ddd0'}));cosineLine=new THREE.Line(lineGeometry(),new THREE.LineBasicMaterial({color:'#ffb169'}));scene.add(sineLine,cosineLine);
 const circleGeometry=new THREE.BufferGeometry();circleGeometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(3*97),3));
 circleLine=new THREE.LineLoop(circleGeometry,new THREE.LineBasicMaterial({color:'#8f7ad6'}));scene.add(circleLine);
 const radiusGeometry=new THREE.BufferGeometry();radiusGeometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(6),3));
 radiusLine=new THREE.Line(radiusGeometry,new THREE.LineBasicMaterial({color:'#f4d989'}));scene.add(radiusLine);
 ball=new THREE.Mesh(new THREE.SphereGeometry(.17,24,16),new THREE.MeshStandardMaterial({color:'#f4d989',emissive:'#f4d989',emissiveIntensity:.35,roughness:.35}));scene.add(ball);
 sineDot=new THREE.Mesh(new THREE.SphereGeometry(.11,16,12),new THREE.MeshBasicMaterial({color:'#54ddd0'}));cosineDot=new THREE.Mesh(new THREE.SphereGeometry(.11,16,12),new THREE.MeshBasicMaterial({color:'#ffb169'}));scene.add(sineDot,cosineDot);
 for(let k=0;k<RINGS;k++){const ring=new THREE.Mesh(new THREE.TorusGeometry(RING_RADIUS,.05,12,40),new THREE.MeshStandardMaterial({color:'#7c8db3',roughness:.5,metalness:.1}));scene.add(ring);ringMeshes.push(ring);}
 pointerControls(canvas);
 new ResizeObserver(resize).observe(canvas.parentElement);
 resize();
}
function resize(){if(!renderer)return;const box=el('game-gl').parentElement.getBoundingClientRect();if(!box.width)return;renderer.setSize(box.width,box.height,false);camera.aspect=box.width/box.height;camera.fov=camera.aspect<1?64:camera.aspect<1.4?52:42;camera.updateProjectionMatrix();invalidate();}
// Rejillas del piso y de la pared con los colores del tema; se reconstruyen al cambiar de tema.
let gridTheme=null;
function grids(){const c=theme();for(const g of [floorGrid,wallGrid])if(g){g.geometry.dispose();g.material.dispose();scene.remove(g);}floorGrid=new THREE.GridHelper(LENGTH+2,14,c.gridCenter,c.grid);floorGrid.position.y=-WALL;wallGrid=new THREE.GridHelper(LENGTH+2,14,c.gridCenter,c.grid);wallGrid.rotation.z=PI/2;wallGrid.position.x=WALL;scene.add(floorGrid,wallGrid);gridTheme=c.bg;}
// Rótulos HTML proyectados sobre la escena.
const anchors={time:()=>new THREE.Vector3(0,-WALL,LENGTH/2+.6),sine:()=>new THREE.Vector3(WALL,3.9,-LENGTH/2+.4),cosine:()=>new THREE.Vector3(-3.9,-WALL,-LENGTH/2+.4),circle:()=>new THREE.Vector3(0,player.D+Math.abs(player.A)+.5,-LENGTH/2)};
function placeLabels(){const box=el('game-gl').getBoundingClientRect();for(const span of el('game-labels').children){const v=anchors[span.dataset.anchor]().project(camera);const visible=v.z<1&&Math.abs(v.x)<1.05&&Math.abs(v.y)<1.05;span.hidden=!visible;if(visible){span.style.left=((v.x+1)/2*box.width).toFixed(1)+'px';span.style.top=((1-v.y)/2*box.height).toFixed(1)+'px';}}}
function applyCamera(){camera.position.setFromSpherical(spherical).add(lookAt);camera.lookAt(lookAt);}
function pointerControls(canvas){
 let pointers=new Map(),lastDistance=0;
 canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});animating=null;});
 canvas.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId))return;
  const prev=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===1){spherical.theta-=(e.clientX-prev.x)*.006;spherical.phi=THREE.MathUtils.clamp(spherical.phi-(e.clientY-prev.y)*.006,.15,PI-.15);applyCamera();invalidate();}
  else if(pointers.size===2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(lastDistance)zoom((lastDistance-d)*.04);lastDistance=d;}
 });
 const release=e=>{pointers.delete(e.pointerId);if(pointers.size<2)lastDistance=0;};
 canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
 canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY*.012);},{passive:false});
}
function zoom(delta){spherical.radius=THREE.MathUtils.clamp(spherical.radius+delta,7,34);applyCamera();invalidate();}
const VIEWS={free:{radius:17,phi:1.1,theta:-.75},front:{radius:15,phi:PI/2,theta:0},side:{radius:17,phi:PI/2,theta:-PI/2},top:{radius:17,phi:.05,theta:-PI/2}};
function setView(name){
 const to=VIEWS[name];if(!to)return;
 animating=null; // una animación de cámara en curso no debe pisar la vista elegida
 for(const b of document.querySelectorAll('#game-views button'))b.setAttribute('aria-pressed',String(b.dataset.view===name));
 const from={radius:spherical.radius,phi:spherical.phi,theta:spherical.theta};
 const same=Math.abs(from.radius-to.radius)+Math.abs(from.phi-to.phi)+Math.abs(from.theta-to.theta)<1e-9;
 if(reduced.matches||same){Object.assign(spherical,to);applyCamera();invalidate();return;}
 const start=performance.now();
 animating=now=>{const u=Math.min(1,(now-start)/600),e=1-Math.pow(1-u,3);spherical.radius=from.radius+(to.radius-from.radius)*e;spherical.phi=from.phi+(to.phi-from.phi)*e;spherical.theta=from.theta+(to.theta-from.theta)*e;applyCamera();if(u>=1)animating=null;};
 invalidate();
}
function paint3d(){
 if(!renderer)return;
 const c=theme();
 scene.background=new THREE.Color(c.bg);
 if(gridTheme!==c.bg)grids();
 if(helixMesh){helixMesh.geometry.dispose();scene.remove(helixMesh);}
 helixMesh=new THREE.Mesh(new THREE.TubeGeometry(new Helix(player),320,.06,10,false),new THREE.MeshStandardMaterial({color:c.helix,roughness:.4,metalness:.15}));scene.add(helixMesh);
 const sine=sineLine.geometry.attributes.position,cosine=cosineLine.geometry.attributes.position;
 for(let i=0;i<=240;i++){const t=-TWO+2*TWO*i/240,v=value(player,t);sine.setXYZ(i,WALL,v.y,t*SCALE);cosine.setXYZ(i,v.x,-WALL,t*SCALE);}
 sine.needsUpdate=true;cosine.needsUpdate=true;sineLine.material.color.set(c.sine);cosineLine.material.color.set(c.cosine);
 const circle=circleLine.geometry.attributes.position;for(let i=0;i<97;i++){const a=2*PI*i/97;circle.setXYZ(i,player.A*Math.cos(a),player.A*Math.sin(a)+player.D,-TWO*SCALE);}circle.needsUpdate=true;circleLine.material.color.set(c.circle);
 ringMeshes.forEach((ring,k)=>{const v=value(target,ringTimes[k]);ring.position.set(v.x,v.y,ringTimes[k]*SCALE);ring.material.color.set(hits[k]===true?c.hit:hits[k]===false?c.miss:c.ring);ring.material.emissive.set(hits[k]===true?c.hit:'#000000');ring.material.emissiveIntensity=.35;});
 ball.material.color.set(c.ball);ball.material.emissive.set(c.ball);sineDot.material.color.set(c.sine);cosineDot.material.color.set(c.cosine);radiusLine.material.color.set(c.ball);
 placeBall(ballT);invalidate();
}
let ballT=-TWO;
function placeBall(t){
 ballT=t;const v=value(player,t);ball.position.set(v.x,v.y,t*SCALE);sineDot.position.set(WALL,v.y,t*SCALE);cosineDot.position.set(v.x,-WALL,t*SCALE);
 const r=radiusLine.geometry.attributes.position;r.setXYZ(0,0,player.D,-TWO*SCALE);r.setXYZ(1,player.A*Math.cos(player.B*(t-player.h)),player.A*Math.sin(player.B*(t-player.h))+player.D,-TWO*SCALE);r.needsUpdate=true;
}
function invalidate(){needsRender=true;if(!frame)frame=requestAnimationFrame(loop);}
function loop(now){
 frame=0;
 if(animating){animating(now);needsRender=true;}
 if(launch){launch(now);needsRender=true;}
 if(needsRender&&renderer&&view3d&&!el('game-mode').hidden){renderer.render(scene,camera);placeLabels();}
 needsRender=false;
 if(animating||launch)frame=requestAnimationFrame(loop);
}

/* ---------- Dos dimensiones ---------- */
function paint2d(){
 const canvas=el('game-2d-canvas'),box=canvas.parentElement.getBoundingClientRect();if(!box.width)return;
 const dpr=devicePixelRatio||1,w=box.width,h=box.height,c=theme();
 if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
 const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle=c.bg;ctx.fillRect(0,0,w,h);
 const left=44,right=w-16,top=18,bottom=h-32,X=t=>left+(t+TWO)/(2*TWO)*(right-left),Y=y=>bottom-(y+WALL)/(2*WALL)*(bottom-top);
 ctx.font='11px system-ui';ctx.textAlign='center';ctx.lineWidth=1;
 for(let i=-4;i<=4;i++){const t=i*PI/2;ctx.strokeStyle=i?c.grid:c.axis;ctx.beginPath();ctx.moveTo(X(t),top);ctx.lineTo(X(t),bottom);ctx.stroke();ctx.fillStyle=c.text;ctx.fillText(angle(t),X(t),h-12);}
 for(let y=-4;y<=4;y++){ctx.strokeStyle=y?c.grid:c.axis;ctx.beginPath();ctx.moveTo(left,Y(y));ctx.lineTo(right,Y(y));ctx.stroke();ctx.fillStyle=c.text;ctx.textAlign='right';ctx.fillText(String(y),left-8,Y(y)+4);ctx.textAlign='center';}
 ctx.fillStyle=c.text;ctx.textAlign='left';ctx.fillText('Sombra de costado: y = A·sen(B·(x − h)) + D',left,12);
 ctx.strokeStyle=c.sine;ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<=400;i++){const t=-TWO+2*TWO*i/400,v=value(player,t);i?ctx.lineTo(X(t),Y(v.y)):ctx.moveTo(X(t),Y(v.y));}ctx.stroke();
 ringTimes.forEach((t,k)=>{const v=value(target,t);ctx.beginPath();ctx.arc(X(t),Y(v.y),8,0,2*PI);ctx.lineWidth=3;ctx.strokeStyle=hits[k]===true?c.hit:hits[k]===false?c.miss:c.ring;ctx.stroke();if(hits[k]===true){ctx.fillStyle=c.hit;ctx.fill();}});
 const b=value(player,ballT);ctx.beginPath();ctx.arc(X(ballT),Y(b.y),6,0,2*PI);ctx.fillStyle=c.ball;ctx.fill();
}

/* ---------- Juego ---------- */
function paint(){if(view3d)paint3d();else paint2d();}
function evaluateHits(){return ringTimes.map(t=>{const p=value(player,t),q=value(target,t);return Math.hypot(p.x-q.x,p.y-q.y)<=RING_RADIUS-.06;});}
let launch=null;
function startLaunch(){
 if(launch||solved)return;
 launches++;hits=[];const result=evaluateHits();el('game-result').textContent='';el('game-hint').textContent='';
 const finish=()=>{launch=null;hits=result;placeBall(TWO);paint();report(result);};
 if(reduced.matches){finish();return;}
 const start=performance.now(),duration=3600;
 launch=now=>{const u=Math.min(1,(now-start)/duration),t=-TWO+2*TWO*u;placeBall(t);ringTimes.forEach((rt,k)=>{if(t>=rt&&hits[k]===undefined)hits[k]=result[k];});if(view3d)paint3d();else paint2d();if(u>=1)finish();};
 el('game-launch').disabled=true;invalidate();
}
function report(result){
 const count=result.filter(Boolean).length;el('game-launch').disabled=false;
 if(count===RINGS){
  solved=true;const stars=launches===1?3:launches<=3?2:1;best[level]=Math.max(best[level]||0,stars);
  try{localStorage.setItem('trigolab-juego',JSON.stringify(best));}catch{}
  el('game-result').textContent=`¡Atravesaste los ${RINGS} aros en ${launches} ${launches===1?'lanzamiento':'lanzamientos'}! ${'★'.repeat(stars)}${'☆'.repeat(3-stars)}`;
  el('game-hint').textContent=`Tu hélice: A = ${round(player.A)}, B = ${round(player.B)}, h = ${angle(player.h)}, D = ${round(player.D)}. Amplitud ${round(Math.abs(player.A))}, período ${angle(TWO/Math.abs(player.B))}.`;
  el('game-next').hidden=false;el('game-launch').hidden=true;
 }else{
  el('game-result').textContent=`Atravesaste ${count} de ${RINGS} aros. ${hint()}`;
 }
 score();
}
function hint(){
 const free=levelFree(level),period=TWO/Math.abs(target.B);
 if(free.includes('B')&&Math.abs(player.B-target.B)>1e-6)return player.B<target.B?'Los aros dan más vueltas que tu hélice: aumentá B.':'Tu hélice da más vueltas que los aros: bajá B.';
 if(free.includes('A')&&Math.abs(player.A-target.A)>1e-6)return player.A<target.A?'La hélice es más angosta que los aros: probá un A más grande.':'La hélice es más ancha que los aros: probá un A más chico.';
 if(free.includes('D')&&Math.abs(player.D-target.D)>1e-6)return player.D<target.D?'Los aros están más arriba: subí D.':'Los aros están más abajo: bajá D.';
 if(free.includes('h')){let d=(player.h-target.h)%period;if(d>period/2)d-=period;if(d<-period/2)d+=period;if(Math.abs(d)>1e-6)return d<0?'Los aros están más adelante en el tiempo: aumentá h.':'Los aros están más atrás en el tiempo: disminuí h.';}
 return 'Casi: mirá la vista de costado y la de arriba para ver qué sombra no coincide.';
}
function score(){el('game-score').textContent=`Estrellas acumuladas: ${totalStars()} · Mejor en este nivel: ${'★'.repeat(best[level]||0)||'—'}`;}
const SLIDERS=[['A','A · radio de la hélice',.25,4,.25],['B','B · vueltas por tiempo',.25,3,.25],['h','h · corrimiento en el tiempo',-PI,PI,PI/12],['D','D · altura de la línea media',-3,3,.25]];
function buildSliders(){
 const free=levelFree(level),box=el('game-sliders');box.innerHTML='';
 for(const [key,label,min,max,step] of SLIDERS){
  const locked=!free.includes(key),div=document.createElement('div');div.className='slider'+(locked?' locked':'');
  div.innerHTML=`<label for="game-${key}">${label}<output id="game-out-${key}"></output></label><input id="game-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${player[key]}"${locked?' disabled':''}><small>${locked?'Fijo en este nivel.':key==='A'?'Más A: hélice más ancha y onda más alta.':key==='B'?'Más B: más vueltas y período más corto.':key==='h'?'h > 0 corre la hélice hacia adelante.':'D sube o baja toda la hélice.'}</small>`;
  box.append(div);
  el('game-'+key).addEventListener('input',e=>{player[key]=Number(e.target.value);hits=[];outputs();paint();});
 }
 outputs();
}
function outputs(){for(const [key] of SLIDERS)el('game-out-'+key).textContent=key==='h'?angle(player[key]):round(player[key]);}
function startLevel(){
 target=makeTarget(level);player={...START};for(const key of ['A','B','h','D'])if(!levelFree(level).includes(key))player[key]=target[key];
 launches=0;hits=[];solved=false;ballT=-TWO;
 el('game-level').innerHTML=`<strong>${levelTitle(level)}</strong><br>${levelIntro(level)} Atravesá los ${RINGS} aros.`;
 el('game-result').textContent='';el('game-hint').textContent='';el('game-next').hidden=true;el('game-launch').hidden=false;el('game-launch').disabled=false;
 buildSliders();score();paint();
}
function setMode(three){
 view3d=three&&!!renderer;
 el('game-gl').hidden=!view3d;el('game-labels').hidden=!view3d;el('game-2d-canvas').hidden=view3d;el('game-views').hidden=!view3d;
 el('game-3d').classList.toggle('selected',view3d);el('game-2d').classList.toggle('selected',!view3d);
 el('game-caption').textContent=view3d?'Arrastrá para girar la cámara; rueda o pellizco para acercar. Cambiá la vista para ver cada sombra.':'Vista plana: la sombra de costado de la misma hélice. Los aros se ven como puntos.';
 if(view3d)resize();paint();
}
export function init(){
 if(el('game-mode').dataset.ready)return;el('game-mode').dataset.ready='true';
 const notice=el('game-notice');
 if(webglAvailable()){try{setup3d();}catch(error){renderer=null;}}
 if(!renderer){notice.textContent='Este dispositivo no permite la vista 3D. Podés jugar igual en la vista plana.';notice.hidden=false;el('game-3d').disabled=true;}
 el('game-launch').onclick=startLaunch;el('game-next').onclick=()=>{level++;startLevel();};el('game-retry').onclick=startLevel;
 el('game-3d').onclick=()=>setMode(true);el('game-2d').onclick=()=>setMode(false);
 for(const b of document.querySelectorAll('#game-views button'))b.onclick=()=>setView(b.dataset.view);
 new MutationObserver(paint).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 new ResizeObserver(()=>{if(!view3d)paint2d();}).observe(el('game-2d-canvas').parentElement);
 startLevel();setMode(true);if(renderer){applyCamera();setView('free');}
}
export const _test={get state(){return {level,target,player,launches,hits,solved,view3d,webgl:!!renderer,camera:camera?{x:camera.position.x,y:camera.position.y,z:camera.position.z,radius:spherical.radius,phi:spherical.phi,theta:spherical.theta}:null};},set(params){Object.assign(player,params);outputs();for(const key of Object.keys(params)){const input=el('game-'+key);if(input)input.value=params[key];}hits=[];paint();}};
