const Q = [];
const map = [];

const CELLPIXELS = 64;
const SIZEX = 10;
const SIZEY = 6;
const MAXREWARD = 100;
const ONEUNITREWARD = 100;

imgBad = new Image();
imgBad.src = "./bad.png";


imgGood = new Image();
imgGood.src = "./bell.svg";

imgNormal = new Image();
imgNormal.src = "./normal.png";

function init() {
    function initQ() {
        for (let x = 0; x < SIZEX; x++) {
            Q.push([]);
            for (let y = 0; y < SIZEY; y++) {
                Q[x].push([]);
                for (let a = 0; a < 4; a++) {
                    Q[x][y].push(0);
                }
            }
        }
    }


    function initMap() {
        for (let x = 0; x < SIZEX; x++) {
            map.push([]);
            for (let y = 0; y < SIZEY; y++)
                map[x].push(-1);
        }

        for (let x = 1; x < SIZEX - 1; x++) {
            map[x][SIZEY - 1] = -MAXREWARD;
        }
        map[SIZEX - 1][SIZEY - 1] = MAXREWARD;
    }

    initQ();
    initMap();

}


function draw() {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 640, 480);

    for (let x = 0; x < SIZEX; x++)
        for (let y = 0; y < SIZEY; y++) {
            ctx.save();
            ctx.translate(x * CELLPIXELS + CELLPIXELS/2, y * CELLPIXELS + CELLPIXELS/2);
            if (map[x][y] <= -ONEUNITREWARD) {
                ctx.drawImage(imgBad, -CELLPIXELS/2, -CELLPIXELS/2, CELLPIXELS, CELLPIXELS);
            } else if (map[x][y] >= ONEUNITREWARD) {
                ctx.drawImage(imgGood, -CELLPIXELS/2, -CELLPIXELS/2, CELLPIXELS, CELLPIXELS);
            }
            else
                ctx.drawImage(imgNormal, -CELLPIXELS/2, -CELLPIXELS/2, CELLPIXELS, CELLPIXELS);



            if (!isTerminal({ x, y })) {


                let maxQ = 0;
                for (let x = 0; x < SIZEX; x++)
                    for (let y = 0; y < SIZEY; y++)
                        for (let a = 0; a < 4; a++)
                            maxQ = Math.max(Q[x][y][a], maxQ);

                let amax = [];
                let maxSoFar = -10000;
                for (let a = 0; a < 4; a++) {
                    if (Q[x][y][a] > maxSoFar) {
                        amax = [a];
                        maxSoFar = Q[x][y][a];
                    }
                    else if (Q[x][y][a] == maxSoFar) {
                        amax.push(a);
                    }
                }

                for (let a = 0; a < 4; a++) {
                    const c = maxQ == 0 ? 0 : Q[x][y][a] / maxQ;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 0, 0, ${c})`;
                    ctx.moveTo(-6*CELLPIXELS/32, -8*CELLPIXELS/32);
                    ctx.lineTo(0, -14*CELLPIXELS/32);
                    ctx.lineTo(6*CELLPIXELS/32, -8*CELLPIXELS/32);
                    ctx.lineTo(-6*CELLPIXELS/32, -8*CELLPIXELS/32);
                    ctx.stroke();

                    if (amax.indexOf(a) >= 0) {
                        ctx.fillStyle = "#00AA00";
                        ctx.fill();
                    }
                    ctx.rotate(Math.PI / 2);
                }

            }
            ctx.restore();

        }

        /*
    function drawCurrentState() {
        ctx.lineWidth = 4;
        ctx.strokeRect(state.x * CELLPIXELS, state.y * CELLPIXELS, CELLPIXELS, CELLPIXELS);
        ctx.lineWidth = 1;
    }

    drawCurrentState();*/
}




let state = { x: 4, y: 4 };


function reset() { state = { x: 0, y: SIZEY - 1 }; }



function isTerminal(state) { return Math.abs(map[state.x][state.y]) >= ONEUNITREWARD; }

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


    //wind
    /*if (Math.random() > 1) {
        newstate.y = Math.min(newstate.y + 1, SIZEY - 1);
    }*/

    return newstate;
}

const alpha = 0.2;
const lambda = 0.9;
const epsilon = 0.5;

function argmax(arr) { return arr.indexOf(Math.max(...arr)) }

function selectActionEpsilonGreedy(state) {
    return Math.random() < epsilon ? Math.floor(Math.random() * 4) : argmax(Q[state.x][state.y]);
}

function oneStepQlearning() {
    const a = selectActionEpsilonGreedy(state);
    const newstate = executeAction(state, a);
    const reward = map[newstate.x][newstate.y];

    Q[state.x][state.y][a] = (1 - alpha) * Q[state.x][state.y][a] +
        alpha * (reward +
            lambda * Math.max(Q[newstate.x][newstate.y][0], Q[newstate.x][newstate.y][1],
                Q[newstate.x][newstate.y][2], Q[newstate.x][newstate.y][3]
            ));
    state = newstate;
    if (isTerminal(state))
        reset();
}


reset();
init();
let aSARSA = selectActionEpsilonGreedy(state);

function oneStepSARSA() {
    const newstate = executeAction(state, aSARSA);
    const anext = selectActionEpsilonGreedy(newstate);
    const reward = map[newstate.x][newstate.y];

    Q[state.x][state.y][aSARSA] = (1 - alpha) * Q[state.x][state.y][aSARSA] +
        alpha * (reward + lambda * Q[newstate.x][newstate.y][anext]);

    state = newstate;
    aSARSA = anext;

    if (isTerminal(state))
        reset();
}




let oneStep = oneStepQlearning;

Qlearning.onclick = () => { oneStep = oneStepQlearning };
SARSA.onclick = () => { oneStep = oneStepSARSA };



//main
setInterval(() => {
    for (let i = 0; i < 100; i++)
        oneStep();
    draw();
}, 1);

canvas.onmousedown = (evt) => {
    const x = Math.floor(evt.offsetX / CELLPIXELS);
    const y = Math.floor(evt.offsetY / CELLPIXELS);
    if (evt.button == 0)
        map[x][y] = Math.min(MAXREWARD, map[x][y] + ONEUNITREWARD+1)
    else
        map[x][y] = Math.max(-MAXREWARD, map[x][y] - ONEUNITREWARD);

    if (map[x][y] == 0)
        map[x][y] = -1;
};