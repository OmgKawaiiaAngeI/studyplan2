/* ---------------- Check-ins ---------------- */
let ciEntries = [];
let ciStatus = 'good';

function populateCiTopics(){
  const sel = document.getElementById('ciTopic');
  sel.innerHTML = '';
  topics.forEach(t=>{
    const label = (t[0].startsWith("Assignment")||t[0]==="Extra Class One") ? t[1] : (t[0]+(t[1]!==t[0]?" — "+t[1]:""));
    const opt = document.createElement('option');
    opt.value = label; opt.textContent = label;
    sel.appendChild(opt);
  });
}
function loadCi(){
  try{ const raw = localStorage.getItem('ciEntries'); if(raw) ciEntries = JSON.parse(raw); }catch(e){}
  document.getElementById('ciDate').value = isoDate(new Date());
  renderCiList();
}
function saveCi(){ try{ localStorage.setItem('ciEntries', JSON.stringify(ciEntries)); }catch(e){} }
function renderCiList(){
  const list = document.getElementById('ciList');
  if(ciEntries.length===0){ list.innerHTML = '<div class="ci-empty">No check-ins logged yet.</div>'; return; }
  const sorted = [...ciEntries].sort((a,b)=> b.date.localeCompare(a.date));
  list.innerHTML = '';
  sorted.forEach(entry=>{
    const el = document.createElement('div');
    el.className = 'ci-entry';
    const badgeLabel = entry.status==='good' ? 'Nailed it' : entry.status==='mixed' ? 'Some mistakes' : 'Struggled';
    el.innerHTML = `
      <div class="ci-entry-top">
        <span>${fmtDate(new Date(entry.date+"T00:00:00"))}</span>
        <span class="ci-badge ${entry.status}">${badgeLabel}</span>
      </div>
      <div class="ci-topic">${entry.topic}</div>
      ${entry.notes ? `<div class="ci-notes">${entry.notes.replace(/</g,'&lt;')}</div>` : ''}
      <button class="ci-del" data-id="${entry.id}">remove</button>
    `;
    el.querySelector('.ci-del').addEventListener('click',()=>{
      ciEntries = ciEntries.filter(e=>e.id!==entry.id);
      saveCi(); renderCiList();
    });
    list.appendChild(el);
  });
}
document.querySelectorAll('.ci-status-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    ciStatus = btn.dataset.status;
    document.querySelectorAll('.ci-status-btn').forEach(b=>b.classList.remove('sel-good','sel-mixed','sel-tough'));
    btn.classList.add('sel-'+ciStatus);
  });
});
document.getElementById('ciAdd').addEventListener('click',()=>{
  const date = document.getElementById('ciDate').value || isoDate(new Date());
  const topic = document.getElementById('ciTopic').value;
  const notes = document.getElementById('ciNotes').value.trim();
  ciEntries.push({ id: Date.now().toString(), date, topic, status: ciStatus, notes });
  saveCi(); renderCiList();
  document.getElementById('ciNotes').value = '';
});

populateCiTopics();
loadCi();

/* ---------------- My Notes ---------------- */
let myNotes = [];

