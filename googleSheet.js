const API_URL = "https://script.google.com/macros/s/AKfycbwaAWEFQbS127UQbM96ZCioC7pRDbx9swiqdDzCz_irCaq5paa5z-EuR5YZ1gkx882L/exec";

document.getElementById("transactionForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const date = document.getElementById("date").value;
    const crypto = document.getElementById("crypto").value;
    const type = document.getElementById("type").value;
    const price = parseFloat(document.getElementById("price").value);
    const quantity = parseFloat(document.getElementById("quantity").value);
    const note = document.getElementById("note").value;
    const feeRate = type === "buy" ? 0.001 : 0.002;
    const fee = price * quantity * feeRate;
    
    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ date, crypto, type, price, quantity, fee, note })
    }).then(response => response.json())
      .then(data => {
          alert("交易已儲存");
          loadTransactions();
      });
});

function loadTransactions() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            const transactionTableBody = document.getElementById("transactionTableBody");
            transactionTableBody.innerHTML = "";
            data.forEach(row => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${row.date}</td>
                    <td>${row.crypto}</td>
                    <td>${row.type}</td>
                    <td>${row.price}</td>
                    <td>${row.quantity}</td>
                    <td>${row.fee}</td>
                    <td>${row.note}</td>
                    <td><button onclick="deleteTransaction('${row.id}')">刪除</button></td>
                `;
                transactionTableBody.appendChild(tr);
            });
        });
}

function deleteTransaction(id) {
    fetch(API_URL, {
        method: "DELETE",
        body: JSON.stringify({ id })
    }).then(response => response.json())
      .then(data => {
          alert("交易已刪除");
          loadTransactions();
      });
}

loadTransactions();
