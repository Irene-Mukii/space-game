const canvas = document.getElementById('canvas');
let offset = 0;
const ctx = canvas.getContext('2d');

function draw(){

        ctx.beginPath();
        ctx.moveTo(1000,1000);

        const line = ctx.createLinearGradient(0,0,700,700);
        line.addColorStop(0, 'red');
        line.addColorStop(0.5,'green');
        line.addColorStop(1,'blue');
        ctx.setLineDash([4,2]);
        ctx.lineDashOffset = -offset;
        ctx.strokeStyle = line;
       

        for (let i=1000; i>=0; i-=50){
              ctx.quadraticCurveTo(canvas.width/2,canvas.height/4,i-50,i-50);
        }
        ctx.stroke();

        const radgrad = ctx.createRadialGradient(45,45,10,50,50,30)
        radgrad.addColorStop(0,'green');
        radgrad.addColorStop(0.9,'orange')
        radgrad.addColorStop(1,'rgba(1, 159, 98, 0)'); //requires transparency preferablu same color for all radial gradients in the same rect

        const radgrad1 = ctx.createRadialGradient(0, 150, 50, 0, 140, 90)
        radgrad1.addColorStop(0,'green');
        radgrad1.addColorStop(0.8,'orange ')
        radgrad1.addColorStop(1,'rgba(1, 159, 98, 0)');

        ctx.fillStyle = radgrad;
        ctx.fillRect(0,0,150,150);
        ctx.fillStyle = radgrad1;
        ctx.fillRect(0,0,150,150);
    
}

function march(){
    offset++;
    if(offset%2==0){
        offset = 0;
    }
    draw();
    setTimeout(march,2000)
}

march();












