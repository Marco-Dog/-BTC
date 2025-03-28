const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwaAWEFQbS127UQbM96ZCioC7pRDbx9swiqdDzCz_irCaq5paa5z-EuR5YZ1gkx882L/exec'; // 您提供的 Google Sheets API URL

// 同步交易資料至 Google Sheets
async function syncWithGoogleSheets() {
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  
  // 轉換資料格式，以符合 Google Sheets 的要求
  const data = transactions.map(t => [
    t.date, t.currency, t.action, t.price, t.quantity, t.fee, t.note
  ]);

  // 傳送的參數
  const params = new URLSearchParams({
    action: 'update',
    data: JSON.stringify(data)
  });

  // 發送請求
  try {
    const response = await fetch(`${SHEET_URL}?${params.toString()}`, { method: 'GET' });
    const result = await response.json();
    console.log('Google Sheets Sync Result:', result);
  } catch (error) {
    console.error('Error syncing with Google Sheets:', error);
  }
}

// 同步功能自動執行（例如每次提交或更新時）
document.getElementById('transaction-form').addEventListener('submit', function(event) {
  event.preventDefault();
  syncWithGoogleSheets();  // 每次新增交易紀錄後同步
});