const seedNotes = [
  {
    id: 'seed-fractions',
    category: 'Fractions',
    title: 'Turning whole numbers into fractions',
    body: "Any whole number can be written as a fraction over 1 (e.g. 6 = 6/1).\n\nTo write it as a fraction with a specific denominator, multiply the whole number by that denominator to get the numerator — the denominator stays as chosen.\n\nExample: turn 6 into a fraction with denominator 4.\n6 × 4 = 24, so 6 = 24/4.\n\nCheck it: 24 ÷ 4 = 6 ✓\n\nGeneral rule: whole number n as a fraction over denominator d is (n × d)/d."
  },
  {
    id: 'seed-numbersets',
    category: 'Number Classification',
    title: "Number sets — N, W, Z, Q, Q', R",
    body: "These letters label different families of numbers. Each bigger set contains the smaller ones inside it.\n\nN — Natural numbers: the counting numbers 1, 2, 3, 4, ... (0 is NOT included)\nW — Whole numbers: N plus 0, so 0, 1, 2, 3, ...\nZ — Integers: all whole numbers and their negatives: ..., -2, -1, 0, 1, 2, ...\nQ — Rational numbers: anything writable as a fraction a/b (b≠0) — includes integers, terminating decimals (like 1.2) and repeating decimals\nQ' — Irrational numbers: CANNOT be written as a fraction — non-terminating, non-repeating decimals like π or √2\nR — Real numbers: everything above combined — every rational and irrational number\n\nZ⁻ means the negative integers only: -1, -2, -3, ...\n\nHow to check a row in the table:\n• √81 = 9, a whole number → belongs to N, W, Z, Q, R (not Q')\n• 1.2 has a decimal part, so it's not N, W, or Z — but it IS rational (= 6/5) and real\n• 0 is not natural (by CSEC convention) but IS whole, an integer, rational, and real\n• 13 is a natural number, so it ticks every column except Q'\n• -2 is negative, so it's not N or W — but it IS an integer, rational, and real"
  },
  {
    id: 'seed-sets',
    category: 'Sets',
    title: 'Set symbols and set theory basics',
    body: "Sets use curly braces: A = {1, 2, 3} means A contains the elements 1, 2, 3.\n\nKey symbols:\n∈ — \"is an element of\" (e.g. 2 ∈ A)\n∉ — \"is not an element of\"\n⊂ — \"is a proper subset of\" (every element of one set is in the other, but they're not equal)\n⊆ — \"is a subset of\" (subset or equal)\n∪ — union (all elements in EITHER set, no duplicates)\n∩ — intersection (elements in BOTH sets)\nA' — complement of A (everything in the universal set U that is NOT in A)\n∅ or { } — empty/null set (a set with no elements)\nn(A) — the number of elements in set A\nU — the universal set (everything being considered)\n\nTypes of sets:\n• Finite set — has a countable number of elements\n• Infinite set — goes on forever (e.g. the set of natural numbers)\n• Equal sets — contain exactly the same elements\n• Disjoint sets — share no elements at all (A∩B = ∅)\n\nWorked example:\nU = {1,2,...,10}, A = {2,4,6,8,10}, B = {1,2,3,4,5}\nA∩B = {2,4} (in both)\nA∪B = {1,2,3,4,5,6,8,10} (in either)\nA' = {1,3,5,7,9} (everything in U not in A)\nn(A) = 5\n\nVenn diagrams are the standard way to show all of this visually — two overlapping circles inside a rectangle (the universal set)."
  },
  {
    id: 'seed-sigfigs',
    category: 'Significant Figures',
    title: 'Significant figures',
    body: "Significant figures (sig figs) tell you how precisely a number is known. The rules:\n\n1. All non-zero digits are always significant.\n2. Zeros BETWEEN non-zero digits are significant (e.g. 205 has 3 sig figs).\n3. Leading zeros (before the first non-zero digit) are never significant (e.g. 0.0075 has 2 sig figs).\n4. Trailing zeros ARE significant if there's a decimal point (e.g. 3.400 has 4 sig figs).\n5. Trailing zeros in a whole number with no decimal point are usually NOT counted as significant (e.g. 4500 is normally read as 2 sig figs).\n\nHow to round to n significant figures:\n• Count from the first non-zero digit.\n• Look at the digit right after your cut-off point — round up if it's 5 or more, round down if it's less than 5.\n• Fill any remaining places before the decimal point with zeros as placeholders.\n\nExamples:\n4.6789 to 3 sf → 4.68\n0.048273 to 2 sf → 0.048\n3456 to 2 sf → 3500\n0.004567 to 2 sf → 0.0046"
  },
  {
    id: 'seed-scinotratio',
    category: 'Scientific Notation and Ratios',
    title: 'Scientific notation and ratios',
    body: "Scientific notation writes very large or very small numbers as: a × 10ⁿ, where 1 ≤ a < 10 and n is an integer.\n\nTo convert a normal number TO scientific notation:\n• Move the decimal point until only one non-zero digit is before it.\n• Count how many places you moved it — that's your power of 10.\n• Moving left (big number) → positive power. Moving right (small number) → negative power.\n\nExamples:\n56000 → 5.6 × 10⁴ (moved decimal 4 places left)\n0.00073 → 7.3 × 10⁻⁴ (moved decimal 4 places right)\n\nTo convert scientific notation BACK to an ordinary number, move the decimal point the opposite way by n places.\n\nRatios compare two or more quantities. A ratio like a:b:c can be simplified by dividing all parts by their highest common factor (HCF).\n\nTo share an amount in a given ratio:\n1. Add up all the parts of the ratio to find the total number of parts.\n2. Divide the total amount by the total parts to find the value of ONE part.\n3. Multiply that value by each part of the ratio.\n\nExample: Share $600 in the ratio 1:2:3.\nTotal parts = 1+2+3 = 6\nOne part = $600 ÷ 6 = $100\nShares = $100, $200, $300"
  }
];

