// 記錄前一次報價
let previousPrices = {};

// 幣種清單
const cryptoList = [
    { id: "btc", name: "BTC", icon: "https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg", apiId: "bitcoin" },
    { id: "eth", name: "ETH", icon: "https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg", apiId: "ethereum" },
    { id: "doge", name: "DOGE", icon: "https://upload.wikimedia.org/wikipedia/en/d/d0/Dogecoin_Logo.png", apiId: "dogecoin" },
    { id: "ada", name: "ADA", icon: "https://cryptologos.cc/logos/cardano-ada-logo.png", apiId: "cardano" },
    { id: "shib", name: "SHIB", icon: "https://cryptologos.cc/logos/shiba-inu-shib-logo.png", apiId: "shiba-inu" }
];

// 儲存交易紀錄
let tradeHistory = JSON.parse(localStorage.getItem("tradeHistory")) || [];

// 動態生成 crypto-box
function generateCryptoBoxes() {
    const container = document.getElementById("crypto-container");
    container.innerHTML = ""; // 清空現有內容

    cryptoList.forEach(crypto => {
        container.innerHTML += `
            <div class="crypto-box">
                <h1 class="title">
                    <img src="${crypto.icon}" alt="${crypto.name}圖案" class="icon">
                    ${crypto.name}
                </h1>
                <div class="crypto-prices">
                    <p class="crypto-item" id="${crypto.id}-price">NT<span>$0.00</span></p>
                    <p class="crypto-holdings" id="${crypto.id}-holdings">持倉數量: 0</p>
                    <p class="crypto-profit" id="${crypto.id}-profit">持倉獲利: NT$ 0.00</p>
                </div>
            </div>
        `;

        // 初始化前一次報價
        previousPrices[crypto.apiId] = 0;
    });
}

