Number.prototype.clamp = function(min, max) {
  return this < min ? min : (this > max ? max : this);
};

var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d")
var width = 500
var height = 500
var player = {
	color:"green",
	x:200,
	y:50,
	width:10,
	height:10,
	speed:5,
	velx:16,
	vely:0,
	jumping:false
}
keys=[]
friction=0.98
gravity=0.5
canvas.width=width;
canvas.height=height;

(function update() {
	//keyboard inputs
	if (keys[37]) {
		if (player.velx > -player.speed){
			player.velx--
		}
	}

	if (keys[39]){
		if (player.velx < player.speed){
			player.velx++
		} 
	}
	
	if (keys[32]){
		
		if (!player.jumping){
			player.jumping = true
			player.vely = -player.speed *2
		}
	}
	
	//physics
	player.velx *= friction
	player.vely +=gravity
	player.x += player.velx
	player.y += player.vely
	//keep player in bounds
	player.x = player.x.clamp(0,width-player.width)
	player.y = player.y.clamp( -50,height -50);
	//ready to jump
	if (player.y >= height - 50) {
		player.jumping = false
	}
	//draw everything
	ctx.clearRect(0,0,width,height);
	ctx.fillStyle = player.color
	ctx.fillRect(player.x,player.y,player.width,player.height)
	setTimeout(update,1000/60)
}())

document.onkeydown=document.onkeyup=function(e){
	keys[e.keyCode] = e.type === "keydown"
}