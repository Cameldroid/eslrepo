// FINAL CONSOLIDATED SCRIPT (Native TTS)

// questions loaded from questions.js
// Default fallback if loading fails
if (typeof questions === 'undefined') {
    alert("Error: questions.js not loaded.");
}

// STATE
let currentIdx = 0;
let score = 0;
let userMistakes = [];
let availableVoices = [];
let isFeedbackShown = false;

// ELEMENTS
const elApp = document.getElementById('app-container');
const elStart = document.getElementById('start-screen');
const elResults = document.getElementById('results-screen');
const elFeedback = document.getElementById('feedback-overlay');
const elOpts = document.getElementById('options-area');
const elQ = document.getElementById('q-text');

// INIT
window.speechSynthesis.onvoiceschanged = () => {
    availableVoices = window.speechSynthesis.getVoices();
};

document.getElementById('btn-start').onclick = startLesson;
document.getElementById('btn-restart').onclick = startLesson;
document.getElementById('btn-next').onclick = nextQuestion;
document.getElementById('btn-replay-fb').onclick = () => {
    const q = questions[currentIdx];
    speak(constructSentence(q.text, q.options[q.correctIndex], true));
};
document.getElementById('btn-speak-q').onclick = () => speak(clean(questions[currentIdx].text));

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (!elStart.classList.contains('hidden')) startLesson();
        else if (!elResults.classList.contains('hidden')) startLesson();
        else if (isFeedbackShown) nextQuestion();
    }
});

function startLesson() {
    currentIdx = 0;
    score = 0;
    userMistakes = [];
    isFeedbackShown = false;

    elStart.classList.add('hidden');
    elResults.classList.add('hidden');
    elFeedback.classList.add('hidden');
    updateScore();
    loadQuestion();
}

function loadQuestion() {
    if (currentIdx >= questions.length) {
        showResults();
        return;
    }

    const q = questions[currentIdx];
    isFeedbackShown = false;

    // UI Update
    document.getElementById('progress-fill').style.width = ((currentIdx / questions.length) * 100) + "%";
    document.getElementById('progress-text').textContent = `${currentIdx + 1} / ${questions.length}`;

    elQ.textContent = q.text;
    elOpts.innerHTML = '';
    elFeedback.classList.add('hidden');

    q.options.forEach((opt, idx) => {
        const btn = document.createElement('div');
        btn.className = 'option-btn';

        const txt = document.createElement('span');
        txt.textContent = opt;

        const spk = document.createElement('button');
        spk.className = 'btn-mini-speak';
        spk.textContent = '🔊';
        spk.title = "Listen";
        spk.onclick = (e) => { e.stopPropagation(); speak(opt); };

        btn.appendChild(txt);
        btn.appendChild(spk);

        btn.onclick = () => handleAnswer(idx, btn);
        elOpts.appendChild(btn);
    });
}

function handleAnswer(idx, btn) {
    if (isFeedbackShown) return;

    const all = document.querySelectorAll('.option-btn');
    all.forEach(b => { b.classList.add('disabled'); b.onclick = null; });

    const q = questions[currentIdx];
    const isCorrect = (idx === q.correctIndex);
    const correctText = q.options[q.correctIndex];

    const fullTextSpeak = constructSentence(q.text, correctText, true);
    const fullTextShow = constructSentence(q.text, correctText, false);

    if (isCorrect) {
        score++;
        btn.classList.add('correct');
        showFeedback(true, "Correct!", fullTextShow);
        speak("Correct! " + fullTextSpeak);
    } else {
        btn.classList.add('wrong');
        all[q.correctIndex].classList.add('correct');
        showFeedback(false, "Incorrect", fullTextShow);
        speak("Incorrect. " + fullTextSpeak);

        userMistakes.push({ q: q.text, user: q.options[idx], ans: correctText });
    }

    updateScore();
    isFeedbackShown = true;
}

function showFeedback(isCorrect, title, body) {
    elFeedback.classList.remove('hidden');
    document.getElementById('feedback-title').textContent = title;
    document.getElementById('feedback-title').style.color = isCorrect ? 'var(--accent-green)' : 'var(--accent-red)';
    document.getElementById('feedback-body').innerHTML = body;
    document.getElementById('feedback-icon').textContent = isCorrect ? '🎉' : '❌';
}

function nextQuestion() {
    currentIdx++;
    loadQuestion();
}

function showResults() {
    elResults.classList.remove('hidden');
    const pct = Math.round((score / questions.length) * 100);
    document.getElementById('final-pct').textContent = `${pct}%`;
    document.getElementById('final-msg').textContent = `You answered ${score}/${questions.length} correctly.`;

    const list = document.getElementById('review-list');
    list.innerHTML = '';

    if (userMistakes.length === 0) list.innerHTML = "<p>Perfect! No mistakes.</p>";
    else {
        userMistakes.forEach(m => {
            const d = document.createElement('div');
            d.className = 'review-item';
            d.innerHTML = `<div class='review-q'>${m.q}</div><div class='review-a'>You: ${m.user}</div><div class='review-c'>Ans: ${m.ans}</div>`;
            list.appendChild(d);
        });
    }
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

// LOGIC HELPERS
function clean(t) { return t.replace(/^\d+\.\s+/, '').replace(/_{2,}/g, 'blank'); }

function constructSentence(q, a, isSpeech) {
    let t = q.replace(/^\d+\.\s+/, '');
    if (/_{2,}/.test(t)) {
        return isSpeech ? t.replace(/_{2,}/, a) : t.replace(/_{2,}/, ` <strong>${a}</strong> `);
    }
    return isSpeech ? (t + " " + a) : (t + ` <strong>${a}</strong>`);
}

function speak(text) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.9;

    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google US English')) ||
        voices.find(v => v.name.includes('Zira')) ||
        voices.find(v => v.lang.startsWith('en'));
    if (preferred) u.voice = preferred;

    window.speechSynthesis.speak(u);
}
