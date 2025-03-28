// Google Sheets 更新功能
function updateGoogleSheets(transaction = null) {
  const url = "https://script.google.com/macros/s/AKfycbwaAWEFQbS127UQbM96ZCioC7pRDbx9swiqdDzCz_irCaq5paa5z-EuR5YZ1gkx882L/exec";

  // 如果傳入交易紀錄，則將其新增至 Google Sheets
  if (transaction) {
    const params = new URLSearchParams({
      action: 'addTransaction',
      date: transaction.date,
      currency: transaction.currency,
      type: transaction.type,
      price: transaction.price,
      quantity: transaction.quantity,
      fee: transaction.fee,
      amount: transaction.amount,
      note: transaction.note
    });

    fetch(url + `?${params.toString()}`)
      .then(response => response.json())
      .then(data => {
        console.log("Transaction added to Google Sheets:", data);
      })
      .catch(error => {
        console.error("Error updating Google Sheets:", error);
      });
  } else {
    console.log("No transaction to update.");
  }
}
