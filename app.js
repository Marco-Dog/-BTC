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

    // 預設顯示第一個頁籤
    document.querySelector(".tablink").click();
});

let transactions = [];
let latestPrices = {
    BTC: 0, ETH: 0, ADA: 0, DOGE: 0, SHIB: 0, SOL: 0
};

// 格式化數字，添加千位分隔符並設置小數點位數
function formatNumber(number, coin = "default") {
    if (isNaN(number)) return "0";

    let decimals;
    switch (coin) {
        case "BTC":
            decimals = 6;
            break;
        case "SHIB":
            decimals = 6;
            break;
        case "SOL":
            decimals = 3;
            break;
        default:
            decimals = 2;
    }

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

        // 更新卡片顯示
        card.querySelector(".price").textContent = `NT$ ${formatNumber(price)}`;
        card.querySelector(".quantity").textContent = ` ${formatNumber(data.quantity)}`;
        card.querySelector(".profit").textContent = ` NT$ ${formatNumber(data.profit)}`;
        card.querySelector(".roi").textContent = `${data.roi}%`;  // 顯示報酬率
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

    document.getElementById("totalValue").textContent = `NT$ ${formatNumber(totalValue, 2)}`;

    const totalProfit = totalValue - totalCost;
    const totalROI = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    const profitSpan = document.getElementById("totalProfit");
    const roiSpan = document.getElementById("totalROI");

    profitSpan.textContent = `NT$ ${formatNumber(totalProfit, 2)}`;
    roiSpan.textContent = `${formatNumber(totalROI, 2)}%`;

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
                <td>${formatNumber(tx.price, 6)}</td>
                <td>${formatNumber(tx.quantity, 6)}</td>
                <td>${formatNumber(tx.fee, 3)}</td>
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
        renderTransactions();
    }
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
        // 計算報酬率
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
