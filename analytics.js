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
    var median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
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
      n: n,
      avg: +avg.toFixed(2),
      median: +median.toFixed(2),
      high: +sorted[n - 1],
      low: +sorted[0],
      pass: +(((passCount / n) * 100).toFixed(1)),
      gpa: +(gpSum / n).toFixed(2),
      std: +std.toFixed(2),
      dist: dist,
      passCount: passCount,
    };
  }

  function studentAverages() {
    var map = {};
    window.App.entries.forEach(function (e) {
      if (!map[e.name]) map[e.name] = [];
      map[e.name].push(e.grade);
    });
    var out = [];
    Object.keys(map).forEach(function (name) {
      var grades = map[name];
      var avg = grades.reduce(function (a, b) { return a + b; }, 0) / grades.length;
      out.push({ name: name, avg: avg, grades: grades });
    });
    out.sort(function (a, b) { return b.avg - a.avg; });
    return out;
  }

  function subjectAverages() {
    var map = {};
    window.App.entries.forEach(function (e) {
      if (!map[e.subject]) map[e.subject] = [];
      map[e.subject].push(e.grade);
    });
    var out = [];
    Object.keys(map).forEach(function (subj) {
      var grades = map[subj];
      var avg = grades.reduce(function (a, b) { return a + b; }, 0) / grades.length;
      out.push({ subject: subj, avg: avg, count: grades.length, grades: grades });
    });
    out.sort(function (a, b) { return b.avg - a.avg; });
    return out;
  }

  function improvementPlan(student) {
    var subjMap = {};
    window.App.entries.forEach(function (e) {
      if (e.name !== student) return;
      if (!subjMap[e.subject]) subjMap[e.subject] = [];
      subjMap[e.subject].push(e.grade);
    });
    var weak = [], strong = [];
    Object.keys(subjMap).forEach(function (s) {
      var avg = subjMap[s].reduce(function (a, b) { return a + b; }, 0) / subjMap[s].length;
      if (avg < 60) weak.push({ subject: s, avg: avg });
      else if (avg >= 80) strong.push({ subject: s, avg: avg });
    });
    weak.sort(function (a, b) { return a.avg - b.avg; });
    strong.sort(function (a, b) { return b.avg - a.avg; });
    return { weak: weak, strong: strong };
  }

  /* Per-student subject matrix with final degree = overall average across subjects */
  function finalDegreeMatrix() {
    var students = {};
    window.App.entries.forEach(function (e) {
      if (!students[e.name]) students[e.name] = {};
      if (!students[e.name][e.subject]) students[e.name][e.subject] = [];
      students[e.name][e.subject].push(e.grade);
    });
    var names = Object.keys(students).sort();
    var subjects = {};
    names.forEach(function (n) {
      Object.keys(students[n]).forEach(function (s) { subjects[s] = true; });
    });
    var subjectList = Object.keys(subjects).sort();
    var rows = names.map(function (name) {
      var perSubject = {};
      var allGrades = [];
      subjectList.forEach(function (s) {
        var gs = students[name][s] || [];
        if (gs.length) {
          var avg = gs.reduce(function (a, b) { return a + b; }, 0) / gs.length;
          perSubject[s] = { avg: +avg.toFixed(1), count: gs.length };
          allGrades = allGrades.concat(gs);
        }
      });
      var finalDegree = allGrades.length ? +(allGrades.reduce(function (a, b) { return a + b; }, 0) / allGrades.length).toFixed(1) : 0;
      return { name: name, perSubject: perSubject, finalDegree: finalDegree };
    });
    rows.sort(function (a, b) { return b.finalDegree - a.finalDegree; });
    return { subjectList: subjectList, rows: rows };
  }

  function subjectGradeInfo(avg) {
    for (var i = 0; i < GRADE_SCALE.length; i++) {
      if (avg >= GRADE_SCALE[i].min && avg <= GRADE_SCALE[i].max) {
        return { grade: GRADE_SCALE[i].letter, color: GRADE_SCALE[i].letter === "F" ? "#ef4444" : (avg >= 80 ? "#10b981" : avg >= 60 ? "#f59e0b" : "#ef4444") };
      }
    }
    return { grade: "F", color: "#ef4444" };
  }

  function finalColor(v) {
    if (v >= 85) return "#10b981";
    if (v >= 70) return "#10b981";
    if (v >= 60) return "#f59e0b";
    return "#ef4444";
  }

  function renderFinalMatrix() {
    var box = document.getElementById("finalMatrix");
    if (!box) return;
    var data = finalDegreeMatrix();
    if (!data.rows.length) {
      box.innerHTML = '<p class="text-sm text-gray-400">' + window.App.t("noData") + "</p>";
      return;
    }
    var ar = window.App.currentLang === "ar";
    var gradeCol = ar ? "\u0627\u0644\u062f\u0631\u062c\u0629" : "Grade";
    var finalLabel = ar ? "\u0627\u0644\u062f\u0631\u062c\u0629 \u0627\u0644\u0646\u0647\u0627\u0626\u064a\u0629" : "Final Degree";

    var html = '<table class="w-full text-sm"><thead><tr class="text-xs text-gray-400 border-b dark:border-gray-700">';
    html += '<th class="p-2 text-left">' + (ar ? "\u0627\u0644\u0637\u0627\u0644\u0628" : "Student") + "</th>";
    data.subjectList.forEach(function (s) {
      html += '<th class="p-2 text-center">' + s + "<br><span class='text-[10px] font-normal'>(" + gradeCol + ")</span></th>";
    });
    html += '<th class="p-2 text-center bg-black/5 dark:bg-white/5">' + finalLabel + "</th>";
    html += "</tr></thead><tbody>";

    data.rows.forEach(function (row, rank) {
      var rowBg = rank % 2 ? "bg-black/[0.02] dark:bg-white/[0.02]" : "";
      html += "<tr class='border-b dark:border-gray-800 " + rowBg + "'>";
      html += '<td class="p-2 font-medium">' + row.name + "</td>";
      data.subjectList.forEach(function (s) {
        var cell = row.perSubject[s];
        if (!cell) {
          html += '<td class="p-2 text-center text-gray-300 dark:text-gray-600">-</td>';
        } else {
          var info = subjectGradeInfo(cell.avg);
          html += '<td class="p-2 text-center"><div class="font-bold" style="color:' + info.color + '">' + cell.avg + '</div><div class="text-[10px] text-gray-400">' + info.grade + " (" + cell.count + ")</div></td>";
        }
      });
      html += '<td class="p-2 text-center bg-black/5 dark:bg-white/5"><div class="text-lg font-extrabold" style="color:' + finalColor(row.finalDegree) + '">' + row.finalDegree + '</div><div class="text-[10px] text-gray-400">' + window.Ana.letterOf(row.finalDegree).letter + "</div></td>";
      html += "</tr>";
    });
    html += "</tbody></table>";
    box.innerHTML = html;
  }

  /* ===== Rendering ===== */
  function rankColor(i) {
    return i === 0 ? "#f59e0b" : i === 1 ? "#9ca3af" : i === 2 ? "#b45309" : "#10b981";
  }

  function renderRankings() {
    var list = studentAverages();
    var top = document.getElementById("topPerformers");
    var help = document.getElementById("needsHelp");
    top.innerHTML = "";
    help.innerHTML = "";

    if (!list.length) {
      top.innerHTML = '<p class="text-sm text-gray-400">' + window.App.t("noData") + "</p>";
      help.innerHTML = '<p class="text-sm text-gray-400">' + window.App.t("noData") + "</p>";
      return;
    }

    list.slice(0, 5).forEach(function (st, i) {
      top.appendChild(rankCard(i + 1, st.name, st.avg, rankColor(i)));
    });

    var weak = list.filter(function (st) { return st.avg < 60; });
    if (!weak.length) {
      help.innerHTML = '<p class="text-sm text-gray-400">' + window.App.t("noData") + "</p>";
    } else {
      weak.forEach(function (st, i) {
        help.appendChild(rankCard(i + 1, st.name, st.avg, "#ef4444"));
      });
    }
  }

  function rankCard(rank, name, avg, bgColor) {
    var div = document.createElement("div");
    div.className = "rank-card";
    div.innerHTML =
      '<div class="rank-num" style="background:' + bgColor + '">' + rank + "</div>" +
      '<div class="flex-1"><div class="font-semibold text-sm">' + name + "</div>" +
      '<div class="text-xs text-gray-400">' + avg.toFixed(1) + "</div></div>" +
      '<span class="text-sm font-bold" style="color:' + bgColor + '">' + avg.toFixed(1) + "</span>";
    return div;
  }

  function renderSubjectBreakdown() {
    var box = document.getElementById("subjectBreakdown");
    var avgMap = subjectAverages();
    if (!avgMap.length) {
      box.innerHTML = '<p class="text-sm text-gray-400">' + window.App.t("noData") + "</p>";
      return;
    }
    var html = '<table class="w-full text-sm"><thead><tr class="text-xs text-gray-400 border-b dark:border-gray-700">' +
      "<th class='p-2'>" + window.App.t("labelSubject") + "</th><th class='p-2'>" + (window.App.currentLang === "ar" ? "\u0627\u0644\u0645\u062a\u0648\u0633\u0637" : "Average") + '</th><th class="p-2">' + (window.App.currentLang === "ar" ? "\u0627\u0644\u0639\u062f\u062f" : "Entries") + '</th><th class="p-2">' + (window.App.currentLang === "ar" ? "\u0627\u0644\u062d\u0627\u0644\u0629" : "Status") + "</th></tr></thead><tbody>";
    avgMap.forEach(function (s) {
      var cls = s.avg >= 80 ? "badge-success" : s.avg >= 60 ? "badge-warning" : "badge-error";
      var statusText = s.avg >= 80 ? (window.App.currentLang === "ar" ? "\u0642\u0648\u064a" : "Good") : s.avg >= 60 ? (window.App.currentLang === "ar" ? "\u0645\u0642\u0628\u0648\u0644" : "OK") : (window.App.currentLang === "ar" ? "\u0636\u0639\u064a\u0641" : "Weak");
      html += "<tr class='border-b dark:border-gray-800'><td class='p-2 font-medium'>" + s.subject +
        "</td><td class='p-2'>" + s.avg.toFixed(1) +
        "</td><td class='p-2'>" + s.count +
        "</td><td class='p-2'><span class='badge " + cls + "'>" + statusText + "</span></td></tr>";
    });
    html += "</tbody></table>";
    box.innerHTML = html;
  }

  function renderPlans() {
    var box = document.getElementById("improvementPlans");
    var students = studentAverages();
    box.innerHTML = "";
    if (!students.length) {
      box.innerHTML = '<p class="text-sm text-gray-400">' + window.App.t("noData") + "</p>";
      return;
    }
    students.filter(function (s) { return s.avg < 70; }).slice(0, 8).forEach(function (st) {
      var plan = improvementPlan(st.name);
      var weakList = plan.weak.length ? plan.weak.map(function (w) { return w.subject + " (" + w.avg.toFixed(0) + ")"; }).join(", ") : "None";
      var strongList = plan.strong.length ? plan.strong.map(function (w) { return w.subject; }).join(", ") : "None";
      var target = Math.min(80, Math.ceil((st.avg + 10) / 5) * 5);

      var card = document.createElement("div");
      card.className = "glass-card p-4";
      card.innerHTML =
        '<div class="font-bold text-sm mb-2">Student: ' + st.name + ' <span class="text-gray-400 font-normal">(' + st.avg.toFixed(1) + ")</span></div>" +
        '<div class="text-xs space-y-1 mb-3">' +
        '<div><span class="font-semibold text-red-500">' + (window.App.currentLang === "ar" ? "\u0636\u0639\u064a\u0641" : "Weak") + ":</span> " + weakList + "</div>" +
        '<div><span class="font-semibold text-emerald-500">' + (window.App.currentLang === "ar" ? "\u0642\u0648\u064a" : "Strong") + ":</span> " + strongList + "</div>" +
        '<div><span class="font-semibold text-amber-500">' + (window.App.currentLang === "ar" ? "\u0627\u0644\u0647\u062f\u0641" : "Target") + ":</span> " + target + "</div>" +
        "</div>" +
        '<ul class="text-xs space-y-1 text-gray-500 dark:text-gray-400 list-disc pr-4 rtl:pr-4 pl-4">' +
        "<li>" + (window.App.currentLang === "ar" ? "\u0645\u0645\u0627\u0631\u0633\u0629: 30 \u062f\u0642\u064a\u0642\u0629 \u064a\u0648\u0645\u064a\u0627\u064b \u0639\u0644\u0649 \u0627\u0644\u0645\u0648\u0627\u062f \u0627\u0644\u0636\u0639\u064a\u0641\u0629\u060c \u0648\u0627\u0644\u062a\u0631\u0643\u064a\u0632 \u0639\u0644\u0649 \u0627\u0644\u0627\u062e\u062a\u0628\u0627\u0631\u0627\u062a \u0627\u0644\u0633\u0627\u0628\u0642\u0629" : "Practice 30 min daily on weak subjects; focus on past exams") + "</li>" +
        "<li>" + (window.App.currentLang === "ar" ? "\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0623\u062e\u0637\u0627\u0621 \u0648\u062d\u0644 \u0645\u0633\u0627\u0626\u0644 \u0627\u0644\u0645\u0648\u0627\u0636\u064a\u0639 \u0627\u0644\u0636\u0639\u064a\u0641\u0629 \u0623\u0633\u0628\u0648\u0639\u064a\u0627\u064b" : "Review mistakes and re-solve weak-area problems weekly") + "</li>" +
        (plan.weak.length ? "<li>" + (window.App.currentLang === "ar" ? "\u062f\u0631\u0648\u0633 \u062e\u0635\u0648\u0635\u064a\u0629 \u0645\u0648\u0635\u0649 \u0628\u0647\u0627 \u0644\u0640 " : "Targeted tutoring recommended for: ") + plan.weak[0].subject + "</li>" : "") +
        "</ul>";
      box.appendChild(card);
    });
    if (!box.children.length) {
      box.innerHTML = '<p class="text-sm text-gray-400">' + window.App.t("noData") + "</p>";
    }
  }

  /* ===== Dashboard stats & badges ===== */
  function renderDashboardStats() {
    var grades = window.App.entries.map(function (e) { return e.grade; });
    var st = computeStats(grades);
    var ids = {
      dashAvg: st ? st.avg : "--", dashHighest: st ? st.high : "--", dashLowest: st ? st.low : "--",
      dashPass: st ? st.pass + "%" : "--", dashGPA: st ? st.gpa : "--", dashStd: st ? st.std : "--",
    };
    Object.keys(ids).forEach(function (id) {
      document.getElementById(id).textContent = ids[id];
    });

    var badges = document.getElementById("dashBadges");
    badges.innerHTML = "";
    if (!st) return;
    var bad = [];
    if (st.avg >= 85) bad.push({ cls: "badge-success", txt: window.App.t("badgeTop") });
    if (st.pass < 70) bad.push({ cls: "badge-warning", txt: window.App.t("badgeImprove") });
    if (st.low < PASS_THRESHOLD) bad.push({ cls: "badge-error", txt: st.low + " < 50 - " + (window.App.currentLang === "ar" ? "\u064a\u062d\u062a\u0627\u062c \u0627\u0646\u062a\u0628\u0627\u0647" : "Needs Attention") });
    if (!bad.length) bad.push({ cls: "badge-success", txt: window.App.t("badgeGood") });
    bad.forEach(function (b) {
      var s = document.createElement("span");
      s.className = "badge " + b.cls;
      s.textContent = b.txt;
      badges.appendChild(s);
    });
  }

  /* ===== Public ===== */
  window.Ana = {
    computeStats: computeStats,
    computePassThreshold: function () { return PASS_THRESHOLD; },
    letterOf: getLetter,
    studentAverages: studentAverages,
    subjectAverages: subjectAverages,
    improvementPlan: improvementPlan,
    finalDegreeMatrix: finalDegreeMatrix,
    renderFinalMatrix: renderFinalMatrix,
    renderAll: function () {
      renderDashboardStats();
      renderFinalMatrix();
      renderRankings();
      renderSubjectBreakdown();
      renderPlans();
    },
    bind: function () {
      var rb = document.getElementById("btnRefreshFinal");
      if (rb) rb.addEventListener("click", function () { renderFinalMatrix(); });
    },
    init: function () {
    },
  };
})();
