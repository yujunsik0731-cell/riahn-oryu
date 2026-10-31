// RIAHN 헤어 오류점 - 공통 스크립트

// 모바일 햄버거 메뉴
(function(){
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('mobileNav');
  if(!btn || !nav) return;
  btn.addEventListener('click', function(){
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  });
  nav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
    });
  });
})();

// 히어로 배경 영상: 화면에 보일 때만 재생 (모바일 데이터 절약)
(function(){
  var video = document.getElementById('heroVideo');
  if(!video) return;
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          video.play().catch(function(){});
        }else{
          video.pause();
        }
      });
    }, {threshold: 0.15});
    io.observe(video);
  }else{
    video.play().catch(function(){});
  }
})();

// 시술 사진 · 디자이너 포트폴리오 크게 보기 (2026-10-31)
// 원주 사이트(js/common.js 포트폴리오)와 같은 동작·디자인. 사진마다 담당 디자이너가 다를 수 있어
// 디자이너 정보는 블록(.pf)이 아니라 사진(.pf-item)의 data-* 에서 읽는다.
// PC: 큰 사진 + 오른쪽 정보 · ← → · ESC · 바깥 클릭 / 모바일: 전체 화면 · 좌우 스와이프 · 뒤로 가기 = 닫기
// JS 가 꺼져 있으면 썸네일 링크가 큰 사진 파일로 이동한다.
(function(){
  var blocks = document.querySelectorAll('.pf');
  if(!blocks.length) return;
  var m = document.createElement('div');
  m.className = 'pf-modal'; m.hidden = true;
  m.innerHTML = '<div class="pf-backdrop"></div>' +
    '<div class="pf-dialog" role="dialog" aria-modal="true" aria-labelledby="pfTitle">' +
      '<div class="pf-top"><p class="pf-top-title" id="pfTitle"><span class="pf-top-who"></span><span class="pf-count"></span></p>' +
        '<button type="button" class="pf-close">✕</button></div>' +
      '<div class="pf-stage"><button type="button" class="pf-nav pf-prev">‹</button><img class="pf-big" alt="">' +
        '<button type="button" class="pf-nav pf-next">›</button></div>' +
      '<div class="pf-info"><p class="pf-eyebrow"></p><h3 class="pf-style-big"></h3><p class="pf-sub"></p>' +
        '<div class="pf-des"><img class="pf-des-photo" alt="" width="64" height="80"><div><p class="pf-des-name"><b></b><small></small></p>' +
          '<p class="pf-des-field"></p></div></div>' +
        '<p class="pf-others-h"></p><div class="pf-others"></div>' +
        '<div class="pf-actions"><a class="btn btn-wood pf-book" target="_blank" rel="noopener"></a><a class="btn btn-outline pf-about"></a></div>' +
      '</div></div>';
  document.body.appendChild(m);
  function q(s){ return m.querySelector(s); }
  var big = q('.pf-big'), others = q('.pf-others'), items = [], idx = 0, opener = null, pushed = false;

  function show(i){
    idx = (i + items.length) % items.length;
    var a = items[idx], g = function(k){ return a.getAttribute('data-' + k) || ''; };
    big.removeAttribute('src');
    big.width = +g('w'); big.height = +g('h');
    big.alt = g('alt');
    big.src = g('full');                                          // 큰 사진은 열 때 불러온다
    q('.pf-style-big').textContent = g('style');
    var sub = q('.pf-sub'), price = g('price');
    sub.textContent = '';
    var b = document.createElement('b'); b.textContent = g('menu'); sub.appendChild(b);
    if(price) sub.appendChild(document.createTextNode(' · ' + price));
    var ph = q('.pf-des-photo'); ph.src = g('des-photo'); ph.alt = g('des-alt');
    q('.pf-des-name b').textContent = g('des');
    q('.pf-des-name small').textContent = g('des-title');
    q('.pf-des-field').textContent = g('des-field');
    q('.pf-book').href = g('book');
    q('.pf-about').href = g('about');
    q('.pf-count').textContent = (idx + 1) + ' / ' + items.length;
    others.querySelectorAll('button').forEach(function(x, k){ x.setAttribute('aria-current', k === idx ? 'true' : 'false'); });
    var nx = items[(idx + 1) % items.length];                     // 다음 사진 미리 받기
    (new Image()).src = nx.getAttribute('data-full');
  }
  function open(bl, i, from){
    opener = from;
    items = Array.prototype.slice.call(bl.querySelectorAll('.pf-item'));
    if(!items.length) return;
    var d = function(k){ return bl.getAttribute('data-' + k) || ''; };
    q('.pf-top-who').textContent = d('l-dialog');
    q('.pf-close').setAttribute('aria-label', d('l-close'));
    q('.pf-prev').setAttribute('aria-label', d('l-prev'));
    q('.pf-next').setAttribute('aria-label', d('l-next'));
    q('.pf-eyebrow').textContent = d('l-pf') || 'PORTFOLIO';
    q('.pf-others-h').textContent = d('l-others');
    q('.pf-book').textContent = d('l-book');
    q('.pf-about').textContent = d('l-about');
    others.innerHTML = '';
    items.forEach(function(a, k){
      var x = document.createElement('button'); x.type = 'button';
      x.setAttribute('aria-label', a.getAttribute('data-style') || '');
      var im = a.querySelector('img').cloneNode(); im.alt = ''; im.removeAttribute('width'); im.removeAttribute('height');
      x.appendChild(im);
      x.addEventListener('click', function(){ show(k); });
      others.appendChild(x);
    });
    show(i);
    m.hidden = false;
    document.documentElement.classList.add('pf-open');            // 뒤 페이지 스크롤 잠금
    if(!pushed){ history.pushState({pfModal: true}, ''); pushed = true; }   // 뒤로 가기 = 창 닫기
    q('.pf-close').focus();
  }
  var refocus = null;
  function back(){ if(opener) opener.focus({preventScroll: true}); }
  function close(fromPop){
    if(m.hidden) return;
    m.hidden = true;
    document.documentElement.classList.remove('pf-open');
    if(pushed && !fromPop){                                       // 추가한 기록을 되돌린 뒤 연 썸네일로 포커스를 돌려준다
      pushed = false; refocus = true; history.back();
      setTimeout(function(){ if(refocus){ refocus = null; back(); } }, 400);
    } else { pushed = false; back(); }
  }
  blocks.forEach(function(bl){
    bl.querySelectorAll('[data-index]').forEach(function(a){
      a.addEventListener('click', function(e){ e.preventDefault(); open(bl, +a.getAttribute('data-index'), a); });
    });
  });
  q('.pf-close').addEventListener('click', function(){ close(false); });
  q('.pf-backdrop').addEventListener('click', function(){ close(false); });
  q('.pf-prev').addEventListener('click', function(){ show(idx - 1); });
  q('.pf-next').addEventListener('click', function(){ show(idx + 1); });
  q('.pf-about').addEventListener('click', function(e){          // 디자이너 소개로 이동하며 창을 닫는다
    var h = this.getAttribute('href');
    if(!h) return;
    e.preventDefault();
    m.hidden = true; document.documentElement.classList.remove('pf-open');
    if(pushed){ pushed = false; history.back(); setTimeout(function(){ location.href = h; }, 60); }
    else { location.href = h; }
  });
  window.addEventListener('popstate', function(){
    if(!m.hidden){ pushed = false; close(true); }                 // 뒤로 가기 버튼 = 창 닫기
    else if(refocus){ refocus = null; back(); }
  });
  document.addEventListener('keydown', function(e){
    if(m.hidden) return;
    if(e.key === 'Escape'){ e.preventDefault(); close(false); }
    else if(e.key === 'ArrowLeft'){ show(idx - 1); }
    else if(e.key === 'ArrowRight'){ show(idx + 1); }
    else if(e.key === 'Tab'){                                     // 포커스를 창 안에 가둔다
      var f = Array.prototype.filter.call(m.querySelectorAll('button, a[href]'), function(x){ return x.offsetParent !== null; });
      if(!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      else if(!m.contains(document.activeElement)){ e.preventDefault(); first.focus(); }
    }
  });
  var sx = 0, sy = 0, stage = q('.pf-stage');                     // 모바일 좌우 스와이프
  stage.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, {passive: true});
  stage.addEventListener('touchend', function(e){
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1));
  });
})();
