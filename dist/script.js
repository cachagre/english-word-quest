const wordBank = {
  primary: [
    ["apple", "苹果", "/ˈæp.əl/"], ["happy", "开心的", "/ˈhæp.i/"],
    ["family", "家庭", "/ˈfæm.əl.i/"], ["window", "窗户", "/ˈwɪn.doʊ/"],
    ["water", "水", "/ˈwɔː.tər/"], ["friend", "朋友", "/frend/"],
    ["school", "学校", "/skuːl/"], ["beautiful", "美丽的", "/ˈbjuː.tɪ.fəl/"],
    ["morning", "早晨", "/ˈmɔːr.nɪŋ/"], ["animal", "动物", "/ˈæn.ɪ.məl/"],
    ["listen", "听", "/ˈlɪs.ən/"], ["picture", "图片", "/ˈpɪk.tʃər/"],
    ["market", "市场", "/ˈmɑːr.kɪt/"], ["garden", "花园", "/ˈɡɑːr.dən/"],
    ["usually", "通常", "/ˈjuː.ʒu.ə.li/"], ["together", "一起", "/təˈɡeð.ər/"],
    ["season", "季节", "/ˈsiː.zən/"], ["healthy", "健康的", "/ˈhel.θi/"],
    ["answer", "回答", "/ˈæn.sər/"], ["holiday", "假期", "/ˈhɑː.lə.deɪ/"]
  ],
  junior: [
    ["advice", "建议", "/ədˈvaɪs/"], ["achieve", "实现", "/əˈtʃiːv/"],
    ["environment", "环境", "/ɪnˈvaɪ.rən.mənt/"], ["experience", "经历", "/ɪkˈspɪr.i.əns/"],
    ["culture", "文化", "/ˈkʌl.tʃər/"], ["protect", "保护", "/prəˈtekt/"],
    ["develop", "发展", "/dɪˈvel.əp/"], ["possible", "可能的", "/ˈpɑː.sə.bəl/"],
    ["instead", "代替", "/ɪnˈsted/"], ["imagine", "想象", "/ɪˈmædʒ.ɪn/"],
    ["progress", "进步", "/ˈprɑː.ɡres/"], ["suggest", "建议", "/səˈdʒest/"],
    ["communicate", "交流", "/kəˈmjuː.nə.keɪt/"], ["volunteer", "志愿者", "/ˌvɑː.lənˈtɪr/"],
    ["knowledge", "知识", "/ˈnɑː.lɪdʒ/"], ["challenge", "挑战", "/ˈtʃæl.ɪndʒ/"],
    ["encourage", "鼓励", "/ɪnˈkɝː.ɪdʒ/"], ["decision", "决定", "/dɪˈsɪʒ.ən/"],
    ["success", "成功", "/səkˈses/"], ["improve", "改善", "/ɪmˈpruːv/"]
  ],
  senior: [
    ["significant", "重要的", "/sɪɡˈnɪf.ɪ.kənt/"], ["consequence", "结果", "/ˈkɑːn.sə.kwens/"],
    ["perspective", "观点", "/pərˈspek.tɪv/"], ["phenomenon", "现象", "/fəˈnɑː.mə.nɑːn/"],
    ["appropriate", "适当的", "/əˈproʊ.pri.ət/"], ["acquire", "获得", "/əˈkwaɪr/"],
    ["maintain", "保持", "/meɪnˈteɪn/"], ["essential", "必不可少的", "/ɪˈsen.ʃəl/"],
    ["contribute", "贡献", "/kənˈtrɪb.juːt/"], ["evaluate", "评估", "/ɪˈvæl.ju.eɪt/"],
    ["potential", "潜在的", "/pəˈten.ʃəl/"], ["demonstrate", "证明", "/ˈdem.ən.streɪt/"],
    ["circumstance", "情况", "/ˈsɝː.kəm.stæns/"], ["alternative", "替代方案", "/ɔːlˈtɝː.nə.tɪv/"],
    ["acknowledge", "承认", "/əkˈnɑː.lɪdʒ/"], ["distinguish", "区分", "/dɪˈstɪŋ.ɡwɪʃ/"],
    ["considerable", "相当大的", "/kənˈsɪd.ər.ə.bəl/"], ["influence", "影响", "/ˈɪn.flu.əns/"],
    ["interpret", "解释", "/ɪnˈtɝː.prət/"], ["tendency", "趋势", "/ˈten.dən.si/"]
  ]
};

