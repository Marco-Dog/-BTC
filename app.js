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
            renderTransactions(); // 在這裡 render 交易資料
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
        const currentPrice = latestPrices[tx.currency] || 0;
        const currentValue = currentPrice * tx.quantity;
        const cost = tx.price * tx.quantity + tx.fee;
        const profit = currentValue - cost;
        const roi = cost > 0 ? (profit / cost) * 100 : 0;

        const profitClass = profit >= 0 ? "positive" : "negative";
        const roiClass = roi >= 0 ? "positive" : "negative";

        table.innerHTML += `
            <tr>
                <td>${tx.date}</td>
                <td>${tx.currency}</td>
                <td>${tx.type}</td>
                <td>${formatNumber(tx.price, tx.currency, "price")}</td>
                <td>${formatNumber(tx.quantity, tx.currency, "holding")}</td>
                <td>${formatNumber(tx.fee, "default")}</td>
                <td class="${profitClass}">NT$ ${formatNumber(profit, "default")}</td>
                <td class="${roiClass}">${formatNumber(roi, "default")}%</td>
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
    // 不在這裡呼叫 renderTransactions，等價格載入後再渲染
}

function calculateHoldings() {
    const holdings = {
        BTC: { quantity: 0, cost: 0, profit: 0, roi: 0, realized: 0 },
        ETH: { quantity: 0, cost: 0, profit: 0, roi: 0, realized: 0 },
        ADA: { quantity: 0, cost: 0, profit: 0, roi: 0, realized: 0 },
        DOGE: { quantity: 0, cost: 0, profit: 0, roi: 0, realized: 0 },
        SHIB: { quantity: 0, cost: 0, profit: 0, roi: 0, realized: 0 },
        SOL: { quantity: 0, cost: 0, profit: 0, roi: 0, realized: 0 }
    };

    transactions.forEach(tx => {
        const h = holdings[tx.currency];
        if (!h) return;

        if (tx.type === "buy") {
            h.quantity += tx.quantity;
            h.cost += tx.price * tx.quantity + tx.fee;
        } else if (tx.type === "sell") {
            const avgCost = h.quantity > 0 ? h.cost / h.quantity : 0;
            const sellCost = avgCost * tx.quantity;
            const revenue = tx.price * tx.quantity;
            const realizedProfit = revenue - sellCost - tx.fee;

            h.quantity -= tx.quantity;
            h.cost -= sellCost;
            h.realized += realizedProfit;
        }
    });

    for (const coin in holdings) {
        const h = holdings[coin];
        const marketValue = h.quantity * latestPrices[coin];
        const unrealized = marketValue - h.cost;
        h.profit = unrealized + h.realized
        h.roi = h.cost > 0 ? ((h.profit / h.cost) * 100).toFixed(2) : "0";
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
