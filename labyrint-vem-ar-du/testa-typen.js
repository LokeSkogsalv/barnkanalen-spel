/*
 * Game testaTypen
 *
 * The game testaTypen handles all the game logic: reading and parsing the json file,
 * initializing the game, controlling the game state, and managing events
 *
 * © Raketspel 2012, written by Per Ekstig
 */



window.onload = function(){
   	testaTypen = new TestaTypen();

   	$(window).resize(function() {
   	    testaTypen.adjustScaling( );
   	});

	var r = function(){ runStepFrame(); };
	window.setInterval( r, 100 );
}

function runStepFrame() {
    testaTypen.stepFrame();
}


function TestaTypen(){
	this.debug = false;  // set to true to show candidate scores

	this.states = {
        LOADING: "LOADING",
        SHOW_QUESTION: "SHOW_QUESTION",
        SELECT_ANSWER: "SELECT_ANSWER",
        SHOW_MAP: "SHOW_MAP",
        HANDLE_MAP: "HANDLE_MAP",
        HIDE_MAP: "HIDE_MAP",
        LOAD_DIPLOMA: "LOAD_DIPLOMA",
        LOADING_DIPLOMA: "LOADING_DIPLOMA",
        SHOW_DIPLOMA: "SHOW_DIPLOMA",
        ADD_STARS: "ADD_STARS",
        GAMEOVER: "GAMEOVER"
    };
    this.state = this.states.LOADING;

    this.filename = "labyrint";  /* default if f-parameter is missing */
    params = this.getUrlParams();
    if (params['f']) this.filename = params['f'];
	this.filepath = this.filename + "/";

	this.barnTema = ($("#progresstitle").css('visibility') == "hidden");  /* detect if this is barn-tema by checking if css has a progress-title */

	if ($.browser.msie  && jQuery.browser.version < 9) {
	 		$('body').css('width', '730px' );  // IE8 cannot handle @media, force one width
 	}
	this.loadJSON();

	this.defaultFontSize = parseFloat($('body').css('font-size'));
	this.animTime = (new Date()).getTime();
	var ua = navigator.userAgent.toLowerCase();
	this.isAndroid = ua.indexOf("android") > -1;
}


TestaTypen.prototype.adjustScaling = function() {

	var w = $(".outer").width()-3;
	if ($.browser.msie && jQuery.browser.version < 8) w-=10;

	// adjust the pin section:
	if (testaTypen.questions) $("#pins img").attr("style", " width: " + (w/testaTypen.questions.length) + "px; visibility:visible");
	// scale the font-size of question text:
//    $('#qa').css('font-size', (2+testaTypen.defaultFontSize*w/350) + 'px');

	// scale the font-size of answers:
	var fontSize = 4+testaTypen.defaultFontSize* (w+$("#qa .a").width())/900.0;
	if (fontSize<12) fontSize = 12;
   	$('#qa .a').css('font-size', fontSize + 'px');

	// remove the stars if the game is in game-over state:
	if ((testaTypen.state == testaTypen.states.GAMEOVER) && testaTypen.barnTema) {
		$('.starAnim').remove();
		$('.star1').remove();
		$('.star2').remove();
		testaTypen.starAmount = 150;
		testaTypen.state = testaTypen.states.ADD_STARS;
	}
}

TestaTypen.prototype.canPlayCSS3transition = function() {
  if ($.browser.msie) return false;
	return true;
  $ua = ($_SERVER['HTTP_USER_AGENT']).toLowerCase();
  if(stripos($ua,'android') !== false) { // && stripos($ua,'mobile') !== false) {
     return false;
  } else {
    return true;
  }
}


TestaTypen.prototype.getUrlParams = function() {
    var params = {};
    window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (str, key, value) {    params[key] = value; });
    return params;
}

