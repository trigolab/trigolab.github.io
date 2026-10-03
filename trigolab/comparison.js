(function(){
  'use strict';
  const $=id=>document.getElementById(id),M=TrigoMath;
  const canvas=$('multi-graph'),ctx=canvas.getContext('2d');
  const colors=['#6c46df','#007f78','#ba4b08'],dashes=[[],[9,5],[2,5]];
  let entries=[null,null,null],unit='rad',zoom=1,position=.5,playing=false,last=0;
  const fmt=v=>Number.isFinite(v)?String(Number(v.toFixed(4))):'No definida';
  const half=()=> (unit==='rad'?2*Math.PI:360)*zoom;
  const shown=()=>entries.map((entry,i)=>entry&&$('visible-'+i).checked?{...entry,i}:null).filter(Boolean);
  function parse(){
    entries=entries.map((_,i)=>{
      const input=$('expression-'+i),source=input.value.trim();$('expression-error-'+i).textContent='';input.removeAttribute('aria-invalid');
      if(!source)return null;
      try{return {source,ast:M.parse(source)};}catch(e){$('expression-error-'+i).textContent=e.message;input.setAttribute('aria-invalid','true');return null;}
    });
    $('multi-status').textContent=entries.some(Boolean)?'Cada color corresponde al número de su casillero. Las fórmulas con errores no se dibujan.':'Escribí al menos una fórmula válida para empezar.';
    const options=[...$('multi-follow').options];
    options.forEach((option,i)=>{option.disabled=!entries[i]||!$('visible-'+i).checked;});
    if(options[$('multi-follow').selectedIndex]?.disabled){const first=options.find(o=>!o.disabled);if(first)$('multi-follow').value=first.value;}
    draw();
  }
  // Detecta cortes también dentro de sumas y cocientes, no solo tan(Bx+C).
  function connected(n,a,b){
    if(n.t==='fn'){
      if(!connected(n.a,a,b))return false;
      if(n.f==='tan'){
        const scale=unit==='deg'?Math.PI/180:1;
        const u=M.evaluate(n.a,a,unit)*scale,v=M.evaluate(n.a,b,unit)*scale;
        if(Math.floor((u-Math.PI/2)/Math.PI)!==Math.floor((v-Math.PI/2)/Math.PI))return false;
      }return true;
    }
    if(n.t==='op'){
      if(!connected(n.a,a,b)||!connected(n.b,a,b))return false;
      if(n.op==='/'){
        const u=M.evaluate(n.b,a,unit),v=M.evaluate(n.b,b,unit);
        if(!Number.isFinite(u)||!Number.isFinite(v)||u*v<=0)return false;
      }
    }return true;
  }
  function draw(){
    const rect=canvas.getBoundingClientRect();if(!rect.width)return;
    const w=rect.width,h=rect.height,dpr=devicePixelRatio||1;
    if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='white';ctx.fillRect(0,0,w,h);
    const limit=Number($('multi-y').value)||4,span=half(),left=45,right=w-15,top=22,bottom=h-35;
    const px=x=>left+(x+span)/(2*span)*(right-left),py=y=>bottom-(y+limit)/(2*limit)*(bottom-top);
    ctx.font='11px system-ui';ctx.textAlign='center';ctx.fillStyle='#596478';ctx.lineWidth=1;
    for(let i=-4;i<=4;i++){
      const x=i*span/4;ctx.strokeStyle='#e6ebf3';ctx.beginPath();ctx.moveTo(px(x),top);ctx.lineTo(px(x),bottom);ctx.stroke();
      if(w>500||i%2===0)ctx.fillText(fmt(x)+(unit==='deg'?'°':''),px(x),h-13);
      const y=i*limit/4;ctx.beginPath();ctx.moveTo(left,py(y));ctx.lineTo(right,py(y));ctx.stroke();ctx.fillText(fmt(y),left-24,py(y)+4);
    }
    ctx.strokeStyle='#939eb2';ctx.beginPath();ctx.moveTo(left,py(0));ctx.lineTo(right,py(0));ctx.moveTo(px(0),top);ctx.lineTo(px(0),bottom);ctx.stroke();
    const list=shown(),x=-span+2*span*position;
    ctx.save();ctx.beginPath();ctx.rect(left,top,right-left,bottom-top);ctx.clip();
    for(const e of list){
      const p=M.properties(e.ast,unit),samples=Math.min(16000,Math.max(Math.ceil(w*3),p?Math.ceil(Math.abs(p.B)*zoom*200):2000));
      ctx.strokeStyle=colors[e.i];ctx.lineWidth=2.5;ctx.setLineDash(dashes[e.i]);ctx.beginPath();let prev=null;
      for(let j=0;j<=samples;j++){
        const u=-span+2*span*j/samples,y=M.evaluate(e.ast,u,unit);
        if(!Number.isFinite(y)||Math.abs(y)>limit+1){prev=null;continue;}
        const mid=prev?M.evaluate(e.ast,(prev.x+u)/2,unit):y;
        if(prev&&Number.isFinite(mid)&&connected(e.ast,prev.x,u)&&Math.abs(py(y)-py(prev.y))<(bottom-top)*.5)ctx.lineTo(px(u),py(y));else ctx.moveTo(px(u),py(y));
        prev={x:u,y};
      }ctx.stroke();ctx.setLineDash([]);
      const y=M.evaluate(e.ast,x,unit);if(Number.isFinite(y)&&Math.abs(y)<=limit){ctx.fillStyle=colors[e.i];ctx.beginPath();ctx.arc(px(x),py(y),6,0,2*Math.PI);ctx.fill();}
    }
    ctx.strokeStyle='#6b758980';ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(px(x),top);ctx.lineTo(px(x),bottom);ctx.stroke();ctx.restore();ctx.setLineDash([]);
    $('multi-legend').replaceChildren();
    const readout=document.createElement('p');readout.textContent='x = '+fmt(x)+(unit==='deg'?'°':' rad');$('multi-legend').append(readout);
    for(const e of list){const item=document.createElement('p'),y=M.evaluate(e.ast,x,unit);item.style.borderLeftColor=colors[e.i];item.textContent=`f${e.i+1}(x) = ${e.source} → ${fmt(y)}${Number.isFinite(y)&&Math.abs(y)>limit?' (fuera de la ventana)':''}`;$('multi-legend').append(item);}
    drawScene(x);
    $('multi-position').setAttribute('aria-valuetext','x = '+fmt(x));
  }
  function drawScene(x){
    const index=Number($('multi-follow').value),entry=entries[index],active=entry&&$('visible-'+index).checked;
    const p=active?M.properties(entry.ast,unit):null;
    const theta=p?p.B*x+p.C:x,rad=theta*(unit==='deg'?Math.PI/180:1);
    TrigoMotion.drawCircle('multi-circle',Number.isFinite(rad)?rad:0,p?.f==='tan');
    const angle=v=>fmt(v)+(unit==='deg'?'°':' rad');
    $('multi-angle').textContent='x = '+angle(x)+(p?' → θ = '+angle(theta):'');
    $('multi-rule').textContent=!active?'Escribí y graficá una fórmula visible para seguirla.':p?
      `Fórmula ${index+1}: θ = ${fmt(p.B)} · x + (${fmt(p.C)}). La rueda tiene radio 1; la curva aplica A = ${fmt(p.A)} y D = ${fmt(p.D)}. `+(p.constant?'Esta función es constante.':p.f==='tan'?'La tangente no está definida cuando cos(θ) = 0.':`Amplitud: ${fmt(p.amplitude)}. Período: ${angle(p.period)}.`):
      `Fórmula ${index+1}: expresión libre. La manivela marca el avance de x; el círculo es una referencia de movimiento, no una representación de esta fórmula. Su valor exacto está en el gráfico.`;
  }
  $('multi-follow').onchange=draw;
  $('multi-zero').onclick=()=>{pause();position=.5;$('multi-position').value=position;draw();};
  new MutationObserver(draw).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  $('multi-form').onsubmit=e=>{e.preventDefault();parse();};
  $('multi-clear').onclick=()=>{pause();for(let i=0;i<3;i++)$('expression-'+i).value='';parse();};
  for(let i=0;i<3;i++){$('visible-'+i).onchange=()=>{const options=[...$('multi-follow').options];options.forEach((o,j)=>o.disabled=!entries[j]||!$('visible-'+j).checked);if(options[$('multi-follow').selectedIndex]?.disabled){const first=options.find(o=>!o.disabled);if(first)$('multi-follow').value=first.value;}draw();};$('expression-'+i).oninput=()=>{$('multi-status').textContent='Hay cambios sin graficar. Pulsá «Graficar mis fórmulas» para aplicarlos.';};}
  $('multi-unit').onchange=()=>{unit=$('multi-unit').value;draw();};
  $('multi-y').onchange=()=>{$('multi-y').value=Math.max(1,Math.min(10000,Number($('multi-y').value)||4));draw();};
  $('multi-fit').onclick=()=>{const values=[];for(const e of shown())for(let i=0;i<=400;i++){const y=Math.abs(M.evaluate(e.ast,-half()+2*half()*i/400,unit));if(Number.isFinite(y))values.push(y);}values.sort((a,b)=>a-b);$('multi-y').value=Math.min(10000,Math.max(1,Math.ceil((values[Math.floor(values.length*.95)]||3)*1.15)));$('multi-status').textContent='Altura ajustada por muestreo. Cerca de asíntotas o picos pueden quedar valores fuera de la ventana.';draw();};
  $('multi-zoom-in').onclick=()=>{zoom=Math.max(.125,zoom/2);draw();};$('multi-zoom-out').onclick=()=>{zoom=Math.min(8,zoom*2);draw();};
  function syncPlay(){ $('multi-play').textContent=playing?'Ⅱ Pausar':'▶ Animar puntos';$('multi-scene-play').textContent=playing?'Ⅱ Pausar':'▶ Animar';for(const id of ['multi-play','multi-scene-play'])$(id).setAttribute('aria-pressed',String(playing));}
  function pause(){playing=false;syncPlay();}
  $('multi-position').oninput=()=>{pause();position=Number($('multi-position').value);draw();};
  $('multi-play').onclick=$('multi-scene-play').onclick=()=>{playing=!playing;syncPlay();last=0;};
  function tick(t){if(playing&&!$('compare-mode').hidden){if(last)position=(position+Math.min((t-last)/1000,.1)/16*Number($('multi-speed').value))%1;$('multi-position').value=position;draw();}else if($('compare-mode').hidden)pause();last=t;requestAnimationFrame(tick);}requestAnimationFrame(tick);
  function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
  $('multi-png').onclick=()=>{
    draw();const out=document.createElement('canvas'),scale=canvas.width/canvas.getBoundingClientRect().width;out.width=canvas.width;out.height=canvas.height+430*scale;
    const c=out.getContext('2d');c.fillStyle='white';c.fillRect(0,0,out.width,out.height);c.drawImage(canvas,0,430*scale);c.fillStyle=getComputedStyle(document.querySelector('.comparison-motion')).backgroundColor;c.fillRect(0,150*scale,out.width,270*scale);c.drawImage($('multi-circle'),0,150*scale,Math.min(320,canvas.width/scale)*scale,270*scale);c.scale(scale,scale);c.fillStyle='#202641';c.font='bold 16px system-ui';c.fillText('TrigoLab · Comparación en '+(unit==='rad'?'radianes':'grados'),15,25);c.font='12px system-ui';c.fillText($('multi-follow').selectedOptions[0].textContent+' · '+$('multi-angle').textContent,15,135,out.width/scale-30);shown().forEach((e,i)=>{c.fillStyle=colors[e.i];c.fillText(`f${e.i+1}(x) = ${e.source}`,15,52+i*25,out.width/scale-30);});out.toBlob(blob=>{if(blob)download(blob,'trigolab-comparacion.png');});
  };
  $('multi-csv').onclick=()=>{const list=shown(),quote=s=>'"'+String(s).replace(/"/g,'""')+'"';const rows=[['x_'+unit,...list.map(e=>`f${e.i+1}(x) = ${e.source}`)]];for(let i=0;i<=64;i++){const x=-half()+2*half()*i/64;rows.push([x,...list.map(e=>{const v=M.evaluate(e.ast,x,unit);return Number.isFinite(v)?v:'No definida';})]);}download(new Blob(['\ufeff'+rows.map(row=>row.map(quote).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}),'trigolab-comparacion.csv');};
  new ResizeObserver(draw).observe(canvas);
  new ResizeObserver(draw).observe($('multi-circle'));
})();
