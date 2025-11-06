// Admin Elements
const adminList = document.getElementById('adminList');
const adminIncome = document.getElementById('adminIncome');
const adminExpense = document.getElementById('adminExpense');
const adminBalance = document.getElementById('adminBalance');
const totalUsers = document.getElementById('totalUsers');
const adminExport = document.getElementById('adminExport');
const adminClear = document.getElementById('adminClear');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let adminChart = null;

// Load data
function initAdmin() {
  adminList.innerHTML = '';
  transactions.forEach(addAdminTransaction);
  updateAdminStats();
}

function addAdminTransaction(tx) {
  const li = document.createElement('li');
  li.classList.add(tx.amount < 0 ? 'minus' : 'plus');
  li.innerHTML = `
    <div class="tx-left">
      <div class="tx-desc">${tx.text}</div>
      <small class="tx-datetime">${tx.datetime}</small>
    </div>
    <div class="tx-right">
      <div class="tx-amt">${tx.amount < 0 ? '-' : '+'}₹${Math.abs(tx.amount).toFixed(2)}</div>
    </div>`;
  adminList.appendChild(li);
}

function updateAdminStats() {
  const amounts = transactions.map(t => t.amount);
  const total = amounts.reduce((a, b) => a + b, 0);
  const income = amounts.filter(a => a > 0).reduce((a, b) => a + b, 0);
  const expense = Math.abs(amounts.filter(a => a < 0).reduce((a, b) => a + b, 0));

  adminIncome.textContent = `₹${income.toFixed(2)}`;
  adminExpense.textContent = `₹${expense.toFixed(2)}`;
  adminBalance.textContent = `₹${total.toFixed(2)}`;
  totalUsers.textContent = "1"; // Local demo — change if multi-user added later

  drawAdminChart(income, expense);
}

function drawAdminChart(income, expense) {
  const ctx = document.getElementById('adminChart').getContext('2d');
  if (adminChart) adminChart.destroy();
  adminChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: [income, expense],
        backgroundColor: ['#2ecc71', '#e74c3c']
      }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  });
}

// Export all data as CSV
function exportAdminCSV() {
  if (!transactions.length) return alert('No data to export.');
  let csv = 'Description,Amount,DateTime\n';
  transactions.forEach(t => {
    const desc = `"${t.text.replace(/"/g, '""')}"`;
    csv += `${desc},${t.amount},"${t.datetime}"\n`;
  });