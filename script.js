// === БЕЗОПАСНЫЙ ЗВУКОВОЙ ФИДБЭК ===
let audioCtx = null;
let isAudioEnabled = false;

function initSafeAudio() {
    if (isAudioEnabled) return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
            isAudioEnabled = true;
        }
    } catch (e) {
        isAudioEnabled = false;
    }
}

function safePlayTone(frequency, duration = 0.15, volume = 0.1) {
    if (!isAudioEnabled || !audioCtx) return;
    try {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gainNode.gain.value = volume;
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        const now = audioCtx.currentTime;
        oscillator.start(now);
        oscillator.stop(now + duration);
    } catch (e) {
        // Игнорируем ошибки звука
    }
}

function playCorrectSound() {
    if (!isAudioEnabled || !audioCtx) return;

    // Мелодичный звук: C5-E5-G5 (до-ми-соль) — позитивный мажорный аккорд
    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const duration = 0.12;

    notes.forEach((freq, i) => {
        try {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.value = freq;

            // Плавное затухание
            gainNode.gain.setValueAtTime(0.15, now + i * 0.08);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + duration);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start(now + i * 0.08);
            oscillator.stop(now + i * 0.08 + duration);
        } catch (e) {
            // Игнорируем ошибки
        }
    });
}

function playIncorrectSound() {
    if (!isAudioEnabled) return;
    safePlayTone(200, 0.2, 0.1);
}

function playLevelCompleteSound() {
    if (!isAudioEnabled) return;
    const melody = [523, 659, 784];
    melody.forEach((freq, i) => {
        setTimeout(() => safePlayTone(freq, 0.18, 0.15), i * 200);
    });
}

// Конфигурация игры
const GAME_CONFIG = {
    expPerCorrectAnswer: 10,
    bonusExpPerfect: 50,
    requiredScore: 70,
    expPerLevel: 1000
};

