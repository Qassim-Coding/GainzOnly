// Service dividendes (auto-remplissage) via Alpha Vantage OVERVIEW
// GET https://www.alphavantage.co/query?function=OVERVIEW&symbol=MMM&apikey=...
// Champs utiles: DividendDate, ExDividendDate, DividendPerShare, DividendYield

const BASE = "https://www.alphavantage.co/query";
const KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;

function toAlphaSymbol(symbol) {
  if (!symbol) return symbol;
  const s = String(symbol).trim();
  return s.includes(":") ? s.split(":")[1] : s; // "NASDAQ:AAPL" -> "AAPL"
}

export async function fetchDividendOverview(symbolRaw) {
  if (!KEY) throw new Error("VITE_ALPHA_VANTAGE_KEY manquante dans .env");
  const symbol = toAlphaSymbol(symbolRaw);
  const url = `${BASE}?function=OVERVIEW&symbol=${encodeURIComponent(symbol)}&apikey=${KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  if (data?.Note) throw new Error("Alpha Vantage rate limit: " + data.Note);
  if (data?.Information) throw new Error("Alpha Vantage info: " + data.Information);

  if (!data || Object.keys(data).length === 0) {
    return { found: false };
  }

  const amount = data.DividendPerShare ? Number(data.DividendPerShare) : null;
  const yieldPct = data.DividendYield ? Number(data.DividendYield) : null; // décimal (ex: 0.024 = 2.4 %)
  const payDate = data.DividendDate || null;       // "YYYY-MM-DD"
  const exDate  = data.ExDividendDate || null;

  return {
    found: true,
    dividend: {
      amount: Number.isFinite(amount) ? amount : null,
      currency: "USD",   // AV ne donne pas la devise → défaut USD (US stocks)
      frequency: "",     // non fourni → à compléter manuellement (monthly/quarterly…)
      nextExDate: exDate,
      payDate: payDate,
    },
    dividendYield: Number.isFinite(yieldPct) ? yieldPct : null,
  };
}
