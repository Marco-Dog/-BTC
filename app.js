<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>虛擬貨幣交易紀錄</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>虛擬貨幣交易紀錄</h1>

    <form id="record-form">
        <label>日期：<input type="date" id="date" required></label>
        <label>交易類型：
            <select id="type" required>
                <option value="buy">買入</option>
                <option value="sell">賣出</option>
            </select>
        </label>
        <label>金額：<input type="number" step="0.0001" id="amount" required></label>
        <label>價格：<input type="number" step="0.01" id="price" required></label>
        <label>備註：<input type="text" id="note"></label>
        <button type="submit">新增紀錄</button>
    </form>

    <h2>交易紀錄 (LocalStorage)</h2>
    <table id="local-table">
        <thead>
            <tr>
                <th>日期</th>
                <th>類型</th>
                <th>金額</th>
                <th>價格</th>
                <th>手續費</th>
                <th>備註</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>

    <script src="googleSheet.js"></script>
    <script src="app.js"></script>
</body>
</html>
