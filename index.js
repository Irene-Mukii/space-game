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
        super(x,y);
        (this.width = 99), (this.height = 75);
        this.type = 'Hero'
        this.speed = {x:0, y:0};
        this.cooldown = 0;
        this.life = 3;
        this.points = 0;
    }
    fire(){
      gameObjects.push(new Laser(this.x + 45, this.y - 10));
      this.cooldown = 500;

      let id = setInterval(()=>{
        if(this.cooldown > 0){
          this.cooldown -= 100;
        }else {
          clearInterval(id)
        }
      },200)
    }

    canFire(){
      return this.cooldown === 0;
    }

    decrementLife(){
      this.life--;
      if(this.life === 0 ){
        this.dead = true
      }
    }

    incrementPoints(){
      this.points += 100;
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
        }, 3000 );
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

    clear(){
      this.listeners = {};
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
        this.y -= 5  ;
        console.log(this.y)
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
   } else if (evt.key === "Enter"){
    eventEmitter.emit(Messages.KEY_EVENT_ENTER);
   }
 });

//messages to be emitted upon key events
const Messages = {
  KEY_EVENT_UP: "KEY_EVENT_UP",
  KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
  KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
  KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
  KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
  KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
  COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
  COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
  GAME_END_LOSS: "GAME_END_LOSS",
  GAME_END_WIN: "GAME_END_WIN"
};

//declaring global variables
let heroImg, 
    enemyImg, 
    laserImg,
    lifeImg,
    totalScore,
    livesLeft,
    canvas, ctx, 
    gameObjects = [], 
    hero, 
    gameLoopId,
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
    return !(
      r2.left > r1.right ||
      r2.right < r1.left ||
      r2.top > r1.bottom ||
      r2.bottom < r1.top
    );
}

function isHeroDead(){
  return hero.life <= 0;
}

function isEnemiesDead(){
  const enemies = gameObjects.filter((go) => go.type === 'Enemy' && !go.dead);
  return enemies.length === 0; 
}

function updateGameObjects(){
  const enemies = gameObjects.filter(go => go.type === 'Enemy');
  const lasers = gameObjects.filter(go => go.type === 'Laser');
  //laster hits something 
  lasers.forEach((l)=>{
    enemies.forEach((m)=>{
      if(intersectRect(l.rectFromGameObject(),m.rectFromGameObject())){
        eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
          first: l,
          second: m,
        });
      }
      
    });
  });
  enemies.forEach((enemy)=>{
    const heroRect  = hero.rectFromGameObject();
      if(intersectRect(heroRect,enemy.rectFromGameObject())){
        eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, {enemy}); 
      }
  })
  //game objects remaining for rendering should only be the ones not dead
  gameObjects = gameObjects.filter(go => !go.dead);
}

function drawlife(){
  //TODO 35,27
  const START_POS = canvas.width - 180;
  console.log('hero lives  are '+ hero.life )
  for (let i=0; i<hero.life; i++){
    ctx.drawImage(
      lifeImg,
      START_POS + (45 * (i+1)),
      canvas.height - 37
    );
  }
}

function drawPoints(){
  ctx.font = '30px Arial';
  ctx.fillStyle = 'red';
  ctx.textAlign = 'left';
  drawText('Points: ' + hero.points, 10, canvas.height - 20);
}

function drawText(message, x, y){
  ctx.fillText(message, x, y);
}

function displayMessage(message, color = "red"){
  ctx.font = "30px Arial";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
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

  eventEmitter.on(Messages.KEY_EVENT_ENTER, ()=>{
    resetGame();
  })

  eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_,{first,second})=>{ 
    first.dead = true;
    second.dead = true;
    hero.incrementPoints();

    if (isEnemiesDead()){
      eventEmitter.emit(Messages.GAME_END_WIN);
    }
  });

  eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, {enemy}) => {
    console.log('danger')
    enemy.dead = true;
    hero.decrementLife();

    if(isHeroDead()){
      eventEmitter.emit(Messages.GAME_END_LOSS)
      return;
    }
    if(isEnemiesDead()){
      eventEmitter.emit(Messages.GAME_END_WIN)
    }
  });

  eventEmitter.on(Messages.GAME_END_WIN, ()=> {
    endGame(true);
  });

  eventEmitter.on(Messages.GAME_END_LOSS, ()=> {
    endGame(false);
  })
}

function endGame(win) {
  clearInterval(gameLoopId);

  // set a delay so we are sure any paints have finished 
  setTimeout(()=> {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0,0, canvas.width, canvas.height);
    if(win){
      displayMessage("Victory!! Pew Pew... - Press [Enter] to start a new game Captain pew pew","green");
    } else {
      displayMessage("You died !!! - Press [Enter] to start a new game Captain Pew pew");
    }
  },  200)
}

function resetGame() {
  if (gameLoopId){
    clearInterval(gameLoopId);
    eventEmitter.clear();
    initGame();
    gameLoopId = setInterval(()=>{
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawPoints();
      drawlife();
      updateGameObjects();
      drawGameObjects(ctx);
    }, 100)
  }
}

window.onload = async()=>{
    
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  heroImg = await loadTexture("./assets/player.png");
  enemyImg = await loadTexture("./assets/enemyShip.png");
  laserImg = await loadTexture("./assets/laserRed.png");
  lifeImg = await loadTexture('./assets/life.png')

  initGame();
  console.log(gameObjects)
  gameLoopId = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updateGameObjects();
    //console.log(gameObjects);
    drawGameObjects(ctx);
    drawPoints();
    drawlife();
  }, 10)
}