TestaTypen.prototype.loadJSON = function() {
    $.getJSON(this.filepath + this.filename + ".json",function(data) {
        testaTypen.json = data;
		testaTypen.questions = data.questions;    	// save the array of questions
		testaTypen.candidates = data.candidates;  	// save the array of candidates
		testaTypen.currentQuestion = 0;
		testaTypen.showThumbs = data.showThumbs;

		testaTypen.siteCatalyst = data.siteCatalyst || {};	//get SiteCatalyst info

	    for (i = 0; i < testaTypen.candidates.length; i++) {
			testaTypen.candidates[i].score = 0;		// every candidate starts with score = 0
			testaTypen.candidates[i].excluded = false;
			testaTypen.candidates[i].toBeExcluded = false;
  	   	}
  	   	// we know the number of questions so now we can create the pins:
		for (i=0;i<testaTypen.questions.length;i++) {
			var pin = $('<img/>');
			pin.attr("id", "pin" + i );
			if ($.browser.msie) {
				pin.addClass("iepin");
			} else {
				if (i==0) pin.addClass("leftpin");
				if ((i>0) && (i<testaTypen.questions.length-1)) pin.addClass("middlepin");
				if (i==testaTypen.questions.length-1) pin.addClass("rightpin");
			}
// left  border-width:1px 0px 1px 1px;

// right:   border-width:1px 1px 1px 0px;
// selected: 	background:#92A3B1;

			$('#pins').append(pin);
		}

		if (testaTypen.showThumbs) $("#candidates-title").text(data.titleThumbs);
		if (!$.browser.msie) $('title').text(data.title); 		// set the title of the window
		if (testaTypen.showThumbs)
			testaTypen.initCandidateView(testaTypen.candidates);
		else
			$('#hide-button').attr('style', 'visibility: hidden');


		$('#cs').mousedown(function() {
		 	testaTypen.hideCandidateView();
		});
		testaTypen.state = testaTypen.states.SHOW_QUESTION;
	//	testaTypen.stepFrame();


	});

}


TestaTypen.prototype.initCandidateView = function(candidates){
	// will create an element in the grid for each candidate
	// each element has an image and a crossed-image that is invisible from start
	for (i = 0; i < candidates.length; i++) {
		var candidateID = candidates[i].id;
		var candidateElement = $("<div/>");
		candidateElement.addClass("c");
		candidateElement.attr("id", "c" + candidateID);
		var img = $("<img/>");
		var tFilename = candidates[i].thumbImage;
		if (tFilename.indexOf(":") == -1) tFilename = testaTypen.filepath + tFilename;
		img.attr("src", tFilename);
		candidateElement.append(img);
		$("#cs-grid").append(candidateElement)	;  /* add the button to the candidate section, but keep the restartbutton at the bottom */
	    $('#restartbutton').attr('style', 'visibility: hidden');
		var crossedElement = $("<div/>");
		crossedElement.addClass("crossed");
		crossedElement.attr("id", "cross" + candidateID);
		var img = $("<img/>");
		img.attr("src", "bilder/quiz_web/crossed.png");
		crossedElement.append(img);
		candidateElement.append(crossedElement)	;
		if ($.browser.msie  && jQuery.browser.version < 9) $('#cross' + candidateID).find("img").attr("style", "visibility: hidden");
     }
}

TestaTypen.prototype.hideCandidateView = function(){
	// when the small arrow-button is clicked - hide the candidate quickly
	this.skipAnim = true;

}


TestaTypen.prototype.showQuestion = function(){
	// show the current question
   	testaTypen.removeQuestion();
	$("#qa").attr( 'style', 'opacity: 1' );

	var question = document.getElementById("questiontext");
	question.innerHTML = testaTypen.questions[testaTypen.currentQuestion].text;

	if (!testaTypen.barnTema) $('#progresstitle').text("FRÅGA " + (testaTypen.currentQuestion+1) + " AV " + (testaTypen.questions.length));

	if ($.browser.msie  && jQuery.browser.version < 8) {
 		$('#progresstitle').attr('style', 'left: 5%' );
 	}
	$("#questiontext").attr( 'style', 'visibility:visible' );
}


TestaTypen.prototype.hideQuestion = function() {

	if (!this.isAndroid) {
		$("#qa").attr( 'style', 'opacity: 0' );
	} else 	testaTypen.removeQuestion();

}

TestaTypen.prototype.removeQuestion = function() {
	var questionLayer = document.getElementById("qa1");
	if(questionLayer.hasChildNodes() && questionLayer.childNodes.length>1) {
	    while(questionLayer.childNodes.length>2) {
			questionLayer.removeChild(questionLayer.lastChild);
	    }
	}
	$("#questiontext").text("");
	$('#progresstitle').text("");
}

