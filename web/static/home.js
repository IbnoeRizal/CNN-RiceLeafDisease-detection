const video = document.getElementById('vid');
const canv = document.getElementById('canv');
const toggleF = document.getElementById('toggle_camera_and_form');
const on_off = document.getElementById('togglestartandstop');
const form = document.getElementById('form');
const container = document.querySelector('.container');
const actv = document.getElementById('active');
const inactv = document.getElementById('inactive');
const health = document.getElementById('healthnow');

const context = canv.getContext('2d');

// GLOBAL LOOP ID
let drawLoop = null;

function sendFrame() {
    canv.toBlob(blob => {
        const fd = new FormData();
        fd.append('file', blob, 'capture.png');

        fetch(form.getAttribute('action'), {
            method: 'POST',
            body: fd
        })
        .then(r => handleprobability(r))
        .then(t => health.innerText = t)
        .catch(e => console.log(e));
    }, 'image/png');
}


const stream = (function () {
    let streamObj = null;

    return {

        status: () => streamObj !== null,

        get: async () => {
            if (streamObj) return streamObj;

            streamObj = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: "environment",
                    width : {ideal:1280},
                    height : {ideal:720}
                 }
            });

            return streamObj;
        },

        del: () => {
            if (!streamObj) return;
            streamObj.getTracks().forEach(t => t.stop());
            streamObj = null;
        }
    };
})();


function startDrawing() {
    canv.width = video.videoWidth;
    canv.height = video.videoHeight;

    const draw = () => {
        context.drawImage(video, 0, 0, canv.width, canv.height);
        drawLoop = requestAnimationFrame(draw);
    };
    draw();
}

function stopDrawing() {
    if (drawLoop) cancelAnimationFrame(drawLoop);
    drawLoop = null;
}


async function drawer() {
    if (!stream.status()) {
        video.srcObject = await stream.get();
        await video.play();

        startDrawing();
        looper();
    } else {
        stream.del();
        stopDrawing();
    }
}

function looper() {
    const timeout = 1500;

    const tick = () => {
        if (!stream.status()) return;
        sendFrame();
        setTimeout(tick, timeout);
    };

    tick();
}

function activebutton() {
    if (getComputedStyle(inactv).display === 'none') {
        inactv.style.display = 'block';
        actv.style.display = 'none';
    } else {
        inactv.style.display = 'none';
        actv.style.display = 'block';
    }
}

on_off.addEventListener('click', async () => {
    await drawer();
    activebutton();
});

toggleF.addEventListener('click', () => {
    const formHidden = getComputedStyle(form).display === 'none';

    if (formHidden) {
        // tampilkan form, sembunyikan kamera
        form.style.display = 'flex';
        container.style.display = 'none';

        if (stream.status()) {
            drawer(); // matikan kamera
            activebutton();
        }

        toggleF.textContent = 'Kamera';
    } else {
        // tampilkan kamera
        form.style.display = 'none';
        container.style.display = 'flex';
        toggleF.textContent = 'Form';
    }
});


form.addEventListener('submit', ev => {
    ev.preventDefault();

    fetch(form.getAttribute('action'), {
        method: 'POST',
        body: new FormData(form)
    })
    .then(res => handleprobability(res))
    .then(t => health.innerText = t)
    .catch(e => console.log(e));
});

function handleprobability(response){
    return new Promise((res,rej) => {
        response.json()
        .then( x => {
            if(x?.error) 
                rej(x.error);

            let y = '';
            let m = -1;

            for(const {confidence, label} of x){
                // console.error("ini conf", confidence, "=====", "ini label", label);
                if(m >= confidence) continue;
                y = label;
                m = confidence;
            }

            res(`${y}, confidence ${(m*100).toFixed(2)} %`);
        })
        .catch(x => {rej(x)});
    })
}