(function () {
  "use strict";

  var App = window.App;

  function refreshStudentList() {
    var students = App.util.uniqueStudents();
    var sel = document.getElementById("progressStudent");
    var cur = sel.value;
    sel.innerHTML = '<option value="">' + (window.App.currentLang === "ar" ? "\u0627\u062e\u062a\u0631 \u0627\u0644\u0637\u0627\u0644\u0628..." : "Select student...") + "</option>";
    students.forEach(function (s) {
      var o = document.createElement("option");
      o.value = s; o.textContent = s;
      sel.appendChild(o);
    });
    if (cur && students.indexOf(cur) !== -1) sel.value = cur;
  }

  function renderProgress() {
    var sel = document.getElementById("progressStudent");
    var name = sel.value;
    if (!name) {
      [["progressLineChart", []], ["progressSubjectChart", []], ["progressSemesterChart", []]].forEach(function (c) {
        var ctx = document.getElementById(c[0]);
        if (ctx && window.App.charts[c[0]]) { window.App.charts[c[0]].destroy(); window.App.charts[c[0]] = null; }
        if (ctx) ctx.getContext("2d").clearRect(0, 0, ctx.width, ctx.height);
      });
      return;
    }
    var entries = App.entries.filter(function (e) { return e.name === name; });
    if (!entries.length) return;

    // Sort by date
    var withDate = entries.slice().filter(function (e) { return e.date; }).sort(function (a, b) { return a.date.localeCompare(b.date); });
    if (withDate.length) {
      window.Ch.makeLine("progressLineChart", withDate.map(function (e) { return e.date + " " + e.subject; }), withDate.map(function (e) { return e.grade; }), "Score");
    }

    // By subject comparison
    var subjMap = {};
    entries.forEach(function (e) {
      if (!subjMap[e.subject]) subjMap[e.subject] = [];
      subjMap[e.subject].push(e.grade);
    });
    var subjs = Object.keys(subjMap);
    window.Ch.makeBar("progressSubjectChart", subjs, subjs.map(function (s) {
      return subjMap[s].reduce(function (a, b) { return a + b; }, 0) / subjMap[s].length;
    }));

    // Semester comparison
    var semMap = {};
    entries.forEach(function (e) {
      var sem = e.semester || "Default";
      if (!semMap[sem]) semMap[sem] = [];
      semMap[sem].push(e.grade);
    });
    var sems = Object.keys(semMap);
    if (sems.length > 1) {
      window.Ch.makeBar("progressSemesterChart", sems, sems.map(function (s) {
        return +(semMap[s].reduce(function (a, b) { return a + b; }, 0) / semMap[s].length).toFixed(1);
      }));
    } else {
      var ctx = document.getElementById("progressSemesterChart");
      if (ctx && window.App.charts.progressSemesterChart) { window.App.charts.progressSemesterChart.destroy(); window.App.charts.progressSemesterChart = null; }
    }
  }

  window.Prg = {
    refreshStudentList: refreshStudentList,
    bind: function () {
      document.getElementById("progressStudent").addEventListener("change", renderProgress);
    },
    init: function () {},
  };
})();
