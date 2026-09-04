(function () {
  "use strict";

  var PASS_THRESHOLD = 50;

  var GRADE_SCALE = [
    { min: 90, max: 100, letter: "A", gp: 4.0 },
    { min: 80, max: 89,  letter: "B", gp: 3.0 },
    { min: 70, max: 79,  letter: "C", gp: 2.0 },
    { min: 60, max: 69,  letter: "D", gp: 1.0 },
    { min: 0,  max: 59,  letter: "F", gp: 0.0 },
  ];

  var TRANSLATIONS = {
    en: {
      appTitle: '<span class="accent">Student</span> Grade Analyzer',
      appSubtitle: "Privacy-first performance dashboard",
      enterGrades: "Enter Grades",
      labelStudent: "Student Name",
      labelSubject: "Subject",
      labelGrade: "Grade (0-100)",
      phStudent: "e.g. Alex Johnson",
      phSubject: "e.g. Mathematics",
      phGrade: "e.g. 85.5",
      addEntry: "+ Add Entry",
      clearAll: "Clear All",
      labelPaste: "Or paste CSV / JSON data:",
      phPaste: "CSV: name,subject,grade\nAlex,Math,85",
      importData: "Import Data",
      labelFileImport: "Or import from file:",
      importPDF: "Import PDF",
      importExcel: "Import Excel",
      fileHint: "Files are parsed locally. Nothing leaves your device.",
      classStats: "Class Statistics",
      statAvg: "Average",
      statHighest: "Highest",
      statLowest: "Lowest",
      statPass: "Pass Rate",
      statGPA: "GPA",
      statStd: "Std Dev",
      perfDiagrams: "Performance Diagrams",
      chartSubject: "Subject Scores",
      chartDistribution: "Grade Distribution",
      chartRadar: "Competency Radar",
      downloadPNG: "Download PNG",
      downloadPDF: "Download PDF",
      badgeTopPerf: "Top Performance!",
      badgeImprove: "Improvement Needed",
      badgeAttn: "Needs Attention",
      badgeGood: "All Good!",
      loading: "Processing file...",
      errorPDF: "Could not parse the PDF file.",
      errorExcel: "Could not parse the Excel file.",
      errorNoData: "No valid grade data found in the file.",
      errorParse: "Could not parse data. Use CSV: name,subject,grade",
      errorJSON: "Invalid JSON. Expected an array of objects.",
      errorNoEntries: "No valid entries found.",
      remove: "\u00d7",
    },
    ar: {
      appTitle: '<span class="accent">\u0645\u062d\u0644\u0644</span> \u0627\u0644\u0636\u0639\u0627\u0626\u0645',
      appSubtitle: "\u0644\u0648\u062d\u0629 \u0623\u062f\u0627\u0626\u064a\u0629 \u062a\u062e\u0635\u0635\u064a\u0629 \u0641\u0642\u0637",
      enterGrades: "\u0625\u062f\u062e\u0627\u0644 \u0627\u0644\u0636\u0639\u0627\u0626\u0645",
      labelStudent: "\u0627\u0633\u0645 \u0627\u0644\u0637\u0627\u0644\u0628",
      labelSubject: "\u0627\u0644\u0645\u0627\u062f\u0629",
      labelGrade: "\u0627\u0644\u0636\u0639\u0641\u0629 (0-100)",
      phStudent: "\u0645\u062b\u0644. \u0639\u0644\u064a \u062d\u0633\u0646",
      phSubject: "\u0645\u062b\u0644. \u0631\u064a\u0627\u0636\u064a\u0627\u062a",
      phGrade: "\u0645\u062b\u0644. 85.5",
      addEntry: "+ \u0625\u0636\u0627\u0641\u0629",
      clearAll: "\u0645\u0633\u062d \u0643\u0644\u0634\u0647",
      labelPaste: "\u0623\u0648 \u0627\u0644\u0644\u0635\u0642 \u0628\u064a\u0627\u0646\u0627\u062a CSV / JSON:",
      phPaste: "CSV: \u0627\u0633\u0645,\u0645\u0627\u062f\u0629,\u0636\u0639\u0641\u0629\n\u0639\u0644\u064a,\u0631\u064a\u0627\u0636\u064a\u0627\u062a,85",
      importData: "\u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a",
      labelFileImport: "\u0623\u0648 \u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0645\u0646 \u0645\u0644\u0641:",
      importPDF: "\u0627\u0633\u062a\u064a\u0631\u0627\u062f PDF",
      importExcel: "\u0627\u0633\u062a\u064a\u0631\u0627\u062f Excel",
      fileHint: "\u0627\u0644\u0645\u0644\u0641\u0627\u062a \u062a\u062a\u0645 \u0645\u062d\u0627\u0644\u0627\u062a\u0647\u0627 \u0645\u062d\u0644\u064a\u0627\u064b. \u0644\u0627 \u064a\u063a\u0627\u062f\u0631 \u0634\u064a\u0621 \u062c\u0647\u0627\u0632 \u062c\u0647\u0627\u0632\u0643.",
      classStats: "\u0625\u062d\u0635\u0627\u0626\u064a\u0627\u062a \u0627\u0644\u0641\u0635\u064a\u0644\u0629",
      statAvg: "\u0627\u0644\u0645\u062a\u0648\u0633\u0637",
      statHighest: "\u0627\u0644\u0623\u0639\u0644\u0649",
      statLowest: "\u0627\u0644\u0623\u062f\u0646\u0649",
      statPass: "\u0645\u0639\u0631\u0636 \u0627\u0644\u0646\u062c\u0627\u062d",
      statGPA: "\u0627\u0644\u0645\u0639\u062f\u0644",
      statStd: "\u0627\u0644\u0627\u0646\u062d\u0631\u0627\u0641",
      perfDiagrams: "\u0631\u0633\u0648\u0645 \u0627\u0644\u0623\u062f\u0627\u0621",
      chartSubject: "\u0627\u0644\u0636\u0639\u0627\u0626\u0645 \u0628\u0648\u062c\u0647 \u0627\u0644\u0645\u0627\u062f\u0629",
      chartDistribution: "\u062a\u0648\u0632\u064a\u0639 \u0627\u0644\u0636\u0639\u0627\u0626\u0645",
      chartRadar: "\u062e\u0631\u064a\u0637\u0629 \u0627\u0644\u0643\u0641\u0627\u0621\u0627\u062a",
      downloadPNG: "\u062a\u062d\u0645\u064a\u0644 PNG",
      downloadPDF: "\u062a\u062d\u0645\u064a\u0644 PDF",
      badgeTopPerf: "\u0623\u062f\u0627\u0621 \u0645\u062a\u0645\u064a\u0632!",
      badgeImprove: "\u064a\u062d\u062a\u0627\u062c \u062a\u062d\u0633\u064a\u0646",
      badgeAttn: "\u064a\u062d\u062a\u0627\u062c \u0627\u0646\u062a\u0628\u0627\u0647",
      badgeGood: "\u0643\u0644 \u062a\u0645\u0627\u0645!",
      loading: "\u062c\u0627\u0631\u064a \u0645\u0639\u0627\u0644\u062c\u0629 \u0627\u0644\u0645\u0644\u0641...",
      errorPDF: "\u0644\u0645 \u064a\u0639\u062f \u062a\u062d\u0644\u064a\u0644 \u0645\u0644\u0641 PDF.",
      errorExcel: "\u0644\u0645 \u064a\u0639\u062f \u062a\u062d\u0644\u064a\u0644 \u0645\u0644\u0641 Excel.",
      errorNoData: "\u0644\u0645 \u062a\u0645 \u0639\u062b\u0648\u0631 \u0636\u0639\u0627\u0626\u0645 \u0635\u0627\u0644\u062d\u0629 \u0641\u064a \u0627\u0644\u0645\u0644\u0641.",
      errorParse: "\u0644\u0645 \u064a\u0639\u062f \u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a. \u0627\u0633\u062a\u062e\u062f\u0645 CSV: \u0627\u0633\u0645,\u0645\u0627\u062f\u0629,\u0636\u0639\u0641\u0629",
      errorJSON: "\u0628\u064a\u0627\u0646\u0627\u062a JSON \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629. \u0645\u062a\u0648\u0642\u0639\u0629 \u0645\u0635\u0641\u0648\u0641\u0629.",
      errorNoEntries: "\u0644\u0645 \u062a\u0645 \u0639\u062b\u0648\u0631 \u0635\u0648\u0641 \u0635\u0627\u0644\u062d\u0629.",
      remove: "\u00d7",
    },
  };

  var currentLang = "en";

  function t(key) {
    return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) || TRANSLATIONS.en[key] || key;
  }

  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = t(key);
      if (key === "appTitle") {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      el.placeholder = t(key);
    });
    document.title = currentLang === "ar" ? "\u0645\u062d\u0644\u0644 \u0627\u0644\u0636\u0639\u0627\u0626\u0645" : "Student Grade Analyzer";
    var removeBtns = document.querySelectorAll(".btn-remove");
    removeBtns.forEach(function (btn) { btn.textContent = t("remove"); });
  }

  function setLanguage(lang) {
    currentLang = lang;
    var dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
    var toggleBtn = document.getElementById("langToggle");
    toggleBtn.textContent = lang === "en" ? "AR / EN" : "EN / AR";
    applyTranslations();
    try { localStorage.setItem("lang", lang); } catch (e) { /* ignore */ }
  }

  function toggleLang() {
    setLanguage(currentLang === "en" ? "ar" : "en");
  }

  function getLetter(grade) {
    for (var i = 0; i < GRADE_SCALE.length; i++) {
      if (grade >= GRADE_SCALE[i].min && grade <= GRADE_SCALE[i].max) return GRADE_SCALE[i];
    }
    return GRADE_SCALE[GRADE_SCALE.length - 1];
  }

  function computeStats(grades) {
    if (!grades.length) return null;
    var n = grades.length;
    var sum = grades.reduce(function (a, b) { return a + b; }, 0);
    var avg = sum / n;
    var sorted = grades.slice().sort(function (a, b) { return a - b; });
    var passCount = grades.filter(function (g) { return g >= PASS_THRESHOLD; }).length;
    var std = 0;
    if (n > 1) {
      var sq = grades.reduce(function (acc, g) { return acc + Math.pow(g - avg, 2); }, 0);
      std = Math.sqrt(sq / (n - 1));
    }
    var gpSum = 0;
    var dist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    for (var i = 0; i < grades.length; i++) {
      var info = getLetter(grades[i]);
      gpSum += info.gp;
      dist[info.letter]++;
    }
    return {
      avg: avg.toFixed(2),
      high: sorted[n - 1],
      low: sorted[0],
      pass: ((passCount / n) * 100).toFixed(1),
      gpa: (gpSum / n).toFixed(2),
      std: std.toFixed(2),
      dist: dist,
      n: n,
    };
  }

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function chartColors() {
    return {
      text: cssVar("--chart-text") || "#636e72",
      grid: cssVar("--chart-grid") || "rgba(0,0,0,0.06)",
      tooltipBg: cssVar("--chart-tooltip-bg") || "#2d3436",
    };
  }

  function stripLetterDist(dist) {
    return [dist.A, dist.B, dist.C, dist.D, dist.F].map(function (v) { return (v * 100).toFixed(1); });
  }

  var barChart = null;
  var doughnutChart = null;
  var radarChart = null;

  function renderCharts(stats, entries) {
    var c = chartColors();
    if (barChart) barChart.destroy();
    if (doughnutChart) doughnutChart.destroy();
    if (radarChart) radarChart.destroy();
    if (!entries.length || !stats) return;

    var labels = entries.map(function (e) { return e.subject; });
    var scores = entries.map(function (e) { return e.grade; });

    barChart = new Chart(document.getElementById("barChart"), {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Score",
          data: scores,
          backgroundColor: scores.map(function (s) {
            return s >= PASS_THRESHOLD ? "rgba(0,212,170,0.65)" : "rgba(214,48,49,0.65)";
          }),
          borderColor: scores.map(function (s) {
            return s >= PASS_THRESHOLD ? "#00d4aa" : "#d63031";
          }),
          borderWidth: 1.5,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: c.tooltipBg, titleColor: "#fff", bodyColor: "#fff" } },
        scales: {
          y: { beginAtZero: true, max: 100, ticks: { color: c.text }, grid: { color: c.grid } },
          x: { ticks: { color: c.text }, grid: { display: false } },
        },
      },
    });

    doughnutChart = new Chart(document.getElementById("doughnutChart"), {
      type: "doughnut",
      data: {
        labels: ["A", "B", "C", "D", "F"],
        datasets: [{
          data: stripLetterDist(stats.dist),
          backgroundColor: ["rgba(0,212,170,0.75)", "rgba(34,177,76,0.75)", "rgba(255,193,7,0.75)", "rgba(255,152,0,0.75)", "rgba(214,48,49,0.75)"],
          borderColor: ["#00d4aa", "#22b14c", "#ffc107", "#ff9800", "#d63031"],
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: "bottom", labels: { color: c.text, padding: 12, font: { size: 11 } } },
          tooltip: { backgroundColor: c.tooltipBg, titleColor: "#fff", bodyColor: "#fff", callbacks: { label: function (ctx) { return ctx.label + ": " + ctx.parsed + "%"; } } },
        },
      },
    });

    radarChart = new Chart(document.getElementById("radarChart"), {
      type: "radar",
      data: {
        labels: labels,
        datasets: [{
          label: "Score",
          data: scores,
          backgroundColor: "rgba(0,212,170,0.2)",
          borderColor: "#00d4aa",
          pointBackgroundColor: "#00d4aa",
          pointBorderColor: "#fff",
          pointRadius: 4,
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: c.tooltipBg, titleColor: "#fff", bodyColor: "#fff" } },
        scales: {
          r: { beginAtZero: true, max: 100, ticks: { color: c.text, backdropColor: "transparent" }, grid: { color: c.grid }, pointLabels: { color: c.text, font: { size: 11 } }, angleLines: { color: c.grid } },
        },
      },
    });
  }

  function renderStats(stats) {
    var ids = ["statAvg", "statHighest", "statLowest", "statPass", "statGPA", "statStd"];
    var keys = ["avg", "high", "low", "pass", "gpa", "std"];
    var suffixes = ["", "", "", "%", "", ""];
    ids.forEach(function (id, i) {
      document.getElementById(id).textContent = stats ? stats[keys[i]] + suffixes[i] : "--";
    });
    var badgeBox = document.getElementById("feedbackBadges");
    badgeBox.innerHTML = "";
    if (!stats) return;
    var badges = [];
    if (Number(stats.avg) >= 85) badges.push({ cls: "badge-success", key: "badgeTopPerf" });
    if (Number(stats.pass) < 70) badges.push({ cls: "badge-warning", key: "badgeImprove" });
    if (stats.low < PASS_THRESHOLD) badges.push({ cls: "badge-error", text: stats.low + " < " + PASS_THRESHOLD + " - " + t("badgeAttn") });
    if (!badges.length) badges.push({ cls: "badge-success", key: "badgeGood" });
    badges.forEach(function (b) {
      var span = document.createElement("span");
      span.className = "badge " + b.cls;
      span.textContent = b.text || t(b.key);
      badgeBox.appendChild(span);
    });
  }

  function collectEntries() {
    var rows = document.querySelectorAll("#gradeEntries .grade-row");
    var entries = [];
    rows.forEach(function (row) {
      var nm = row.querySelector(".ri-name");
      var sj = row.querySelector(".ri-subject");
      var gr = row.querySelector(".ri-grade");
      if (!nm || !sj || !gr) return;
      var name = nm.value.trim();
      var subject = sj.value.trim();
      var grade = parseFloat(gr.value);
      if (name && subject && !isNaN(grade)) {
        entries.push({ name: name, subject: subject, grade: grade });
      }
    });
    return entries;
  }

  function updateAll() {
    var entries = collectEntries();
    var grades = entries.map(function (e) { return e.grade; });
    var stats = computeStats(grades);
    renderStats(stats);
    renderCharts(stats, entries);
    try {
      if (entries.length) {
        localStorage.setItem("studentGrades", JSON.stringify(entries));
      } else {
        localStorage.removeItem("studentGrades");
      }
    } catch (e) { /* ignore */ }
  }

  function createRow(name, subject, grade) {
    var row = document.createElement("div");
    row.className = "grade-row";
    row.innerHTML =
      '<input type="text" class="ri-name" placeholder="' + t("phStudent") + '" value="' + (name || "") + '">' +
      '<input type="text" class="ri-subject" placeholder="' + t("phSubject") + '" value="' + (subject || "") + '">' +
      '<input type="number" class="ri-grade" placeholder="0-100" min="0" max="100" step="0.1" value="' + (grade !== undefined && grade !== "" ? grade : "") + '">' +
      '<button class="btn-remove" title="Remove">' + t("remove") + '</button>';

    row.querySelector(".btn-remove").addEventListener("click", function () {
      row.remove();
      updateAll();
    });
    row.querySelectorAll("input").forEach(function (inp) {
      inp.addEventListener("input", updateAll);
    });
    return row;
  }

  function addEntryFromForm() {
    var nameEl = document.getElementById("studentName");
    var subjEl = document.getElementById("subjectName");
    var gradeEl = document.getElementById("gradeInput");
    var name = nameEl.value.trim();
    var subject = subjEl.value.trim();
    var grade = gradeEl.value;
    if (!name || !subject || grade === "") { gradeEl.focus(); return; }
    var container = document.getElementById("gradeEntries");
    container.appendChild(createRow(name, subject, grade));
    nameEl.value = "";
    subjEl.value = "";
    gradeEl.value = "";
    nameEl.focus();
    updateAll();
  }

  function clearAll() {
    document.getElementById("gradeEntries").innerHTML = "";
    document.getElementById("dataPaste").value = "";
    try { localStorage.removeItem("studentGrades"); } catch (e) { /* ignore */ }
    updateAll();
  }

  function showLoading() {
    var overlay = document.createElement("div");
    overlay.className = "loading-overlay";
    overlay.id = "loadingOverlay";
    overlay.innerHTML = '<div class="loading-spinner">' + t("loading") + "</div>";
    document.body.appendChild(overlay);
  }

  function hideLoading() {
    var el = document.getElementById("loadingOverlay");
    if (el) el.remove();
  }

  function loadEntriesIntoDOM(entries) {
    var container = document.getElementById("gradeEntries");
    container.innerHTML = "";
    entries.forEach(function (e) {
      container.appendChild(createRow(e.name, e.subject, e.grade));
    });
    updateAll();
  }

  function importFromText(text) {
    var entries = [];
    try {
      var parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        entries = parsed.map(function (item) {
          return { name: String(item.name || item["\u0627\u0633\u0645"] || ""), subject: String(item.subject || item["\u0627\u0644\u0645\u0627\u062f\u0629"] || ""), grade: Number(item.grade || item["\u0627\u0644\u0636\u0639\u0641\u0629"]) || 0 };
        });
      } else {
        alert(t("errorJSON"));
        return false;
      }
    } catch (e) {
      var lines = text.split("\n").filter(function (l) { return l.trim(); });
      var rows = lines.map(function (l) { return l.split(",").map(function (c) { return c.trim(); }); });
      if (!rows.length || rows[0].length < 3) {
        alert(t("errorParse"));
        return false;
      }
      var startIdx = 0;
      var first = rows[0][0].toLowerCase();
      if (["name", "student", "subject", "grade", "\u0627\u0633\u0645", "\u0637\u0627\u0644\u0628", "\u0627\u0644\u0645\u0627\u062f\u0629", "\u0627\u0644\u0636\u0639\u0641\u0629"].indexOf(first) !== -1) {
        startIdx = 1;
      }
      entries = rows.slice(startIdx).map(function (r) {
        return { name: r[0] || "", subject: r[1] || "", grade: Number(r[2]) || 0 };
      });
    }
    if (!entries.length) { alert(t("errorNoEntries")); return false; }
    loadEntriesIntoDOM(entries);
    return true;
  }

  function importFromRows(rows) {
    if (!rows.length) { alert(t("errorNoEntries")); return; }
    var headerRow = rows[0];
    var nameIdx = -1, subjIdx = -1, gradeIdx = -1;
    for (var i = 0; i < headerRow.length; i++) {
      var val = String(headerRow[i]).toLowerCase().trim();
      if (val === "name" || val === "student" || val === "\u0627\u0633\u0645" || val === "\u0637\u0627\u0644\u0628") nameIdx = i;
      if (val === "subject" || val === "\u0627\u0644\u0645\u0627\u062f\u0629") subjIdx = i;
      if (val === "grade" || val === "\u0627\u0644\u0636\u0639\u0641\u0629" || val === "score" || val === "\u0627\u0644\u0646\u062a\u064a\u062c\u0629") gradeIdx = i;
    }
    var startRow = 0;
    if (nameIdx !== -1 && subjIdx !== -1 && gradeIdx !== -1) {
      startRow = 1;
    } else {
      nameIdx = 0;
      subjIdx = 1;
      gradeIdx = 2;
    }
    var entries = [];
    for (var j = startRow; j < rows.length; j++) {
      var r = rows[j];
      if (r.length > Math.max(nameIdx, subjIdx, gradeIdx)) {
        var name = String(r[nameIdx] || "").trim();
        var subject = String(r[subjIdx] || "").trim();
        var grade = parseFloat(String(r[gradeIdx]).replace(/[^\d.\-]/g, ""));
        if (name || subject) {
          entries.push({ name: name, subject: subject, grade: isNaN(grade) ? 0 : grade });
        }
      }
    }
    if (!entries.length) { alert(t("errorNoData")); return; }
    loadEntriesIntoDOM(entries);
  }

  function importFromTextFlat(text) {
    var lines = text.split("\n").filter(function (l) { return l.trim(); });
    var rows = lines.map(function (l) { return l.split(/[,\t]/).map(function (c) { return c.trim(); }); });
    importFromRows(rows);
  }

  function importData() {
    var textarea = document.getElementById("dataPaste");
    var text = textarea.value.trim();
    if (!text) return;
    importFromText(text);
    textarea.value = "";
  }

  function importPDF(file) {
    showLoading();
    var reader = new FileReader();
    reader.onload = function (e) {
      var data = new Uint8Array(e.target.result);
      if (typeof pdfjsLib !== "undefined") {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        pdfjsLib.getDocument({ data: data }).promise.then(function (pdf) {
          var textParts = [];
          var promises = [];
          for (var i = 1; i <= pdf.numPages; i++) {
            promises.push(pdf.getPage(i).then(function (page) {
              return page.getTextContent().then(function (content) {
                var strings = content.items.map(function (item) { return item.str; });
                textParts.push(strings.join(" "));
              });
            }));
          }
          Promise.all(promises).then(function () {
            hideLoading();
            var fullText = textParts.join("\n");
            if (!importFromText(fullText)) {
              importFromTextFlat(fullText);
            }
          });
        }).catch(function () {
          hideLoading();
          alert(t("errorPDF"));
        });
      } else {
        hideLoading();
        alert(t("errorPDF"));
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function importExcel(file) {
    showLoading();
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: "array" });
        var sheetName = workbook.SheetNames[0];
        var sheet = workbook.Sheets[sheetName];
        var jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        hideLoading();
        importFromRows(jsonData);
      } catch (err) {
        hideLoading();
        alert(t("errorExcel"));
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function downloadPNG() {
    var chartArea = document.querySelector(".charts-panel");
    if (!chartArea) return;
    html2canvas(chartArea, { backgroundColor: null, scale: 2 }).then(function (canvas) {
      var link = document.createElement("a");
      link.download = "grade-analysis.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  }

  function downloadPDF() {
    var chartArea = document.querySelector(".charts-panel");
    if (!chartArea) return;
    html2canvas(chartArea, { backgroundColor: null, scale: 2 }).then(function (canvas) {
      var imgData = canvas.toDataURL("image/png");
      var pdf = new jspdf.jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save("grade-analysis.pdf");
    });
  }

  function toggleTheme() {
    var html = document.documentElement;
    var next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
  }

  function init() {
    try {
      var savedTheme = localStorage.getItem("theme");
      if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);
    } catch (e) { /* ignore */ }

    try {
      var savedLang = localStorage.getItem("lang");
      if (savedLang) setLanguage(savedLang);
    } catch (e) { /* ignore */ }

    document.getElementById("addEntryBtn").addEventListener("click", addEntryFromForm);
    document.getElementById("clearAllBtn").addEventListener("click", clearAll);
    document.getElementById("importBtn").addEventListener("click", importData);
    document.getElementById("themeToggle").addEventListener("click", toggleTheme);
    document.getElementById("langToggle").addEventListener("click", toggleLang);
    document.getElementById("exportPNGBtn").addEventListener("click", downloadPNG);
    document.getElementById("exportPDFBtn").addEventListener("click", downloadPDF);

    document.getElementById("pdfFileInput").addEventListener("change", function (e) {
      var file = e.target.files[0];
      if (file) importPDF(file);
      e.target.value = "";
    });

    document.getElementById("excelFileInput").addEventListener("change", function (e) {
      var file = e.target.files[0];
      if (file) importExcel(file);
      e.target.value = "";
    });

    ["studentName", "subjectName", "gradeInput"].forEach(function (id) {
      document.getElementById(id).addEventListener("keydown", function (e) {
        if (e.key === "Enter") addEntryFromForm();
      });
    });

    try {
      var saved = localStorage.getItem("studentGrades");
      if (saved) {
        var arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length) {
          var container = document.getElementById("gradeEntries");
          arr.forEach(function (e) {
            container.appendChild(createRow(e.name, e.subject, e.grade));
          });
          updateAll();
          return;
        }
      }
    } catch (e) { /* ignore */ }

    updateAll();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
