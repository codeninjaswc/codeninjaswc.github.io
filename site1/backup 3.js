// ======================================
// LAVA ESCAPE NPC RACE
// PART 1 - ENGINE & GAME SETUP
// ======================================

// ---------- Canvas ----------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const WIDTH = 500;
const HEIGHT = 500;

canvas.width = WIDTH;
canvas.height = HEIGHT;

// ---------- World ----------
const WORLD_HEIGHT = 10000;
const START_FLOOR = 9500;

let cameraY = START_FLOOR - HEIGHT / 2;

// ---------- Game State ----------
let gameTime = 0;
let gameOver = false;
let winner = null;

// ---------- Collections ----------
let npcs = [];
let platforms = [];
let checkpoints = [];
let spikes = [];
let particles = [];


// LAVA SETTINGS

let lavaY = START_FLOOR + 500;
let lavaSpeed = 0.7;
let lavaAcceleration = 0.0008;
// ---------- Helpers ----------
function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
}

function choose(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// ---------- NPC Names ----------
const danganronpaNames = [
    "Makoto Naegi",
    "Kyoko Kirigiri",
    "Byakuya Togami",
    "Aoi Asahina",
    "Yasuhiro Hagakure",
    "Toko Fukawa",
    "Kiyotaka Ishimaru",
    "Sayaka Maizono",
    "Leon Kuwata",
    "Chihiro Fujisaki",
    "Mondo Owada",
    "Celestia Ludenberg",
    "Sakura Ogami",
    "Junko Enoshima",
    "Hifumi Yamada"
];

// ---------- Rendering ----------
function clearScreen() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

// ---------- Placeholder Update ----------
function update() {
}

// ---------- Placeholder Draw ----------
function draw() {

    clearScreen();

    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("LAVA ESCAPE NPC RACE", 90, 70);

    ctx.font = "16px Arial";
    ctx.fillText("Loading...", 200, 110);

}
// ======================================
// PART 2 - WORLD GENERATION
// ======================================

// ---------- Platform ----------

class Platform {

    constructor(x, y, width, height = 12, type = "normal") {

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;

    }

    draw() {

        switch (this.type) {

            case "bounce":
                ctx.fillStyle = "#0099ff";
                break;

            default:
                ctx.fillStyle = "#777";
                break;

        }

        ctx.fillRect(
            this.x,
            this.y - cameraY,
            this.width,
            this.height
        );

    }

}

// ---------- Floor ----------

class Floor extends Platform {

    constructor() {

        super(
            0,
            START_FLOOR,
            WIDTH,
            20,
            "bounce"
        );

    }

}

let floor = new Floor();

// ---------- Checkpoint ----------

class Checkpoint {

    constructor(x, y) {

        this.x = x;
        this.y = y;

    }

    draw() {

        ctx.fillStyle = "#888";

        ctx.fillRect(
            this.x,
            this.y - cameraY - 35,
            4,
            35
        );

        ctx.fillStyle = "gold";

        ctx.beginPath();
        ctx.moveTo(this.x + 4, this.y - cameraY - 35);
        ctx.lineTo(this.x + 22, this.y - cameraY - 28);
        ctx.lineTo(this.x + 4, this.y - cameraY - 21);
        ctx.fill();

    }

}

// ---------- Spike ----------

class Spike {

    constructor(x, y) {

        this.x = x;
        this.y = y;

        this.width = 14;
        this.height = 7;

    }

    draw() {

        ctx.fillStyle = "#aaa";

        ctx.beginPath();

        ctx.moveTo(this.x, this.y - cameraY);
        ctx.lineTo(
            this.x + this.width / 2,
            this.y - this.height - cameraY
        );
        ctx.lineTo(
            this.x + this.width,
            this.y - cameraY
        );

        ctx.closePath();
        ctx.fill();

    }

}

// ======================================
// PLATFORM GENERATION
// ======================================

function generatePlatforms() {

    platforms.length = 0;

    let y = START_FLOOR - 80;

    let lastX = WIDTH / 2;

    while (y > 50) {

        const width = rand(100, 140);

        const minX = clamp(
            lastX - 100,
            20,
            WIDTH - width - 20
        );

        const maxX = clamp(
            lastX + 100,
            20,
            WIDTH - width - 20
        );

        const x = rand(minX, maxX);

        const type =
            Math.random() < 0.15
                ? "bounce"
                : "normal";

        platforms.push(

            new Platform(
                x,
                y,
                width,
                12,
                type
            )

        );

        lastX = x;

        y -= rand(55, 75);

    }

}

// ======================================
// CHECKPOINTS
// ======================================

function createCheckpoints() {

    checkpoints.length = 0;

    for (let i = 8; i < platforms.length; i += 8) {

        const p = platforms[i];

        checkpoints.push(

            new Checkpoint(

                p.x + p.width / 2,

                p.y

            )

        );

    }

}

// ======================================
// SPIKES
// ======================================

function generateSpikes() {

    spikes.length = 0;

    for (const p of platforms) {

        if (Math.random() > 0.20)
            continue;

        spikes.push(

            new Spike(

                p.x + rand(10, p.width - 24),

                p.y

            )

        );

    }

}

// ======================================
// DRAW WORLD
// ======================================

function drawPlatforms() {

    for (const p of platforms)
        p.draw();

}

function drawCheckpoints() {

    for (const c of checkpoints)
        c.draw();

}

function drawSpikes() {

    for (const s of spikes)
        s.draw();

}

// ======================================
// WORLD UPDATE
// ======================================

function updatePlatforms() {

    // Reserved for moving platforms.

}

// ======================================
// INITIAL WORLD
// ======================================

generatePlatforms();
createCheckpoints();
generateSpikes();
// ======================================
// PART 3 - NPC SYSTEM
// ======================================

class NPC {

    constructor(id) {

        this.id = id;
        this.name = danganronpaNames[id];

        this.color = `hsl(${id * 24}, 80%, 60%)`;

        // Size
        this.width = 20;
        this.height = 30;

        // Spawn
        this.x = 40 + id * 28;
        this.y = START_FLOOR - this.height - 10;

        // Movement
        this.vx = 0;
        this.vy = 0;

        this.speed = 3;
        this.jumpPower = 13;

        // Health
        this.maxHP = 20;
        this.hp = this.maxHP;

        // State
        this.dead = false;
        this.finished = false;

        // AI
        this.target = null;
        this.brainTimer = 0;
        this.spikeTimer = 0;

        // Respawn
        this.checkpoint = {
            x: this.x,
            y: this.y
        };

    }

    damage(amount = 1) {

        if (this.dead)
            return;

        this.hp -= amount;

        if (this.hp <= 0) {

            this.hp = 0;
            this.dead = true;

            console.log(this.name + " was eliminated.");

        }

    }

    heal(amount = 1) {

        if (this.dead)
            return;

        this.hp = Math.min(
            this.maxHP,
            this.hp + amount
        );

    }

}

function createNPCs() {

    npcs.length = 0;

    for (let i = 0; i < danganronpaNames.length; i++) {

        const npc = new NPC(i);

        npcs.push(npc);

    }

}

function drawNPCs() {

    ctx.textAlign = "left";
    ctx.font = "10px Arial";

    for (const npc of npcs) {

        if (npc.dead)
            continue;

        // Body
        ctx.fillStyle = npc.color;

        ctx.fillRect(
            npc.x,
            npc.y - cameraY,
            npc.width,
            npc.height
        );

        // Name
        ctx.fillStyle = "white";

        ctx.fillText(
            npc.name,
            npc.x - 10,
            npc.y - cameraY - 8
        );

        // HP Background
        ctx.fillStyle = "#660000";

        ctx.fillRect(
            npc.x,
            npc.y - cameraY - 15,
            24,
            4
        );

        // HP Foreground
        ctx.fillStyle = "#00ff00";

        ctx.fillRect(
            npc.x,
            npc.y - cameraY - 15,
            24 * (npc.hp / npc.maxHP),
            4
        );

    }

}

function updateNPCs() {

    // Replaced in Part 4

}

createNPCs();

// ======================================
// PART 4 - PHYSICS & AI
// ======================================


// ======================================
// PHYSICS SETTINGS
// ======================================

const gravity = 0.55;
const maxFallSpeed = 12;


// ======================================
// PLATFORM SAFETY CHECK
// ======================================

function platformHasSpike(platform){

    for(const spike of spikes){

        if(
            spike.x < platform.x + platform.width &&
            spike.x + spike.width > platform.x &&
            Math.abs(spike.y - platform.y) < 5
        ){

            return true;

        }

    }

    return false;

}


// ======================================
// GROUNDED CHECK
// ======================================

function isGrounded(npc){

    const allPlatforms = [
        ...platforms,
        floor
    ];


    for(const p of allPlatforms){

        if(
            npc.x + npc.width > p.x &&
            npc.x < p.x + p.width &&
            Math.abs(
                npc.y + npc.height - p.y
            ) < 4
        ){

            return true;

        }

    }


    return false;

}



// ======================================
// AI RADAR
// ======================================

function scanPlatforms(npc){

    let choices = [];


    for(const p of platforms){


        const npcCenter =
            npc.x + npc.width / 2;


        const platformCenter =
            p.x + p.width / 2;


        const distanceX =
            Math.abs(
                npcCenter - platformCenter
            );


        const height =
            npc.y - p.y;



        // Only platforms above NPC
        if(
            height > 20 &&
            height < 260 &&
            distanceX < 230
        ){

            if(platformHasSpike(p))
                continue;



            choices.push({

                platform:p,

                score:
                    (300 - height)
                    -
                    distanceX * 0.5

            });

        }

    }


    return choices;

}



// ======================================
// FIND BEST TARGET
// ======================================

function findTarget(npc){

    const radar =
        scanPlatforms(npc);


    if(radar.length === 0)
        return null;



    radar.sort(
        (a,b)=>
        b.score - a.score
    );


    return radar[0].platform;

}



// ======================================
// NPC AI THINKING
// ======================================

function npcThink(npc){

    npc.brainTimer--;


    if(npc.brainTimer > 0)
        return;



    npc.brainTimer = 8;


    if(
        !npc.target ||
        npc.target.y > npc.y
    ){

        npc.target =
            findTarget(npc);

    }



    if(!npc.target){

        npc.vx *= 0.8;

        return;

    }



    const npcCenter =
        npc.x + npc.width / 2;


    const targetCenter =
        npc.target.x +
        npc.target.width / 2;



    // Move toward platform

    if(npcCenter < targetCenter - 5){

        npc.vx = npc.speed;

    }
    else if(npcCenter > targetCenter + 5){

        npc.vx = -npc.speed;

    }
    else{

        npc.vx *= 0.5;

    }



    // Jump

    const heightDifference =
        npc.y - npc.target.y;


    if(
        heightDifference > 20 &&
        heightDifference < 160 &&
        npc.vy >= 0 &&
        isGrounded(npc)
    ){

        npc.vy =
            -npc.jumpPower;

    }


}



// ======================================
// PLATFORM COLLISION
// ======================================

function platformCollision(npc){


    const allPlatforms = [
        ...platforms,
        floor
    ];



    for(const p of allPlatforms){


        if(

            npc.x < p.x + p.width &&
            npc.x + npc.width > p.x &&

            npc.y + npc.height >= p.y &&
            npc.y + npc.height <= p.y + 15 &&

            npc.vy >= 0

        ){


            npc.y =
                p.y - npc.height;



            if(p.type === "bounce"){

                npc.vy = -18;

            }
            else{

                npc.vy = 0;

            }



            if(npc.target === p){

                npc.target = null;
				npc.brainTimer = 0;

            }



            // checkpoint update

            for(const c of checkpoints){

                if(
                    Math.abs(c.y - p.y) < 5
                ){

                    npc.checkpoint = {

                        x:c.x,
                        y:c.y - npc.height

                    };

                }

            }


        }


    }


}



// ======================================
// WALL RECOVERY
// ======================================

function wallJump(npc){

    if(npc.x <= 0){

        npc.vx = 4;
        npc.vy = -npc.jumpPower;

    }


    if(npc.x + npc.width >= WIDTH){

        npc.vx = -4;
        npc.vy = -npc.jumpPower;

    }


}



// ======================================
// UPDATE ONE NPC
// ======================================

function updateNPC(npc){


    if(
        npc.dead ||
        npc.finished
    )
        return;



    npcThink(npc);



    npc.vy += gravity;


    npc.vy =
        Math.min(
            npc.vy,
            maxFallSpeed
        );



    npc.x += npc.vx;
    npc.y += npc.vy;



    npc.vx *= 0.85;



    npc.x =
        clamp(
            npc.x,
            0,
            WIDTH - npc.width
        );



    wallJump(npc);


    platformCollision(npc);
	preventWalkingOff(npc);



    // Fell down

    if(
        npc.y >
        START_FLOOR + 400
    ){

        npc.x =
            npc.checkpoint.x;


        npc.y =
            npc.checkpoint.y;


        npc.vx = 0;
        npc.vy = 0;

    }



    // Finish

    if(
        npc.y <= 0 &&
        !winner
    ){

        npc.finished = true;
        winner = npc;
        gameOver = true;

    }


}



// ======================================
// UPDATE ALL NPCS
// ======================================

function updateNPCs(){

    for(const npc of npcs){

        updateNPC(npc);

    }

}



// ======================================
// CAMERA
// ======================================

function updateCamera(){

    let highest =
        START_FLOOR;


    for(const npc of npcs){

        if(
            !npc.dead &&
            npc.y < highest
        ){

            highest = npc.y;

        }

    }


    cameraY =
        clamp(
            highest - HEIGHT / 2,
            0,
            START_FLOOR
        );

}



// ======================================
// GAME UPDATE
// ======================================

function updateGame(){

    if(gameOver)
        return;


    gameTime++;


    updateNPCs();

    updateHazards();

    updateCamera();


    const alive =
        npcs.filter(
            n => !n.dead
        );


    if(alive.length === 0){

        gameOver = true;

    }

}



// ======================================
// GAME DRAW
// ======================================

function drawGame(){

    clearScreen();

    drawPlatforms();
    drawCheckpoints();
    drawSpikes();

    floor.draw();

    drawNPCs();


    ctx.fillStyle="white";
    ctx.font="16px Arial";

    ctx.fillText(
        "Alive: " +
        npcs.filter(n=>!n.dead).length,
        10,
        20
    );

}
function drawGame(){

    clearScreen();

    drawPlatforms();
    drawCheckpoints();
    drawSpikes();

    floor.draw();

    drawLava();

    drawNPCs();

    drawParticles();


    ctx.fillStyle="white";
    ctx.font="16px Arial";

    ctx.fillText(
        "Alive: " +
        npcs.filter(n=>!n.dead).length,
        10,
        20
    );

}
function preventWalkingOff(npc){

    if(!isGrounded(npc))
        return;


    let standingPlatform = null;


    for(const p of [...platforms, floor]){

        if(

            npc.x + npc.width > p.x &&
            npc.x < p.x + p.width &&
            Math.abs(
                npc.y + npc.height - p.y
            ) < 4

        ){

            standingPlatform = p;
            break;

        }

    }


    if(!standingPlatform)
        return;


    let edgeBuffer = 8;


    // Approaching left edge

    if(
        npc.vx < 0 &&
        npc.x <= standingPlatform.x + edgeBuffer
    ){

        npc.vx = 0;

    }


    // Approaching right edge

    if(
        npc.vx > 0 &&
        npc.x + npc.width >=
        standingPlatform.x +
        standingPlatform.width -
        edgeBuffer
    ){

        npc.vx = 0;

    }

}



// ======================================
// MAIN LOOP
// ======================================

function gameLoop(){

    updateGame();

    drawGame();

    requestAnimationFrame(
        gameLoop
    );

}


gameLoop();
// ======================================
// PART 5 - HAZARDS, COMBAT & PARTICLES
// ======================================


// ======================================
// DAMAGE SYSTEM
// ======================================

function damageNPC(npc, amount = 1, knockback = 0){

    if(npc.dead)
        return;


    npc.hp -= amount;


    npc.vx = knockback;
    npc.vy = -6;


    spawnParticles(
        npc.x + npc.width / 2,
        npc.y,
        npc.color
    );


    if(npc.hp <= 0){

        npc.hp = 0;
        npc.dead = true;

        console.log(
            npc.name + " eliminated!"
        );

    }

}



// ======================================
// NPC COLLISION / PUSHING
// ======================================

function npcPush(){

    for(let i = 0; i < npcs.length; i++){

        const a = npcs[i];


        if(a.dead)
            continue;



        for(let j = i + 1; j < npcs.length; j++){

            const b = npcs[j];


            if(b.dead)
                continue;



            if(

                a.x < b.x + b.width &&
                a.x + a.width > b.x &&
                a.y < b.y + b.height &&
                a.y + a.height > b.y

            ){

                const push = 1.5;


                if(a.x < b.x){

                    a.vx -= push;
                    b.vx += push;

                }
                else{

                    a.vx += push;
                    b.vx -= push;

                }

            }


        }

    }

}



// ======================================
// LAVA
// ======================================

lavaY = START_FLOOR + 500;

lavaSpeed = 0.7;

lavaAcceleration = 0.0008;


function updateLava(){

    lavaY -= lavaSpeed;


    lavaSpeed += lavaAcceleration;



    for(const npc of npcs){


        if(npc.dead)
            continue;



        if(
            npc.y + npc.height >= lavaY
        ){

            damageNPC(
                npc,
                1,
                rand(-4,4)
            );

        }


    }


}



// ======================================
// SPIKE DAMAGE
// ======================================

function checkSpikes(npc){

    for(const spike of spikes){


        if(

            npc.x < spike.x + spike.width &&
            npc.x + npc.width > spike.x &&

            npc.y + npc.height > spike.y - spike.height &&
            npc.y < spike.y

        ){


            npc.spikeTimer--;


            if(npc.spikeTimer <= 0){


                damageNPC(
                    npc,
                    1,
                    rand(-2,2)
                );


                npc.spikeTimer = 45;

            }


            return;

        }

    }


    npc.spikeTimer = 0;

}



// ======================================
// PARTICLES
// ======================================

function spawnParticles(x,y,color){

    for(let i = 0; i < 10; i++){

        particles.push({

            x:x,
            y:y,

            vx:rand(-3,3),
            vy:rand(-5,1),

            life:40,

            color:color

        });

    }

}



function updateParticles(){

    for(const p of particles){

        p.x += p.vx;
        p.y += p.vy;

        p.vy += 0.2;

        p.life--;

    }


    particles =
        particles.filter(
            p => p.life > 0
        );

}



function drawParticles(){

    for(const p of particles){

        ctx.globalAlpha =
            p.life / 40;


        ctx.fillStyle =
            p.color;


        ctx.fillRect(

            p.x,
            p.y - cameraY,

            4,
            4

        );

    }


    ctx.globalAlpha = 1;

}



// ======================================
// DRAW LAVA
// ======================================

function drawLava(){

    ctx.fillStyle = "#ff3300";


    ctx.fillRect(

        0,
        lavaY - cameraY,

        WIDTH,
        HEIGHT * 2

    );


    ctx.fillStyle =
        "rgba(255,150,0,0.35)";


    ctx.fillRect(

        0,
        lavaY - cameraY - 20,

        WIDTH,
        20

    );

}



// ======================================
// HAZARD UPDATE
// ======================================

function updateHazards(){


    updateLava();



    for(const npc of npcs){

        if(!npc.dead){

            checkSpikes(npc);

        }

    }



    npcPush();


    updateParticles();


}



// ======================================
// RESET LAVA
// ======================================

function resetHazards(){

    lavaY =
        START_FLOOR + 500;


    lavaSpeed =
        0.7;


    particles.length = 0;

}
// ======================================
// PART 6 - FINAL RENDERING
// ======================================


// ======================================
// DRAW LAVA
// ======================================

function drawLava(){

    ctx.fillStyle = "#ff3300";


    ctx.fillRect(

        0,
        lavaY - cameraY,

        WIDTH,
        HEIGHT * 2

    );


    // Glow effect

    ctx.fillStyle =
        "rgba(255,120,0,0.35)";


    ctx.fillRect(

        0,
        lavaY - cameraY - 20,

        WIDTH,
        20

    );

}



// ======================================
// CAMERA IMPROVEMENT
// ======================================

function updateCamera(){

    let highest = START_FLOOR;


    for(const npc of npcs){

        if(
            !npc.dead &&
            npc.y < highest
        ){

            highest = npc.y;

        }

    }



    const targetCamera =
        highest - HEIGHT / 2;



    // Smooth camera movement

    cameraY +=
        (targetCamera - cameraY) * 0.08;



    cameraY =
        clamp(
            cameraY,
            0,
            START_FLOOR
        );

}



// ======================================
// FINAL NPC DRAW
// ======================================

function drawFinalNPCs(){

    for(const npc of npcs){


        if(npc.dead)
            continue;



        // Body

        ctx.fillStyle =
            npc.color;


        ctx.fillRect(

            npc.x,
            npc.y - cameraY,

            npc.width,
            npc.height

        );



        // Name

        ctx.fillStyle="white";

        ctx.font="10px Arial";


        ctx.fillText(

            npc.name,

            npc.x - 10,
            npc.y - cameraY - 8

        );



        // HP bar

        ctx.fillStyle="#550000";


        ctx.fillRect(

            npc.x,
            npc.y - cameraY - 15,

            40,
            4

        );



        ctx.fillStyle="#00ff00";


        ctx.fillRect(

            npc.x,
            npc.y - cameraY - 15,

            25 *
            (npc.hp / npc.maxHP),

            4

        );


    }

}



// ======================================
// HUD
// ======================================

function drawHUD(){

    ctx.fillStyle="white";
    ctx.font="16px Arial";


    const alive =
        npcs.filter(
            n => !n.dead
        ).length;



    ctx.fillText(

        "ALIVE: " + alive,

        10,
        20

    );



    ctx.fillText(

        "HEIGHT: " +
        Math.floor(
            START_FLOOR - cameraY
        ),

        10,
        45

    );



    ctx.fillText(

        "LAVA: " +
        Math.floor(lavaY),

        10,
        70

    );


}



// ======================================
// WIN / LOSE SCREEN
// ======================================

function drawEndScreen(){

    if(!gameOver)
        return;



    ctx.fillStyle =
        "rgba(0,0,0,0.65)";


    ctx.fillRect(

        0,
        0,
        WIDTH,
        HEIGHT

    );



    ctx.textAlign="center";

    ctx.font="35px Arial";



    if(winner){

        ctx.fillStyle="yellow";


        ctx.fillText(

            winner.name +
            " WINS!",

            WIDTH/2,
            HEIGHT/2

        );

    }
    else{

        ctx.fillStyle="red";


        ctx.fillText(

            "EVERYONE LOST",

            WIDTH/2,
            HEIGHT/2

        );

    }



    ctx.font="18px Arial";

    ctx.fillStyle="white";


    ctx.fillText(

        "Click to restart",

        WIDTH/2,
        HEIGHT/2 + 50

    );



    ctx.textAlign="left";

}



// ======================================
// FINAL DRAW
// ======================================

function drawGame(){

    clearScreen();


    drawPlatforms();

    drawCheckpoints();

    drawSpikes();


    floor.draw();


    drawLava();


    drawFinalNPCs();


    drawParticles();


    drawHUD();


    drawEndScreen();

}
// ======================================
// PART 7 - GAME MANAGEMENT
// ======================================


// ======================================
// RESET GAME
// ======================================

function restartGame(){

    // Reset state

    gameTime = 0;

    gameOver = false;

    winner = null;



    // Clear arrays

    npcs.length = 0;

    platforms.length = 0;

    checkpoints.length = 0;

    spikes.length = 0;

    particles.length = 0;



    // Reset camera

    cameraY =
        START_FLOOR - HEIGHT / 2;



    // Reset lava

    lavaY =
        START_FLOOR + 500;


    lavaSpeed =
        0.7;



    // Rebuild world

    floor = new Floor();


    generatePlatforms();

    createCheckpoints();

    generateSpikes();

    createNPCs();


}



// ======================================
// FINAL UPDATE
// ======================================

function updateGame(){

    if(gameOver)
        return;



    gameTime++;


    updateNPCs();


    updateHazards();


    updateCamera();



    // Check if everyone died

    const alive =
        npcs.filter(
            n => !n.dead
        );



    if(alive.length === 0){

        gameOver = true;

    }


}



// ======================================
// CLICK RESTART
// ======================================

canvas.addEventListener(

    "click",

    () => {

        if(gameOver){

            restartGame();

        }

    }

);



// ======================================
// START GAME
// ======================================

restartGame();



// ======================================
// MAIN LOOP
// ======================================

function gameLoop(){

    updateGame();

    drawGame();


    requestAnimationFrame(
        gameLoop
    );

}


gameLoop();