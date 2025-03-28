// CoinGecko API URL
const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,dogecoin,shiba-inu&vs_currencies=twd";

// 即時報價區域更新
async function updateQuotes() {
  try {
    const response = await fetch(COINGECKO_API_URL);
    const data = await response.json();

    // 更新每個幣別的報價
    updateCurrencyData("BTC", data.bitcoin.twd);
    updateCurrencyData("ETH", data.ethereum.twd);
    updateCurrencyData("ADA", data.cardano.twd);
    updateCurrencyData("DOGE", data.dogecoin.twd);
    updateCurrencyData("SHIB", data["shiba-inu"].twd);

  } catch (error) {
    console.error("無法取得即時報價:", error);
  }
}

// 更新每個幣別的顯示
function updateCurrencyData(currency, price) {
  const priceElement = document.getElementById(`${currency.toLowerCase()}-price`);

  priceElement.innerText = `${price} TWD`;
}

// 頁面載入時即更新即時報價
updateQuotes();

// 設置每 10 秒自動更新即時報價
setInterval(updateQuotes, 10000);

// 交易紀錄儲存的陣列
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// 監聽交易表單的提交事件
document.getElementById("transaction-form").addEventListener("submit", function(event) {
  event.preventDefault();

  // 取得表單資料
  const date = document.getElementById("transaction-date").value;
  const currency = document.getElementById("transaction-currency").value;
  const type = document.getElementById("transaction-type").value;
  const price = parseFloat(document.getElementById("transaction-price").value);
  const quantity = parseFloat(document.getElementById("transaction-quantity").value);
  const fee = calculateFee(type, price, quantity);
  const note = document.getElementById("transaction-note").value;

  // 計算成交金額
  const amount = price * quantity;

  // 儲存交易紀錄
  const transaction = {
    date,
    currency,
    type,
    price,
    quantity,
    fee,
    amount,
    note
  };

  transactions.push(transaction);

  // 儲存至 localStorage
  localStorage.setItem('transactions', JSON.stringify(transactions));

  // 顯示交易紀錄
  renderTransactions();

  // 清空表單
  document.getElementById("transaction-form").reset();
});

// 計算手續費
function calculateFee(type, price, quantity) {
  const amount = price * quantity;
  if (type === "Buy") {
    return amount * 0.001; // 買入手續費 0.1%
  } else if (type === "Sell") {
    return amount * 0.002; // 賣出手續費 0.2%
  }
  return 0;
}

// 渲染交易紀錄
function renderTransactions() {
  const transactionList = document.getElementById("transaction-list");
  transactionList.innerHTML = ""; // 清空現有的表格資料

  transactions.forEach((transaction, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${transaction.date}</td>
      <td>${transaction.currency}</td>
      <td>${transaction.type}</td>
      <td>${transaction.price}</td>
      <td>${transaction.quantity}</td>
      <td>${transaction.fee.toFixed(2)}</td>
      <td>${transaction.note}</td>
      <td><button onclick="deleteTransaction(${index})">刪除</button></td>
    `;

    transactionList.appendChild(row);
  });
}

// 刪除交易紀錄
function deleteTransaction(index) {
  transactions.splice(index, 1); // 從陣列中移除該筆紀錄
  localStorage.setItem('transactions', JSON.stringify(transactions)); // 更新至 localStorage
  renderTransactions(); // 重新渲染表格
}

// 頁面加載時顯示儲存的交易紀錄
renderTransactions();
