document.addEventListener('DOMContentLoaded', () => {
    
    // 1. TEMA ESCURO / CLARO
    const themeBtn = document.getElementById('themeBtn');
    themeBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        themeBtn.textContent = isLight ? 'Modo Escuro' : 'Modo Claro';
    });

    // 2. MENU HAMBÚRGUER
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');

    hamburgerBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('active'));
    });

    // 3. CALCULADORA DE PEGADA HÍDRICA
    const calcBtn = document.getElementById('calcBtn');
    const calcResult = document.getElementById('calcResult');
    const litrosRes = document.getElementById('litrosRes');
    const calcFeedback = document.getElementById('calcFeedback');

    if (calcBtn) {
        calcBtn.addEventListener('click', () => {
            const banho = parseFloat(document.getElementById('banho').value) || 0;
            const torneira = parseFloat(document.getElementById('torneira').value) || 0;

            // Média de consumo: Banho = ~9L/min; Torneira = ~12L/min
            const totalLitros = Math.round((banho * 9) + (torneira * 12));
            
            litrosRes.textContent = totalLitros;
            calcResult.style.display = 'block';

            if (totalLitros > 110) {
                calcFeedback.textContent = "Seu consumo está acima do recomendado pela ONU (110L/dia). Que tal diminuir alguns minutos no banho?";
            } else {
                calcFeedback.textContent = "Parabéns! Seu consumo está dentro da média consciente recomendada.";
            }
        });
    }

    // 4. QUIZ
    const quizData = [
        {
            question: "Qual porcentagem aproximada da água da Terra é doce e acessível?",
            options: ["Cerca de 10%", "Cerca de 1%", "Cerca de 25%", "Cerca de 50%"],
            correct: 1
        },
        {
            question: "Como o aquecimento global afeta o ciclo da água?",
            options: ["Aumenta a evaporação e o risco de secas severas", "Diminui as chuvas no planeta", "Não causa impacto", "Estabiliza os rios"],
            correct: 0
        },
        {
            question: "Qual destas ações NÃO ajuda na segurança hídrica?",
            options: ["Coletar água da chuva", "Preservar matas ciliares", "Lavar calçadas com mangueira", "Consertar vazamentos"],
            correct: 2
        }
    ];

    let currentQuestion = 0;
    let quizScore = 0;
    let canAnswer = true;

    const questionEl = document.getElementById('question');
    const optionsEl = document.getElementById('options');
    const feedbackEl = document.getElementById('feedback');
    const nextBtn = document.getElementById('nextBtn');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');
    const finalScoreEl = document.getElementById('final-score');
    const restartQuizBtn = document.getElementById('restartQuizBtn');

    function loadQuestion() {
        canAnswer = true;
        nextBtn.style.display = 'none';
        feedbackEl.textContent = '';
        
        const q = quizData[currentQuestion];
        questionEl.textContent = `${currentQuestion + 1}. ${q.question}`;
        
        optionsEl.innerHTML = '';
        q.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => checkAnswer(i);
            optionsEl.appendChild(btn);
        });
    }

    function checkAnswer(i) {
        if (!canAnswer) return;
        canAnswer = false;

        const q = quizData[currentQuestion];
        const btns = optionsEl.children;

        if (i === q.correct) {
            quizScore++;
            btns[i].classList.add('correct');
            feedbackEl.textContent = 'Correto!';
            feedbackEl.style.color = '#00ff88';
        } else {
            btns[i].classList.add('wrong');
            btns[q.correct].classList.add('correct');
            feedbackEl.textContent = 'Incorreto!';
            feedbackEl.style.color = 'var(--bad-accent)';
        }

        nextBtn.style.display = 'inline-block';
        nextBtn.textContent = (currentQuestion === quizData.length - 1) ? 'Resultados' : 'Próxima';
    }

    nextBtn.onclick = () => {
        currentQuestion++;
        if (currentQuestion < quizData.length) {
            loadQuestion();
        } else {
            quizScreen.style.display = 'none';
            resultScreen.style.display = 'block';
            finalScoreEl.textContent = `Você acertou ${quizScore} de ${quizData.length} perguntas.`;
        }
    };

    restartQuizBtn.onclick = () => {
        currentQuestion = 0;
        quizScore = 0;
        quizScreen.style.display = 'block';
        resultScreen.style.display = 'none';
        loadQuestion();
    };

    loadQuestion();

    // 5. JOGO DA COLETA (COM HIGH SCORE E EMOJIS)
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('game-score');
    const highScoreEl = document.getElementById('game-highscore');
    const startBtn = document.getElementById('startGameBtn');
    const stopBtn = document.getElementById('stopGameBtn');

    let gameLoop;
    let isRunning = false;
    let gameScore = 0;
    let highScore = localStorage.getItem('aquaHighScore') || 0;
    highScoreEl.textContent = highScore;

    const bucket = { x: 150, y: 440, w: 60, h: 15, speed: 8 };
    let items = [];

    const goodEmojis = ['💧', '🌧️'];
    const badEmojis = ['⚠️', '☣️', '🚮'];

    function spawnItem() {
        const isGood = Math.random() > 0.3; // 70% chance de ser gota
        const emojiList = isGood ? goodEmojis : badEmojis;
        const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];

        items.push({
            x: Math.random() * (canvas.width - 30) + 15,
            y: 0,
            emoji: emoji,
            size: 22,
            speed: isGood ? 2.5 : 3.5,
            isGood: isGood
        });
    }

    function updateGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Desenhar Balde
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(bucket.x, bucket.y, bucket.w, bucket.h);

        // Criar itens
        if (Math.random() < 0.04) spawnItem();

        // Atualizar e Desenhar Itens com Emojis
        for (let i = items.length - 1; i >= 0; i--) {
            let item = items[i];
            item.y += item.speed;

            // Desenhar Emoji
            ctx.font = `${item.size}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(item.emoji, item.x, item.y);

            // Colisão com o Balde
            if (
                item.y >= bucket.y &&
                item.y - item.size <= bucket.y + bucket.h &&
                item.x >= bucket.x - 10 &&
                item.x <= bucket.x + bucket.w + 10
            ) {
                if (item.isGood) {
                    gameScore += 10;
                } else {
                    gameScore = Math.max(0, gameScore - 15);
                }
                scoreEl.textContent = gameScore;

                // Atualizar High Score se bater o recorde
                if (gameScore > highScore) {
                    highScore = gameScore;
                    localStorage.setItem('aquaHighScore', highScore);
                    highScoreEl.textContent = highScore;
                }

                items.splice(i, 1);
                continue;
            }

            // Remover se sair da tela
            if (item.y > canvas.height + 20) {
                items.splice(i, 1);
            }
        }

        if (isRunning) {
            gameLoop = requestAnimationFrame(updateGame);
        }
    }

    // Iniciar Jogo
    startBtn.addEventListener('click', () => {
        cancelAnimationFrame(gameLoop);
        
        gameScore = 0;
        scoreEl.textContent = gameScore;
        items = [];
        bucket.x = canvas.width / 2 - bucket.w / 2;
        
        isRunning = true;
        startBtn.textContent = 'Reiniciar Jogo';
        stopBtn.style.display = 'inline-block';
        
        updateGame();
    });

    // Parar Jogo sem recarregar a página
    stopBtn.addEventListener('click', () => {
        isRunning = false;
        cancelAnimationFrame(gameLoop);
        stopBtn.style.display = 'none';
        startBtn.textContent = 'Começar Jogo';
        
        // Tela de Pausa no Canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00f0ff';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Jogo Parado', canvas.width / 2, canvas.height / 2);
    });

    // Controles do Balde
    document.addEventListener('keydown', (e) => {
        if (!isRunning) return;
        if (e.key === 'ArrowLeft' && bucket.x > 0) bucket.x -= bucket.speed * 2;
        if (e.key === 'ArrowRight' && bucket.x < canvas.width - bucket.w) bucket.x += bucket.speed * 2;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isRunning) return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        bucket.x = Math.max(0, Math.min(canvas.width - bucket.w, mouseX - bucket.w / 2));
    });
});