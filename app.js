const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin,ripple,cardano&vs_currencies=thb";

// 更新即時報價
async function fetchPricing() {
  try {
    const response = await fetch(COINGECKO_API_URL);
    const data = await response.json();

    const prices = document.getElementById('prices');
    prices.innerHTML = '';

    const currencies = ["bitcoin", "ethereum", "litecoin", "ripple", "cardano"];
    currencies.forEach(currency => {
      const price = data[currency].thb;
      const priceElement = document.createElement('div');
      priceElement.classList.add('price');
      priceElement.innerHTML = `
        ${currency.charAt(0).toUpperCase() + currency.slice(1)}: ฿${price}
        <span class="green arrow-up"></span>`;
      prices.appendChild(priceElement);
    });

    // 顯示持倉數量與持倉獲利
    displayPortfolio(data);
  } catch (error) {
    console.error("Error fetching pricing data:", error);
  }
}

// 顯示持倉數量與持倉獲利
function displayPortfolio(prices) {
  const portfolio = JSON.parse(localStorage.getItem('transactions') || '[]');
  let portfolioValue = 0;
  let profitLoss = 0;

  portfolio.forEach(transaction => {
    const currentPrice = prices[transaction.currency].thb;
    const transactionValue = transaction.quantity * currentPrice;
    const transactionCost = transaction.price * transaction.quantity + transaction.fee;
    const transactionProfitLoss = transactionValue - transactionCost;

    portfolioValue += transactionValue;
    profitLoss += transactionProfitLoss;
  });

  const portfolioContainer = document.getElementById('portfolio');
  portfolioContainer.innerHTML = `
    <h3>持倉狀況</h3>
    <p>總持倉價值: ฿${portfolioValue.toFixed(2)}</p>
    <p>持倉獲利: <span class="${profitLoss >= 0 ? 'green' : 'red'}">${profitLoss >= 0 ? '฿' + profitLoss.toFixed(2) + ' ↑' : '฿' + profitLoss.toFixed(2) + ' ↓'}</span></p>
  `;
}

// 新增交易紀錄
document.getElementById('transaction-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const date = document.getElementById('date').value;
  const currency = document.getElementById('currency').value;
  const action = document.getElementById('action').value;
  const price = parseFloat(document.getElementById('price').value);
  const quantity = parseFloat(document.getElementById('quantity').value);
  const fee = (action === 'buy') ? price * quantity * 0.001 : price * quantity * 0.002; // 手續費：買入0.1%，賣出0.2%
  const note = document.getElementById('note').value;

  const transaction = { date, currency, action, price, quantity, fee, note };
  let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  transactions.push(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));

  updateTransactions();
  syncWithGoogleSheets(); // 新增交易紀錄後同步到 Google Sheets
});

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
      <td>฿${transaction.price}</td>
      <td>${transaction.quantity}</td>
      <td>฿${transaction.fee.toFixed(2)}</td>
      <td>${transaction.note}</td>
      <td><button onclick="deleteTransaction(${index})">刪除</button></td>
    `;
  });
}

// 刪除交易紀錄
function deleteTransaction(index) {
  let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  transactions.splice(index, 1);
  localStorage.setItem('transactions', JSON.stringify(transactions));

  updateTransactions();
  syncWithGoogleSheets(); // 刪除交易紀錄後同步到 Google Sheets
}

// 初始載入即時報價和交易紀錄
fetchPricing();
updateTransactions();
