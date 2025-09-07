import React, { useEffect, useState } from "react";
import DividendTable from "./DividendTable.jsx";
import { fetchDividendsForSymbols, pickNextOrLatestBySymbol } from "../services/finnhub.js";

export default function DividendsView({ portfolio = [], wishlist = [] }) {
  const [loading, setLoading] = useState(false);
  const [portfolioRows, setPortfolioRows] = useState([]);
  const [wishlistRows, setWishlistRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const portfolioSymbols = (portfolio || []).map((s) => s.symbol).filter(Boolean);
        const wishlistSymbols  = (wishlist  || []).map((s) => s.symbol).filter(Boolean);

        // On interroge Finnhub (fenêtre: aujourd’hui → +120 jours) --> Option laissée si on change d'API utilisée
        const [pEvents, wEvents] = await Promise.all([
          portfolioSymbols.length ? fetchDividendsForSymbols(portfolioSymbols, { toDays: 120 }) : Promise.resolve([]),
          wishlistSymbols.length  ? fetchDividendsForSymbols(wishlistSymbols,  { toDays: 120 }) : Promise.resolve([]),
        ]);

        setPortfolioRows(pickNextOrLatestBySymbol(pEvents));
        setWishlistRows(pickNextOrLatestBySymbol(wEvents));
      } catch (e) {
        setError(String(e.message || e));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [JSON.stringify(portfolio), JSON.stringify(wishlist)]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mes dividendes</h2>
      {error && (
        <div className="rounded-md border border-red-600 bg-red-950/30 px-4 py-3 text-red-200">
          Erreur: {error}. Vérifie ta clé <code>VITE_FINNHUB_KEY</code>.
        </div>
      )}
      {loading && (
        <div className="rounded-md border border-neutral-800 bg-neutral-900 px-4 py-3">Chargement des dividendes…</div>
      )}

      <DividendTable title="Portfolio" rows={portfolioRows} />
      <DividendTable title="Wishlist" rows={wishlistRows} />
    </div>
  );
}
