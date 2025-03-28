const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,dogecoin,cardano,shiba-inu&vs_currencies=twd";

// 更新即時報價
async function fetchPricing() {
  try {
    const response = await fetch(COINGECKO_API_URL);
    const data = await response.json();

    // 顯示即時價格、持倉量、損益、報酬率
    updateQuote("btc", data.bitcoin.twd);
    updateQuote("eth", data.ethereum.twd);
    updateQuote("ada", data.cardano.twd);
    updateQuote("doge", data.dogecoin.twd);
    updateQuote("shib", data.shiba-inu.twd);

  } catch (error) {
    console.error("Error fetching pricing data:", error);
  }
}

// 更新單一幣別報價區域
function updateQuote(currency, price) {
  const priceElement = document.getElementById(`${currency}-price`);
  const positionElement = document.getElementById(`${currency}-position`);
  const profitElement = document.getElementById(`${currency}-profit`);
  const returnElement = document.getElementById(`${currency}-return`);

  priceElement.innerText = `$${price}`;

  // 假設從 localStorage 中讀取的持倉數量和購買價格
  const portfolio = JSON.parse(localStorage.getItem('transactions') || '[]');
  let position = 0;
  let totalCost = 0;
  let totalValue = 0;

  portfolio.forEach(transaction => {
    if (transaction.currency === currency) {
      position += transaction.quantity;
      totalValue += transaction.quantity * price;
      totalCost += (transaction.quantity * transaction.price) + transaction.fee;
    }
  });

  // 更新持倉量、損益和報酬率
  positionElement.innerText = position;
  const profit = totalValue - totalCost;
  profitElement.innerText = `$${profit.toFixed(2)}`;

  const returnRate = (totalCost === 0) ? 0 : ((profit / totalCost) * 100).toFixed(2);
  returnElement.innerText = `${returnRate} %`;
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
      <td>₣${transaction.price}</td>
      <td>${transaction.quantity}</td>
      <td>₣${transaction.fee.toFixed(2)}</td>
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

