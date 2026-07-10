var points = 0
var cookie = document.getElementById("cookie")
var textbox = document.getElementById("points")
var cursor = document.getElementById("cursor")
cookie.addEventListener("click",()=>{
	points = points + 1
	textbox.innerHTML = "Points: " + points
})
clicker.addEventListener("click",()=>{
	if (points > 49) {
		points = points - 50;
		textbox.innerHTML = "Points: " + points
		var clone = cursor.cloneNode(false)
		clone.style.opacity = "1"
		clone.style.position = "absolute"
		clone.style.left = Math.random()*160 + "px"
		clone.style.top = 80 + Math.random()*160 + "px" 
		
		//clicking animation
		
		var base = parseInt(clone.style.top|| "0",10);
		setInterval(() => {
			points = points + 1
			textbox.innerHTML = "Points: " + points
			clone.style.top = base - 5 + "px"
			setTimeout(() => {
				clone.style.top = base + "px"
			},200)
		},5400)
		
		document.body.appendChild(clone);
	}
})