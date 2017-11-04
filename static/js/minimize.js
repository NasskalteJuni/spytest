/**
 * created by NasskalteJuni
 */
window.minimized = false;
window.onminimize = null;
window.onmaximize = null;

const __minimizeSize = 100;
const __pollTime = 50;
setInterval(_=> {
    if(window.outerHeight < __minimizeSize){
        if(!window.minimized){
            if(typeof window.onminimize === 'function') window.onminimize();
            window.minimized = true;
        }
    }else{
        if(window.minimized){
            if(typeof window.onminimize === 'function') window.onmaximize();
            window.minimized = false;
        }
    }
}, __pollTime);