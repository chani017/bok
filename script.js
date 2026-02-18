(function () {
  const grid = document.getElementById('grid');
  const cols = 7;

  // 이미지에서 추출한 고채도 생생한 색상 팔레트 24색
  const palette = [
    '#03c57f', '#fe3700', '#fec502', '#0078fd', '#2e2c2d', '#eeeeee'
  ];

  function getTextColor() {
    return '#000000';
  }

  const SVG_HANGUEL = 'SVG/bok_hanguel.svg';
  const SVG_HANJA = 'SVG/bok_hanja.svg';

  function createCharEl(svgSrc) {
    const wrap = document.createElement('div');
    wrap.className = 'card-char';
    const img = document.createElement('img');
    img.src = svgSrc;
    img.alt = '';
    wrap.appendChild(img);
    return wrap;
  }

  const flipDirections = [
    'rotateY(180deg)',
    'rotateY(-180deg)',
    'rotateX(180deg)',
    'rotateX(-180deg)'
  ];

  const mobileBreakpoint = 768;
  const mobileCols = 3;

  function getCols() {
    return window.innerWidth <= mobileBreakpoint ? mobileCols : cols;
  }

  function countCards() {
    const c = getCols();
    const cardSize = window.innerWidth / c;
    const rows = Math.ceil(window.innerHeight / cardSize);
    return c * Math.max(rows, 1);
  }

  function pickColor(used) {
    const allowed = palette.filter(function (c) { return !used.has(c); });
    return allowed.length ? allowed[Math.floor(Math.random() * allowed.length)] : palette[0];
  }

  function buildColors(total) {
    const c = getCols();
    const colors = [];
    for (let i = 0; i < total; i++) {
      const used = new Set();
      if (i % c !== 0) used.add(colors[i - 1]);
      if (i >= c) used.add(colors[i - c]);
      colors[i] = pickColor(used);
    }
    return colors;
  }

  function buildBackColors(total, frontColors) {
    const c = getCols();
    const backColors = [];
    for (let i = 0; i < total; i++) {
      const used = new Set([frontColors[i]]);
      if (i % c !== 0) used.add(backColors[i - 1]);
      if (i >= c) used.add(backColors[i - c]);
      backColors[i] = pickColor(used);
    }
    return backColors;
  }

  function randomDirection() {
    return flipDirections[Math.floor(Math.random() * flipDirections.length)];
  }

  function updateCardColors() {
    const cards = grid.querySelectorAll('.card');
    const total = cards.length;
    const frontColors = buildColors(total);
    const backColors = buildBackColors(total, frontColors);
    for (let i = 0; i < total; i++) {
      const card = cards[i];
      const front = card.querySelector('.card-front');
      const back = card.querySelector('.card-back');
      front.style.backgroundColor = frontColors[i];
      back.style.backgroundColor = backColors[i];
      const frontPath = front.querySelector('.card-char path');
      const backPath = back.querySelector('.card-char path');
      if (frontPath) frontPath.setAttribute('fill', getTextColor(frontColors[i]));
      if (backPath) backPath.setAttribute('fill', getTextColor(backColors[i]));
    }
  }

  const colorDelayMs = 50;

  let viewMode = 'grid';
  let overlayViewEl = null;
  let overlayStage = null;
  let flowAnimationId = null;

  function getCardSize() {
    return window.innerWidth / getCols();
  }

  function onOverlayTap(e) {
    if (viewMode === 'circle') { enterFlowSingleMode(); return; }
    if (viewMode === 'flowSingle') { enterFlowMode(); return; }
    if (viewMode === 'flow') {
      e.stopPropagation();
      e.preventDefault();
      exitToGrid();
      scheduleAutoFlip();
      return;
    }
  }

  function enterCircleMode() {
    const cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));
    if (cards.length === 0) return;

    const cardRects = cards.map(function (card) { return card.getBoundingClientRect(); });
    const c = getCols();
    const cardSize = getCardSize();
    const N = cards.length;
    const vmin = Math.min(window.innerWidth, window.innerHeight) / 100;
    const ringCenter = 60 * vmin;
    const radius = 38 * vmin;

    overlayViewEl = document.createElement('div');
    overlayViewEl.className = 'overlay-view';
    overlayStage = document.createElement('div');
    overlayStage.className = 'circle-ring';
    overlayViewEl.appendChild(overlayStage);
    document.body.appendChild(overlayViewEl);

    const ringRect = overlayStage.getBoundingClientRect();
    document.body.classList.add('overlay-mode');

    for (let i = 0; i < N; i++) {
      const r = cardRects[i];
      const card = cards[i];
      card.style.position = 'absolute';
      card.style.width = r.width + 'px';
      card.style.height = r.height + 'px';
      card.style.left = (r.left - ringRect.left) + 'px';
      card.style.top = (r.top - ringRect.top) + 'px';
      card.style.transform = 'rotate(0deg)';
      card.classList.remove('flow-strand-1', 'flow-strand-2', 'flow-strand-3');
      overlayStage.appendChild(card);
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        for (let i = 0; i < N; i++) {
          const angle = (2 * Math.PI * i) / N - Math.PI / 2;
          const x = ringCenter + radius * Math.cos(angle) - cardSize / 2;
          const y = ringCenter + radius * Math.sin(angle) - cardSize / 2;
          const card = cards[i];
          card.style.left = x + 'px';
          card.style.top = y + 'px';
          card.style.width = cardSize + 'px';
          card.style.height = cardSize + 'px';
          card.style.transform = 'rotate(' + (angle * 180 / Math.PI + 90) + 'deg)';
        }
      });
    });

    overlayViewEl.addEventListener('click', onOverlayTap);
    viewMode = 'circle';
  }

  function getRotationFromTransform(transform) {
    if (!transform || transform === 'none') return 0;
    const m = transform.match(/matrix\(([^)]+)\)/);
    if (!m) return 0;
    const parts = m[1].split(',').map(Number);
    if (parts.length >= 4) return Math.atan2(parts[1], parts[0]);
    return 0;
  }

  function enterFlowSingleMode() {
    if (flowAnimationId != null) {
      cancelAnimationFrame(flowAnimationId);
      flowAnimationId = null;
    }
    const cards = Array.prototype.slice.call(overlayStage.querySelectorAll('.card'));
    const N = cards.length;
    const cardSize = getCardSize();
    const W = window.innerWidth;
    const H = window.innerHeight;
    const pad = cardSize * 0.5;

    // 클릭 직전 화면과 동일: 카드 실제 위치 + overlay 기준(클릭 전 고정)으로 전환 시작
    const overlayRect = overlayViewEl.getBoundingClientRect();
    const cardRects = cards.map(function (c) { return c.getBoundingClientRect(); });

    overlayStage.className = 'flow-single-stage flow-transitioning';
    overlayStage.style.animation = 'none';

    cards.forEach(function (card, i) {
      const r = cardRects[i];
      card.style.left = (r.left - overlayRect.left) + 'px';
      card.style.top = (r.top - overlayRect.top) + 'px';
      card.style.width = cardSize + 'px';
      card.style.height = cardSize + 'px';
      card.style.transform = 'rotate(0deg)';
      card.classList.remove('flow-strand-1', 'flow-strand-2', 'flow-strand-3');
    });

    let curveWidth = W - 2 * pad;
    let amplitude = H * 0.18;
    let centerY = H / 2;

    function curveAt(t) {
      let x = pad + t * curveWidth - cardSize / 2;
      let y = centerY + amplitude * Math.sin(t * Math.PI * 2) - cardSize / 2;
      return { x: x, y: y };
    }

    let flowPhase = 0;
    let flowSpeed = window.innerWidth > mobileBreakpoint ? 0.002 / 3 : 0.002;
    function tick() {
      flowPhase += flowSpeed;
      if (flowPhase >= 1) flowPhase -= 1;
      for (let i = 0; i < N; i++) {
        let t = ((i + 0.5) / N + flowPhase) % 1;
        if (t < 0) t += 1;
        let p = curveAt(t);
        cards[i].style.left = p.x + 'px';
        cards[i].style.top = p.y + 'px';
        cards[i].style.width = cardSize + 'px';
        cards[i].style.height = cardSize + 'px';
      }
      flowAnimationId = requestAnimationFrame(tick);
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        for (let i = 0; i < N; i++) {
          let t = (i + 0.5) / N;
          let p = curveAt(t);
          cards[i].style.left = p.x + 'px';
          cards[i].style.top = p.y + 'px';
          cards[i].style.width = cardSize + 'px';
          cards[i].style.height = cardSize + 'px';
        }
        setTimeout(function () {
          if (overlayStage && viewMode === 'flowSingle') {
            overlayStage.classList.remove('flow-transitioning');
            flowAnimationId = requestAnimationFrame(tick);
          }
        }, 1100);
      });
    });

    viewMode = 'flowSingle';
  }

  function enterFlowMode() {
    if (flowAnimationId != null) {
      cancelAnimationFrame(flowAnimationId);
      flowAnimationId = null;
    }
    const cards = Array.prototype.slice.call(overlayStage.querySelectorAll('.card'));
    const N = cards.length;
    const cardRects = cards.map(function (c) { return c.getBoundingClientRect(); });
    const cardSize = getCardSize();
    const W = window.innerWidth;
    const H = window.innerHeight;
    const pad = cardSize * 0.5;

    overlayStage.className = 'flow-stage flow-transitioning';
    overlayStage.style.animation = 'none';
    const stageRect = overlayStage.getBoundingClientRect();

    cards.forEach(function (card, i) {
      const r = cardRects[i];
      card.style.left = (r.left - stageRect.left) + 'px';
      card.style.top = (r.top - stageRect.top) + 'px';
      card.style.width = r.width + 'px';
      card.style.height = r.height + 'px';
      card.style.transform = 'rotate(0deg)';
      card.classList.remove('flow-strand-1', 'flow-strand-2', 'flow-strand-3');
    });

    // 3가닥: 사인 파형(~) 유지, 화면 끝까지, 더 멀리 퍼지도록
    const cy = H / 2;
    const margin = Math.max(W, H) * 0.14;
    const edge = Math.max(pad, cardSize);
    const waveAmp = Math.min(W, H) * 0.2;
    const waveFreq = 2.5;

    let strandStarts = [
      { x: edge, y: cy - margin },
      { x: W - edge, y: cy },
      { x: edge, y: cy + margin }
    ];
    let strandEnds = [
      { x: W - edge, y: edge },
      { x: edge, y: H - edge },
      { x: W - edge, y: H - edge }
    ];

    function pathAt(strand, t) {
      let s = strandStarts[strand];
      let e = strandEnds[strand];
      let dx = e.x - s.x;
      let dy = e.y - s.y;
      let len = Math.sqrt(dx * dx + dy * dy) || 1;
      let centerX = s.x + t * dx;
      let centerY = s.y + t * dy;
      let perpX = -dy / len;
      let perpY = dx / len;
      let wave = Math.sin(t * Math.PI * 2 * waveFreq) * waveAmp;
      centerX += perpX * wave;
      centerY += perpY * wave;
      return {
        x: centerX - cardSize / 2,
        y: centerY - cardSize / 2
      };
    }

    let n1 = Math.ceil(N / 3);
    let n2 = Math.ceil(N / 3);
    let n3 = N - n1 - n2;
    let strandCounts = [n1, n2, n3];
    let strandByIndex = [];
    let tByIndex = [];
    for (let s = 0; s < 3; s++) {
      for (let k = 0; k < strandCounts[s]; k++) {
        strandByIndex.push(s);
        tByIndex.push((k + 0.5) / strandCounts[s]);
      }
    }

    let flowPhase = 0;
    let flowSpeed = window.innerWidth > mobileBreakpoint ? 0.001 : 0.001;
    function tick() {
      flowPhase += flowSpeed;
      if (flowPhase >= 1) flowPhase -= 1;
      for (let i = 0; i < N; i++) {
        let s = strandByIndex[i];
        let t = (tByIndex[i] + flowPhase) % 1;
        if (t < 0) t += 1;
        let p = pathAt(s, t);
        cards[i].style.left = p.x + 'px';
        cards[i].style.top = p.y + 'px';
        cards[i].style.width = cardSize + 'px';
        cards[i].style.height = cardSize + 'px';
      }
      flowAnimationId = requestAnimationFrame(tick);
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        for (let i = 0; i < N; i++) {
          let s = strandByIndex[i];
          let t = tByIndex[i];
          let p = pathAt(s, t);
          cards[i].style.left = p.x + 'px';
          cards[i].style.top = p.y + 'px';
          cards[i].style.width = cardSize + 'px';
          cards[i].style.height = cardSize + 'px';
        }
        setTimeout(function () {
          if (overlayStage && viewMode === 'flow') {
            overlayStage.classList.remove('flow-transitioning');
            flowAnimationId = requestAnimationFrame(tick);
          }
        }, 1100);
      });
    });

    viewMode = 'flow';
  }

  function exitToGrid() {
    if (!overlayViewEl || !overlayViewEl.parentNode) return;
    if (flowAnimationId != null) {
      cancelAnimationFrame(flowAnimationId);
      flowAnimationId = null;
    }
    const cards = Array.prototype.slice.call(overlayStage.querySelectorAll('.card'));
    const N = cards.length;
    const c = getCols();
    const cardRects = cards.map(function (card) { return card.getBoundingClientRect(); });

    document.body.classList.remove('overlay-mode');
    const gridRect = grid.getBoundingClientRect();
    const cellSize = getCardSize();
    const cellWidth = cellSize;
    const cellHeight = cellSize;

    cards.forEach(function (card, i) {
      const r = cardRects[i];
      card.style.position = 'absolute';
      card.style.left = (r.left - gridRect.left) + 'px';
      card.style.top = (r.top - gridRect.top) + 'px';
      card.style.width = r.width + 'px';
      card.style.height = r.height + 'px';
      card.style.transform = '';
      card.classList.remove('flow-strand-1', 'flow-strand-2', 'flow-strand-3');
      card.classList.add('card-to-grid');
      grid.appendChild(card);
    });

    overlayViewEl.removeEventListener('click', onOverlayTap);
    overlayViewEl.parentNode.removeChild(overlayViewEl);
    overlayViewEl = null;
    overlayStage = null;
    viewMode = 'grid';

    // PC에서 전환 애니메이션이 재생되도록: 한 프레임 그린 뒤 목표 위치 적용
    requestAnimationFrame(function () {
      void grid.offsetHeight;
      requestAnimationFrame(function () {
        cards.forEach(function (card, i) {
          const col = i % c;
          const row = Math.floor(i / c);
          card.style.left = (col * cellWidth) + 'px';
          card.style.top = (row * cellHeight) + 'px';
          card.style.width = cellWidth + 'px';
          card.style.height = cellHeight + 'px';
        });

        let done = 0;
        function onEnd() {
          done++;
          if (done < N) return;
          cards.forEach(function (card) {
            card.style.position = '';
            card.style.left = '';
            card.style.top = '';
            card.style.width = '';
            card.style.height = '';
            card.classList.remove('card-to-grid');
          });
        }
        cards.forEach(function (card) {
          card.addEventListener('transitionend', onEnd, { once: true });
        });
      });
    });
  }

  function flipAll() {
    const cards = grid.querySelectorAll('.card');
    for (let i = 0; i < cards.length; i++) {
      cards[i].style.setProperty('--flip-transform', randomDirection());
      cards[i].classList.toggle('flipped');
    }
    setTimeout(updateCardColors, colorDelayMs);
  }

  function flipSome(count) {
    const cards = grid.querySelectorAll('.card');
    if (cards.length === 0) return;
    const n = Math.min(count, cards.length);
    const indices = [];
    while (indices.length < n) {
      const i = Math.floor(Math.random() * cards.length);
      if (indices.indexOf(i) === -1) indices.push(i);
    }
    for (let j = 0; j < indices.length; j++) {
      const card = cards[indices[j]];
      card.style.setProperty('--flip-transform', randomDirection());
      card.classList.toggle('flipped');
    }
  }

  const idleDelayMs = 2000;
  const autoFlipCountMin = 6;
  const autoFlipCountMax = 8;
  let idleTimer = null;

  function scheduleAutoFlip() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      if (viewMode !== 'grid') { scheduleAutoFlip(); return; }
      const count = autoFlipCountMin + Math.floor(Math.random() * (autoFlipCountMax - autoFlipCountMin + 1));
      flipSome(count);
      scheduleAutoFlip();
    }, idleDelayMs);
  }

  function render() {
    grid.innerHTML = '';
    const total = countCards();
    const frontColors = buildColors(total);
    const backColors = buildBackColors(total, frontColors);

    for (let i = 0; i < total; i++) {
      const isHanguel = i % 2 === 0;

      const card = document.createElement('div');
      card.className = 'card';

      const inner = document.createElement('div');
      inner.className = 'card-inner';

      const front = document.createElement('div');
      front.className = 'card-face card-front';
      front.style.backgroundColor = frontColors[i];
      front.appendChild(createCharEl(isHanguel ? SVG_HANGUEL : SVG_HANJA));

      const back = document.createElement('div');
      back.className = 'card-face card-back';
      back.style.backgroundColor = backColors[i];
      back.appendChild(createCharEl(isHanguel ? SVG_HANJA : SVG_HANGUEL));

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);
      grid.appendChild(card);
    }
  }

  render();
  window.addEventListener('resize', render);

  scheduleAutoFlip();

  document.body.addEventListener('click', function () {
    if (idleTimer) clearTimeout(idleTimer);
    if (viewMode === 'grid') {
      enterCircleMode();
    }
    scheduleAutoFlip();
  });

  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });
  document.addEventListener('dragstart', function (e) {
    e.preventDefault();
  });

  document.addEventListener('touchstart', function () {
    if (idleTimer) clearTimeout(idleTimer);
    scheduleAutoFlip();
  }, { passive: true });
})();
