$(function() {
    FastClick.attach(document.body);
    var firstInteraction = true;

    var loadCount = 0,
		numFarts = 16,
		numLoads = 6;

    var reactionSound = new Howl({
        urls: ['audio/reactions.mp3', 'audio/reactions.ogg'],
        sprite: {
            start: [0, 100],
            good1: [0, 4500],
            bad1: [4500, 4500],
            bad2: [9500, 4200],
            bad3: [15500, 3500],
            bad4: [19500, 4000],
            bad5: [24000, 3500],
            good2: [27500, 3800],
            good3: [32000, 2500],
            good4: [34594, 3900],
            good5: [38428, 3800],
            good6: [42300, 2682]
        },
        onload: function() {
            tryLoad();
        },
        onend: function() {
            $('.sprite').css({
				backgroundPosition: '0% 0%',
				width: '200px'
			});

        }
    });

    var loadSound = new Howl({
        urls: ['audio/load.mp3', 'audio/load.ogg'],
        sprite: {
            load1: [0, 1000],
            load2: [1200, 1300],
            load3: [3000, 3200],
            load4: [6400, 1120],
            load5: [7800, 2200],
            load6: [10100, 1600]
        },
        onload: function() {
            tryLoad();
        },
        onend: function() {
            playFart();
        }
    });

    var sound = new Howl({
        urls: ['audio/farts.mp3', 'audio/farts.ogg'],
        sprite: {
            fart1: [0, 1000],
            fart2: [1250, 1000],
            fart3: [3300, 3426],
            fart4: [7000, 2601],
            fart5: [10000, 1500],
            fart6: [11800, 1200],
            fart7: [13400, 780],
            fart8: [15000, 500],
            fart9: [16000, 2500],
            fart10: [24000, 2500],
            fart11: [27000, 500],
            fart12: [28000, 1200],
            fart13: [30000, 1200],
            fart14: [32000, 1500],
            fart15: [34000, 1200],
            fart16: [36000, 3000]
        },
        onload: function() {
            tryLoad();
        },
        onend: function() {
            playReaction();
        }
    });

    function tryLoad() {

        loadCount++;
        if (loadCount > 2) {
            $('.load').fadeOut(300, function() {
                $('.sprite').animate({
                    opacity: 1
                }, 300);
            });
        }
    }

    var rFart, rFartNr;
    $('.sprite').bind('click', function() {
        if (firstInteraction) {
            firstInteraction = false;
        }
        rFartNr = 1+parseInt(Math.random() * numFarts);
        rFart = 'fart'+rFartNr;
        //rFart = farts[rFartNr];

        sound.stop();
        reactionSound.stop();
        loadSound.stop();

        playLoadSound();

        startAnimation();

    });

    function playLoadSound() {
        rLoadNr = 1 + Math.floor((Math.random() * numLoads));
        rLoad = 'load' + rLoadNr;

        loadSound.play(rLoad);
    }

    function playFart() {
        startSmoke();
        sound.play(rFart);
    }

	function playReaction(){
		var badSmell = (Math.floor(Math.random() * 2) > 0) ? true : false;
		var rNr = Math.floor(Math.random() * 2);
		var startPos, xPos, reactionType, num_reactions;

		$('.sprite').css('width', '200');

		if(badSmell){
			startPos = 1000;
			xPos = startPos + (rNr * 200);
			$('.sprite').css('background-position', '-' + xPos + 'px 0%');
			num_reactions = 5;
			reactionType = 'bad';
		}
		else{
			startPos = 1400;
			xPos = startPos + (rNr * 200);
			$('.sprite').css('background-position', '-' + xPos + 'px 0%');
			num_reactions = 6;
			reactionType = 'good';
		}

		if(xPos == 1600){
			$('.sprite').css('width', '250');
		}

		var rReactionNr = 1 + Math.floor(Math.random() * num_reactions);
		var reaction = reactionType + rReactionNr;
		reactionSound.play(reaction);
	}

    var rImgNr;
    function startAnimation() {
        rImgNr = 200 + (200 * (Math.floor(Math.random() * 4)));
        $('.sprite').css('background-position', '-' + rImgNr + 'px 0%');

    }

    function startSmoke() {
        var fart = 'fart' + rFartNr;
        var fartDuration = eval('sound.sprite().' + fart)[1];

        var xOrigin = (rImgNr == 800) ? $('.sprite').offset().left + ($('.sprite').width() / 1.2) : $('.sprite').offset().left + ($('.sprite').width() / 2)
        var yOrigin = $('.sprite').offset().top + ($('.sprite').height() / 2)

        $("body").explosion({
            origin: {
                x: xOrigin,
                y: yOrigin
            },
            particleClass: "smoke",
            particles: fartDuration/80,
            duration: fartDuration,
            radius: 250
        });
    }
});

(function($) {

    $.fn.explosion = function(options) {

        var settings = $.extend({
            particleClass: "particle",
            origin: {
                x: 0,
                y: 0
            },
            particles: 50,
            radius: 100,
            duration: 1000,
            complete: function() {}
        }, options);

        return this.each(function() {
            for (i = 0; i < settings.particles; i++) {
                var particle = $("<div />").addClass(settings.particleClass);
                $(particle).css("position", "absolute");
                $(this).append($(particle));
                $(particle).offset({
                    top: settings.origin.y - $(particle).height() / 2,
                    left: settings.origin.x - $(particle).width() / 2
                });
                $(particle).animate({
                    "margin-top": (Math.floor(Math.random() * settings.radius) - settings.radius / 2) + "px",
                    "margin-left": (Math.floor(Math.random() * settings.radius) - settings.radius / 2) + "px",
                    "opacity": 0
                }, {
                    "duration": Math.floor(Math.random() * settings.duration) + 1000,
                    "complete": function() {
                        $(this).remove();
                    },
                    "easing": 'easeOutCirc'
                });
            }
            settings.complete.call(this);
        });

    };
}(jQuery));
