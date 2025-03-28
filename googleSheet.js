const GOOGLE_SHEET_API = "https://script.google.com/macros/s/AKfycbyNSNTIjAZkOxfBLvXUiILTA9syo4Yi-xcTux1xEQv4qDAHHVu9f04CGjES2Nlx-RgG/exec";

async function saveTransaction(data) {
    await fetch(GOOGLE_SHEET_API, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    });
}
