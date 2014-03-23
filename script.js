
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

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var requestAnimFrame = window.requestAnimFrame;

// Canvas width and height
var HEIGHT = 360;
var WIDTH = 640;

var SMOOTHING = 0.5;
var FFT_SIZE = 2048;

var BUFFER_SIZE = [
  256,
  512,
  1024,
  2048,
  4096,
  8192,
  16384
];

console.log('hola');

var pinkNoise = function() {
  this.analyser = context.createAnalyser();
  
  this.analyser.connect(context.destination);
  this.analyser.minDecibels = -140;
  this.analyser.maxDecibels = 0;
  
  this.freqs = new Uint8Array(this.analyser.frequencyBinCount);
  this.times = new Uint8Array(this.analyser.frequencyBinCount);
  
  this.isPlaying = false;
  
}
  
pinkNoise.prototype.noiseGenerator = function() {
  var b0, b1, b2, b3, b4, b5, b6;
  b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
  console.log(" Buffer: " + this.bufferSize);
  var node = context.createScriptProcessor(this.bufferSize, 1, 1);
  node.onaudioprocess = function(e) {
      var output = e.outputBuffer.getChannelData(0);
      for (var i = 0; i < this.bufferSize; i++) {
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
}

pinkNoise.prototype.togglePlayback = function() {
  if(this.isPlaying) {
    //Stop playback
    this.noise.disconnect(this.analyser);
  } else {
    qualityRange = document.getElementById('quality');
    this.bufferSize = BUFFER_SIZE[qualityRange.value];
    
    this.noise = this.noiseGenerator();
    // Connect generator
    this.noise.connect(this.analyser);
    requestAnimFrame(this.draw.bind(this));
  }
  this.isPlaying = !this.isPlaying;
}

pinkNoise.prototype.draw = function() {
  this.analyser.smoothingTimeConstant = SMOOTHING;
  this.analyser.fftSize = FFT_SIZE;
  
  // Get the frequency data from the currently playing noise
  this.analyser.getByteFrequencyData(this.freqs);
  this.analyser.getByteTimeDomainData(this.times);
  
  var width = Math.floor(1/this.freqs.length, 10);
  var canvas = document.getElementById('analyserCanvas');
  var drawContext = canvas.getContext('2d');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  // Draw the frequency domain chart.
  for (var i = 0; i < this.analyser.frequencyBinCount; i++) {
    var value = this.freqs[i];
    var percent = value / 256;
    var height = HEIGHT * percent;
    var offset = HEIGHT - height - 1;
    var barWidth = WIDTH/this.analyser.frequencyBinCount;
    var hue = i/this.analyser.frequencyBinCount * 360;
    drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
    drawContext.fillRect(i * barWidth, offset, barWidth, height);
  }

  // Draw the time domain chart.
  /*for (var i = 0; i < this.analyser.frequencyBinCount; i++) {
    var value = this.times[i];
    var percent = value / 256;
    var height = HEIGHT * percent;
    var offset = HEIGHT - height - 1;
    var barWidth = WIDTH/this.analyser.frequencyBinCount;
    drawContext.fillStyle = 'black';
    drawContext.fillRect(i * barWidth, offset, 1, 2);
  }*/

  if (this.isPlaying) {
    requestAnimFrame(this.draw.bind(this));
  }
}

pinkNoise.prototype.getFrequencyValue = function(freq) {
  var nyquist = context.sampleRate/2;
  var index = Math.round(freq/nyquist * this.freqs.length);
  return this.freqs[index];
}

window.onload = function() {
  var sample = new pinkNoise();
  document.querySelector('button').addEventListener('click', function() {
    sample.togglePlayback()
  });
};
