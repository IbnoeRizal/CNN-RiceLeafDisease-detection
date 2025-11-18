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
        .then(r => r.text())
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
                video: { facingMode: "environment" }
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
    .then(res => res.text())
    .then(t => health.innerText = t)
    .catch(e => console.log(e));
});
