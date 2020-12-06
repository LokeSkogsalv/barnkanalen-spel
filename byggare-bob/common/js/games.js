var games = {};

games = {
	ios: function () {
		var iOS = false,
		p = navigator.platform;

		if( p === 'iPad' || p === 'iPhone' || p === 'iPod' ){
			iOS = true;

			$('#flashcontainer img').remove('img');
			$("#flashcontainer").prepend("<img src='../img/nocomputer.png' alt='Spela på datorn'/>");
		}

	},

	flashWidth:function() {
		$(window).load(function(){
			if ($("#flashcontainer").length > 0){
				$("#flashbackground").css('width','auto');
			} else {
				$("#flashbackground").addClass("flashWidth").css('width',width);
			}
		});
	}
}

$(document).ready(function() {
	games.ios();
	games.flashWidth();
	$('#flashcontainer img.noFlash').show();
});