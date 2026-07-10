const sunny = document.getElementById("sunny")
let pos = {x: 200, y: 100}
let vel = {x: 0, y: 0}

const G = 0.6 //gravity
const F = 0.65	//friction
const bounce = 0.65
const terminalVelocity = 25

let groundY = () => window.innerHeight - 240;

let isDragging = false;
let dragOffset = {x: 0, y: 0}

let lastMouse = {x: 0, y: 0, time: 0}
let dragVel = {x: 0, y: 0}

let squash = 1
let stretch = 1

function rand(min, max) {
	return Math.random()*(max-min) + min
}
function chance(p){
	return Math.random()<p
}
function clamp(v, min, max){
	return Math.max(min, Math.min(max, v))
}

const StateMachine={
	current: null,
	states: {},
	add(name, config) {
		this.states[name] = config
	},
	change(name){
		if (this.current && this.states[this.current].exit){
			this.states[this.current].exit()
		}
		this.current = name
		if (this.states[name].enter){
			this.states[name].enter();
		}
	},
	update(dt){
		const state = this.states[this.current]
		if (state && state.update) {
			state.update(dt)
		}
	}
}

StateMachine.add("idle", {
	enter(){
		if (pos.y >= groundY()) {
			vel.x = 0
		}
		this.timer = rand(1,3)
	},
	
	update(dt) {
		this.timer -= dt;
		
		if (chance(0.002)) {
			console.log("idle sub-action");
		}
		
		if (pos.y >= groundY()) {
			if (this.timer <= 0) {
				StateMachine.change("walking");
			}
		}
	}
})
StateMachine.add("walking", {
	enter() {
		this.timer = rand(2, 5);
		this.direction = Math.random() < 0.5 ? -1 : 1;
		vel.x = this.direction * rand(0.5, 1.5);
	},
	
	update(dt) {
		this.timer -= dt;
		
		if (pos.x < 0) vel.x = Math.abs(vel.x);
		if (pos.x > window.innerWidth - 96) vel.x = -Math.abs(vel.x);
		
		if (this.timer <= 0) {
			StateMachine.change("idle");
		}
	}
});
sunny.addEventListener("mousedown", (e) => {
	isDragging = true;
	sunny.classList.add("dragging");
	
	dragOffset.x = e.clientX - pos.x;
	dragOffset.y = e.clientY - pos.y;
	
	vel.x = 0;
	vel.y = 0;
	
	lastMouse.x = e.clientX;
	lastMouse.y = e.clientY;
	lastMouse.time = performance.now();

});
window.addEventListener("mousemove", (e) => {
	if (!isDragging) return;
	
	const now = performance.now();
	const dt = (now - lastMouse.time) / 1000
	
	if (dt > 0) {
		dragVel.x = (e.clientX - lastMouse.x) / dt;
		dragVel.y = (e.clientY - lastMouse.y) / dt;
	}
	
	lastMouse.x = e.clientX
	lastMouse.y = e.clientY
	lastMouse.time = now;
	
	pos.x = e.clientX - dragOffset.x;
	pos.y = e.clientY - dragOffset.y;
});
window.addEventListener("mouseup", (e) => {
	if (!isDragging) return;
	
	isDragging = false;
	sunny.classList.remove("dragging");
	
	vel.x = clamp(dragVel.x * 0.02, -25, 25);
	vel.y = clamp(dragVel.y * 0.02, -25, 25);
	
	StateMachine.change("idle");
});

let last = performance.now();

function loop(now) {
	const dt = (now - last) / 1000;
	last = now;
	
	if (!isDragging) {
		
		vel.y += G;
		
		vel.y = clamp(vel.y, -999, terminalVelocity);
		
		pos.x += vel.x
		pos.y += vel.y;
		
		if (pos.x < 0) {
			pos.x = 0;
			vel.x *= -bounce;
			squash = 1.3;
			stretch = 0.7;
		}
		
		if (pos.x > window.innerWidth - 96) {
			pos.x = window.innerWidth - 96;
			vel.x *= -bounce;
			squash = 1.3;
			stretch = 0.7;
		}
		
		if (pos.y > groundY()) {
			pos.y = groundY();
			
			if (Math.abs(vel.y) > 8) {
				
				squash = vel.y / 6;
				stretch = vel.y / 40;
				vel.y *= -bounce;
				vel.x *= F;
				
			} else {
				vel.y = 0;
			}
		}
		
		if (pos.y >= groundY()) {
			if (Math.abs(vel.x) < 0.1 && Math.abs(vel.y) < 0.1 && chance(0.01)) {
				StateMachine.change("walking");
			}
		}
		
		StateMachine.update(dt);
	}
	
	squash += (1 - squash) * 0.35;
	stretch += (1 - stretch) * 0.35;
	
	const facing = vel.x < 0.1 ? -1 : vel.x > 0.1 ? 1 : 1;
	
	sunny.style.transform =
		`scaleX(${facing}) scale (${squash}, ${stretch})`;
		
	sunny.style.left = pos.x + "px";
	sunny.style.top = pos.y + "px";
	
	requestAnimationFrame(loop);
}


StateMachine.change("idle");
requestAnimationFrame(loop);