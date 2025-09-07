import React from "react";

export default function DividendTable({ title, rows = [] }) {
  return (
    <section className="rounded-xl border border-neutral-800 overflow-x-auto mb-6">
      <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-900">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-900">
          <tr>
            <th className="text-left px-4 py-2">Ticker</th>
            <th className="text-left px-4 py-2">Ex-Date</th>
            <th className="text-left px-4 py-2">Pay Date</th>
            <th className="text-left px-4 py-2">Montant</th>
            <th className="text-left px-4 py-2">Devise</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-3 text-neutral-400" colSpan={5}>
                Aucune donnée pour l’instant.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={`${r.symbol}-${r.exDate || r.payDate || Math.random()}`} className="border-t border-neutral-800">
                <td className="px-4 py-2 font-medium">{r.symbol}</td>
                <td className="px-4 py-2">{r.exDate || "—"}</td>
                <td className="px-4 py-2">{r.payDate || "—"}</td>
                <td className="px-4 py-2">{typeof r.amount === "number" ? r.amount : "—"}</td>
                <td className="px-4 py-2">{r.currency || "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
