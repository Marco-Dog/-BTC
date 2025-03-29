document.addEventListener("DOMContentLoaded", function () {
    loadTransactions();
    fetchPrices();
    setInterval(fetchPrices, 10000);
    document.getElementById("transactionForm").addEventListener("submit", addTransaction);
    document.getElementById("exportCSV").addEventListener("click", exportToCSV);
    document.querySelectorAll(".tablink").forEach(button => {
        button.addEventListener("click", (event) => openTab(event, button.dataset.tab));
    });
});

let transactions = [];
let latestPrices = {
    BTC: 0, ETH: 0, ADA: 0, DOGE: 0, SHIB: 0
};

// 計算持倉
function calculateHoldings() {
    const holdings = {};
    transactions.forEach(tx => {
        if (!holdings[tx.currency]) {
            holdings[tx.currency] = { quantity: 0, cost: 0, profit: 0, returns: 0 };
        }
        const cost = tx.price * tx.quantity + tx.fee;
        if (tx.type === "buy") {
            holdings[tx.currency].quantity += tx.quantity;
            holdings[tx.currency].cost += cost;
        } else if (tx.type === "sell") {
            holdings[tx.currency].quantity -= tx.quantity;
            holdings[tx.currency].cost -= cost;
        }
        holdings[tx.currency].profit = (holdings[tx.currency].quantity * latestPrices[tx.currency]) - holdings[tx.currency].cost;
        holdings[tx.currency].returns = (holdings[tx.currency].profit / holdings[tx.currency].cost) * 100;
    });
    return holdings;
}

// 取得即時價格
function fetchPrices() {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,dogecoin,shiba-inu&vs_currencies=twd")
        .then(response => response.json())
        .then(data => {
            console.log("Fetched price data:", data); // 確保 API 回傳資料
            latestPrices = {
                BTC: data.bitcoin?.twd || 0,
                ETH: data.ethereum?.twd || 0,
                ADA: data.cardano?.twd || 0,
                DOGE: data.dogecoin?.twd || 0,
                SHIB: data["shiba-inu"]?.twd ? parseFloat(data["shiba-inu"].twd.toFixed(8)) : 0
            };
            console.log("Updated latestPrices:", latestPrices); // 確保變數更新
            updatePriceTable();
        })
        .catch(error => console.error("Error fetching prices:", error));
}

// 更新價格表格
function updatePriceTable() {
    const priceTable = document.getElementById("priceTable");
    priceTable.innerHTML = "";
    
    const holdings = calculateHoldings();
    let totalProfit = 0;
    let totalCost = 0;
    
    Object.keys(latestPrices).forEach(coin => {
        const price = latestPrices[coin];
        const data = holdings[coin] || { quantity: 0, cost: 0, profit: 0, returns: 0 };
        totalProfit += data.profit;
        totalCost += data.cost;
        const row = `<tr>
            <td>${coin}</td>
            <td>NT$ ${coin === 'SHIB' ? price.toFixed(10) : price.toFixed(2)}</td>
            <td>${data.quantity.toFixed(6)}</td>
            <td>NT$ ${data.cost.toFixed(3)}</td>
            <td class="profit">NT$ ${data.profit.toFixed(2)}</td>
            <td class="profit">${data.returns.toFixed(2)}%</td>
        </tr>`;
        priceTable.innerHTML += row;
    });
    
    const totalReturns = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    document.getElementById("totalProfit").textContent = `NT$ ${totalProfit.toFixed(2)}`;
    document.getElementById("totalReturns").textContent = `${totalReturns.toFixed(2)}%`;
}

// 新增交易
function addTransaction(event) {
    event.preventDefault();
    const date = document.getElementById("date").value;
    const currency = document.getElementById("currency").value;
    const type = document.getElementById("type").value;
    const price = parseFloat(document.getElementById("price").value);
    const quantity = parseFloat(document.getElementById("quantity").value);
    const note = document.getElementById("note").value;
    
    if (isNaN(price) || price <= 0 || isNaN(quantity) || quantity <= 0) {
        alert("請輸入有效的價格和數量！");
        return;
    }

    const fee = type === "buy" ? price * quantity * 0.001 : price * quantity * 0.002;
    
    transactions.push({ date, currency, type, price, quantity, fee, note });
    saveTransactions();
    renderTransactions();
    updatePriceTable();
    document.getElementById("transactionForm").reset();
}

