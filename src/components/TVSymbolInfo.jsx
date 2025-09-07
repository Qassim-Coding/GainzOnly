import { useEffect, useRef } from "react";

export default function TVSymbolInfo({
  symbol = "NASDAQ:AAPL",
  theme = "dark",
  locale = "fr",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = ""; // cleanup à chaque changement

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width: "100%",
      isTransparent: true,
      colorTheme: theme,
      locale,
    });

    containerRef.current.appendChild(script);
    return () => { containerRef.current.innerHTML = ""; };
  }, [symbol, theme, locale]);

  return <div className="tradingview-widget-container" ref={containerRef} />;
}
