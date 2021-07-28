class ColorSelector {
	_img = null
	_curPoint = {
		x: -1,
		y: -1
	}
	onselected = function (r, g, b, a) { }
	constructor() {
		this._img = new Image()
		this._canvas = document.createElement("canvas")
		this._canvas.style.cursor = 'crosshair';
		this._canvas.style.position = "absolute"
		this._canvas.style.top = "0px"
		this._canvas.style.left = "0px"
		this._canvas.style.display = "none"
		this._canvas.addEventListener('mousemove', this._mousemove.bind(this))
		this._canvas.addEventListener('mousedown', this._mousedown.bind(this))
		document.body.appendChild(this._canvas)
	}
	get currentStringColor() {
		let [r, g, b, a] = this.currentColor
		return `rgba(${r},${g},${b},${a})`
	}
	get currentColor() {
		let ctx = this._canvas.getContext("2d")
		let imgData = ctx.getImageData(this._curPoint.x, this._curPoint.y, 1, 1)
		let r = imgData.data[0];
		let g = imgData.data[1];
		let b = imgData.data[2];
		let a = imgData.data[3] / 255;
		return [r, g, b, a]
	}
	_mousemove(e) {
		this._curPoint = {
			x: e.offsetX,
			y: e.offsetY
		}
		document.title = `${e.offsetX},${e.offsetY}`
		this.paint()
	}
	_mousedown(e) {
		if (e.buttons !== 2) { //非右击
			let ctx = this._canvas.getContext("2d")
			let imgData = ctx.getImageData(this._curPoint.x, this._curPoint.y, 1, 1)
			let red = imgData.data[0];
			let green = imgData.data[1];
			let blue = imgData.data[2];
			let alpha = imgData.data[3];
			this.onselected(red, green, blue, alpha)
		}
		e.stopPropagation()
		this.close()

	}
	paint() {
		let ctx = this._canvas.getContext("2d")
		ctx.globalCompositeOperation = 'source-over'
		ctx.strokeStyle = '#FFFFFF'
		ctx.fillStyle = '#FFFFFF'
		ctx.fillRect(0, 0, this._canvas.width, this._canvas.height)
		ctx.imageSmoothingEnabled = false
		ctx.drawImage(this._img, 0, 0)
		if (this._curPoint.x * this._curPoint.x < 0) return
		const size = 9
		const zoom = 14
		let haftsize = size / 2

		let x = this._curPoint.x
		let y = this._curPoint.y
		if (document.body.clientHeight - (y - document.body.scrollTop) < size * zoom) {
			y -= size * zoom
		}
		if (document.body.clientWidth - (x - document.body.scrollLeft) < size * zoom) {
			x -= size * zoom
		}
		ctx.save();
		ctx.beginPath();
		ctx.arc(x + haftsize * zoom, y + haftsize * zoom, haftsize * zoom, 0, Math.PI * 2, false);
		ctx.closePath()
		ctx.clip(); //剪切路径

		ctx.fillRect(x, y, size * zoom, size * zoom)
		ctx.drawImage(this._img, this._curPoint.x - Math.floor(size / 2), this._curPoint.y - Math.floor(size / 2), size, size, x, y, size * zoom, size * zoom)
		ctx.strokeStyle = '#a0a0a0'
		//ctx.globalCompositeOperation='xor'
		ctx.lineWidth = 0.1
		for (let i = 0; i < size; i++) {
			for (let j = 0; j < size; j++) {
				ctx.translate(0.5, .5)
				ctx.strokeStyle = '#000000'
				ctx.strokeRect(x + i * zoom, y + j * zoom, zoom, zoom)
				ctx.translate(-0.5, -0.5)
				ctx.strokeStyle = '#ffffff'
				ctx.strokeRect(x + i * zoom, y + j * zoom, zoom, zoom)
			}
		}
		ctx.restore();
		ctx.strokeStyle = 'black'
		ctx.lineWidth = 1
		ctx.beginPath()
		ctx.arc(x + haftsize * zoom, y + haftsize * zoom, haftsize * zoom, 0, Math.PI * 2);
		ctx.stroke()
		ctx.strokeStyle = 'red'
		ctx.strokeRect(x + zoom * 4, y + zoom * 4, zoom, zoom)
	}
	_contextmenu(e) {
		e.preventDefault()
	}
	close() {
		setTimeout(() => {
			document.removeEventListener('contextmenu', this._contextmenu)
			document.removeEventListener('keydown', this._keydown)
			this._keydown = null
		}, 100);
		this._canvas.style.display = 'none'
	}
	async show() {

		document.addEventListener('contextmenu', this._contextmenu)
		this._keydown = (e) => {
			if (e.which === 27) {
				this.close()
			}

		}
		document.addEventListener('keydown', this._keydown)

		let c = await html2canvas(document.body, {
			//scale:4,
			useCORS: true,
			backgroundColor: "#FFF"
		})
		this._canvas.width = document.body.clientWidth
		this._canvas.height = document.body.clientHeight
		this._img.onload = () => {
			this._canvas.style.display = ''
			this._canvas.width = this._img.width
			this._canvas.height = this._img.height

			this.paint()
		}
		this._img.src = c.toDataURL("image/png")
	}

}