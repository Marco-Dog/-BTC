// ✅ 整合幣別小數點控制邏輯 + 原有功能

document.addEventListener("DOMContentLoaded", function () {
    loadTransactions();
    fetchPrices();
    setInterval(fetchPrices, 10000);

    document.getElementById("transactionForm").addEventListener("submit", addTransaction);
    document.getElementById("sortOption").addEventListener("change", function () {
        renderTransactions(this.value);
    });

    document.querySelectorAll(".tablink").forEach(button => {
        button.addEventListener("click", (event) => {
            const tabName = button.dataset.tab;
            openTab(event, tabName);
        });
    });

    document.querySelector(".tablink").click(); // 預設點擊第一個頁籤
});

let transactions = [];
let latestPrices = {
    BTC: 0, ETH: 0, ADA: 0, DOGE: 0, SHIB: 0, SOL: 0
};

const coinDisplaySettings = {
    BTC: { priceDecimals: 2, holdingDecimals: 4 },
    ETH: { priceDecimals: 2, holdingDecimals: 2 },
    ADA: { priceDecimals: 2, holdingDecimals: 2 },
    DOGE: { priceDecimals: 2, holdingDecimals: 2 },
    SHIB: { priceDecimals: 6, holdingDecimals: 2 },
    SOL: { priceDecimals: 3, holdingDecimals: 3 },
    default: { priceDecimals: 2, holdingDecimals: 2 }
};

