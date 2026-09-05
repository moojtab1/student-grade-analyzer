(function () {
  "use strict";

  /* ============ Data Model (in-memory only, no persistence) ============ */
  window.App = {
    entries: [],
    questions: [],
    currentLang: "en",
    charts: {},
  };

  var TRANSLATIONS = {
    en: {
      privacyBadge: "100% Private - Processing on your device",
      appTitleAccent: "Student", appTitleMain: "Grade Analyzer",
      appSubtitle: "Privacy-first performance dashboard",
      tabDashboard: "Dashboard", tabEntry: "Data Entry", tabAnalysis: "Analysis",
      tabQuestions: "Question Bank", tabReports: "Reports", tabProgress: "Progress", tabExport: "Export",
      statAvg: "Average", statHighest: "Highest", statLowest: "Lowest",
      statPass: "Pass Rate", statGPA: "GPA", statStd: "Std Dev",
      chartSubject: "Subject Scores", chartDistribution: "Grade Distribution", chartRadar: "Competency Radar",
      enterGrades: "Enter Grades", labelStudent: "Student Name", labelSubject: "Subject",
      labelGrade: "Grade (0-100)", labelDate: "Date", labelType: "Assessment Type", labelSemester: "Semester",
      phStudent: "e.g. Alex", phSubject: "e.g. Math", phGrade: "85", phSemester: "Fall 2026",
      typeExam: "Exam", typeQuiz: "Quiz", typeHomework: "Homework", typeProject: "Project",
      addEntry: "+ Add Entry", clearAll: "Clear All",
      importTitle: "Import Data", labelPaste: "Paste CSV / JSON:",
      phPaste: "CSV: name,subject,grade\nAlex,Math,85",
      importData: "Import Data", labelFileImport: "Import from file:",
      importPDF: "PDF", importExcel: "Excel / CSV",
      fileHint: "Files parsed locally. Nothing leaves your device.",
      topPerformers: "Top Performers", needsHelp: "Needs Improvement",
      subjectBreakdown: "Subject Breakdown", improvementPlans: "Personalized Improvement Plans",
      addQuestion: "Add Question", labelDifficulty: "Difficulty", labelQuestion: "Question",
      diffEasy: "Easy", diffMedium: "Medium", diffHard: "Hard",
      correctAnswer: "Correct Answer", addQuestionBtn: "Add Question",
      questionList: "Questions", allSubjects: "All Subjects", allDiff: "All Levels",
      generateQuiz: "Generate Quiz", quizTitle: "Practice Quiz", submitQuiz: "Submit Quiz",
      reportCard: "Report Card", selectStudent: "Select student...", printReport: "Print Report",
      downloadPDF: "Download PDF", classSummary: "Class Summary Report", printSummary: "Print Summary",
      progressTracking: "Progress Tracking", progressLine: "Grade Trend",
      progressBySubject: "By Subject", semesterCompare: "Semester Comparison",
      exportPNG: "Export Charts as PNG", exportPNGDesc: "Download all charts as images",
      exportPDF: "Export Report as PDF", exportPDFDesc: "Full analytics report download",
      exportPPTX: "Export to PowerPoint", exportPPTXDesc: "Presentation with charts & metrics",
      loading: "Processing...",
      noData: "No data yet. Add grades to get started.",
      badgeTop: "Top Performance!", badgeImprove: "Improvement Needed",
      badgeGood: "All Good!",
      grade: "Grade", subject: "Subject", date: "Date", type: "Type",
      rank: "Rank", student: "Student", average: "Average",
      planTitle: "Improvement Plan for", subjectsWeak: "Weak subjects:",
      targetGoal: "Recommended target:", strongSubjects: "Strong subjects:",
      examPrep: "Practice: 30 min daily on weak subjects. Focus on past exams.",
      tutorial: "Targeted tutoring recommended for", practice: "Create a study group focused on",
      remove: "\u00d7",
      errJSON: "Invalid JSON. Expected array.", errParse: "Could not parse data.",
      errNoData: "No valid data.", errNoEntries: "No valid entries found.",
      errNoReport: "Select a student to view report.",
      questionPrompt: "Question", options: "Options", correct: "Correct",
      score: "Score", outOf: "out of",
      yourScore: "Your Quiz Score:",
      weak: "Weak", strong: "Strong", target: "Target",
      noStudents: "No students", empty: "No entries",
    },
    ar: {
      privacyBadge: "\u0661\u0660\u0660\u066a \u062e\u0635\u0648\u0635\u064a - \u0627\u0644\u0645\u0639\u0627\u0644\u062c\u0629 \u0645\u062d\u0644\u064a\u0627\u064b \u0639\u0644\u0649 \u062c\u0647\u0627\u0632\u0643",
      appTitleAccent: "\u0645\u062d\u0644\u0644", appTitleMain: "\u0627\u0644\u062f\u0631\u062c\u0627\u062a",
      appSubtitle: "\u0644\u0648\u062d\u0629 \u0623\u062f\u0627\u0621 \u062a\u062e\u0635\u0635\u064a\u0629",
      tabDashboard: "\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629", tabEntry: "\u0625\u062f\u062e\u0627\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a",
      tabAnalysis: "\u0627\u0644\u062a\u062d\u0644\u064a\u0644", tabQuestions: "\u0628\u0646\u0643 \u0627\u0644\u0623\u0633\u0626\u0644\u0629",
      tabReports: "\u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631", tabProgress: "\u0627\u0644\u062a\u0642\u062f\u0645", tabExport: "\u0627\u0644\u062a\u0635\u062f\u064a\u0631",
      statAvg: "\u0627\u0644\u0645\u062a\u0648\u0633\u0637", statHighest: "\u0627\u0644\u0623\u0639\u0644\u0649", statLowest: "\u0627\u0644\u0623\u062f\u0646\u0649",
      statPass: "\u0645\u0639\u062f\u0644 \u0627\u0644\u0646\u062c\u0627\u062d", statGPA: "\u0627\u0644\u0645\u0639\u062f\u0644", statStd: "\u0627\u0644\u0627\u0646\u062d\u0631\u0627\u0641",
      chartSubject: "\u0627\u0644\u062f\u0631\u062c\u0627\u062a \u0628\u0627\u0644\u0645\u0627\u062f\u0629", chartDistribution: "\u062a\u0648\u0632\u064a\u0639 \u0627\u0644\u062f\u0631\u062c\u0627\u062a", chartRadar: "\u062e\u0631\u064a\u0637\u0629 \u0627\u0644\u0643\u0641\u0627\u0621\u0627\u062a",
      enterGrades: "\u0625\u062f\u062e\u0627\u0644 \u0627\u0644\u062f\u0631\u062c\u0627\u062a", labelStudent: "\u0627\u0633\u0645 \u0627\u0644\u0637\u0627\u0644\u0628", labelSubject: "\u0627\u0644\u0645\u0627\u062f\u0629",
      labelGrade: "\u0627\u0644\u062f\u0631\u062c\u0629 (0-100)", labelDate: "\u0627\u0644\u062a\u0627\u0631\u064a\u062e", labelType: "\u0646\u0648\u0639 \u0627\u0644\u062a\u0642\u064a\u064a\u0645", labelSemester: "\u0627\u0644\u0641\u0635\u0644",
      phStudent: "\u0645\u062b\u0644. \u0639\u0644\u064a", phSubject: "\u0645\u062b\u0644. \u0631\u064a\u0627\u0636\u064a\u0627\u062a", phGrade: "85", phSemester: "\u0627\u0644\u0641\u0635\u0644 \u0627\u0644\u062f\u0631\u0627\u0633\u064a 2026",
      typeExam: "\u0627\u0645\u062a\u062d\u0627\u0646", typeQuiz: "\u0627\u062e\u062a\u0628\u0627\u0631 \u0642\u0635\u064a\u0631", typeHomework: "\u0648\u0627\u062c\u0628", typeProject: "\u0645\u0634\u0631\u0648\u0639",
      addEntry: "+ \u0625\u0636\u0627\u0641\u0629", clearAll: "\u0645\u0633\u062d \u0627\u0644\u0643\u0644",
      importTitle: "\u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a", labelPaste: "\u0623\u0648 \u0627\u0644\u0635\u0642 \u0628\u064a\u0627\u0646\u0627\u062a CSV / JSON:",
      phPaste: "CSV: \u0627\u0644\u0627\u0633\u0645,\u0627\u0644\u0645\u0627\u062f\u0629,\u0627\u0644\u062f\u0631\u062c\u0629\n\u0639\u0644\u064a,\u0631\u064a\u0627\u0636\u064a\u0627\u062a,85",
      importData: "\u0627\u0633\u062a\u064a\u0631\u0627\u062f", labelFileImport: "\u0623\u0648 \u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0645\u0646 \u0645\u0644\u0641:",
      importPDF: "PDF", importExcel: "\u0625\u0643\u0633\u0644 / CSV",
      fileHint: "\u0627\u0644\u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0627\u0644\u062c \u0645\u062d\u0644\u064a\u0627\u064b. \u0644\u0627 \u0634\u064a\u0621 \u064a\u063a\u0627\u062f\u0631 \u062c\u0647\u0627\u0632\u0643.",
      topPerformers: "\u0627\u0644\u0623\u0648\u0627\u0626\u0644", needsHelp: "\u064a\u062d\u062a\u0627\u062c\u0648\u0646 \u062a\u062d\u0633\u064a\u0646\u0627\u064b",
      subjectBreakdown: "\u062a\u0641\u0635\u064a\u0644 \u0627\u0644\u0645\u0648\u0627\u062f", improvementPlans: "\u062e\u0637\u0637 \u062a\u062d\u0633\u064a\u0646 \u0641\u0631\u062f\u064a\u0629",
      addQuestion: "\u0625\u0636\u0627\u0641\u0629 \u0633\u0624\u0627\u0644", labelDifficulty: "\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0635\u0639\u0648\u0628\u0629", labelQuestion: "\u0627\u0644\u0633\u0624\u0627\u0644",
      diffEasy: "\u0633\u0647\u0644", diffMedium: "\u0645\u062a\u0648\u0633\u0637", diffHard: "\u0635\u0639\u0628",
      correctAnswer: "\u0627\u0644\u0625\u062c\u0627\u0628\u0629 \u0627\u0644\u0635\u062d\u064a\u062d\u0629", addQuestionBtn: "\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0633\u0624\u0627\u0644",
      questionList: "\u0627\u0644\u0623\u0633\u0626\u0644\u0629", allSubjects: "\u0643\u0644 \u0627\u0644\u0645\u0648\u0627\u062f", allDiff: "\u0643\u0644 \u0627\u0644\u0645\u0633\u062a\u0648\u064a\u0627\u062a",
      generateQuiz: "\u062a\u0648\u0644\u064a\u062f \u0627\u062e\u062a\u0628\u0627\u0631", quizTitle: "\u0627\u062e\u062a\u0628\u0627\u0631 \u062a\u062f\u0631\u064a\u0628\u064a", submitQuiz: "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u062c\u0627\u0628\u0627\u062a",
      reportCard: "\u0643\u0634\u0641 \u0627\u0644\u062f\u0631\u062c\u0627\u062a", selectStudent: "\u0627\u062e\u062a\u0631 \u0627\u0644\u0637\u0627\u0644\u0628...", printReport: "\u0637\u0628\u0627\u0639\u0629 \u0627\u0644\u062a\u0642\u0631\u064a\u0631",
      downloadPDF: "\u062a\u062d\u0645\u064a\u0644 PDF", classSummary: "\u062a\u0642\u0631\u064a\u0631 \u0645\u0644\u062e\u0635 \u0627\u0644\u0641\u0635\u0644", printSummary: "\u0637\u0628\u0627\u0639\u0629 \u0627\u0644\u0645\u0644\u062e\u0635",
      progressTracking: "\u0645\u062a\u0627\u0628\u0639\u0629 \u0627\u0644\u062a\u0642\u062f\u0645", progressLine: "\u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u062f\u0631\u062c\u0627\u062a",
      progressBySubject: "\u062d\u0633\u0628 \u0627\u0644\u0645\u0627\u062f\u0629", semesterCompare: "\u0645\u0642\u0627\u0631\u0646\u0629 \u0627\u0644\u0641\u0635\u0648\u0644",
      exportPNG: "\u062a\u0635\u062f\u064a\u0631 \u0627\u0644\u0631\u0633\u0648\u0645 PNG", exportPNGDesc: "\u062a\u0646\u0632\u064a\u0644 \u062c\u0645\u064a\u0639 \u0627\u0644\u0631\u0633\u0648\u0645 \u0643\u0635\u0648\u0631",
      exportPDF: "\u062a\u0635\u062f\u064a\u0631 \u0627\u0644\u062a\u0642\u0631\u064a\u0631 PDF", exportPDFDesc: "\u062a\u0646\u0632\u064a\u0644 \u062a\u0642\u0631\u064a\u0631 \u062a\u062d\u0644\u064a\u0644\u064a \u0643\u0627\u0645\u0644",
      exportPPTX: "\u062a\u0635\u062f\u064a\u0631 \u0625\u0644\u0649 PowerPoint", exportPPTXDesc: "\u0639\u0631\u0636 \u062a\u0642\u062f\u064a\u0645\u064a \u0645\u0639 \u0631\u0633\u0648\u0645 \u0648\u0625\u062d\u0635\u0627\u0626\u064a\u0627\u062a",
      loading: "\u062c\u0627\u0631\u064a \u0627\u0644\u0645\u0639\u0627\u0644\u062c\u0629...",
      noData: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a \u0628\u0639\u062f.",
      badgeTop: "\u0623\u062f\u0627\u0621 \u0645\u062a\u0645\u064a\u0632!", badgeImprove: "\u064a\u062d\u062a\u0627\u062c \u062a\u062d\u0633\u064a\u0646",
      badgeGood: "\u0643\u0644 \u0634\u064a \u0645\u0645\u062a\u0627\u0632!",
      grade: "\u0627\u0644\u062f\u0631\u062c\u0629", subject: "\u0627\u0644\u0645\u0627\u062f\u0629", date: "\u0627\u0644\u062a\u0627\u0631\u064a\u062e", type: "\u0627\u0644\u0646\u0648\u0639",
      rank: "\u0627\u0644\u062a\u0631\u062a\u064a\u0628", student: "\u0627\u0644\u0637\u0627\u0644\u0628", average: "\u0627\u0644\u0645\u062a\u0648\u0633\u0637",
      planTitle: "\u062e\u0637\u0629 \u062a\u062d\u0633\u064a\u0646 \u0644\u0640", subjectsWeak: "\u0627\u0644\u0645\u0648\u0627\u062f \u0627\u0644\u0636\u0639\u064a\u0641\u0629:",
      targetGoal: "\u0627\u0644\u0647\u062f\u0641 \u0627\u0644\u0645\u0642\u062a\u0631\u062d:", strongSubjects: "\u0627\u0644\u0645\u0648\u0627\u062f \u0627\u0644\u0642\u0648\u064a\u0629:",
      examPrep: "\u0645\u0645\u0627\u0631\u0633\u0629: 30 \u062f\u0642\u064a\u0642\u0629 \u064a\u0648\u0645\u064a\u0627\u064b \u0639\u0644\u0649 \u0627\u0644\u0645\u0648\u0627\u062f \u0627\u0644\u0636\u0639\u064a\u0641\u0629. \u0627\u0644\u062a\u0631\u0643\u064a\u0632 \u0639\u0644\u0649 \u0627\u0644\u0627\u062e\u062a\u0628\u0627\u0631\u0627\u062a \u0627\u0644\u0633\u0627\u0628\u0642\u0629.",
      tutorial: "\u062e\u0635\u0648\u0635\u064a\u0629 \u0645\u0648\u062c\u0647\u0629 \u0645\u0648\u0635\u0649 \u0628\u0647\u0627 \u0644\u0640", practice: "\u062a\u0643\u0648\u064a\u0646 \u0645\u062c\u0645\u0648\u0639\u0629 \u062f\u0631\u0627\u0633\u064a\u0629 \u0645\u0631\u0643\u0632\u0629 \u0639\u0644\u0649",
      remove: "\u00d7",
      errJSON: "\u0628\u064a\u0627\u0646\u0627\u062a JSON \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629.", errParse: "\u062a\u0639\u0630\u0631 \u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a.",
      errNoData: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a \u0635\u0627\u0644\u062d\u0629.", errNoEntries: "\u0644\u0645 \u062a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0625\u062f\u062e\u0627\u0644\u0627\u062a \u0635\u0627\u0644\u062d\u0629.",
      errNoReport: "\u0627\u062e\u062a\u0631 \u0637\u0627\u0644\u0628\u0627\u064b \u0644\u0639\u0631\u0636 \u0627\u0644\u062a\u0642\u0631\u064a\u0631.",
      questionPrompt: "\u0627\u0644\u0633\u0624\u0627\u0644", options: "\u0627\u0644\u062e\u064a\u0627\u0631\u0627\u062a", correct: "\u0627\u0644\u0635\u062d\u064a\u062d",
      score: "\u0627\u0644\u062f\u0631\u062c\u0629", outOf: "\u0645\u0646",
      yourScore: "\u0646\u062a\u064a\u062c\u062a\u0643:",
      weak: "\u0636\u0639\u064a\u0641", strong: "\u0642\u0648\u064a", target: "\u0627\u0644\u0647\u062f\u0641",
      noStudents: "\u0644\u0627 \u064a\u0648\u062c\u062f \u0637\u0644\u0627\u0628", empty: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0625\u062f\u062e\u0627\u0644\u0627\u062a",
    },
  };

  function t(key) {
    return (TRANSLATIONS[window.App.currentLang] && TRANSLATIONS[window.App.currentLang][key]) || TRANSLATIONS.en[key] || key;
  }

  function setLanguage(lang) {
    window.App.currentLang = lang;
    var html = document.documentElement;
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    html.setAttribute("lang", lang);
    document.getElementById("langToggle").textContent = lang === "en" ? "AR / EN" : "EN / AR";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
    });
    window.App.onLangChange && window.App.onLangChange();
  }

  function toggleLang() {
    setLanguage(window.App.currentLang === "en" ? "ar" : "en");
  }

  function toggleTheme() {
    var html = document.documentElement;
    html.classList.toggle("dark");
    if (window.App.refreshDashboard) window.App.refreshDashboard();
  }

  function showLoading() {
    var el = document.getElementById("loadingOverlay");
    el.classList.remove("hidden");
    el.classList.add("flex");
  }
  function hideLoading() {
    var el = document.getElementById("loadingOverlay");
    el.classList.add("hidden");
    el.classList.remove("flex");
  }
  window.App.showLoading = showLoading;
  window.App.hideLoading = hideLoading;

  /* ============ Navigation ============ */
  function switchTab(tab) {
    document.querySelectorAll(".nav-tab").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-tab") === tab);
    });
    document.querySelectorAll(".page-section").forEach(function (s) {
      s.classList.add("hidden");
      s.classList.remove("active");
    });
    var page = document.getElementById("page-" + tab);
    if (page) {
      page.classList.remove("hidden");
      page.classList.add("active");
    }
    if (window.App.onTabChange) window.App.onTabChange(tab);
  }

  window.App.t = t;
  window.App.setLanguage = setLanguage;

  /* ============ Utility: engagement ============ */
  function uniqueStudents() {
    var seen = {};
    window.App.entries.forEach(function (e) { seen[e.name] = true; });
    return Object.keys(seen).sort();
  }
  function uniqueSubjects() {
    var seen = {};
    window.App.entries.forEach(function (e) { seen[e.subject] = true; });
    return Object.keys(seen).sort();
  }
  window.App.util = { uniqueStudents: uniqueStudents, uniqueSubjects: uniqueSubjects };

  /* ============ Dashboard charts ============ */
  function renderDashboardCharts() {
    if (!window.Ch) return;
    var entries = window.App.entries;
    if (!entries.length) return;
    var grades = entries.map(function (e) { return e.grade; });
    var stats = window.Ana.computeStats(grades);

    var subjMap = {};
    entries.forEach(function (e) {
      if (!subjMap[e.subject]) subjMap[e.subject] = [];
      subjMap[e.subject].push(e.grade);
    });
    var subjects = Object.keys(subjMap);

    window.Ch.makeBar("dashBarChart", subjects, subjects.map(function (s) {
      return +(subjMap[s].reduce(function (a, b) { return a + b; }, 0) / subjMap[s].length).toFixed(1);
    }));
    window.Ch.makeDonut("dashDonutChart", stats.dist);
    window.Ch.makeRadar("dashRadarChart", subjects, subjects.map(function (s) {
      return +(subjMap[s].reduce(function (a, b) { return a + b; }, 0) / subjMap[s].length).toFixed(1);
    }));
  }

  /* ============ Global hooks ============ */
  window.App.refreshDashboard = function () {
    if (window.Ana) {
      window.Ana.renderAll();
      renderDashboardCharts();
    }
    if (window.Entry) window.Entry.refresh();
    if (window.Rpt) window.Rpt.refreshStudentList();
    if (window.Prg) window.Prg.refreshStudentList();
    if (window.Rpt) window.Rpt.renderSummary();
    if (window.QB && window.QB.refreshFilters) window.QB.refreshFilters();
  };

  /* ============ Init bindings ============ */
  function bindStatic() {
    document.getElementById("langToggle").addEventListener("click", toggleLang);
    document.getElementById("themeToggle").addEventListener("click", toggleTheme);

    document.querySelectorAll(".nav-tab").forEach(function (b) {
      b.addEventListener("click", function () { switchTab(b.getAttribute("data-tab")); });
    });

    if (window.Entry) window.Entry.bind();
    if (window.Ana) window.Ana.bind();
    if (window.QB) window.QB.bind();
    if (window.Rpt) window.Rpt.bind();
    if (window.Prg) window.Prg.bind();
    if (window.Exp) window.Exp.bind();
  }

  function init() {
    bindStatic();
    setLanguage(window.App.currentLang);
    window.App.onLangChange = function () {
      if (window.Entry) window.Entry.render();
      if (window.Ana) window.Ana.renderAll();
      if (window.Rpt) window.Rpt.renderSummary();
      if (window.QB && window.QB.refreshFilters) window.QB.refreshFilters();
      window.App.refreshDashboard();
    };
    switchTab("dashboard");
    var mods = [window.Entry, window.Ana, window.QB, window.Rpt, window.Prg, window.Exp];
    mods.forEach(function (m) { if (m && m.init) m.init(); });

    if (window.Entry) window.Entry.render();

    if (window.Ana) {
      window.Ana.renderAll();
      renderDashboardCharts();
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
