// ⚠️ Tailwind v4 est importé depuis index.css
// point d'entrée UI + orchestration de l'état global (liste d'actions, graphe actif, persistance)
import "./index.css";
import TodaysDate from "./components/TodaysDate.jsx";
import AddNewStock from "./components/AddNewStock.jsx";
import StockListHeader from "./components/StockListHeader.jsx";
import StockListTable from "./components/StockListTable.jsx";
import StockChart from "./components/StockChart.jsx";
import { useState, useEffect, useRef } from "react";
import TradingViewWidget from "./components/TradingViewWidget.jsx";
import PortfolioView from "./components/PortfolioView.jsx";
import WishlistView from "./components/WishlistView.jsx";
import DividendCalendar from "./components/DividendCalendar.jsx";

function App() {
  const [openChart, setOpenChart] = useState("NYSE:O");
  const [stocks, setStocks] = useState([]);

  // Exchange + champs contrôlés du formulaire
  const [newStockExchange, setNewStockExchange] = useState("NASDAQ");
  const [newStockSymbol, setNewStockSymbol] = useState("");
  const [newStockName, setNewStockName] = useState("");
  const [newStockSector, setNewStockSector] = useState("");

  const [newDividendAmount, setNewDividendAmount] = useState("");
  const [newDividendCurrency, setNewDividendCurrency] = useState("");
  const [newDividendFrequency, setNewDividendFrequency] = useState("");
  const [newDividendExDate, setNewDividendExDate] = useState("");
  const [newDividendPayDate, setNewDividendPayDate] = useState("");

  const inputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("portfolio"); // "portfolio" | "wishlist" | "dividends"
  const stockWidgetRef = useRef(null);

  useEffect(() => {}, []);

  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const savedStocks = localStorage.getItem("stocksList");
    if (savedStocks) {
      setStocks(JSON.parse(savedStocks));
    }
  }, []);

  useEffect(() => {
    if (stocks.length > 0) {
      localStorage.setItem("stocksList", JSON.stringify(stocks));
    }
  }, [stocks]);

  // Wishlist: persistance locale
  useEffect(() => {
    const saved = localStorage.getItem("wishlistList");
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlistList", JSON.stringify(wishlist || []));
  }, [wishlist]);

  const saveStockListToJSON = () => {
    const data = JSON.stringify(stocks, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stocks-list.json";
    a.click();
  };

  const handleAddStock = () => {
    if (
      newStockSymbol.trim() !== "" &&
      newStockName.trim() !== "" &&
      newStockSector.trim() !== ""
    ) {
      const symbol = newStockSymbol.toUpperCase();

      if (stocks.some((stock) => stock.symbol === symbol)) {
        alert(`${symbol} already exists.`);
        inputRef.current?.focus();
      } else {
        setStocks([
          ...stocks,
          {
            symbol,
            name: newStockName,
            sector: newStockSector,
            exchange: newStockExchange, // NASDAQ | NYSE
            dividend: {
              amount: newDividendAmount !== "" ? Number(newDividendAmount) : undefined,
              currency: newDividendCurrency || undefined,
              frequency: newDividendFrequency || undefined,
              exDate: newDividendExDate || undefined,
              payDate: newDividendPayDate || undefined,
            },
          },
        ]);

        // Reset des champs
        setNewStockExchange("NASDAQ");
        setNewStockSymbol("");
        setNewStockName("");
        setNewStockSector("");

        setNewDividendAmount("");
        setNewDividendCurrency("");
        setNewDividendFrequency("");
        setNewDividendExDate("");
        setNewDividendPayDate("");
      }
    } else {
      alert("Veuillez remplir ticker, nom et secteur.");
    }
  };

  const handleEditStock = (stockSymbol, newName, newSector) => {
    const updatedStocks = stocks.map((stock) => {
      if (stock.symbol === stockSymbol) {
        return {
          ...stock,
          symbol: stockSymbol,
          name: newName || stock.name,
          sector: newSector || stock.sector,
        };
      }
      return stock;
    });
    setStocks(updatedStocks);
  };

  const handleRemoveStock = (stockSymbol) => {
    if (
      window.confirm(
        `Etes-vous sûr de vouloir supprimer cette action avec ce ticker : ${stockSymbol} ?`
      )
    ) {
      const updatedStocks = stocks.filter(
        (stock) => stock.symbol !== stockSymbol
      );
      setStocks(updatedStocks);
    }
  };

  function normalizeSymbol(raw) {
    if (!raw) return raw;
    if (raw.includes(":")) return raw;
    const s = raw.toUpperCase().trim();
    const map = {
      O: "NYSE:O",
      NVDA: "NASDAQ:NVDA",
      AAPL: "NASDAQ:AAPL",
      MSFT: "NASDAQ:MSFT",
      META: "NASDAQ:META",
      TSLA: "NASDAQ:TSLA",
      AMZN: "NASDAQ:AMZN",
      "NQ1!": "CME_MINI:NQ1!",
      "ES1!": "CME_MINI:ES1!",
    };
    return map[s] || `NASDAQ:${s}`;
  }

  const openStockWidget = (symbol) => {
    const found = stocks.find(
      (x) => x.symbol.toUpperCase() === symbol.toUpperCase()
    );
    const tvSymbol = found?.exchange
      ? `${found.exchange}:${found.symbol.toUpperCase()}`
      : normalizeSymbol(symbol);

    stockWidgetRef.current.scrollIntoView({ behavior: "smooth" });
    setOpenChart(tvSymbol);
  };

  useEffect(() => {
    if (!stocks || stocks.length === 0) {
      setOpenChart("NYSE:O");
    }
  }, [stocks.length]);

  useEffect(() => {
    const root = stockWidgetRef.current;
    if (!root) return;

    root.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";

    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: openChart,
      interval: "D",
      timezone: "Etc/UTC",
      locale: "fr",
      theme: "light",
      style: "1",
      withdateranges: true,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });

    root.appendChild(widgetDiv);
    root.appendChild(script);

    return () => {
      root.innerHTML = "";
    };
  }, [openChart]);

  return (
    <div className="min-h-dvh p-4 mx-auto flex flex-col xl:flex-row gap-5 text-white bg-slate-900">
      <header className="flex flex-col gap-4 xl:w-1/2">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mx-auto max-w-4xl">
            GainzOnly – Là où tes actions bossent pour toi 🚀
          </h1>
        </div>

        {/* Date séparée pour éviter de tasser le titre */}
        <div className="flex justify-center">
          <TodaysDate />
        </div>
        <div className="flex justify-center flex-wrap gap-2" role="tablist" aria-label="Navigation des sections">
          <button
            onClick={() => setActiveTab("portfolio")}
            role="tab"
            aria-selected={activeTab === "portfolio"}
            className={`relative px-3 py-2 rounded-lg border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 ${
              activeTab === "portfolio"
                ? "bg-teal-600 border-teal-500 text-white shadow-inner"
                : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-200"
            }`}
          >
            Portefeuille
            <span
              aria-hidden
              className={`pointer-events-none absolute left-2 right-2 -bottom-1 h-0.5 rounded-full transition-all duration-200 ${
                activeTab === "portfolio" ? "bg-teal-300 opacity-100" : "bg-teal-300 opacity-0"
              }`}
            />
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            role="tab"
            aria-selected={activeTab === "wishlist"}
            className={`relative px-3 py-2 rounded-lg border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 ${
              activeTab === "wishlist"
                ? "bg-teal-600 border-teal-500 text-white shadow-inner"
                : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-200"
            }`}
          >
            Wishlist
            <span
              aria-hidden
              className={`pointer-events-none absolute left-2 right-2 -bottom-1 h-0.5 rounded-full transition-all duration-200 ${
                activeTab === "wishlist" ? "bg-teal-300 opacity-100" : "bg-teal-300 opacity-0"
              }`}
            />
          </button>
          <button
            onClick={() => setActiveTab("dividends")}
            role="tab"
            aria-selected={activeTab === "dividends"}
            className={`relative px-3 py-2 rounded-lg border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 ${
              activeTab === "dividends"
                ? "bg-teal-600 border-teal-500 text-white shadow-inner"
                : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-200"
            }`}
          >
            Mes dividendes
            <span
              aria-hidden
              className={`pointer-events-none absolute left-2 right-2 -bottom-1 h-0.5 rounded-full transition-all duration-200 ${
                activeTab === "dividends" ? "bg-teal-300 opacity-100" : "bg-teal-300 opacity-0"
              }`}
            />
          </button>
        </div>

        {/* --- TradingView : Widget info basique et rapide du ticker (haut) --- */}
        <TradingViewWidget symbol={openChart} />

        {/* --- TradingView : Widget principal (bas) --- */}
        <div
          ref={stockWidgetRef}
          className="tradingview-widget-container rounded-md mb-2 w-full bg-gray-100"
          style={{ height: "600px" }}
        />

        {activeTab === "portfolio" && (
          <AddNewStock
            newStockExchange={newStockExchange}
            setNewStockExchange={setNewStockExchange}
            newStockName={newStockName}
            setNewStockName={setNewStockName}
            newStockSymbol={newStockSymbol}
            setNewStockSymbol={setNewStockSymbol}
            inputRef={inputRef}
            newStockSector={newStockSector}
            setNewStockSector={setNewStockSector}
            newDividendAmount={newDividendAmount}
            setNewDividendAmount={setNewDividendAmount}
            newDividendCurrency={newDividendCurrency}
            setNewDividendCurrency={setNewDividendCurrency}
            newDividendFrequency={newDividendFrequency}
            setNewDividendFrequency={setNewDividendFrequency}
            newDividendExDate={newDividendExDate}
            setNewDividendExDate={setNewDividendExDate}
            newDividendPayDate={newDividendPayDate}
            setNewDividendPayDate={setNewDividendPayDate}
            handleAddStock={handleAddStock}
          />
        )}
      </header>

      <main className="xl:w-1/2">
        {activeTab === "portfolio" && (
          <PortfolioView positions={stocks} setPositions={setStocks} />
        )}

        {activeTab === "wishlist" && (
          <WishlistView
            watchlist={wishlist}
            setWatchlist={setWishlist}
            openStockWidget={openStockWidget}
          />
        )}

        {activeTab === "dividends" && <DividendCalendar stocks={stocks} />}

        {activeTab === "portfolio" && (
          <>
            <StockListHeader
              saveStockListToJSON={saveStockListToJSON}
              setStocks={setStocks}
            />
            <StockListTable
              stocks={stocks}
              handleEditStock={handleEditStock}
              handleRemoveStock={handleRemoveStock}
              openStockWidget={openStockWidget}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
