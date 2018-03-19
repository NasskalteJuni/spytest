/**
 * created by Lukas Steinjan
 * creates a custom event-Listener 'onminimize', which is triggered by the browser window being resized to a predefined height,
 * allowing to listen for minimization of the window and an event listener for maximizing the window again.
 * Also exposes the global minimized variable, declaring the current state.
 */
// attribute to check for the current window state
window.minimized = false;
// for event listeners
window.onminimize = null;
window.onmaximize = null;

const __minimizeSize = 100; // browser window height that shall be equal to a minimized window
const __pollTime = 50;      // checks every polling-time ms
setInterval(function(){
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