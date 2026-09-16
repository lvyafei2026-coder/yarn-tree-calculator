function t() { return (window.__i18n && window.__i18n.t) || {}; }

// 每平方厘米的基础码数（Worsted 基准值 0.55）
const WEIGHT_DENSITY = {
  lace: 0.15,
  superfine: 0.25,
  fine: 0.35,
  light: 0.45,
  medium: 0.55,
  bulky: 0.75,
  superbulky: 1.00
};

// 针法系数
const STITCH_FACTOR = {
  stockinette: 1.00,
  garter: 1.05,
  ribbing: 1.15,
  seed: 1.20,
  cable: 1.35,
  brioche: 1.60,
  lace: 0.85
};

function calculate() {
  const tr = t();
  const width = parseFloat(document.getElementById('width').value);
  const height = parseFloat(document.getElementById('height').value);
  const weight = document.getElementById('weight').value;
  const stitch = document.getElementById('stitch').value;
  const skeinYardage = parseFloat(document.getElementById('skeinYardage').value);

  if (!width || !height || width <= 0 || height <= 0) {
    alert(tr.alertFill || 'Please enter a valid width and height.');
    return;
  }
  if (!skeinYardage || skeinYardage <= 0) {
    alert(tr.alertSkein || 'Please enter the yardage per skein.');
    return;
  }

  const area = width * height;
  const density = WEIGHT_DENSITY[weight] || 0.55;
  const factor = STITCH_FACTOR[stitch] || 1.0;

  // 总码数 = 面积 × 密度 × 针法系数 × 1.1（缓冲）
  const totalYards = area * density * factor * 1.1;
  const totalYardsRounded = Math.ceil(totalYards);
  const skeins = Math.ceil(totalYards / skeinYardage);

  document.getElementById('totalYards').textContent = totalYardsRounded.toLocaleString();

  const noteTemplate = tr.skeinNote || 'Buy {n} skein(s) of {y} yards each';
  document.getElementById('skeinNote').textContent = noteTemplate
    .replace('{n}', skeins)
    .replace('{y}', skeinYardage);

  document.getElementById('bdArea').textContent = area.toLocaleString() + ' cm²';

  document.getElementById('result').classList.add('show');
}

window.calculate = calculate;