// 從 CoinGecko API 抓取即時報價
async function fetchCryptoPrices() {
    try {
        const apiIds = cryptoList.map(crypto => crypto.apiId).join(",");
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${apiIds}&vs_currencies=twd`
        );
        const data = await response.json();

        cryptoList.forEach(crypto => {
            const currentPrice = data[crypto.apiId]?.twd || 0;
            updatePriceDisplay(`${crypto.id}-price`, currentPrice, previousPrices[crypto.apiId]);
            previousPrices[crypto.apiId] = currentPrice;
        });
        updateHoldingsAndProfit();
    } catch (error) {
        console.error("獲取報價失敗", error);
    }
}

// 計算並更新持倉數量和獲利
function updateHoldingsAndProfit() {
    let holdings = {};
    let totalCost = {};
    let totalQuantity = {};

    tradeHistory.forEach(trade => {
        if (!holdings[trade.currency]) {
            holdings[trade.currency] = 0;
            totalCost[trade.currency] = 0;
            totalQuantity[trade.currency] = 0;
        }
        if (trade.type === "BUY") {
            holdings[trade.currency] += trade.quantity;
            totalCost[trade.currency] += trade.price * trade.quantity;
            totalQuantity[trade.currency] += trade.quantity;
        } else if (trade.type === "SELL") {
            holdings[trade.currency] -= trade.quantity;
            totalCost[trade.currency] -= trade.price * trade.quantity;
            totalQuantity[trade.currency] -= trade.quantity;
        }
    });

    cryptoList.forEach(crypto => {
        const holdingElement = document.getElementById(`${crypto.id}-holdings`);
        const profitElement = document.getElementById(`${crypto.id}-profit`);
        const currentPrice = previousPrices[crypto.apiId] || 0;
        const quantity = holdings[crypto.name] || 0;
        const averageCost = totalQuantity[crypto.name] ? totalCost[crypto.name] / totalQuantity[crypto.name] : 0;
        const profit = (currentPrice - averageCost) * quantity;

        holdingElement.textContent = `持倉數量: ${quantity.toFixed(6)}`;
        profitElement.textContent = `持倉獲利: NT$ ${profit.toFixed(2)}`;
    });
}

// 更新價格顯示
function updatePriceDisplay(elementId, currentPrice, previousPrice) {
    const priceElement = document.getElementById(elementId).querySelector("span");
    const decimalPlaces = elementId === "shib-price" ? 8 : 2;
    const formattedPrice = currentPrice.toFixed(decimalPlaces).toLocaleString();
    priceElement.textContent = `\$${formattedPrice}`;
    priceElement.classList.remove("up", "down");
    if (currentPrice > previousPrice) priceElement.classList.add("up");
    if (currentPrice < previousPrice) priceElement.classList.add("down");
}

// 每 10 秒更新一次報價
generateCryptoBoxes(); // 初次載入
fetchCryptoPrices(); // 初次載入即時報價
setInterval(fetchCryptoPrices, 10000);

// 交易處理
document.getElementById("transactionForm").addEventListener("submit", function(event) {
    event.preventDefault();
    handleTrade();
});

// 交易處理
function handleTrade() {
    const date = document.getElementById("date").value;
    const currency = document.getElementById("currency").value;
    const type = document.getElementById("type").value;
    const price = parseFloat(document.getElementById("price").value);
    const quantity = parseFloat(document.getElementById("quantity").value);
    const note = document.getElementById("note").value;

    if (!date || isNaN(price) || isNaN(quantity) || quantity <= 0 || price <= 0) {
        alert("請輸入有效的交易資料");
        return;
    }
    addTradeRecord(date, currency, type, price, quantity, note);
    document.getElementById("transactionForm").reset();
    updateHoldingsAndProfit();
}

// 新增交易紀錄
function addTradeRecord(date, currency, type, price, quantity, note) {
    const trade = { date, currency, type, price, quantity, note };
    tradeHistory.push(trade);
    localStorage.setItem("tradeHistory", JSON.stringify(tradeHistory));
    updateTradeTable();
}

// 更新交易表格
function updateTradeTable() {
    const tableBody = document.getElementById("transactionTable");
    tableBody.innerHTML = ""; // 清空現有表格內容

    tradeHistory.forEach((trade, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${trade.date}</td>
            <td>${trade.currency}</td>
            <td>${trade.type}</td>
            <td>${trade.price}</td>
            <td>${trade.quantity}</td>
            <td>${(trade.price * trade.quantity * 0.001).toFixed(2)}</td>
            <td>${trade.note}</td>
            <td><button onclick="deleteTransaction(${index})">刪除</button></td>
        `;
        tableBody.appendChild(row);
    });
}

// 修正刪除交易函式
function deleteTransaction(index) {
    // 刪除指定索引的交易紀錄
    tradeHistory.splice(index, 1);
    localStorage.setItem("tradeHistory", JSON.stringify(tradeHistory)); // 更新 localStorage
    updateTradeTable(); // 更新顯示
    updateHoldingsAndProfit(); // 更新獲利
}

// 切換頁籤的函式
function switchTab(tabId) {
    // 先隱藏所有頁籤
    const tabs = document.getElementsByClassName("tabcontent");
    for (let tab of tabs) {
        tab.style.display = "none";
    }

    // 顯示所選的頁籤
    const activeTab = document.getElementById(tabId);
    activeTab.style.display = "block";

    // 更新按鈕的 "active" 狀態
    const buttons = document.getElementsByClassName("tab-button");
    for (let button of buttons) {
        button.classList.remove("active");
    }

    // 為當前按鈕添加 "active" 類別
    const activeButton = document.querySelector(`button[onclick="switchTab('${tabId}')"]`);
    activeButton.classList.add("active");
}

// 初始化頁面
generateCryptoBoxes(); // 初次載入
fetchCryptoPrices(); // 初次抓取報價
updateTradeTable(); // ✅ 確保表格顯示資料
setInterval(fetchCryptoPrices, 10000); // 定時更新報價