const levelNames = { primary: "小学词汇", junior: "初中词汇", senior: "高中词汇" };
const $ = (id) => document.getElementById(id);
const state = {
  level: "primary", mode: "mixed", questions: [], index: 0, score: 0,
  streak: 0, bestStreak: 0, correct: 0, wrong: [], answered: false,
  reviewMode: false, sessionMax: 10
};

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"));
  $(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectLevel(button) {
  document.querySelectorAll(".level-card").forEach((card) => {
    card.classList.remove("selected");
    card.setAttribute("aria-checked", "false");
  });
  button.classList.add("selected");
  button.setAttribute("aria-checked", "true");
  state.level = button.dataset.level;
}

function makeQuestions(source, count) {
  return shuffle(source).slice(0, count).map((word, index) => {
    let direction = state.mode;
    if (direction === "mixed") direction = index % 2 === 0 ? "en-zh" : "zh-en";
    const answerIndex = direction === "en-zh" ? 1 : 0;
    const pool = wordBank[state.level].filter((item) => item[0] !== word[0]);
    const distractors = shuffle(pool).slice(0, 3).map((item) => item[answerIndex]);
    return { word, direction, options: shuffle([word[answerIndex], ...distractors]) };
  });
}

function beginGame(reviewWords = null) {
  state.mode = $("mode-select").value;
  state.reviewMode = Boolean(reviewWords);
  const source = reviewWords || wordBank[state.level];
  const count = reviewWords ? reviewWords.length : Math.min(10, source.length);
  state.questions = makeQuestions(source, count);
  state.index = 0;
  state.score = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.correct = 0;
  state.wrong = [];
  state.answered = false;
  state.sessionMax = count;
  showScreen("game-screen");
  renderQuestion();
}

function renderQuestion() {
  const question = state.questions[state.index];
  const [english, chinese, phonetic] = question.word;
  const isEnZh = question.direction === "en-zh";
  $("question-count").textContent = `第 ${state.index + 1} / ${state.sessionMax} 题`;
  $("level-label").textContent = state.reviewMode ? "错词重练" : levelNames[state.level];
  $("progress-bar").style.width = `${((state.index + 1) / state.sessionMax) * 100}%`;
  $("score").textContent = state.score;
  $("direction-label").textContent = isEnZh ? "选择正确的中文释义" : "选择正确的英文单词";
  $("question-word").textContent = isEnZh ? english : chinese;
  $("phonetic").textContent = isEnZh ? phonetic : "选择对应的英文表达";
  $("speak-button").hidden = !isEnZh;
  $("feedback").textContent = "";
  $("feedback").className = "feedback";
  $("next-button").hidden = true;
  $("hint-button").disabled = false;
  $("streak-badge").textContent = `连对 ${state.streak}`;
  $("streak-badge").classList.toggle("hot", state.streak >= 3);
  state.answered = false;

  $("options").innerHTML = "";
  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "option-button";
    button.innerHTML = `<span class="option-key">${index + 1}</span><span>${option}</span>`;
    button.addEventListener("click", () => answerQuestion(option, button));
    $("options").appendChild(button);
  });
}

function answerQuestion(selected, button) {
  if (state.answered) return;
  state.answered = true;
  const question = state.questions[state.index];
  const answer = question.direction === "en-zh" ? question.word[1] : question.word[0];
  const buttons = [...document.querySelectorAll(".option-button")];
  buttons.forEach((optionButton) => {
    optionButton.disabled = true;
    if (optionButton.lastElementChild.textContent === answer) optionButton.classList.add("correct");
  });

  if (selected === answer) {
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.correct += 1;
    const bonus = Math.min(5, state.streak - 1) * 2;
    state.score += 10 + bonus;
    $("feedback").textContent = bonus ? `答对了！连胜加分 +${10 + bonus}` : "答对了！+10";
    $("feedback").classList.add("good");
  } else {
    button.classList.add("wrong");
    state.streak = 0;
    if (!state.wrong.some((word) => word[0] === question.word[0])) state.wrong.push(question.word);
    $("feedback").textContent = `正确答案：${answer}`;
    $("feedback").classList.add("bad");
  }
  $("score").textContent = state.score;
  $("streak-badge").textContent = `连对 ${state.streak}`;
  $("next-button").hidden = false;
  $("hint-button").disabled = true;
  updateLifetime(selected === answer);
}

