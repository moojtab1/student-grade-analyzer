(function () {
  "use strict";

  var App = window.App;

  /* Move an element off-screen and make it renderable so html2canvas can
     capture it even when it normally sits inside a hidden section (charts
     are painted on real canvases, so they survive the move). */
  function setOffscreen(el) {
    var hadHidden = el.classList.contains("hidden");
    var hadActive = el.classList.contains("active");
    var prevStyle = el.getAttribute("style") || "";
    el.classList.remove("hidden");
    el.classList.add("active");
    el.style.position = "absolute";
    el.style.left = "-10000px";
    el.style.top = "0";
    el.style.width = "1400px";
    el.style.zIndex = "-1";
    el.style.display = "block";
    void el.offsetHeight;
    return function restore() {
      if (hadHidden) el.classList.add("hidden");
      if (!hadActive) el.classList.remove("active");
      if (prevStyle) el.setAttribute("style", prevStyle); else el.removeAttribute("style");
    };
  }

  /* If the dashboard charts were last drawn while their section was hidden,
     Chart.js gives them zero-sized canvases. Redraw them while visible. */
  function ensureDashboardCharts() {
    var el = document.getElementById("page-dashboard");
    if (!el) return;
    var canvases = el.querySelectorAll("canvas");
    var zero = Array.prototype.some.call(canvases, function (cv) {
      return cv.width === 0 || cv.height === 0;
    });
    if (zero && window.App.renderDashboardCharts) window.App.renderDashboardCharts();
  }

  function exportPNG() {
    var el = document.getElementById("page-dashboard");
    if (!el) return;
    var restore = setOffscreen(el);
    ensureDashboardCharts();
    var canvases = el.querySelectorAll("canvas");
    if (!canvases.length) { restore(); alert("No charts to export"); return; }
    for (var i = 0; i < canvases.length; i++) {
      var link = document.createElement("a");
      link.download = "chart-" + (i + 1) + ".png";
      link.href = canvases[i].toDataURL("image/png");
      link.click();
    }
    restore();
  }

  function exportPDF() {
    if (typeof html2canvas === "undefined" || typeof jspdf === "undefined" || typeof jspdf.jsPDF === "undefined") {
      alert("Export libs not loaded");
      return;
    }
    var el = document.getElementById("page-dashboard");
    var restore = setOffscreen(el);
    ensureDashboardCharts();
    void el.offsetHeight;
    html2canvas(el, { scale: 2, backgroundColor: "#ffffff", windowWidth: 1400 }).then(function (canvas) {
      restore();
      var img = canvas.toDataURL("image/png");
      var pdf = new jspdf.jsPDF("p", "mm", "a4");
      var w = pdf.internal.pageSize.getWidth();
      var h = (canvas.height / canvas.width) * w;
      pdf.addImage(img, "PNG", 0, 0, w, h);
      pdf.save("grade-analysis.pdf");
    }).catch(function () { restore(); });
  }

  function exportPPTX() {
    if (typeof PptxGenJS === "undefined") { alert("PptxGenJS not loaded"); return; }
    var el = document.getElementById("page-dashboard");
    var restore = el ? setOffscreen(el) : function () {};
    ensureDashboardCharts();

    var pptx = new PptxGenJS();
    pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
    pptx.layout = "LAYOUT_WIDE";

    function addSlideLabel(slide, text, y, size) {
      slide.addText(text, { x: 0.5, y: y || 0.3, w: 12, h: 0.5, fontSize: size || 22, bold: true, color: "10B981" });
    }

    // Slide 1: Title
    var s1 = pptx.addSlide();
    s1.background = { color: "FFFFFF" };
    s1.addText("Student Grade Analyzer", { x: 1, y: 2.5, w: 11, h: 1, fontSize: 40, bold: true, color: "1F2937", align: "center" });
    s1.addText("Performance Summary Report", { x: 1, y: 3.6, w: 11, h: 0.6, fontSize: 20, color: "6B7280", align: "center" });
    s1.addText("100% Private - Generated on your device", { x: 1, y: 6.5, w: 11, h: 0.4, fontSize: 12, color: "9CA3AF", align: "center" });

    // Slide 2: Stats
    var s2 = pptx.addSlide();
    addSlideLabel(s2, "Key Metrics");
    var st = App.entries.length ? window.Ana.computeStats(App.entries.map(function (e) { return e.grade; })) : null;
    var metrics = st ? [
      ["Average", st.avg], ["GPA", st.gpa], ["Highest", st.high],
      ["Lowest", st.low], ["Pass Rate", st.pass + "%"], ["Std Dev", st.std],
    ] : [["No data", ""]];
    var rows = metrics.map(function (m) { return [m[0], String(m[1])]; });
    s2.addTable(rows, { x: 2, y: 1.5, w: 9, fontSize: 16, border: { pt: 1, color: "E5E7EB" }, fill: { color: "F9FAFB" }, valign: "middle", align: "center" });

    // Slide 3: Data table
    var s3 = pptx.addSlide();
    addSlideLabel(s3, "Student Grades");
    var dataRows = App.entries.map(function (e) { return [e.name, e.subject, String(e.grade), e.date || "-", e.type || "exam"]; });
    var full = [["Student", "Subject", "Grade", "Date", "Type"]].concat(dataRows);
    s3.addTable(full, { x: 0.4, y: 1.2, w: 12.5, fontSize: 9, border: { pt: 1, color: "E5E7EB" }, fill: { color: "F9FAFB" }, valign: "middle" });

    // Slide 4: Charts as images (canvas.toDataURL directly - no html2canvas)
    var s4 = pptx.addSlide();
    addSlideLabel(s4, "Visual Analytics");
    var canvases = el ? el.querySelectorAll("canvas") : [];
    var wImg = 6.2, hImg = 3;
    Array.prototype.slice.call(canvases).forEach(function (cv, idx) {
      var col = (idx % 2), row = Math.floor(idx / 2);
      s4.addImage({ data: cv.toDataURL("image/png"), x: 0.3 + col * 6.5, y: 1 + row * 3.1, w: wImg, h: hImg });
    });

    pptx.writeFile({ fileName: "grade-analysis.pptx" });
    restore();
  }

  window.Exp = {
    bind: function () {
      document.getElementById("btnExportPNG").addEventListener("click", exportPNG);
      document.getElementById("btnExportPDF").addEventListener("click", exportPDF);
      document.getElementById("btnExportPPTX").addEventListener("click", exportPPTX);
    },
    init: function () {},
  };
})();