# 读取用户上传的 app.js 文件内容
app_js_path = "/mnt/data/app.js"

with open(app_js_path, "r", encoding="utf-8") as file:
    app_js_content = file.read()

# 添加总持仓获利与总持仓报酬率计算及显示功能
update_script = """

function updateTotalHoldings() {
    const holdings = calculateHoldings();
    let totalCost = 0;
    let totalProfit = 0;

    Object.values(holdings).forEach(coin => {
        totalCost += coin.cost;
        totalProfit += coin.profit;
    });

    const totalReturns = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    // 确保 HTML 页面有这两个元素，否则不会更新
    if (document.getElementById("totalProfit") && document.getElementById("totalReturns")) {
        document.getElementById("totalProfit").innerText = `NT$ ${totalProfit.toFixed(2)}`;
        document.getElementById("totalReturns").innerText = `${totalReturns.toFixed(2)}%`;
    }
}

// 修改 updatePriceTable 让它调用 updateTotalHoldings
function updatePriceTable() {
    const priceTable = document.getElementById("priceTable");
    priceTable.innerHTML = "";
    
    const holdings = calculateHoldings();
    
    Object.keys(latestPrices).forEach(coin => {
        const price = latestPrices[coin];
        const data = holdings[coin] || { quantity: 0, cost: 0, profit: 0, returns: 0 };
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

    // 计算并更新总持仓数据
    updateTotalHoldings();
}

// 修改 renderTransactions 让它调用 updateTotalHoldings
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

    // 计算并更新总持仓数据
    updateTotalHoldings();
}

"""

# 在原始 app.js 末尾追加更新的代码
updated_app_js_content = app_js_content + update_script

# 生成新的 app.js 文件
updated_app_js_path = "/mnt/data/updated_app.js"

with open(updated_app_js_path, "w", encoding="utf-8") as file:
    file.write(updated_app_js_content)

# 返回更新后的文件路径
updated_app_js_path
