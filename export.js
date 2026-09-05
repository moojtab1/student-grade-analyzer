(function () {
  "use strict";

  var App = window.App;

  function exportPNG() {
    var targets = document.querySelectorAll("#page-dashboard canvas");
    if (!targets.length) { alert("No charts to export"); return; }
    targets.forEach(function (canvas, i) {
      var link = document.createElement("a");
      link.download = "chart-" + (i + 1) + ".png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  }

  function exportPDF() {
    var area = document.querySelector(".page-section.active") || document.getElementById("page-dashboard");
    if (typeof html2canvas === "undefined" || typeof jspdf === "undefined") { alert("Export libs not loaded"); return; }
    if (typeof jspdf.jsPDF === "undefined") { alert("jsPDF not loaded"); return; }
    html2canvas(area, { scale: 2, backgroundColor: "#ffffff" }).then(function (canvas) {
      var img = canvas.toDataURL("image/png");
      var pdf = new jspdf.jsPDF("p", "mm", "a4");
      var w = pdf.internal.pageSize.getWidth();
      var h = (canvas.height / canvas.width) * w;
      pdf.addImage(img, "PNG", 0, 0, w, h);
      pdf.save("grade-analysis.pdf");
    });
  }

  function exportPPTX() {
    if (typeof PptxGenJS === "undefined") { alert("PptxGenJS not loaded"); return; }
    var pptx = new PptxGenJS();
    pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
    pptx.layout = "LAYOUT_WIDE";

    var slides = { title: 0, stats: 0, charts: 0, export: 0 };
    var l = 0.5, t = 0.8, w = 6, h = 5;
    var chartNodes = [];

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

    // Slide 4: Charts as images
    var s4 = pptx.addSlide();
    addSlideLabel(s4, "Visual Analytics");

    function exportPPTChartImage(canvas) {
      return new Promise(function (resolve) {
        if (typeof html2canvas === "undefined") {
          var img = document.createElement("img");
          img.src = canvas.toDataURL("image/png");
          resolve({ data: img.src, w: 6.2, h: 3 });
          return;
        }
        html2canvas(canvas.parentElement, { backgroundColor: "#ffffff", scale: 2 }).then(function (c) {
          resolve({ data: c.toDataURL("image/png"), w: 6.2, h: 3 });
        });
      });
    }

    var canvases = document.querySelectorAll("#page-dashboard canvas");
    var idx = 0;
    var chartPromises = Array.prototype.slice.call(canvases).map(function (cv) {
      return exportPPTChartImage(cv).then(function (imgData) {
        var col = (idx % 2), row = Math.floor(idx / 2);
        s4.addImage({ data: imgData.data, x: 0.3 + col * 6.5, y: 1 + row * 3.1, w: imgData.w, h: imgData.h });
        idx++;
      });
    });

    Promise.all(chartPromises).then(function () {
      pptx.writeFile({ fileName: "grade-analysis.pptx" });
    });
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
