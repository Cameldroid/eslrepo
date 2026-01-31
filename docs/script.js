// FINAL CONSOLIDATED SCRIPT (Native TTS)

// INLINED DATA - Solving the GitHub Pages loading error
const questions = [
    { "text": "1. Jennifer, ________?", "options": ["are it you?", "is they you?", "is it you?", "is you?"], "correctIndex": 2 },
    { "text": "2. You have _________ therapeutic massage", "options": ["50-minute", "50 minutes", "a 50 minutes", "a 50-minute"], "correctIndex": 3 },
    { "text": "3. Do you _________________ before the session?", "options": ["go to the toilet", "need go to toilet", "need to go to toilet", "need to go to the toilet"], "correctIndex": 3 },
    { "text": "4. Before we start, I need ___________ your body.", "options": ["information about", "some information", "information", "some information about"], "correctIndex": 3 },
    { "text": "5. This is _________.", "options": ["massage room", "your massage room", "room massage", "your room massage"], "correctIndex": 1 },
    { "text": "6. Could you please __________? We don't want it to get dirty or damaged during the session.", "options": ["remove watch", "to remove your watch", "remove your watch", "remove my watch"], "correctIndex": 2 },
    { "text": "7. You can leave ________ here.", "options": ["things", "your thing", "your things", "my things"], "correctIndex": 2 },
    { "text": "8. This ______ you.", "options": ["tower is for", "towel is for", "towel is mine", "towel is beautiful"], "correctIndex": 1 },
    { "text": "9. _____ comfortable for you?", "options": ["Is", "Is it", "It", "Are it"], "correctIndex": 1 },
    { "text": "10. Would you like ____, medium, or light pressure?", "options": ["strong", "firm", "medium", "light"], "correctIndex": 1 },
    { "text": "11. I am starting now. ___________ something, please tell me.", "options": ["Need", "If need", "If you need to", "If you need"], "correctIndex": 3 },
    { "text": "12. __ pressure ok for you?", "options": ["Is", "It", "Is the", "The"], "correctIndex": 2 },
    { "text": "13. Can you please ________?", "options": ["turn over", "turnover", "turn", "turn me over"], "correctIndex": 0 },
    { "text": "14. Now, I _______ that.", "options": ["change", "will change", "will", "changed"], "correctIndex": 1 },
    { "text": "15. We _________.", "options": ["finished", "finish", "are finish", "are finished"], "correctIndex": 3 },
    { "text": "16. You can ________.", "options": ["get up slow", "get slowly", "get slow", "get up slowly"], "correctIndex": 3 },
    { "text": "17. _____ welcome!", "options": ["You are", "Are", "You is", "It is"], "correctIndex": 0 },
    { "text": "18. I _______ you outside.", "options": ["will see to", "will see", "to see", "I go see to"], "correctIndex": 1 },
    { "text": "19. _________ feeling now?", "options": ["How are", "How are you", "Are you", "You are"], "correctIndex": 1 },
    { "text": "20. ________________ water?", "options": ["Would you like", "Would you to like some", "Would you like some", "Do you want some"], "correctIndex": 2 },
    { "text": "21. Ok, _____________ you.", "options": ["for", "is for", "this is", "this is for you"], "correctIndex": 3 },
    { "text": "22. ________________ , or is it just for relaxation?", "options": ["Do you have pain", "You have any pain", "Have any pain", "Do you have any pain"], "correctIndex": 3 },
    { "text": "23. __________________ only on your back, or back and a little leg?", "options": ["You like me work", "Would you like me work", "Would you like me to work", "You like me to work"], "correctIndex": 2 }
];

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