function nextQuestion() {
  if (!state.answered) return;
  if (state.index < state.questions.length - 1) {
    state.index += 1;
    renderQuestion();
  } else {
    showResult();
  }
}

function giveHint() {
  if (state.answered) return;
  const question = state.questions[state.index];
  const target = question.direction === "en-zh" ? question.word[1] : question.word[0];
  const hint = question.direction === "en-zh"
    ? `提示：答案有 ${target.length} 个汉字`
    : `提示：首字母是 ${target[0].toUpperCase()}，共 ${target.length} 个字母`;
  state.score = Math.max(0, state.score - 5);
  $("score").textContent = state.score;
  $("feedback").textContent = hint;
  $("hint-button").disabled = true;
}

function speakCurrent() {
  const word = state.questions[state.index]?.word[0];
  if (!word || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.82;
  speechSynthesis.speak(utterance);
}

function showResult() {
  const accuracy = Math.round((state.correct / state.sessionMax) * 100);
  const grade = accuracy >= 90 ? "S" : accuracy >= 80 ? "A" : accuracy >= 60 ? "B" : "C";
  $("final-score").textContent = state.score;
  $("final-accuracy").textContent = `${accuracy}%`;
  $("correct-count").textContent = `${state.correct} / ${state.sessionMax}`;
  $("best-streak").textContent = state.bestStreak;
  $("grade-letter").textContent = grade;
  $("result-message").textContent = accuracy >= 80 ? "状态很棒，保持住这份节奏。" : "错词已经收好，复习一轮就会更稳。";
  $("wrong-list").innerHTML = "";

  if (state.wrong.length) {
    $("review-title").textContent = `${state.wrong.length} 个词需要再看一眼`;
    state.wrong.forEach(([english, chinese]) => {
      const tag = document.createElement("span");
      tag.className = "wrong-word";
      tag.textContent = `${english} · ${chinese}`;
      $("wrong-list").appendChild(tag);
    });
    $("review-button").hidden = false;
  } else {
    $("review-title").textContent = "本局全部掌握";
    $("wrong-list").innerHTML = '<span class="mastered-word">零错题，完美通关！</span>';
    $("review-button").hidden = true;
  }

  localStorage.setItem("lexiquest-last", JSON.stringify({ score: state.score, accuracy }));
  showScreen("result-screen");
}

function updateLifetime(isCorrect) {
  const stored = JSON.parse(localStorage.getItem("lexiquest-stats") || '{"mastered":0,"maxStreak":0}');
  if (isCorrect) stored.mastered += 1;
  stored.maxStreak = Math.max(stored.maxStreak, state.streak);
  localStorage.setItem("lexiquest-stats", JSON.stringify(stored));
  $("top-mastered").textContent = stored.mastered;
  $("top-streak").textContent = stored.maxStreak;
}

function loadSavedData() {
  const stats = JSON.parse(localStorage.getItem("lexiquest-stats") || '{"mastered":0,"maxStreak":0}');
  $("top-mastered").textContent = stats.mastered;
  $("top-streak").textContent = stats.maxStreak;
  const last = JSON.parse(localStorage.getItem("lexiquest-last") || "null");
  if (last) {
    $("last-result").hidden = false;
    $("last-score").textContent = last.score;
    $("last-accuracy").textContent = `正确率 ${last.accuracy}%`;
  }
}

document.querySelectorAll(".level-card").forEach((button) => button.addEventListener("click", () => selectLevel(button)));
$("start-button").addEventListener("click", () => beginGame());
$("next-button").addEventListener("click", nextQuestion);
$("hint-button").addEventListener("click", giveHint);
$("speak-button").addEventListener("click", speakCurrent);
$("quit-button").addEventListener("click", () => showScreen("setup-screen"));
$("restart-button").addEventListener("click", () => {
  showScreen("setup-screen");
  loadSavedData();
});
$("review-button").addEventListener("click", () => beginGame([...state.wrong]));

document.addEventListener("keydown", (event) => {
  if (!$("game-screen").classList.contains("active")) return;
  if (event.key >= "1" && event.key <= "4" && !state.answered) {
    document.querySelectorAll(".option-button")[Number(event.key) - 1]?.click();
  }
  if (event.key === "Enter" && state.answered) nextQuestion();
});

loadSavedData();
