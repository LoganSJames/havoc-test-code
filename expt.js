
/* create timeline */
var timeline = [];

timeline.push({
  type: 'html-button-response',
  stimulus: '<div class="imgbox"><img class="center-fit" src="./img/frontPage.png"></div><br/><p class="whiteBack" style="font-size:25px;">Many animals use sounds to attract others.  Here, you will find out which type of animal you are most similar to!</p><br/><p class="whiteBack">You can respond with the keyboard by placing one finger on the F key and one finger on the J key, or you can respond by clicking</p><img style="height:128px;" src="img/keyboard.jpg" alt="Keyboard with the F and J keys highlighted in yellow"/>',
  choices: ['<p style="font-size:5vw; color:green;">BEGIN</p>'],
});

var mammal_stim = jsPsych.randomization.sampleWithReplacement(mammal_list, 4);
var frog_stim = jsPsych.randomization.sampleWithReplacement(frog_list, 4);
var insect_stim = jsPsych.randomization.sampleWithReplacement(insect_list, 4);
var bird_stim = jsPsych.randomization.sampleWithReplacement(bird_list, 4);
var stim_list = mammal_stim.concat(frog_stim,insect_stim,bird_stim);
var trial_stim = jsPsych.randomization.shuffle(stim_list);

var listenList = ['is more <b>beautiful</b>', 'you <b>prefer</b>', 'you <b>like</b> more','is more <b>enjoyable</b> to hear','is more <b>impressive</b>','would <b>attract</b> that animal','is more <b>interesting</b>','the <b>animal</b> would prefer','the animal would find more <b>impressive</b>'];

var birdWinnerText = '<div class="imgbox"><img class="center-fit" src="./img/birdWinner.png"></div><br/><p class="whiteBack">Birds are highly social creatures, and they use their songs to recognize each other, attract potential mates, and defend their territories. Your brain may have picked up on the subtle differences between songs that can make one song sound more beautiful to other birds! Differences in the <b><i>complexity</b></i> or <b><i>difficulty</b></i> of sounds can be particularly important for birds like the <b>prairie warbler</b> from North America and <b>zebra finch</b> from Australia.</p>'

var insectWinnerText = '<div class="imgbox"><img class="center-fit" src="./img/insectWinner.png"></div><br/><p class="whiteBack">Insects produce a marvelous array of sounds. For example, <b>Pacific field crickets</b> in Hawaii and <b>bow-winged grasshoppers</b> in Europe chirp at night to attract mates. Your brain may have picked up on important aspects of <b><i>pitch</i></b> and <b><i>timing</i></b> that are key to how beautiful a song is. Amazingly, a species of <b>tiger moth</b> can produce ultrasonic chirps that confuse echolocating bats that are hunting them!</p>'

var frogWinnerText = '<div class="imgbox"><img class="center-fit" src="./img/frogWinner.png"></div><br/><p class="whiteBack">Mammals, including humans, use a diversity of sounds to communicate. The <b>gelada</b>, a monkey from Ethiopia, uses grunts and hoots to attract mates. The <b>singing mouse</b> from Central America sings a high pitched trill to attract mates. Your brain may have been attuned to the <b><i>variation</i></b> in sound qualities, which is known to be important for many species of mammals.</p>'

var mammalWinnerText = '<div class="imgbox"><img class="center-fit" src="./img/mammalWinner.png"></div><br/><p class="whiteBack">Frogs produce many types of sounds, and most species of frog have a unique call to attract mates. For instance, the <b>hourglass frog</b> from Central and South America makes a “creek” sound, the <b>green tree frog</b> from North America makes a higher pitched “croak” sound, and the <b>túngara</b> frog from Central and South America makes a sound like a laser gun! Your brain may have noticed the <b><i>harmonics</b></i> and <b><i>tempo</b></i> of these calls that are known to be important for frog communication.</p>'

//var trial_stim = jsPsych.randomization.sampleWithReplacement(stim_list, 12);

var i, curr_trial, curr_im;
for (i = 0; i < trial_stim.length; i++) {
	curr_im = trial_stim[i].Category.toLowerCase() + '.png';
  currInstruction = jsPsych.randomization.sampleWithReplacement(listenList,1);
	curr_trial = {
		type: 'animal-sounds',
		image_1: 'img/' + curr_im,
		image_2: 'img/' + curr_im,
		audio_1: 'sounds/' + trial_stim[i].Sound1 + '.mp3',
		audio_2: 'sounds/' + trial_stim[i].Sound2 + '.mp3',
		order: trial_stim[i].Quality,
		image_animation: jsPsych.randomization.sampleWithReplacement(['jump', 'slide'], 1),
		sound_animation: jsPsych.randomization.sampleWithReplacement(['grow', 'flash'], 1),
    listen_instr: '<p style="font-size:1.5vw;">Think about which song ' + currInstruction + '</p>',
    answer_instr: '<p style="font-size:1.5vw;"><i>Click</i> the side or <i>press</i> the key for<br> the song you think ' + currInstruction + '</p>',
		data: {
			category: trial_stim[i].Category,
			species: trial_stim[i].Species
		}
	}
	timeline.push(curr_trial);
}

