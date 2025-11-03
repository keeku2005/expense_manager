// Elements
const balanceEl = document.getElementById('balance');
const incomeEl  = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const listEl    = document.getElementById('list');
const form      = document.getElementById('transaction-form');
const textInput = document.getElementById('text');
const amountInput = document.getElementById('amount');
const exportBtn = document.getElementById('exportBtn');
const clearBtn  = document.getElementById('clearBtn');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let chart = null;

// Helpers
function nowDateTime() {
  const d = new Date();
  // Format: dd/mm/yyyy, hh:mm AM/PM (browser locale aware)
  const date = d.toLocaleDateString();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${date}, ${time}`;
}

function save() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function formatCurrency(num) {
  return `₹${Number(num).toFixed(2)}`;
}

// DOM functions
function addTransactionDOM(tx) {
  const li = document.createElement('li');
  li.classList.add(tx.amount < 0 ? 'minus' : 'plus');

  const left = document.createElement('div');
  left.className = 'tx-left';
  const desc = document.createElement('div');
  desc.className = 'tx-desc';
  desc.textContent = tx.text;
  const dt = document.createElement('small');
  dt.className = 'tx-datetime';
  dt.textContent = tx.datetime;
  left.appendChild(desc);
  left.appendChild(dt);

  const right = document.createElement('div');
  right.className = 'tx-right';
  const amt = document.createElement('div');
  amt.className = 'tx-amt';
  amt.textContent = `${tx.amount < 0 ? '-' : '+'}${formatCurrency(Math.abs(tx.amount))}`;
  const btn = document.createElement('button');
  btn.className = 'delete-btn';
  btn.textContent = '❌';
  btn.onclick = () => removeTransaction(tx.id);

  right.appendChild(amt);
  right.appendChild(btn);

  li.appendChild(left);
  li.appendChild(right);
  listEl.appendChild(li);
}

function updateValues() {
  const amounts = transactions.map(t => t.amount);
  const total = amounts.reduce((a,b) => a + b, 0);
  const incomeTotal = amounts.filter(a => a > 0).reduce((a,b) => a + b, 0);
  const expenseTotal = Math.abs(amounts.filter(a => a < 0).reduce((a,b) => a + b, 0));

  balanceEl.textContent = formatCurrency(total);
  incomeEl.textContent = `+${formatCurrency(incomeTotal)}`;
  expenseEl.textContent = `-${formatCurrency(expenseTotal)}`;

  updateChart(incomeTotal, expenseTotal);
}

function initDOM() {
  listEl.innerHTML = '';
  transactions.forEach(addTransactionDOM);
  updateValues();
}

function addTransaction(e){
  e.preventDefault();
  const text = textInput.value.trim();
  const amount = Number(amountInput.value);
  if (!text || !amount) return alert('Enter description and non-zero amount (use negative for expense).');

  const tx = {
    id: Date.now(),
    text,
    amount,
    datetime: nowDateTime()
  };

  transactions.unshift(tx); // newest first
  save();
  initDOM();
  textInput.value = '';
  amountInput.value = '';
}

// remove
function removeTransaction(id){
  transactions = transactions.filter(t => t.id !== id);
  save();
  initDOM();
}

// chart
function updateChart(incomeTotal = 0, expenseTotal = 0){
  const ctx = document.getElementById('expenseChart').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: [incomeTotal, expenseTotal],
        backgroundColor: ['#2ecc71', '#e74c3c']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

// export CSV
function exportCSV(){
  if (!transactions.length) return alert('No transactions to export.');
  let csv = 'Description,Amount,DateTime\n';
  transactions.slice().reverse().forEach(t => {
    // escape commas in text
    const desc = `"${t.text.replace(/"/g,'""')}"`;
    csv += `${desc},${t.amount},"${t.datetime}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transactions.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// clear all
function clearAll(){
  if (!confirm('Clear all transactions? This cannot be undone.')) return;
  transactions = [];
  save();
  initDOM();
}

// wiring
form.addEventListener('submit', addTransaction);
exportBtn.addEventListener('click', exportCSV);
clearBtn.addEventListener('click', clearAll);

// init on load
initDOM();
