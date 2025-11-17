const video = document.getElementById('vid');
const canv = document.getElementById('canv');
const toggleF = document.getElementById('toggle_camera_and_form');
const on_off = document.getElementById('togglestartandstop');
const form = document.getElementById('form');
const container = document.querySelector('.container');
const actv = document.getElementById('active');
const inactv = document.getElementById('inactive');

const context = canv.getContext('2d');

const stream = (function () {
    let streamPromise = null;

    const createstream = () => {
        streamPromise = new Promise((resolve, reject) => {

            navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                },})
                .then(x => {
                    resolve(x);
                })
                .catch(err => {
                    alert(`Could not access the camera. Please allow permissions and try again.`);
                    reject(null);
                });
        });
    };

    return {
        status: () => {
            return streamPromise != null;
        },

        get: async () => {
            if (!streamPromise)
                createstream();

            return await streamPromise;
        },

        del: async () => {
            if (!streamPromise) return;

            const s = await streamPromise;
            s.getTracks().forEach(t => t.stop());
            streamPromise = null;
        }
    };
})();

const drawer = async () => {
    if (!stream.status()) {
        video.srcObject = await stream.get();
        await video.play(); // penting!

        let loop;
        const draw = () =>{
            context.drawImage(video, 0, 0, canv.width, canv.height);
            loop = requestAnimationFrame(draw);
        };

        draw();
        on_off.dataset.loop = loop; // simpan ID loop
    }
    else {
        stream.del();
        cancelAnimationFrame(on_off.dataset.loop);
    }
}
const activebutton = function(){
    if(inactv.style.display === 'none'){
        inactv.style.display = 'block';
        actv.style.display = 'none';
    }else{
        inactv.style.display = 'none';
        actv.style.display = 'block';
    }
}

on_off.addEventListener('click',async()=>{
    await drawer();
    activebutton()
    
})

toggleF.addEventListener('click', () => {
    if(form.style.display == 'none'){
        form.style.display = 'flex';
        if(stream.status()){
            drawer();
            activebutton();
        }
        container.style.display = 'none';
        toggleF.textContent = 'Kamera';
    }else{
        form.style.display = 'none';
        container.style.display = 'flex';
        toggleF.textContent = 'Form';
    }

})
