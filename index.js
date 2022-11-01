class GameObject {
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.dead = false;
        this.type='';
        this.width = 0;
        this.height = 0;
        this.img = undefined;
    }

    rectFromGameObject(){
        return {
            top: this.y,
            left: this.x,
            bottom: this.y + this.height,
            right: this.x + this.width
        }
    }

    draw(ctx){
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height)
    }
}

class Hero extends GameObject {
    constructor(x,y){
        super(x,y)
       
        this.speed = 0;
    }
}

class Enemy extends GameObject{
    constructor(x,y){
        super(x,y);
        (this.width = 98), this.height = 50;
        this.type = 'Enemy';
        let id = setInterval(() => {
            if (this.y < canvas.height - this.height){
                this.y += 5;
            }else {
                console.log('Stopped at ', this.y)
                clearInterval(id)            
            }
        }, 3000);
    }
}

function loadTexture(path){
    return new Promise ((resolve)=>{
        const img = new Image();
        img.src = path;
        img.onload = ()=>{
            resolve(img);
        }
    })
}

class EventEmitter {
    constructor(){
        this.listeners = {};
    }
    on(message,listener){
        if(!this.listeners[message]){
            this.listeners[message]=[];
        }
        this.listeners[message].push(listener);
    }

    emit(message,payload = null){
        if(this.listeners[message]){
            this.listeners[message].forEach(l => {
                l(message, payload)
            });
        }
    }
}

class Cooldown {
  constructor(time){
    this.cool = false;
    setTimeout(()=>{
      this.cool = true;
    },time)
  }
}

class Weapon {
  constructor(){
  }
  fire(){
    if (!this.cooldown || this.cooldown.cool){
      //produce a laser
      this.cooldown = new Cooldown(500);
    }else {
      //do mothing - it hasnt cooled down yet
    }
  }
}

class Laser extends GameObject {
  constructor(x,y){
    super(x,y);
    (this.width = 9), (this.height = 33);
    this.type = 'Laser';
    this.img = laserImg;
    let id = setInterval(()=>{
      if(this.y>0){
        this.y = -15;
      }else{
        this.dead = true;
        clearInterval(id)
      }
    },100)

  }
}


window.addEventListener("keyup", (evt) => {
   if (evt.key === "ArrowUp") {
     eventEmitter.emit(Messages.KEY_EVENT_UP);
   } else if (evt.key === "ArrowDown") {
     eventEmitter.emit(Messages.KEY_EVENT_DOWN);
   } else if (evt.key === "ArrowLeft") {
     eventEmitter.emit(Messages.KEY_EVENT_LEFT);
   } else if (evt.key === "ArrowRight") {
     eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
   } else if (evt.keyCode === 32 ){
    eventEmitter.emit(Messages.KEY_EVENT_SPACE);
   }
 });

//messages to be emitted upon key events
const Messages = {
  KEY_EVENT_UP: "KEY_EVENT_UP",
  KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
  KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
  KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
  KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
  COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
  COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO"
};

//declaring global variables
let heroImg, 
    enemyImg, 
    laserImg,
    canvas, ctx, 
    gameObjects = [], 
    hero, 
    eventEmitter = new EventEmitter();

function createEnemies(){
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * 98;
    const START_X = (canvas.width - MONSTER_WIDTH)/2;
    const STOP_X = START_X + MONSTER_WIDTH;

   for (let x = START_X; x < STOP_X; x += 98) {
    for (let y = 0; y < 50 * 5; y += 50) { 
      const enemy = new Enemy(x, y);
      enemy.img = enemyImg;
      gameObjects.push(enemy);
  }
}
}
//function to create hero
function createHero() {
   hero = new Hero(canvas.width / 2 - 45,canvas.height - canvas.height / 4);
  hero.img = heroImg;
  gameObjects.push(hero);
}
//function to draw all game objects
function drawGameObjects(ctx) {

  gameObjects.forEach( go => {
    go.draw(ctx)
  });
}

//comparison function
function intersectRect (r1,r2){
    return !(r2.left> r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top);
}

//initializing game
function initGame() {
  gameObjects = [];
  createEnemies();
  createHero();

//listening for hero mmovement events that might be fired
  eventEmitter.on(Messages.KEY_EVENT_UP, () => {
    hero.y -=5 ;
    console.log('I am working')
  })

  eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
    hero.y += 5;
  });

  eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
    hero.x -= 5;
  });

  eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
    hero.x += 5;
  });

  eventEmitter.on(Messages.KEY_EVENT_SPACE, ()=>{
    if(hero.canFire()){
      hero.fire();
    }
  });

  eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_,{first,second})=>{
    first.dead = true;
    second.dead = true;
  });
}

window.onload = async()=>{
    
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  heroImg = await loadTexture("./assets/player.png");
  enemyImg = await loadTexture("./assets/enemyShip.png");
  laserImg = await loadTexture("./assets/laserRed.png");

  initGame();
  console.log(gameObjects)
  let gameLoopId = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    drawGameObjects(ctx);
  }, 100)
}