function formatNumber(number, coin = "default", type = "price") {
    if (isNaN(number)) return "0";

    const settings = coinDisplaySettings[coin] || coinDisplaySettings["default"];
    const decimals = type === "price" ? settings.priceDecimals : settings.holdingDecimals;

    return number.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function fetchPrices() {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,dogecoin,solana,shiba-inu&vs_currencies=twd")
        .then(res => res.json())
        .then(data => {
            latestPrices = {
                BTC: data.bitcoin.twd,
                ETH: data.ethereum.twd,
                ADA: data.cardano.twd,
                DOGE: data.dogecoin.twd,
                SHIB: parseFloat(data["shiba-inu"].twd.toFixed(8)),
                SOL: data.solana.twd
            };
            updateCardDisplay();
        })
        .catch(err => console.error("取得價格錯誤:", err));
}

function updateCardDisplay() {
    const holdings = calculateHoldings();

    Object.keys(latestPrices).forEach(coin => {
        const card = document.querySelector(`#card-${coin}`);
        if (!card) return;

        const price = latestPrices[coin];
        const data = holdings[coin] || { quantity: 0, profit: 0, roi: 0 };

        card.querySelector(".price").textContent = `NT$ ${formatNumber(price, coin, "price")}`;
        card.querySelector(".quantity").textContent = ` ${formatNumber(data.quantity, coin, "holding")}`;
        card.querySelector(".profit").textContent = ` NT$ ${formatNumber(data.profit)}`;
        card.querySelector(".roi").textContent = `${data.roi}%`;
    });

    updateTotalStats();
}

function updateTotalStats() {
    const holdings = calculateHoldings();
    let totalCost = 0, totalValue = 0;

    for (const coin in holdings) {
        const { quantity, cost } = holdings[coin];
        totalCost += cost;
        totalValue += quantity * latestPrices[coin];
    }

    document.getElementById("totalValue").textContent = `NT$ ${formatNumber(totalValue, "default")}`;

    const totalProfit = totalValue - totalCost;
    const totalROI = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    const profitSpan = document.getElementById("totalProfit");
    const roiSpan = document.getElementById("totalROI");

    profitSpan.textContent = `NT$ ${formatNumber(totalProfit, "default")}`;
    roiSpan.textContent = `${formatNumber(totalROI, "default")}%`;

    profitSpan.className = totalProfit >= 0 ? "positive" : "negative";
    roiSpan.className = totalROI >= 0 ? "positive" : "negative";
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

    const feeRate = type === "buy" ? 0.001 : 0.002;
    const fee = price * quantity * feeRate;

    transactions.push({ date, currency, type, price, quantity, fee, note });
    saveTransactions();
    renderTransactions();
    updateCardDisplay();
    document.getElementById("transactionForm").reset();
}

function renderTransactions(sortBy = "date") {
    const table = document.getElementById("transactionTable");
    table.innerHTML = "";

    transactions.sort((a, b) => {
        if (sortBy === "date") return new Date(a.date) - new Date(b.date);
        if (sortBy === "currency") return a.currency.localeCompare(b.currency);
        if (sortBy === "profit") return calculateProfit(a) - calculateProfit(b);
        return 0;
    });

    transactions.forEach((tx, index) => {
        table.innerHTML += `
            <tr>
                <td>${tx.date}</td>
                <td>${tx.currency}</td>
                <td>${tx.type}</td>
                <td>${formatNumber(tx.price, tx.currency, "price")}</td>
                <td>${formatNumber(tx.quantity, tx.currency, "holding")}</td>
                <td>${formatNumber(tx.fee, "default")}</td>
                <td>${tx.note}</td>
                <td><button class="delete-btn" onclick="deleteRow(${index})">刪除</button></td>
            </tr>`;
    });
}

function deleteRow(index) {
    transactions.splice(index, 1);
    saveTransactions();
    renderTransactions();
    updateCardDisplay();
}

function calculateProfit(tx) {
    return tx.price * tx.quantity - tx.fee;
}

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function loadTransactions() {
    const saved = localStorage.getItem("transactions");
    if (saved) {
        transactions = JSON.parse(saved);
    } else {
transactions = [
    { date: "2025-03-28", currency: "BTC", type: "buy", price: 3025000.00, quantity: 0.0025, fee: 7.56, note: "" },
    { date: "2025-03-28", currency: "DOGE", type: "buy", price: 12.21, quantity: 165, fee: 2.02, note: "" },
    { date: "2025-03-28", currency: "DOGE", type: "buy", price: 11, quantity: 500, fee: 5.5, note: "" },
    { date: "2025-03-28", currency: "DOGE", type: "buy", price: 7.7, quantity: 100, fee: 0.77, note: "" },
    { date: "2025-03-28", currency: "DOGE", type: "buy", price: 7.5, quantity: 1000, fee: 7.5, note: "" },
    { date: "2025-03-28", currency: "DOGE", type: "buy", price: 6.53, quantity: 200, fee: 1.31, note: "" },
    { date: "2025-03-28", currency: "DOGE", type: "buy", price: 6.39, quantity: 200, fee: 1.28, note: "" },
    { date: "2025-03-28", currency: "ADA", type: "buy", price: 33.35, quantity: 300, fee: 10.01, note: "" },
    { date: "2025-03-28", currency: "DOGE", type: "buy", price: 8.01, quantity: 660, fee: 5.29, note: "" },
    { date: "2025-03-28", currency: "ADA", type: "buy", price: 29.67, quantity: 80, fee: 2.37, note: "" },
    { date: "2025-03-28", currency: "SHIB", type: "buy", price: 0.000724, quantity: 13793103, fee: 9.99, note: "" },
    { date: "2025-03-28", currency: "SHIB", type: "buy", price: 0.000698, quantity: 5730659, fee: 4, note: "" },
    { date: "2025-03-28", currency: "SHIB", type: "buy", price: 0.000673, quantity: 1800000, fee: 1.21, note: "" },
    { date: "2025-03-28", currency: "SHIB", type: "buy", price: 0.000576, quantity: 3000000, fee: 1.73, note: "" },
    { date: "2025-03-28", currency: "SHIB", type: "buy", price: 0.000511, quantity: 6000000, fee: 3.07, note: "" }
        ];
        saveTransactions(); // 儲存初始資料到 localStorage
    }
    renderTransactions();
}


function calculateHoldings() {
    const holdings = {
        BTC: { quantity: 0, cost: 0, profit: 0, roi: 0 },
        ETH: { quantity: 0, cost: 0, profit: 0, roi: 0 },
        ADA: { quantity: 0, cost: 0, profit: 0, roi: 0 },
        DOGE: { quantity: 0, cost: 0, profit: 0, roi: 0 },
        SHIB: { quantity: 0, cost: 0, profit: 0, roi: 0 },
        SOL: { quantity: 0, cost: 0, profit: 0, roi: 0 }
    };

    transactions.forEach(tx => {
        if (!holdings[tx.currency]) return;
        const h = holdings[tx.currency];

        if (tx.type === "buy") {
            h.quantity += tx.quantity;
            h.cost += tx.price * tx.quantity + tx.fee;
        } else {
            h.quantity -= tx.quantity;
            h.cost -= tx.price * tx.quantity + tx.fee;
        }
    });

    for (const coin in holdings) {
        const h = holdings[coin];
        h.profit = h.quantity > 0 ? h.quantity * latestPrices[coin] - h.cost : 0;
        h.roi = h.cost > 0 ? ((h.profit / h.cost) * 100).toFixed(2) : 0;
    }

    return holdings;
}

function openTab(evt, tabName) {
    document.querySelectorAll(".tabcontent").forEach(tab => {
        tab.style.display = "none";
    });

    document.querySelectorAll(".tablink").forEach(btn => {
        btn.classList.remove("active");
    });

    const selectedTab = document.getElementById(tabName);
    if (selectedTab) selectedTab.style.display = "block";

    evt.currentTarget.classList.add("active");
}
