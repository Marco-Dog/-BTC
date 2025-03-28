// 加入手續費計算：買入時 0.1% 手續費、賣出時 0.2% 手續費
function calculateTransactionFee(type, price, quantity) {
  const totalAmount = price * quantity;
  if (type === 'buy') {
    // 買入：手續費是 0.1%
    return totalAmount * 0.001;
  } else if (type === 'sell') {
    // 賣出：手續費是 0.2%
    return totalAmount * 0.002;
  }
  return 0;
}

// 儲存交易紀錄到 LocalStorage
function saveTransaction() {
  const date = document.getElementById('date').value;
  const currency = document.getElementById('currency').value.toUpperCase(); // 自動轉為大寫
  const type = document.getElementById('type').value;
  const price = parseFloat(document.getElementById('price').value);
  const quantity = parseFloat(document.getElementById('quantity').value);
  const note = document.getElementById('note').value;

  if (!date || !currency || !type || isNaN(price) || isNaN(quantity) || !note) {
    alert('請填寫完整的交易資料');
    return;
  }

  // 計算手續費
  const fee = calculateTransactionFee(type, price, quantity);
  const amount = (price * quantity) - fee; // 扣除手續費後的金額

  const transaction = {
    date: date,
    currency: currency,
    type: type,
    price: price,
    quantity: quantity,
    fee: fee,
    amount: amount,
    note: note
  };

  // 儲存到 LocalStorage
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  transactions.push(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));

  // 更新交易紀錄顯示
  displayTransactions();
}

// 顯示交易紀錄
function displayTransactions() {
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  const transactionList = document.getElementById('transaction-list');
  transactionList.innerHTML = '';  // 清空現有的交易紀錄顯示

  transactions.forEach((transaction, index) => {
    const transactionElement = document.createElement('div');
    transactionElement.classList.add('transaction-item');
    transactionElement.innerHTML = `
      <span>${transaction.date}</span> 
      <span>${transaction.currency}</span> 
      <span>${transaction.type}</span> 
      <span>${transaction.price}</span> 
      <span>${transaction.quantity}</span> 
      <span>${transaction.fee.toFixed(2)}</span> 
      <span>${transaction.amount.toFixed(2)}</span> 
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
  displayTransactions();  // 更新顯示
}

// 頁面加載後初始化
window.onload = function() {
  displayTransactions();  // 顯示本地儲存的交易紀錄
};
