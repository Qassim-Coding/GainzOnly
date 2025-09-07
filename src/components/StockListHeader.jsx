
import React from "react";
import Button from "./Button";

export default function StockListHeader({ setStocks, saveStockListToJSON, stocks  }) {
  return (
    <section className="stock-list-header">
      <hr className="mb-4" />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="mb-2 text-3xl font-bold text-teal-500">Sauvegarder ou importer une liste</h3>
          <p className="mb-4 text-slate-500">
            Exportez votre liste actuelle au format JSON ou importez un fichier JSON compatible pour remplacer la liste.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            classes="bg-teal-500 hover:bg-teal-700"
            onClick={saveStockListToJSON}
          >
            Sauvegarder la liste du portefeuille
          </Button>

          {/* Pour Charger un JSON local et remplace le state 'stocks' */}
          <input
            type="file"
            accept=".json,application/json"
            className="rounded-md bg-slate-400 px-2 py-1"
            onChange={(e) => {
              const file = e.target.files && e.target.files[0];
              if (!file) return; // Si utilisateur a annulé

              const reader = new FileReader();
              reader.onload = (evt) => {
                try {
                  const content = evt.target?.result;
                  const parsed = JSON.parse(content);
                  setStocks(parsed); // remplace la liste par le contenu du fichier
                } catch (err) {
                  alert("Fichier JSON invalide.");
                } finally {
                  e.target.value = "";
                }
              };
              reader.readAsText(file);
            }}
          />
        </div>
      </div>

      <hr className="mb-4" />
      <div className="flex items-center justify-between rounded-xl bg-neutral-800 p-4">
        <h2 className="text-lg font-semibold">Mes actions</h2>
        <div className="text-sm text-neutral-400">Mouvements du jour</div>
      </div>
    </section>
  );
}
