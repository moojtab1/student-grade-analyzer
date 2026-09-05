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

  /* ============================================================
     Universal table parsing engine
     - scans for header row anywhere (skips titles/banners/blanks)
     - dynamic multilingual column mapping (EN + AR)
     - positional fallback when no header is recognisable
     - sanitises numbers (Arabic digits, %, fractions, ranges)
     - drops blank padding rows and summary footer rows
     ============================================================ */
  function toLatinDigits(s) {
    var arabic = { "\u0660":0,"\u0661":1,"\u0662":2,"\u0663":3,"\u0664":4,"\u0665":5,"\u0666":6,"\u0667":7,"\u0668":8,"\u0669":9 };
    var persian = { "\u06f0":0,"\u06f1":1,"\u06f2":2,"\u06f3":3,"\u06f4":4,"\u06f5":5,"\u06f6":6,"\u06f7":7,"\u06f8":8,"\u06f9":9 };
    return String(s).replace(/[\u0660-\u0669\u06f0-\u06f9]/g, function (d) {
      return (arabic[d] !== undefined) ? arabic[d] : persian[d];
    });
  }

  function parseGrade(raw) {
    if (raw === null || raw === undefined) return null;
    var s = toLatinDigits(raw).trim();
    var m = s.match(/\d+(?:\.\d+)?/);
    if (!m) return null;
    var val = parseFloat(m[0]);
    if (isNaN(val) || val < 0 || val > 150) return null;
    return val;
  }

  var SYN = {
    name:     ["name","student","student name","studentname","std","pupil","learner","candidate","full name","\u0627\u0633\u0645","\u0627\u0644\u0627\u0633\u0645","\u0627\u0633\u0645 \u0627\u0644\u0637\u0627\u0644\u0628","\u0627\u0644\u0637\u0627\u0644\u0628","\u0627\u0644\u0637\u0644\u0627\u0628"],
    id:       ["id","student id","roll","roll no","reg no","number","no","\u0631\u0642\u0645","\u0627\u0644\u0631\u0642\u0645","\u0631\u0642\u0645 \u0627\u0644\u0637\u0627\u0644\u0628"],
    subject:  ["subject","subjects","course","class","module","\u0627\u0644\u0645\u0648\u0627\u062f","\u0627\u0644\u0645\u0627\u062f\u0629","\u0645\u0627\u062f\u0629"],
    grade:    ["grade","grades","score","scores","mark","marks","result","\u0627\u0644\u062f\u0631\u062c\u0629","\u0627\u0644\u062f\u0631\u062c\u0627\u062a","\u0627\u0644\u0639\u0644\u0627\u0645\u0629","\u0627\u0644\u0646\u062a\u064a\u062c\u0629","\u0627\u0644\u0646\u0633\u0628\u0629"],
    date:     ["date","\u062a\u0627\u0631\u064a\u062e","\u0627\u0644\u062a\u0627\u0631\u064a\u062e"],
    type:     ["type","assessment","\u0627\u0644\u062a\u0642\u064a\u064a\u0645","\u0627\u0644\u0646\u0648\u0639","\u0646\u0648\u0639 \u0627\u0644\u062a\u0642\u064a\u064a\u0645"],
    semester: ["semester","term","\u0627\u0644\u062a\u0631\u0645","\u0627\u0644\u0641\u0635\u0644","\u0627\u0644\u0641\u0635\u0644 \u0627\u0644\u062f\u0631\u0627\u0633\u064a"],
  };

  function normCell(v) {
    return toLatinDigits(v).toLowerCase().replace(/[^\w\u0600-\u06FF\s/]+/g, " ").trim().replace(/\s+/g, " ");
  }

  function classifyCell(cell) {
    var n = normCell(cell);
    if (!n) return null;
    var best = null, bestPos = -1;
    Object.keys(SYN).forEach(function (role) {
      SYN[role].forEach(function (s) {
        var pos = n.indexOf(normCell(s));
        if (pos !== -1 && (bestPos === -1 || pos < bestPos)) { bestPos = pos; best = role; }
      });
    });
    return best;
  }

  function mapColumns(headerRow) {
    var result = { name: -1, subject: -1, grade: -1, date: -1, type: -1, semester: -1 };
    headerRow.forEach(function (cell, i) {
      var role = classifyCell(cell);
      if (role && result[role] === -1) result[role] = i;
    });
    return result;
  }

  function detectHeader(grid) {
    for (var i = 0; i < Math.min(grid.length, 20); i++) {
      var count = {};
      grid[i].forEach(function (cell) {
        var role = classifyCell(cell);
        if (role) count[role] = (count[role] || 0) + 1;
      });
      /* classic long-table: a name column + a grade column */
      if ((count.name || 0) >= 1 && (count.grade || 0) >= 1) return i;
      /* wide-table: a name column + at least one non-synonym text column
         whose values below are mostly numeric (subject-score columns) */
      if ((count.name || 0) >= 1) {
        var wide = detectWide(grid[i], grid, i);
        if (wide && wide.subjects.length >= 1) return i;
      }
    }
    return -1;
  }

  function positionalMap(grid, start) {
    var width = 0;
    grid.forEach(function (r) { width = Math.max(width, r.length); });
    var numericCount = [], minV = [], maxV = [], textCount = [];
    for (var c = 0; c < width; c++) { numericCount.push(0); minV.push(Infinity); maxV.push(-Infinity); textCount.push(0); }
    for (var j = start; j < grid.length; j++) {
      for (var c2 = 0; c2 < grid[j].length; c2++) {
        var cell = grid[j][c2];
        if (cell === undefined || cell === null) continue;
        var val = parseGrade(cell);
        if (val !== null) { numericCount[c2]++; minV[c2] = Math.min(minV[c2], val); maxV[c2] = Math.max(maxV[c2], val); }
        else if (String(cell).trim()) textCount[c2]++;
      }
    }
    var gradeCol = -1, best = 0;
    for (var c3 = 0; c3 < width; c3++) {
      if (numericCount[c3] > 0 && numericCount[c3] >= best && minV[c3] >= 0 && maxV[c3] <= 150) { gradeCol = c3; best = numericCount[c3]; }
    }
    var textCols = [];
    for (var c4 = 0; c4 < width; c4++) if (c4 !== gradeCol) textCols.push([c4, textCount[c4]]);
    textCols.sort(function (a, b) { return b[1] - a[1]; });
    var nameCol = textCols.length && textCols[0][1] > 0 ? textCols[0][0] : 0;
    var subjectCol = textCols.length > 1 && textCols[1][1] > 0 ? textCols[1][0] : -1;
    return { name: nameCol, subject: subjectCol, grade: gradeCol, date: -1, type: -1, semester: -1 };
  }

  var FOOTERS = ["average","avg","total","tot","sum","mean","max","min","final","grand total","\u0627\u0644\u0645\u062a\u0648\u0633\u0637","\u0627\u0644\u0645\u062c\u0645\u0648\u0639","\u0627\u0644\u0645\u062c\u0645\u0648\u0639 \u0627\u0644\u0643\u0644\u064a","\u0627\u0644\u0627\u062c\u0645\u0627\u0644\u064a","\u0627\u0644\u0627\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0643\u0644\u064a","\u0627\u0644\u0645\u0639\u062f\u0644","\u0627\u0644\u0645\u0639\u062f\u0644 \u0627\u0644\u0639\u0627\u0645","\u0627\u0644\u062f\u0631\u062c\u0629 \u0627\u0644\u0646\u0647\u0627\u0626\u064a\u0629","\u0627\u0644\u0646\u0647\u0627\u0626\u064a"];

  function isSummaryRow(grid, j) {
    var row = grid[j];
    var firstText = "";
    for (var k = 0; k < row.length; k++) {
      if (row[k] === null || row[k] === undefined) continue;
      var cellStr = String(row[k]).trim();
      if (!cellStr) continue;
      if (parseGrade(cellStr) === null) { firstText = cellStr; break; }
    }
    if (!firstText) return false;
    var tn = normCell(firstText);
    for (var f = 0; f < FOOTERS.length; f++) {
      if (tn.indexOf(normCell(FOOTERS[f])) !== -1) return true;
    }
    return false;
  }

  /* Detect wide-format tables: subject names in the header row, scores in the
     numeric columns below, one student per row. Returns the mapping or null. */
  function detectWide(headerRow, grid, headerIdx) {
    var nameCol = -1;
    headerRow.forEach(function (cell, i) {
      var role = classifyCell(cell);
      if (role === "name" && nameCol === -1) nameCol = i;
    });
    if (nameCol === -1) return null;

    var width = headerRow.length;
    var subjectCols = [];
    for (var c = 0; c < width; c++) {
      if (c === nameCol) continue;
      var head = String(headerRow[c] || "").trim();
      if (!head) continue;
      if (classifyCell(head) === "grade" || classifyCell(head) === "subject") continue;
      if (normCell(head).indexOf("total") !== -1 || normCell(head).indexOf("\u0627\u0644\u0645\u062c\u0645\u0648\u0639") !== -1 ||
          normCell(head).indexOf("\u0645\u0639\u062f\u0644") !== -1 || normCell(head).indexOf("average") !== -1 ||
          normCell(head).indexOf("avg") !== -1 || normCell(head).indexOf("\u062a\u0642\u062f\u064a\u0631") !== -1 ||
          normCell(head).indexOf("grade") === 0 && classifyCell(head) === "grade") continue;
      // must have mostly numeric values below (scores)
      var num = 0, nonEmpty = 0;
      for (var j = headerIdx + 1; j < grid.length; j++) {
        if (isSummaryRow(grid, j)) continue;
        var cell = grid[j][c];
        if (cell === undefined || cell === null || String(cell).trim() === "") continue;
        nonEmpty++;
        if (parseGrade(cell) !== null) num++;
      }
      if (nonEmpty > 0 && num / nonEmpty >= 0.7) subjectCols.push(c);
    }
    if (!subjectCols.length) return null;
    return { kind: "wide", name: nameCol, subjects: subjectCols };
  }

  function parseRowsToEntries(rows) {
    if (!rows || !rows.length) return [];
    var grid = [];
    rows.forEach(function (r) {
      var arr = [];
      for (var i = 0; i < r.length; i++) {
        arr.push(r[i] === null || r[i] === undefined || String(r[i]).trim() === "" ? "" : String(r[i]).trim());
      }
      if (arr.some(function (c) { return c !== ""; })) grid.push(arr);
    });
    if (!grid.length) return [];

    var headerIdx = detectHeader(grid);
    var map = headerIdx === -1 ? null : mapColumns(grid[headerIdx]);
    var start = headerIdx === -1 ? 0 : headerIdx + 1;

    /* Wide-format layout takes priority when a name column exists but no
       dedicated subject+grade pair columns do. */
    /* Wide-format layout: subject names appear as header-row columns with
       numeric scores below and one student per row. Prefer it only when the
       header does NOT expose a dedicated grade column (i.e. a classic
       name/subject/grade long table). */
    var wide = null;
    if (headerIdx !== -1 && (!map || map.grade === -1)) {
      wide = detectWide(grid[headerIdx], grid, headerIdx);
    }
    if (wide && wide.subjects.length) {
      return buildWideEntries(grid, headerIdx, wide);
    }

    if (!map || map.name === -1 || map.grade === -1) {
      var fb = positionalMap(grid, start);
      if (!fb || fb.grade === -1) return [];
      if (!map) map = { name: -1, subject: -1, grade: -1, date: -1, type: -1, semester: -1 };
      map.name = map.name !== -1 ? map.name : fb.name;
      map.subject = map.subject !== -1 ? map.subject : fb.subject;
      map.grade = map.grade !== -1 ? map.grade : fb.grade;
      map.date = map.date !== -1 ? map.date : fb.date;
      map.type = map.type !== -1 ? map.type : fb.type;
      map.semester = map.semester !== -1 ? map.semester : fb.semester;
    }

    var entries = [];
    for (var j = start; j < grid.length; j++) {
      if (isSummaryRow(grid, j)) continue;
      var name = map.name !== -1 ? String(grid[j][map.name] || "").trim() : "";
      var subject = map.subject !== -1 ? String(grid[j][map.subject] || "").trim() : "";
      var gradeVal = map.grade !== -1 ? parseGrade(grid[j][map.grade]) : null;
      if (gradeVal === null) continue;
      if (!name && !subject) continue;
      if (!name) name = (window.App.currentLang === "ar" ? "\u0637\u0627\u0644\u0628" : "Student") + " " + (entries.length + 1);
      entries.push({
        name: name,
        subject: subject || "\u2014",
        grade: gradeVal,
        date: map.date !== -1 ? grid[j][map.date] : null,
        type: map.type !== -1 ? grid[j][map.type] : null,
        semester: map.semester !== -1 ? grid[j][map.semester] : null,
      });
    }
    return entries;
  }

  function buildWideEntries(grid, headerIdx, wide) {
    var entries = [];
    var subjectNames = wide.subjects.map(function (c) { return String(grid[headerIdx][c] || "").trim(); });
    for (var j = headerIdx + 1; j < grid.length; j++) {
      if (isSummaryRow(grid, j)) continue;
      var name = String(grid[j][wide.name] || "").trim();
      if (!name) continue;
      var added = false;
      wide.subjects.forEach(function (ci, idx) {
        var gv = parseGrade(grid[j][ci]);
        if (gv === null) return;
        entries.push({ name: name, subject: subjectNames[idx] || "\u0645\u0627\u062f\u0629", grade: gv, date: null, type: null, semester: null });
        added = true;
      });
      if (!added) continue;
    }
    return entries;
  }

  function importFromText(text) {
    var entries = [];
    try {
      var parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        entries = parsed.map(function (i) {
          var g = parseGrade(i.grade !== undefined ? i.grade : i["\u0627\u0644\u062f\u0631\u062c\u0629"]);
          return { name: String(i.name || i["\u0627\u0633\u0645"] || ""), subject: String(i.subject || i["\u0627\u0644\u0645\u0627\u062f\u0629"] || ""), grade: g === null ? 0 : g, date: i.date || null, type: i.type || "exam", semester: i.semester || null };
        });
        entries = entries.filter(function (e) { return e.name || e.subject; });
      } else {
        alert(window.App.t("errJSON")); return;
      }
    } catch (e) {
      var lines = text.split(/\r?\n/).filter(function (l) { return l.trim(); });
      var rows = lines.map(function (l) { return l.split(/[,\t]/).map(function (c) { return c.trim(); }); });
      entries = parseRowsToEntries(rows);
    }
    if (!entries.length) { alert(window.App.t("errNoData")); return; }
    App.entries = App.entries.concat(entries);
    renderEntryTable();
    window.App.refreshDashboard();
  }

  /* ===== Excel import (multi-sheet aware) ===== */
  var pendingSheets = null;

  function commitSheetRows(rows, quiet) {
    var entries = parseRowsToEntries(rows);
    if (!entries.length) { if (!quiet) alert(window.App.t("errNoData")); return 0; }
    App.entries = App.entries.concat(entries);
    renderEntryTable();
    window.App.refreshDashboard();
    return entries.length;
  }

  function importExcel(file) {
    window.App.showLoading();
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = new Uint8Array(e.target.result);
        var wb = XLSX.read(data, { type: "array" });
        var sheets = wb.SheetNames.map(function (n) {
          return { name: n, rows: XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1 }) };
        });
        pendingSheets = sheets;
        if (sheets.length > 1) {
          showSheetModal(sheets);
        } else {
          commitSheetRows(sheets[0].rows);
        }
      } catch (err) {
        alert(window.App.t("errParse"));
      }
      window.App.hideLoading();
    };
    reader.readAsArrayBuffer(file);
  }

  function showSheetModal(sheets) {
    var cont = document.getElementById("sheetList");
    cont.innerHTML = "";
    var all = document.createElement("label");
    all.className = "flex items-center gap-2 p-2 rounded hover:bg-black/5 cursor-pointer";
    all.innerHTML = '<input type="radio" name="sheetPick" value="__merge__" class="accent-emerald-500"> <span class="text-sm">' + window.App.t("mergeAll") + "</span>";
    cont.appendChild(all);
    sheets.forEach(function (s, idx) {
      var lab = document.createElement("label");
      lab.className = "flex items-center gap-2 p-2 rounded hover:bg-black/5 cursor-pointer";
      lab.innerHTML = '<input type="radio" name="sheetPick" value="' + idx + '" class="accent-emerald-500"' + (idx === 0 ? " checked" : "") + '> <span class="text-sm font-medium">' + s.name + "</span><span class='text-xs text-gray-400'> (" + s.rows.length + " rows)</span>";
      cont.appendChild(lab);
    });
    document.getElementById("sheetModal").classList.remove("hidden");
    document.getElementById("sheetModal").classList.add("flex");
  }

  function hideSheetModal() {
    document.getElementById("sheetModal").classList.add("hidden");
    document.getElementById("sheetModal").classList.remove("flex");
  }

  function importSelectedSheet() {
    if (!pendingSheets) return;
    var val = document.querySelector('input[name="sheetPick"]:checked');
    hideSheetModal();
    if (!val) return;
    if (val.value === "__merge__") {
      pendingSheets.forEach(function (s) { commitSheetRows(s.rows, true); });
    } else {
      commitSheetRows(pendingSheets[Number(val.value)].rows);
    }
  }

  function yGroupItems(content) {
    var rows = [];
    content.items.forEach(function (it) {
      var str = it.str;
      if (!str || !str.trim()) return;
      var rawY = +it.transform[5];
      var x = +it.transform[4];
      var cha;
      for (var i = 0; i < rows.length; i++) {
        if (Math.abs(rawY - rows[i].y) < 3) { cha = rows[i]; break; }
      }
      if (!cha) { cha = { y: rawY, items: [] }; rows.push(cha); }
      cha.items.push({ x: x, w: +it.width || (str.length * 6), str: str });
    });
    rows.sort(function (a, b) { return b.y - a.y; });
    return rows.map(function (r) {
      r.items.sort(function (a, b) { return a.x - b.x; });
      var cells = [];
      var cur = "";
      var prevEnd = null;
      r.items.forEach(function (it) {
        if (prevEnd !== null && it.x - prevEnd > 10) { cells.push(cur); cur = ""; }
        cur += it.str;
        prevEnd = it.x + it.w;
      });
      if (cur) cells.push(cur);
      return cells;
    });
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
          proms.push(pdf.getPage(i).then(function (pg) { return pg.getTextContent(); }));
        }
        Promise.all(proms).then(function (contents) {
          var rowGrid = [];
          contents.forEach(function (c) {
            yGroupItems(c).forEach(function (cells) {
              var clean = cells.map(function (s) {
                return s.replace(/^\s*[,|:>\-]+\s*|\s*[,|:>\-]+\s*$/g, "").trim();
              }).filter(function (s) { return s; });
              if (clean.length) rowGrid.push(clean);
            });
          });
          var usable = rowGrid.filter(function (r) { return r.length >= 2; });
          if (!usable.length) {
            alert(window.App.t("errNoTable"));
            window.App.hideLoading();
            return;
          }
          commitSheetRows(rowGrid);
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
      document.getElementById("btnConfirmSheet").addEventListener("click", importSelectedSheet);
      document.getElementById("btnCancelSheet").addEventListener("click", function () { pendingSheets = null; hideSheetModal(); });
      document.getElementById("btnCloseSheet").addEventListener("click", function () { pendingSheets = null; hideSheetModal(); });
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
