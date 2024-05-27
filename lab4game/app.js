Vue.component('game', {
    template: `
    <div>
        <canvas id="myCanvas" width="480" height="320"></canvas>
        <button v-if="!gameStarted" @click="startGame">Start Game</button>
        <div v-if="gameOver">
            <p>Game over. Your score: {{ score }}</p>
            <button @click="restartGame">Restart</button>
        </div>
        <div v-if="!gameOver">
            <p>Score: {{ score }}</p>
        </div>
        <high-scores :best-scores="bestScores" :worst-scores="worstScores"></high-scores>
    </div>
    `,
    data() {
        return {
            canvas: null,
            ctx: null,
            ballRadius: 10,
            x: null,
            y: null,
            dx: 2,
            dy: -2,
            paddleHeight: 10,
            paddleWidth: 75,
            paddleX: null,
            rightPressed: false,
            leftPressed: false,
            score: 0,
            gameStarted: false,
            gameOver: false,
            bestScores: [],
            worstScores: []
        }
    },
    mounted() {
        this.canvas = document.getElementById("myCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height - 30;
        this.paddleX = (this.canvas.width - this.paddleWidth) / 2;
        this.loadScores();
        document.addEventListener("keydown", this.keyDownHandler);
        document.addEventListener("keyup", this.keyUpHandler);
    },
    methods: {
        keyDownHandler(e) {
            if (e.key == "Right" || e.key == "ArrowRight") {
                this.rightPressed = true;
            } else if (e.key == "Left" || e.key == "ArrowLeft") {
                this.leftPressed = true;
            }
        },
        keyUpHandler(e) {
            if (e.key == "Right" || e.key == "ArrowRight") {
                this.rightPressed = false;
            } else if (e.key == "Left" || e.key == "ArrowLeft") {
                this.leftPressed = false;
            }
        },
        drawBall() {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = "#0095DD";
            this.ctx.fill();
            this.ctx.closePath();
        },
        drawPaddle() {
            this.ctx.beginPath();
            this.ctx.rect(this.paddleX, this.canvas.height - this.paddleHeight, this.paddleWidth, this.paddleHeight);
            this.ctx.fillStyle = "#0095DD";
            this.ctx.fill();
            this.ctx.closePath();
        },
        drawScore() {
            this.ctx.font = "16px Arial";
            this.ctx.fillStyle = "#0095DD";
            this.ctx.fillText("Score: " + this.score, 8, 20);
        },
        draw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawBall();
            this.drawPaddle();
            this.drawScore();

            if (this.x + this.dx > this.canvas.width - this.ballRadius || this.x + this.dx < this.ballRadius) {
                this.dx = -this.dx;
            }
            if (this.y + this.dy < this.ballRadius) {
                this.dy = -this.dy;
            } else if (this.y + this.dy > this.canvas.height - this.ballRadius) {
                if (this.x > this.paddleX && this.x < this.paddleX + this.paddleWidth) {
                    this.dy = -this.dy;
                    this.score++;
                } else {
                    this.gameOver = true;
                    this.updateHighScores(this.score);
                }
            }

            if (this.rightPressed && this.paddleX < this.canvas.width - this.paddleWidth) {
                this.paddleX += 7;
            } else if (this.leftPressed && this.paddleX > 0) {
                this.paddleX -= 7;
            }

            this.x += this.dx;
            this.y += this.dy;

            if (!this.gameOver) {
                requestAnimationFrame(this.draw);
            }
        },
        startGame() {
            this.gameStarted = true;
            this.draw();
        },
        restartGame() {
            this.gameStarted = false;
            this.gameOver = false;
            this.score = 0;
            this.paddleX = (this.canvas.width - this.paddleWidth) / 2;
            this.draw();
        },
        loadScores() {
            this.bestScores = JSON.parse(localStorage.getItem("bestScores")) || [];
            this.worstScores = JSON.parse(localStorage.getItem("worstScores")) || [];
        },
        updateHighScores(score) {
            this.bestScores.push(score);
            this.bestScores.sort((a, b) => b - a);
            this.bestScores = this.bestScores.slice(0, 3);
            localStorage.setItem("bestScores", JSON.stringify(this.bestScores));
            this.worstScores.push(score);
            this.worstScores.sort((a, b) => a - b);
            this.worstScores = this.worstScores.slice(0, 3);
            localStorage.setItem("worstScores", JSON.stringify(this.worstScores));
        }
    }
});

Vue.component('high-scores', {
    props: ['bestScores', 'worstScores'],
    template: `
    <div>
        <strong>Best Scores:</strong>
        <ul>
            <li v-for="score in bestScores">{{ score }}</li>
        </ul>
        <strong>Worst Scores:</strong>
        <ul>
            <li v-for="score in worstScores">{{ score }}</li>
        </ul>
    </div>
    `
});

new Vue({
    el: '#app',
});
