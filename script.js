class MatchGrid {
    constructor(args) {
        this.width = args.width || 4;
        this.height = args.height || 4;
        this.numPairs = (this.width * this.height) / 2;
        this.timeLimit = args.timeLimit || 60;
        this.theme = args.theme || {};
        this.timer = null;
        this.score = 0;
        this.selectedTiles = [];
        this.isGameStarted = false;
        this.isFirstGame = true;
        this.isPaused = false;
        this.init();
    }

    init() {
        this.showModal();
        const startBtn = document.getElementById('startBtn');
        startBtn.addEventListener('click', () => {
            this.hideModal();
            this.startGame();
        });
        const timerElement = document.createElement('div');
        timerElement.id = 'timer';
        document.body.insertBefore(timerElement, document.getElementById('game'));
    }

    showModal() {
        const modalId = this.isFirstGame ? 'modal' : 'end-modal';
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
    }

    hideModal() {
        const modalId = this.isFirstGame ? 'modal' : 'end-modal';
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
    }

    startGame() {
        if (this.isGameStarted) return;
        this.isGameStarted = true;
        if (this.isFirstGame) {
            this.isFirstGame = false;
        }
        this.createGrid();
        this.populateGrid();
        this.startTimer();
    }

    createGrid() {
        const gameContainer = document.getElementById('game');
        for (let i = 0; i < this.width * this.height; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile hidden';
            tile.dataset.value = '';
            tile.addEventListener('click', () => this.selectTile(tile));
            gameContainer.appendChild(tile);
        }
    }

    populateGrid() {
        const values = this.generateValues();
        const tiles = document.getElementsByClassName('tile');
        for (let i = 0; i < tiles.length; i++) {
            const randomIndex = Math.floor(Math.random() * values.length);
            const value = values.splice(randomIndex, 1)[0];
            tiles[i].dataset.value = value;
        }
    }

    generateValues() {
        const values = [];
        for (let i = 1; i <= this.numPairs; i++) {
            values.push(i, i);
        }
        return values;
    }

    selectTile(tile) {
        if (tile.classList.contains('hidden') && this.selectedTiles.length < 2) {
            tile.classList.remove('hidden');
            const value = tile.dataset.value;
            tile.textContent = value;
            this.selectedTiles.push(tile);
            if (this.selectedTiles.length === 2) {
                const [tile1, tile2] = this.selectedTiles;
                if (tile1.dataset.value === tile2.dataset.value) {
                    this.score += 2;
                    tile1.classList.add('matched');
                    tile2.classList.add('matched');
                    this.selectedTiles = [];
                    if (this.score === this.width * this.height) {
                        this.endGame(true);
                    }
                } else {
                    setTimeout(() => {
                        anime({
                            targets: [tile1, tile2],
                            rotateY: '180deg',
                            easing: 'easeInOutSine',
                            duration: 400,
                            complete: () => {
                                setTimeout(() => {
                                    tile1.style.transform = '';
                                    tile2.style.transform = '';
                                    tile1.classList.add('hidden');
                                    tile1.textContent = '';
                                    tile2.classList.add('hidden');
                                    tile2.textContent = '';
                                    this.selectedTiles = [];
                                }, 500);
                            }
                        });
                    }, 1000);
                }
            }
        }
    }

    startTimer() {
        const timerElement = document.getElementById('timer');
        if (!timerElement) {
            return;
        }
        timerElement.textContent = `Time: ${this.timeLimit}`;
        this.timer = setInterval(() => {
            this.timeLimit--;
            if (!timerElement) {
                clearInterval(this.timer);
                return;
            }
            timerElement.textContent = `Time: ${this.timeLimit}`;
            if (this.timeLimit === 0) {
                this.endGame(false);
            }
        }, 1000);
    }

    pauseGame() {
        if (!this.isGameStarted || this.isPaused) return;
        this.isPaused = true;
        clearInterval(this.timer);
    }

    resumeGame() {
        if (!this.isGameStarted || !this.isPaused) return;
        this.isPaused = false;
        const timerElement = document.getElementById('timer');
        if (!timerElement) {
            return;
        }
        timerElement.textContent = `Time: ${this.timeLimit}`;
        this.timer = setInterval(() => {
            if (this.timeLimit > 0) {
                this.timeLimit--;
                timerElement.textContent = `Time: ${this.timeLimit}`;
            } else {
                this.endGame(false);
            }
        }, 1000);
    }

    endGame(isWin) {
        clearInterval(this.timer);
        this.isGameStarted = false;
        this.isPaused = false;
        const message = isWin ? 'This is victory! Congratulations!' : "Unfortunately, the time is up. Don't be discouraged and try again";
        const endModal = document.getElementById('end-modal');
        const endMessage = document.getElementById('end-message');
        const replayBtn = document.getElementById('replay-btn');
        endMessage.textContent = message;
        endModal.classList.add('active');
        replayBtn.addEventListener('click', () => {
            endModal.classList.remove('active');
            this.resetGame();
        });
    }

    resetGame() {
        clearInterval(this.timer);
        this.isPaused = false;
        this.isGameStarted = false;
        const gameContainer = document.getElementById('game');
        const endModal = document.getElementById('end-modal');
        if (endModal && endModal.parentNode === gameContainer) {
            gameContainer.removeChild(endModal);
        }
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.innerHTML = '';
        }
        gameContainer.innerHTML = '';
        this.score = 0;
        this.selectedTiles = [];
        this.timeLimit = 60;
        this.startGame();
    }
}

const matchGrid = new MatchGrid({
    width: 4,
    height: 4,
    timeLimit: 60,
    theme: {
        font: "Helvetica, sans-serif",
    },
});

const replayBtn = document.getElementById('replay-btn');
replayBtn.addEventListener('click', () => {
    matchGrid.resetGame();
});
document.getElementById('game').addEventListener("mouseleave", () => {
    matchGrid.pauseGame();
});
document.getElementById('game').addEventListener("mouseenter", () => {
    matchGrid.resumeGame();
});
