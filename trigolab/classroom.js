/* Preferencias, presentación y grabación local. Sin cámara ni servicios externos. */
(function(){
  'use strict';
  const el=id=>document.getElementById(id),motion=window.TrigoMotion;
  const media=matchMedia('(prefers-color-scheme: dark)');
  function theme(){
    const choice=el('theme').value,value=choice==='system'?(media.matches?'dark':'light'):choice;
    document.documentElement.dataset.theme=value;motion.setTheme(value);
    try{localStorage.setItem('trigolab-theme',choice);}catch{}
  }
  try{const saved=localStorage.getItem('trigolab-theme');if(['system','dark','light'].includes(saved))el('theme').value=saved;}catch{}
  el('theme').onchange=theme;media.addEventListener('change',theme);theme();

  el('share-class').onclick=async()=>{
    const info=el('share-info');info.textContent='Buscando el enlace de esta sesión…';el('share-dialog').showModal();
    const online=/^https?:$/.test(location.protocol)&&!['localhost','127.0.0.1','[::1]'].includes(location.hostname)&&!/^\d+\.\d+\.\d+\.\d+$/.test(location.hostname);
    for(const p of document.querySelectorAll('.local-sharing'))p.hidden=online;
    if(online){const label=document.createElement('label');label.textContent='Enlace para compartir con tus estudiantes';const input=document.createElement('input');input.readOnly=true;input.value=location.origin+location.pathname;input.onclick=()=>input.select();label.append(input);info.replaceChildren(label);return;}
    try{
      if(!/^https?:$/.test(location.protocol))throw Error();
      const response=await fetch('conexion.json');if(!response.ok)throw Error();
      const connection=await response.json();info.replaceChildren();
      if(!connection.lan){info.textContent='Este servidor está en modo local. Abrí COMPARTIR_EN_RED.cmd y entrá en http://localhost:5501.';return;}
      const urls=connection.urls||[];
      if(!urls.length){info.textContent='No se encontró una dirección de red. Comprobá la conexión Wi-Fi de esta PC.';return;}
      for(const url of urls){
        const label=document.createElement('label');label.textContent='Enlace para la misma red';
        const input=document.createElement('input');input.value=url;input.readOnly=true;input.onclick=()=>input.select();label.append(input);info.append(label);
      }
    }catch{
      info.textContent=location.protocol==='file:'?'Estás usando la aplicación sin servidor. Para compartirla en la red, abrí COMPARTIR_EN_RED.cmd.':'Si esta es una página publicada, compartí su dirección. Para el servidor del aula, usá COMPARTIR_EN_RED.cmd.';
    }
  };
  el('close-share').onclick=()=>el('share-dialog').close();
  function saveBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
  el('save-report').onclick=()=>{
    const s=motion.getState(),p=s?.mode==='identity'?null:s?.p;
    const lines=['TrigoLab · Mi explicación','',document.getElementById('graph-title').textContent,'Unidad: '+(s.unit==='rad'?'radianes':'grados'),''];
    if(p)lines.push('Parámetros de mi función:',`A = ${p.A}; B = ${p.B}; C = ${p.C}; D = ${p.D}`,`Desfasaje h: ${p.shift===null?'No corresponde':s.angle(p.shift)}`,`Período: ${p.period===null?'Sin período fundamental':s.angle(p.period)}`,`Amplitud: ${p.constant?'No corresponde':p.amplitude===null?'La tangente no tiene amplitud':p.amplitude}`,'');
    lines.push('Mi explicación:',el('student-explanation').value||'(Todavía no escribí mi explicación.)','','Para revisar: ¿qué cambié?, ¿qué observé?, ¿cómo lo justifico?','La coincidencia de gráficos no demuestra por sí sola una identidad.');
    saveBlob(new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/plain;charset=utf-8'}),'trigolab-mi-explicacion.txt');
  };

  let recorder=null,stream=null,frame=0,videoURL=null,disabled=[],saved=null,failed=false;
  const supported=typeof MediaRecorder!=='undefined'&&typeof HTMLCanvasElement.prototype.captureStream==='function';
  const mime=supported?['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(t=>MediaRecorder.isTypeSupported(t)):null;
  if(!mime){el('record-video').disabled=true;el('record-status').textContent='Este navegador no permite grabar el escenario. Podés guardar una imagen o probar otro navegador.';}
  function unlock(){
    delete document.body.dataset.recording;
    cancelAnimationFrame(frame);stream?.getTracks().forEach(track=>track.stop());stream=null;
    for(const [control,value] of disabled)control.disabled=value;disabled=[];
    el('stop-video').hidden=true;el('record-video').hidden=false;
    if(saved){motion.seek(saved.phase);if(saved.playing)motion.play();saved=null;}
    recorder=null;
  }
  function stop(){if(recorder?.state==='recording'){cancelAnimationFrame(frame);recorder.stop();el('stop-video').disabled=true;}}
  el('stop-video').onclick=stop;
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&recorder){el('record-status').textContent='Se interrumpió la grabación al salir de la pestaña. Guardando el tramo grabado…';stop();}});
  el('record-video').onclick=()=>{
    if(recorder||!mime)return;
    const original=motion.getState();if(!original?.p)return;
    saved={phase:original.phase,playing:original.playing};failed=false;
    const seconds=Number(el('record-duration').value),output=document.createElement('canvas'),chunks=[];
    try{
      motion.seek(0);motion.compose(output);
      stream=output.captureStream(30);recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:3000000});const currentRecorder=recorder;
      disabled=Array.from(document.querySelectorAll('button,input,select,textarea')).filter(node=>node.id!=='stop-video').map(node=>[node,node.disabled]);
      document.body.dataset.recording='true';
      for(const [control] of disabled)control.disabled=true;
      el('record-video').hidden=true;el('stop-video').hidden=false;el('stop-video').disabled=false;el('video-download').hidden=true;
      recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      recorder.onerror=()=>{failed=true;el('record-status').textContent='No se pudo grabar. Probá una duración menor o guardá una imagen.';if(recorder?.state==='recording')recorder.stop();else unlock();};
      recorder.onstop=()=>{
        const type=currentRecorder.mimeType;
        if(!failed&&chunks.length){
          if(videoURL)URL.revokeObjectURL(videoURL);
          videoURL=URL.createObjectURL(new Blob(chunks,{type}));
          const link=el('video-download');link.href=videoURL;link.download='trigolab-animacion.'+(type.includes('mp4')?'mp4':'webm');link.hidden=false;
          el('record-status').textContent='Video listo ('+(type.includes('mp4')?'MP4':'WebM')+'). Tocá «Descargar video listo» para guardarlo.';
          link.click();
        }else if(!failed)el('record-status').textContent='No se generaron fotogramas. Intentá nuevamente.';
        unlock();
      };
      recorder.start();const start=performance.now();let lastSecond=-1;
      function tick(now){
        if(!recorder||recorder.state!=='recording')return;
        const elapsed=(now-start)/1000,progress=Math.min(1,elapsed/seconds);
        motion.seek(progress);motion.compose(output);
        const second=Math.floor(elapsed);if(second!==lastSecond){lastSecond=second;el('record-status').textContent=`Grabando ${Math.min(seconds,second)} / ${seconds} s. Mantené esta pestaña visible.`;}
        if(progress>=1)stop();else frame=requestAnimationFrame(tick);
      }
      frame=requestAnimationFrame(tick);
    }catch(error){failed=true;el('record-status').textContent='No se pudo iniciar la grabación en este navegador. Podés guardar la escena como imagen.';unlock();}
  };
})();
