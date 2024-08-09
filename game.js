// Initialisierung des Canvas-Elements und des Zeichenkontexts
let canvas = document.getElementById('game');
let context = canvas.getContext('2d');

// Größe eines Gitterfelds und Spielvariablen
let grid = 16;
let count = 0;
let score = 0;
let highScore = 0;
let gameover = false;
let restartButtonShown = false;
let gameStarted = false;

// Initialisierung des Wurmobjekts
let wurm = {
    x: 160,
    y: 160,
    dx: 0,
    dy: 0,
    cells: [],
    maxCells: 1
};

// Initialisierung des Pflanze- und Reduce-Box-Objekts
let plant = {
    x: 320,
    y: 320
};

let reduceBox = {
    x: getRandomInt(0, 25) * grid,
    y: getRandomInt(0, 25) * grid,
    width: grid - 1,
    height: grid - 1
};

// Soundeffekt für das Essen einer Pflanze (nicht im Spiel)
const gulpSound = new Audio("gulp.mp3");

// Hilfsfunktion zum Generieren einer Zufallszahl zwischen min (inklusive) und max (exklusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// Funktion zum Aktualisieren der Punkteanzeige
function updateScore() {
    context.fillStyle = 'white';
    context.font = '14px Arial';
    context.fillText('Score: ' + score, grid, grid);
    context.fillText('High Score: ' + highScore, grid, grid * 2);
}

// Funktion zum Überprüfen auf Kollisionen mit anderen Zellen
function checkCollision(x, y, array) {
    for (let i = 1; i < array.length; i++) {
        if (x === array[i].x && y === array[i].y) {
            return true;
        }
    }
    return false;
}

function playFailSound() {
    const failSound = new Audio("fail.mp3");
    failSound.play();
}

function playEatSound() {
    const eatSound = new Audio("eat.mp3");
    eatSound.play();
}

function playFeuerSound() {
    const feuerSound = new Audio("feuer.mp3");
    feuerSound.play();
}

function playTurnSound() {
    const turnSound = new Audio("turn.mp3");
    turnSound.play();
}

let backgroundMusic = null; // Soundeffekt für die Hintergrundmusik

// Funktion zum Abspielen der Hintergrundmusik
function playBackgroundMusic() {
    if (backgroundMusic === null) {
        backgroundMusic = new Audio("musik.mp3");
        backgroundMusic.loop = true;
    }
    if (backgroundMusic.paused) {
        backgroundMusic.play();
    }
}

// Funktion zur Berechnung der vergangenen Spielzeit in Sekunden
function getGameTime() {
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - startTime;
    const seconds = Math.floor(elapsedTime / 1000);
    return seconds;
}

// Funktion zum Zeichnen des Game Over-Bildschirms
function drawGameOverScreen() {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.fillText('Game Over', canvas.width / 2 - 50, canvas.height / 2 - 10);
    context.font = '14px Arial';
    context.fillText('Dein Score: ' + score, canvas.width / 2 - 40, canvas.height / 2 + 10);
    context.fillText('High Score: ' + highScore, canvas.width / 2 - 45, canvas.height / 2 + 30);
    const gameTimeText = 'Spielzeit: ' + getGameTime() + ' Sekunden';
    const gameTimeTextWidth = context.measureText(gameTimeText).width;
    context.fillText(gameTimeText, canvas.width / 2 - gameTimeTextWidth / 2, canvas.height / 2 + 50);
    context.fillText('Klicke zum Neustarten', canvas.width / 2 - 50, canvas.height / 2 + 70);
    restartButtonShown = true;
}


// Funktion zum Zurücksetzen des Spiels
function resetGame() {
    wurm.x = 160;
    wurm.y = 160;
    wurm.cells = [];
    wurm.maxCells = 1;
    wurm.dx = 0;
    wurm.dy = 0;

    plant.x = getRandomInt(0, 25) * grid;
    plant.y = getRandomInt(0, 25) * grid;

    score = 0;
    gameover = false;
    restartButtonShown = false;
    gameStarted = false;

    startTime = null;
    gameTime = 0;
}

