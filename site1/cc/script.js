var points = 0
var cookie=document.getElementById("cc")
var textbox = document.getElementById("points")
var buyclicker = document.getElementById("clicker")
var cursor = document.getElementById("cursor")

cc.addEventListener("click", ()=> {
	points = points + 1
	textbox.innerHTML = "Points:" + points
})

buyclicker.addEventListener("click", ()=> {
	if (points > 19) {
		points = points - 20
		textbox.innerHTML = "Points:" + points
		var clone = cursor.cloneNode(false)
		clone.style.opacity = "1"
		clone.style.position = "absolute"
		clone.style.left = Math.random()*200 + "px"
		clone.style.top = Math.random()*200 + "px"
		
		var base = parseInt(clone.style.top || "0", 10)
		setInterval ( ()=> {
			points = points + 1
			textbox.innerHTML = "Points:" + points
			clone.style.top = base - 5 + "px"
			setTimeout ( ()=> {
				clone.style.top = base + "px"
			}, 200)
		}, 5400)
		document.body.appendChild(clone)
	}
})