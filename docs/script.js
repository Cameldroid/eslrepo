const questions = [
    { "text": "1. Jennifer, ________?", "options": ["are it you?", "is they you?", "is it you?", "is you?"], "correctIndex": 2 },
    { "text": "2. You have _________ therapeutic massage", "options": ["50-minute", "50 minutes", "a 50 minutes", "a 50-minute"], "correctIndex": 3 },
    { "text": "3. Do you _________________ before the session?", "options": ["go to the toilet", "need go to toilet", "need to go to toilet", "need to go to the toilet"], "correctIndex": 3 },
    { "text": "4. Before we start, I need  ___________  your    body.", "options": ["information about", "some  information", "information", "some information about"], "correctIndex": 3 },
    { "text": "5. This is _________.", "options": ["massage room", "your massage room", "room massage", "your room massage"], "correctIndex": 1 },
    { "text": "6. Could you please __________? We don't want it to get dirty or damaged during the session.", "options": ["remove watch", "to remove your watch", "remove your watch", "remove my watch"], "correctIndex": 2 },
    { "text": "7. You can leave  ________ here.", "options": ["things", "your thing", "your things", "my things"], "correctIndex": 2 },
    { "text": "8. This ______ you.", "options": ["tower is for", "towel is for", "towel is mine", "towel is beautiful"], "correctIndex": 1 },
    { "text": "9. Please _________ and cover yourself.", "options": ["lie face down", "face-down", "face down", "lie face-down"], "correctIndex": 0 },
    { "text": "10. _____ comfortable for you?", "options": ["Is", "Is it", "It", "Are it"], "correctIndex": 1 },
    { "text": "11. Would you like ____, medium, or light pressure?", "options": ["strong", "firm", "medium", "light"], "correctIndex": 1 },
    { "text": "12. I am starting now. ___________ something, please tell me.", "options": ["Need", "If need", "If you need to", "If you need"], "correctIndex": 3 },
    { "text": "13. __ pressure ok for you?", "options": ["Is", "It", "Is the", "The"], "correctIndex": 2 },
    { "text": "14. Can you please  ________?", "options": ["turn over", "turnover", "turn", "turn me over"], "correctIndex": 0 },
    { "text": "15. Now, I _______ that.", "options": ["change", "will change", "will", "changed"], "correctIndex": 1 },
    { "text": "16. We _________.", "options": ["finished", "finish", "are finish", "are finished"], "correctIndex": 3 },
    { "text": "17. You can  ________.", "options": ["get up slow", "get slowly", "get slow", "get up slowly"], "correctIndex": 3 },
    { "text": "18. _____ welcome!", "options": ["You are", "Are", "You is", "It is"], "correctIndex": 0 },
    { "text": "19. I _______ you outside.", "options": ["will see to", "will see", "to see", "I go see to"], "correctIndex": 1 },
    { "text": "20. _________  feeling now?", "options": ["How are", "How are you", "Are you", "You are"], "correctIndex": 1 },
    { "text": "21. ________________ water?", "options": ["Would you like", "Would you to like some", "Would you like some", "Do you want some"], "correctIndex": 2 },
    { "text": "22. Ok, _____________ you.", "options": ["for", "is for", "this is", "this is for you"], "correctIndex": 3 },
    { "text": "23. ________________ , or is it just for relaxation?", "options": ["Do you have pain", "You have any pain", "Have any pain", "Do you have any pain"], "correctIndex": 3 },
    { "text": "24. __________________ only on your back, or back and a little leg?", "options": ["You like me work", "Would you like me work", "Would you like me to work", "You like me to work"], "correctIndex": 2 }
];

// STATE
let currentIdx = 0;
let hearts = 3;
let score = 0;
let isProcessing = false;

// ELEMENTS
const elContainer = document.getElementById('game-container');
const elStartScreen = document.getElementById('start-screen');
const elGameOverScreen = document.getElementById('game-over-screen');
const elVictoryScreen = document.getElementById('victory-screen');
const elFeedbackOverlay = document.getElementById('feedback-overlay');
const elFeedbackText = document.getElementById('feedback-text');

const elHearts = document.getElementById('hearts-display');
const elLevel = document.getElementById('level-display');
const elScore = document.getElementById('score-display');

const elQuestionText = document.getElementById('q-text');
const elOptionsArea = document.getElementById('options-area');

// BUTTONS
document.getElementById('btn-start').onclick = startGame;
document.getElementById('btn-restart').onclick = startGame;
document.getElementById('btn-play-again').onclick = startGame;

function startGame() {
    currentIdx = 0;
    hearts = 3;
    score = 0;
    isProcessing = false;

    updateHUD();
    elStartScreen.classList.add('hidden');
    elGameOverScreen.classList.add('hidden');
    elVictoryScreen.classList.add('hidden');

    loadQuestion();
}

function updateHUD() {
    let hStr = '';
    for (let i = 0; i < hearts; i++) hStr += '❤️';
    elHearts.textContent = hStr;

    elLevel.textContent = 'LVL ' + (currentIdx + 1);
    elScore.textContent = 'SCORE: ' + score;
}

function loadQuestion() {
    if (currentIdx >= questions.length) {
        winGame();
        return;
    }

    isProcessing = false;
    const q = questions[currentIdx];
    updateHUD();

    elQuestionText.textContent = q.text;
    elOptionsArea.innerHTML = '';

    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.onclick = () => handleAnswer(idx);
        elOptionsArea.appendChild(btn);
    });
}

function handleAnswer(selectedIndex) {
    if (isProcessing) return;
    isProcessing = true;

    const q = questions[currentIdx];
    const isCorrect = (selectedIndex === q.correctIndex);

    if (isCorrect) {
        score += 100;
        playSound('correct');
        showFeedback(true);
        setTimeout(() => {
            currentIdx++;
            loadQuestion();
        }, 1200);
    } else {
        hearts--;
        updateHUD();
        playSound('wrong');
        elContainer.classList.add('shake');
        setTimeout(() => elContainer.classList.remove('shake'), 500);

        showFeedback(false);

        if (hearts <= 0) {
            setTimeout(gameOver, 1200);
        } else {
            // Give them a moment to realize they were wrong, then let them try again?
            // "Don't lose all hearts" implies you can fail.
            // In typical games, you might retry the same question or fail the level.
            // Let's allow retry on same question until hearts fail.
            setTimeout(() => {
                isProcessing = false;
            }, 1200);
        }
    }
}

function showFeedback(isCorrect) {
    elFeedbackText.textContent = isCorrect ? 'PERFECT!' : 'WRONG!';
    elFeedbackText.className = 'feedback-msg ' + (isCorrect ? 'correct-msg' : 'wrong-msg');
    elFeedbackOverlay.classList.add('active');

    setTimeout(() => {
        elFeedbackOverlay.classList.remove('active');
    }, 1000);
}

function gameOver() {
    elGameOverScreen.classList.remove('hidden');
    document.getElementById('final-score-text').textContent = 'You reached Question ' + (currentIdx + 1) + '\nFinal Score: ' + score;
}

function winGame() {
    elVictoryScreen.classList.remove('hidden');
    document.getElementById('victory-text').textContent = 'You answered all 24 questions!\nTotal Score: ' + score;
}

function playSound(type) {
    const audio = document.getElementById(type === 'correct' ? 'snd-correct' : 'snd-wrong');
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio autoplay blocked', e));
    }
}
