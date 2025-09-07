import React, { useMemo, useState } from "react";

// --------- Utils ----------
const byDateAsc = (a, b) => new Date(a.date) - new Date(b.date);

// Format strict européen: 06.09.2025
function formatCH(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d)) return "—";
  return d.toLocaleDateString("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function monthKey(iso) {
  const d = new Date(iso);
  return d.toLocaleString("fr-CH", { month: "long", year: "numeric" });
}

// Badge simple pour la fréquence
function FrequencyBadge({ freq }) {
  if (!freq) return <span className="text-neutral-400">—</span>;
  const base =
    "text-xs px-2 py-0.5 rounded border inline-block align-middle";
  const map = {
    monthly: "bg-blue-900/40 text-blue-200 border-blue-700",
    "semi-annual": "bg-amber-900/40 text-amber-200 border-amber-700",
    "semi-annually": "bg-amber-900/40 text-amber-200 border-amber-700",
    quarterly: "bg-emerald-900/40 text-emerald-200 border-emerald-700",
    annual: "bg-fuchsia-900/40 text-fuchsia-200 border-fuchsia-700",
    annually: "bg-fuchsia-900/40 text-fuchsia-200 border-fuchsia-700",
  };
  const cls = map[freq.toLowerCase?.()] || "bg-neutral-800 text-neutral-200 border-neutral-700";
  return <span className={`${base} ${cls}`}>{freq}</span>;
}

export default function DividendCalendar({ stocks = [] }) {
  const [showFutureOnly, setShowFutureOnly] = useState(true);

  // Fenêtre “passé” quand on affiche aussi l'historique
  const PAST_MONTHS_LIMIT = 12;

  const { events, groups, monthlyTotals } = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    // Si on veut montrer aussi le passé, on borne à 12 mois en arrière MAXIMUM --> API gratuite ne fournit pas plus.
    const pastCutoff = new Date(
      todayStart.getFullYear(),
      todayStart.getMonth() - PAST_MONTHS_LIMIT,
      todayStart.getDate()
    );

    // 1) Aplatir les événements à partir de chaque action
    const all = [];
    for (const s of stocks) {
      const d = s.dividend || {};
      if (d.nextExDate) {
        all.push({
          symbol: s.symbol,
          name: s.name || "",
          date: d.nextExDate, // ex-date
          amount: d.amount ?? null,
          currency: d.currency || "",
          frequency: d.frequency || "",
          type: "Ex-date",
        });
      }
      if (d.payDate) {
        all.push({
          symbol: s.symbol,
          name: s.name || "",
          date: d.payDate,
          amount: d.amount ?? null,
          currency: d.currency || "",
          frequency: d.frequency || "",
          type: "Pay date",
        });
      }
    }

    // 2) Filtrage futur/past
    const filtered = all
      .filter((ev) => {
        const dt = new Date(ev.date);
        if (Number.isNaN(dt)) return false;
        if (showFutureOnly) {
          // On garde uniquement les dates >= aujourd'hui
          return dt >= todayStart;
        }
        // Sinon on accepte futur + passé récent (<= 12 mois)
        return dt >= pastCutoff;
      })
      .sort(byDateAsc);

    // 3) Groupage par mois + totaux mensuels (somme des montants connus)
    const g = new Map();
    const totals = new Map(); // key(month) -> somme montant
    for (const ev of filtered) {
      const key = monthKey(ev.date);
      if (!g.has(key)) g.set(key, []);
      g.get(key).push(ev);

      // total mensuel (on additionne seulement les montants connus)
      const amt = typeof ev.amount === "number" ? ev.amount : null;
      if (amt != null) {
        totals.set(key, (totals.get(key) || 0) + amt);
      }
    }

    return {
      events: filtered,
      groups: g,
      monthlyTotals: totals,
    };
  }, [stocks, showFutureOnly]);

  if (events.length === 0) {
    return (
      <section className="rounded-xl border border-neutral-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Calendrier des dividendes</h2>
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-teal-500"
              checked={showFutureOnly}
              onChange={(e) => setShowFutureOnly(e.target.checked)}
            />
            Montrer uniquement les dates futures
          </label>
        </div>
        <p className="text-sm text-neutral-300">
          Aucun événement à afficher pour le moment.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-neutral-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Calendrier des dividendes</h2>
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-teal-500"
            checked={showFutureOnly}
            onChange={(e) => setShowFutureOnly(e.target.checked)}
          />
          Montrer uniquement les dates futures
        </label>
      </div>

      {[...groups.entries()].map(([month, evs]) => {
        const total = monthlyTotals.get(month) || 0;
        return (
          <div key={month} className="mb-6">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-lg font-semibold">{month}</h3>
              <div className="text-sm text-neutral-300">
                Total mois (montants connus) :{" "}
                <span className="font-semibold">
                  {total ? total.toFixed(2) : "—"}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-neutral-800">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-900">
                  <tr>
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">Type</th>
                    <th className="text-left px-3 py-2">Ticker</th>
                    <th className="text-left px-3 py-2">Nom</th>
                    <th className="text-right px-3 py-2">Montant</th>
                    <th className="text-left px-3 py-2">Fréquence</th>
                  </tr>
                </thead>
                <tbody>
                  {evs.map((ev, i) => (
                    <tr key={i} className="border-t border-neutral-800">
                      <td className="px-3 py-2">{formatCH(ev.date)}</td>
                      <td className="px-3 py-2">{ev.type}</td>
                      <td className="px-3 py-2 font-medium">{ev.symbol}</td>
                      <td className="px-3 py-2">{ev.name || "—"}</td>
                      <td className="px-3 py-2 text-right">
                        {typeof ev.amount === "number"
                          ? `${ev.amount.toFixed(2)} ${ev.currency}`.trim()
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <FrequencyBadge freq={ev.frequency} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </section>
  );
}
