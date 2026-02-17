(function () {
  const grid = document.getElementById('grid');
  const cols = 7;

  // 이미지(10x8 타일 그리드)에서 추출한 6색 팔레트
  const palette = [
    '#E63946', '#2563EB', '#22C55E', '#FACC15', '#000000', '#F5F5F5'
  ];
  // 나올 수 있는 (배경, 글자색) 조합 전부 (30가지, 같은 색 제외)
  // #E63946 → #2563EB, #22C55E, #FACC15, #000000, #F5F5F5
  // #2563EB → #E63946, #22C55E, #FACC15, #000000, #F5F5F5
  // #22C55E → #E63946, #2563EB, #FACC15, #000000, #F5F5F5
  // #FACC15 → #E63946, #2563EB, #22C55E, #000000, #F5F5F5
  // #000000 → #E63946, #2563EB, #22C55E, #FACC15, #F5F5F5
  // #F5F5F5 → #E63946, #2563EB, #22C55E, #FACC15, #000000
  const textColorOptionsByBg = {
    '#E63946': ['#2563EB', '#22C55E', '#FACC15', '#000000', '#F5F5F5'],
    '#2563EB': ['#E63946', '#22C55E', '#FACC15', '#000000', '#F5F5F5'],
    '#22C55E': ['#E63946', '#2563EB', '#FACC15', '#000000', '#F5F5F5'],
    '#FACC15': ['#E63946', '#2563EB', '#22C55E', '#000000', '#F5F5F5'],
    '#000000': ['#E63946', '#2563EB', '#22C55E', '#FACC15', '#F5F5F5'],
    '#F5F5F5': ['#E63946', '#2563EB', '#22C55E', '#FACC15', '#000000']
  };

  function getTextColor(bgHex) {
    const options = textColorOptionsByBg[bgHex];
    if (!options || options.length === 0) return '#000';
    return options[Math.floor(Math.random() * options.length)];
  }

  const svgHanguelPath = 'M335.72,62.19c14.34,2.39,26.28,11.95,26.28,28.67v105.13h364.36v-111.1c0-15.53-13.14-22.7-13.14-22.7l-76.46-43.01c-10.75-5.97-5.97-20.31,4.78-19.11l158.88,20.31c14.34,2.39,26.28,11.95,26.28,28.67v397.81l-100.35,29.87v-66.9h-131.41v186.36h189.94c16.72,0,29.87-4.78,40.62-11.95l63.32-44.2c13.14-10.75,29.86-11.95,43.01-7.17l120.65,38.23c13.14,3.58,25.09,13.14,25.09,29.87,0,20.31-16.72,31.06-34.65,29.87l-232.95-17.92h-483.82c-35.84,0-57.34,14.34-57.34,14.34l-47.78,32.25c-27.48,17.92-59.73,3.58-59.73,3.58l-146.94-60.93c-7.17-2.39-11.95-7.17-11.95-15.53s8.36-14.34,16.72-13.14l277.15,22.7h197.11v-186.36h-131.41v38.23l-100.35,29.87V126.7c0-15.53-13.14-22.7-13.14-22.7l-76.46-43.01c-10.75-5.97-5.97-20.31,4.78-19.11l158.88,20.31ZM864.93,756.26l-11.95,25.09v268.79l-100.35,29.87v-320.16h-357.19c-10.75,0-19.11,5.97-19.11,5.97l-44.2,28.67c-9.56,5.97-26.28,10.75-40.62,3.58l-101.54-52.56c-10.75-5.97-5.97-20.31,5.97-19.11l188.75,16.72h334.49c11.95-1.19,22.7-5.97,28.67-14.34,5.97-8.36,16.72-15.53,31.06-11.95l77.65,19.11c10.75,2.39,13.14,10.75,8.36,20.31ZM362,393.1h364.36v-180.39h-364.36v180.39Z';
  const svgHanjaPath = 'M412.45,519.11c57.18,25.29,74.77,32.99,128.65,61.58h348.56c21.99-25.29,29.69-32.99,52.78-58.28,39.58,25.29,51.68,32.99,86.87,58.28,12.1,7.7,16.49,14.29,16.49,20.89,0,11-7.7,17.59-31.89,32.99q0,157.24,4.4,392.54c0,12.1-3.3,17.59-14.29,20.89-9.9,4.4-45.08,7.7-75.87,7.7-23.09,0-29.69-3.3-30.79-17.59v-50.58h-366.16v39.58c-1.1,15.39-5.5,20.89-17.59,24.19-7.7,2.2-48.38,5.5-69.27,5.5-24.19,0-31.89-5.5-31.89-21.99v-2.2c4.4-131.95,4.4-156.14,4.4-294.68v-64.88c-8.8,28.59-36.29,52.78-58.28,52.78-15.39,0-20.89-7.7-26.39-42.88-12.1-75.87-30.79-125.35-51.68-144.04v238.61c0,39.58,1.1,123.15,2.2,252.9-2.2,20.89-17.59,26.39-75.87,26.39-36.29,0-42.88-3.3-43.98-21.99,3.3-146.24,4.4-227.61,4.4-244.1v-169.33c-29.69,29.69-64.87,57.18-138.55,105.56l-9.9-12.09c60.48-62.68,102.26-117.65,151.74-200.12,52.78-86.87,80.27-146.24,107.76-229.81H115.57c-31.89,0-47.28,1.1-72.57,5.5l-6.6-37.39c30.79,6.6,47.28,8.8,79.17,8.8h48.38v-130.85c0-31.89-1.1-48.38-6.6-84.67,130.85,12.1,137.45,13.19,149.54,16.49,8.8,3.3,14.29,7.7,14.29,13.19,0,11-14.29,19.79-42.88,29.69v156.14h24.19c20.89-25.29,27.49-32.99,49.48-57.18,34.09,27.49,43.98,35.19,75.87,63.77,8.8,8.8,12.1,14.29,12.1,18.69,0,7.7-12.1,15.39-41.78,24.19-48.38,95.66-65.97,125.35-117.65,190.22v14.29c68.17,28.59,119.85,69.27,135.25,105.56l-3.3-102.26ZM401.46,102.37c29.69,7.7,54.98,9.9,93.46,9.9h362.86l81.37-89.06c49.48,39.58,65.97,52.78,116.55,94.56,3.3,5.5,5.5,7.7,5.5,11s-4.4,6.6-12.1,6.6H494.92c-39.58,0-58.28,1.1-85.77,5.5l-7.7-38.48ZM579.58,494.92c-2.2,20.89-15.39,25.29-76.97,25.29-31.89,0-38.48-3.3-39.58-19.79q3.3-138.54,3.3-191.32c0-65.97-1.1-86.87-5.5-127.55,58.28,25.29,74.77,32.99,129.75,62.68h247.4c24.19-27.49,32.99-35.19,59.38-62.68,38.48,27.49,50.58,35.19,85.77,62.68,8.8,7.7,13.19,13.19,13.19,17.59,0,8.8-5.5,13.19-35.19,31.89v34.09c0,41.78,1.1,102.26,3.3,163.83,0,9.9-2.2,14.29-7.7,18.69-9.9,5.5-37.38,9.9-72.57,9.9-30.79,0-36.29-3.3-37.38-19.79v-36.29h-267.19v30.79ZM653.25,761.01v-157.24h-122.05v157.24h122.05ZM653.25,784.1h-122.05v180.33h122.05v-180.33ZM579.58,441.04h267.19v-173.73h-267.19v173.73ZM897.36,603.77h-130.85v157.24h130.85v-157.24ZM766.51,784.1v180.33h130.85v-180.33h-130.85Z';

  function createCharEl(pathD, textColor) {
    const wrap = document.createElement('div');
    wrap.className = 'card-char';
    wrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080"><path fill="' + textColor + '" d="' + pathD + '"/></svg>';
    return wrap;
  }

  const flipDirections = [
    'rotateY(180deg)',
    'rotateY(-180deg)',
    'rotateX(180deg)',
    'rotateX(-180deg)'
  ];

  const mobileBreakpoint = 768;
  const mobileCols = 5;

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
      front.appendChild(createCharEl(isHanguel ? svgHanguelPath : svgHanjaPath, getTextColor(frontColors[i])));

      const back = document.createElement('div');
      back.className = 'card-face card-back';
      back.style.backgroundColor = backColors[i];
      back.appendChild(createCharEl(isHanguel ? svgHanjaPath : svgHanguelPath, getTextColor(backColors[i])));

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
    flipAll();
    scheduleAutoFlip();
  });

  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });
  document.addEventListener('dragstart', function (e) {
    e.preventDefault();
  });

  document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
  });
  document.addEventListener('touchstart', function (e) {
    if (e.touches.length > 1) e.preventDefault();
    if (idleTimer) clearTimeout(idleTimer);
    scheduleAutoFlip();
  }, { passive: false });
  document.addEventListener('dblclick', function (e) {
    e.preventDefault();
  });
})();
