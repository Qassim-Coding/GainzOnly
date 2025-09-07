import { useEffect, useRef } from "react";

export default function LiveAreaChart({
  initial = [],
  height = 360,
  onReady,
  demo = true,
}) {
  const wrapRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const roRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    let disposed = false;

    async function setup() {
      const el = wrapRef.current;
      if (!el) return;

      // 1) Charge la lib de manière sûre
      let mod;
      try {
        mod = await import("lightweight-charts");
      } catch (e) {
        throw new Error(`Impossible de charger "lightweight-charts": ${e.message}`);
      }

      const createChartFn =
        mod?.createChart ||
        (mod?.default && mod.default.createChart) ||
        (typeof window !== "undefined" &&
          window.LightweightCharts &&
          window.LightweightCharts.createChart);

      if (typeof createChartFn !== "function") {
        throw new Error(
          'createChart introuvable. Vérifie l’install: `npm i lightweight-charts@latest` et l’import côté module.'
        );
      }

      // 2) Crée le chart
      const chart = createChartFn(el, {
        width: el.clientWidth,
        height,
        layout: {
          background: { color: "#0a0a0a" },
          textColor: "#e5e7eb",
        },
        grid: {
          vertLines: { color: "#1f2937" },
          horzLines: { color: "#1f2937" },
        },
        rightPriceScale: { borderColor: "#374151" },
        timeScale: { borderColor: "#374151" },
      });

      if (typeof chart.addAreaSeries !== "function") {
        chart.remove();
        throw new Error(
          'addAreaSeries indisponible. Mets à jour: `npm i lightweight-charts@latest`.'
        );
      }

      const series = chart.addAreaSeries({
        lineWidth: 2,
        topColor: "rgba(99, 102, 241, 0.4)",
        bottomColor: "rgba(99, 102, 241, 0.0)",
        lineColor: "rgba(99, 102, 241, 1.0)",
        priceLineVisible: false,
      });

      if (initial?.length) series.setData(initial);

      chartRef.current = chart;
      seriesRef.current = series;
      onReady?.(chart, series);

      // Responsive
      roRef.current = new ResizeObserver(() => {
        chart.applyOptions({ width: el.clientWidth, height });
      });
      roRef.current.observe(el);

      // Démo temps réel (random walk). Désactive avec demo={false}
      if (demo) {
        let t = initial?.length
          ? initial[initial.length - 1].time
          : Math.floor(Date.now() / 1000);
        let v = initial?.length ? initial[initial.length - 1].value : 100;
        timerRef.current = setInterval(() => {
          if (disposed) return;
          t += 60;
          v = +(v * (1 + (Math.random() - 0.5) * 0.002)).toFixed(2);
          series.update({ time: t, value: v });
        }, 1000);
      }
    }

    setup();

    // Cleanup
    return () => {
      disposed = true;
      if (timerRef.current) clearInterval(timerRef.current);
      if (roRef.current) roRef.current.disconnect();
      if (chartRef.current) chartRef.current.remove();
    };
  }, [height, onReady, demo, initial]);

  return (
    <div
      ref={wrapRef}
      className="w-full h-auto rounded-xl border border-neutral-800 p-2"
    />
  );
}
