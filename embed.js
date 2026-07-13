(function(){
  'use strict';

  function bootDeratWidget(){
    if(document.getElementById('derat-widget-host')) return;

    var WIDGET_URL='https://derat-chatbot-backend.vercel.app/?v=compact-scroll-5';
    var WIDGET_ORIGIN=new URL(WIDGET_URL,document.baseURI).origin;

    var oldFrame=document.getElementById('derat-frame');
    var oldTeaser=document.getElementById('derat-teaser');
    if(oldFrame) oldFrame.remove();
    if(oldTeaser) oldTeaser.remove();

    var host=document.createElement('div');
    host.id='derat-widget-host';
    host.style.setProperty('position','fixed','important');
    host.style.setProperty('inset','0','important');
    host.style.setProperty('width','100vw','important');
    host.style.setProperty('height','100vh','important');
    host.style.setProperty('height','100dvh','important');
    host.style.setProperty('z-index','2147483000','important');
    host.style.setProperty('pointer-events','none','important');
    host.style.setProperty('overflow','visible','important');
    host.style.setProperty('background','transparent','important');
    host.style.setProperty('margin','0','important');
    host.style.setProperty('padding','0','important');

    var shadow=host.attachShadow({mode:'open'});
    shadow.innerHTML=`
      <style>
        :host,*,*::before,*::after{box-sizing:border-box}
        #derat-frame{position:absolute;right:24px;bottom:18px;width:138px;height:148px;max-width:100vw;max-height:100%;margin:0;padding:0;border:0;background:transparent;display:block;opacity:0;visibility:hidden;pointer-events:none;z-index:2;transform:translateZ(0);backface-visibility:hidden;transition:opacity .16s ease}
        #derat-frame.derat-ready{opacity:1;visibility:visible;pointer-events:auto}
        #derat-frame.derat-open{right:12px;bottom:10px;width:min(470px,calc(100vw - 24px));height:calc(100% - 20px);max-height:calc(100% - 20px);clip-path:none;filter:none}
        #derat-mobile-glow{display:none;position:absolute;pointer-events:none;border-radius:50%;z-index:1;opacity:0;transition:opacity .16s ease}
        #derat-frame.derat-ready:not(.derat-open)+#derat-mobile-glow{opacity:1}
        #derat-frame.derat-open+#derat-mobile-glow{display:none!important}
        #derat-teaser{position:absolute;right:46px;bottom:132px;width:280px;max-width:calc(100vw - 32px);padding:15px 17px 16px;margin:0;border:1px solid #e6e6e6;border-radius:20px 20px 6px 20px;background:#fff;box-shadow:0 18px 46px rgba(57,57,58,.22);color:#39393a;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-style:normal;text-align:left;opacity:0;visibility:hidden;transform:translateY(12px) scale(.95);transform-origin:bottom right;transition:opacity .35s ease,transform .35s cubic-bezier(.2,.85,.25,1),border-color .2s ease,box-shadow .2s ease;pointer-events:none;cursor:pointer;z-index:3;-webkit-tap-highlight-color:transparent}
        #derat-teaser.derat-show{opacity:1;visibility:visible;transform:translateY(0) scale(1);pointer-events:auto}
        #derat-teaser.derat-show:hover{border-color:rgba(41,115,115,.28);box-shadow:0 22px 52px rgba(57,57,58,.24);transform:translateY(-2px) scale(1)}
        #derat-teaser::after{content:"";position:absolute;right:28px;bottom:-8px;width:16px;height:16px;background:#fff;border-right:1px solid #e6e6e6;border-bottom:1px solid #e6e6e6;border-radius:0 0 2px 0;transform:rotate(45deg)}
        .dt-title{display:block;margin:0 18px 3px 0;padding:0;color:#39393a;font-size:14.5px;font-weight:800;line-height:1.3}
        .dt-text{display:block;margin:0;padding:0;color:#6b6b6c;font-size:12.5px;font-weight:500;line-height:1.5}
        .dt-text b{color:#297373;font-weight:800}
        .dt-close{all:unset;position:absolute;top:7px;right:8px;width:20px;height:20px;border-radius:50%;background:#eef1ef;color:#7c857a;font-family:Arial,sans-serif;font-size:15px;font-weight:700;line-height:20px;text-align:center;cursor:pointer;transition:background .2s ease,color .2s ease}
        .dt-close:hover{background:#dfe6e2;color:#39393a}
        #derat-teaser:focus-visible,.dt-close:focus-visible{outline:3px solid rgba(41,115,115,.3);outline-offset:3px}
        @media(max-width:768px){
          #derat-frame{right:-4px;bottom:0;width:124px;height:124px;clip-path:circle(45px at 64px 64px);filter:none}
          #derat-mobile-glow{display:block;right:16px;bottom:20px;width:80px;height:80px;background:transparent;box-shadow:0 0 0 5px rgba(255,255,255,.90),0 0 18px 6px rgba(255,126,71,.22)}
          #derat-frame.derat-open{right:0;bottom:0;width:100vw;height:100%;max-height:100%;clip-path:none;filter:none}
          #derat-teaser{display:none!important}
        }
        @media(hover:none),(pointer:coarse){#derat-teaser{display:none!important}}
        @media(prefers-reduced-motion:reduce){#derat-frame,#derat-teaser,#derat-mobile-glow{transition:none!important}}
      </style>
      <div id="derat-teaser" role="button" tabindex="0" aria-hidden="true" aria-label="Otvoriť kalkulačku DERAT">
        <button class="dt-close" type="button" aria-label="Zavrieť upozornenie">&times;</button>
        <span class="dt-title">Zistite cenu zásahu na počkanie</span>
        <span class="dt-text">Otvorte <b>kalkulačku</b> — orientačnú cenu deratizácie či dezinsekcie máte do minúty. Poradí aj náš <b>AI asistent</b>.</span>
      </div>
      <iframe id="derat-frame" title="DERAT — AI asistent a kalkulačka" allow="clipboard-write" referrerpolicy="strict-origin-when-cross-origin"></iframe>
      <div id="derat-mobile-glow" aria-hidden="true"></div>
    `;

    document.body.appendChild(host);
    var frame=shadow.getElementById('derat-frame');
    var teaser=shadow.getElementById('derat-teaser');
    var closeButton=shadow.querySelector('.dt-close');
    var widgetReady=false,pendingOpen=false,dismissed=false,teaserTimer=0,readyFallbackTimer=0;

    function hideTeaser(){if(teaserTimer){clearTimeout(teaserTimer);teaserTimer=0}teaser.classList.remove('derat-show');teaser.setAttribute('aria-hidden','true')}
    function showTeaserLater(delay){if(!widgetReady||dismissed||frame.classList.contains('derat-open'))return;if(teaserTimer)clearTimeout(teaserTimer);teaserTimer=setTimeout(function(){teaserTimer=0;if(!dismissed&&!frame.classList.contains('derat-open')){teaser.classList.add('derat-show');teaser.setAttribute('aria-hidden','false')}},delay)}
    function markReady(){if(widgetReady)return;widgetReady=true;clearTimeout(readyFallbackTimer);frame.classList.add('derat-ready');showTeaserLater(1400)}
    function setOpen(open){frame.classList.toggle('derat-open',Boolean(open));if(open)hideTeaser();else if(!dismissed)showTeaserLater(600)}
    function postToWidget(type){try{frame.contentWindow.postMessage({source:'derat-parent',type:type},WIDGET_ORIGIN)}catch(error){}}
    function openCalculator(){if(!widgetReady)return;pendingOpen=true;setOpen(true);requestAnimationFrame(function(){postToWidget('open-calc');setTimeout(function(){postToWidget('open-calc')},120)})}

    closeButton.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();dismissed=true;hideTeaser()});
    teaser.addEventListener('click',openCalculator);
    teaser.addEventListener('keydown',function(event){if(event.key==='Enter'||event.key===' '){event.preventDefault();openCalculator()}});
    window.addEventListener('message',function(event){if(event.source!==frame.contentWindow||event.origin!==WIDGET_ORIGIN)return;var data=event.data||{};if(data.source!=='derat-chat')return;if(data.type==='ready'){markReady();if(pendingOpen)postToWidget('open-calc');return}if(data.open===true){pendingOpen=false;setOpen(true);return}if(data.type==='close'||data.open===false){pendingOpen=false;setOpen(false)}});
    frame.addEventListener('load',function(){setTimeout(markReady,80)},{once:true});
    readyFallbackTimer=setTimeout(markReady,5000);
    frame.src=WIDGET_URL;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootDeratWidget,{once:true});
  else bootDeratWidget();
})();