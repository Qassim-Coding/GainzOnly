import React, { useEffect, useRef, memo } from "react";

function TradingViewWidget({ symbol = "NASDAQ:AAPL" }) {
  const container = useRef();

  useEffect(() => {
    const root = container.current;
    if (!root) return;

    // Nettoyage au cas où
    root.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      colorTheme: "dark",
      isTransparent: false,
      locale: "fr",
      width: "100%",
    });

    root.appendChild(widgetDiv);
    root.appendChild(script);

    return () => {
      root.innerHTML = "";
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container" ref={container}>
    </div>
  );
}

export default memo(TradingViewWidget);
