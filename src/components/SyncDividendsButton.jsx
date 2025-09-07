import React, { useState } from "react";
import { fetchDividendOverview } from "../services/dividends";

/**
 * props:
 * - positions: tableau d'actions (avec .symbol, etc.)
 * - onMerge: (mergedPositions) => void  // callback pour remplacer la liste
 */
export default function SyncDividendsButton({ positions = [], onMerge }) {
  const [loading, setLoading] = useState(false);
  const [lastMsg, setLastMsg] = useState("");

  async function handleSync() {
    if (!positions.length) return;
    setLoading(true);
    setLastMsg("");

    const merged = [];
    for (const p of positions) {
      try {
        const info = await fetchDividendOverview(p.symbol);
        if (info.found) {
          merged.push({
            ...p,
            dividend: { ...(p.dividend || {}), ...(info.dividend || {}) },
            dividendYield: info.dividendYield ?? p.dividendYield,
          });
        } else {
          merged.push(p);
        }
      } catch (_) {
        merged.push(p);
      }
    }

    onMerge(merged);
    setLoading(false);
    setLastMsg("Dividendes synchronisés (si disponibles).");
  }

  return (
    <div className="flex items-center gap-3">
      <button
        disabled={loading}
        onClick={handleSync}
        className={`px-3 py-2 rounded-lg border ${
          loading
            ? "bg-neutral-700 border-neutral-600 cursor-not-allowed"
            : "bg-teal-600 border-teal-500 hover:bg-teal-500"
        }`}
      >
        {loading ? "Sync…" : "Sync Dividendes (Alpha Vantage)"}
      </button>
      {lastMsg && <span className="text-sm text-neutral-300">{lastMsg}</span>}
    </div>
  );
}
