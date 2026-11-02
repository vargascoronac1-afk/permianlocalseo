/* Loop 338 Auto Repair v2: idioma, presupuesto sobre la camioneta y movimiento. */
(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s);};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- idioma ---------- */
  var KEY='l338-lang2', btn=$('#lang'), lang='en';
  try{var sv=localStorage.getItem(KEY); if(sv==='en'||sv==='es') lang=sv;}catch(e){}
  var T={
    title:{en:'Loop 338 Auto Repair | Odessa, TX (demo)',es:'Loop 338 Auto Repair | Odessa, TX (demo)'},
    desc:{en:'Demo website: Loop 338 Auto Repair, a fictional shop in Odessa, TX. Brakes, diagnostics, A/C, alignment, oil change and state inspection. Built by Permian Local.',es:'Sitio de demostración: Loop 338 Auto Repair, un taller ficticio en Odessa, TX. Frenos, diagnóstico, A/C, alineación, cambio de aceite e inspección estatal. Hecho por Permian Local.'},
    toggle:{en:['ES','Cambiar a español'],es:['EN','Switch to English']},
    demo:{en:'Demo: form disabled',es:'Demo: formulario desactivado'},
    added:{en:'added to the quote',es:'añadido al presupuesto'},
    notAdded:{en:'not on the quote, press to add',es:'fuera del presupuesto, pulse para añadir'},
    quote:{en:'Quote request: ',es:'Solicito presupuesto: '},
    est:{en:'Estimate from ',es:'Estimado desde '},
    demoP:{en:' (demo prices)',es:' (precios de demostración)'}
  };
  function t(k){return T[k][lang];}

  /* ---------- secuencia de fotogramas de la camioneta (canvas) ----------
     Fotogramas ../taller/video/motor/0005..0064, un fotograma por trabajo (mismo orden que las lineas de la orden):
     Frenos 0020 (rueda trasera, 3/4 trasero) | Diagnostico 0064 (capo abierto) | A/C 0038 (frontal, parrilla) |
     Alineacion 0018 (lateral, rueda delantera) | Aceite 0022 (lateral, camara baja, bajos) | Inspeccion 0035 (frontal, parabrisas).
     En la pantalla anclada el fotograma sigue al scroll, pero la imagen mostrada persigue al objetivo como mucho
     2 indices por tick y NUNCA dibuja un fotograma que no este cargado (antes se pintaba el vecino: parpadeo). */
  var FR={first:5,last:64,stops:[20,64,38,18,22,35]};
  var seq=(function(){
    var cv=$('#seqCv'), img=$('#seqImg'), ctx=cv.getContext('2d');
    var small=matchMedia('(max-width:699px)').matches;
    var dir=small?'../taller/video/motor600/':'../taller/video/motor/';
    var imgs={}, st={f:FR.stops[0]}, ready=false, shown=-1, started=false, cw=0, ch=0;
    function url(n){return dir+('000'+n).slice(-4)+'.webp';}
    function ok(n){return !!(imgs[n]&&imgs[n].ok);}
    function load(n){
      if(imgs[n]) return;
      var im=new Image(); im.decoding='async';
      im.onload=function(){im.ok=true; if(n===Math.round(st.f)) draw(true);};
      im.src=url(n); imgs[n]=im;
    }
    function start(){
      if(started) return; started=true;
      var order=FR.stops.slice();
      for(var n=FR.first;n<=FR.last;n++) if(order.indexOf(n)<0) order.push(n);
      var k=0;
      (function step(){var c=0; while(k<order.length&&c<6){load(order[k++]);c++;} if(k<order.length) setTimeout(step,60);})();
    }
    function size(){
      var dpr=Math.min(window.devicePixelRatio||1,2), w=Math.round(cv.clientWidth*dpr), h=Math.round(cv.clientHeight*dpr);
      if(w&&h&&(w!==cw||h!==ch)){cw=w;ch=h;cv.width=w;cv.height=h;return true;}
      return false;
    }
    function draw(force){
      var n=Math.max(FR.first,Math.min(FR.last,Math.round(st.f)));
      if(!ok(n)) return;
      if(size()) force=true;
      if(!cw||!ch) return;
      if(n===shown&&!force) return;
      ctx.clearRect(0,0,cw,ch); ctx.drawImage(imgs[n],0,0,cw,ch); shown=n;
      if(!ready){ready=true; cv.classList.add('is-ready'); img.style.visibility='hidden';}
    }
    /* avanza hacia el objetivo (indice decimal), maximo 2 indices por tick y solo por fotogramas ya cargados */
    function chase(target){
      var d=target-st.f; if(Math.abs(d)<.001) return false;
      var step=Math.max(-2,Math.min(2,d*.35));
      if(Math.abs(step)<.25) step=d<0?-Math.min(.25,-d):Math.min(.25,d);
      var nf=st.f+step, n=Math.round(nf), cur=Math.round(st.f);
      if(n!==cur){
        var dr=n>cur?1:-1;
        for(var k=cur+dr;k!==n+dr;k+=dr){ if(!ok(k)){ nf=k-dr; break; } }
      }
      st.f=nf; draw(); return true;
    }
    function jump(n){ st.f=n; img.src=url(n); } /* sin movimiento: imagen fija */
    if(window.ResizeObserver) new ResizeObserver(function(){draw(true);}).observe(cv);
    return {start:start,draw:draw,chase:chase,jump:jump,url:url,ok:ok,get f(){return st.f;},get shown(){return shown;},
      get loaded(){var c=0;for(var k in imgs) if(imgs[k].ok) c++; return c;}};
  })();
  window.__seq=seq;

  /* ---------- presupuesto ---------- */
  var rows=$$('.row'), hs=$$('.hs'), svcText=$$('.svc-text li'), stops=$$('#stops button');
  var cur=0, armed=true, total=$('#total'), dTitle=$('#dTitle'), dText=$('#dText');
  function nameOf(i){return $('.row__n',rows[i]).textContent;}
  function priceOf(i){return +rows[i].getAttribute('data-price');}
  function on(i){return $('input',rows[i]).checked;}
  function sum(){var s=0;rows.forEach(function(r,i){if(on(i)) s+=priceOf(i);});return s;}
  function paint(){
    var s=sum(); total.textContent='$'+s;
    hs.forEach(function(h){
      var i=+h.getAttribute('data-i');
      h.setAttribute('aria-pressed',on(i)?'true':'false');
      h.setAttribute('aria-label',nameOf(i)+', $'+priceOf(i)+', '+(on(i)?t('added'):t('notAdded')));
      $('.hs__tip',h).textContent=nameOf(i)+' $'+priceOf(i);
      h.classList.toggle('is-focus',armed&&i===cur);
    });
    rows.forEach(function(r,i){r.classList.toggle('is-on',i===cur);});
    stops.forEach(function(b,i){
      b.setAttribute('aria-current',i===cur?'true':'false');
      b.setAttribute('aria-label',(i+1)+'. '+nameOf(i));
    });
    dTitle.textContent=nameOf(cur);
    dText.textContent=svcText[cur].textContent;
  }
  function show(i){ if(i===cur){paint();return;} cur=i; seq.jump(FR.stops[i]); paint(); }
  var pick=function(i){show(i);paint();}; /* se sustituye por el desplazamiento a la parada cuando la pantalla esta anclada */
  rows.forEach(function(r,i){
    $('input',r).addEventListener('change',function(){pick(i,$('input',r).checked);});
  });
  hs.forEach(function(h){
    h.addEventListener('click',function(){
      var i=+h.getAttribute('data-i'), inp=$('input',rows[i]);
      inp.checked=!inp.checked; pick(i,inp.checked);
    });
  });
  stops.forEach(function(b,i){b.addEventListener('click',function(){pick(i);});});
  var clearBtn=null;
  $('#slipSend').addEventListener('click',function(){
    var picked=[],first=-1;
    rows.forEach(function(r,i){ if(on(i)){ picked.push(nameOf(i)+' $'+priceOf(i)); if(first<0) first=i; } });
    if(!picked.length) return;
    $('#f-msg').value=t('quote')+picked.join(', ')+'. '+t('est')+'$'+sum()+t('demoP');
    if(first>=0) $('#f-svc').selectedIndex=first;
  });

  function apply(l){
    lang=l; document.documentElement.lang=l;
    $$('[data-en]').forEach(function(el){var v=el.getAttribute('data-'+l); if(v!==null) el.textContent=v;});
    $$('[data-alt-en]').forEach(function(el){el.setAttribute('alt',el.getAttribute('data-alt-'+l));});
    $$('[data-title-en]').forEach(function(el){el.setAttribute('title',el.getAttribute('data-title-'+l));});
    $$('[data-aria-en]').forEach(function(el){el.setAttribute('aria-label',el.getAttribute('data-aria-'+l));});
    document.title=T.title[l];
    var m=$('meta[name=description]'); if(m) m.setAttribute('content',T.desc[l]);
    btn.textContent=T.toggle[l][0]; btn.setAttribute('aria-label',T.toggle[l][1]);
    var send=$('#send'); if(send.disabled) send.textContent=T.demo[l];
    paint();
  }
  btn.addEventListener('click',function(){var n=lang==='en'?'es':'en'; try{localStorage.setItem(KEY,n);}catch(e){} apply(n);});
  $('#form').addEventListener('submit',function(e){e.preventDefault(); var b=$('#send'); b.disabled=true; b.textContent=T.demo[lang];});

  apply(lang);

  /* ---------- movimiento ---------- */
  if(reduce||!window.gsap||!window.ScrollTrigger){
    $$('[data-count]').forEach(function(){}); return;
  }
  gsap.registerPlugin(ScrollTrigger);
  var EASE='expo.out';
  var lenis=null;
  if(window.Lenis){
    lenis=new Lenis({lerp:.1}); window.__lenis=lenis;
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(function(tm){lenis.raf(tm*1000);});
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function(a){
      a.addEventListener('click',function(e){
        var h=a.getAttribute('href'); if(h.length<2) return;
        var el=$(h); if(!el) return; e.preventDefault();
        if(window.__locked) return;
        lenis.scrollTo(h==='#top'?0:el,{offset:h==='#top'?0:-60});
      });
    });
  }
  var mm=gsap.matchMedia();

  /* 1. Hero: el titular sube por palabras (autoplay, es texto); el coche entra POR DESPLAZAMIENTO: la seccion queda anclada y
     el coche recorre su trayecto en proporcion al scroll (scrub, sin tween automatico). Al terminar se suelta y siguen los trabajos. */
  var heroST=null;
  (function(){
    var h1=$('#h1'), cue=$('#cue'), car=$('#heroCar'), carImg=$('img',car);
    $$('.l1,.l2',h1).forEach(function(line){
      var words=line.textContent.trim().split(/\s+/); line.textContent='';
      words.forEach(function(w,i){
        if(i) line.appendChild(document.createTextNode(' '));
        var o=document.createElement('span'); o.className='w';
        var s=document.createElement('span'); s.textContent=w; o.appendChild(s); line.appendChild(o);
      });
    });
    window.__locked=false;
    var tl=gsap.timeline({defaults:{ease:EASE}});
    tl.from('#h1 .w>span',{yPercent:105,duration:1.1,stagger:.08},0)
      .from('.hero__road',{yPercent:100,duration:.9},.45)
      .from('.hero__copy .lead',{y:24,opacity:0,duration:.8},.8)
      .from('.hero__copy .btn',{scale:.95,opacity:0,duration:.6,stagger:.08},.95)
      .from('.hero__facts',{opacity:0,duration:.8},1.1);
    if(cue) gsap.delayedCall(1.2,function(){cue.classList.add('is-on');});
    /* trayecto: 0 % = fuera por la derecha, 85 % = parado encima del titular, 85-100 % = frenazo (hunde el morro y se asienta) */
    var travel=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:'.hero',start:'top top',end:function(){return '+='+Math.round(innerHeight*(innerWidth<900?.9:1));},
      pin:true,pinSpacing:true,scrub:true,anticipatePin:1,invalidateOnRefresh:true,
      onUpdate:function(self){if(cue&&self.progress>.03) cue.classList.remove('is-on');}}});
    heroST=travel.scrollTrigger;
    travel.fromTo(car,{x:function(){return innerWidth-car.offsetLeft+8;}},{x:0,duration:.85,ease:'none'},0)
          .fromTo(carImg,{rotation:0},{rotation:-.9,duration:.06,transformOrigin:'30% 100%'},.85)
          .to(carImg,{rotation:0,duration:.09,ease:'power2.out'},.91);
    /* ya suelta, el coche sigue su camino hacia la izquierda y el titular sube mas despacio */
    var pe=function(){return heroST.end;};
    gsap.to('#heroCar',{xPercent:-14,ease:'none',scrollTrigger:{trigger:'.hero',start:pe,end:function(){return pe()+innerHeight;},scrub:.4}});
    gsap.to('.hero__h1',{yPercent:-12,ease:'none',scrollTrigger:{trigger:'.hero',start:pe,end:function(){return pe()+innerHeight;},scrub:.4}});
  })();

  /* 2. Orden de reparacion: pantalla anclada, ~100 vh de scroll por trabajo. En cada tramo el fotograma recorre TODOS
     los intermedios (mitad de tramo) y despues PARA (otra mitad) con el hotspot encendido; el presupuesto se va sumando. */
  mm.add('(min-width:1px)',function(){
    var stage=$('#orderStage'), sec=$('.order');
    var steps=rows.length, TRAVEL=.5, F=FR.stops;
    var len=function(){return Math.round(innerHeight*steps);};
    var last=-1, p=0, engaged=false, pending=null;
    function target(){
      var s=Math.min(steps-.0001,Math.max(0,p*steps)), i=Math.floor(s), u=s-i;
      if(i===0||u>=TRAVEL) return {i:i,f:F[i],hold:true};
      var k=u/TRAVEL; k=k*k*(3-2*k);
      return {i:i,f:F[i-1]+(F[i]-F[i-1])*k,hold:false};
    }
    function goto(i){
      var prev=last, forward=i>prev; last=i; cur=i;
      rows.forEach(function(r,k){
        if(forward && k>prev && k<=i){ $('input',r).checked=true; }
        else if(!forward && k>i && k<=prev){ $('input',r).checked=false; }
      });
      if(pending&&pending.i===i){ $('input',rows[i]).checked=pending.v; pending=null; }
      paint();
    }
    rows.forEach(function(r){$('input',r).checked=false;});
    paint();
    seq.draw(true);
    var st=ScrollTrigger.create({
      trigger:sec,start:'top top',end:function(){return '+='+len();},
      pin:stage,pinSpacing:true,anticipatePin:1,invalidateOnRefresh:true,
      onUpdate:function(self){p=self.progress; if(p>0) engaged=true;}
    });
    window.__orderST=st;
    function tick(){
      var T=target(); seq.chase(T.f);
      var arrived=T.hold&&Math.abs(seq.f-T.f)<.5;
      if(!engaged) return;
      if(arrived){
        if(T.i!==last) goto(T.i);
        else if(!armed){armed=true; paint();}
      } else if(armed){ armed=false; paint(); }
    }
    gsap.ticker.add(tick);
    /* clic en un punto, una fila o un numero: se baja/sube a esa parada (el scroll mueve la camioneta) */
    pick=function(i,v){
      if(typeof v==='boolean') pending={i:i,v:v};
      paint();
      if(i===cur&&armed){ pending=null; return; }
      if(!(p>0&&p<1)&&!st.isActive){ pending=null; show(i); paint(); return; }
      var y=st.start+((i+(i===0?.3:TRAVEL+.25))/steps)*(st.end-st.start);
      if(window.__lenis) window.__lenis.scrollTo(y,{duration:1.2}); else scrollTo({top:y,behavior:'smooth'});
    };
    gsap.from('.slip',{clipPath:'inset(0 0 100% 0)',duration:1,ease:'power3.out',scrollTrigger:{trigger:sec,start:'top 75%',once:true}});
    gsap.from('.diagram',{xPercent:12,opacity:0,duration:1.1,ease:'expo.out',scrollTrigger:{trigger:sec,start:'top 75%',once:true}});
    /* los fotogramas empiezan a bajar con la primera intencion de scroll (no entran en la primera carga) */
    var kick=function(){seq.start(); ['wheel','touchstart','keydown','scroll'].forEach(function(ev){removeEventListener(ev,kick);});};
    ['wheel','touchstart','keydown','scroll'].forEach(function(ev){addEventListener(ev,kick,{passive:true});});
    return function(){st.kill();gsap.ticker.remove(tick);};
  });

  /* 3. Cifras: 15 y 120 cuentan hacia arriba; el 12 entra desde la izquierda y cuenta 2, 3, 4... hasta 12 justo al llegar.
     Se dispara al entrar en pantalla y se repite cada vez que se vuelve a entrar. */
  (function(){
    var sec=$('.nums'), A=$('.nm--a'), B=$('.nm--b'), C=$('.nm--c');
    var ea=$('[data-count]',A), eb=$('[data-count]',B), ec=$('[data-count]',C);
    var oa={v:0}, ob={v:0}, oc={v:2};
    function upd(el,o){return function(){el.textContent=Math.round(o.v);};}
    var tl=gsap.timeline({paused:true});
    tl.fromTo(A,{opacity:0},{opacity:1,duration:.3,ease:'none'},0)
      .fromTo(oa,{v:0},{v:+ea.getAttribute('data-count'),duration:1.5,ease:'power3.out',onUpdate:upd(ea,oa)},0)
      .fromTo(B,{opacity:0},{opacity:1,duration:.3,ease:'none'},.15)
      .fromTo(ob,{v:0},{v:+eb.getAttribute('data-count'),duration:1.9,ease:'power3.out',onUpdate:upd(eb,ob)},.15)
      .fromTo(C,{xPercent:-130,opacity:0},{xPercent:0,opacity:1,duration:1.5,ease:'power3.out'},.3)
      .fromTo(oc,{v:2},{v:+ec.getAttribute('data-count'),duration:1.5,ease:'power3.out',onUpdate:upd(ec,oc)},.3);
    function play(){tl.restart();}
    function reset(){tl.pause(0);}
    ScrollTrigger.create({trigger:sec,start:'top 65%',end:'bottom 25%',onEnter:play,onEnterBack:play,onLeave:reset,onLeaveBack:reset});
    window.__nums=tl;
    var trig={trigger:'.nums',start:'top 65%',once:true};
    gsap.from('.nums__photo',{clipPath:'inset(0 0 0 100%)',duration:1.2,ease:'power3.inOut',scrollTrigger:trig});
    gsap.from('.nums__facts li',{y:20,opacity:0,duration:.7,stagger:.08,ease:'expo.out',scrollTrigger:{trigger:'.nums__facts',start:'top 92%',once:true}});
  })();

  /* 4. Nosotros: la foto se abre de abajo arriba mientras se desplaza; las frases entran una a una */
  (function(){
    gsap.from('#aboutPhoto img',{scale:1.18,ease:'none',scrollTrigger:{trigger:'.about',start:'top bottom',end:'bottom top',scrub:.5}});
    gsap.from('#aboutPhoto',{clipPath:'inset(40% 0 0 0)',duration:1.2,ease:'power3.out',scrollTrigger:{trigger:'.about',start:'top 70%',once:true}});
    gsap.from('.about .h2',{y:40,opacity:0,duration:.9,ease:'expo.out',scrollTrigger:{trigger:'.about__text',start:'top 70%',once:true}});
    gsap.from('.say',{y:28,opacity:0,duration:.8,stagger:.14,ease:'expo.out',scrollTrigger:{trigger:'.about__text',start:'top 60%',once:true}});
    gsap.from('.proof',{opacity:0,duration:.8,delay:.5,scrollTrigger:{trigger:'.about__text',start:'top 55%',once:true}});
  })();

  /* 5. FAQ */
  (function(){
    gsap.from('.faq .h2',{yPercent:30,opacity:0,duration:.9,ease:'expo.out',scrollTrigger:{trigger:'.faq',start:'top 70%',once:true}});
    gsap.from('.faq__photo',{clipPath:'inset(0 100% 0 0)',duration:1.1,ease:'power3.inOut',scrollTrigger:{trigger:'.faq',start:'top 65%',once:true}});
    gsap.from('.qa',{y:26,opacity:0,duration:.8,stagger:.12,ease:'expo.out',scrollTrigger:{trigger:'.faq__text',start:'top 80%',once:true}});
  })();

  /* 6-7. Visita y formulario */
  gsap.from('.visit .h2',{yPercent:40,opacity:0,duration:1,ease:'expo.out',scrollTrigger:{trigger:'.visit',start:'top 75%',once:true}});
  gsap.from('.hours',{y:36,opacity:0,duration:.9,ease:'expo.out',scrollTrigger:{trigger:'.hours',start:'top 80%',once:true}});
  gsap.from('.map',{opacity:0,duration:1,scrollTrigger:{trigger:'.hours',start:'top 80%',once:true}});
  gsap.from('.book__in > *',{y:24,opacity:0,duration:.8,stagger:.08,ease:'expo.out',scrollTrigger:{trigger:'.book',start:'top 70%',once:true}});

  /* pie: el nombre vuelve a todo el ancho */
  gsap.from('.foot__big',{yPercent:45,opacity:0,duration:1.2,ease:'expo.out',scrollTrigger:{trigger:'.foot',start:'top 85%',once:true}});

  addEventListener('load',function(){ScrollTrigger.refresh();});
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){ScrollTrigger.refresh();});
})();
