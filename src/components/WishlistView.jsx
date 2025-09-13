import React, { useEffect, useMemo, useState } from "react";
import { fetchQuotes } from "../services/prices";
import Input from "./Input";
import Button from "./Button";

export default function WishlistView({ watchlist = [], setWatchlist, openStockWidget }) {
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Formulaire d'ajout (wishlist)
  const [wlSymbol, setWlSymbol] = useState("");
  const [wlName, setWlName] = useState("");
  const [wlSector, setWlSector] = useState("");
  const [wlDesired, setWlDesired] = useState("");
  const [wlExchange, setWlExchange] = useState("NASDAQ");

  const symbols = useMemo(
    () => [...new Set((watchlist || []).map((p) => p?.symbol).filter(Boolean))],
    [watchlist]
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

  function handleAdd() {
    const symbol = wlSymbol.trim().toUpperCase();
    if (!symbol) {
      alert("Veuillez saisir un ticker.");
      return;
    }
    if (watchlist.some((w) => (w.symbol || "").toUpperCase() === symbol)) {
      alert(`${symbol} est déjà dans la wishlist.`);
      return;
    }
    const desired = wlDesired !== "" ? Number(wlDesired) : null;
    if (wlDesired !== "" && Number.isNaN(desired)) {
      alert("Prix souhaité invalide.");
      return;
    }
    const next = {
      symbol,
      name: wlName.trim(),
      sector: wlSector.trim(),
      desiredPrice: desired,
      exchange: wlExchange,
    };
    setWatchlist([...(watchlist || []), next]);
    setWlSymbol("");
    setWlName("");
    setWlSector("");
    setWlDesired("");
    setWlExchange("NASDAQ");
  }

  function handleRemove(sym) {
    if (!confirm(`Supprimer ${sym} de la wishlist ?`)) return;
    setWatchlist((prev) => (prev || []).filter((w) => w.symbol !== sym));
  }

  return (
    <section className="rounded-xl border border-neutral-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900">
        <h2 className="text-lg font-semibold">Wishlist</h2>
        <div className="text-sm text-neutral-300">
          {loading ? "Mise à jour des cours…" : fetchError ? (
            <span className="text-red-400">Erreur de chargement: {fetchError}</span>
          ) : (
            "Cours à jour"
          )}
        </div>
      </div>

      {/* Formulaire d'ajout */}
      <div className="px-4 py-3 bg-neutral-950 border-t border-neutral-800 grid grid-cols-1 md:grid-cols-6 gap-2">
        <select
          value={wlExchange}
          onChange={(e) => setWlExchange(e.target.value)}
          className="bg-neutral-800 text-white rounded px-2 py-1 w-full md:w-auto"
        >
          <option value="NASDAQ">NASDAQ</option>
          <option value="NYSE">NYSE</option>
        </select>
        <Input
          value={wlSymbol}
          onChange={(e) => setWlSymbol(e.target.value.toUpperCase())}
          placeholder="Ticker (ex: AAPL)"
          className="w-full md:w-auto"
        />
        <Input
          value={wlName}
          onChange={(e) => setWlName(e.target.value)}
          placeholder="Nom (optionnel)"
          className="w-full md:w-auto"
        />
        <Input
          value={wlSector}
          onChange={(e) => setWlSector(e.target.value)}
          placeholder="Secteur (optionnel)"
          className="w-full md:w-auto"
        />
        <Input
          value={wlDesired}
          onChange={(e) => setWlDesired(e.target.value)}
          placeholder="Prix souhaité (optionnel)"
          type="number"
          step="0.01"
          className="w-full md:w-auto"
        />
        <Button classes="bg-teal-600 hover:bg-teal-700" onClick={handleAdd}>
          Ajouter
        </Button>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-900">
            <tr>
              <th className="text-left px-3 py-2">Ticker</th>
              <th className="text-left px-3 py-2">Nom</th>
              <th className="text-left px-3 py-2 hidden sm:table-cell">Secteur</th>
              <th className="text-right px-3 py-2">Prix souhaité</th>
              <th className="text-right px-3 py-2">Cours</th>
              <th className="text-right px-3 py-2">Écart</th>
              <th className="text-center px-3 py-2 hidden sm:table-cell">État</th>
              <th className="text-center px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(watchlist || []).map((w, idx) => {
              const q = quotes[w.symbol] || {};
              const current = typeof q.current === "number" ? q.current : null;
              const status = q?.error ? "Erreur" : current != null ? "OK" : "…";
              const desired = typeof w.desiredPrice === "number" ? w.desiredPrice : (w.desiredPrice == null && w.desiredPrice !== 0 ? null : Number(w.desiredPrice));
              const hasDesired = typeof desired === "number" && Number.isFinite(desired);
              const diffPct = hasDesired && current != null && desired
                ? ((current - desired) / desired) * 100
                : null;
              const diffCls = diffPct != null ? (diffPct >= 0 ? "text-emerald-400" : "text-red-400") : "";

              function updateDesired(value) {
                const num = value === "" ? "" : Number(value);
                if (value !== "" && Number.isNaN(num)) return; // ignore invalid
                setWatchlist((prev) => (prev || []).map((it) =>
                  it.symbol === w.symbol ? { ...it, desiredPrice: value === "" ? null : Number(num) } : it
                ));
              }

              return (
                <tr key={w.symbol} className="border-t border-neutral-800 hover:bg-neutral-900/40">
                  <td className="px-3 py-2 font-medium">{w.symbol}</td>
                  <td className="px-3 py-2">{w.name || "—"}</td>
                  <td className="px-3 py-2 hidden sm:table-cell">{w.sector || "—"}</td>
                  <td className="px-3 py-2 text-right">
                    <input
                      className="w-28 bg-neutral-800 text-white rounded px-2 py-1 text-right"
                      type="number"
                      step="0.01"
                      value={w.desiredPrice ?? ""}
                      onChange={(e) => updateDesired(e.target.value)}
                      placeholder="—"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">{current != null ? current.toFixed(2) : "—"}</td>
                  <td className={`px-3 py-2 text-right ${diffCls}`}>
                    {diffPct != null ? `${diffPct.toFixed(2)} %` : "—"}
                  </td>
                  <td className="px-3 py-2 text-center hidden sm:table-cell">
                    {status === "OK" ? "✅" : status === "Erreur" ? "❌" : "…"}
                  </td>
                  <td className="px-3 py-2 text-center flex justify-center items-center gap-2">
                    <button
                      onClick={() => openStockWidget && openStockWidget({ symbol: w.symbol, exchange: w.exchange })}
                      className="px-2 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700"
                    >
                      Graphique
                    </button>
                    <button
                      onClick={() => handleRemove(w.symbol)}
                      className="px-2 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 text-xs text-neutral-400 border-t border-neutral-800">
        Note : limite gratuite Alpha Vantage ~5 requêtes/minute. Au-delà, certaines lignes afficheront une erreur temporaire.
      </div>
    </section>
  );
}
