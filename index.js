// Modern vanilla JS refactor with live updates and nicer formatting
(function () {
  const $ = (id) => document.getElementById(id);

  const els = {
    form: $('calcForm'),
    qty: $('qty'),
    dia: $('dia'),
    diaOut: $('diaOut'),
    hydration: $('hydration'),
    hydrationOut: $('hydrationOut'),
    yeast: $('yeast'),
    salt: $('salt'),
    sugar: $('sugar'),
    olive: $('olive'),
    flourOut: $('flourOut'),
    waterOut: $('waterOut'),
    yeastOut: $('yeastOut'),
    saltOut: $('saltOut'),
    sugarOut: $('sugarOut'),
    oliveOut: $('oliveOut'),
    ballOut: $('ballOut'),
    ballsOut: $('ballsOut'),
    pizzaDial: $('pizzaDial'),
    copyBtn: $('copyBtn'),
    hydrationField: document.getElementById('hydrationField'),
    diameterField: document.getElementById('diameterField'),
    diaLabel: document.getElementById('diaLabel')
  };

  // Fallback-safe parsing
  const nInt = (v, d = 0) => {
    const x = parseInt(v, 10);
    return Number.isFinite(x) ? x : d;
  };
  const nNum = (v, d = 0) => {
    const x = parseFloat(v);
    return Number.isFinite(x) ? x : d;
  };
  const roundTo = (val, step) => Math.round(val / step) * step;
  const fmt = (n, dec = 2) => {
    if (!Number.isFinite(n)) return '-';
    return Number(n.toFixed(dec)).toString();
  };

  // Map a numeric value from [inMin..inMax] to [outMin..outMax]
  const mapRange = (v, inMin, inMax, outMin, outMax) =>
    outMin + ((v - inMin) * (outMax - outMin)) / (inMax - inMin);

  // Format a value in teaspoons to a human-readable mixed fraction using 1/8 steps
  function formatTsp(tsp) {
    if (!Number.isFinite(tsp)) return '-';
    if (tsp === 0) return '0 tsp';
    const whole = Math.floor(tsp);
    const frac = tsp - whole;
    const eighths = Math.round(frac * 8);
    const map = { 0: '', 1: '1/8', 2: '1/4', 3: '3/8', 4: '1/2', 5: '5/8', 6: '3/4', 7: '7/8', 8: '1' };
    let outWhole = whole;
    let outFrac = map[eighths] || '';
    if (eighths === 8) { outWhole += 1; outFrac = ''; }
    return `${outWhole ? outWhole + (outFrac ? ' ' : '') : ''}${outFrac} tsp`;
  }

  // Pizza doughball weight polynomial from original logic
  function doughballWeightForDiameter(d) {
    const x = d;
    const w =
      4.017908525e-5 * Math.pow(x, 5) -
      6.721341349e-3 * Math.pow(x, 4) +
      0.431223152 * Math.pow(x, 3) -
      13.09562775 * Math.pow(x, 2) +
      194.6689912 * x -
      970.1543255;
    return Math.round(w);
  }

  function compute(state) {
    const qty = Math.max(1, nInt(state.qty, 1));
    const dia = Math.max(1, nNum(state.dia, 20));
    const hydration = Math.max(0, nNum(state.hydration, 60)) / 100;
    const yeastPct = Math.max(0, nNum(state.yeast, 1)) / 100;
    const saltPct = Math.max(0, nNum(state.salt, 2)) / 100;
    const sugarPct = Math.max(0, nNum(state.sugar, 2)) / 100;
    const olivePct = Math.max(0, nNum(state.olive, 3)) / 100;

    const weight = doughballWeightForDiameter(dia);
    const sum = qty * weight; // total mass per dough plan

    let flour = sum / (1 + hydration);
    flour = roundTo(flour, 1);
    flour = roundTo(flour, 5); // nearest 5g like original
    const water = roundTo(sum - flour, 1);

    const yeastG = roundTo(flour * yeastPct, 0.2); // steps of 0.2g
    const saltG = roundTo(flour * saltPct, 0.2);
    const sugarG = roundTo(flour * sugarPct, 0.2);
    const oliveG = roundTo(flour * olivePct, 0.2);

    // Conversions based on original constants
    const tspFrom = (g, perTsp) => g / perTsp;
    const yeastTsp = tspFrom(yeastG, 2.83);
    const saltTsp = tspFrom(saltG, 5.69);
    const sugarTsp = tspFrom(sugarG, 4.167);
    const oliveTsp = tspFrom(oliveG, 4.929);
    const oliveTbsp = tspFrom(oliveG, 14.7868);

    return {
      qty,
      dia,
      weight,
      flour,
      water,
      yeastG,
      saltG,
      sugarG,
      oliveG,
      yeastTsp,
      saltTsp,
      sugarTsp,
      oliveTsp,
      oliveTbsp
    };
  }

  function updateUI() {
    const state = {
      qty: els.qty.value,
      dia: els.dia.value,
      hydration: els.hydration.value,
      yeast: els.yeast.value,
      salt: els.salt.value,
      sugar: els.sugar.value,
      olive: els.olive.value
    };

    const r = compute(state);

    els.diaOut.textContent = `${r.dia} cm`;
    els.hydrationOut.textContent = `${nInt(state.hydration)}%`;

    els.flourOut.textContent = `${r.flour} g`;
    els.waterOut.textContent = `${r.water} ml`;
    els.yeastOut.textContent = `${formatTsp(r.yeastTsp)} (${fmt(r.yeastG, 1)} g)`;
    els.saltOut.textContent = `${formatTsp(r.saltTsp)} (${fmt(r.saltG, 1)} g)`;
    els.sugarOut.textContent = `${formatTsp(r.sugarTsp)} (${fmt(r.sugarG, 1)} g)`;
    els.oliveOut.textContent = `${formatTsp(r.oliveTsp)} / ${fmt(roundTo(r.oliveTbsp, 0.125), 3)} tbsp (${fmt(r.oliveG, 1)} g)`;
    els.ballOut.textContent = `${r.weight} g`;
    els.ballsOut.textContent = `${r.qty}`;

    // Update the fun pizza dial scale without layout shift
    const scale = mapRange(r.dia, 15, 40, 0.45, 1);
    if (els.pizzaDial) els.pizzaDial.style.setProperty('--scale', `${scale}`);

    // Background pizza slices scale via CSS variable multiplier
    const slicesMult = mapRange(r.dia, 15, 40, 0.85, 1.25);
    document.documentElement.style.setProperty('--slice-size-mult', String(Number(slicesMult.toFixed(3))));

    // Hydration visual fill
    if (els.hydrationField) {
      const h = Math.max(0, Math.min(1, nNum(state.hydration, 60) / 100));
      els.hydrationField.style.setProperty('--h', `${h}`);
    }
  }

  function setup() {
    // Initialize defaults are in HTML; just wire listeners
    [
      els.qty,
      els.dia,
      els.hydration,
      els.yeast,
      els.salt,
      els.sugar,
      els.olive
    ].forEach((el) => el.addEventListener('input', updateUI));

    els.form.addEventListener('submit', (e) => e.preventDefault());

    els.copyBtn.addEventListener('click', async () => {
      const lines = [
        `Flour: ${els.flourOut.textContent}`,
        `Water: ${els.waterOut.textContent}`,
        `Yeast: ${els.yeastOut.textContent}`,
        `Salt: ${els.saltOut.textContent}`,
        `Sugar: ${els.sugarOut.textContent}`,
        `Olive Oil: ${els.oliveOut.textContent}`,
        `Doughball Weight: ${els.ballOut.textContent}`,
        `Balls: ${els.ballsOut.textContent}`
      ];
      const text = lines.join('\n');
      try {
        await navigator.clipboard.writeText(text);
        els.copyBtn.textContent = 'Copied!';
        setTimeout(() => (els.copyBtn.textContent = 'Copy Recipe'), 1200);
      } catch (err) {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        els.copyBtn.textContent = 'Copied!';
        setTimeout(() => (els.copyBtn.textContent = 'Copy Recipe'), 1200);
      }
    });

    updateUI();
  }

  document.addEventListener('DOMContentLoaded', setup);
})();
