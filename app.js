document.getElementById("transaction-form").addEventListener("submit", function(event) {
    event.preventDefault(); // 防止頁面重新整理

    const date = document.getElementById("date").value;
    const coin = document.getElementById("coin").value;
    const type = document.getElementById("type").value;
    const price = parseFloat(document.getElementById("price").value);
    const quantity = parseFloat(document.getElementById("quantity").value);
    const note = document.getElementById("note").value.trim();

    if (!date || !price || !quantity) {
        alert("請填寫完整的交易資訊！");
        return;
    }

    // 計算手續費
    const feeRate = type === "buy" ? 0.001 : 0.002;
    const fee = (price * quantity * feeRate).toFixed(8);

    // 建立交易物件
    const transaction = { date, coin, type, price, quantity, fee, note };

    // 儲存到 LocalStorage
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    transactions.push(transaction);
    localStorage.setItem("transactions", JSON.stringify(transactions));

    // 更新表格
    addTransactionToTable(transaction);

    // 同步到 Google Sheets
    saveTransaction(transaction);

    // 清空輸入框
    document.getElementById("transaction-form").reset();
});

function addTransactionToTable(transaction) {
    const table = document.getElementById("transactions-table");
    const row = table.insertRow();

    row.innerHTML = `
        <td>${transaction.date}</td>
        <td>${transaction.coin}</td>
        <td>${transaction.type === "buy" ? "買入" : "賣出"}</td>
        <td>${transaction.price.toFixed(2)}</td>
        <td>${transaction.quantity.toFixed(8)}</td>
        <td>${transaction.fee}</td>
        <td>${transaction.note}</td>
        <td><button onclick="deleteTransaction(this)">刪除</button></td>
    `;
}

function deleteTransaction(button) {
    const row = button.parentNode.parentNode;
    const index = row.rowIndex - 1; // 減去表頭
    row.remove();

    // 更新 LocalStorage
    let transactions = JSON.parse(localStorage.getItem("transactions"));
    transactions.splice(index, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function loadTransactions() {
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    transactions.forEach(addTransactionToTable);
}

// 初始化時載入交易紀錄
document.addEventListener("DOMContentLoaded", loadTransactions);
