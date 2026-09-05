(function () {
  "use strict";

  var App = window.App;

  function save() {
    populateSubjectFilter();
    renderQuestionList();
  }

  function addQuestion() {
    var subject = document.getElementById("qSubject").value.trim();
    var diff = document.getElementById("qDifficulty").value;
    var text = document.getElementById("qText").value.trim();
    var opts = [0, 1, 2, 3].map(function (i) { return document.getElementById("qOpt" + i).value.trim(); });
    var correct = parseInt(document.getElementById("qCorrect").value, 10);
    if (!subject || !text || opts.some(function (o) { return !o; })) {
      alert("Fill all question fields (question, options).");
      return;
    }
    App.questions.push({ subject: subject, difficulty: diff, text: text, options: opts, correct: correct });
    document.getElementById("qSubject").value = "";
    document.getElementById("qText").value = "";
    [0, 1, 2, 3].forEach(function (i) { document.getElementById("qOpt" + i).value = ""; });
    document.getElementById("qCorrect").value = "0";
    save();
  }

  function populateSubjectFilter() {
    var sel = document.getElementById("qFilterSubject");
    var current = sel.value;
    var subjects = window.App.util.uniqueSubjects();
    sel.innerHTML = '<option value="">All</option>';
    subjects.forEach(function (s) {
      var o = document.createElement("option");
      o.value = s; o.textContent = s;
      sel.appendChild(o);
    });
    if (current) sel.value = current;
  }

  function renderQuestionList() {
    var box = document.getElementById("questionList");
    var subj = document.getElementById("qFilterSubject").value;
    var diff = document.getElementById("qFilterDiff").value;
    var list = App.questions.filter(function (q) {
      return (!subj || q.subject === subj) && (!diff || q.difficulty === diff);
    });
    box.innerHTML = "";
    if (!list.length) {
      box.innerHTML = '<p class="text-sm text-gray-400">No questions</p>';
      return;
    }
    list.forEach(function (q, listIdx) {
      var origIdx = App.questions.indexOf(q);
      var card = document.createElement("div");
      card.className = "glass-card p-3";
      card.innerHTML =
        '<div class="flex items-start justify-between">' +
        '<div class="flex-1"><div class="text-xs font-bold mb-1">' + q.subject +
        ' <span class="badge ' + (q.difficulty === "easy" ? "badge-success" : q.difficulty === "medium" ? "badge-warning" : "badge-error") + '">' + q.difficulty + "</span></div>" +
        '<div class="text-sm mb-1">' + q.text + "</div>" +
        '<div class="text-xs text-gray-400">' + q.options.map(function (o, i) { return (i === q.correct ? "\u2713 " : "") + [0, 1, 2, 3][i] + ": " + o; }).join(" | ") + "</div></div>" +
        '<button data-idx="' + origIdx + '" class="btn-danger text-xs px-2 py-1 ml-2">\u00d7</button></div>';
      card.querySelector("button").addEventListener("click", function () {
        App.questions.splice(parseInt(this.getAttribute("data-idx"), 10), 1);
        save();
      });
      box.appendChild(card);
    });
  }

  /* Quiz generation */
  var currentQuiz = [];
  function generateQuiz() {
    var count = Math.min(10, App.questions.length);
    if (!count) { alert("Add questions first."); return; }
    var pool = App.questions.slice();
    currentQuiz = [];
    for (var i = 0; i < count && pool.length; i++) {
      var idx = Math.floor(Math.random() * pool.length);
      currentQuiz.push(pool.splice(idx, 1)[0]);
    }
    showQuiz();
  }

  function showQuiz() {
    var content = document.getElementById("quizContent");
    content.innerHTML = "";
    currentQuiz.forEach(function (q, qi) {
      var block = document.createElement("div");
      block.className = "mb-4";
      block.innerHTML =
        '<div class="font-semibold text-sm mb-2">' + (qi + 1) + ". " + q.text + "</div>" +
        '<div class="space-y-1" data-q="' + qi + '">' +
        q.options.map(function (o, oi) {
          return '<label class="flex items-center gap-2 text-sm cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">' +
            '<input type="radio" name="quiz' + qi + '" value="' + oi + '"> <span>' + String.fromCharCode(65 + oi) + ". " + o + "</span></label>";
        }).join("") +
        "</div>";
      content.appendChild(block);
    });
    document.getElementById("quizModal").classList.remove("hidden");
    document.getElementById("quizModal").classList.add("flex");
  }

  function submitQuiz() {
    var score = 0;
    currentQuiz.forEach(function (q, qi) {
      var sel = document.querySelector('input[name="quiz' + qi + '"]:checked');
      if (sel && parseInt(sel.value, 10) === q.correct) score++;
    });
    var msg = "\u0646\u062a\u064a\u062c\u062a\u0643: " + score + " \u0645\u0646 " + currentQuiz.length;
    document.getElementById("quizContent").innerHTML =
      '<div class="text-center py-6"><div class="text-3xl font-extrabold mb-2 text-emerald-500">' +
      score + " / " + currentQuiz.length + "</div>" +
      '<div class="text-sm text-gray-500">' + (score >= Math.ceil(currentQuiz.length / 2) ? (window.App.currentLang === "ar" ? "\u0623\u062d\u0633\u0646\u062a \u0627\u0644\u0639\u0645\u0644!" : "Great job!") : (window.App.currentLang === "ar" ? "\u0645\u0627\u0631\u0646 \u0623\u0643\u062b\u0631!" : "Keep practicing!")) + "</div></div>";
    document.getElementById("btnSubmitQuiz").style.display = "none";
  }

  window.QB = {
    bind: function () {
      document.getElementById("btnAddQuestion").addEventListener("click", addQuestion);
      document.getElementById("btnGenQuiz").addEventListener("click", generateQuiz);
      document.getElementById("btnSubmitQuiz").addEventListener("click", submitQuiz);
      document.getElementById("btnCloseQuiz").addEventListener("click", function () {
        document.getElementById("quizModal").classList.add("hidden");
        document.getElementById("quizModal").classList.remove("flex");
        document.getElementById("btnSubmitQuiz").style.display = "";
      });
      document.getElementById("qFilterSubject").addEventListener("change", renderQuestionList);
      document.getElementById("qFilterDiff").addEventListener("change", renderQuestionList);
    },
    init: function () {
      populateSubjectFilter();
    },
    refreshFilters: function () {
      populateSubjectFilter();
      renderQuestionList();
    },
  };
})();
