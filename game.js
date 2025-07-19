// Player object - handles player-specific functionality
const Player = {
    create(symbol) {
        return {
            symbol,
            getName() {
                return `Player ${this.symbol}`;
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
            
            init() {
                this.createBoard();
                this.bindEvents();
                this.updateStatus();
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
• Click "New Game" to start over
• Have fun! 🎯`);
            }
        };
    }
};

// Initialize the game
const game = Game.create();
const ui = UIController.create(game);
ui.init();