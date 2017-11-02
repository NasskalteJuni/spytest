let mediaStream = null;
let mediaRecorder = null;
let exampleAudio = document.getElementById('exampleAudio');
let messageList = document.getElementById('messages');
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

function showMessage(text){
    let li = document.createElement('li');
    li.setAttribute('class','message card');
    let section = document.createElement('section');
    let footer = document.createElement('footer');
    footer.innerHTML = (new Date()).toTimeString()
    let article = document.createElement('article');
    article.innerHTML = text;
    li.appendChild(section);
    section.appendChild(article);
    section.appendChild(footer);
    messageList.insertBefore(li, messageList.firstChild);
}

function visibilityChanged() {
    if(document.hidden){
        showMessage('Tab is now in Background');
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
        showMessage('Tab is now in Foreground');
        let recorder = getRecorder().then(recorder => {
            recorder.stop();
        });
    }
}

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

function clear(){
    if(mediaStream) mediaStream.getAudioTracks().forEach(track => {
        if(track.stop) track.stop()
    });
    mediaRecorder = null;
    mediaStream = null;
}