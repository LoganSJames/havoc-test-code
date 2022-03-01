var jsAnimalSounds = (function (jspsych) {
  "use strict";

  const info = {
    name: "animal-sounds",
    parameters: {
      image_1: {
        type: jspsych.ParameterType.IMAGE,
        default: undefined,
      },
      audio_1: {
        type: jspsych.ParameterType.AUDIO,
        default: undefined,
      },
      image_2: {
        type: jspsych.ParameterType.IMAGE,
        default: undefined,
      },
      audio_2: {
        type: jspsych.ParameterType.AUDIO,
        default: undefined,
      },
      order: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
      },
      listen_instr: {
        type: jspsych.ParameterType.STRING,
        default: 'Listen to both sounds',
      }
    },
  };

  /**
   * **animal-sounds**
   *
   * Plays 2 sounds produced by two animals, lets the user
   * choose the one they prefer.
   *
   * @author Isaac Kinley
   * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
   */
  class AnimalSoundsPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      var trial_data = {};
      var selection_start_time;

      // Get important screen dimensions and divisions
      var div_ppn = 0.6;
      var s = {h: document.body.clientHeight, w: document.body.clientWidth}; // Just for brevity
      s.m = Math.min(s.w, s.h);
      var btn_ppn = s.h * (1 - div_ppn);
      var img_ppn = s.h * div_ppn;

      // Containers for nodes on either side of the screen
      var left_side = [];
      var right_side = [];

      // Load audio
      var audio_ended = false;
      var context = this.jsPsych.pluginAPI.audioContext();
      var audio_1;
      var audio_2;
      var audio_1_loaded = false;
      var audio_2_loaded = false;
      this.jsPsych.pluginAPI
        .getAudioBuffer(trial.audio_1)
        .then((buffer) => {
          if (context !== null) {
            audio_1 = context.createBufferSource();
            audio_1.buffer = buffer;
            audio_1.connect(context.destination);
          } else {
            audio_1 = buffer;
            audio_1.currentTime = 0;
          }
          audio_1_loaded = true;
          if (audio_1_loaded & audio_2_loaded) {
            ctrl_fcn('start');
          }
        })
        .catch((err) => {
          console.error(
            `Failed to load audio file "${trial.audio_1}". Try checking the file path. We recommend using the preload plugin to load audio files.`
          );
          console.error(err);
        });
      this.jsPsych.pluginAPI
        .getAudioBuffer(trial.audio_2)
        .then((buffer) => {
          if (context !== null) {
            audio_2 = context.createBufferSource();
            audio_2.buffer = buffer;
            audio_2.connect(context.destination);
          } else {
            audio_2 = buffer;
            audio_2.currentTime = 0;
          }
          audio_2_loaded = true;
          if (audio_1_loaded & audio_2_loaded) {
            ctrl_fcn('start');
          }
        })
        .catch((err) => {
          console.error(
            `Failed to load audio file "${trial.audio_2}". Try checking the file path. We recommend using the preload plugin to load audio files.`
          );
          console.error(err);
        });

      // Prep buttons
      var btn = document.createElement('button');
      btn.className = 'jspsych-btn';
      btn.style.position = 'absolute';
      btn.style.visibility = 'hidden';
      btn.style.borderRadius = '50%'; // make circular
      var btn_diam = Math.round(0.8 * btn_ppn);
      btn.style.height = btn_diam + 'px';
      btn.style.width = btn_diam + 'px';
      btn.style.fontSize = Math.round(s.m/15) + 'px';
      btn.style.top = (img_ppn + btn_ppn/2 - btn_diam/2)  + 'px';
      var btn1 = btn.cloneNode();
      var btn2 = btn.cloneNode();
      btn1.innerText = 'A';
      btn2.innerText = 'B';
      btn1.style.left = Math.round(s.w/4 - btn_diam/2) + 'px';
      btn2.style.left = Math.round(3*s.w/4 - btn_diam/2) + 'px';
      display_element.appendChild(btn1);
      display_element.appendChild(btn2);
      left_side.push(btn1);
      right_side.push(btn2);
      function selection_made(key) {
        trial_data.rt = Date.now() - selection_start_time;
        trial_data.selection = key;
        ctrl_fcn('end trial');
      }

      // Prep instructions
      var p = document.createElement('p');
      // p.className = 'jspsych-p';
      p.innerText = trial.listen_instr;
      display_element.appendChild(p);

      // Prep images
      var img = new Image();
      img.style.position = 'absolute';
      img.style.visibility = 'hidden';
      img.style.height = Math.round(img_ppn * 0.6) + 'px';
      img.style.top = Math.round(img_ppn/2 - parseInt(img.style.height)/2) + 'px';
      var img1 = img.cloneNode();
      left_side.push(img1);
      var img2 = img.cloneNode();
      right_side.push(img2);
      img1.onload = function() {
        display_element.appendChild(img1);
        img1.style.left = Math.round(s.w/4 - img1.width/2) + 'px';
      }
      img2.onload = function() {
        display_element.appendChild(img2);
        img2.style.left = Math.round(3*s.w/4 - img2.width/2) + 'px';
      }
      img1.src = trial.image_1;
      img2.src = trial.image_2;

      // Prep canvases on top for animations
      var cnv = document.createElement('canvas');
      cnv.style.position = 'absolute'
      cnv.style.top = '0px';
      // cnv.style.border = '1px solid black';
      cnv.style.height = Math.round(img_ppn) + 'px';
      cnv.height = parseInt(cnv.style.height);
      cnv.style.width = Math.round(s.w*0.49) + 'px';
      cnv.width = parseInt(cnv.style.width);
      var cnv1 = cnv.cloneNode();
      var cnv2 = cnv.cloneNode();
      cnv1.style.left = '0px';
      cnv2.style.left = Math.round(s.w*0.5) + 'px';
      display_element.appendChild(cnv1);
      display_element.appendChild(cnv2);
      left_side.push(cnv1);
      right_side.push(cnv2);
      var ctx1 = cnv1.getContext('2d');
      var ctx2 = cnv2.getContext('2d');
      ctx2.translate(cnv2.width, 0);
      ctx2.scale(-1, 1);

      // Prepare animation functions
      var anim_durat = 3000; // 3-second animations
      function restore_img(curr, ur) {
        var props = ['top', 'left', 'height', 'width'];
        var i, prop;
        for (i = 0; i < props.length; i++) {
          prop = props[i];
          curr.style[prop] = ur.style[prop];
        }
      }
      function image_animation(which, img, ur, start_time, audio) {
        var elapsed = Date.now() - start_time;
        if (which == 'jump') {
          img.style.top = Math.round(parseInt(ur.style.top) * (1 - 0.2*Math.abs(Math.sin((elapsed)/120)))) + 'px';
        } else if (which == 'slide') {
          img.style.left = Math.round(parseInt(ur.style.left) + (s.w*0.01*Math.sin((elapsed)/60))) + 'px';
        }
        if (audio_ended) {
          restore_img(img, ur);
        } else {
          window.requestAnimationFrame(function() {
            image_animation(which, img, ur, start_time, audio);
          });
        }
      }
      var sound_animations = {
        lines: function(cnv, ctx, start_time) {
          var curr_time = Date.now();
          var elapsed = curr_time - start_time;
          var n_lines = Math.floor(elapsed / 200) + 1;
          n_lines = ((n_lines % 4) + 4) % 4; // modulo
          ctx.clearRect(0, 0, cnv.width, cnv.height);
          var i;
          for (i = 1; i <= n_lines; i++) {
            ctx.beginPath();
            ctx.arc(parseInt(cnv.style.width)/2, parseInt(cnv.style.height)/2, parseInt(cnv.style.height)*0.3 + i * 10, 1.6*Math.PI, 1.9*Math.PI);
            ctx.stroke();
          }
          if (audio_ended) {
            ctx.clearRect(0, 0, cnv.width, cnv.height);
          } else {
            window.requestAnimationFrame(function() {
              sound_animations.lines(cnv, ctx, start_time);
            });
          }
        }
      }
      function set_vis(elements, state) {
        var i;
        for (i = 0; i < elements.length; i++) {
          elements[i].style.visibility = state;
        }
      }

      // Control flow for the trial
      function ctrl_fcn(ctrl) {
        if (ctrl == 'start') {
          setTimeout(
            function() {
              ctrl_fcn('play left');
            },
            1000
          );
        } else if (ctrl == 'play left') {
          audio_ended = false;
          audio_1.addEventListener(
            'ended',
            function() {
              audio_ended = true;
              setTimeout(
                function() {
                  ctrl_fcn('play right');
                },
                1000
              )
            }
          );
          set_vis(right_side, 'hidden');
          set_vis(left_side, 'visible');
          image_animation('jump', img1, img1.cloneNode(), Date.now(), audio_1);
          sound_animations.lines(cnv1, ctx1, Date.now());
          if (context !== null) {
            audio_1.start(context.currentTime);
          } else {
            audio_1.play();
          }
        } else if (ctrl == 'play right') {
          audio_ended = false;
          audio_2.addEventListener(
            'ended',
            function() {
              audio_ended = true;
              setTimeout(
                function() {
                  ctrl_fcn('begin selection');
                },
                1000
              )
            }
          );
          set_vis(left_side, 'hidden');
          set_vis(right_side, 'visible');
          image_animation('jump', img2, img2.cloneNode(), Date.now(), audio_2);
          sound_animations.lines(cnv2, ctx2, Date.now());
          if (context !== null) {
            audio_2.start(context.currentTime);
          } else {
            audio_2.play();
          }
        } else if (ctrl == 'begin selection') {
          set_vis(left_side, 'visible');
          set_vis(right_side, 'visible');
          p.innerHTML = 'Click the key corresponding to<br>which sound you prefer';

          selection_start_time = Date.now();

          btn1.onclick = function() {
            selection_made('A');
          }
          btn2.onclick = function() {
            selection_made('B');
          }
          document.onkeydown = function(info) {
            var key = info.key.toUpperCase();
            console.log(key);
            if (key == 'A' || key == 'B') {
              document.onkeydown = null;
              selection_made(key);
            }
          }
        } else if (ctrl == 'end trial') {
          var i, k;
          var props =  ['image_1', 'image_2', 'audio_1', 'audio_2', 'order'];
          for (i = 0; i < props.length; i++) {
            var k = props[i]
            trial_data[k] = trial[k];
          }
          // end trial
          jsPsych.finishTrial(trial_data);
        }
      }
    }
  }
  AnimalSoundsPlugin.info = info;

  return AnimalSoundsPlugin;
})(jsPsychModule);