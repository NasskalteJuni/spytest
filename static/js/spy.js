// local microphone stream and recorder on that stream
let mediaStream = null;
let mediaRecorder = null;
// elements to display output
let exampleAudio = document.getElementById('exampleAudio');
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
        return e => this._chunks.push(e.data);
    }
};
document.addEventListener("visibilitychange", visibilityChanged);
justifyButton.addEventListener("click", function(){
    showMessage('Accessing (justified and wanted) the users microphone');
    getRecorder().then(_=> {
        let timeout = setTimeout(_=> {
            showMessage('Now the user does not want to access the microphone anymore and "closes" it');
            clearTimeout(timeout);
        }, 5000);
    });
});

// helper methods:

/**
 * display text on page (with the date)
 * @param text the text to show
 * */
function showMessage(text){
    let li = document.createElement('li');
    li.setAttribute('class','message card');
    let section = document.createElement('section');
    let footer = document.createElement('footer');
    footer.innerHTML = (new Date()).toTimeString();
    let article = document.createElement('article');
    article.innerHTML = text;
    li.appendChild(section);
    section.appendChild(article);
    section.appendChild(footer);
    messageList.insertBefore(li, messageList.firstChild);
}

/**
 * Event handler function that switches between recording when the tab is not in foreground and to normal, not recording when the user views at the tab directly
 * */
function visibilityChanged() {
    if(document.hidden){
        showMessage('Tab is now in Background - allow recording');
        getRecorder().then(recorder => {
            recorder.start();
            recorder.ondataavailable = sink.getRecordFunction();
            recorder.onstop = function(){
                exampleAudio.src = sink.getDataAsSrcUrl();
                showMessage('Recorded while in Background, click on audio to hear recordings');
                clear();
            }
        });
    }else{
        showMessage('Tab is now in Foreground - hide all signs of recording');
        getRecorder().then(recorder => {
            recorder.stop();
        });
    }
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
    if(mediaStream) mediaStream.getAudioTracks().forEach(track => {
        if(track.stop) track.stop()
    });
    mediaRecorder = null;
    mediaStream = null;
}