/* ===== Scrum Mastery — animated Scrum background (terms rain) ===== */
(function () {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-rain';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let w, h, columns, drops, raf;
  const chars = ('Sprint Planning Daily Review Retrospective Backlog Increment Velocity Scrum PO SM DoD Goal Agile Story Points Refinement Inspect Adapt Transparency Empiricism {}[]()<>+-/;:=#★▲●○').split('');
  const words = ['Sprint', 'Planning', 'Daily', 'Review', 'Retro', 'Backlog', 'Increment', 'Velocity', 'Scrum', 'DoD', 'Story', 'Agile', 'Inspect', 'Adapt'];
  const palette = [
    'rgba(63,185,80,',   // green
    'rgba(88,166,255,',   // blue
    'rgba(188,140,255,',  // purple
    'rgba(247,129,102,',  // accent
    'rgba(227,179,65,'    // yellow
  ];
  const FS = 18;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    columns = Math.floor(w / FS);
    drops = Array.from({ length: columns }, () => ({
      y: Math.random() * -h,
      speed: 0.4 + Math.random() * 1.0,
      ci: Math.floor(Math.random() * palette.length),
      isWord: Math.random() < 0.12,
    }));
  }
  window.addEventListener('resize', resize);
  resize();

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.font = '600 14px "JetBrains Mono", monospace';
    for (let i = 0; i < columns; i++) {
      const d = drops[i];
      const col = palette[d.ci];
      if (d.isWord) {
        const word = words[i % words.length];
        ctx.fillStyle = col + (0.30 + Math.random() * 0.15) + ')';
        ctx.fillText(word, i * FS, d.y);
      } else {
        const ch = chars[(Math.floor(Math.random() * chars.length))];
        ctx.fillStyle = col + (0.28 + Math.random() * 0.22) + ')';
        ctx.fillText(ch, i * FS, d.y);
      }
      d.y += d.speed * FS * 0.16;
      if (d.y > h + 20 && Math.random() > 0.965) d.y = Math.random() * -120;
    }
    raf = requestAnimationFrame(draw);
  }

  if (reduce) {
    ctx.fillStyle = 'rgba(63,185,80,0.04)';
    for (let i = 0; i < 300; i++) {
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], Math.random() * w, Math.random() * h);
    }
  } else {
    draw();
  }
})();
