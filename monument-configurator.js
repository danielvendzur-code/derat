(function(){
  var KP = {
    shapes: {
      classic: { title:'Klasický', sub:'rovný stojaci pomník', price:0, cls:'kp-shape-classic' },
      arch: { title:'Oblúk', sub:'jemná horná línia', price:180, cls:'kp-shape-arch' },
      book: { title:'Kniha', sub:'otvorená spomienka', price:320, cls:'kp-shape-book' }
    },
    sizes: {
      urn: { title:'Urnový', sub:'malé urnové miesto', price:980, cls:'kp-size-urn' },
      single: { title:'Jednohrob', sub:'90 × 200 cm', price:1450, cls:'kp-size-single' },
      double: { title:'Dvojhrob', sub:'160 × 220 cm', price:2190, cls:'kp-size-double' }
    },
    colors: {
      black: { title:'Čierna žula', sub:'najlepší kontrast nápisu', mul:1.12, cls:'kp-color-black', sw:'#272A2D' },
      gray: { title:'Sivá žula', sub:'pokojná a praktická', mul:1, cls:'kp-color-gray', sw:'#8C9692' },
      red: { title:'Červenohnedá', sub:'teplejší výraz kameňa', mul:1.16, cls:'kp-color-red', sw:'#8E493D' },
      light: { title:'Svetlá žula', sub:'jemný svetlý kameň', mul:1.08, cls:'kp-color-light', sw:'#C4BCAE' }
    },
    letterColors: {
      gold: { title:'Zlatá', sw:'#D8A93A', cls:'kp-letter-gold' },
      silver: { title:'Strieborná', sw:'#D7DADF', cls:'kp-letter-silver' },
      white: { title:'Biela', sw:'#F8F4EA', cls:'kp-letter-white' },
      dark: { title:'Tmavá', sw:'#2D2A26', cls:'kp-letter-dark' }
    },
    fonts: {
      classic: { title:'Klasické', cls:'kp-font-classic' },
      modern: { title:'Moderné', cls:'kp-font-modern' },
      script: { title:'Písané', cls:'kp-font-script' }
    }
  };

  function ensureState(){
    if(typeof calcState === 'undefined') window.calcState = {};
    calcState.totalSteps = 5;
    if(typeof calcState.step !== 'number') calcState.step = 0;
    if(!calcState.kpMode) calcState.kpMode = 'config';
    if(!calcState.kpShape) calcState.kpShape = 'classic';
    if(!calcState.kpSize) calcState.kpSize = 'single';
    if(!calcState.kpColor) calcState.kpColor = 'black';
    if(typeof calcState.kpInscription === 'undefined') calcState.kpInscription = 'Rodina';
    if(typeof calcState.kpEpitaph === 'undefined') calcState.kpEpitaph = '';
    if(!calcState.kpLetterColor) calcState.kpLetterColor = 'gold';
    if(!calcState.kpFont) calcState.kpFont = 'classic';
    if(typeof calcState.kpAssistantAnswer === 'undefined') calcState.kpAssistantAnswer = 'Som tu aj ako chatbot. Opýtajte sa na kameň, veľkosť, nápis alebo údržbu a odpoviem podľa aktuálneho výberu.';
    if(typeof calcState.kpAssistantQuestion === 'undefined') calcState.kpAssistantQuestion = '';
    if(typeof calcState.contactName === 'undefined') calcState.contactName = '';
    if(typeof calcState.contactPhone === 'undefined') calcState.contactPhone = '';
    if(typeof calcState.contactEmail === 'undefined') calcState.contactEmail = '';
  }

  function h(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[c];
    });
  }

  function kpMoney(n){
    return Math.round(Number(n)||0).toLocaleString('sk-SK') + ' €';
  }

  function calcPrice(){
    ensureState();
    var base = KP.sizes[calcState.kpSize].price + KP.shapes[calcState.kpShape].price;
    var material = base * KP.colors[calcState.kpColor].mul;
    var inscription = (calcState.kpInscription || '').trim() ? (calcState.kpLetterColor === 'gold' ? 220 : 160) : 0;
    var setup = calcState.kpSize === 'double' ? 520 : (calcState.kpSize === 'single' ? 390 : 190);
    return { material:material, inscription:inscription, setup:setup, total:material + inscription + setup };
  }

  function iconSvg(kind){
    if(kind === 'shape') return '<svg viewBox="0 0 24 24"><path d="M7 20h10v-3H7v3Zm2-5h6V7a3 3 0 0 0-6 0v8Z"/></svg>';
    if(kind === 'size') return '<svg viewBox="0 0 24 24"><path d="M4 20h16v-3H4v3Zm2-5h4V8H6v7Zm6 0h6V4h-6v11Z"/></svg>';
    return '<svg viewBox="0 0 24 24"><path d="M12 2 4 10c-3 3-1 9 4 9h8c5 0 7-6 4-9L12 2Zm0 4.8 4.8 4.8c1.7 1.7.5 4.4-1.9 4.4H9.1c-2.4 0-3.6-2.7-1.9-4.4L12 6.8Z"/></svg>';
  }

  function assetUrl(shape, color, size){
    return 'assets/monument-' + shape + '-' + color + '-' + size + '.webp?v=29';
  }

  function configLabel(shape, color, size){
    return KP.shapes[shape].title + ' / ' + KP.sizes[size].title + ' / ' + KP.colors[color].title;
  }

  function photoImg(shape, color, size, cls){
    return '<img class="'+cls+'" src="'+assetUrl(shape, color, size)+'" alt="'+h(configLabel(shape, color, size))+'" loading="eager" decoding="async" fetchpriority="high">';
  }

  function inscriptionText(){
    var txt = (calcState.kpInscription || '').trim();
    return txt || 'Rodina';
  }

  function inscriptionOverlay(){
    var text = inscriptionText();
    var lengthClass = text.length > 20 ? ' kp-insc-long' : (text.length > 12 ? ' kp-insc-mid' : '');
    var cls = 'kp-preview-inscription ' +
      KP.letterColors[calcState.kpLetterColor].cls + ' ' +
      KP.fonts[calcState.kpFont].cls + ' kp-insc-' + calcState.kpShape + ' kp-insc-' + calcState.kpSize + lengthClass;
    return '<div id="kpLiveInscription" class="'+cls+'">'+h(text)+'</div>';
  }

  function monumentHtml(extraCls, inscription){
    var text = inscription || '';
    return '<div class="kp-monument '+extraCls+'">' +
      '<span class="kp-slab"></span><span class="kp-base"></span>' +
      '<span class="kp-head" data-inscription="'+h(text)+'"></span>' +
      '<span class="kp-vase"></span><span class="kp-lamp"></span>' +
    '</div>';
  }

  function previewHtml(){
    ensureState();
    return '<div class="mc-step-img asset-photo kp-preview kp-preview-photo">' +
      photoImg(calcState.kpShape, calcState.kpColor, calcState.kpSize, 'kp-render-img') +
      inscriptionOverlay() +
    '</div>';
  }

  function miniHtml(shape, size, color, cls){
    return '<div class="kp-mini-stage kp-mini-photo">' + photoImg(shape, color, size, cls || 'kp-thumb-img') + '</div>';
  }

  function optionCard(kind, key, item){
    ensureState();
    var selected = (kind === 'kpShape' && calcState.kpShape === key) ||
      (kind === 'kpSize' && calcState.kpSize === key);
    var shapeKey = kind === 'kpShape' ? key : calcState.kpShape;
    var sizeKey = kind === 'kpSize' ? key : calcState.kpSize;
    var action = kind === 'kpShape' ? 'selectMonumentShape' : 'selectMonumentSize';
    return '<div class="mc-product-card kp-option-card '+(selected?'selected':'')+'" onclick="'+action+'(\''+key+'\')">' +
      '<div class="mc-product-img">'+miniHtml(shapeKey, sizeKey, calcState.kpColor, 'kp-thumb-img')+'</div>' +
      '<div class="mc-product-info">' +
        '<div class="mc-product-name">'+item.title+'</div>' +
        '<div class="mc-product-desc">'+item.sub+'</div>' +
      '</div>' +
    '</div>';
  }

  function stoneCard(key, item){
    ensureState();
    return '<div class="mc-color-card kp-stone-card '+(calcState.kpColor === key ? 'selected' : '')+'" onclick="selectMonumentColor(\''+key+'\')">' +
      '<div class="mc-color-photo kp-color-photo">'+miniHtml(calcState.kpShape, calcState.kpSize, key, 'kp-color-img')+'</div>' +
      '<div class="mc-color-body">' +
        '<div class="mc-color-name">'+item.title+'</div>' +
        '<div class="mc-color-ral">'+item.sub+'</div>' +
      '</div>' +
    '</div>';
  }

  function letterColorButton(key, item){
    var selected = calcState.kpLetterColor === key;
    return '<button class="kp-style-chip '+(selected?'selected':'')+'" onclick="selectLetterColor(\''+key+'\')" type="button">' +
      '<span class="kp-style-swatch" style="--sw:'+item.sw+'"></span><span>'+item.title+'</span>' +
    '</button>';
  }

  function fontButton(key, item){
    var selected = calcState.kpFont === key;
    return '<button class="kp-style-chip kp-font-pick '+item.cls+' '+(selected?'selected':'')+'" onclick="selectLetterFont(\''+key+'\')" type="button">' +
      '<span>Rodina</span><small>'+item.title+'</small>' +
    '</button>';
  }

  function ensureModeTabs(){
    if(document.getElementById('kpModeTabs')) return;
    var chat = document.getElementById('mojplot-chat');
    var header = chat && chat.querySelector('.mc-header');
    if(!header) return;
    var tabs = document.createElement('div');
    tabs.id = 'kpModeTabs';
    tabs.className = 'kp-mode-tabs';
    var cfgIcon = '<svg class="kp-tab-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 20h12v-3H6v3Zm2-5h8V8.6a4 4 0 0 0-8 0V15Zm2-6.4a2 2 0 0 1 4 0V13h-4V8.6Z"/></svg>';
    var chatIcon = '<svg class="kp-tab-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18.5V20l2.5-1.35c1.15.55 2.46.85 3.88.85 4.35 0 7.62-2.64 7.62-6.25S15.73 7 11.38 7 3.75 9.64 3.75 13.25c0 1.34.46 2.55 1.25 3.55v1.7Zm9.9-8.15.56 1.28 1.29.55-1.29.56-.56 1.28-.55-1.28-1.29-.56 1.29-.55.55-1.28ZM9 11.5h3v1.35H9V11.5Zm0 2.45h4.75v1.35H9v-1.35Z"/></svg>';
    tabs.innerHTML =
      '<button id="kpModeSwitch" class="kp-mode-switch" type="button" data-config-icon="'+h(cfgIcon)+'" data-chat-icon="'+h(chatIcon)+'">' +
        '<span class="kp-mode-ico"></span><span class="kp-mode-copy"><strong></strong><small></small></span>' +
      '</button>';
    header.insertAdjacentElement('afterend', tabs);
  }

  function updateBrandMode(){
    var mode = calcState.kpMode || 'config';
    var headerLogo = document.querySelector('.mc-hdr-av .kp-brand-logo');
    if(headerLogo){
      headerLogo.classList.toggle('kp-brand-config', mode !== 'chat');
      headerLogo.classList.toggle('kp-brand-bot', mode === 'chat');
    }
    document.querySelectorAll('.mc-av .kp-brand-logo').forEach(function(el){
      el.classList.add('kp-brand-bot');
    });
  }

  function updateModeTabs(){
    var mode = calcState.kpMode || 'config';
    var switcher = document.getElementById('kpModeSwitch');
    if(switcher){
      var goingChat = mode === 'config';
      var icon = goingChat ? switcher.getAttribute('data-chat-icon') : switcher.getAttribute('data-config-icon');
      switcher.setAttribute('onclick', goingChat ? "setKpMode('chat')" : "setKpMode('config')");
      switcher.classList.toggle('to-chat', goingChat);
      switcher.classList.toggle('to-config', !goingChat);
      var ico = switcher.querySelector('.kp-mode-ico');
      var strong = switcher.querySelector('strong');
      var small = switcher.querySelector('small');
      if(ico) ico.innerHTML = icon || '';
      if(strong) strong.textContent = goingChat ? 'Otvoriť AI asistenta' : 'Späť do konfigurátora';
      if(small) small.textContent = goingChat ? 'Poradí s materiálom, nápisom a cenou' : 'Upraviť tvar, kameň a nápis';
    }
    updateBrandMode();
  }

  function assistantCard(){
    var answer = calcState.kpAssistantAnswer || 'Som tu aj ako chatbot. Opýtajte sa na kameň, veľkosť, nápis alebo údržbu a odpoviem podľa aktuálneho výberu.';
    var question = (calcState.kpAssistantQuestion || '').trim();
    var userRow = question ? '<div class="mc-row user kp-chat-row"><div class="mc-mc"><div class="mc-m user">'+h(question)+'</div></div></div>' : '';
    return '<div class="kp-chat-card">' +
      '<div class="kp-chat-log">' +
        userRow +
        '<div class="mc-row bot kp-chat-row">' +
          '<div class="mc-av">'+brandMarkHtml('kp-brand-chat')+'</div>' +
          '<div class="mc-mc"><div class="mc-m bot" id="kpAssistantAnswer">'+h(answer)+'</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="mc-chips kp-chat-chips">' +
        '<button class="mc-chip" type="button" onclick="askMonumentQuick(\'Ktorý kameň je najpraktickejší?\')">Kameň</button>' +
        '<button class="mc-chip" type="button" onclick="askMonumentQuick(\'Aký nápis odporúčaš?\')">Nápis</button>' +
        '<button class="mc-chip" type="button" onclick="askMonumentQuick(\'Čo ovplyvní cenu?\')">Cena</button>' +
      '</div>' +
      '<div class="mc-ibar kp-chat-input">' +
        '<input class="mc-inp" id="kpAskInput" value="'+h(calcState.kpAssistantQuestion || '')+'" placeholder="Napíšte otázku..." onkeydown="if(event.key===\'Enter\') askMonumentAssistant()">' +
        '<button class="mc-send" type="button" onclick="askMonumentAssistant()" aria-label="Odoslať otázku"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>' +
      '</div>' +
    '</div>';
  }

  function summaryRows(){
    ensureState();
    var p = calcPrice();
    return '<div class="mc-summary-card">' +
      '<div class="mc-summary-title">Vaša konfigurácia</div>' +
      row('Tvar', KP.shapes[calcState.kpShape].title) +
      row('Veľkosť', KP.sizes[calcState.kpSize].title + ' · ' + KP.sizes[calcState.kpSize].sub) +
      row('Kameň', KP.colors[calcState.kpColor].title) +
      row('Nápis', calcState.kpInscription || '-') +
      row('Písmo', KP.letterColors[calcState.kpLetterColor].title + ' · ' + KP.fonts[calcState.kpFont].title) +
    '</div>' +
    '<div class="mc-breakdown">' +
      bRow('Pomník + krycia doska', kpMoney(p.material)) +
      bRow('Nápis', kpMoney(p.inscription)) +
      bRow('Montáž / usadenie', kpMoney(p.setup)) +
      '<div class="mc-breakdown-total"><span>Spolu orientačne</span><span>'+kpMoney(p.total)+'</span></div>' +
    '</div>';
  }

  function row(k,v){
    return '<div class="mc-summary-row"><span class="mc-summary-key">'+k+'</span><span class="mc-summary-val">'+h(v)+'</span></div>';
  }

  function bRow(k,v){
    return '<div class="mc-breakdown-row"><span>'+k+'</span><span>'+v+'</span></div>';
  }

  function brief(){
    var p = calcPrice();
    return [
      'Dopyt na pohrebný pomník',
      'Tvar: ' + KP.shapes[calcState.kpShape].title,
      'Veľkosť: ' + KP.sizes[calcState.kpSize].title + ' (' + KP.sizes[calcState.kpSize].sub + ')',
      'Kameň: ' + KP.colors[calcState.kpColor].title,
      'Nápis: ' + (calcState.kpInscription || '-'),
      'Písmo: ' + KP.letterColors[calcState.kpLetterColor].title + ', ' + KP.fonts[calcState.kpFont].title,
      'Poznámka: ' + (calcState.kpEpitaph || '-'),
      'Meno: ' + (calcState.contactName || '-'),
      'Telefón: ' + (calcState.contactPhone || '-'),
      'E-mail: ' + (calcState.contactEmail || '-'),
      'Orientačná cena: ' + kpMoney(p.total)
    ].join('\n');
  }

  window.updateProgress = function(){
    ensureState();
    var dots = document.getElementById('calcProgressDots');
    if(dots){
      dots.style.setProperty('--step-count', calcState.totalSteps);
      var names = ['Tvar','Veľkosť','Kameň','Nápis','Ponuka'];
      var html = '';
      for(var i=0;i<calcState.totalSteps;i++){
        html += '<span class="mc-step-dot kp-step-pill '+(i < calcState.step ? 'done ' : '')+(i === calcState.step ? 'active' : '')+'" data-step="'+(i+1)+'"><b>'+(i+1)+'</b><em>'+names[i]+'</em></span>';
      }
      dots.innerHTML = html;
    }
    var label = document.getElementById('calcStepLabel');
    if(label) label.textContent = (['Tvar pomníka','Veľkosť miesta','Kameň','Nápis','Ponuka'][calcState.step] || 'Krok') + ' · ' + (calcState.step + 1) + '/' + calcState.totalSteps;
    var back = document.getElementById('calcBackBtn');
    if(back) back.disabled = calcState.step === 0;
  };

  window.openCalc = function(){
    ensureState();
    calcState.kpMode = 'config';
    ensureModeTabs();
    var c = document.getElementById('calcContainer');
    if(c) c.setAttribute('data-open', 'true');
    var chat = document.getElementById('mojplot-chat');
    if(chat){
      chat.classList.add('calc-open','kp-mode-config');
      chat.classList.remove('kp-mode-chat');
    }
    if(typeof syncCalcChrome === 'function') syncCalcChrome(true);
    var ht = document.getElementById('hdr-title');
    if(ht) ht.textContent = 'Kamenárstvo Jantár';
    updateModeTabs();
    renderCalcStep();
    setTimeout(function(){
      if(typeof fitCalcStep === 'function') fitCalcStep();
      if(typeof updateCalcScrollHint === 'function') updateCalcScrollHint();
    }, 140);
    if(typeof bindCalcScroll === 'function') bindCalcScroll();
  };

  window.closeCalc = function(){
    setKpMode('chat');
  };

  window.setKpMode = function(mode){
    ensureState();
    ensureModeTabs();
    calcState.kpMode = mode === 'chat' ? 'chat' : 'config';
    var c = document.getElementById('calcContainer');
    var chat = document.getElementById('mojplot-chat');
    var ht = document.getElementById('hdr-title');
    if(calcState.kpMode === 'config'){
      if(c) c.setAttribute('data-open', 'true');
      if(chat){
        chat.classList.add('calc-open','kp-mode-config');
        chat.classList.remove('kp-mode-chat');
      }
      if(typeof syncCalcChrome === 'function') syncCalcChrome(true);
      if(ht) ht.textContent = 'Kamenárstvo Jantár';
      renderCalcStep();
      setTimeout(function(){
        if(typeof fitCalcStep === 'function') fitCalcStep();
        if(typeof updateCalcScrollHint === 'function') updateCalcScrollHint();
      }, 140);
    } else {
      syncInputs();
      if(c) c.setAttribute('data-open', 'false');
      if(chat){
        chat.classList.remove('calc-open','kp-mode-config');
        chat.classList.add('kp-mode-chat');
      }
      if(typeof syncCalcChrome === 'function') syncCalcChrome(false);
      if(ht) ht.textContent = 'Kamenárstvo Jantár';
      var input = document.getElementById('inputField');
      if(input) input.placeholder = 'Opýtajte sa na kameň, veľkosť, nápis...';
    }
    updateModeTabs();
  };

  window.openChatCalc = function(){
    if(!MC.open && typeof toggleChat === 'function') toggleChat();
    window.setTimeout(function(){ openCalc(); }, 0);
  };

  window.calcBack = function(){
    ensureState();
    if(calcState.step > 0){
      syncInputs();
      calcState.step--;
      renderCalcStep();
    }
  };

  window.next = function(){
    ensureState();
    syncInputs();
    calcState.step = Math.min(calcState.totalSteps - 1, calcState.step + 1);
    renderCalcStep();
  };

  window.renderCalcStep = function(){
    ensureState();
    updateProgress();
    var el = document.getElementById('calcContent');
    var pw = document.getElementById('calcProgressWrap');
    if(pw) pw.style.display = '';
    if(!el) return;

    if(calcState.step === 0){
      el.innerHTML = '<div class="mc-step kp-step-card">' +
        '<span class="kp-badge">'+iconSvg('shape')+' Krok 1 · výber tvaru</span>' +
        previewHtml() +
        '<div class="mc-step-title">Tvar pomníka</div>' +
        '<div class="mc-step-sub">Najprv vyberte základný tvar pomníka. Náhľad a ďalšie možnosti sa prispôsobia výberu.</div>' +
        '<div class="mc-product-grid kp-choice-grid">' +
          Object.keys(KP.shapes).map(function(k){ return optionCard('kpShape', k, KP.shapes[k]); }).join('') +
        '</div>' +
        '<div class="mc-actions"><button class="mc-btn" onclick="next()">Pokračovať</button></div>' +
      '</div>';
    }
    else if(calcState.step === 1){
      el.innerHTML = '<div class="mc-step kp-step-card">' +
        '<span class="kp-badge">'+iconSvg('size')+' Krok 2 · veľkosť</span>' +
        previewHtml() +
        '<div class="mc-step-title">Veľkosť miesta</div>' +
        '<div class="mc-step-sub">Urnový pomník, jednohrob alebo dvojhrob. Presné miery sa potvrdia zameraním.</div>' +
        '<div class="mc-product-grid kp-choice-grid">' +
          Object.keys(KP.sizes).map(function(k){ return optionCard('kpSize', k, KP.sizes[k]); }).join('') +
        '</div>' +
        '<div class="mc-actions"><button class="mc-btn-secondary" onclick="calcBack()">Späť</button><button class="mc-btn" onclick="next()">Pokračovať</button></div>' +
      '</div>';
    }
    else if(calcState.step === 2){
      el.innerHTML = '<div class="mc-step kp-step-card">' +
        '<span class="kp-badge">'+iconSvg('stone')+' Krok 3 · materiál</span>' +
        previewHtml() +
        '<div class="mc-step-title">Farba kameňa</div>' +
        '<div class="mc-step-sub">Po tvare a veľkosti pridajte materiál. Ilustrácia aj cena sa hneď upravia.</div>' +
        '<div class="mc-color-grid kp-color-grid">' +
          Object.keys(KP.colors).map(function(k){ return stoneCard(k, KP.colors[k]); }).join('') +
        '</div>' +
        '<div class="mc-actions"><button class="mc-btn-secondary" onclick="calcBack()">Späť</button><button class="mc-btn" onclick="next()">Pokračovať</button></div>' +
      '</div>';
    }
    else if(calcState.step === 3){
      el.innerHTML = '<div class="mc-step kp-step-card">' +
        '<span class="kp-badge">Krok 4 · detail</span>' +
        previewHtml() +
        '<div class="mc-step-title">Nápis a štýl</div>' +
        '<div class="mc-step-sub">Píšte vlastný text, vyberte farbu a štýl písma. Náhľad sa mení priamo nad fotkou.</div>' +
        '<div class="mc-contact-form" style="margin-top:0">' +
          '<input class="mc-form-input" id="kpInscription" value="'+h(calcState.kpInscription || '')+'" placeholder="Nápis na pomník, napr. Rodina Nováková" oninput="saveMonumentInput()">' +
          '<div class="kp-control-label">Farba nápisu</div>' +
          '<div class="kp-style-grid">' + Object.keys(KP.letterColors).map(function(k){ return letterColorButton(k, KP.letterColors[k]); }).join('') + '</div>' +
          '<div class="kp-control-label">Štýl písma</div>' +
          '<div class="kp-font-grid">' + Object.keys(KP.fonts).map(function(k){ return fontButton(k, KP.fonts[k]); }).join('') + '</div>' +
          '<textarea class="mc-form-textarea" id="kpEpitaph" placeholder="Poznámka alebo krátky epitaf..." oninput="saveMonumentInput()">'+h(calcState.kpEpitaph || '')+'</textarea>' +
        '</div>' +
        '<div class="mc-actions"><button class="mc-btn-secondary" onclick="calcBack()">Späť</button><button class="mc-btn" onclick="next()">Zhrnutie</button></div>' +
      '</div>';
    }
    else {
      var p = calcPrice();
      el.innerHTML = '<div class="mc-step mc-step-final kp-step-card">' +
        '<div style="text-align:center;padding:2px 0 6px">' +
          '<div class="mc-step-title" style="text-align:center">Hotová konfigurácia</div>' +
          '<div class="mc-step-sub" style="text-align:center">Nižšie je orientačná cena a dopyt pre kamenára.</div>' +
        '</div>' +
        previewHtml() +
        '<div class="mc-result-card">' +
          '<div class="mc-result-label">Orientačná cena</div>' +
          '<div class="mc-result-price">'+kpMoney(p.total)+'</div>' +
          '<div class="mc-result-sub">Cena je orientačná. Presná ponuka závisí od cintorína, základov, demontáže a finálneho nápisu.</div>' +
        '</div>' +
        summaryRows() +
        '<div class="mc-contact-form">' +
          '<div class="mc-form-title">Získať presnú ponuku</div>' +
          '<div class="mc-form-sub">Doplňte kontakt a konfiguráciu môžete rovno skopírovať do správy.</div>' +
          '<div class="kp-form-2"><input class="mc-form-input" id="cfName" value="'+h(calcState.contactName || '')+'" placeholder="Meno" oninput="saveMonumentInput()"><input class="mc-form-input" id="cfPhone" value="'+h(calcState.contactPhone || '')+'" placeholder="Telefón" oninput="saveMonumentInput()"></div>' +
          '<input class="mc-form-input" id="cfEmail" value="'+h(calcState.contactEmail || '')+'" placeholder="E-mail" oninput="saveMonumentInput()">' +
          '<button class="mc-btn mc-form-submit" onclick="copyMonumentBrief()">Skopírovať dopyt</button>' +
          '<div class="mc-form-note">V reálnom nasadení sa toto môže napojiť na e-mail alebo formulárový endpoint.</div>' +
        '</div>' +
        '<div class="mc-actions kp-final-actions"><button class="mc-btn-secondary" onclick="calcBack()">Späť</button><button class="mc-btn" onclick="resetCalc()">Nová konfigurácia</button></div>' +
      '</div>';
    }
    var c = document.getElementById('calcContainer');
    if(c) c.scrollTop = 0;
    setTimeout(function(){
      if(typeof fitCalcStep === 'function') fitCalcStep();
      if(typeof updateCalcScrollHint === 'function') updateCalcScrollHint();
    }, 60);
  };

  window.selectMonumentShape = function(v){
    ensureState();
    calcState.kpShape = v;
    renderCalcStep();
  };

  window.selectMonumentSize = function(v){
    ensureState();
    calcState.kpSize = v;
    renderCalcStep();
  };

  window.selectMonumentColor = function(v){
    ensureState();
    calcState.kpColor = v;
    renderCalcStep();
  };

  window.selectLetterColor = function(v){
    ensureState();
    syncInputs();
    calcState.kpLetterColor = v;
    renderCalcStep();
  };

  window.selectLetterFont = function(v){
    ensureState();
    syncInputs();
    calcState.kpFont = v;
    renderCalcStep();
  };

  window.askMonumentQuick = function(q){
    var input = document.getElementById('kpAskInput');
    if(input) input.value = q;
    askMonumentAssistant();
  };

  window.askMonumentAssistant = function(){
    ensureState();
    syncInputs();
    var input = document.getElementById('kpAskInput');
    var q = input ? input.value : '';
    if(!String(q || '').trim()) q = 'Poraď mi podľa aktuálneho výberu.';
    calcState.kpAssistantQuestion = q;
    var answer = localAnswer(q);
    calcState.kpAssistantAnswer = answer;
    var el = document.getElementById('kpAssistantAnswer');
    if(el) el.textContent = answer;
    if(typeof renderCalcStep === 'function') renderCalcStep();
  };

  window.saveMonumentInput = function(){
    syncInputs();
    var live = document.getElementById('kpLiveInscription');
    if(live) live.textContent = inscriptionText();
  };

  function syncInputs(){
    var inscription = document.getElementById('kpInscription');
    var epitaph = document.getElementById('kpEpitaph');
    var name = document.getElementById('cfName');
    var phone = document.getElementById('cfPhone');
    var email = document.getElementById('cfEmail');
    if(inscription) calcState.kpInscription = inscription.value;
    if(epitaph) calcState.kpEpitaph = epitaph.value;
    if(name) calcState.contactName = name.value;
    if(phone) calcState.contactPhone = phone.value;
    if(email) calcState.contactEmail = email.value;
  }

  window.copyMonumentBrief = function(){
    syncInputs();
    var text = brief();
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){ toast('Dopyt je skopírovaný'); }).catch(function(){ toast('Dopyt je pripravený'); });
    } else {
      toast('Dopyt je pripravený');
    }
  };

  window.resetCalc = function(){
    ensureState();
    calcState.step = 0;
    calcState.kpShape = 'classic';
    calcState.kpSize = 'single';
    calcState.kpColor = 'black';
    calcState.kpInscription = 'Rodina';
    calcState.kpEpitaph = '';
    calcState.kpLetterColor = 'gold';
    calcState.kpFont = 'classic';
    calcState.kpAssistantAnswer = 'Som tu aj ako chatbot. Opýtajte sa na kameň, veľkosť, nápis alebo údržbu a odpoviem podľa aktuálneho výberu.';
    calcState.kpAssistantQuestion = '';
    calcState.contactName = '';
    calcState.contactPhone = '';
    calcState.contactEmail = '';
    renderCalcStep();
  };

  function toast(text){
    var el = document.getElementById('kpToast');
    if(!el){
      el = document.createElement('div');
      el.id = 'kpToast';
      el.style.cssText = 'position:fixed;left:50%;bottom:22px;transform:translate(-50%,12px);opacity:0;background:#23272A;color:#fff;border-radius:999px;padding:10px 14px;font:700 13px Inter,Arial,sans-serif;box-shadow:0 16px 38px rgba(31,41,55,.24);z-index:200000;transition:all .2s ease;pointer-events:none';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.style.opacity = '1';
    el.style.transform = 'translate(-50%,0)';
    setTimeout(function(){ el.style.opacity = '0'; el.style.transform = 'translate(-50%,12px)'; }, 1700);
  }

  function localAnswer(q){
    var lower = String(q||'').toLowerCase();
    if(lower.indexOf('kame') >= 0 || lower.indexOf('žula') >= 0 || lower.indexOf('zula') >= 0){
      return 'Na pomníky je najpraktickejšia žula. Čierna je najkontrastnejšia, sivá je pokojná, červenohnedá pôsobí teplejšie a svetlá žula zjemní celý pomník.';
    }
    if(lower.indexOf('veľkos') >= 0 || lower.indexOf('velkos') >= 0 || lower.indexOf('hrob') >= 0){
      return 'Začnite typom miesta: urnové, jednohrob alebo dvojhrob. Presný rozmer sa vždy potvrdí zameraním na cintoríne.';
    }
    if(lower.indexOf('nápis') >= 0 || lower.indexOf('napis') >= 0){
      return 'Nápis držte skôr krátky a čitateľný. Pre tmavý kameň odporúčam zlatú alebo striebornú, pre svetlý kameň tmavé písmo. Teraz máte ' + KP.letterColors[calcState.kpLetterColor].title + ' / ' + KP.fonts[calcState.kpFont].title + '.';
    }
    if(lower.indexOf('cen') >= 0 || lower.indexOf('stoj') >= 0 || lower.indexOf('rozpo') >= 0){
      return 'Cenu najviac ovplyvní veľkosť miesta, typ kameňa, demontáž starého pomníka, základy a nápis. Aktuálne orientačne vychádza ' + kpMoney(calcPrice().total) + '.';
    }
    return 'Aktuálne máte vybraný ' + KP.shapes[calcState.kpShape].title + ', ' + KP.sizes[calcState.kpSize].title + ', ' + KP.colors[calcState.kpColor].title + ', nápis ' + KP.letterColors[calcState.kpLetterColor].title + '. Orientačne ' + kpMoney(calcPrice().total) + '.';
  }

  var oldCallAI = window.callAI;
  window.callAI = function(msg){
    var lower = String(msg||'').toLowerCase();
    if(lower.indexOf('pomnik') >= 0 || lower.indexOf('pomník') >= 0 || lower.indexOf('kame') >= 0 || lower.indexOf('hrob') >= 0 || lower.indexOf('nápis') >= 0 || lower.indexOf('napis') >= 0 || lower.indexOf('cen') >= 0 || lower.indexOf('písmo') >= 0 || lower.indexOf('pismo') >= 0 || lower.indexOf('údrž') >= 0 || lower.indexOf('udrz') >= 0){
      return Promise.resolve(localAnswer(msg));
    }
    if(oldCallAI) return oldCallAI(msg);
    return Promise.resolve(localAnswer(msg));
  };

  function brandMarkHtml(sizeClass){
    return '<div class="kp-brand-logo kp-simple-logo '+(sizeClass || '')+'">' +
      '<svg class="kp-simple-logo-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
        '<path class="kp-logo-chat-outline" d="M17 24.5C17 19.8 20.8 16 25.5 16h13C43.2 16 47 19.8 47 24.5v9.6c0 4.7-3.8 8.5-8.5 8.5h-7.1L20.8 49v-8.1A8.4 8.4 0 0 1 17 33.8v-9.3Z"/>' +
        '<path class="kp-logo-chat-line" d="M25.5 28.2h13M25.5 34.8h9.4"/>' +
      '</svg>' +
    '</div>';
  }

  function applyLogoFallback(img){
    var parent = img && img.parentNode;
    if(!parent || parent.querySelector('.kp-brand-logo')) return;
    var sizeClass = '';
    if(parent.classList.contains('bubble-icon')) sizeClass = 'kp-brand-bubble kp-brand-config';
    if(parent.classList.contains('mc-hdr-av')) sizeClass = 'kp-brand-header kp-brand-config';
    if(parent.classList.contains('mc-av')) sizeClass = 'kp-brand-chat kp-brand-bot';
    parent.innerHTML = brandMarkHtml(sizeClass);
  }

  function wireLogoFallbacks(){
    var logos = document.querySelectorAll('img[alt="Môj plot"], img[alt="Moj plot"]');
    logos.forEach(function(img){
      img.addEventListener('error', function(){ applyLogoFallback(img); }, { once:true });
      if(img.complete && !img.naturalWidth) applyLogoFallback(img);
    });
  }

  function installBrandMarks(){
    [['.bubble-icon','kp-brand-bubble kp-brand-config'],['.mc-hdr-av','kp-brand-header kp-brand-config'],['.mc-av','kp-brand-chat kp-brand-bot']].forEach(function(pair){
      document.querySelectorAll(pair[0]).forEach(function(el){
        if(!el.querySelector('.kp-brand-logo')) el.innerHTML = brandMarkHtml(pair[1]);
      });
    });
    window.botAvatarHtml = function(){ return brandMarkHtml('kp-brand-chat kp-brand-bot'); };
    updateBrandMode();
  }

  function refreshMonumentWelcome(){
    if(!window.MC || !MC.s || !MC.s[MC.lang]) return;
    if(MC.hist && MC.hist.length) return;
    var msgs = document.getElementById('messages');
    if(!msgs || typeof addMsg !== 'function') return;
    msgs.innerHTML = '';
    addMsg(MC.s[MC.lang].welcome, 'bot');
    if(typeof renderWelcomeChips === 'function') renderWelcomeChips();
  }

  function initMonumentWidget(){
    ensureState();
    wireLogoFallbacks();
    installBrandMarks();
    ensureModeTabs();
    document.title = 'Kamenárstvo Jantár - AI asistent a konfigurátor pomníka';
    var ht = document.getElementById('hdr-title');
    var hs = document.getElementById('hdr-sub');
    var ctaTitle = document.getElementById('cta-title');
    var ctaSub = document.getElementById('cta-sub');
    var teaserTitle = document.querySelector('.mp-teaser-title');
    var teaserText = document.querySelector('.mp-teaser-text');
    if(ht) ht.textContent = 'Kamenárstvo Jantár';
    if(hs) hs.textContent = 'AI asistent a konfigurátor';
    if(ctaTitle) ctaTitle.textContent = 'Konfigurátor pomníka Jantár';
    if(ctaSub) ctaSub.textContent = 'Tvar, veľkosť, kameň, nápis a AI asistent v pár krokoch.';
    if(teaserTitle) teaserTitle.textContent = 'Kamenárstvo Jantár online';
    if(teaserText) teaserText.innerHTML = 'Vyberte <b>tvar, materiál a nápis</b> jednoducho.';
    if(window.MC && MC.s && MC.s.sk){
      MC.s.sk.hdrTitle = 'Kamenárstvo Jantár';
      MC.s.sk.welcome = 'Dobrý deň. Som <b>AI asistent Kamenárstva Jantár</b>. Pomôžem vám vybrať tvar, veľkosť, kameň a nápis pre dôstojný pomník.';
      MC.s.sk.welcomeChips = ['Konfigurátor','Vhodný kameň','Veľkosť hrobu','Nápis'];
      MC.s.sk.ctaTitle = 'Konfigurátor pomníka';
      MC.s.sk.ctaSub = 'Tvar, veľkosť, kameň, nápis a AI asistent v pár krokoch.';
    }
    refreshMonumentWelcome();
    var chips = document.getElementById('chips');
    if(chips){
      chips.innerHTML = '<button class="mc-chip mc-chip-calc" onclick="openCalc()">Konfigurátor</button>' +
        '<button class="mc-chip" onclick="send(\'Aký kameň je najvhodnejší?\')">Vhodný kameň</button>' +
        '<button class="mc-chip" onclick="send(\'Ako vybrať veľkosť hrobu?\')">Veľkosť hrobu</button>' +
        '<button class="mc-chip" onclick="send(\'Ako pripraviť nápis?\')">Nápis</button>';
    }
    if(location.search.indexOf('v=') >= 0 || location.search.indexOf('preview') >= 0){
      if(!MC.open && typeof toggleChat === 'function') toggleChat();
      setTimeout(openCalc, 250);
    }
    updateModeTabs();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMonumentWidget);
  else initMonumentWidget();
})();