TestaTypen.prototype.showAnswers = function(){
	// inject a text element for each answer
	var question = this.questions[this.currentQuestion];
    for (i = 0; i < question.answers.length; i++) {
  		var a = $('<a/>');
		a.attr('href',"javascript:testaTypen.clickAnswer(" + i + ")");
    	a.attr("id", "a" + (i+1) );
		$('#qa1').append(a);
		if (question.type == "image")  {
  			var img = $('<img/>');
			var tFilename =  question.answers[i].image;
			if (question.answers[i].image == null) alert("Bild saknas för fråga " + (i+1) +" alternativ " + (i+1)  );
			if (tFilename.indexOf(":") == -1) tFilename = testaTypen.filepath + tFilename;
			img.attr("src", tFilename);
			a.append(img);
	    	a.addClass("a ibtn");
	    } else {
   	    	a.addClass("a tbtn");
		}
		if (i%2 == 1) a.attr("style", "margin-right:0"); // the blocks on the right side do not need margin.
		var p = $('<p/>');
		p.text(question.answers[i].text);
		a.append(p);
	}
	this.adjustScaling();
}



TestaTypen.prototype.clickAnswer = function(answerIndex){
 $('#restartbutton').attr('style', 'visibility: visible');
	if (this.state != this.states.SELECT_ANSWER) return;
	var question = this.questions[this.currentQuestion];
	$("#a" + (answerIndex+1)).addClass('selected');
	if ($.browser.msie) {
		$('#pin' + this.currentQuestion).addClass("ieselected");
	} else {
		$('#pin' + this.currentQuestion).addClass("selected");
	}

	var answer = question.answers[answerIndex];

	for (var candidateID in answer.values) {
		for (i = 0;i<this.candidates.length;i++) {
			var c = this.candidates[i];
			if (c.id == candidateID) {
				var weight = (2 - this.currentQuestion / this.questions.length);
				if (!c.excluded) c.score *= 0.75;  // results from older questions means less  ****
				c.score += answer.values[candidateID];
			}
		}
	}

	// sort the candidates by score:
	this.candidates.sort(function(obj1, obj2) {
	  // Ascending: first age less than the previous
	  return obj1.score - obj2.score;
	});

	var excludeNumber = parseInt( (this.candidates.length-1)*(this.currentQuestion+1)/this.questions.length);
	this.excludeList = {};


	for (var i=0;i<this.candidates.length;i++) {
		var c = this.candidates[i];
		c.toBeExcluded = (i<excludeNumber);
		if (i<excludeNumber) c.score -= 2; // make it less chance to come back  //****
		$('div#score_' + this.candidates[i].id).text(this.candidates[i].score.toFixed(1)); //this.candidates[i].score;
	}

	this.animTime = (new Date()).getTime()+150;
	this.state = testaTypen.states.SHOW_MAP;

 	var panelHeight = $("#cs").position().top;
 	var scrollTop = $(window).scrollTop();
 	this.scrollV = (-panelHeight+scrollTop+90);  	// slightly under the progress area
	if ($(window).width()<400)	this.scrollV-=20; 	// higher on mobile

	if (testaTypen.showThumbs) {

		if ($.browser.msie  && jQuery.browser.version < 7)
			$('#cs').attr('style', 'top: ' + this.scrollV + 'px' );  // make the panel slide up
		else {
  			//	$('#cs').removeClass('slide-down');
			//	$('#cs').addClass('slide-up'); 				// the animation

		//		$("#cs").css({"-webkit-transition", "text-shadow 0.25s ease-in-out,font-size 0.25s ease-in-out;"});
		  	var dy = 608;
			if (this.barnTema) {
		  		 dy = 490;
				if ($(".outer").width() > 400) dy= 300;
			} else
				if ($(".outer").width() > 400) dy= 436;

			if (this.canPlayCSS3transition()) {
				$("#cs").CSSAnimate({"transform": "translateY(-" + dy + "px)"},700,"ease-out", "all");
			} else {
				$("#cs").CSSAnimate({top: -dy},500,"ease-in");
			}
		}

		$('#hide-button').attr('style', 'visibility: visible');
	} else {
		this.animTime = (new Date()).getTime() + 600;
	}
}

TestaTypen.prototype.slideOutCS = function() {
	// makes the candidate section slide down
	if ($.browser.msie  && jQuery.browser.version < 7)	$('#cs').attr('style', 'top: 0px' );  // slide out the candidate view

dy = 0;
	if (this.canPlayCSS3transition()) {
			$("#cs").CSSAnimate({"transform": "translateY(" + 0 + "px)"},500,"ease-in", "all");
		} else {
			$("#cs").CSSAnimate({top: dy},500,"ease-in");
	}

	$('#hide-button').attr('style', 'visibility: hidden');
}


