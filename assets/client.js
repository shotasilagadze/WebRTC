'use strict';

var socket = io(IP + '/signaling');
var startButton = document.getElementById('startButton');
var callButton = document.getElementById('callButton');
var hangupButton = document.getElementById('hangupButton');
callButton.disabled = true;
hangupButton.disabled = true;
startButton.onclick = start;
callButton.onclick = call;
hangupButton.onclick = hangup;

socket.on('connect', function () {

   console.log('zzzz');

});


var startTime;
var localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');


remoteVideo.onresize = function() {
  trace('Remote video size changed to ' +
    remoteVideo.videoWidth + 'x' + remoteVideo.videoHeight);
  // We'll use the first onresize callback as an indication that video has started
  // playing out.
  if (startTime) {
    var elapsedTime = window.performance.now() - startTime;
    trace('Setup time: ' + elapsedTime.toFixed(3) + 'ms');
    startTime = null;
  }
};

var localStream;
var pc1;
var pc2;
var offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};

function getName(pc) {
  return (pc === pc1) ? 'pc1' : 'pc2';
}

function getOtherPc(pc) {
  return (pc === pc1) ? pc2 : pc1;
}

function gotStream(stream) {
  trace('Received local stream');
  localVideo.srcObject = stream;
  // Add localStream to global scope so it's accessible from the browser console
  window.localStream = localStream = stream;
  callButton.disabled = false;
}

function start() {
  trace('Requesting local stream');
  startButton.disabled = true;
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true
  })
  .then(gotStream)
  .catch(function(e) {
    alert('getUserMedia() error: ' + e.name);
  });
}

//create our main instance
window.pc1 = pc1 = new RTCPeerConnection({
  'iceServers': [{
    'urls': 'stun:stun.example.org'
  }]
});

start();

pc1.onaddstream = gotRemoteStream;

function call() {
  callButton.disabled = true;
  hangupButton.disabled = false;
  trace('Starting call');
  startTime = window.performance.now();
  var videoTracks = localStream.getVideoTracks();
  var audioTracks = localStream.getAudioTracks();
  if (videoTracks.length > 0) {
    trace('Using video device: ' + videoTracks[0].label);
  }
  if (audioTracks.length > 0) {
    trace('Using audio device: ' + audioTracks[0].label);
  }
  var servers = null;
  // Add pc1 to global scope so it's accessible from the browser console


  trace('Created local peer connection object pc');
  pc1.onicecandidate = function(e) {
    console.log(e);
    if (e.candidate)
    socket.emit('add ice candidate',{
      type: "new-ice-candidate",
      target: 'shota',
      candidate: e.candidate
    });
  };


  pc1.addStream(localStream);
  trace('Added local stream to pc1');

  trace('pc1 createOffer start');
  pc1.createOffer(
    offerOptions
  ).then(
    onCreateOfferSuccess,
    onCreateSessionDescriptionError
  );
}

function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function onCreateOfferSuccess(desc) {
  trace('Offer from pc1\n' + desc.sdp);
  trace('pc1 setLocalDescription start');
  pc1.setLocalDescription(desc).then(
    function() {
      onSetLocalSuccess(pc1);
    },
    onSetSessionDescriptionError
  );
  trace('pc2 setRemoteDescription start');

  socket.emit('set description',desc);
  // pc2.setRemoteDescription(desc).then(
  //   function() {
  //     onSetRemoteSuccess(pc2);
  //   },
  //   onSetSessionDescriptionError
  // );
  // Since the 'remote' side has no media stream we need
  // to pass in the right constraints in order for it to
  // accept the incoming offer of audio and video.
  // pc2.createAnswer().then(
  //   onCreateAnswerSuccess,
  //   onCreateSessionDescriptionError
  // );
}

socket.on('set description', function(data,callback) {

  pc1.addStream(localStream);


  pc1.setRemoteDescription(data).then(
      function() {
        console.log('remote description added');
      }
  );

  pc1.createAnswer().then(
        onCreateAnswerSuccess,
        onCreateSessionDescriptionError
      )
  

})  

function onSetLocalSuccess(pc) {
  trace(getName(pc) + ' setLocalDescription complete');
}

function onSetRemoteSuccess(pc) {
  trace(getName(pc) + ' setRemoteDescription complete');
}

function onSetSessionDescriptionError(error) {
  trace('Failed to set session description: ' + error.toString());
}

function gotRemoteStream(e) {
  alert('333');
  // Add remoteStream to global scope so it's accessible from the browser console
  window.remoteStream = remoteVideo.srcObject = e.stream;
  trace('pc2 received remote stream');
}

function onCreateAnswerSuccess(desc) {
  trace('Answer from pc2:\n' + desc.sdp);
  trace('pc2 setLocalDescription start');
  socket.emit('set answer desc',desc);

  pc1.setLocalDescription(desc).then(
    function() {
      onSetLocalSuccess(pc2);
    },
    onSetSessionDescriptionError
  );
  
}

socket.on('set answer desc', function(data,callback){ 

  trace('pc1 setRemoteDescription start');
  pc1.setRemoteDescription(data).then(
    function() {
      onSetRemoteSuccess(pc1);
    },
    onSetSessionDescriptionError
  );
})


socket.on('add ice candidate',function (data,callback) {
  pc1.addIceCandidate(
    new RTCIceCandidate(data.candidate)
  );

});
// function onIceCandidate(pc, event) {
//   if (event.candidate) {
//     console.log(getName(pc));
//     console.log(event.candidate);
//     getOtherPc(pc).addIceCandidate(
      
//       new RTCIceCandidate(event.candidate)
//     );
    
//     trace(getName(pc) + ' ICE candidate: \n' + event.candidate.candidate);
//   }
// }


function hangup() { 
  trace('Ending call');
  pc1.close();
  pc2.close();
  pc1 = null;
  pc2 = null;
  hangupButton.disabled = true;
  callButton.disabled = false;
}


function trace(text) {
 
}




