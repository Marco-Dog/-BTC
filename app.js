// 交易紀錄儲存的陣列
let transactions = [];

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

  // 計算成交金額與手續費
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

  // 更新 Google Sheets
  updateGoogleSheets(transaction);

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
  renderTransactions(); // 重新渲染表格
  updateGoogleSheets(); // 更新 Google Sheets
}

// 更新 Google Sheets
function updateGoogleSheets(transaction = null) {
  // 請根據您的 API 路徑與格式進行調整
  const url = "https://script.google.com/macros/s/AKfycbwaAWEFQbS127UQbM96ZCioC7pRDbx9swiqdDzCz_irCaq5paa5z-EuR5YZ1gkx882L/exec";

  // 如果傳入交易紀錄，則將其新增至 Google Sheets
  if (transaction) {
    fetch(url + `?action=addTransaction&date=${transaction.date}&currency=${transaction.currency}&type=${transaction.type}&price=${transaction.price}&quantity=${transaction.quantity}&fee=${transaction.fee}&amount=${transaction.amount}&note=${transaction.note}`)
      .then(response => response.json())
      .then(data => {
        console.log("Transaction added to Google Sheets:", data);
      });
  }
}
