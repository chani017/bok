(function () {
  const grid = document.getElementById('grid');
  const cols = 7;

  const palette = [
    '#6B7B8C', '#0D9488', '#7DD3FC', '#FACC15', '#EA580C', '#DC2626',
    '#A78BFA', '#C2410C', '#84CC16', '#FDBA74', '#2563EB', '#D6D3C4',
    '#C026D3', '#0F766E', '#A8A29E', '#06B6D4', '#65A30D', '#BEF264'
  ];

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
    const backColors = [];
    for (let i = 0; i < total; i++) {
      const used = new Set([frontColors[i]]);
      if (i % cols !== 0) used.add(backColors[i - 1]);
      if (i >= cols) used.add(backColors[i - cols]);
      backColors[i] = pickColor(used);
    }
    return backColors;
  }

  function randomDirection() {
    return flipDirections[Math.floor(Math.random() * flipDirections.length)];
  }

  function flipAll() {
    const cards = grid.querySelectorAll('.card');
    for (let i = 0; i < cards.length; i++) {
      cards[i].style.setProperty('--flip-transform', randomDirection());
      cards[i].classList.toggle('flipped');
    }
  }

  function render() {
    grid.innerHTML = '';
    const total = countCards();
    const frontColors = buildColors(total);
    const backColors = buildBackColors(total, frontColors);

    for (let i = 0; i < total; i++) {
      const isHanguel = i % 2 === 0;
      const frontSrc = isHanguel ? 'SVG/bok_hanguel.svg' : 'SVG/bok_hanja.svg';
      const backSrc = isHanguel ? 'SVG/bok_hanja.svg' : 'SVG/bok_hanguel.svg';

      const card = document.createElement('div');
      card.className = 'card';

      const inner = document.createElement('div');
      inner.className = 'card-inner';

      const front = document.createElement('div');
      front.className = 'card-face card-front';
      front.style.backgroundColor = frontColors[i];
      const frontImg = document.createElement('img');
      frontImg.src = frontSrc;
      frontImg.alt = isHanguel ? '복' : '福';
      front.appendChild(frontImg);

      const back = document.createElement('div');
      back.className = 'card-face card-back';
      back.style.backgroundColor = backColors[i];
      const backImg = document.createElement('img');
      backImg.src = backSrc;
      backImg.alt = isHanguel ? '福' : '복';
      back.appendChild(backImg);

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);
      grid.appendChild(card);
    }
  }

  render();
  window.addEventListener('resize', render);

  document.body.addEventListener('click', flipAll);

  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });
  document.addEventListener('dragstart', function (e) {
    e.preventDefault();
  });
})();
