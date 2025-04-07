document.addEventListener("DOMContentLoaded", function () {
    loadTransactions();
    fetchPrices();
    setInterval(fetchPrices, 10000);
    document.getElementById("transactionForm").addEventListener("submit", addTransaction);
    document.querySelectorAll(".tablink").forEach(button => {
        button.addEventListener("click", (event) => openTab(event, button.getAttribute("onclick").split("('")[1].split("')")[0]));
    });
});

let transactions = [];
let latestPrices = {
    BTC: 0,
    ETH: 0,
    ADA: 0,
    DOGE: 0,
    SHIB: 0,
    SOL: 0
};

function fetchPrices() {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,dogecoin,shiba-inu&vs_currencies=twd")
        .then(response => response.json())
        .then(data => {
            latestPrices = {
                BTC: data.bitcoin.twd,
                ETH: data.ethereum.twd,
                ADA: data.cardano.twd,
                DOGE: data.dogecoin.twd,
                SHIB: parseFloat(data["shiba-inu"].twd.toFixed(8)),
                SOL: data.solana.twd,
            };
            updatePriceTable();
        })
        .catch(error => console.error("Error fetching prices:", error));
}

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

    // 計算總持倉獲利與報酬率
    const totalReturns = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    document.getElementById("totalStats").innerHTML = `
        總持倉獲利：NT$ ${totalProfit.toFixed(2)}  
        總持倉報酬率：${totalReturns.toFixed(2)}%
    `;
}

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

function deleteRow(index) {
    transactions.splice(index, 1);
    saveTransactions();
    renderTransactions();
    updatePriceTable();
}

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function loadTransactions() {
    const savedTransactions = localStorage.getItem("transactions");

    // 如果本地無資料，則設置初始交易紀錄
    if (!savedTransactions) {
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
        saveTransactions();
    } else {
        transactions = JSON.parse(savedTransactions);
    }

    renderTransactions();
    updatePriceTable();
}

function calculateHoldings() {
    let holdings = {
        BTC: { quantity: 0, cost: 0, profit: 0, returns: 0 },
        ETH: { quantity: 0, cost: 0, profit: 0, returns: 0 },
        ADA: { quantity: 0, cost: 0, profit: 0, returns: 0 },
        DOGE: { quantity: 0, cost: 0, profit: 0, returns: 0 },
        SHIB: { quantity: 0, cost: 0, profit: 0, returns: 0 }
    };
    
    transactions.forEach(tx => {
        if (!holdings[tx.currency]) {
            holdings[tx.currency] = { quantity: 0, cost: 0, profit: 0, returns: 0 };
        }
        if (tx.type === "buy") {
            holdings[tx.currency].cost += tx.price * tx.quantity + tx.fee;
            holdings[tx.currency].quantity += tx.quantity;
        } else {
            holdings[tx.currency].cost -= (tx.price * tx.quantity - tx.fee);
            holdings[tx.currency].quantity -= tx.quantity;
        }
    });
    
    for (const coin in holdings) {
        const currentPrice = latestPrices[coin] || 0;
        const cost = holdings[coin].cost;
        const quantity = holdings[coin].quantity;
        const marketValue = quantity * currentPrice;
        const profit = marketValue - cost;
        const returns = cost > 0 ? (profit / cost) * 100 : 0;
        holdings[coin] = { quantity, cost, profit, returns };
    }
    return holdings;
}

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
