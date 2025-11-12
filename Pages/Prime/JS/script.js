document.addEventListener('DOMContentLoaded', () => {
  const outputEl = document.getElementById('output');
  const historyEl = document.getElementById('history');
  const buttons = document.querySelectorAll('button[data-value], button[data-action]');

  let expression = '';
  let lastResult = null;

  function render() {
    outputEl.textContent = expression || '0';
    historyEl.textContent = lastResult !== null ? lastResult : '';
  }

  function sanitizeForEval(expr) {
    const allowed = /^[0-9+\-*/(). %]+$/;
    if (!allowed.test(expr)) throw new Error('Entrada inválida');
    expr = expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');
    expr = expr.replace(/(\d+(\.\d+)?)%/g,'($1/100)');
    return expr;
  }

  function evaluate() {
    if (!expression) return;
    try {
      const safe = sanitizeForEval(expression);
      const val = Function('return ' + safe)();
      if (!Number.isFinite(val)) throw new Error('Resultado no finito');
      lastResult = expression + ' = ' + val;
      expression = String(val);
    } catch {
      lastResult = 'Error';
      expression = '';
    }
    render();
  }

  function press(value) {
    if (value === '.') {
      const parts = expression.split(/[^0-9.]/);
      if (parts[parts.length-1].includes('.')) return;
    }
    expression += value;
    render();
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.getAttribute('data-value');
      const action = btn.getAttribute('data-action');

      if (action === 'clear') { expression = ''; lastResult = null; render(); return; }
      if (action === 'back') { expression = expression.slice(0, -1); render(); return; }
      if (action === 'equals') { evaluate(); return; }
      if (value) press(value);
    });
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Enter') { evaluate(); return; }
    if (e.key === 'Backspace') { expression = expression.slice(0,-1); render(); return; }
    if (e.key === 'Escape') { expression=''; lastResult=null; render(); return; }

    const keyMap = {'/':'/','*':'*','-':'-','+':'+','.':'.','%':'%'};
    if (/[0-9]/.test(e.key)) { press(e.key); return; }
    if (keyMap[e.key]) { press(keyMap[e.key]); return; }
    if (e.key==='(' || e.key===')') { press(e.key); return; }
  });

  render();
});