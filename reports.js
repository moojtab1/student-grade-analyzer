(function () {
  "use strict";

  var App = window.App;

  function refreshStudentList() {
    var students = App.util.uniqueStudents();
    ["reportStudent", "progressStudent"].forEach(function (id) {
      var sel = document.getElementById(id);
      var cur = sel.value;
      sel.innerHTML = '<option value="">' + (window.App.currentLang === "ar" ? "\u0627\u062e\u062a\u0631 \u0627\u0644\u0637\u0627\u0644\u0628..." : "Select student...") + "</option>";
      students.forEach(function (s) {
        var o = document.createElement("option");
        o.value = s; o.textContent = s;
        sel.appendChild(o);
      });
      if (cur && students.indexOf(cur) !== -1) sel.value = cur;
    });
  }

  function studentReportHTML(name, entries) {
    if (!entries.length) return "";
    var grades = entries.map(function (e) { return e.grade; });
    var st = window.Ana.computeStats(grades);
    var subjMap = {};
    entries.forEach(function (e) {
      if (!subjMap[e.subject]) subjMap[e.subject] = [];
      subjMap[e.subject].push(e.grade);
    });

    var T = function (k, fallback) { return window.App.t(k) || fallback; };
    var html = '<div class="p-2">';
    html += '<h3 class="text-xl font-extrabold mb-1">' + name + "</h3>";
    html += '<p class="text-sm text-gray-400 mb-4">' + T("reportCard", "Report Card") + "</p>";

    html += '<div class="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">';
    var stats = [
      [st.avg, "Avg"], [st.gpa, "GPA"], [st.high, "Max"], [st.low, "Min"],
      [st.median, "Median"], [st.pass + "%", "Pass"],
    ];
    stats.forEach(function (s) {
      html += '<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center"><div class="text-lg font-bold text-emerald-500">' + s[0] + '</div><div class="text-[10px] text-gray-400">' + s[1] + "</div></div>";
    });
    html += "</div>";

    html += '<table class="w-full text-sm"><thead><tr class="text-xs text-gray-400 border-b"><th class="p-2 text-left">' + T("subject", "Subject") + '</th><th class="p-2">' + T("average", "Avg") + '</th><th class="p-2">Grade</th></tr></thead><tbody>';
    Object.keys(subjMap).forEach(function (s) {
      var avg = subjMap[s].reduce(function (a, b) { return a + b; }, 0) / subjMap[s].length;
      var info = window.Ana.letterOf(avg);
      html += '<tr class="border-b"><td class="p-2">' + s + '</td><td class="p-2 text-center">' + avg.toFixed(1) + '</td><td class="p-2 text-center font-bold">' + info.letter + "</td></tr>";
    });
    if (!Object.keys(subjMap).length) html += '<tr><td colspan="3" class="p-2 text-center text-gray-400">' + T("empty", "No entries") + "</td></tr>";
    html += "</tbody></table>";

    html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" id="rptCharts">';
    html += '<div><h4 class="text-xs font-semibold mb-2 text-gray-500">' + T("rptSubjectAvg", "Subject Averages") + '</h4><canvas id="rptSubjBar"></canvas></div>';
    html += '<div><h4 class="text-xs font-semibold mb-2 text-gray-500">' + T("rptTrend", "Grade Trend") + '</h4><canvas id="rptTrendLine"></canvas></div>';
    html += "</div>";

    html += '<div class="mt-4 text-xs text-gray-400">GPA: ' + st.gpa + " / 4.0 &middot; StdDev: " + st.std + "</div>";
    html += "</div>";
    return html;
  }

  function renderReportCharts(entries) {
    var subjMap = {};
    entries.forEach(function (e) {
      if (!subjMap[e.subject]) subjMap[e.subject] = [];
      subjMap[e.subject].push(e.grade);
    });
    var lbl = [], vals = [];
    Object.keys(subjMap).forEach(function (s) {
      var avg = subjMap[s].reduce(function (a, b) { return a + b; }, 0) / subjMap[s].length;
      lbl.push(s); vals.push(+avg.toFixed(1));
    });
    if (lbl.length && window.Ch) window.Ch.makeBar("rptSubjBar", lbl, vals);

    var ordered = entries.slice().sort(function (a, b) {
      if (a.date && b.date && a.date !== b.date) return String(a.date) < String(b.date) ? -1 : 1;
      if (a.date && !b.date) return 1;
      if (!a.date && b.date) return -1;
      return 0;
    });
    var tLbl = ordered.map(function (e, i) {
      if (e.date) {
        var p = String(e.date).split("-");
        return p[0] + "/" + p[1];
      }
      return String(i + 1);
    });
    var tVal = ordered.map(function (e) { return e.grade; });
    if (tVal.length > 1 && window.Ch) window.Ch.makeLine("rptTrendLine", tLbl, tVal);
  }

  function renderStudentReport() {
    var sel = document.getElementById("reportStudent");
    var name = sel.value;
    var box = document.getElementById("reportDisplay");
    if (!name) {
      box.innerHTML = '<p class="text-sm text-gray-400">' + (window.App.currentLang === "ar" ? "\u0627\u062e\u062a\u0631 \u0637\u0627\u0644\u0628\u0627\u064b" : "Select a student") + "</p>";
      return;
    }
    var entries = App.entries.filter(function (e) { return e.name === name; });
    box.innerHTML = studentReportHTML(name, entries);
    renderReportCharts(entries);
  }

  function renderSummary() {
    var box = document.getElementById("classSummaryContent");
    if (!App.entries.length) {
      box.innerHTML = '<p class="text-sm text-gray-400">No data</p>';
      return;
    }
    var st = window.Ana.computeStats(App.entries.map(function (e) { return e.grade; }));
    var subj = window.Ana.subjectAverages();
    var html = '<div class="overflow-x-auto">';
    html += '<table class="w-full text-sm"><thead><tr class="text-xs text-gray-400 border-b"><th class="p-2">Subject</th><th class="p-2">Avg</th><th class="p-2">Students</th><th class="p-2">Entries</th></tr></thead><tbody>';
    subj.forEach(function (s) {
      var stStudents = {};
      App.entries.filter(function (e) { return e.subject === s.subject; }).forEach(function (e) { stStudents[e.name] = true; });
      html += '<tr class="border-b"><td class="p-2">' + s.subject + '</td><td class="p-2">' + s.avg.toFixed(1) + '</td><td class="p-2">' + Object.keys(stStudents).length + '</td><td class="p-2">' + s.count + "</td></tr>";
    });
    html += "</tbody></table></div>";
    html += '<div class="mt-3 text-sm text-gray-500">Overall Average: ' + st.avg + " &middot; Pass Rate: " + st.pass + "% &middot; GPA: " + st.gpa + "</div>";
    box.innerHTML = html;
  }

  /* Render an element off-screen so html2canvas / print can capture it even
     when it normally lives inside a hidden section. Returns a restore fn. */
  function setOffscreen(el) {
    var hadHidden = el.classList.contains("hidden");
    var prevStyle = el.getAttribute("style") || "";
    el.classList.remove("hidden");
    el.classList.add("page-section", "active");
    el.style.position = "absolute";
    el.style.left = "-10000px";
    el.style.top = "0";
    el.style.width = "760px";
    el.style.zIndex = "-1";
    el.style.display = "block";
    void el.offsetHeight;
    return function restore() {
      if (hadHidden) el.classList.add("hidden");
      el.classList.remove("page-section", "active");
      if (prevStyle) el.setAttribute("style", prevStyle); else el.removeAttribute("style");
    };
  }

  /* Turn a rendered report's Chart.js canvases into <img> data-URLs so the
     bitmap survives printing / PDF export. */
  function serializeCanvases(html) {
    var div = document.createElement("div");
    div.innerHTML = html;
    div.querySelectorAll("canvas").forEach(function (cv) {
      var img = document.createElement("img");
      try {
        img.src = cv.toDataURL("image/png");
      } catch (e) {
        return;
      }
      img.style.maxWidth = "100%";
      cv.parentNode.replaceChild(img, cv);
    });
    return div.innerHTML;
  }

  function buildPrintHTML() {
    var src = document.getElementById("reportDisplay");
    return serializeCanvases(src.innerHTML);
  }

  function printArea(cssText) {
    var pa = document.getElementById("printArea");
    pa.className = "";
    pa.innerHTML = buildPrintHTML();
    var restore = setOffscreen(pa);
    var w = window.open("", "_blank");
    if (w) {
      var body = pa.innerHTML;
      w.document.write("<html><head><title>Report</title><style>" + cssText + "</style></head><body>" + body + "</body></html>");
      w.document.close();
      w.print();
    } else {
      window.print();
    }
    restore();
  }

  function printStudent() {
    renderStudentReport();
    printArea("body{font-family:Segoe UI,Arial,sans-serif;padding:30px}table{border-collapse:collapse;width:100%}td,th{padding:8px;border-bottom:1px solid #ddd}th{background:#f5f5f5}img{max-width:100%}");
  }

  function printSummary() {
    var box = document.getElementById("classSummaryContent");
    var pa = document.getElementById("printArea");
    pa.innerHTML = '<div class="glass-card p-6"><h3 class="text-xl font-bold mb-4">Class Summary</h3>' + box.innerHTML + "</div>";
    setOffscreen(pa);
    var w = window.open("", "_blank");
    if (w) {
      w.document.write("<html><head><title>Report</title><style>body{font-family:Segoe UI,Arial,sans-serif;padding:30px}table{border-collapse:collapse;width:100%}td,th{padding:8px;border-bottom:1px solid #ddd}th{background:#f5f5f5}</style></head><body>" + pa.innerHTML + "</body></html>");
      w.document.close();
      w.print();
    } else {
      window.print();
    }
    pa.className = "hidden";
    pa.removeAttribute("style");
  }

  function pdfArea() {
    var pa = document.getElementById("printArea");
    if (typeof html2canvas === "undefined" || typeof jspdf === "undefined") { alert("Export libs not loaded"); return; }
    var restore = setOffscreen(pa);
    html2canvas(pa, { scale: 2, backgroundColor: "#ffffff" }).then(function (canvas) {
      restore();
      var img = canvas.toDataURL("image/png");
      var pdf = new jspdf.jsPDF({ unit: "px", format: [canvas.width / 2, canvas.height / 2], orientation: canvas.width > canvas.height ? "landscape" : "portrait" });
      pdf.addImage(img, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save("report.pdf");
    }).catch(function () { restore(); });
  }

  function pdfStudent() {
    renderStudentReport();
    var pa = document.getElementById("printArea");
    pa.className = "";
    pa.innerHTML = buildPrintHTML();
    pdfArea();
  }

  function pdfSummary() {
    var box = document.getElementById("classSummaryContent");
    var pa = document.getElementById("printArea");
    pa.className = "";
    pa.innerHTML = '<div class="text-2xl font-bold mb-4">Class Summary</div>' + box.innerHTML;
    pdfArea();
  }

  window.Rpt = {
    refreshStudentList: refreshStudentList,
    renderSummary: renderSummary,
    renderStudentReport: renderStudentReport,
    bind: function () {
      document.getElementById("reportStudent").addEventListener("change", renderStudentReport);
      document.getElementById("btnPrintReport").addEventListener("click", printStudent);
      document.getElementById("btnPDFReport").addEventListener("click", pdfStudent);
      document.getElementById("btnPrintSummary").addEventListener("click", printSummary);
      document.getElementById("btnPDFSummary").addEventListener("click", pdfSummary);
    },
    init: function () {},
  };
})();