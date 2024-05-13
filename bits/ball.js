const ball = () => {
	return {
		x: 10,
		y: 100,
		vx: 20,
		vy: 10,
		radius: 25,
		color: "white",
		spawn() {
			this.color = pick(["#fff", "#0ff", "#ff0", "#f0f", "#0ff"])
			this.x = randInt(canvas.width)
			this.y = randInt(canvas.height)
			this.radius = randInt((randInt(10) + 1))
			this.vx = randInt(20) + 1
			this.vy = randInt(20) + 1
			this.width = (1 * this.radius)
			this.height = (1 * this.radius)
		},
		outOfBoundsV() {
			if (this.y > canvas.height - this.height || this.y < (0 + this.height)) return true
			return false;
		},
		outOfBoundsH() {
			if (this.x > canvas.width - this.width || this.x < (0 + this.width)) return true
			return false
		},
		update(dt) {
			this.x += this.vx;
			this.y += this.vy;
			if (this.outOfBoundsH()) {
				this.vx = 0 - this.vx;
			}
			if (this.outOfBoundsV()) {
				this.vy = 0 - this.vy;
			}
		},
		draw() {
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fillStyle = this.color;
			ctx.fill();
		},
	}
};
