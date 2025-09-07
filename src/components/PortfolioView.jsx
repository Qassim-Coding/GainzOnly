import React, { useEffect, useMemo, useState } from "react";
import { fetchQuotes } from "../services/prices";
import SyncDividendsButton from "./SyncDividendsButton";
import { IoMdBrush } from "react-icons/io";

/**
 * positions = [
 *   { symbol: "NYSE:O" | "AAPL" | "NASDAQ:NVDA", name, sector, qty, avgPrice } utilisée par défaut ici
 * ]
 */
export default function PortfolioView({ positions = [], setPositions }) {
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const symbols = useMemo(
    () => [...new Set((positions || []).map((p) => p?.symbol).filter(Boolean))],
    [positions]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (symbols.length === 0) {
        setQuotes({});
        setFetchError(null);
        return;
      }
      try {
        setLoading(true);
        setFetchError(null);
        const data = await fetchQuotes(symbols);
        if (!cancelled) setQuotes(data || {});
      } catch (e) {
        if (!cancelled) setFetchError(String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [symbols]);

  const rows = useMemo(() => {
    return (positions || []).map((p) => {
      const q = quotes[p.symbol] || {};
      const current = typeof q.current === "number" ? q.current : null;
      const qty = typeof p.qty === "number" ? p.qty : 0;
      const avgPrice = typeof p.avgPrice === "number" ? p.avgPrice : 0;

      const marketValue = current != null ? current * qty : null;
      const costBasis = avgPrice != null ? avgPrice * qty : null;

      const pl = marketValue != null && costBasis != null ? marketValue - costBasis : null;
      const plPct = pl != null && costBasis ? (pl / costBasis) * 100 : null;

      const status = q?.error ? "Erreur" : current != null ? "OK" : "…";

      return { ...p, current, marketValue, costBasis, pl, plPct, status };
    });
  }, [positions, quotes]);

  const totalValue = useMemo(
    () => rows.reduce((a, r) => a + (typeof r.marketValue === "number" ? r.marketValue : 0), 0),
    [rows]
  );
  const totalCost = useMemo(
    () => rows.reduce((a, r) => a + (typeof r.costBasis === "number" ? r.costBasis : 0), 0),
    [rows]
  );
  const totalPL = useMemo(() => (totalValue && totalCost ? totalValue - totalCost : null), [totalValue, totalCost]);
  const totalPLPct = useMemo(() => (totalPL != null && totalCost ? (totalPL / totalCost) * 100 : null), [totalPL, totalCost]);

  function handleEditPosition(sym) {
    const target = positions.find((p) => p.symbol === sym);
    if (!target) return;

    const qtyStr = prompt("Nouvelle quantité :", target.qty ?? 0);
    if (qtyStr === null) return;
    const avgStr = prompt("Nouveau PRU :", target.avgPrice ?? 0);
    if (avgStr === null) return;

    const qty = Number(qtyStr);
    const avgPrice = Number(avgStr);
    if (Number.isNaN(qty) || Number.isNaN(avgPrice)) {
      alert("Valeurs invalides. Merci d'entrer des nombres.");
      return;
    }

    const updated = positions.map((p) =>
      p.symbol === sym ? { ...p, qty, avgPrice } : p
    );
    setPositions(updated);
  }

  return (
    <section className="rounded-xl border border-neutral-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900">
        <h2 className="text-lg font-semibold">Portefeuille</h2>
        <div className="flex items-center gap-4">
          <SyncDividendsButton
            positions={positions}
            onMerge={(merged) => setPositions(merged)}
          />
          <div className="text-sm text-neutral-300">
            {loading ? "Mise à jour des cours…" : fetchError ? (
              <span className="text-red-400">Erreur de chargement: {fetchError}</span>
            ) : (
              "Cours à jour"
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-neutral-950 border-t border-neutral-800 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <div className="text-neutral-400 text-xs uppercase">Valeur totale</div>
          <div className="text-xl font-semibold">
            {totalValue ? totalValue.toFixed(2) : "—"}
          </div>
        </div>
        <div>
          <div className="text-neutral-400 text-xs uppercase">Coût total</div>
          <div className="text-xl font-semibold">
            {totalCost ? totalCost.toFixed(2) : "—"}
          </div>
        </div>
        <div>
          <div className="text-neutral-400 text-xs uppercase">P/L total</div>
          <div className={`text-xl font-semibold ${totalPL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {totalPL != null ? totalPL.toFixed(2) : "—"}
          </div>
        </div>
        <div>
          <div className="text-neutral-400 text-xs uppercase">% total</div>
          <div className={`text-xl font-semibold ${totalPLPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {totalPLPct != null ? `${totalPLPct.toFixed(2)} %` : "—"}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-900">
            <tr>
              <th className="text-left px-3 py-2">Ticker</th>
              <th className="text-left px-3 py-2">Nom</th>
              <th className="text-left px-3 py-2">Secteur</th>
              <th className="text-right px-3 py-2">Qté</th>
              <th className="text-right px-3 py-2">PRU</th>
              <th className="text-right px-3 py-2">Cours</th>
              <th className="text-right px-3 py-2">Valeur</th>
              <th className="text-right px-3 py-2">P/L</th>
              <th className="text-right px-3 py-2">% ligne</th>
              <th className="text-center px-3 py-2">État</th>
              <th className="text-center px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const weightPct =
                totalValue && typeof r.marketValue === "number"
                  ? (r.marketValue / totalValue) * 100
                  : null;

              return (
                <tr key={r.symbol} className="border-t border-neutral-800 hover:bg-neutral-900/40">
                  <td className="px-3 py-2 font-medium">{r.symbol}</td>
                  <td className="px-3 py-2">{r.name || "—"}</td>
                  <td className="px-3 py-2">{r.sector || "—"}</td>
                  <td className="px-3 py-2 text-right">{typeof r.qty === "number" ? r.qty : 0}</td>
                  <td className="px-3 py-2 text-right">{typeof r.avgPrice === "number" ? r.avgPrice.toFixed(2) : "—"}</td>
                  <td className="px-3 py-2 text-right">{typeof r.current === "number" ? r.current.toFixed(2) : "—"}</td>
                  <td className="px-3 py-2 text-right">{typeof r.marketValue === "number" ? r.marketValue.toFixed(2) : "—"}</td>
                  <td className={`px-3 py-2 text-right ${r.pl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {r.pl != null ? r.pl.toFixed(2) : "—"}
                    {r.plPct != null ? (
                      <span className="text-xs text-neutral-400 ml-2">
                        ({r.plPct.toFixed(2)}%)
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {weightPct != null ? `${weightPct.toFixed(2)} %` : "—"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {r.status === "OK" ? "✅" : r.status === "Erreur" ? "❌" : "…"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => handleEditPosition(r.symbol)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700"
                      title="Éditer quantité / PRU"
                    >
                      <IoMdBrush size={16} />
                      Éditer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr className="border-t border-neutral-800 bg-neutral-950/60">
              <td className="px-3 py-2 font-semibold" colSpan={6}>Total</td>
              <td className="px-3 py-2 text-right font-semibold">
                {totalValue ? totalValue.toFixed(2) : "—"}
              </td>
              <td className={`px-3 py-2 text-right font-semibold ${totalPL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {totalPL != null ? totalPL.toFixed(2) : "—"}
                {totalPLPct != null ? (
                  <span className="text-xs text-neutral-400 ml-2">
                    ({totalPLPct.toFixed(2)}%)
                  </span>
                ) : null}
              </td>
              <td className="px-3 py-2 text-right font-semibold">100 %</td>
              <td className="px-3 py-2" />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="px-4 py-3 text-xs text-neutral-400 border-t border-neutral-800">
        Note : cette app utilise l’API gratuite d’Alpha Vantage (~5 requêtes/minute).
        Au-delà de 5 tickers, certaines lignes peuvent afficher une erreur temporaire et se mettre à jour ensuite.
      </div>
    </section>
  );
}
