document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll(".tabs li");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));
            this.classList.add("active");
            document.getElementById(this.dataset.tab).classList.add("active");
        });
    });

    function fetchPrices() {
        fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,dogecoin,shiba-inu&vs_currencies=twd")
            .then(response => response.json())
            .then(data => {
                const priceTableBody = document.getElementById("priceTableBody");
                priceTableBody.innerHTML = "";
                const coins = {
                    BTC: "bitcoin",
                    ETH: "ethereum",
                    ADA: "cardano",
                    DOGE: "dogecoin",
                    SHIB: "shiba-inu"
                };
                Object.keys(coins).forEach(coin => {
                    const price = data[coins[coin]].twd;
                    const row = `<tr>
                        <td>${coin}</td>
                        <td>NT$ ${price.toLocaleString()}</td>
                        <td>--</td>
                        <td>--</td>
                        <td class="profit">--</td>
                        <td class="profit-rate">--</td>
                    </tr>`;
                    priceTableBody.innerHTML += row;
                });
            });
    }
    setInterval(fetchPrices, 10000);
    fetchPrices();
});
