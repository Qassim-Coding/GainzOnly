// Service Finnhub - fetch de dividendes par symbole
// Docs Finnhub (mémoire): /stock/dividend?symbol=...&from=...&to=...
// Champs utiles retournés: date (ex-dividend), dividend (montant), paymentDate, currency

const BASE = "https://finnhub.io/api/v1";
const TOKEN = import.meta.env.VITE_FINNHUB_KEY;

// Util: YYYY-MM-DD
const iso = (d) => new Date(d).toISOString().slice(0, 10);

export async function fetchDividendsForSymbols(symbols, { fromDays = 0, toDays = 120 } = {}) {
  if (!TOKEN) {
    throw new Error("VITE_FINNHUB_KEY manquante. Ajoute ta clé dans .env.local");
  }

  const today = new Date();
  const from = iso(new Date(today.getTime() - fromDays * 86400000));
  const to   = iso(new Date(today.getTime() + toDays  * 86400000));

  const out = [];
  for (const s of symbols) {
    try {
      const url = `${BASE}/stock/dividend?symbol=${encodeURIComponent(s)}&from=${from}&to=${to}&token=${TOKEN}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json(); // tableau d'événements
      // Normalisation minimale
      for (const ev of data || []) {
        out.push({
          symbol: s,
          exDate: ev.date || null,
          payDate: ev.paymentDate || null,
          amount: typeof ev.dividend === "number" ? ev.dividend : null,
          currency: ev.currency || "",
          raw: ev,
        });
      }
    } catch (e) {
      // en cas d’erreur API, on push un marqueur (optionnel)
      out.push({
        symbol: s,
        error: true,
        message: String(e),
      });
    }
  }
  return out;
}

// Renvoie, pour chaque symbole, le prochain événement (exDate >= aujourd'hui) sinon le plus récent passé
export function pickNextOrLatestBySymbol(events) {
  const bySymbol = new Map();
  const todayStr = iso(new Date());
  for (const ev of events) {
    if (!ev || !ev.symbol || !ev.exDate) continue;
    const list = bySymbol.get(ev.symbol) || [];
    list.push(ev);
    bySymbol.set(ev.symbol, list);
  }
  const result = [];
  for (const [symbol, list] of bySymbol.entries()) {
    list.sort((a, b) => (a.exDate < b.exDate ? -1 : a.exDate > b.exDate ? 1 : 0));
    const upcoming = list.find((x) => x.exDate >= todayStr);
    result.push(upcoming || list[list.length - 1]); // si rien à venir, on garde le dernier connu
  }
  return result.filter(Boolean);
}
