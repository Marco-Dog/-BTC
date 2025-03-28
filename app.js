const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin,ripple,cardano&vs_currencies=usd";

// 更新即時報價
async function fetchPricing() {
  try {
    const response = await fetch(COINGECKO_API_URL);
    const data = await response.json();

    const prices = document.getElementById('prices');
    prices.innerHTML = '';

    const currencies = ["bitcoin", "ethereum", "litecoin", "ripple", "cardano"];
    currencies.forEach(currency => {
      const price = data[currency].usd;
      const priceElement = document.createElement('div');
      priceElement.classList.add('price');
      priceElement.innerHTML = `
        ${currency.charAt(0).toUpperCase() + currency.slice(1)}: $${price}
        <span class="green arrow-up"></span>`;
      prices.appendChild(priceElement);
    });
  } catch (error) {
    console.error("Error fetching pricing data:", error);
  }
}

// 更新交易紀錄
function updateTransactions() {
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  const transactionTable = document.getElementById('transaction-table').getElementsByTagName('tbody')[0];
  transactionTable.innerHTML = '';

  transactions.forEach((transaction, index) => {
    const row = transactionTable.insertRow();
    row.innerHTML = `
      <td>${transaction.date}</td>
      <td>${transaction.currency}</td>
      <td>${transaction.action}</td>
      <td>${transaction.price}</td>
      <td>${transaction.quantity}</td>
      <td>${transaction.fee}</td>
      <td>${transaction.note}</td>
      <td><button onclick="deleteTransaction(${index})">刪除</button></td>
    `;
  });
}

// 新增交易紀錄
document.getElementById('transaction-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const date = document.getElementById('date').value;
  const currency = document.getElementById('currency').value;
  const action = document.getElementById('action').value;
  const price = parseFloat(document.getElementById('price').value);
  const quantity = parseFloat(document.getElementById('quantity').value);
  const fee = parseFloat(document.getElementById('fee').value);
  const note = document.getElementById('note').value;

  const transaction = { date, currency, action, price, quantity, fee, note };
  let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  transactions.push(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));

  updateTransactions();
});

// 刪除交易紀錄
function deleteTransaction(index) {
  let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  transactions.splice(index, 1);
  localStorage.setItem('transactions', JSON.stringify(transactions));

  updateTransactions();
}

// 初始載入即時報價和交易紀錄
fetchPricing();
updateTransactions();
