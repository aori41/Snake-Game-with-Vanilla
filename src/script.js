const boardSize = 21; // boardSize*boardSize square
const snakeMoveTime = 200;

const movement = {
    ArrowUp: -boardSize,
    ArrowRight: 1,
    ArrowDown: boardSize,
    ArrowLeft: -1
};

const candies = [
    "🍬",
    "🍩",
    "🍪",
    "🍰",
    "🍓",
    "🍇",
    "🍒",
    "🍊",
    "🥞",
    "🧀"
];

let snake = [];
let snakeColor = Math.floor(Math.random() * 360);

let direction = "ArrowUp"; // defualt movement

let score = 0;
let timerId = undefined;
let gameOver = false;

// create board squares
const board = document.querySelector("#container");
for (let i = 0; i < (boardSize * boardSize); i++) {
    const square = document.createElement("div");

    square.style.height = `${100 / boardSize}%`;
    square.style.width = `${100 / boardSize}%`;
    square.classList.add("square");
    square.id = i;

    board.append(square);
}

const squares = Array.from(document.querySelectorAll('.square'));
const scoreElement = document.querySelector("#score");
const gameText = document.querySelector("#game-text");
const resetButton = document.querySelector("#reset");

gameText.innerText = "Start Game";

function setupGame() {
    for (let i = 0; i < 3; i++) {
        snake[i] = Math.floor(((boardSize * boardSize) / 2) - (boardSize * i)); // place snake in the middle

        if (boardSize % 2 === 0) snake[i] += (boardSize / 2);
        if (i === 2) { // modify head
            squares[snake[i]].innerText = "👀";
            squares[snake[i]].style.borderRadius = "45%";
        }
        snakeColor += 10 % 360;
        squares[snake[i]].style.backgroundColor = `hsl(${snakeColor}, 100%, 50%)`;
    }
    scoreElement.innerText = score.toString().padStart(3, "0");
    createCandy();

    timerId = setTimeout(snakeMovement, snakeMoveTime);
}

function snakeMovement() {
    if (gameOver) return;
    /*
    determines the position of the new segment based on the direction of movement and the size of the game board.
    The movement direction is mapped to specific offsets in the movement object,
    where -boardSize means moving up a row and +boardSize means moving down a row.
    The resulting position is then converted to an integer and added to the end of the snake's array.
    */
    snake.push(parseInt(snake[snake.length - 1] + movement[direction]));
    const nextHeadPosition = snake[snake.length - 1];
    // check if hits any of the borders or itself
    if (direction == "ArrowRight" && nextHeadPosition % boardSize == 0 ||
        direction == "ArrowLeft" && nextHeadPosition % boardSize == boardSize - 1 ||
        nextHeadPosition >= boardSize * boardSize ||
        nextHeadPosition < 0 ||
        (squares[nextHeadPosition] && squares[nextHeadPosition].style.backgroundColor)) {
        return endGame();
    }
    squares[snake[snake.length - 2]].innerText = "";
    squares[snake[snake.length - 2]].style.borderRadius = "35%";

    squares[nextHeadPosition].innerText = "👀";
    squares[nextHeadPosition].style.borderRadius = "45%";

    snakeColor += 10 % 360;
    squares[nextHeadPosition].style.backgroundColor = `hsl(${snakeColor}, 100%, 50%)`;

    if (!squares[nextHeadPosition].classList.contains("food")) {
        squares[snake[0]].style.backgroundColor = "";
        snake.shift();
    } else {
        squares[nextHeadPosition].classList.remove("food");
        score++;
        scoreElement.innerText = score.toString().padStart(3, "0");;

        if ((boardSize * boardSize) === snake.length) return endGame(); // wins the game
        createCandy();
    }
    timerId = setTimeout(snakeMovement, snakeMoveTime);
}

function createCandy() {
    let emptySquares = squares.filter(square => !square.style.backgroundColor);
    let randEmpty = Math.floor(Math.random() * emptySquares.length);
    let candy = emptySquares[randEmpty];

    candy.classList.add("food");
    candy.innerText = candies[Math.floor(Math.random() * candies.length)];
}

function endGame() {
    clearTimeout(timerId);

    snake.forEach(cell => {
        if (squares[cell]) {
            squares[cell].innerText === "👀" ? squares[cell].innerText = "💀" : null;
        }
    });
    gameText.innerText = "Game Over";
    gameOver = true;
}

resetButton.addEventListener("click", () => {
    squares.forEach(square => {
        square.innerText = "";
        square.style.borderRadius = "35%";
        square.style.backgroundColor = "";
        square.classList.remove("food");
    });
    clearTimeout(timerId);

    gameText.innerText = "";
    direction = "ArrowUp";
    timerId = undefined;
    score = 0;
    snake = [];
    gameOver = false;

    setupGame();
});

/* keyboard keys */
document.addEventListener("keydown", (e) => {
    if (gameOver) return;
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (Math.abs(movement[direction]) === Math.abs(movement[e.code])) return; // can't go opposite direction

    const nextPosition = snake[snake.length - 1];
    // check if hitting borders while switching keys
    if ((e.key == "ArrowLeft" && nextPosition % boardSize == 0) ||
        (e.key == "ArrowRight" && nextPosition % boardSize == boardSize - 1)) {
        return endGame();
    }
    direction = e.key;

    clearTimeout(timerId);
    snakeMovement();
});

/* phone swipe */
let initialX = null;
let initialY = null;

document.addEventListener("touchstart", (e) => {
    initialX = e.touches[0].clientX;
    initialY = e.touches[0].clientY;
});

document.addEventListener("touchmove", (e) => {
    if (initialX === null || initialY === null || gameOver) return;

    let currentX = e.touches[0].clientX;
    let currentY = e.touches[0].clientY;

    let diffX = initialX - currentX;
    let diffY = initialY - currentY;

    let key = 0;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        key = diffX > 0 ? "ArrowLeft" : "ArrowRight";
    } else {
        key = diffY > 0 ? "ArrowUp" : "ArrowDown";
    }

    if (Math.abs(movement[direction]) === Math.abs(movement[key])) return;

    const nextPosition = snake[snake.length - 1];
    if ((key == "ArrowLeft" && nextPosition % boardSize == 0) ||
        (key == "ArrowRight" && nextPosition % boardSize == boardSize - 1)) {
        return endGame();
    }
    initialX = null;
    initialY = null;
    direction = key;

    clearTimeout(timerId);
    snakeMovement();
});