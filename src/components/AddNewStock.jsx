import React from "react";
import Button from "./Button.jsx";
import { IoMdAddCircle } from "react-icons/io";
import Input from "./Input.jsx";

export default function AddNewStock({
  // Titre / identité
  newStockExchange,            // ⟵ "NASDAQ" | "NYSE"
  setNewStockExchange,
  newStockSymbol,
  setNewStockSymbol,
  inputRef,
  newStockName,
  setNewStockName,
  newStockSector,
  setNewStockSector,

  // Dividendes (optionnels)
  newDividendAmount,
  setNewDividendAmount,
  newDividendCurrency,
  setNewDividendCurrency,
  newDividendFrequency,        //Pour l'option ⟵ "monthly" | "quarterly" | "semiannual" | "annual"
  setNewDividendFrequency,
  newDividendExDate,
  setNewDividendExDate,
  newDividendPayDate,
  setNewDividendPayDate,

  handleAddStock,
}) {
  return (
    <section className="flex mb-4 sm:flex-col md:flex-row gap-2 flex-wrap">

      {/* Place de cotation (standardise NASDAQ/NYSE) */}
      <select
        value={newStockExchange}
        onChange={(e) => setNewStockExchange(e.target.value)}
        className="bg-neutral-800 text-white rounded px-3 py-2"
        aria-label="Exchange"
      >
        <option value="NASDAQ">NASDAQ</option>
        <option value="NYSE">NYSE</option>
      </select>

      <Input
        value={newStockSymbol}
        onChange={(e) => setNewStockSymbol(e.target.value.toUpperCase())}
        placeholder="Entrer le ticker de l'action"
        ref={inputRef}
      />

      <Input
        value={newStockName}
        onChange={(e) => setNewStockName(e.target.value)}
        placeholder="Entrer le nom de l'action"
      />

      <Input
        value={newStockSector}
        onChange={(e) => setNewStockSector(e.target.value)}
        placeholder="Entrer le secteur de l'action"
      />

      {/* --- Champs dividendes (tous optionnels) --- */}
      <Input
        value={newDividendAmount ?? ""}
        onChange={(e) => setNewDividendAmount(e.target.value)}
        placeholder="Dividende par action (optionnel) — ex: 0.25"
        type="number"
        step="0.0001"
        title="Les dividendes sont optionnels; ajoute-les seulement si tu veux les suivre."
      />

      <Input
        value={newDividendCurrency || ""}
        onChange={(e) => setNewDividendCurrency(e.target.value.toUpperCase())}
        placeholder="Devise (optionnel) — ex: USD"
        title="Les dividendes sont optionnels; ajoute-les seulement si tu veux les suivre."
      />

      {/* Sélecteur de fréquence pour éviter les fautes */}
      <select
        value={newDividendFrequency || ""}
        onChange={(e) => setNewDividendFrequency(e.target.value)}
        className="bg-neutral-800 text-white rounded px-3 py-2"
        aria-label="Fréquence de dividende"
        title="Les dividendes sont optionnels; ajoute-les seulement si tu veux les suivre."
      >
        <option value="">Fréquence du dividende (optionnel)</option>
        <option value="monthly">Monthly</option>
        <option value="quarterly">Quarterly</option>
        <option value="semiannual">Semi-annual</option>
        <option value="annual">Annual</option>
      </select>

      <Input
        value={newDividendExDate || ""}
        onChange={(e) => setNewDividendExDate(e.target.value)}
        placeholder="Ex-date (optionnel)"
        type="date"
        title="Les dividendes sont optionnels; ajoute-les seulement si tu veux les suivre."
      />

      <Input
        value={newDividendPayDate || ""}
        onChange={(e) => setNewDividendPayDate(e.target.value)}
        placeholder="Pay date (optionnel)"
        type="date"
        title="Les dividendes sont optionnels; ajoute-les seulement si tu veux les suivre."
      />

      <Button classes="bg-teal-500 hover:bg-teal-700" onClick={handleAddStock}>
        <IoMdAddCircle size={25} />
      </Button>
    </section>
  );
}
