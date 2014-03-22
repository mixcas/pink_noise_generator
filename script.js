// Code goes here

// Declares cross-browser context class
var contextClass = (window.AudioContext || 
  window.webkitAudioContext || 
  window.mozAudioContext || 
  window.oAudioContext || 
  window.msAudioContext);
if (contextClass) {
  // Web Audio API is available.
  var context = new contextClass();
} else {
  // Web Audio API is not available. Ask the user to use a supported browser.
}

// Pink noise generator
// from: http://noisehack.com/generate-noise-web-audio-api/
var bufferSize = 4096;
var pinkNoise = (function() {
    var b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    var node = context.createScriptProcessor(bufferSize, 1, 1);
    node.onaudioprocess = function(e) {
        var output = e.outputBuffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11; // (roughly) compensate for gain
            b6 = white * 0.115926;
        }
    }
    return node;
})();

window.onload = function() {
  
  var playButton = document.getElementById("playPink");
  var stopButton = document.getElementById("stopPink");

  playButton.addEventListener('click', function(event) {
      pinkNoise.connect(context.destination);
  });
  
  stopButton.addEventListener('click', function(event) {
      pinkNoise.disconnect(context.destination);
  });
  //document.getElementById("playPink").onclick = playPinkNoise;
};  
  
  
  
  
  
  
  
  
  
  
  
  