// 渲染交易記錄
function renderTransactions() {
    const transactionTable = document.getElementById("transactionTable");
    transactionTable.innerHTML = "";
    
    transactions.forEach((tx, index) => {
        const row = `<tr>
            <td>${tx.date}</td>
            <td>${tx.currency}</td>
            <td>${tx.type}</td>
            <td>${tx.price.toFixed(6)}</td>
            <td>${tx.quantity.toFixed(6)}</td>
            <td>${tx.fee.toFixed(3)}</td>
            <td>${tx.note}</td>
            <td><button onclick="deleteRow(${index})">刪除</button></td>
        </tr>`;
        transactionTable.innerHTML += row;
    });
}

// 刪除交易
function deleteRow(index) {
    transactions.splice(index, 1);
    saveTransactions();
    renderTransactions();
    updatePriceTable();
}

// 儲存交易到 localStorage
function saveTransactions() {
    try {
        localStorage.setItem("transactions", JSON.stringify(transactions));
    } catch (error) {
        console.error("Error saving transactions to localStorage", error);
    }
}

// 載入交易記錄
function loadTransactions() {
    const savedTransactions = localStorage.getItem("transactions");
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    } else {
        // 預設初始交易數據
        transactions = [
            { date: "2025-03-28", currency: "BTC", type: "buy", price: 3025000.000000, quantity: 0.0025, fee: 7.563, note: "" },
            { date: "2025-03-28", currency: "DOGE", type: "buy", price: 12.210500, quantity: 165, fee: 2.015, note: "" },
            { date: "2025-03-28", currency: "DOGE", type: "buy", price: 11.000000, quantity: 500, fee: 5.500, note: "" },
            { date: "2025-03-28", currency: "DOGE", type: "buy", price: 7.700000, quantity: 100, fee: 0.770, note: "" },
            { date: "2025-03-28", currency: "DOGE", type: "buy", price: 7.500000, quantity: 1000, fee: 7.500, note: "" },
            { date: "2025-03-28", currency: "DOGE", type: "buy", price: 6.529900, quantity: 200, fee: 1.306, note: "" },
            { date: "2025-03-28", currency: "DOGE", type: "buy", price: 6.386500, quantity: 200, fee: 1.277, note: "" },
            { date: "2025-03-28", currency: "ADA", type: "buy", price: 33.350000, quantity: 300, fee: 10.005, note: "" },
            { date: "2025-03-28", currency: "DOGE", type: "buy", price: 8.007900, quantity: 660, fee: 5.285, note: "" },
            { date: "2025-03-28", currency: "ADA", type: "buy", price: 29.665000, quantity: 80, fee: 2.373, note: "" },
            { date: "2025-03-28", currency: "SHIB", type: "buy", price: 0.000724, quantity: 13793103, fee: 9.986, note: "" },
            { date: "2025-03-28", currency: "SHIB", type: "buy", price: 0.000698, quantity: 5730659, fee: 4.000, note: "" },
            { date: "2025-03-28", currency: "SHIB", type: "buy", price: 0.000673, quantity: 1800000, fee: 1.211, note: "" },
            { date: "2025-03-28", currency: "SHIB", type: "buy", price: 0.000576, quantity: 3000000, fee: 1.728, note: "" },
            { date: "2025-03-28", currency: "SHIB", type: "buy", price: 0.000511, quantity: 6000000, fee: 3.066, note: "" }
        ];
        saveTransactions();  // 儲存到 localStorage
    }
    renderTransactions();
    updatePriceTable();
}

// 切換標籤頁
function openTab(event, tabName) {
    document.querySelectorAll(".tabcontent").forEach(tab => {
        tab.style.display = "none";
    });
    document.getElementById(tabName).style.display = "block";
    document.querySelectorAll(".tablink").forEach(tab => {
        tab.classList.remove("active");
    });
    event.currentTarget.classList.add("active");
}

// 匯出 CSV
function exportToCSV() {
    let csvContent = "日期,幣種,類型,價格,數量,手續費,備註\n";
    transactions.forEach(tx => {
        csvContent += `${tx.date},${tx.currency},${tx.type},${tx.price},${tx.quantity},${tx.fee},${tx.note}\n`;
    });
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
