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

async function createEnemies(ctx,canvas,enemy){
    //TODO draw enemies
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * 98;
    const START_X = (canvas.width - MONSTER_WIDTH)/2;
    const STOP_X = START_X + MONSTER_WIDTH;

   for (let x = START_X; x < STOP_X; x += 98) {
    for (let y = 0; y < 50 * 5; y += 50) { 
        enemy.x = x;
        enemy.y = y;
        enemy.draw(ctx);
    }
  }
}

window.onload = async()=>{
    const canvas = document.getElementById('canvas');
    console.log(canvas)
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    //initiate hero
    const hero = new Hero((canvas.width/2) - 45,canvas.height - canvas.height / 4); 
    hero.img = await loadTexture('./assets/player.png');
    hero.height = hero.img.height;
    hero.width = hero.img.width;
    //draw hero on screen
    hero.draw(ctx);

    let enemy = new Enemy();
    enemy.img = await loadTexture('./assets/enemyShip.png');
    enemy.height = enemy.img.height;
    enemy.width = enemy.img.width;
   
    createEnemies(ctx, canvas,enemy);


//too much repitition in code ... fix that..
//stop movemrnt of hero outside the canvas
    let onKeyDown = function(e) {
    console.log(e.keyCode, e.key);
    e.preventDefault();
    if(e.key==='ArrowUp'){
         hero.y -= 50;

        ctx.clearRect(0,0,canvas.width,canvas.height)
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        
        createEnemies(ctx, canvas,enemy);
        hero.draw(ctx);
    
        console.log(hero.y)
    }
    if(e.key==='ArrowDown'){

        hero.y += 50;

        ctx.clearRect(0,0,canvas.width,canvas.height)
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        
        createEnemies(ctx, canvas,enemy);
        hero.draw(ctx);
    
        console.log(hero.y)
    }
    if(e.key==='ArrowLeft'){
        hero.x -= 50;

        ctx.clearRect(0,0,canvas.width,canvas.height)
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        
        createEnemies(ctx, canvas,enemy);
        hero.draw(ctx);
    
        console.log(hero.x)
    }
    if(e.key==='ArrowRight'){
        hero.x += 50;

        ctx.clearRect(0,0,canvas.width,canvas.height)
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        
        createEnemies(ctx, canvas,enemy);
        hero.draw(ctx);
    
        console.log(hero.x)
    }

}
window.addEventListener('keydown', onKeyDown)
}





