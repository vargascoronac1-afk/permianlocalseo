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
     Fotogramas ../taller/video/motor/0005..0064. Un fotograma por trabajo (mismo orden que las lineas de la orden):
     Frenos 0026 (rueda delantera de perfil) | Diagnostico 0064 (capo abierto, motor) | A/C 0037 (frontal) |
     Alineacion 0015 (rueda trasera, 3/4 desde atras) | Aceite 0020 (camara baja, bajos) | Inspeccion 0013 (trasera: faro y matricula). */
  var FR={first:5,last:64,stops:[26,64,37,15,20,13]};
  var seq=(function(){
    var cv=$('#seqCv'), img=$('#seqImg'), box=$('#diagram'), ctx=cv.getContext('2d');
    var small=matchMedia('(max-width:699px)').matches;
    var dir=small?'../taller/video/motor600/':'../taller/video/motor/';
    var imgs={}, st={f:FR.stops[0]}, ready=false, shown=-1, started=false, tw=null;
    function url(n){return dir+('000'+n).slice(-4)+'.webp';}
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
      (function step(){var c=0; while(k<order.length&&c<5){load(order[k++]);c++;} if(k<order.length) setTimeout(step,80);})();
    }
    function near(n){
      for(var d=0;d<=FR.last-FR.first;d++){
        var a=imgs[n-d], b=imgs[n+d];
        if(a&&a.ok) return n-d;
        if(b&&b.ok) return n+d;
      }
      return -1;
    }
    function draw(force){
      var n=Math.max(FR.first,Math.min(FR.last,Math.round(st.f))), f=near(n);
      if(f<0) return;
      var dpr=Math.min(window.devicePixelRatio||1,2), w=Math.round(cv.clientWidth*dpr), h=Math.round(cv.clientHeight*dpr);
      if(!w||!h) return;
      if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;force=true;}
      if(f===shown&&!force) return;
      ctx.clearRect(0,0,w,h); ctx.drawImage(imgs[f],0,0,w,h); shown=f;
      if(!ready){ready=true; cv.classList.add('is-ready'); img.style.visibility='hidden';}
    }
    function spinTo(i,instant){
      var to=FR.stops[i];
      if(reduce||!window.gsap){ /* sin movimiento: se cambia el fotograma de la imagen fija */
        st.f=to; img.src=url(to); return;
      }
      start(); load(to);
      if(instant){st.f=to; draw(true); return;}
      var d=Math.abs(to-st.f); if(tw) tw.kill();
      box.classList.add('is-spin');
      tw=gsap.to(st,{f:to,duration:Math.min(1.5,.45+d*.03),ease:'power2.inOut',onUpdate:draw,
        onComplete:function(){box.classList.remove('is-spin'); draw(true);}});
    }
    if(window.ResizeObserver) new ResizeObserver(function(){draw(true);}).observe(cv);
    return {spinTo:spinTo,start:start,draw:draw,get frame(){return st.f;},get shown(){return shown;},get loaded(){var c=0;for(var k in imgs) if(imgs[k].ok) c++; return c;}};
  })();
  window.__seq=seq;

  /* ---------- presupuesto ---------- */
  var rows=$$('.row'), hs=$$('.hs'), svcText=$$('.svc-text li'), stops=$$('#stops button');
  var cur=0, total=$('#total'), dTitle=$('#dTitle'), dText=$('#dText');
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
      h.classList.toggle('is-focus',i===cur);
    });
    rows.forEach(function(r,i){r.classList.toggle('is-on',i===cur);});
    stops.forEach(function(b,i){
      b.setAttribute('aria-current',i===cur?'true':'false');
      b.setAttribute('aria-label',(i+1)+'. '+nameOf(i));
    });
    dTitle.textContent=nameOf(cur);
    dText.textContent=svcText[cur].textContent;
  }
  function show(i){ if(i===cur){paint();return;} cur=i; seq.spinTo(i); paint(); }
  var orderST=null;
  rows.forEach(function(r,i){
    $('input',r).addEventListener('change',function(){show(i);paint();});
  });
  hs.forEach(function(h){
    h.addEventListener('click',function(){
      var i=+h.getAttribute('data-i'), inp=$('input',rows[i]);
      inp.checked=!inp.checked; show(i); paint();
    });
  });
  stops.forEach(function(b,i){
    b.addEventListener('click',function(){
      if(orderST&&window.__lenis&&scrollY>=orderST.start-4&&scrollY<=orderST.end+4){
        var y=orderST.start+(i/(rows.length-1))*(orderST.end-orderST.start);
        window.__lenis.scrollTo(y,{duration:1});
      } else show(i);
    });
  });
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

  var pinned=false;
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

  /* 1. Hero: el titular sube por palabras; el coche llega rodando y la pantalla queda PARADA hasta que se detiene
     encima del titular (mismo mecanismo que js/v9-intro.js: Lenis.stop() + overflow hidden); despues, al hacer scroll, salen los trabajos */
  (function(){
    var h1=$('#h1'), root=document.documentElement, cue=$('#cue');
    $$('.l1,.l2',h1).forEach(function(line){
      var words=line.textContent.trim().split(/\s+/); line.textContent='';
      words.forEach(function(w,i){
        if(i) line.appendChild(document.createTextNode(' '));
        var o=document.createElement('span'); o.className='w';
        var s=document.createElement('span'); s.textContent=w; o.appendChild(s); line.appendChild(o);
      });
    });
    var skip=(window.scrollY||0)>40||location.hash.length>1;
    window.__locked=false;
    function lock(){window.__locked=true; root.classList.add('is-locked'); if(lenis) lenis.stop();}
    var released=false;
    function release(){
      if(released) return; released=true; window.__locked=false;
      root.classList.remove('is-locked'); if(lenis) lenis.start();
      if(cue) cue.classList.add('is-on');
      window.__heroReleased=performance.now();
    }
    if(!skip){ lock(); setTimeout(release,5000); } else released=true;
    var car=$('#heroCar'), carImg=$('img',car);
    function go(){
      var tl=gsap.timeline({defaults:{ease:EASE}});
      tl.from('#h1 .w>span',{yPercent:105,duration:1.1,stagger:.08},0)
        .from('.hero__road',{yPercent:100,duration:.9},.45)
        .from('.hero__copy .lead',{y:24,opacity:0,duration:.8},.8)
        .from('.hero__copy .btn',{scale:.95,opacity:0,duration:.6,stagger:.08},.95)
        .from('.hero__facts',{opacity:0,duration:.8},1.1);
      /* el coche entra rodando desde la derecha, frena y hunde un poco el morro al parar */
      var ct=gsap.timeline({delay:.25,onComplete:function(){gsap.delayedCall(.25,release);}});
      ct.fromTo(car,{x:function(){return innerWidth*1.02;}},{x:0,duration:2.3,ease:'power3.out'},0)
        .fromTo(carImg,{rotation:0},{rotation:-.9,duration:.35,ease:'power2.out',transformOrigin:'30% 100%'},1.75)
        .to(carImg,{rotation:0,duration:.9,ease:'elastic.out(1,.45)'},2.1);
    }
    if(carImg.complete&&carImg.naturalWidth) go();
    else { var once=false, run=function(){if(once) return; once=true; go();}; carImg.addEventListener('load',run); carImg.addEventListener('error',run); setTimeout(run,1500); }
    /* al bajar: el coche sigue su camino hacia la izquierda, el titular sube mas despacio */
    gsap.to('#heroCar',{xPercent:-14,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.4}});
    gsap.to('.hero__h1',{yPercent:-12,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.4}});
  })();

  /* 2. Orden de reparacion: historia anclada, 6 paradas, el presupuesto se va sumando */
  mm.add('(min-width:1px)',function(){
    var stage=$('#orderStage'), sec=$('.order');
    var steps=rows.length;
    var len=function(){return Math.round(innerHeight*(innerWidth<900?1.2:1.4));};
    var last=-1;
    function goto(i,fromScroll){
      if(i===last) return;
      var prev=last, forward=i>prev; last=i;
      show(i);
      if(fromScroll){
        rows.forEach(function(r,k){
          if(forward && k>prev && k<=i){ $('input',r).checked=true; }
          else if(!forward && k>i && k<=prev){ $('input',r).checked=false; }
        });
      }
      paint();
    }
    rows.forEach(function(r){$('input',r).checked=false;});
    paint();
    var st=orderST=ScrollTrigger.create({
      trigger:sec,start:'top top',end:function(){return '+='+len();},
      pin:stage,pinSpacing:true,anticipatePin:1,invalidateOnRefresh:true,
      snap:{snapTo:function(p){var n=Math.round(p*(steps-1)*1)/(steps-1);return Math.max(0,Math.min(1,n));},duration:{min:.2,max:.5},delay:.15,ease:'power2.inOut'},
      onUpdate:function(self){
        var i=Math.min(steps-1,Math.round(self.progress*(steps-1)));
        goto(i,true);
      }
    });
    /* entrada de la hoja: se corta con un recorte desde arriba; la camioneta entra desde la derecha */
    gsap.from('.slip',{clipPath:'inset(0 0 100% 0)',duration:1,ease:'power3.out',scrollTrigger:{trigger:sec,start:'top 75%',once:true}});
    gsap.from('.diagram',{xPercent:12,opacity:0,duration:1.1,ease:'expo.out',scrollTrigger:{trigger:sec,start:'top 75%',once:true}});
    /* los fotogramas empiezan a bajar con la primera intencion de scroll (no entran en la primera carga) */
    var kick=function(){seq.start(); ['wheel','touchstart','keydown','scroll'].forEach(function(ev){removeEventListener(ev,kick);});};
    ['wheel','touchstart','keydown','scroll'].forEach(function(ev){addEventListener(ev,kick,{passive:true});});
    return function(){st.kill();};
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