// Данные уровней
const LEVELS = [
    {
        id: 'savings',
        title: 'Основы накоплений',
        description: 'Узнайте, как правильно откладывать деньги и создавать финансовую подушку безопасности',
        difficulty: 1,
        reward: 100,
        topic: 'Накопления',
        icon: '💰',
        questions: [
            {
                question: 'Какой размер финансовой подушки рекомендуется финансовыми экспертами?',
                answers: [
                    '1-2 месяца расходов',
                    '3-6 месяцев расходов', 
                    '1 год расходов',
                    'Финансовая подушка не нужна'
                ],
                correctAnswer: 1,
                explanation: 'Правильно! Финансовая подушка в размере 3-6 месяцев расходов помогает пережить потерю работы, болезнь или другие непредвиденные ситуации без долгов.'
            },
            {
                question: 'Что означает принцип "заплати сначала себе"?',
                answers: [
                    'Сначала тратить на развлечения',
                    'Сначала откладывать, потом тратить',
                    'Сначала платить по кредитам',
                    'Сначала помогать родственникам'
                ],
                correctAnswer: 1,
                explanation: 'Верно! "Заплати сначала себе" - это стратегия, при которой вы сначала откладываете часть дохода на свои финансовые цели, а оставшиеся деньги тратите на текущие нужды.'
            },
            {
                question: 'Какой способ накопления считается наиболее эффективным?',
                answers: [
                    'Автоматические переводы на сберегательный счет',
                    'Откладывать то, что осталось в конце месяца',
                    'Хранить деньги дома в копилке',
                    'Инвестировать все свободные средства'
                ],
                correctAnswer: 0,
                explanation: 'Правильно! Автоматические переводы помогают дисциплинированно накапливать деньги, не полагаясь на силу воли и не откладывая "что останется".'
            },
            {
                question: 'Для чего нужен отдельный накопительный счет?',
                answers: [
                    'Чтобы банк платил больше процентов',
                    'Чтобы деньги не смешивались с повседневными расходами',
                    'Чтобы было удобнее отслеживать прогресс',
                    'Все перечисленные варианты'
                ],
                correctAnswer: 3,
                explanation: 'Верно! Отдельный накопительный счет помогает разделять деньги, лучше отслеживать прогресс к цели и некоторые банки предлагают повышенные проценты на такие счета.'
            },
            {
                question: 'Что такое "правило 50/30/20" в распределении доходов?',
                answers: [
                    '50% - налоги, 30% - сбережения, 20% - траты',
                    '50% - необходимые расходы, 30% - желания, 20% - сбережения',
                    '50% - инвестиции, 30% - сбережения, 20% - траты',
                    '50% - траты, 30% - сбережения, 20% - благотворительность'
                ],
                correctAnswer: 1,
                explanation: 'Правильно! Правило 50/30/20 предполагает: 50% дохода на необходимые расходы (жилье, еда, транспорт), 30% на желания (развлечения, хобби) и 20% на сбережения и инвестиции.'
            }
        ]
    },
    {
        id: 'security',
        title: 'Финансовая безопасность',
        description: 'Научитесь защищать свои деньги от мошенников и финансовых рисков',
        difficulty: 2,
        reward: 150,
        topic: 'Безопасность',
        icon: '🛡️',
        questions: [
            {
                question: 'Вам звонят и представляются сотрудником банка. Просят назвать CVV-код карты для "проверки". Ваши действия?',
                answers: [
                    'Назвать код, чтобы доказать, что карта у меня',
                    'Уточнить отделение банка и перезвонить по официальному номеру',
                    'Сообщить, что карта не при мне',
                    'Назвать только первые цифры номера карты'
                ],
                correctAnswer: 1,
                explanation: 'Верно! Никогда не сообщайте CVV-код, пароли и пин-коды. Сотрудники банка никогда не спрашивают эту информацию. Всегда перезванивайте по официальным номерам банка.'
            },
            {
                question: 'Какие данные НЕЛЬЗЯ сообщать по телефону или в сообщениях?',
                answers: [
                    'Только номер паспорта',
                    'Только номер карты',
                    'Пароли, CVV-код, коды из SMS',
                    'Можно сообщать все, если представились из банка'
                ],
                correctAnswer: 2,
                explanation: 'Правильно! Пароли, CVV-коды и коды из SMS - это конфиденциальная информация, которую нельзя никому сообщать, даже сотрудникам банка.'
            },
            {
                question: 'Что делать, если вы все-таки передали мошенникам данные карты?',
                answers: [
                    'Ничего, возможно, это была проверка',
                    'Немедленно заблокировать карту и сообщить в банк',
                    'Поменять PIN-код в банкомате',
                    'Дождаться списания денег, потом жаловаться'
                ],
                correctAnswer: 1,
                explanation: 'Верно! При малейшем подозрении на мошенничество немедленно блокируйте карту через мобильное приложение банка или по телефону горячей линии.'
            },
            {
                question: 'Как распознать фишинговое письмо от "банка"?',
                answers: [
                    'В письме есть логотип банка',
                    'Ссылка ведет на сайт с похожим названием',
                    'В письме указано ваше полное имя',
                    'Все перечисленные признаки'
                ],
                correctAnswer: 3,
                explanation: 'Правильно! Мошенники часто используют логотипы, создают сайты-двойники и указывают ваши реальные данные для доверия. Всегда проверяйте адрес сайта в браузере.'
            },
            {
                question: 'Что такое двухфакторная аутентификация и зачем она нужна?',
                answers: [
                    'Это два пароля для входа',
                    'Это подтверждение входа через SMS/приложение',
                    'Это резервные коды доступа',
                    'Это проверка по отпечатку пальца и паролю'
                ],
                correctAnswer: 1,
                explanation: 'Верно! Двухфакторная аутентификация добавляет дополнительный уровень защиты - даже если мошенник узнает ваш пароль, ему понадобится доступ к вашему телефону.'
            }
        ]
    },
    {
        id: 'goals',
        title: 'Финансовые цели',
        description: 'Научитесь ставить и достигать финансовые цели с помощью правильного планирования',
        difficulty: 2,
        reward: 120,
        topic: 'Планирование', 
        icon: '🎯',
        questions: [
            {
                question: 'Что такое SMART-критерии для финансовых целей?',
                answers: [
                    'Цели должны быть сложными и недостижимыми',
                    'Конкретные, измеримые, достижимые, релевантные, ограниченные по времени',
                    'Цели должны быть только долгосрочными',
                    'Это специальная банковская программа'
                ],
                correctAnswer: 1,
                explanation: 'Правильно! SMART - это Specific (конкретные), Measurable (измеримые), Achievable (достижимые), Relevant (релевантные), Time-bound (ограниченные по времени).'
            },
            {
                question: 'Как лучше распределять доход для достижения нескольких целей?',
                answers: [
                    'Сначала достичь одну цель, потом другую',
                    'Откладывать на все цели одновременно, распределяя по приоритетам',
                    'Взять кредит на все цели сразу', 
                    'Откладывать только на самую приятную цель'
                ],
                correctAnswer: 1,
                explanation: 'Верно! Распределение по приоритетам позволяет двигаться к нескольким целям одновременно, не откладывая важное на потом.'
            },
            {
                question: 'Какой процент от дохода рекомендуется откладывать на финансовые цели?',
                answers: [
                    '5-10%',
                    '10-20%',
                    '30-50%', 
                    'Столько, сколько останется после всех трат'
                ],
                correctAnswer: 1,
                explanation: 'Правильно! Финансовые консультанты рекомендуют откладывать 10-20% дохода. Начните с комфортного для вас процента и постепенно увеличивайте.'
            },
            {
                question: 'Что такое "денежное кольцо" или "лестница целей"?',
                answers: [
                    'Способ хранения денег в разных валютах',
                    'Разделение целей по срокам: краткосрочные, среднесрочные, долгосрочные',
                    'Метод инвестирования в акции',
                    'Система учета ежедневных расходов'
                ],
                correctAnswer: 1,
                explanation: 'Верно! Разделение целей по срокам помогает правильно распределять ресурсы и выбирать подходящие финансовые инструменты для каждой цели.'
            },
            {
                question: 'Зачем вести учет достижения финансовых целей?',
                answers: [
                    'Чтобы хвастаться перед друзьями',
                    'Чтобы видеть прогресс и корректировать план',
                    'Это требование налоговой службы', 
                    'Учет не нужен, главное - откладывать'
                ],
                correctAnswer: 1,
                explanation: 'Правильно! Регулярный учет помогает видеть прогресс, вовремя замечать проблемы и корректировать стратегию достижения целей.'
            }
        ]
    }
];

