import React, { useState, useRef } from "react";
import Input from "./Input.jsx";
import Button from "./Button.jsx";

export default function PositionForm({ onAdd }) {
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [qty, setQty] = useState("");
  const [avgCost, setAvgCost] = useState("");
  const ref = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    if (!symbol || !name || !qty || !avgCost) {
      alert("Remplis au minimum: ticker, nom, quantité, PRU.");
      return;
    }
    const s = symbol.toUpperCase().trim();
    onAdd({
      symbol: s,
      name: name.trim(),
      sector: sector.trim(),
      qty: Number(qty),
      avgCost: Number(avgCost),
    });
    setSymbol(""); setName(""); setSector(""); setQty(""); setAvgCost("");
    ref.current?.focus();
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end bg-neutral-900 p-3 rounded-xl border border-neutral-800">
      <Input ref={ref} value={symbol} onChange={e=>setSymbol(e.target.value)} placeholder="Ticker (ex: AAPL)" />
      <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Nom" />
      <Input value={sector} onChange={e=>setSector(e.target.value)} placeholder="Secteur (optionnel)" />
      <Input value={qty} onChange={e=>setQty(e.target.value)} placeholder="Quantité" />
      <Input value={avgCost} onChange={e=>setAvgCost(e.target.value)} placeholder="PRU" />
      <Button classes="bg-teal-600 hover:bg-teal-700" type="submit">Ajouter</Button>
    </form>
  );
}