TestaTypen.prototype.createDiploma = function(){
	var found = -1;
	for (var i = 0;i<this.candidates.length; i++) {
		if (this.candidates[i].excluded == false)  found = i;
	}
	this.imageFilename = this.candidates[found].diplomaImage;
	if (this.imageFilename.indexOf(":") == -1) this.imageFilename = testaTypen.filepath + this.imageFilename;
	title = this.json.diplomaText;
	if (title.indexOf("@") != -1) title = title.replace("@", this.candidates[found].name);
	$("#diploma-title").text(title);
	$("#diploma-text").text( this.candidates[found].diplomaText );
  	$("#diploma-image").attr("src", this.imageFilename );
	$('#diploma-header').html(this.json.diplomaText);
	$('<img />')
   	 	.attr('src', testaTypen.imageFilename)
   		.load(function(){
		testaTypen.state = testaTypen.states.SHOW_DIPLOMA;
    });
}

TestaTypen.prototype.addStars = function(){
	// add animates stars for the childrens theme

	var a = $('<div/>');
   	var star_id = parseInt(1+Math.random()*6) ;
   	var starSize = 50;
   	var starFolder = "barn_web";
   	if ($("#cs").width()<600) {
   		starFolder = "barn_mobil";
   		starSize = 25;

   	}
	var diplomaWidth = 	$("#diploma-image").width();
	var diplomaHeight = $("#diploma-image").height();
	var diplomaLeft = 0.03*diplomaWidth-starSize*0.5;
	var diplomaTop = $("#diplom").position().top-starSize*0.5;
	var variation = parseInt(starSize*0.5 * (Math.random()-0.5));
	var tx = diplomaLeft + parseInt(diplomaWidth*Math.random());
	var ty = diplomaTop + parseInt(diplomaHeight*Math.random());
	switch (parseInt(1+Math.random()*4)) {
		case 1:	tx = diplomaLeft + variation; break;
		case 2:	tx = diplomaLeft +  diplomaWidth + variation; break;
		case 3:	ty = diplomaTop + variation; break;
		case 4:	ty = diplomaTop + diplomaHeight + variation; break;
	}

   	a.attr("id", "star" + star_id );
   	a.attr( 'style', 'left:' + tx + 'px; top:' + ty + 'px; width:' + starSize + 'px;height:' + starSize + 'px;background-image:url("bilder/' + starFolder + '/star' + star_id + '.png" );margin:0;position:absolute;');

	if ($.browser.msie  && jQuery.browser.version < 8) {
		// no anim for IE7
	} else {
	 	a.addClass('starAnim'); // the animation
	 	a.addClass('star' + parseInt(1+Math.random()*2)); // the animation
 	}
	$('#diplom').append(a);
 }


