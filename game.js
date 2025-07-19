// Player object - handles player-specific functionality
const Player = {
    create(symbol, name = null) {
        return {
            symbol,
            name: name || `Player ${symbol}`,
            
            getName() {
                return this.name;
            },
            
            setName(newName) {
                this.name = newName.trim() || `Player ${this.symbol}`;
            }
        };
    }
};

// GameBoard object - handles board state and validation
const GameBoard = {
    create() {
        return {
            cells: Array(9).fill(' '),
            
            isValidMove(position) {
                const index = position - 1;
                return position >= 1 && position <= 9 && this.cells[index] === ' ';
            },
            
            makeMove(position, playerSymbol) {
                if (!this.isValidMove(position)) {
                    return false;
                }
                this.cells[position - 1] = playerSymbol;
                return true;
            },
            
            checkWin(playerSymbol) {
                const winPatterns = [
                    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
                    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
                    [0, 4, 8], [2, 4, 6]             // Diagonals
                ];

                return winPatterns.some(pattern => 
                    pattern.every(index => this.cells[index] === playerSymbol)
                );
            },
            
            isFull() {
                return this.cells.every(cell => cell !== ' ');
            },
            
            reset() {
                this.cells = Array(9).fill(' ');
            }
        };
    }
};

// Game object - handles game flow and rules
const Game = {
    create() {
        return {
            board: GameBoard.create(),
            players: [Player.create('X'), Player.create('O')],
            currentPlayerIndex: 0,
            isOver: false,
            winner: null,
            
            getCurrentPlayer() {
                return this.players[this.currentPlayerIndex];
            },
            
            switchPlayer() {
                this.currentPlayerIndex = 1 - this.currentPlayerIndex;
            },
            
            makeMove(position) {
                if (this.isOver) {
                    return false;
                }
                
                if (!this.board.isValidMove(position)) {
                    return false;
                }
                
                const currentPlayer = this.getCurrentPlayer();
                this.board.makeMove(position, currentPlayer.symbol);
                
                if (this.board.checkWin(currentPlayer.symbol)) {
                    this.winner = currentPlayer;
                    this.isOver = true;
                    return 'win';
                } else if (this.board.isFull()) {
                    this.isOver = true;
                    return 'draw';
                } else {
                    this.switchPlayer();
                    return 'continue';
                }
            },
            
            reset() {
                this.board.reset();
                this.currentPlayerIndex = 0;
                this.isOver = false;
                this.winner = null;
            }
        };
    }
};

// UI Controller - handles DOM interactions
const UIController = {
    create(game) {
        return {
            game,
            boardElement: document.getElementById('gameBoard'),
            statusElement: document.getElementById('statusText'),
            resetBtn: document.getElementById('resetBtn'),
            instructionsBtn: document.getElementById('instructionsBtn'),
            changeNamesBtn: document.getElementById('changeNamesBtn'),
            playerModal: document.getElementById('playerModal'),
            startGameBtn: document.getElementById('startGameBtn'),
            useDefaultBtn: document.getElementById('useDefaultBtn'),
            player1Input: document.getElementById('player1Name'),
            player2Input: document.getElementById('player2Name'),
            
            init() {
                this.createBoard();
                this.bindEvents();
                this.showPlayerModal();
            },
            
            createBoard() {
                this.boardElement.innerHTML = '';
                for (let i = 0; i < 9; i++) {
                    const cell = document.createElement('button');
                    cell.className = 'cell';
                    cell.dataset.position = i + 1;
                    cell.addEventListener('click', (e) => this.handleCellClick(e));
                    this.boardElement.appendChild(cell);
                }
            },
            
            bindEvents() {
                this.resetBtn.addEventListener('click', () => this.handleReset());
                this.instructionsBtn.addEventListener('click', () => this.showInstructions());
                this.changeNamesBtn.addEventListener('click', () => this.showPlayerModal());
                this.startGameBtn.addEventListener('click', () => this.handleStartGame());
                this.useDefaultBtn.addEventListener('click', () => this.useDefaultNames());
                
                // Enter key support for inputs
                this.player1Input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.handleStartGame();
                });
                this.player2Input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.handleStartGame();
                });
            },
            
            showPlayerModal() {
                this.playerModal.classList.remove('hidden');
                this.player1Input.focus();
            },
            
            hidePlayerModal() {
                this.playerModal.classList.add('hidden');
            },
            
            handleStartGame() {
                const player1Name = this.player1Input.value.trim();
                const player2Name = this.player2Input.value.trim();
                
                if (!player1Name || !player2Name) {
                    alert('Please enter names for both players!');
                    return;
                }
                
                if (player1Name.toLowerCase() === player2Name.toLowerCase()) {
                    alert('Players must have different names!');
                    return;
                }
                
                this.game.players[0].setName(player1Name);
                this.game.players[1].setName(player2Name);
                
                this.hidePlayerModal();
                this.game.reset();
                this.updateBoard();
                this.updateStatus();
            },
            
            useDefaultNames() {
                this.game.players[0].setName('Player X');
                this.game.players[1].setName('Player O');
                
                this.hidePlayerModal();
                this.game.reset();
                this.updateBoard();
                this.updateStatus();
            },
            
            handleCellClick(event) {
                const position = parseInt(event.target.dataset.position);
                const result = this.game.makeMove(position);
                
                if (result) {
                    this.updateBoard();
                    this.updateStatus();
                    
                    if (result === 'win') {
                        document.getElementById('gameInfo').classList.add('winner');
                        setTimeout(() => {
                            document.getElementById('gameInfo').classList.remove('winner');
                        }, 600);
                    }
                }
            },
            
            updateBoard() {
                const cells = this.boardElement.querySelectorAll('.cell');
                cells.forEach((cell, index) => {
                    const symbol = this.game.board.cells[index];
                    cell.textContent = symbol === ' ' ? '' : symbol;
                    cell.disabled = symbol !== ' ' || this.game.isOver;
                    cell.className = 'cell';
                    if (symbol !== ' ') {
                        cell.classList.add(symbol.toLowerCase());
                    }
                });
            },
            
            updateStatus() {
                const statusIcon = document.querySelector('.status-icon');
                
                if (this.game.isOver) {
                    if (this.game.winner) {
                        statusIcon.textContent = '🎉';
                        this.statusElement.textContent = `${this.game.winner.getName()} wins!`;
                    } else {
                        statusIcon.textContent = '🤝';
                        this.statusElement.textContent = "It's a draw!";
                    }
                } else {
                    statusIcon.textContent = '▶️';
                    this.statusElement.textContent = `${this.game.getCurrentPlayer().getName()}'s turn`;
                }
            },
            
            handleReset() {
                this.game.reset();
                this.updateBoard();
                this.updateStatus();
            },
            
            showInstructions() {
                alert(`🎮 How to Play Tic-Tac-Toe:

• Click any empty cell to place your mark
• Player X always goes first
• Get 3 in a row (horizontal, vertical, or diagonal) to win!
• Use "Change Names" to set custom player names
• Click "New Game" to start over
• Have fun! 🎯`);
            }
        };
    }
};

// Initialize the game
const game = Game.create();
const ui = UIController.create(game);

// Start when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ui.init();
});