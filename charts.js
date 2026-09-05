(function () {
  "use strict";

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function chartColors() {
    var dark = document.documentElement.classList.contains("dark");
    return {
      text: dark ? "#b2bec3" : "#636e72",
      grid: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
      tooltipBg: dark ? "#1f2937" : "#2d3436",
    };
  }

  var charts = {};

  function destroy(canvasId) {
    if (charts[canvasId]) {
      charts[canvasId].destroy();
      charts[canvasId] = null;
    }
  }

  function yMax(values) {
    var m = 100;
    values.forEach(function (v) { if (v > m) m = v; });
    return m > 100 ? Math.ceil(m * 1.1) : 100;
  }

  function makeBar(id, labels, scores) {
    destroy(id);
    var c = chartColors();
    var ctx = document.getElementById(id);
    if (!ctx) return;
    var hasFail = scores.some(function (s) { return s < 50; });
    charts[id] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Score",
          data: scores,
          backgroundColor: scores.map(function (s) { return s >= 50 ? "rgba(16,185,129,0.7)" : "rgba(239,68,68,0.7)"; }),
          borderColor: scores.map(function (s) { return s >= 50 ? "#10b981" : "#ef4444"; }),
          borderWidth: 1.5,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: c.tooltipBg, titleColor: "#fff", bodyColor: "#fff" } },
        scales: {
          y: { beginAtZero: true, max: yMax(scores), ticks: { color: c.text }, grid: { color: c.grid } },
          x: { ticks: { color: c.text }, grid: { display: false } },
        },
      },
    });
    return charts[id];
  }

  function makeDonut(id, dist) {
    destroy(id);
    var c = chartColors();
    var ctx = document.getElementById(id);
    if (!ctx) return;
    var letters = ["A", "B", "C", "D", "F"];
    var data = letters.map(function (l) { return +((dist[l] * 100).toFixed(1)); });
    charts[id] = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: letters,
        datasets: [{
          data: data,
          backgroundColor: ["rgba(16,185,129,0.8)", "rgba(34,197,94,0.8)", "rgba(245,158,11,0.8)", "rgba(249,115,22,0.8)", "rgba(239,68,68,0.8)"],
          borderColor: ["#10b981", "#22c55e", "#f59e0b", "#f97316", "#ef4444"],
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: {
          legend: { position: "bottom", labels: { color: c.text, padding: 12, font: { size: 11 } } },
          tooltip: { backgroundColor: c.tooltipBg, titleColor: "#fff", bodyColor: "#fff", callbacks: { label: function (ctx) { return ctx.label + ": " + ctx.parsed + "%"; } } },
        },
      },
    });
    return charts[id];
  }

  function makeRadar(id, labels, scores) {
    destroy(id);
    var c = chartColors();
    var ctx = document.getElementById(id);
    if (!ctx) return;
    charts[id] = new Chart(ctx, {
      type: "radar",
      data: {
        labels: labels,
        datasets: [{
          label: "Score", data: scores,
          backgroundColor: "rgba(16,185,129,0.2)",
          borderColor: "#10b981",
          pointBackgroundColor: "#10b981",
          pointBorderColor: "#fff",
          pointRadius: 4,
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: c.tooltipBg, titleColor: "#fff", bodyColor: "#fff" } },
        scales: {
          r: { beginAtZero: true, max: yMax(scores), ticks: { color: c.text, backdropColor: "transparent" }, grid: { color: c.grid }, pointLabels: { color: c.text, font: { size: 11 } }, angleLines: { color: c.grid } },
        },
      },
    });
    return charts[id];
  }

  function makeLine(id, labels, values, label) {
    destroy(id);
    var c = chartColors();
    var ctx = document.getElementById(id);
    if (!ctx) return;
    charts[id] = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: label || "Score",
          data: values,
          fill: true,
          tension: 0.4,
          borderColor: "#10b981",
          backgroundColor: "rgba(16,185,129,0.15)",
          pointBackgroundColor: "#fff",
          pointBorderColor: "#10b981",
          pointBorderWidth: 2,
          pointRadius: 4,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: !!label }, tooltip: { backgroundColor: c.tooltipBg, titleColor: "#fff", bodyColor: "#fff" } },
        scales: {
          y: { beginAtZero: true, max: yMax(values), ticks: { color: c.text }, grid: { color: c.grid } },
          x: { ticks: { color: c.text }, grid: { display: false } },
        },
      },
    });
    return charts[id];
  }

  function makeGroupedBar(id, labels, datasets) {
    destroy(id);
    var c = chartColors();
    var ctx = document.getElementById(id);
    if (!ctx) return;
    charts[id] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: datasets.map(function (ds, i) {
          return { label: ds.label, data: ds.values, backgroundColor: (i % 2 ? "rgba(245,158,11,0.7)" : "rgba(16,185,129,0.7)"), borderColor: i % 2 ? "#f59e0b" : "#10b981", borderWidth: 1.5, borderRadius: 4 };
        }),
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { position: "bottom", labels: { color: c.text } }, tooltip: { backgroundColor: c.tooltipBg, titleColor: "#fff", bodyColor: "#fff" } },
        scales: {
          y: { beginAtZero: true, max: yMax(datasets.reduce(function (a, ds) { return a.concat(ds.values); }, [])), ticks: { color: c.text }, grid: { color: c.grid } },
          x: { ticks: { color: c.text }, grid: { display: false } },
        },
      },
    });
    return charts[id];
  }

  function rgb(id) {
    destroy(id);
  }

  var ChartMod = {
    makeBar: makeBar,
    makeDonut: makeDonut,
    makeRadar: makeRadar,
    makeLine: makeLine,
    makeGroupedBar: makeGroupedBar,
    rerenderAll: function () {
      // simply trigger on-theme re-render by calling this after theme change
    },
  };

  window.App.charts = charts;
  window.Ch = ChartMod;
})();
