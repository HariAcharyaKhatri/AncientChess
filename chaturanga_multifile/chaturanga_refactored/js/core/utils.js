
function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = String(str == null ? '' : str);
  return d.innerHTML;
}

function getCanvas() { return document.getElementById('board'); }

function getPos(e) {
  const canvas = getCanvas();
  const rect = canvas.getBoundingClientRect();
  let cx = e.clientX, cy = e.clientY;
  if (e.touches && e.touches.length) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
  return [cx - rect.left, cy - rect.top];
}

function squareFromPos(px, py) {
  const col = Math.floor(px / sqSize), row = Math.floor(py / sqSize);
  const r = boardFlipped ? 7 - row : row;
  const c = boardFlipped ? 7 - col : col;
  return (r >= 0 && r < 8 && c >= 0 && c < 8) ? [r, c] : null;
}
