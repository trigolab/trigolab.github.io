/* Escenario didáctico propio. Comparte el estado y el reloj de app.js. */
(function () {
  'use strict';
  const el = id => document.getElementById(id);
  const colors = {sin: '#ba9cff', cos: '#54ddd0', tan: '#ffb169'};
  let light=false;
  const lightInk={'#b6c1d9':'#4c5c75','#45526d':'#b4c0d3','#9daac5':'#71809a','#f0f3ff':'#283c59','#f4d989':'#956200','#ffb16970':'#bc580b70','#ffb16966':'#bc580b66','#ffb169':'#b95206','#fff':'#233952','#7887a555':'#60718e55','#7887a5':'#60718e','#26334c':'#dbe3ef','#a5b3cf':'#52627d','#63708a':'#8090a9','#ffffff99':'#33496899','#dfe7fa':'#283c59','#111c30':'#f4f7fc','#edf2ff':'#20334f'};
  const ink=color=>light?(lightInk[color]||color):color;
  const labels = {sin: 'Seno', cos: 'Coseno', tan: 'Tangente'};
  const nodes = Object.fromEntries(Object.keys(colors).map(f => [f, TrigoMath.parse(f+'(x)')]));
  const visible = {sin: true, cos: true, tan: true};
  let state = null, actions = null, currentLesson = null;
  const number = n => Number.isFinite(n) ? (Math.abs(n)<1e-10?'0':Number(n.toFixed(3)).toString()) : 'No definida';
  const lessons = [
    {title:'01 · Una vuelta', A:1,B:1,h:0,D:0, question:'En una vuelta completa del círculo, ¿cuántas ondas completas dibuja el seno?', answers:['Una','Dos','Media'], correct:0, why:'Una vuelta son 2π radianes (360°). El seno vuelve a repetir sus valores después de esa vuelta.'},
    {title:'02 · Más altura', A:2,B:1,h:0,D:0, question:'Ahora A = 2. ¿Qué cambió respecto de A = 1?', answers:['El período se duplicó','La amplitud se duplicó','La onda se movió a la derecha'], correct:1, why:'El seno y el coseno llegan a 2 y −2. Su período sigue siendo 2π. En tangente hablamos de escala vertical, no de amplitud.'},
    {title:'03 · Más vueltas', A:1,B:2,h:0,D:0, question:'Con B = 2, ¿qué ocurre mientras x avanza de 0 a 2π?', answers:['El círculo gira media vuelta','El círculo no gira','El círculo gira dos vueltas'], correct:2, why:'El ángulo es θ = 2x: gira el doble. Seno y coseno completan dos ondas; su período es π.'},
    {title:'04 · El salto', A:1,B:1,h:0,D:0, question:'En θ = π/2 (90°), ¿qué pasa con la tangente?', answers:['Vale cero','No está definida','Vale uno'], correct:1, why:'tan(θ) = sen(θ)/cos(θ). Allí cos(θ) = 0: no podemos dividir por cero. Las ramas quedan separadas.'}
  ];
  function surface(id) {
    const canvas=el(id), rect=canvas.getBoundingClientRect(), dpr=window.devicePixelRatio||1;
    if(!rect.width)return null;
    const w=rect.width,h=rect.height;
    if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)) {canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
    const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
    c.lineCap='round';c.lineJoin='round';c.font='12px system-ui';
    return {c,w,h};
  }
  function line(c,x1,y1,x2,y2,color,width=1,dash=[]) {c.strokeStyle=ink(color);c.lineWidth=width;c.setLineDash(dash);c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.setLineDash([]);}
  function dot(c,x,y,color,r=5) {c.fillStyle=ink(color);c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
  function text(c,value,x,y,color='#b6c1d9',align='center') {c.fillStyle=ink(color);c.textAlign=align;c.fillText(value,x,y);}
  function circle(theta, raw, target = 'circle-scene', showTan = visible.tan) {
    const s=surface(target);if(!s)return;
    const {c,w,h}=s, r=Math.min(76,w*.25),cx=w*.49,cy=h*.47;
    line(c,18,cy,w-15,cy,'#45526d');line(c,cx,28,cx,h-35,'#45526d');
    c.strokeStyle=ink('#9daac5');c.lineWidth=1.5;c.beginPath();c.arc(cx,cy,r,0,2*Math.PI);c.stroke();
    text(c,'1',cx+r+4,cy+18);text(c,'−1',cx-r-8,cy+18);text(c,'1',cx-13,cy-r-9);
    const px=cx+r*raw.cos,py=cy-r*raw.sin;
    line(c,cx,cy,px,cy,colors.cos,4);line(c,px,cy,px,py,colors.sin,4);
    line(c,cx,py,px,py,colors.sin,1,[3,5]);
    line(c,cx,cy,px,py,'#f0f3ff',2);
    const normalized=((theta%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
    c.strokeStyle=ink('#f4d989');c.beginPath();c.arc(cx,cy,22,-normalized,0);c.stroke();text(c,'θ',cx+28,cy-13,'#f4d989');
    if(showTan)line(c,cx+r,24,cx+r,h-32,'#ffb16970',1,[4,5]);
    if(showTan&&Number.isFinite(raw.tan)) {
      const actualY=cy-r*raw.tan,ty=Math.max(25,Math.min(h-33,actualY));
      c.save();c.beginPath();c.rect(0,25,w,h-58);c.clip();
      line(c,cx,cy,cx+r,actualY,colors.tan,1,[3,4]);line(c,cx+r,cy,cx+r,actualY,colors.tan,3);c.restore();
      if(ty===25||ty===h-33)text(c,raw.tan>0?'↑':'↓',cx+r+12,ty+3,colors.tan);
      else dot(c,cx+r,ty,colors.tan,4);
    }
    dot(c,px,py,'#fff',6);dot(c,cx,cy,'#f4d989',4);
    // Personaje propio junto a la rueda: brazos articulados hasta una manivela pequeña.
    const bx=26,by=h-60,gripX=bx+22+12*Math.cos(theta),gripY=by-23-12*Math.sin(theta);
    line(c,bx+22,by-23,cx,cy,'#7887a555',2,[3,5]);
    const orange=ink('#ffb169');c.strokeStyle=orange;c.lineWidth=3;
    c.beginPath();c.arc(bx,by-36,8,0,2*Math.PI);c.stroke();
    line(c,bx,by-28,bx,by+3,orange,3);
    line(c,bx,by+3,bx-10,by+23,orange,3);line(c,bx,by+3,bx+11,by+23,orange,3);
    line(c,bx,by-21,bx+12,by-12,orange,3);line(c,bx+12,by-12,gripX,gripY,orange,3);
    line(c,bx,by-20,bx+5,by-30,orange,3);line(c,bx+5,by-30,gripX,gripY,orange,3);
    c.strokeStyle=ink('#7887a5');c.lineWidth=1;c.beginPath();c.arc(bx+22,by-23,12,0,Math.PI*2);c.stroke();
    line(c,bx+22,by-23,gripX,gripY,'#f4d989',2);dot(c,gripX,gripY,orange,3);
    text(c,'radio = 1',cx+32,h-15);
  }
  function waves(p,x,raw) {
    const s=surface('waves-scene');if(!s)return;
    const {c,w,h}=s,{xmin,xmax}=state.bounds;
    const limit=Math.max(3,Math.abs(p.D)+Math.abs(p.A)+1),left=36,right=w-15,top=25,bottom=h-35;
    const X=v=>left+(v-xmin)/(xmax-xmin)*(right-left),Y=v=>bottom-(v+limit)/(2*limit)*(bottom-top);
    for(let i=0;i<=8;i++) {const v=xmin+(xmax-xmin)*i/8;line(c,X(v),top,X(v),bottom,'#26334c');if(w>450||i%2===0)text(c,state.angle(v),X(v),h-13);}
    for(let v=-Math.floor(limit);v<=limit;v+=Math.max(1,Math.ceil(limit/3))) {line(c,left,Y(v),right,Y(v),'#26334c');text(c,number(v),left-8,Y(v)+4,'#a5b3cf','right');}
    line(c,left,Y(0),right,Y(0),'#63708a');text(c,'x',right,h-2);
    const scale=state.unit==='deg'?Math.PI/180:1;
    const value=(f,v)=>p.A*TrigoMath.evaluate(nodes[f],p.B*v+p.C,state.unit)+p.D;
    const branch=v=>Math.floor(((p.B*v+p.C)*scale-Math.PI/2)/Math.PI);
    c.save();c.beginPath();c.rect(left,top,right-left,bottom-top);c.clip();
    if(visible.tan&&p.B!==0) {
      const low=Math.min((p.B*xmin+p.C)*scale,(p.B*xmax+p.C)*scale),high=Math.max((p.B*xmin+p.C)*scale,(p.B*xmax+p.C)*scale);
      const start=Math.ceil((low-Math.PI/2)/Math.PI),end=Math.floor((high-Math.PI/2)/Math.PI);
      if(end-start<150)for(let k=start;k<=end;k++){const v=((Math.PI/2+k*Math.PI)/scale-p.C)/p.B;line(c,X(v),top,X(v),bottom,'#ffb16966',1,[4,6]);}
    }
    const samples=Math.min(12000,Math.max(Math.ceil(w*2),Math.ceil(Math.abs(p.B)*(xmax-xmin)*scale*35)));
    for(const f of Object.keys(colors)) {
      if(!visible[f])continue;
      // Curva completa de referencia y tramo recorrido con mayor contraste.
      for(const trace of [false,true]) {
        c.strokeStyle=colors[f];c.globalAlpha=trace?1:.42;c.lineWidth=trace?2.5:1.4;
        c.setLineDash(f==='cos'?[7,4]:f==='tan'?[2,4]:[]);c.beginPath();let previous=null;
        for(let i=0;i<=samples;i++) {
          const v=xmin+(xmax-xmin)*i/samples;if(trace&&v>x)break;
          const y=value(f,v),b=branch(v);
          if(!Number.isFinite(y)||Math.abs(y)>limit+1){previous=null;continue;}
          if(previous&&(f!=='tan'||previous.branch===b)&&Math.abs(Y(y)-previous.y)<(bottom-top)*.65)c.lineTo(X(v),Y(y));else c.moveTo(X(v),Y(y));
          previous={branch:b,y:Y(y)};
        }c.stroke();
      }
      c.globalAlpha=1;c.setLineDash([]);
      const y=p.A*raw[f]+p.D;
      if(Number.isFinite(y)&&Math.abs(y)<=limit){dot(c,X(x),Y(y),colors[f],6);line(c,left,Y(y),X(x),Y(y),colors[f]+'66',1,[3,5]);}
    }
    line(c,X(x),top,X(x),bottom,'#ffffff99',1,[4,4]);c.restore();
    text(c,'Tres funciones · el mismo x',left,14,'#dfe7fa','left');
    return limit;
  }
  function render(next) {
    state=next;
    if(el('motion-body').hidden)return;
    const p=state.p;
    const lessonChanged=currentLesson&&(!p||Math.abs(p.A-currentLesson.A)>1e-8||Math.abs(p.B-currentLesson.B)>1e-8||Math.abs(p.C)>1e-8||Math.abs(p.D-currentLesson.D)>1e-8);
    el('motion-lesson-status').textContent=lessonChanged?'Cambiaste los parámetros. Volvé a elegir la experiencia para responder sobre ese ejemplo.':'';
    for(const choice of el('motion-answers').children)choice.disabled=!!lessonChanged||document.body.dataset.recording==='true';
    el('motion-unavailable').hidden=!!p;el('motion-visuals').hidden=!p;
    el('motion-play').textContent=state.playing?'Ⅱ Pausar':'▶ Animar';
    el('motion-play').setAttribute('aria-pressed',String(state.playing));
    el('motion-position').value=state.phase;
    el('motion-rad').setAttribute('aria-pressed',String(state.unit==='rad'));
    el('motion-deg').setAttribute('aria-pressed',String(state.unit==='deg'));
    if(!p)return;
    const theta=p.B*state.x+p.C,rad=theta*(state.unit==='deg'?Math.PI/180:1);
    const raw=Object.fromEntries(Object.keys(colors).map(f=>[f,TrigoMath.evaluate(nodes[f],theta,state.unit)]));
    circle(rad,raw);const limit=waves(p,state.x,raw);
    el('motion-angle').textContent='x = '+state.angle(state.x)+' → θ = '+state.angle(theta);
    el('motion-position').setAttribute('aria-valuetext','x = '+state.angle(state.x));
    el('motion-rule').textContent=`θ = ${number(p.B)} · x ${p.C<0?'−':'+'} ${state.angle(Math.abs(p.C))}. En las curvas: y = ${number(p.A)} · función(θ) ${p.D<0?'−':'+'} ${number(Math.abs(p.D))}. El círculo siempre tiene radio 1.`;
    for(const f of Object.keys(colors)) {
      const y=p.A*raw[f]+p.D;
      el('motion-value-'+f).textContent=Number.isFinite(y)?'y = '+number(y):'No definida';
      el('motion-raw-'+f).textContent=labels[f]+' en el círculo: '+number(raw[f]);
      el('motion-status-'+f).textContent=!Number.isFinite(y)?'No definida: cos(θ) = 0':Math.abs(y)>limit?'Fuera de la ventana vertical':visible[f]?'Punto visible':'Curva oculta';
    }
  }
  function compose(out) {
    if(out.width!==1200)out.width=1200;if(out.height!==620)out.height=620;
      const c=out.getContext('2d');c.fillStyle=ink('#111c30');c.fillRect(0,0,out.width,out.height);
      c.fillStyle=ink('#edf2ff');c.font='bold 24px system-ui';c.fillText('TrigoLab · De una vuelta a tres funciones',30,40);
      c.font='16px system-ui';c.fillText(el('motion-angle').textContent,30,72);
      const fit=(id,x,y,w,h)=>{const source=el(id),scale=Math.min(w/source.width,h/source.height),sw=source.width*scale,sh=source.height*scale;c.drawImage(source,x+(w-sw)/2,y+(h-sh)/2,sw,sh);};
      fit('circle-scene',20,100,380,320);fit('waves-scene',420,100,750,320);
      Object.keys(colors).forEach((f,i)=>{c.fillStyle=colors[f];c.fillText(labels[f]+' · '+el('motion-value-'+f).textContent,30+i*390,470);c.font='13px system-ui';c.fillText(el('motion-raw-'+f).textContent,30+i*390,498);c.font='16px system-ui';});
      c.fillStyle=ink('#b6c1d9');c.font='14px system-ui';c.fillText(el('motion-rule').textContent,30,552);c.fillText('Eje x en '+(state.unit==='rad'?'radianes':'grados')+' · Tangente: ramas separadas en sus puntos excluidos.',30,580);
    return out;
  }
  function init(callbacks) {
    actions=callbacks;
    el('motion-toggle').onclick=()=>{const open=el('motion-body').hidden;el('motion-body').hidden=!open;el('motion-toggle').setAttribute('aria-expanded',String(open));el('motion-toggle').textContent=open?'Ocultar escenario':'Abrir escenario';if(state)render(state);};
    el('motion-play').onclick=()=>actions.play();
    el('motion-position').oninput=e=>actions.seek(Number(e.target.value));
    el('motion-zero').onclick=()=>actions.seek(.5);
    el('motion-rad').onclick=()=>actions.unit('rad');el('motion-deg').onclick=()=>actions.unit('deg');
    el('focus-projections').onclick=()=>{visible.sin=true;visible.cos=true;visible.tan=false;for(const f of Object.keys(visible))el('show-'+f).checked=visible[f];render(state);};
    el('focus-all').onclick=()=>{for(const f of Object.keys(visible)){visible[f]=true;el('show-'+f).checked=true;}render(state);};
    el('motion-speed').oninput=e=>actions.speed(Number(e.target.value));
    el('motion-save').onclick=()=>{
      if(!state?.p)return;
      render(state);
      const out=compose(document.createElement('canvas'));
      const link=document.createElement('a');link.href=out.toDataURL('image/png');link.download='trigolab-escenario.png';document.body.append(link);link.click();link.remove();
    };
    for(const f of Object.keys(colors)) el('show-'+f).onchange=e=>{visible[f]=e.target.checked;if(state)render(state);};
    lessons.forEach((lesson,index)=>{
      const button=document.createElement('button');button.textContent=lesson.title;button.className='lesson-button';button.onclick=()=>{
        for(const child of el('motion-lessons').children)child.setAttribute('aria-pressed',String(child===button));
        currentLesson=lesson;actions.preset(lesson,index);el('motion-question').textContent=lesson.question;
        el('motion-feedback').textContent='Elegí una respuesta y comprobala con la animación.';
        el('motion-answers').replaceChildren();
        lesson.answers.forEach((answer,i)=>{const choice=document.createElement('button');choice.textContent=answer;choice.className='secondary';choice.onclick=()=>{el('motion-feedback').textContent=(i===lesson.correct?'¡Exacto! ':'Probá otra vez. ')+(i===lesson.correct?lesson.why:'Observá el círculo y las curvas; podés pausar y mover x.');};el('motion-answers').append(choice);});
      };el('motion-lessons').append(button);
    });
    new ResizeObserver(()=>{if(state)render(state);}).observe(el('motion-visuals'));
  }
  window.TrigoMotion={init,render,compose,drawCircle:(target,theta,showTan)=>circle(theta,{sin:Math.sin(theta),cos:Math.cos(theta),tan:Math.abs(Math.cos(theta))<1e-14?NaN:Math.tan(theta)},target,showTan),getState:()=>state,seek:value=>actions.seek(value),play:()=>actions.play(),setTheme:value=>{light=value==='light';Object.assign(colors,light?{sin:'#7042c1',cos:'#007e78',tan:'#b95206'}:{sin:'#ba9cff',cos:'#54ddd0',tan:'#ffb169'});if(state)render(state);}};
})();
