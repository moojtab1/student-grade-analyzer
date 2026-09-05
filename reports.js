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

  function studentReportHTML(name) {
    var entries = App.entries.filter(function (e) { return e.name === name; });
    if (!entries.length) return "";
    var grades = entries.map(function (e) { return e.grade; });
    var st = window.Ana.computeStats(grades);
    var subjMap = {};
    entries.forEach(function (e) {
      if (!subjMap[e.subject]) subjMap[e.subject] = [];
      subjMap[e.subject].push(e.grade);
    });

    var html = '<div class="glass-card p-6">';
    html += '<h3 class="text-xl font-extrabold mb-1">' + name + "</h3>";
    html += '<p class="text-sm text-gray-400 mb-4">' + (window.App.currentLang === "ar" ? "\u0643\u0634\u0641 \u0627\u0644\u062f\u0631\u062c\u0627\u062a" : "Report Card") + "</p>";

    html += '<div class="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">';
    var stats = [
      [st.avg, "Avg"], [st.gpa, "GPA"], [st.high, "Max"], [st.low, "Min"],
      [st.median, "Median"], [st.pass + "%", "Pass"],
    ];
    stats.forEach(function (s) {
      html += '<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center"><div class="text-lg font-bold text-emerald-500">' + s[0] + '</div><div class="text-[10px] text-gray-400">' + s[1] + "</div></div>";
    });
    html += "</div>";

    html += '<table class="w-full text-sm"><thead><tr class="text-xs text-gray-400 border-b"><th class="p-2 text-left">Subject</th><th class="p-2">Avg</th><th class="p-2">Grade</th></tr></thead><tbody>';
    Object.keys(subjMap).forEach(function (s) {
      var avg = subjMap[s].reduce(function (a, b) { return a + b; }, 0) / subjMap[s].length;
      var info = window.Ana.letterOf(avg);
      html += '<tr class="border-b"><td class="p-2">' + s + '</td><td class="p-2 text-center">' + avg.toFixed(1) + '</td><td class="p-2 text-center font-bold">' + info.letter + "</td></tr>";
    });
    if (!Object.keys(subjMap).length) html += '<tr><td colspan="3" class="p-2 text-center text-gray-400">No subjects</td></tr>';
    html += "</tbody></table>";

    html += '<div class="mt-4 text-xs text-gray-400">GPA: ' + st.gpa + " / 4.0 &middot; StdDev: " + st.std + "</div>";
    html += "</div>";
    return html;
  }

  function renderStudentReport() {
    var sel = document.getElementById("reportStudent");
    var name = sel.value;
    var box = document.getElementById("printArea");
    if (!name) {
      box.innerHTML = '<p class="text-sm text-gray-400">' + (window.App.currentLang === "ar" ? "\u0627\u062e\u062a\u0631 \u0637\u0627\u0644\u0628\u0627\u064b" : "Select a student") + "</p>";
      return;
    }
    box.innerHTML = studentReportHTML(name);
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

  function printArea(cssText) {
    var pa = document.getElementById("printArea");
    pa.className = "";
    var w = window.open("", "_blank");
    if (w) {
      w.document.write("<html><head><title>Report</title><style>" + cssText + "</style></head><body>" + pa.innerHTML + "</body></html>");
      w.document.close();
      w.print();
    } else {
      window.print();
    }
  }

  function printStudent() {
    renderStudentReport();
    printArea("body{font-family:Segoe UI,Arial,sans-serif;padding:30px}table{border-collapse:collapse;width:100%}td,th{padding:8px;border-bottom:1px solid #ddd}th{background:#f5f5f5}");
  }

  function printSummary() {
    var box = document.getElementById("classSummaryContent");
    var pa = document.getElementById("printArea");
    pa.innerHTML = '<div class="glass-card p-6"><h3 class="text-xl font-bold mb-4">Class Summary</h3>' + box.innerHTML + "</div>";
    printArea("body{font-family:Segoe UI,Arial,sans-serif;padding:30px}table{border-collapse:collapse;width:100%}td,th{padding:8px;border-bottom:1px solid #ddd}th{background:#f5f5f5}");
  }

  function pdfArea() {
    var pa = document.getElementById("printArea");
    if (typeof html2canvas === "undefined" || typeof jspdf === "undefined") { alert("Export libs not loaded"); return; }
    html2canvas(pa, { scale: 2, backgroundColor: "#ffffff" }).then(function (canvas) {
      var img = canvas.toDataURL("image/png");
      var pdf = new jspdf.jsPDF({ unit: "px", format: [canvas.width / 2, canvas.height / 2], orientation: canvas.width > canvas.height ? "landscape" : "portrait" });
      pdf.addImage(img, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save("report.pdf");
    });
  }

  function pdfStudent() { renderStudentReport(); pdfArea(); }
  function pdfSummary() {
    var box = document.getElementById("classSummaryContent");
    document.getElementById("printArea").innerHTML = '<div class="text-2xl font-bold mb-4">Class Summary</div>' + box.innerHTML;
    pdfArea();
  }

  window.Rpt = {
    refreshStudentList: refreshStudentList,
    renderSummary: renderSummary,
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
