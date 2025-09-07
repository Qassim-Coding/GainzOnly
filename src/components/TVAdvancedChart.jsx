import { useEffect, useRef } from "react";

// Si on construit notre app avec le widget officiel de TradingView
export default function TVAdvancedChart({
  symbol = "NASDAQ:AAPL",
  theme = "dark",
  locale = "fr",
  timezone = "Europe/Zurich",
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = ""; // reset si props changent (évite plusieurs iframes)

    // Injecte le script d’embed et lui passe la config via innerHTML (obligatoire)
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: "D",              // "1", "5", "15", "60", "D", "W", "M"
      timezone,
      theme,                      // "light" | "dark"
      style: "1",                 // 1 = chandeliers
      locale,
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      calendar: true,
      support_host: "https://www.tradingview.com",
    });

    ref.current.appendChild(script);

    // Nettoyage pour éviter les doublons à chaque changement de props / démontage
    return () => {
      if (ref.current) ref.current.innerHTML = "";
    };
  }, [symbol, theme, locale, timezone]);

  return (
    // Conteneur externe (tes classes Tailwind OK)
    <div className="tradingview-widget-container rounded-xl border border-neutral-800">
      {/* Le script est injecté dans ce div et y crée l’iframe du chart */}
      <div ref={ref} className="h-[420px]" />
    </div>
  );
}
