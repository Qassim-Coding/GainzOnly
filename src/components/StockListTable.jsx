import React, { useEffect, useState } from "react";
import StockListTableHead from "./StockListTableHead.jsx";
import Button from "./Button";
import { IoMdBrush, IoMdRemoveCircle } from "react-icons/io";
import Input from "./Input";

export default function StockListTable({
  stocks,
  handleEditStock,
  handleRemoveStock,
  openStockWidget,
}) {
  // item survolé (pour afficher les boutons d'action à droite)
  const [hoveredItem, setHoveredItem] = useState(null);

  // liste affichée après tri/filtre/recherche
  const [filteredStocks, setFilteredStocks] = useState(stocks);

  // état "filtre actif" (info -> UI)
  const [filtered, setFiltered] = useState({ isFiltered: false, filter: "" });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
  setFilteredStocks(stocks);
  }, [stocks]);

  const sortByName = (reverse = false) => {
    const next = [...filteredStocks].sort((a, b) =>
      reverse ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)
    );
    setFilteredStocks(next);
  };

  const sortBySector = (reverse = false) => {
    const next = [...filteredStocks].sort((a, b) =>
      reverse ? b.sector.localeCompare(a.sector) : a.sector.localeCompare(b.sector)
    );
    setFilteredStocks(next);
  };

  const handleSectorFilter = (selectedSector) => {
    const next =
      selectedSector === "All Sectors"
        ? stocks
        : stocks.filter((stock) => stock.sector === selectedSector);

    setFilteredStocks(next);

    // ⚠️ mise à jour l'état 'filtered' (et non 'filteredStocks')
    setFiltered({
      isFiltered: selectedSector !== "All Sectors",
      filter: selectedSector,
    });
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchTerm(query);

    const next = stocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query)
    );
    setFilteredStocks(next);
  };

  return (
    <section>
      <StockListTableHead
        stocks={stocks}
        sortByName={sortByName}
        sortBySector={sortBySector}
        handleSectorFilter={handleSectorFilter}
      />

      <div className="my-3">
        <Input
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Rechercher par ticker ou par nom"
        />
      </div>

      <ul
        style={{ minHeight: "70vh" }}
        className="overflow-y-scroll"
      >
        {filteredStocks.map((stock) => (
          <li
            key={stock.symbol}
            className={`grid grid-cols-4 items-center gap-2 rounded-md border-b-2 border-gray-800 bg-slate-900 px-4 py-2 text-white hover:bg-gray-300 hover:text-gray-900 ${
              hoveredItem === stock.symbol ? "hovered" : ""
            }`}
            onMouseEnter={() => setHoveredItem(stock.symbol)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="col-span-3 flex justify-between">
              <h4
                className="cursor-pointer rounded-md bg-teal-500 px-2 py-1 font-bold text-gray-100 hover:bg-slate-700"
                onClick={() => openStockWidget(stock.symbol)}
              >
                {stock.symbol}
              </h4>
              <h4 className="font-bold">{stock.name}</h4>
              <small className="text-slate-500">{stock.sector}</small>
            </div>

            <div className="col-span-1 flex justify-end">
              {hoveredItem === stock.symbol && (
                <>
                  <Button
                    classes="mr-1 bg-slate-800 hover:bg-slate-700"
                    onClick={() => {
                      const newName = prompt("Enter new stock name:", stock.name);
                      const newSector = prompt("Enter new stock sector:", stock.sector);
                      handleEditStock(stock.symbol, newName, newSector);
                    }}
                  >
                    <IoMdBrush size={20} />
                  </Button>

                  <Button
                    classes="bg-red-800 hover:bg-slate-700"
                    onClick={() => handleRemoveStock(stock.symbol)}
                  >
                    <IoMdRemoveCircle size={20} />
                  </Button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
