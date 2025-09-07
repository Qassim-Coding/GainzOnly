import React, { useEffect, useRef } from "react";

export default function StockChart({ symbol }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1) Créer le script TradingView
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    // 2) IMPORTANT : innerHTML attend du TEXTE (JSON), pas un objet JS
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol, // équivaut à "symbol": symbol
      interval: "D",
      timezone: "Etc/UTC",
      locale: "en",
      theme: "dark",
      style: "1",
      withdateranges: true,
      allow_symbol_change: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });

    // 3) Nettoyer le conteneur pour éviter les doublons
    containerRef.current.innerHTML = "";

    // 4) Recréer le sous-conteneur attendu par TradingView
    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "calc(100% - 32px)";
    widgetDiv.style.width = "100%";

    containerRef.current.appendChild(widgetDiv);
    containerRef.current.appendChild(script);

    // 5) Cleanup à chaque changement de symbol / unmount
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [symbol]);

  // Le conteneur parent requis par TradingView
  return (
    <div className="tradingview-widget-container" ref={containerRef}></div>
  );
}
