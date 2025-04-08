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
        const data = holdings[coin] || { quantity: 0, profit: 0 };

        card.querySelector(".price").textContent = `NT$ ${price.toFixed(coin === "SHIB" ? 6 : 2)}`;
        card.querySelector(".quantity").textContent = ` ${data.quantity.toFixed(coin === "BTC" ? 7 : 2)}`;
        card.querySelector(".profit").textContent = ` NT$ ${data.profit.toFixed(2)}`;
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

    // 💡 這行搬到這裡才有 totalValue 的值！
    document.getElementById("totalValue").textContent = `NT$ ${totalValue.toFixed(2)}`;

    const totalProfit = totalValue - totalCost;
    const totalROI = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    const profitSpan = document.getElementById("totalProfit");
    const roiSpan = document.getElementById("totalROI");

    profitSpan.textContent = `NT$ ${totalProfit < 0 ? '-' : ''}${Math.abs(totalProfit).toFixed(2)}`;
    roiSpan.textContent = `${totalROI < 0 ? '-' : ''}${Math.abs(totalROI).toFixed(2)}%`;

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
                <td>${tx.price.toFixed(6)}</td>
                <td>${tx.quantity.toFixed(6)}</td>
                <td>${tx.fee.toFixed(3)}</td>
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
        BTC: { quantity: 0, cost: 0, profit: 0 },
        ETH: { quantity: 0, cost: 0, profit: 0 },
        ADA: { quantity: 0, cost: 0, profit: 0 },
        DOGE: { quantity: 0, cost: 0, profit: 0 },
        SHIB: { quantity: 0, cost: 0, profit: 0 },
        SOL: { quantity: 0, cost: 0, profit: 0 }
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
