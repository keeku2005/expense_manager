const balance = document.getElementById('balance');
const income = document.getElementById('income');
const expense = document.getElementById('expense');
const list = document.getElementById('list');
const form = document.getElementById('transaction-form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');

// Sample starting data
let transactions = [
  { id: 1, text: 'Salary', amount: 5000 },
  { id: 2, text: 'Groceries', amount: -1200 },
  { id: 3, text: 'Freelance', amount: 2000 },
  { id: 4, text: 'Electricity Bill', amount: -800 }
];

// Update balance and chart
function updateValues() {
  const amounts = transactions.map(t => t.amount);
  const total = amounts.reduce((a, b) => a + b, 0).toFixed(2);
  const incomeTotal = amounts.filter(a => a > 0).reduce((a, b) => a + b, 0).toFixed(2);
  const expenseTotal = (amounts.filter(a => a < 0).reduce((a, b) => a + b, 0) * -1).toFixed(2);

  balance.innerText = `₹${total}`;
  income.innerText = `+₹${incomeTotal}`;
  expense.innerText = `-₹${expenseTotal}`;

  updateChart();
}

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');
  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  item.innerHTML = `
    ${transaction.text} 
    <span>${sign}₹${Math.abs(transaction.amount)}</span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
  `;
  list.appendChild(item);
}

function updateDOM() {
  list.innerHTML = '';
  transactions.forEach(addTransactionDOM);
  updateValues();
}

form.addEventListener('submit', e => {
  e.preventDefault();
  if (text.value.trim() === '' || amount.value.trim() === '') return;

  const transaction = {
    id: Math.floor(Math.random() * 1000000),
    text: text.value,
    amount: +amount.value
  };
  transactions.push(transaction);
  updateDOM();

  text.value = '';
  amount.value = '';
});

function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateDOM();
}

// PIE CHART
let expenseChart;

function updateChart() {
  const ctx = document.getElementById('expenseChart').getContext('2d');
  const incomeTotal = transactions.filter(t => t.amount > 0).reduce((a, b) => a + b.amount, 0);
  const expenseTotal = transactions.filter(t => t.amount < 0).reduce((a, b) => a + Math.abs(b.amount), 0);

  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Income', 'Expenses'],
      datasets: [{
        data: [incomeTotal, expenseTotal],
        backgroundColor: ['#2ecc71', '#e74c3c']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

// Initialize
updateDOM();