// Die Hauptschleife des Spiels
function loop() {
    // Starte die Hintergrundmusik
    // playBackgroundMusic();

    if (gameover) {
        drawGameOverScreen();
        playFailSound();
        return;
    }

    requestAnimationFrame(loop);

    if (++count < 4) {
        return;
    }

    count = 0;
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        startTime = new Date().getTime();
        updateScore();
        return;
    }

    wurm.x += wurm.dx;
    wurm.y += wurm.dy;

    if (wurm.x < 0 || wurm.x >= canvas.width || wurm.y < 0 || wurm.y >= canvas.height) {
        gameover = true;
    }

    wurm.cells.unshift({ x: wurm.x, y: wurm.y });

    if (wurm.cells.length > wurm.maxCells) {
        wurm.cells.pop();
    }

    // Zeichnen der Pflanze
    context.fillStyle = 'green';
    context.fillRect(plant.x, plant.y, grid - 1, grid - 1);

    // Zeichnen der Wurmzellen
    context.fillStyle = '#c57e7e';
    wurm.cells.forEach(function (cell, index) {
        context.fillRect(cell.x, cell.y, grid - 1, grid - 1);

        // Überprüfen auf Kollision mit der Pflanze
        if (cell.x === plant.x && cell.y === plant.y) {
            wurm.maxCells++;
            plant.x = getRandomInt(0, 25) * grid;
            plant.y = getRandomInt(0, 25) * grid;
            gulpSound.play();
            score += 10;
            if (score > highScore) {
                highScore = score;
            }
            playEatSound()
        }

        // Überprüfen auf Kollision mit der reduceBox (Feuer)
        if (cell.x === reduceBox.x && cell.y === reduceBox.y) {
            wurm.cells.splice(index, 1);
            wurm.maxCells--;
            score -= 10;
            if (score < 0) {
                score = 0;
            }
            reduceBox.x = getRandomInt(0, 25) * grid;
            reduceBox.y = getRandomInt(0, 25) * grid;
            playFeuerSound()
        }

        // Überprüfen auf Kollision mit anderen Wurmzellen
        if (checkCollision(cell.x, cell.y, wurm.cells.slice(index + 1))) {
            gameover = true;
        }
    });

    // Zeichnen der Reduce-Box 
    context.fillStyle = 'red';
    context.fillRect(reduceBox.x, reduceBox.y, reduceBox.width, reduceBox.height);

    // Überprüfen, ob die Wurmzellen leer sind (Spielende)
    if (wurm.cells.length === 0) {
        gameover = true;
    }

    updateScore();
}

// Funktion zum Behandeln des Neustart-Klicks
function handleRestartClick(event) {
    if (gameover && restartButtonShown) {
        resetGame();
        gameover = false;
        requestAnimationFrame(loop);
    }
}

// Ereignislistener für die Tastatursteuerung des Wurms
document.addEventListener('keydown', function (e) {
    if (!gameStarted) {
        gameStarted = true;
        return;
    }

    if (
        (e.which === 37 || e.which === 65) && // ← oder A
        wurm.dx === 0
    ) {
        wurm.dx = -grid;
        wurm.dy = 0;
        playTurnSound(); // Sound abspielen
    } else if (
        (e.which === 38 || e.which === 87) && // ↑ oder W
        wurm.dy === 0
    ) {
        wurm.dy = -grid;
        wurm.dx = 0;
        playTurnSound(); // Sound abspielen
    } else if (
        (e.which === 39 || e.which === 68) && // → oder D
        wurm.dx === 0
    ) {
        wurm.dx = grid;
        wurm.dy = 0;
        playTurnSound(); // Sound abspielen
    } else if (
        (e.which === 40 || e.which === 83) && // ↓ oder S
        wurm.dy === 0
    ) {
        wurm.dy = grid;
        wurm.dx = 0;
        playTurnSound(); // Sound abspielen
    }
});


// Ereignislistener für den Neustart-Button
canvas.addEventListener('click', handleRestartClick);

// Start der Spielschleife
requestAnimationFrame(loop);
