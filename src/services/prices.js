// Service prix basé sur Alpha Vantage -- leur API est gratuite pour notre aspect dividende
// Endpoint: https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=...
// ATTENTION Limites gratuites: ~5 requêtes/min, ~500/jour

const BASE = "https://www.alphavantage.co/query";
const KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;

// Alpha Vantage attend "AAPL", pas "NASDAQ:AAPL".
// On retire le préfixe d'échange s'il existe.
function toAlphaSymbol(symbol) {
  if (!symbol) return symbol;
  const s = String(symbol).trim();
  return s.includes(":") ? s.split(":")[1] : s;
}

async function fetchOne(symbolRaw) {
  const symbol = toAlphaSymbol(symbolRaw);
  const url = `${BASE}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  // Gestion rate limit / erreurs renvoyées par Alpha Vantage
  if (data?.Note) throw new Error("Alpha Vantage rate limit: " + data.Note);
  if (data?.Information) throw new Error("Alpha Vantage info: " + data.Information);

  // Structure: { "Global Quote": { "01. symbol": "...", "05. price": "...", ... } }
  const q = data?.["Global Quote"] || {};
  const price = q?.["05. price"] ? Number(q["05. price"]) : null;
  const prevClose = q?.["08. previous close"] ? Number(q["08. previous close"]) : null;

  let change = null, changePct = null;
  if (price != null && prevClose != null) {
    change = price - prevClose;
    changePct = prevClose ? (change / prevClose) * 100 : null;
  }

  return {
    current: price,
    change,
    changePct,
    prevClose,
    ts: Date.now(),
  };
}

/**
 * fetchQuotes(symbols: string[]) -> { [symbol]: { current, change, changePct, prevClose, ts } }
 * - Alpha Vantage est limité à ~5 req/min → on appelle en série.
 * - Pour >5 symboles, on renvoie quand même ce qui est dispo et on marque les autres en erreur “rate limit”.
 */
export async function fetchQuotes(symbols = []) {
  if (!KEY) throw new Error("VITE_ALPHA_VANTAGE_KEY manquante dans .env");

  const results = {};
  const MAX_PER_MINUTE = 5;

  const unique = [...new Set(symbols)].filter(Boolean);
  const firstBatch = unique.slice(0, MAX_PER_MINUTE);
  const overflow = unique.slice(MAX_PER_MINUTE);

  for (const s of firstBatch) {
    try {
      results[s] = await fetchOne(s);
    } catch (e) {
      results[s] = { error: String(e) };
    }
  }

  for (const s of overflow) {
    results[s] = { error: "Rate limit (Alpha Vantage gratuit: 5 requêtes/min)." };
  }

  return results;
}
