Number.prototype.clamp = function(min, max) {
    return this < min ? min : (this > max ? max : this);
};

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var width = 500;
var height = 500;

canvas.width = width;
canvas.height = height;


var gravity = 0.5;
var friction =0.88;


var player = {
    color:"green",
    x:50,
    y:50,
    width:10,
    height:10,
    speed:5,
    velx:0,
    vely:0,
    jumping:true
};


// LEVELS

var levels = [

    // Level 1
    [
        {x:0,y:490,width:500,height:10},
        {x:80,y:420,width:120,height:10},
        {x:260,y:340,width:100,height:10},
        {x:120,y:260,width:140,height:10},
        {x:320,y:180,width:120,height:10}
    ],


    // Level 2
    [
        {x:0,y:490,width:500,height:10},
        {x:40,y:430,width:100,height:10},
        {x:200,y:370,width:90,height:10},
        {x:350,y:310,width:100,height:10},
        {x:120,y:240,width:120,height:10},
        {x:300,y:160,width:120,height:10},
        {x:100,y:90,width:100,height:10}
    ],


    // Level 3
    [
        {x:0,y:490,width:500,height:10},
        {x:40,y:430,width:70,height:10},
        {x:130,y:370,width:70,height:10},
        {x:220,y:310,width:70,height:10},
        {x:310,y:250,width:70,height:10},
        {x:400,y:190,width:70,height:10},
        {x:260,y:120,width:100,height:10}
    ]

];


var currentLevel = 0;

var platforms = [];
var coins = [];
var enemies = [];

var score = 0;

var won = false;



var flag = {
    x:420,
    y:120,
    visible:false
};



function loadLevel(number){

    platforms = levels[number];


    coins = [];

    for(var i=1;i<platforms.length;i++){

        coins.push({

            x:platforms[i].x + platforms[i].width/2,
            y:platforms[i].y - 10,
            radius:6,
            collected:false

        });

    }



    enemies = [];


    // create enemies on random platforms
    for(var i=1;i<platforms.length;i+=2){

        enemies.push({

            x:platforms[i].x,
            y:platforms[i].y-15,
            width:15,
            height:15,
            speed:2,
            direction:1,
            platform:i

        });

    }



    flag.visible=false;


    player.x=50;
    player.y=50;
    player.velx=0;
    player.vely=0;

}



loadLevel(currentLevel);



var keys=[];



function resetPlayer(){

    player.x=50;
    player.y=50;
    player.velx=0;
    player.vely=0;

}

function update(){


    if(won){

        ctx.clearRect(0,0,width,height);

        ctx.fillStyle="green";
        ctx.font="40px Arial";
        ctx.fillText("YOU WIN!",140,220);

        ctx.fillStyle="black";
        ctx.font="20px Arial";
        ctx.fillText("Final Score: "+score,160,260);

        return;
    }



    // PLAYER CONTROLS

    if(keys[37]){

        if(player.velx > -player.speed)
            player.velx--;
    }


    if(keys[39]){

        if(player.velx < player.speed)
            player.velx++;
    }



    if(keys[32]){

        if(!player.jumping){

            player.vely=-player.speed*2;
            player.jumping=true;

        }

    }




    // PHYSICS

    player.velx*=friction;
    player.vely+=gravity;


    player.x+=player.velx;
    player.y+=player.vely;



    player.x=player.x.clamp(
        0,
        width-player.width
    );



    player.jumping=true;




    // PLATFORM COLLISION

    for(var i=0;i<platforms.length;i++){

        var p=platforms[i];


        if(

            player.vely>=0 &&

            player.x+player.width>p.x &&

            player.x<p.x+p.width &&

            player.y+player.height>=p.y &&

            player.y+player.height-player.vely<=p.y

        ){

            player.y=p.y-player.height;

            player.vely=0;

            player.jumping=false;

        }

    }





    // COINS

    for(var i=0;i<coins.length;i++){

        var c=coins[i];


        if(

            !c.collected &&

            player.x < c.x+c.radius &&

            player.x+player.width > c.x-c.radius &&

            player.y < c.y+c.radius &&

            player.y+player.height > c.y-c.radius

        ){

            c.collected=true;

            score++;

        }

    }






    // ENEMIES

    for(var i=0;i<enemies.length;i++){


        var e=enemies[i];

        var p=platforms[e.platform];



        e.x += e.speed*e.direction;



        if(
            e.x <= p.x ||
            e.x+e.width >= p.x+p.width
        ){

            e.direction*=-1;

        }



        // enemy collision

        if(

            player.x < e.x+e.width &&

            player.x+player.width > e.x &&

            player.y < e.y+e.height &&

            player.y+player.height > e.y

        ){

            resetPlayer();

        }


    }







    // CHECK FLAG

    flag.visible=true;


    for(var i=0;i<coins.length;i++){

        if(!coins[i].collected){

            flag.visible=false;

            break;

        }

    }




    // FLAG COLLISION

    if(flag.visible){


        if(

            player.x+player.width > flag.x &&

            player.x < flag.x+30 &&

            player.y+player.height > flag.y &&

            player.y < flag.y+50

        ){


            currentLevel++;



            if(currentLevel >= levels.length){

                won=true;

            }

            else{

                loadLevel(currentLevel);

            }


        }

    }






    // FALL RESET

    if(player.y > height+100){

        resetPlayer();

    }






    // DRAW

    ctx.clearRect(0,0,width,height);





    // PLATFORMS

    ctx.fillStyle="black";


    for(var i=0;i<platforms.length;i++){

        var p=platforms[i];

        ctx.fillRect(
            p.x,
            p.y,
            p.width,
            p.height
        );

    }





    // COINS

    for(var i=0;i<coins.length;i++){

        var c=coins[i];


        if(!c.collected){

            ctx.fillStyle="gold";

            ctx.beginPath();

            ctx.arc(
                c.x,
                c.y,
                c.radius,
                0,
                Math.PI*2
            );

            ctx.fill();

        }

    }






    // ENEMIES

    for(var i=0;i<enemies.length;i++){

        var e=enemies[i];


        ctx.fillStyle="red";


        ctx.fillRect(

            e.x,
            e.y,
            e.width,
            e.height

        );

    }







    // FLAG

    if(flag.visible){


        ctx.fillStyle="gray";

        ctx.fillRect(
            flag.x,
            flag.y,
            4,
            50
        );



        ctx.fillStyle="red";


        ctx.beginPath();


        ctx.moveTo(
            flag.x+4,
            flag.y
        );


        ctx.lineTo(
            flag.x+30,
            flag.y+10
        );


        ctx.lineTo(
            flag.x+4,
            flag.y+20
        );


        ctx.closePath();


        ctx.fill();

    }







    // PLAYER

    ctx.fillStyle=player.color;


    ctx.fillRect(

        player.x,
        player.y,
        player.width,
        player.height

    );






    // HUD

    ctx.fillStyle="black";

    ctx.font="18px Arial";


    ctx.fillText(

        "Level: "+(currentLevel+1)+
        "  Score: "+score,

        10,
        25

    );




    setTimeout(update,1000/60);

}






// KEYBOARD

document.onkeydown=function(e){

    keys[e.keyCode]=true;

};


document.onkeyup=function(e){

    keys[e.keyCode]=false;

};

update();


