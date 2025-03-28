// googleSheet.js

const API_WEB = "https://script.google.com/macros/s/AKfycbwjCga1UhtAzY5uPBxt49kkCWMCrDHN7Esd-Tz53Fw/dev";

// 新增資料至 Google Sheet
async function addGoogleSheetRecord(record) {
    try {
        const response = await fetch(API_WEB, {
            method: "POST",
            body: JSON.stringify(record),
            headers: { "Content-Type": "application/json" }
        });
        const result = await response.json();
        console.log("資料已新增至 Google Sheet", result);
    } catch (error) {
        console.error("Google Sheet 新增失敗", error);
    }
}
