$(function () {

	//DEFINING BUZZ.JS SOUNDS
    var correctSound = new buzz.sound("./assets/audio/correct", {formats: ["ogg", "mp3"]});
    var wrongSound = new buzz.sound("./assets/audio/wrong", {formats: ["ogg", "mp3"]});
    var successSound = new buzz.sound("./assets/audio/success", {formats: ["ogg", "mp3"]});
    
	//DEFINING OTHER VARIABLES
	var isIE = /*@cc_on!@*/ 0; 				// Is the browser Internet Explorer?
	var isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./)
	var c = $('#container');				// The container div
    var rArray = [];						// The array that randomizes the cards
	var scoreTime = 0;						// Number of seconds
	var scoreFlips = 0;						// Number of flips
	var firstClick = false;					// Is the game started?
	var timeCounter;						// The interval that counts up the seconds
	var startOver = 0;						// Number of restarts
	
    //$(document).bind('touchmove', false);	// Prevent scrolling on touch devices
	FastClick.attach(document.body);		// Prevent iOS 300ms click delay
	
	// Show or hide scores
	if (!settings.showTime) {
		$('.time').hide();
	}
	if (!settings.showFlips) {
		$('.flips').hide();
	}
	// Initiate game only if the number of cards are even pairs
	if (isEven(settings.rows * settings.columns)) {
		init();
	} else {
		$('#scores p').text('Antalet brickor �r udda, �ndra i inst�llningarna.');
	}
	// Initiate game
	function init() {
		// Distribute cards
		for (var x = 0; x < settings.rows; x++) {
			var table = $('table').prepend('<tr class="row row' + (x + 1) + '"></tr>');
			var r = $('.row' + (x + 1));
			for (var y = 0; y < settings.columns; y++) {
				r.prepend('<td class="cell flip-container"></td>');
			}
		}
		// Shuffle numbers
		var nr = 0;
		for (var i = 0; i < (settings.rows * settings.columns); i++) {
			if (nr == (settings.rows * settings.columns) / 2) {
				nr = 0;
			}
			rArray.push(nr + 1);
			nr++;
		}
		rArray = $.shuffle(rArray);
		// Insert images according to shuffled array
		$('.cell').each(function (i) {
			$(this).prepend('<div class="flipper" data-nr="' + rArray[i] + '"><div class="front"><img src="images/card.jpg"></div><div class="back"><img src="images/' + rArray[i] + '.jpg")</div></div>');
		});
	}
	// Make adaptive
	$(window).load(cellSize);
	$(window).resize(cellSize);

	function cellSize() {
		var cellW = $('td').width();
		$('.cell').css('height', cellW);
		$('img').css({
			'width': cellW,
			'height': cellW
		});
	}
	// Bind click events (depending on browser)
	$('.cell').bind('click', function () {
		if (isIE || isIE11) {
			clickHandlerIE($(this));
		} else {
			clickHandler3d($(this));
		}
	});
	// Click handler for IE only
	function clickHandlerIE($this) {
		// Start game timer if this is the first click
		if (!firstClick) {
			scoreTimerStart();
			firstClick = true;
		}
		$('.cell').unbind('click'); // Unbind click events while animating
		$this.find('.front')
			.addClass('active')
			.addClass('done')
			.fadeOut(200, function () {
				var flipped = $('table').find('.active');
				var done = $('table').find('.done');
				// If two cards are flipped
				if (flipped.length >= 2) {
					scoreFlipsUp();
					var nr1 = $(flipped[0]).parent().data('nr');
					var nr2 = $(flipped[1]).parent().data('nr');
					// If the two cards match
					if (nr1 == nr2) {
						flipped.removeClass('active').addClass('done');
						flipped.closest('.flip-container').removeClass('cell');
						$('.cell').bind('click', function () {
							clickHandlerIE($(this));
						});
						// If the game is done
						if (done.length >= settings.rows * settings.columns) {
							scoreRestore();
							scoreTimerRestore();
							setTimeout(flipBackIE, 1000);
							successSound.play();
							// If there are cards left
						} else {
							correctSound.play();
						}
						// If the cards do not match
					} else {
						setTimeout(function () {
							flipped.removeClass('active').removeClass('done').fadeIn(200);
							$('.cell').bind('click', function () {
								clickHandlerIE($(this));
							});
						}, 500);
						wrongSound.play();
					}
					// If only one card is flipped
				} else {
					$('.cell').bind('click', function () {
						clickHandlerIE($(this));
					});
				}
			});
	}
	// Flip back function for IE ONLY
	function flipBackIE() {
		startOver++;
		// Flip back cards one by one
		var interval = setInterval(function () {
			var cards = $('.done');
			var cardsLeft = cards.length;
			var randomNr = Math.floor(Math.random() * cardsLeft);
			$(cards[randomNr]).closest('.flip-container').addClass('cell');
			$(cards[randomNr]).removeClass('done').fadeIn(200);
			// When all cards are flipped back
			if (cards.length < 1) {
				setTimeout(function () {
					clearInterval(interval);
					$('.cell').unbind('click');
					$('.cell').bind('click', function () {
						clickHandlerIE($(this));
					});
					$('.flipper').shuffleDOM();
				}, 500);
			}
		}, 100);
	}
	// Click handler for decent browsers
	function clickHandler3d($this) {
		// Start game timer if this is the first click
		if (!firstClick) {
			scoreTimerStart();
			firstClick = true;
		}
		// Flip only if the card is not already flipped
		if (!$this.hasClass('active')) {
			$this.addClass('flip').addClass('active');
			$('.cell').unbind('click');
		}
	}
	// Listens for completed CSS transition
	$('.cell').bind('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function (e) {
		var flipped = $('table').find('.active');
		var done = $('table').find('.flip');
		// If two cards are flipped
		if (flipped.length >= 2) {
			scoreFlipsUp();
			var nr1 = parseInt($(flipped[0]).find('.back img').attr('src').replace(/[^\d.]/g, ''));
			var nr2 = parseInt($(flipped[1]).find('.back img').attr('src').replace(/[^\d.]/g, ''));
			// If the two cards match
			if (nr1 == nr2) {
				flipped.removeClass('cell').removeClass('active');
				$('.cell').bind('click', function () {
					clickHandler3d($(this));
				});
				// If the game is done
				if (done.length >= settings.rows * settings.columns) {
					scoreRestore();
					scoreTimerRestore();
					setTimeout(flipBack3d, 1000);
					successSound.play();
					// If there are cards left
				} else {
					correctSound.play();
				}
				// If the two cards do not match
			} else {
				setTimeout(function () {
					flipped.removeClass('flip').removeClass('active');
					$('.cell').bind('click', function () {
						clickHandler3d($(this));
					});
				}, 500);
				wrongSound.play();
			}
			// If only one card is flipped
		} else {
			$('.cell').bind('click', function () {
				clickHandler3d($(this));
			});
		}
	});
	// Flip back function for decent browsers
	function flipBack3d() {
		startOver++;
		//Flip back cards, one by one
		var interval = setInterval(function () {
			var cards = $('.flip');
			var cardsLeft = cards.length;
			var randomNr = Math.floor(Math.random() * cardsLeft);
			$(cards[randomNr]).addClass('cell').removeClass('flip');
			// When all cards are flipped back
			if (cards.length < 1) {
				clearInterval(interval);
				$('.back').shuffleDOM();
			}
		}, 100);
	}
	// Check if a number is even
	function isEven(value) {
		if (value % 2 == 0)
			return true;
		else
			return false;
	}
	// Increase number of flips
	function scoreFlipsUp() {
		scoreFlips++;
		$('.flips span').text(scoreFlips);
	}
	// Restore number of flips
	function scoreRestore() {
		scoreFlips = 0;
	}
	// Start game timer
	function scoreTimerStart() {
		timeCounter = setInterval(function () {
			scoreTime++;
			$('.time span').text(scoreTime);
		}, 1000);
	}
	// Reset game timer
	function scoreTimerRestore() {
		clearInterval(timeCounter);
		timeCounter = null;
		scoreTime = 0;
		firstClick = false;
	}
});

// SHUFFLE PLUGINS
//--------------------------------------------------------------------------

// Shuffle Array
(function ($) {
    $.fn.shuffle = function () {
        return this.each(function () {
            var items = $(this).children().clone(true);
            return (items.length) ? $(this).html($.shuffle(items)) : this;
        });
    }
    $.shuffle = function (arr) {
        for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
        return arr;
    }
})(jQuery);

// Shuffle DOM elements
(function ($) {
    $.fn.shuffleDOM = function () {
        var allElems = this.get(),
            getRandom = function (max) {
                return Math.floor(Math.random() * max);
            },
            shuffled = $.map(allElems, function () {
                var random = getRandom(allElems.length),
                    randEl = $(allElems[random]).clone(true)[0];
                allElems.splice(random, 1);
                return randEl;
            });
        this.each(function (i) {
            $(this).replaceWith($(shuffled[i]));
        });
        return $(shuffled);
    };
})(jQuery);