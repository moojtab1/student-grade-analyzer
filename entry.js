(function () {
  "use strict";

  var App = window.App;

  function renderEntryTable() {
    var tbody = document.getElementById("entryBody");
    tbody.innerHTML = "";
    if (!App.entries.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-sm text-gray-400">No entries</td></tr>';
      return;
    }
    App.entries.slice().reverse().forEach(function (e, idx) {
      var tr = document.createElement("tr");
      tr.className = "border-b dark:border-gray-800 text-xs";
      var origIdx = App.entries.length - 1 - idx;
      tr.innerHTML =
        '<td class="p-2">' + e.name + "</td>" +
        '<td class="p-2">' + e.subject + "</td>" +
        '<td class="p-2 font-semibold">' + e.grade + "</td>" +
        '<td class="p-2 text-gray-400">' + (e.date || "-") + "</td>" +
        '<td class="p-2 text-gray-400">' + (e.type || "exam") + "</td>" +
        '<td class="p-2"><button data-idx="' + origIdx + '" class="btn-danger text-xs px-2 py-1">\u00d7</button></td>';
      tr.querySelector("button").addEventListener("click", function () {
        App.entries.splice(origIdx, 1);
        App.entries = App.entries.slice();
        renderEntryTable();
        window.App.refreshDashboard();
      });
      tbody.appendChild(tr);
    });
  }

  function addEntry() {
    var name = document.getElementById("inpName").value.trim();
    var subject = document.getElementById("inpSubject").value.trim();
    var grade = parseFloat(document.getElementById("inpGrade").value);
    var date = document.getElementById("inpDate").value;
    var type = document.getElementById("inpType").value;
    var semester = document.getElementById("inpSemester").value.trim();
    if (!name || !subject || isNaN(grade)) {
      document.getElementById("inpName").focus();
      return;
    }
    App.entries.push({ name: name, subject: subject, grade: grade, date: date || null, type: type, semester: semester || null });
    document.getElementById("inpName").value = "";
    document.getElementById("inpSubject").value = "";
    document.getElementById("inpGrade").value = "";
    document.getElementById("inpSemester").value = "";
    renderEntryTable();
    window.App.refreshDashboard();
  }

  function clearAll() {
    if (!confirm(window.App.currentLang === "ar" ? "\u062a\u0623\u0643\u064a\u062f \u0645\u0633\u062d \u0643\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a\u061f" : "Clear ALL data?")) return;
    App.entries = [];
    renderEntryTable();
    window.App.refreshDashboard();
  }

  function importFromText(text) {
    var entries = [];
    try {
      var parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        entries = parsed.map(function (i) {
          return { name: String(i.name || i["\u0627\u0633\u0645"] || ""), subject: String(i.subject || i["\u0627\u0644\u0645\u0627\u062f\u0629"] || ""), grade: Number(i.grade || i["\u0627\u0644\u062f\u0631\u062c\u0629"]) || 0, date: i.date || null, type: i.type || "exam", semester: i.semester || null };
        });
      } else {
        alert("Invalid JSON."); return;
      }
    } catch (e) {
      var lines = text.split("\n").filter(function (l) { return l.trim(); });
      var rows = lines.map(function (l) { return l.split(/[,\t]/).map(function (c) { return c.trim(); }); });
      if (!rows.length || rows[0].length < 3) { alert("Could not parse CSV."); return; }
      var start = 0;
      var f = rows[0][0].toLowerCase();
      if (["name", "student", "\u0627\u0633\u0645", "\u0637\u0627\u0644\u0628"].indexOf(f) !== -1) start = 1;
      entries = rows.slice(start).map(function (r) {
        return { name: r[0] || "", subject: r[1] || "", grade: Number(r[2]) || 0, date: r[3] || null, type: r[4] || "exam", semester: r[5] || null };
      });
    }
    if (!entries.length) { alert("No valid entries."); return; }
    App.entries = App.entries.concat(entries);
    renderEntryTable();
    window.App.refreshDashboard();
  }

  function importFromRows(rows) {
    if (!rows.length) return;
    var h = rows[0];
    var nameIdx = -1, subjIdx = -1, gradeIdx = -1, dateIdx = -1, typeIdx = -1, semIdx = -1;
    var checks = {
      name: function (v) { return ["name", "student", "\u0627\u0633\u0645", "\u0637\u0627\u0644\u0628"].indexOf(v) !== -1; },
      subject: function (v) { return v === "subject" || v === "\u0627\u0644\u0645\u0627\u062f\u0629"; },
      grade: function (v) { return v === "grade" || v === "score" || v === "\u0627\u0644\u062f\u0631\u062c\u0629" || v === "\u0627\u0644\u0646\u062a\u064a\u062c\u0629"; },
      date: function (v) { return v === "date" || v === "\u0627\u0644\u062a\u0627\u0631\u064a\u062e"; },
      type: function (v) { return v === "type" || v === "\u0627\u0644\u0646\u0648\u0639"; },
      semester: function (v) { return v === "semester" || v === "\u0627\u0644\u0641\u0635\u0644"; },
    };
    h.forEach(function (cell, i) {
      var v = String(cell).toLowerCase().trim();
      if (checks.name(v)) nameIdx = i;
      if (checks.subject(v)) subjIdx = i;
      if (checks.grade(v)) gradeIdx = i;
      if (checks.date(v)) dateIdx = i;
      if (checks.type(v)) typeIdx = i;
      if (checks.semester(v)) semIdx = i;
    });
    var start = 0;
    if (nameIdx !== -1 && subjIdx !== -1 && gradeIdx !== -1) start = 1;
    else { nameIdx = 0; subjIdx = 1; gradeIdx = 2; }
    var entries = [];
    for (var j = start; j < rows.length; j++) {
      var r = rows[j];
      if (r.length <= Math.max(nameIdx, subjIdx, gradeIdx)) continue;
      var name = String(r[nameIdx] || "").trim();
      var subject = String(r[subjIdx] || "").trim();
      var grade = parseFloat(String(r[gradeIdx]).replace(/[^\d.\-]/g, ""));
      if (!name && !subject) continue;
      entries.push({
        name: name, subject: subject, grade: isNaN(grade) ? 0 : grade,
        date: dateIdx !== -1 ? r[dateIdx] : null,
        type: typeIdx !== -1 ? r[typeIdx] : null,
        semester: semIdx !== -1 ? r[semIdx] : null,
      });
    }
    if (!entries.length) { alert("No valid data."); return; }
    App.entries = App.entries.concat(entries);
    renderEntryTable();
    window.App.refreshDashboard();
  }

  /* ===== file import ===== */
  function importExcel(file) {
    window.App.showLoading();
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = new Uint8Array(e.target.result);
        var wb = XLSX.read(data, { type: "array" });
        var sheet = wb.Sheets[wb.SheetNames[0]];
        var json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        importFromRows(json);
      } catch (err) {
        alert("Excel parse error");
      }
      window.App.hideLoading();
    };
    reader.readAsArrayBuffer(file);
  }

  function importPDF(file) {
    window.App.showLoading();
    var reader = new FileReader();
    reader.onload = function (e) {
      var data = new Uint8Array(e.target.result);
      if (typeof pdfjsLib === "undefined") { alert("PDF library not loaded"); window.App.hideLoading(); return; }
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      pdfjsLib.getDocument({ data: data }).promise.then(function (pdf) {
        var proms = [];
        for (var i = 1; i <= pdf.numPages; i++) {
          proms.push(pdf.getPage(i).then(function (pg) {
            return pg.getTextContent().then(function (c) {
              return c.items.map(function (it) { return it.str; }).join(" ");
            });
          }));
        }
        Promise.all(proms).then(function (parts) {
          var txt = parts.join("\n");
          var lines = txt.split("\n").filter(function (l) { return /[a-zA-Z\u0600-\u06FF]/.test(l); });
          if (lines.some(function (l) { return l.indexOf(",") !== -1 || l.indexOf("\t") !== -1; })) {
            importFromText(lines.join("\n"));
          } else {
            alert("Could not detect tabular data in PDF");
          }
          window.App.hideLoading();
        });
      }).catch(function () { alert("PDF parse error"); window.App.hideLoading(); });
    };
    reader.readAsArrayBuffer(file);
  }

  /* ===== propagate to other modules ===== */
  function renderQueues() {
    if (window.Rpt) window.Rpt.renderSummary();
    if (window.QB && window.QB.refreshFilters) window.QB.refreshFilters();
  }

  window.Entry = {
    render: renderEntryTable,
    refresh: renderQueues,
    bind: function () {
      document.getElementById("btnAddEntry").addEventListener("click", addEntry);
      document.getElementById("btnClearAll").addEventListener("click", clearAll);
      document.getElementById("btnImportText").addEventListener("click", function () {
        var ta = document.getElementById("dataPaste");
        if (ta.value.trim()) { importFromText(ta.value.trim()); ta.value = ""; }
      });
      document.getElementById("fileExcel").addEventListener("change", function (e) {
        if (e.target.files[0]) importExcel(e.target.files[0]);
        e.target.value = "";
      });
      document.getElementById("filePDF").addEventListener("change", function (e) {
        if (e.target.files[0]) importPDF(e.target.files[0]);
        e.target.value = "";
      });
      ["inpName", "inpSubject", "inpGrade"].forEach(function (id) {
        document.getElementById(id).addEventListener("keydown", function (e) { if (e.key === "Enter") addEntry(); });
      });
    },
  };
})();
