
/* create timeline */
var timeline = [];

timeline.push({
  type: 'html-button-response',
  stimulus: 'Click to begin',
  choices: ['<p style="font-size:5vw; color:green;">BEGIN</p>'],
});

var mammal_stim = jsPsych.randomization.sampleWithReplacement(mammal_list, 4);
var frog_stim = jsPsych.randomization.sampleWithReplacement(frog_list, 4);
var insect_stim = jsPsych.randomization.sampleWithReplacement(insect_list, 4);
var bird_stim = jsPsych.randomization.sampleWithReplacement(bird_list, 4);
var stim_list = mammal_stim.concat(frog_stim,insect_stim,bird_stim);
var trial_stim = jsPsych.randomization.shuffle(stim_list);

//var trial_stim = jsPsych.randomization.sampleWithReplacement(stim_list, 12);

var i, curr_trial, curr_im;
for (i = 0; i < trial_stim.length; i++) {
	curr_im = trial_stim[i].Category.toLowerCase() + '.svg';
	curr_trial = {
		type: 'animal-sounds',
		image_1: 'img/' + curr_im,
		image_2: 'img/' + curr_im,
		audio_1: 'sounds/' + trial_stim[i].Sound1 + '.mp3',
		audio_2: 'sounds/' + trial_stim[i].Sound2 + '.mp3',
		order: trial_stim[i].Quality,
		image_animation: jsPsych.randomization.sampleWithReplacement(['jump', 'slide'], 1),
		sound_animation: jsPsych.randomization.sampleWithReplacement(['grow', 'flash'], 1),
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
				if (((selections[j] == 'A') & (orders[j] == 'AB')) | ((selections[j] == 'B') & (orders[j] == 'BA'))) {
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
			trial.stimulus = "Your preferences weren't similar to those of any of the animals!";
		} else {

			trial.stimulus = 'Your preferences were most similar to those of ' + max_cat + 's!</br><img src="./img/'+max_cat.toLowerCase()+'.svg"></img>';
		}

		// Display info from each trial
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

	}
}

timeline.push(info_trial);

/* start the experiment */
jsPsych.init({
  timeline: timeline
});
