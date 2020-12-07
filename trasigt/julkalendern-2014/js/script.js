
function popWin(url,w,h) {
    var top = parseInt((screen.availHeight/2) - (h/2));
    var left = parseInt((screen.availWidth/2) - (w/2));
     window.open(url, "pop","scrollbars=1,toolbar=0,status=0,width="+w+",height="+h+",left=" + left + ",top=" + top + ",screenX=" + left + ",screenY=" + top);
}

/*
$(document).ready(function() {
  swfmacmousewheel.registerObject("julkalendern");
});
*/