function loadMn(){
  try{
    const raw = localStorage.getItem('myNotes');
    if(raw){ myNotes = JSON.parse(raw); }
    else { myNotes = seedNotes; saveMn(); }
  }catch(e){ myNotes = seedNotes; }
  populateMnCategoryList();
  renderMnList();
}
function saveMn(){ try{ localStorage.setItem('myNotes', JSON.stringify(myNotes)); }catch(e){} }
function populateMnCategoryList(){
  const dl = document.getElementById('mnCategoryList');
  const cats = [...new Set(myNotes.map(n => n.category || 'General'))];
  dl.innerHTML = cats.map(c => `<option value="${c.replace(/</g,'&lt;')}"></option>`).join('');
}
function renderMnList(){
  const list = document.getElementById('mnList');
  if(myNotes.length===0){ list.innerHTML = '<div class="ci-empty">No notes saved yet.</div>'; return; }
  list.innerHTML = '';
  const groups = {};
  [...myNotes].reverse().forEach(note=>{
    const cat = note.category || 'General';
    if(!groups[cat]) groups[cat] = [];
    groups[cat].push(note);
  });
  Object.keys(groups).forEach(cat=>{
    const heading = document.createElement('div');
    heading.className = 'mn-section-title';
    heading.textContent = cat;
    list.appendChild(heading);
    groups[cat].forEach(note=>{
      const el = document.createElement('div');
      el.className = 'mn-card';
      el.innerHTML = `
        <div class="mn-title">${note.title.replace(/</g,'&lt;')}</div>
        <div class="mn-body">${note.body.replace(/</g,'&lt;')}</div>
        <button class="mn-del" data-id="${note.id}">remove</button>
      `;
      el.querySelector('.mn-del').addEventListener('click',()=>{
        myNotes = myNotes.filter(n=>n.id!==note.id);
        saveMn(); populateMnCategoryList(); renderMnList();
      });
      list.appendChild(el);
    });
  });
}
document.getElementById('mnAdd').addEventListener('click',()=>{
  const category = document.getElementById('mnCategory').value.trim() || 'General';
  const title = document.getElementById('mnTitle').value.trim();
  const body = document.getElementById('mnBody').value.trim();
  if(!title && !body) return;
  myNotes.push({ id: Date.now().toString(), category, title: title || 'Untitled note', body });
  saveMn(); populateMnCategoryList(); renderMnList();
  document.getElementById('mnCategory').value = '';
  document.getElementById('mnTitle').value = '';
  document.getElementById('mnBody').value = '';
});

loadMn();