function saveData(data){
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/animal-sounds/write_data.php'); // 'write_data.php' is the path to the php file described above.
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({filedata: data}));
}

var save_data_trial = {
	type: 'call-function',
	func: function() {
		saveData(jsPsych.data.get().csv())
	}
}

timeline.push(save_data_trial);

var info_trial = {
	type: 'html-keyboard-response',
	stimulus: '',
	choices: [],
	on_start: function(trial) {
		/* Display performance */
		var all_data = jsPsych.data.get();

		// Identify unique categories
		var all_categories = all_data.select('category').values;
		var unique_categories = [];
		var i, j, curr_category, already_in;
		for (i = 0; i < all_categories.length; i++) {
			curr_category = all_categories[i];
			already_in = false;
			for (j = 0; j < unique_categories.length; j++) {
				if (unique_categories[j] == curr_category) {
					already_in = true;
					break;
				}
			}
			if (!already_in) {
				unique_categories.push(curr_category);
			}
		}

		// Get n. correct by category
		var corr_by_cat = [];
		var i, curr_subset, selections, orders, n_correct, n_total, j;
		for (i = 0; i < unique_categories.length; i++) {
			curr_subset = all_data.filter({category: unique_categories[i]});
			selections = curr_subset.select('selection').values;
			orders = curr_subset.select('order').values;
			n_correct = 0;
			n_total = 0;
			for (j = 0; j < curr_subset.count(); j++) {
				if (((selections[j] == 'F') & (orders[j] == 'AB')) | ((selections[j] == 'J') & (orders[j] == 'BA'))) {
					n_correct += 1;
				}
				if ((orders[j] == 'AB') | (orders[j] == 'BA')) {
					n_total += 1;
				}
			}
			corr_by_cat.push({
				cat: unique_categories[i],
				ppn_corr: n_correct / n_total
			});
		}

		// Find highest category by correctness
		var max_ppn = 0;
		var max_cat = 'none';
		var i;
		for (i = 0; i < corr_by_cat.length; i++) {
			if (corr_by_cat[i].ppn_corr > max_ppn) {
				max_ppn = corr_by_cat[i].ppn_corr;
				max_cat = corr_by_cat[i].cat;
			}
		}
		if (max_cat == 'none') {
			var catList = ['Bird','Mammal','Insect','Frog'];
      var rand = random = Math.floor(Math.random() * catList.length);
      max_cat = catList[rand];
		}

		trial.stimulus = 'Congratulations!!  You matched with ' + max_cat + 's!</br>';

    if (max_cat == 'Bird'){
      trial.stimulus += birdWinnerText;
    }
    if (max_cat == 'Mammal'){
      trial.stimulus += mammalWinnerText;
    }
    if (max_cat == 'Frog'){
      trial.stimulus += frogWinnerText;
    }
    if (max_cat == 'Insect'){
      trial.stimulus += insectWinnerText;
    }

    function copyURI(evt) {
        evt.preventDefault();
        navigator.clipboard.writeText(evt.target.getAttribute('href')).then(() => {
          /* clipboard successfully set */
        }, () => {
          /* clipboard write failed */
        });
    }

    trial.stimulus+='<br/><p style="whiteBack"><button onClick="window.location.reload();">Play again</button> or share your result:</p><a href="https://twitter.com/intent/tweet?text=I%20matched%20with%20'+max_cat.toLowerCase()+'s!%20%20Which%20animal%20are%20you?%20https%3A//logansjames.github.io/"><img width="77" height="63" src="./img/twitter.png" alt="Share on Twitter"></a><a href="https://www.facebook.com/sharer/sharer.php?u=https%3A//logansjames.github.io/"><img width="77" height="77" src="./img/fb.png" alt="Share on Facebook"></a>'


		// Display info from each trial
    /*
    var i;
    for (i = 0; i < corr_by_cat.length; i++) {
				trial.stimulus += 'You were ' + Math.round(corr_by_cat[i].ppn_corr * 100) + ' percent similar to '+ corr_by_cat[i].cat + 's</br>';
		}
		trial.stimulus += '<br><br>You listened to recordings of these species:<br>';
		sound_trials = jsPsych.data.get().filter({trial_type: 'animal-sounds'});

    var species_list = [];
		var i;
		for (i = 0; i < sound_trials.count(); i++) {
      if (!species_list.includes(sound_trials.select('species').values[i])) {
        species_list.push(sound_trials.select('species').values[i]);
      }
		}

    var i;
		for (i = 0; i < species_list.length; i++) {
          trial.stimulus += '<div style="border:1px solid black">';
          trial.stimulus += species_list[i];
          trial.stimulus += '</div><br>';
		}
    */

	}
}

timeline.push(info_trial);

/* start the experiment */
jsPsych.init({
  timeline: timeline
});
