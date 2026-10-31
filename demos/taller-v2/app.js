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

  /* ---------- presupuesto ---------- */
  var rows=$$('.row'), hs=$$('.hs'), svcText=$$('.svc-text li');
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
    dTitle.textContent=nameOf(cur);
    dText.textContent=svcText[cur].textContent;
  }
  function setActive(i){ if(i===cur) return; cur=i; paint(); }
  rows.forEach(function(r,i){
    $('input',r).addEventListener('change',function(){cur=i;paint();});
    r.addEventListener('mouseenter',function(){ if(!pinned) setActive(i); });
  });
  hs.forEach(function(h){
    h.addEventListener('click',function(){
      var i=+h.getAttribute('data-i'), inp=$('input',rows[i]);
      inp.checked=!inp.checked; cur=i; paint();
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
    lenis=new Lenis({lerp:.1});
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(function(tm){lenis.raf(tm*1000);});
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function(a){
      a.addEventListener('click',function(e){
        var h=a.getAttribute('href'); if(h.length<2) return;
        var el=$(h); if(!el) return; e.preventDefault();
        lenis.scrollTo(h==='#top'?0:el,{offset:h==='#top'?0:-60});
      });
    });
  }
  var mm=gsap.matchMedia();

  /* 1. Hero: el titular sube por palabras DETRAS; la camioneta llega conduciendo; la carretera sube */
  (function(){
    var h1=$('#h1');
    $$('.l1,.l2',h1).forEach(function(line){
      var words=line.textContent.trim().split(/\s+/); line.textContent='';
      words.forEach(function(w,i){
        if(i) line.appendChild(document.createTextNode(' '));
        var o=document.createElement('span'); o.className='w';
        var s=document.createElement('span'); s.textContent=w; o.appendChild(s); line.appendChild(o);
      });
    });
    var tl=gsap.timeline({defaults:{ease:EASE}});
    tl.from('#h1 .w>span',{yPercent:105,duration:1.1,stagger:.08},0)
      .from('#heroTruck,#heroCab',{xPercent:55,duration:1.5,ease:'power4.out'},.15)
      .from('.hero__road',{yPercent:100,duration:.9},.45)
      .from('.hero__copy .lead',{y:24,opacity:0,duration:.8},.8)
      .from('.hero__copy .btn',{scale:.95,opacity:0,duration:.6,stagger:.08},.95)
      .from('.hero__facts',{opacity:0,duration:.8},1.1);
    /* al bajar: la camioneta sigue su camino hacia la izquierda, el titular sube mas despacio */
    gsap.to('#heroTruck,#heroCab',{xPercent:-14,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.4}});
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
      cur=i;
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
    var st=ScrollTrigger.create({
      trigger:sec,start:'top top',end:function(){return '+='+len();},
      pin:stage,pinSpacing:true,anticipatePin:1,invalidateOnRefresh:true,
      snap:{snapTo:function(p){var n=Math.round(p*(steps-1)*1)/(steps-1);return Math.max(0,Math.min(1,n));},duration:{min:.2,max:.5},delay:.15,ease:'power2.inOut'},
      onUpdate:function(self){
        pinned=self.isActive;
        var i=Math.min(steps-1,Math.round(self.progress*(steps-1)));
        goto(i,true);
      },
      onToggle:function(self){pinned=self.isActive;}
    });
    /* entrada de la hoja: se corta con un recorte desde arriba; la camioneta entra desde la derecha */
    gsap.from('.slip',{clipPath:'inset(0 0 100% 0)',duration:1,ease:'power3.out',scrollTrigger:{trigger:sec,start:'top 75%',once:true}});
    gsap.from('.diagram__img',{xPercent:18,opacity:0,duration:1.1,ease:'expo.out',scrollTrigger:{trigger:sec,start:'top 75%',once:true}});
    gsap.from('.hs',{scale:0,duration:.5,stagger:.09,ease:'back.out(2)',delay:.5,scrollTrigger:{trigger:sec,start:'top 70%',once:true}});
    return function(){st.kill();};
  });

  /* 3. Cifras: tres entradas distintas */
  (function(){
    var trig={trigger:'.nums',start:'top 65%',once:true};
    gsap.from('.nm--a',{xPercent:-14,opacity:0,duration:1.1,ease:'expo.out',scrollTrigger:trig});
    var c=$('.nm--b [data-count]'), target=+c.getAttribute('data-count'), o={v:0};
    gsap.from('.nm--b',{opacity:0,duration:.6,scrollTrigger:trig});
    gsap.to(o,{v:target,duration:1.6,ease:'power3.out',onUpdate:function(){c.textContent=Math.round(o.v);},scrollTrigger:trig});
    gsap.from('.nm--c',{clipPath:'inset(100% 0 0 0)',y:40,duration:1.1,ease:'power4.out',delay:.35,scrollTrigger:trig});
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
