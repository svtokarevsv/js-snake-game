const game = function () {
	const canvas = document.getElementById('gameboard')
	let ctx
	let partLength = 12
	let frameRate = 10
	let direction
	let previousDirection
	let snake
	let gameLoop
	let score
	let fruits
	let fruitMax = 6
	let headImage = new Image();
	//12px
	headImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTM0A1t6AAAB90lEQVQoU2MIDQ1lZmVlTbCwUeuOSjH5GhKv+y0gRq4nLE2uJThO7VNksukvTz/DqQICAnn6+voKDPX19Uxm5maXD52Z+//pm4v/7z87/d/L1/G/pr7Y/+t3j/x//Prs/7PX1/4vLM79o6qqasAAAqk5fh3nbqz+f/Pemf8rVi/8n1Zo/T+3Uf3/2o2L/5++uPv/w+en/3dOzLkNVjx/vj1Hw3SDu9MXFv9fv6fsf0Gl3f/WqYr/22fK/88uV/8/aV7o/zU7iv5XdFl+mrLFVIJh4Rb96gU7jP+3z1P4n1Ym9r9xisz//sVKYNw1T/5/YbP4/6Jmyf8Tl2v9X7hFbx7Dwo26n5bv1v0/eZX6/7pJsv/rJ8v/n7pG8//0tVr/J61Q/V8zQe5//1LV/7M2aP1ftUv3H8OclUbnl2xS/z93uyF+vEnn/4ylevcZVm7zEC2s0Tg6a7PJ/8UHLLDipQes/jdO0L+7fIe/LNjjO3fGcC/Z4nRh0ynP/+tOuPxfc8IZiJ3+rwXSG066/990zPv3wg3OhmDFMLBoo7Vr72zr/wcuxf3ffSEYjPdeCP2/fl/Y/2lLLBdDlaGCtsk6fSV1Dv/zitT/N2Xo/I9Ol//fOdn9zvaDtpJQJZhg+Tpzz3leOldqalRW9c3Srdp2woMPKgUEDAwAlxoZ1KJ9mH0AAAAASUVORK5CYII='

	function drawSnake() {
		for (let part of snake) {
			if (part.x === snake[0].x && part.y === snake[0].y) {
				ctx.drawImage(headImage, part.x, part.y);
			} else {
				drawElem(part.x, part.y, 'snake');
			}
		}
	}

	function drawElem(x, y, name) {
		switch (name) {
			case "snake":
				ctx.fillStyle = "#4666ff";
				ctx.strokeStyle = "#1fff57";
				break;
			case "fruit":
				ctx.fillStyle = "#fff530";
				ctx.strokeStyle = "#4666ff";
				break;
		}
		ctx.beginPath();
		ctx.rect(x, y, partLength, partLength);
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
	}

	function drawFruits() {
		for (let fruit of fruits) {
			drawElem(fruit.x, fruit.y, 'fruit')
		}
	}

	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if (isCollision()) {
			return endGame();
		}
		drawFruits();
		drawSnake();
	}

	function isFruitEaten(x, y) {
		let eatenIndex
		let isEaten = fruits.some((part, index) => {
			eatenIndex = index
			return part.x == x && part.y == y
		})
		if (isEaten) {
			fruits.splice(eatenIndex, 1)
			generateFruit(x, y)
		}
		return isEaten
	}

	function generateFruit(x, y) {
		for (let i = fruits.length; i < fruitMax; i++) {//create new fruits if there is less than fruitMax of them
			let fruitX
			let fruitY
			do {//define if created fruit is inside of snake
				fruitX = Math.round(Math.floor(Math.random() * (canvas.width)) / partLength) * partLength
				fruitY = Math.round(Math.floor(Math.random() * (canvas.height)) / partLength) * partLength
			} while (x == fruitX && y == fruitY)
			fruits.push({x: fruitX, y: fruitY})
		}
	}

	function init() {
		snake = []
		score = 0
		fruits = []
		direction = 'right'
		previousDirection = 'right'
		canvas.width = canvas.height = partLength * 40;
		changeScore(score);
		if (canvas.height > window.innerHeight) {
			canvas.width = canvas.height = Math.ceil(window.innerHeight / partLength) * (partLength - 2);
		}
		if (canvas.width > window.innerWidth * 0.9) {
			canvas.width = canvas.height = Math.ceil(window.innerWidth / partLength) * (partLength - 2);
		}
		if (!canvas.getContext) return alert("your browser is not supported,sorry");
		ctx = canvas.getContext('2d');
		for (let i = 0; i < 4; i++) {
			snake.unshift({x: i * partLength, y: 0, direction});
		}
		for (let i = 0; i < fruitMax; i++) {//create new fruits if there is less than fruitsmax of them
			let fruitX
			let fruitY
			do {//define if created fruit is inside of snake
				fruitX = Math.round(Math.floor(Math.random() * (canvas.width)) / partLength) * partLength
				fruitY = Math.round(Math.floor(Math.random() * (canvas.height)) / partLength) * partLength
			} while (snake.some(part => part.x == fruitX && part.y == fruitY))
			fruits.push({x: fruitX, y: fruitY})
		}
		gameLoop = setInterval(draw, frameRate);
	}

	function initControls() {
		let disabled = false;
		window.addEventListener('keydown', function (ev) {
			let key = ev.keyCode;
			chooseDirection(key, ev)
		})
		window.addEventListener('click', function (ev) {
			let id = ev.target.id;
			chooseDirection(id, ev)
			if (disabled)return
			if (id === 'play') {
				disabled = true;
				setTimeout(() => disabled = false, 100)
				if (!gameLoop) {
					ev.target.src = '../img/pause.png'
					return gameLoop = setInterval(draw, frameRate);
				}
				ev.target.src = '../img/play.png'
				clearInterval(gameLoop);
				gameLoop = null;
			}
		})
		function chooseDirection(key, ev) {
			if (disabled)return;
			switch (key) {
				case 37:
				case 65:
				case 'left':
					ev.preventDefault()
					if (direction !== 'right') direction = 'left'
					break;
				case 38:
				case 87:
				case 'up':
					ev.preventDefault()
					if (direction !== 'down') direction = 'up'
					break;
				case 39:
				case 68:
				case 'right':
					ev.preventDefault()
					if (direction !== 'left') direction = 'right'
					break;
				case 40:
				case 83:
				case 'down':
					ev.preventDefault()
					if (direction !== 'up') direction = 'down'
					break;
				default:
					return;
					break;
			}
			disabled = true;
			setTimeout(() => disabled = false, frameRate * 6)
		}
	}

	function endGame() {
		clearInterval(gameLoop)
		gameLoop = null;
		init();
	}

	function recalculateDirectionsForParts() {
		for (let i = snake.length - 1; i > 0; i--) {
			snake[i].direction = snake[i - 1].direction
		}
	}

	function moveSnake() {
		let isTimeToRecalculate = (snake[0].x % partLength === 0) && (snake[0].y % partLength === 0)
		if (isFruitEaten(snake[0].x, snake[0].y)) {
			let newElem = Object.assign({}, snake[snake.length - 1])
			switch (newElem.direction) {
				case 'right':
					newElem.x -= partLength
					break;
				case 'left':
					newElem.x += partLength
					break;
				case 'up':
					newElem.y += partLength
					break;
				case 'down':
					newElem.y -= partLength
					break;
			}
			snake.push(newElem)
			changeScore(++score)
		}
		if (isTimeToRecalculate) {
			recalculateDirectionsForParts()
			snake[0].direction = direction;
		}
		for (let i = snake.length - 1; i >= 0; i--) {
			let part = snake[i]
			switch (part.direction) {
				case 'right':
					part.x++
					break;
				case 'left':
					part.x--
					break;
				case 'up':
					part.y--
					break;
				case 'down':
					part.y++
					break;
			}
		}

	}

	function changeScore(score) {
		document.getElementById('score').innerText = score;
	}

	function isCollision() {
		moveSnake();
		let snakeX = snake[0].x;
		let snakeY = snake[0].y;
		let outOfWidth = snakeX >= canvas.width || snakeX < 0;
		let outOfHeight = snakeY >= canvas.height || snakeY < 0;
		let isSnakeEatingItself = snake.filter(part => part.x === snakeX && part.y === snakeY).length >= 2;
		return outOfHeight || outOfWidth || isSnakeEatingItself;
	}

	function run() {
		init();
		initControls();
	}

	return {
		run
	}
}();
game.run();