TestaTypen.prototype.stepFrame = function(){
	// main frame-loop with state-machine

		switch (this.state) {
		case this.states.LOADING:
			break;

		case this.states.SHOW_QUESTION:

			this.skipAnim = false;
			this.showQuestion();
			this.showAnswers();
			this.adjustScaling();
			this.state = this.states.SELECT_ANSWER;
//			this.state = this.states.LOAD_DIPLOMA;
			break;

		case this.states.SELECT_ANSWER:
			break;

		case this.states.SHOW_MAP:
			if ((new Date()).getTime()>this.animTime) {
				$("body").scrollTop(0);  // scroll up to the top of the page
				if (this.showThumbs) {

				} else {
					this.skipAnim = true;
				}
				this.animTime = (new Date()).getTime()+300+500;  /* wait a sec before the panel slides up */
				this.hideQuestion();
				this.state = this.states.HANDLE_MAP;


			}
			break;

		case this.states.HANDLE_MAP:
			if (this.skipAnim==true) this.animTime = (new Date()).getTime()-1;
			if ((new Date()).getTime()>this.animTime ) {
				var found = -1;

				for (var i = 0;i<this.candidates.length; i++) {    	// Find a candidate to exclude
					if ((this.candidates[i].excluded == false) && (this.candidates[i].toBeExcluded == true)) found = i;
				}
				if (found >=0) {									// Found a candidate to exclude
					this.animTime = (new Date()).getTime()+600; /* how long time (ms) to wait between crossed candidates */
					var foundID = this.candidates[found].id;
		//			console.log("found a candidate to exclude:" + foundID);
		//			 $("#c" + foundID).addClass('showcross');		// Will show the cross on the candidate
				//	$("#c" + foundID).CSSAnimate({ opacity: 0.92},500,"ease-in", "all");
					$("#c" + foundID).find("img").CSSAnimate({ opacity: 0.92}, 500,"ease-in", "all");  // visar korset

					this.candidates[found].excluded = true;
					if ($.browser.msie  && jQuery.browser.version < 9) {	// IE could not do the transition
						$('#cross' + foundID).find("img").attr("style", "visibility: visible");
					}
				} else {
					for (var i = 0;i<this.candidates.length; i++) {	// Check is there is a candidate that should come back from beeing excluded
						if ((this.candidates[i].excluded == true) && (this.candidates[i].toBeExcluded == false)) found = i;
					}
					if (found >=0) {
						this.animTime = (new Date()).getTime()+800; /* how long time (ms) to wait after a candidate came back */
						var foundID = this.candidates[found].id;
			//			console.log("found a candidate to un-exclude:" + foundID);
					//	 $("#c" + foundID).removeClass('showcross');

				   		if ($.browser.msie  && jQuery.browser.version < 9) {	// IE could not do the transition
							$('#cross' + foundID).find("img").attr("style", "visibility: hidden");
						} else {
							// it is a problem that the previous CSS animation was never removed properly
							// work-around: remove the entire crossed-element, and add it again, and then add the new transision

							candidateElement = $("#c" + foundID);
							$('#cross' + foundID).remove();

							var crossedElement = $("<div/>");
							crossedElement.addClass("crossed");
							crossedElement.attr("id", "cross" + foundID);
							var img = $("<img/>");
							img.attr("src", "bilder/quiz_web/crossed.png");
							img.attr( 'style', 'opacity: 0.92' );
							crossedElement.append(img);
							candidateElement.append(crossedElement)	;
							img.CSSAnimate({ opacity: 0 }, 500,"ease-in", "all");
						}
						this.candidates[found].excluded = false;
					} else {
						this.animTime = (new Date()).getTime()+500;      /* how long time (ms) to wait until the panel slides down */
						this.state = this.states.HIDE_MAP;			// no more candidate to change, let's close the candidate view
					}
				}
			}
			break;

		case this.states.HIDE_MAP:

			if (this.skipAnim==true) this.animTime = (new Date()).getTime()-1;
			if ((new Date()).getTime()>this.animTime) {
				if (this.debug) this.currentQuestion = 10;
				if (this.currentQuestion < this.questions.length-1) {
				  	this.currentQuestion++;
				  	this.skipAnim = false;
					this.showQuestion();
					this.showAnswers();
					this.state = this.states.SELECT_ANSWER;
					if (testaTypen.showThumbs) this.slideOutCS();

				} else {
					this.hideQuestion();
					testaTypen.removeQuestion();
					this.animTime = (new Date()).getTime()+600;
//					$('#cs').attr('style', 'visibility: hidden');
					$("#cs").remove();
					if (testaTypen.showThumbs) this.slideOutCS();
					this.state = this.states.LOAD_DIPLOMA;
				}
			}
			break;

		case this.states.LOAD_DIPLOMA:
			if ((new Date()).getTime()>this.animTime) {
				this.state = this.states.LOADING_DIPLOMA;
				this.createDiploma();
				if ($.browser.msie  && jQuery.browser.version < 9) this.state = this.states.SHOW_DIPLOMA; // dont wait for preload on explorer, otherwise the diploma will not show the 2nd time


			}
			break;

		case this.states.SHOW_DIPLOMA:
			$('#diplom').attr( 'style', 'opacity: 1;visibility:visible' );
			$('#diplom').addClass('bounceIn'); // the animation
			if (this.barnTema	) {

				this.starAmount = 80;
				this.animTime = (new Date()).getTime()+1300;
				this.state = this.states.ADD_STARS;
			} else {
				this.state = this.states.GAMEOVER;
			}
			break;

		case this.states.ADD_STARS:
			if ((new Date()).getTime()>this.animTime) {
				for (var i=0;i<15;i++) {
					this.starAmount--;
					if (this.starAmount>=0) this.addStars();
				}
				if (this.starAmount<=0) this.state = this.states.GAMEOVER;
			}
			break;
	}

};
