// 加入本地儲存功能：儲存交易紀錄
function saveToLocalStorage(transaction) {
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  transactions.push(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  displayTransactions();  // 重新顯示交易紀錄
}

// 顯示交易紀錄
function displayTransactions() {
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  const transactionList = document.getElementById('transaction-list');
  transactionList.innerHTML = '';  // 清空原本的資料

  transactions.forEach((transaction, index) => {
    const transactionElement = document.createElement('div');
    transactionElement.classList.add('transaction-item');
    transactionElement.innerHTML = `
      <span>${transaction.date}</span> 
      <span>${transaction.currency}</span> 
      <span>${transaction.type}</span> 
      <span>${transaction.price}</span> 
      <span>${transaction.quantity}</span> 
      <span>${transaction.fee}</span> 
      <span>${transaction.amount}</span> 
      <span>${transaction.note}</span>
      <button onclick="deleteTransaction(${index})">刪除</button>
    `;
    transactionList.appendChild(transactionElement);
  });
}

// 刪除交易紀錄
function deleteTransaction(index) {
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  transactions.splice(index, 1);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  displayTransactions();  // 重新顯示交易紀錄
}

// 即時報價更新
function fetchLivePrices() {
  const currencies = ['BTC', 'ETH', 'ADA', 'DOGE', 'SHIB'];
  const apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,dogecoin,shiba-inu&vs_currencies=usd';

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      currencies.forEach(currency => {
        const price = data[currency.toLowerCase()] ? data[currency.toLowerCase()].usd : 0;
        const priceElement = document.getElementById(`${currency}-price`);
        priceElement.innerHTML = `￥${price.toLocaleString()}`;
      });
    })
    .catch(error => {
      console.error('Error fetching live prices:', error);
    });
}

// 每10秒更新即時報價
setInterval(fetchLivePrices, 10000);

// 頁面加載後初始化
window.onload = function() {
  displayTransactions();  // 顯示本地儲存的交易紀錄
  fetchLivePrices();      // 加載即時報價
};
