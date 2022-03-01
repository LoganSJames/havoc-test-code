
jsPsych.plugins["animal-sounds"] = (function() {

  var plugin = {};
  jsPsych.pluginAPI.registerPreload('animal-sounds', 'stimulus', 'audio');

  plugin.info = {
    name: "animal-sounds",
    parameters: {
      image_1: {
        type: jsPsych.plugins.parameterType.IMAGE,
        default: undefined,
      },
      audio_1: {
        type: jsPsych.plugins.parameterType.AUDIO,
        default: undefined,
      },
      image_2: {
        type: jsPsych.plugins.parameterType.IMAGE,
        default: undefined,
      },
      audio_2: {
        type: jsPsych.plugins.parameterType.AUDIO,
        default: undefined,
      },
      order: {
        type: jsPsych.plugins.parameterType.STRING,
        default: undefined,
      },
      image_animation: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'jump',
      },
      sound_animation: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'flash',
      },
      listen_instr: {
        type: jsPsych.plugins.parameterType.STRING,
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
   */
  plugin.trial = function(display_element, trial) {

    display_element.innerHTML = '';
    
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
    var context = jsPsych.pluginAPI.audioContext();
    var audio_1;
    var audio_2;
    var audio_1_loaded = false;
    var audio_2_loaded = false;
    jsPsych.pluginAPI
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
    jsPsych.pluginAPI
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
    btn.disabled = true;
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

    // Prep canvases for images
    var cnv = document.createElement('canvas');
    cnv.style.visibility = 'hidden';
    cnv.style.position = 'absolute';
    var cnv_diam = Math.min(s.w/2, img_ppn);
    cnv.height = cnv_diam;
    cnv.width = cnv_diam;
    cnv.style.top = (img_ppn/2 - cnv.height/2) + 'px';
    var icnv1 = cnv.cloneNode();
    var icnv2 = cnv.cloneNode();
    icnv1.style.left = (s.w/4 - icnv1.width/2) + 'px';
    icnv2.style.left = (s.w*3/4 - icnv2.width/2) + 'px';
    display_element.appendChild(icnv1);
    display_element.appendChild(icnv2);
    ictx1 = icnv1.getContext('2d');
    ictx2 = icnv2.getContext('2d');
    ictx2.translate(icnv2.width, 0);
    ictx2.scale(-1, 1);
    left_side.push(icnv1);
    right_side.push(icnv2);

    // Prep images

    var img1 = new Image();
    var img2 = new Image();
    img1.onload = function() {
      var rsf = Math.min(0.8*icnv1.width/img1.width, 0.8*icnv1.height/img1.height);
      ictx1.drawImage(
        img1,
        icnv1.width/2 - rsf*img1.width/2,
        icnv1.height/2 - rsf*img1.height/2,
        rsf*img1.width,
        rsf*img1.height
      );
    }
    img2.onload = function() {
      var rsf = Math.min(0.8*icnv2.width/img2.width, 0.8*icnv2.height/img2.height);
      ictx2.drawImage(
        img2,
        icnv2.width/2 - rsf*img2.width/2,
        icnv2.height/2 - rsf*img2.height/2,
        rsf*img2.width,
        rsf*img2.height
      );
    }
    img1.src = trial.image_1;
    img2.src = trial.image_2;

    // Prep canvases for animations
    var cnv = document.createElement('canvas');
    cnv.style.visibility = 'hidden';
    cnv.style.position = 'absolute';
    var cnv_diam = Math.min(s.w/2, img_ppn);
    cnv.height = cnv_diam;
    cnv.width = cnv_diam;
    cnv.style.top = (img_ppn/2 - cnv.height/2) + 'px';
    var acnv1 = cnv.cloneNode();
    var acnv2 = cnv.cloneNode();
    acnv1.style.left = (s.w/4 - acnv1.width/2) + 'px';
    acnv2.style.left = (s.w*3/4 - acnv2.width/2) + 'px';
    display_element.appendChild(acnv1);
    display_element.appendChild(acnv2);
    left_side.push(acnv1);
    right_side.push(acnv2);
    var actx1 = acnv1.getContext('2d');
    var actx2 = acnv2.getContext('2d');
    actx2.translate(acnv2.width, 0);
    actx2.scale(-1, 1);

    // Prepare animation functions
    var anim_durat = 3000; // 3-second animations
    function restore_img(curr, ur) {
      var props = ['top', 'left'];
      var i, prop;
      for (i = 0; i < props.length; i++) {
        prop = props[i];
        curr.style[prop] = ur.style[prop];
      }
    }
    function image_animation(which, img, ur, start_time) {
      var elapsed = Date.now() - start_time;
      if (which == 'jump') {
        img.style.top = Math.round(parseInt(ur.style.top) - s.h*0.01*Math.abs(Math.sin((elapsed)/120))) + 'px';
      } else if (which == 'slide') {
        img.style.left = Math.round(parseInt(ur.style.left) + s.w*0.01*Math.sin((elapsed)/60)) + 'px';
      }
      if (audio_ended) {
        restore_img(img, ur);
      } else {
        window.requestAnimationFrame(function() {
          image_animation(which, img, ur, start_time);
        });
      }
    }
    function sound_animation(which, cnv, ctx, start_time) {
      var curr_time = Date.now();
      var elapsed = curr_time - start_time;
      ctx.clearRect(0, 0, cnv.width, cnv.height);
      if (which == 'grow') {
        var n_lines = Math.floor(elapsed / 120) + 1;
        n_lines = ((n_lines % 4) + 4) % 4; // modulo
        var i;
        for (i = 1; i <= n_lines; i++) {
          ctx.beginPath();
          ctx.arc(cnv.width/2, cnv.height/2, cnv.height*0.3 + i * 10, 1.6*Math.PI, 1.9*Math.PI);
          ctx.stroke();
        }
      } else if (which == 'flash') {
        var show = Math.floor(elapsed / 300);
        show = ((show % 2) + 2) % 2; // modulo
        if (show == 0) {
          var i;
          for (i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.arc(cnv.width/2, cnv.height/2, cnv.height*0.3 + i * 10, 1.6*Math.PI, 1.9*Math.PI);
            ctx.stroke();
          }
        }
      }
      if (audio_ended) {
        ctx.clearRect(0, 0, cnv.width, cnv.height);
      } else {
        window.requestAnimationFrame(function() {
          sound_animation(which, cnv, ctx, start_time);
        });
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
        image_animation(trial.image_animation, icnv1, icnv1.cloneNode(), Date.now());
        sound_animation(trial.sound_animation, acnv1, actx1, Date.now());
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
        image_animation(trial.image_animation, icnv2, icnv2.cloneNode(), Date.now());
        sound_animation(trial.sound_animation, acnv2, actx2, Date.now());
        if (context !== null) {
          audio_2.start(context.currentTime);
        } else {
          audio_2.play();
        }
      } else if (ctrl == 'begin selection') {
        set_vis(left_side, 'visible');
        set_vis(right_side, 'visible');
        p.innerHTML = 'Click the key corresponding to<br>which sound you prefer';

        btn1.onclick = function() {
          selection_made('A');
        }
        btn2.onclick = function() {
          selection_made('B');
        }
        btn1.disabled = false;
        btn2.disabled = false;
        selection_start_time = Date.now();
        document.onkeydown = function(info) {
          var key = info.key.toUpperCase();
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

  return plugin;
})();