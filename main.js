const Q = [];
const map = [];



const SIZEX = 20;
const SIZEY = 15;

function init() {
    for (let x = 0; x < SIZEX; x++) {
        Q.push([]);
        for (let y = 0; y < SIZEY; y++) {
            Q[x].push([]);
            for (let a = 0; a < 4; a++) {
                Q[x][y].push(0);
            }
        }
    }
    for (let x = 0; x < SIZEX; x++) {
        map.push([]);
        for (let y = 0; y < SIZEY; y++)
            map[x].push(Math.random() > 0.9 ? Math.random() * 1000 : 0);
    }

    for (let x = 0; x < SIZEX; x++) {
        map[x][0] = -1000;
        map[x][SIZEY - 1] = -1000;
    }
    for (let y = 0; y < SIZEY; y++) {
        map[0][y] = -1000;
        map[SIZEX - 1][y] = -1000;
    }

}


function draw() {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 640, 480);

    const maxreward = Math.max(...map.map((arr) => Math.max(...arr)));
    for (let x = 0; x < SIZEX; x++)
        for (let y = 0; y < SIZEY; y++) {
            if (map[x][y] < 0) {
                ctx.fillStyle = `rgb(255, 0, 0)`;
            } else if (maxreward == 0) {
                ctx.fillStyle = `rgb(255, 255, 255)`

            } else
                ctx.fillStyle = `rgb(255, 255, ${255 - Math.floor(map[x][y] * 255 / maxreward)})`
            ctx.fillRect(x * 32, y * 32, 32, 32);


            ctx.save();
            ctx.translate(x * 32 + 16, y * 32 + 16);

            let maxQ = 0;
            for (let x = 0; x < SIZEX; x++)
                for (let y = 0; y < SIZEY; y++)
                    for (let a = 0; a < 4; a++)
                        maxQ = Math.max(Q[x][y][a], maxQ);

            let amax = 0;
            let maxSoFar = -10000;
            for (let a = 0; a < 4; a++) {
                if (Q[x][y][a] > maxSoFar) {
                    amax = a;
                    maxSoFar = Q[x][y][a];
                }
            }


            for (let a = 0; a < 4; a++) {
                const c = maxQ == 0 ? 0 : Q[x][y][a] / maxQ;
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 0, 0, ${c})`;
                ctx.moveTo(-6, -8);
                ctx.lineTo(0, -14);
                ctx.lineTo(6, -8);
                ctx.lineTo(-6, -8);
                ctx.stroke();

                if (a == amax) {
                    ctx.fillStyle = "green";
                    ctx.fill();

                }
                ctx.rotate(Math.PI / 2);
            }
            ctx.restore();
        }


    ctx.strokeStyle = "orange"
    for (let x = 0; x < SIZEX; x++) {
        ctx.beginPath();
        ctx.moveTo(x * 32, 0);
        ctx.lineTo(x * 32, SIZEY * 32);
        ctx.stroke();
    }

    for (let y = 0; y < SIZEY; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * 32);
        ctx.lineTo(SIZEX * 32, y * 32);
        ctx.stroke();
    }

    /* ctx.lineWidth= 4;
     ctx.strokeRect(state.x * 32, state.y * 32, 32, 32);
     ctx.lineWidth= 1;
 */
}



init();

let state = { x: 4, y: 4 };




function executeAction(state, a) {
    function executePureAction(state, a) {
        switch (a) {
            case 0: return { x: state.x, y: Math.max(0, state.y - 1) };
            case 1: return { x: Math.min(state.x + 1, SIZEX - 1), y: state.y };
            case 2: return { x: state.x, y: Math.min(state.y + 1, SIZEY - 1) };
            case 3: return { x: Math.max(0, state.x - 1), y: state.y };
        }
    }
    let newstate = executePureAction(state, a);

    if(map[newstate.x][newstate.y] > 0) {
        newstate.x = Math.floor(Math.random() * SIZEX);
        newstate.y = Math.floor(Math.random() * SIZEY);
    }
    //wind
    if(Math.random() > 1) {
        newstate.y = Math.min(newstate.y + 1, SIZEY - 1);
    }
    return newstate;
}

const alpha = 0.2;
const lambda = 0.9;


function argmax(arr) { return arr.indexOf(Math.max(...arr)) }

function oneStepQlearning() {
    const a = Math.random() > 0.2 ? Math.floor(Math.random() * 4) : argmax(Q[state.x][state.y]);
    const newstate = executeAction(state, a);

    Q[state.x][state.y][a] = (1 - alpha) * Q[state.x][state.y][a] +
        alpha * (map[state.x][state.y] +
            lambda * Math.max(Q[newstate.x][newstate.y][0],
                Q[newstate.x][newstate.y][1],
                Q[newstate.x][newstate.y][2],
                Q[newstate.x][newstate.y][3]
            ));
    state = newstate;
}


setInterval(() => {
    for (let i = 0; i < 10; i++)
        oneStepQlearning();
    draw();
}, 1);


draw();

