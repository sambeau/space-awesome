// Shared rendering utilities

export const drawBackground = (ctx, canvas) => {
	ctx.globalAlpha = 1.0;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// add background gradient
	ctx.save()
	const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
	gradient.addColorStop(0, " #FF00FF");
	gradient.addColorStop(1, "rgba(39,45,255,1.0)");
	ctx.fillStyle = gradient;
	ctx.globalAlpha = 0.2;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.restore()
}