// SVG-иконки для профиля
const LEVEL_ICONS = {
    savings: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M12 2v20M2 12h20M5 8h14M5 16h14"/>
            <circle cx="12" cy="12" r="9"/>
        </svg>
    `,
    security: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M12 2L3 7v10c0 5.55 3.84 9 9 9s9-3.45 9-9V7l-9-5z"/>
            <path d="M12 12.5v7M9 11l3-3 3 3"/>
        </svg>
    `,
    goals: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4l2 2"/>
        </svg>
    `
};

// Состояние игры
let gameState = {
    currentLevel: null,
    currentQuestion: 0,
    score: 0,
    selectedAnswer: null,
    showFeedback: false,
    startTime: null
};

// Достижения
const ACHIEVEMENTS = {
    first_level: {
        id: 'first_level',
        title: 'Первый шаг!',
        description: 'Пройдите свой первый уровень',
        icon: '🎯'
    },
    all_levels: {
        id: 'all_levels', 
        title: 'Мастер финансов',
        description: 'Пройдите все уровни',
        icon: '🏆'
    },
    perfect_score: {
        id: 'perfect_score',
        title: 'Идеальный результат!',
        description: 'Наберите 100% в любом уровне',
        icon: '⭐'
    },
    exp_500: {
        id: 'exp_500',
        title: 'Опытный инвестор',
        description: 'Заработайте 500 очков опыта',
        icon: '💼'
    },
    fast_learner: {
        id: 'fast_learner',
        title: 'Быстрый ученик',
        description: 'Пройдите уровень менее чем за 2 минуты',
        icon: '⚡'
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initGame();
});

function initGame() {
    simulateLoading(() => {
        loadProgress();
        showScreen('main-menu');
        updateUserStats();
        setupEventListeners();
        registerServiceWorker();
    });
}

function simulateLoading(callback) {
    let progress = 0;
    const progressBar = document.getElementById('loading-progress');
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(callback, 500);
        }
        progressBar.style.width = `${progress}%`;
    }, 200);
}

function setupEventListeners() {
    // Активация звука при первом взаимодействии
    const enableAudio = () => {
        initSafeAudio();
        document.body.removeEventListener('click', enableAudio);
        document.body.removeEventListener('touchstart', enableAudio);
    };
    document.body.addEventListener('click', enableAudio, { once: true, passive: true });
    document.body.addEventListener('touchstart', enableAudio, { once: true, passive: true });

    // Навигация
    document.getElementById('profile-btn').addEventListener('click', () => showScreen('profile-screen'));
    document.getElementById('profile-back-btn').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('back-btn').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('menu-btn').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('help-btn').addEventListener('click', () => showScreen('help-screen'));
    document.getElementById('help-back-btn').addEventListener('click', () => showScreen('main-menu'));
    
    // Игровые действия
    document.getElementById('play-again-btn').addEventListener('click', restartLevel);
    document.getElementById('reset-progress-btn').addEventListener('click', resetProgress);
    document.getElementById('export-data-btn').addEventListener('click', exportData);

    // Запуск уровней по новым кнопкам
    document.querySelectorAll('.level-start-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const levelId = this.closest('.level-card').dataset.level;
            startLevel(levelId);
        });
    });
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker зарегистрирован:', registration);
            })
            .catch(error => {
                console.log('Ошибка регистрации Service Worker:', error);
            });
    }
}

// Управление экранами
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    if (screenId === 'profile-screen') {
        renderProfile();
    }
}

function showNotification(message, duration = 3000) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    notificationText.textContent = message;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, duration);
}

// Работа с прогрессом
function loadProgress() {
    const saved = localStorage.getItem('financialGameProgress');
    if (saved) {
        window.gameProgress = JSON.parse(saved);
    } else {
        window.gameProgress = {
            totalExp: 0,
            userLevel: 1,
            levels: {},
            achievements: [],
            completedLevels: 0,
            playCount: 0,
            totalPlayTime: 0
        };
        saveProgress();
    }
}

function saveProgress() {
    localStorage.setItem('financialGameProgress', JSON.stringify(window.gameProgress));
}

function resetProgress() {
    if (confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.')) {
        window.gameProgress = {
            totalExp: 0,
            userLevel: 1,
            levels: {},
            achievements: [],
            completedLevels: 0,
            playCount: 0,
            totalPlayTime: 0
        };
        saveProgress();
        updateUserStats();
        renderProfile();
        showScreen('main-menu');
        showNotification('Прогресс успешно сброшен!');
    }
}

function exportData() {
    const dataStr = JSON.stringify(window.gameProgress, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-game-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Данные успешно экспортированы!');
}

// Запуск уровня
function startLevel(levelId) {
    const level = LEVELS.find(l => l.id === levelId);
    if (!level) return;
    
    gameState.currentLevel = level;
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.selectedAnswer = null;
    gameState.showFeedback = false;
    gameState.startTime = Date.now();
    
    window.gameProgress.playCount = (window.gameProgress.playCount || 0) + 1;
    saveProgress();
    
    document.getElementById('level-title').textContent = level.title;
    document.getElementById('level-topic').textContent = level.topic;
    showScreen('level-screen');
    renderQuestion();
}

function renderQuestion() {
    const question = gameState.currentLevel.questions[gameState.currentQuestion];
    const progress = ((gameState.currentQuestion + 1) / gameState.currentLevel.questions.length) * 100;
    
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('level-progress').textContent = 
        `Вопрос ${gameState.currentQuestion + 1}/${gameState.currentLevel.questions.length}`;
    
    const container = document.getElementById('question-container');
    container.innerHTML = `
        <div class="question-text">${question.question}</div>
        <div class="answers-list">
            ${question.answers.map((answer, index) => `
                <button class="answer-btn" onclick="selectAnswer(${index})">
                    ${answer}
                </button>
            `).join('')}
        </div>
    `;
    
    document.getElementById('feedback').classList.add('hidden');
}

function selectAnswer(answerIndex) {
    if (gameState.showFeedback) return;
    
    gameState.selectedAnswer = answerIndex;
    gameState.showFeedback = true;
    
    const question = gameState.currentLevel.questions[gameState.currentQuestion];
    const isCorrect = answerIndex === question.correctAnswer;
    
    // 🔊 Воспроизводим звук
    if (isCorrect) {
        gameState.score++;
        playCorrectSound();
    } else {
        playIncorrectSound();
    }
    
    // Подсветка ответов
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach((btn, index) => {
        btn.disabled = true;
        if (index === question.correctAnswer) {
            btn.classList.add('correct');
        } else if (index === answerIndex && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });
    
    // Показ фидбека
    const feedback = document.getElementById('feedback');
    const feedbackIcon = document.getElementById('feedback-icon');
    const feedbackText = document.getElementById('feedback-text');
    
    feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    feedbackIcon.textContent = isCorrect ? '✅' : '❌';
    feedbackText.textContent = question.explanation;
    feedback.classList.remove('hidden');
    
    document.getElementById('next-btn').onclick = nextQuestion;
}

function nextQuestion() {
    gameState.currentQuestion++;
    gameState.selectedAnswer = null;
    gameState.showFeedback = false;
    
    if (gameState.currentQuestion < gameState.currentLevel.questions.length) {
        renderQuestion();
    } else {
        finishLevel();
    }
}

function finishLevel() {
    const level = gameState.currentLevel;
    const totalQuestions = level.questions.length;
    const scorePercentage = Math.round((gameState.score / totalQuestions) * 100);
    const expEarned = gameState.score * GAME_CONFIG.expPerCorrectAnswer;
    const isPerfect = gameState.score === totalQuestions;
    const bonusExp = isPerfect ? GAME_CONFIG.bonusExpPerfect : 0;
    const totalExp = expEarned + bonusExp + level.reward;
    
    const timeSpent = Math.round((Date.now() - gameState.startTime) / 1000);
    window.gameProgress.totalPlayTime = (window.gameProgress.totalPlayTime || 0) + timeSpent;
    
    const levelProgress = window.gameProgress.levels[level.id] || { 
        completed: false, 
        bestScore: 0,
        playCount: 0,
        totalTime: 0
    };
    
    levelProgress.playCount = (levelProgress.playCount || 0) + 1;
    levelProgress.totalTime = (levelProgress.totalTime || 0) + timeSpent;
    levelProgress.lastScore = scorePercentage;
    
    if (scorePercentage >= GAME_CONFIG.requiredScore) {
        levelProgress.completed = true;
        if (scorePercentage > levelProgress.bestScore) {
            levelProgress.bestScore = scorePercentage;
        }
        if (!window.gameProgress.levels[level.id]?.completed) {
            window.gameProgress.completedLevels++;
            checkAchievements('first_level');
        }
    }
    
    window.gameProgress.levels[level.id] = levelProgress;
    window.gameProgress.totalExp += totalExp;
    
    if (isPerfect) checkAchievements('perfect_score');
    if (timeSpent < 120) checkAchievements('fast_learner');
    if (window.gameProgress.totalExp >= 500) checkAchievements('exp_500');
    if (window.gameProgress.completedLevels >= LEVELS.length) checkAchievements('all_levels');
    
    const newUserLevel = Math.floor(window.gameProgress.totalExp / GAME_CONFIG.expPerLevel) + 1;
    if (newUserLevel > window.gameProgress.userLevel) {
        window.gameProgress.userLevel = newUserLevel;
        showNotification(`🎉 Поздравляем! Вы достигли ${newUserLevel} уровня!`);
    }
    
    saveProgress();
    
    // 🔊 Звук при успешном прохождении
    if (scorePercentage >= GAME_CONFIG.requiredScore) {
        playLevelCompleteSound();
    }
    
    showResults(scorePercentage, totalExp, bonusExp, isPerfect, timeSpent);
}

function showResults(score, expEarned, bonusExp, isPerfect, timeSpent) {
    const levelProgress = window.gameProgress.levels[gameState.currentLevel.id];
    const bestScore = levelProgress.bestScore;
    
    document.getElementById('result-icon').textContent = score >= GAME_CONFIG.requiredScore ? '🎉' : '😔';
    document.getElementById('result-title').textContent = 
        score >= GAME_CONFIG.requiredScore ? 'Уровень пройден!' : 'Попробуйте еще раз';
    document.getElementById('correct-answers').textContent = `${gameState.score}/${gameState.currentLevel.questions.length}`;
    document.getElementById('exp-earned').textContent = `+${expEarned}${bonusExp ? ` (+${bonusExp} бонус)` : ''}`;
    document.getElementById('best-score').textContent = `${bestScore}%`;
    
    const achievementsContainer = document.getElementById('achievements');
    achievementsContainer.innerHTML = '';
    
    let newAchievements = 0;
    
    if (isPerfect) {
        const achievement = createAchievementElement(ACHIEVEMENTS.perfect_score, true);
        achievementsContainer.appendChild(achievement);
        newAchievements++;
    }
    
    if (!window.gameProgress.levels[gameState.currentLevel.id]?.completed && score >= GAME_CONFIG.requiredScore) {
        const achievement = createAchievementElement(ACHIEVEMENTS.first_level, true);
        achievementsContainer.appendChild(achievement);
        newAchievements++;
    }
    
    const achievementsSection = document.getElementById('achievements-container');
    achievementsSection.style.display = newAchievements > 0 ? 'block' : 'none';
    
    if (newAchievements > 0) {
        showNotification(`🎖️ Получено ${newAchievements} нов${newAchievements === 1 ? 'ое' : 'ых'} достижения!`);
    }
    
    showScreen('results-screen');
}

function createAchievementElement(achievement, isNew = false) {
    const div = document.createElement('div');
    div.className = `achievement ${isNew ? 'achievement-new' : ''}`;
    div.innerHTML = `
        <div style="display: flex; align-items: center;">
            <span class="achievement-icon">${achievement.icon}</span>
            <div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        </div>
    `;
    return div;
}

function checkAchievements(achievementId) {
    if (!window.gameProgress.achievements.includes(achievementId)) {
        window.gameProgress.achievements.push(achievementId);
        saveProgress();
        return true;
    }
    return false;
}

function restartLevel() {
    startLevel(gameState.currentLevel.id);
}

function updateUserStats() {
    document.getElementById('total-exp').textContent = window.gameProgress.totalExp;
    document.getElementById('completed-levels').textContent = window.gameProgress.completedLevels;
    document.getElementById('user-level').textContent = window.gameProgress.userLevel;
}

function renderProfile() {
    document.getElementById('profile-total-exp').textContent = window.gameProgress.totalExp;
    document.getElementById('profile-levels-completed').textContent = window.gameProgress.completedLevels;
    document.getElementById('profile-achievements').textContent = window.gameProgress.achievements.length;

    const levelsList = document.getElementById('profile-levels-list');
    levelsList.innerHTML = "";

    LEVELS.forEach(level => {
        const progress = window.gameProgress.levels[level.id] || {};
        const avgTime = progress.playCount ? Math.round(progress.totalTime / progress.playCount) : 0;
        const iconHTML = LEVEL_ICONS[level.id] || '❓';

        const levelElement = document.createElement('div');
        levelElement.className = 'profile-level';
        levelElement.innerHTML = `
            <div class="level-info">
                <div class="level-name">
                    <span class="profile-level-icon">${iconHTML}</span>
                    ${level.title}
                    <span class="level-difficulty">${'★'.repeat(level.difficulty)}</span>
                </div>
                <div class="level-score">
                    ${progress.completed ?
                        `Лучший результат: ${progress.bestScore}% | Игр: ${progress.playCount || 0}` :
                        'Еще не пройден'}
                    ${avgTime ? ` | Среднее время: ${avgTime}с` : ''}
                </div>
            </div>
            <div class="level-status">
                ${progress.completed ? '✅' : '❌'}
            </div>
        `;
        levelsList.appendChild(levelElement);
    });

    const totalPlayTime = window.gameProgress.totalPlayTime || 0;
    const totalPlayCount = window.gameProgress.playCount || 0;

    if (totalPlayCount > 0) {
        const statsInfo = document.createElement('div');
        statsInfo.className = 'help-section';
        statsInfo.innerHTML = `
            <h3>Общая статистика</h3>
            <p>Всего сыграно игр: <strong>${totalPlayCount}</strong></p>
            <p>Общее время игры: <strong>${Math.round(totalPlayTime / 60)} минут</strong></p>
            <p>Среднее время на игру: <strong>${Math.round(totalPlayTime / totalPlayCount)} секунд</strong></p>
        `;
        levelsList.parentNode.insertBefore(statsInfo, levelsList.nextSibling);
    }
}

// Глобальные функции для HTML
window.startLevel = startLevel;
window.selectAnswer = selectAnswer;
