const API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,dogecoin,shiba-inu&vs_currencies=twd";
const coinMap = { BTC: "bitcoin", ETH: "ethereum", ADA: "cardano", DOGE: "dogecoin", SHIB: "shiba-inu" };

async function fetchPrices() {
    const response = await fetch(API_URL);
    const data = await response.json();
    updatePrices(data);
}

function updatePrices(data) {
    const table = document.getElementById("prices-table");
    table.innerHTML = "";
    Object.entries(coinMap).forEach(([symbol, apiName]) => {
        const price = data[apiName].twd.toFixed(symbol === "SHIB" ? 8 : 2);
        table.innerHTML += `<tr>
            <td>${symbol}</td>
            <td>NT$ ${price}</td>
            <td>--</td>
            <td>--</td>
            <td class="positive">-- ↑</td>
            <td class="positive">-- ↑</td>
        </tr>`;
    });
}

setInterval(fetchPrices, 10000);
fetchPrices();
