var so = new SWFObject("../../gameheader.swf", "main", "600", "110", "8", "#000000");
so.addVariable("cid", cid);
so.addParam("allowScriptAccess", "always");
so.write("headercontent");	

var so2 = new SWFObject("main.swf", "game", "600", "450", "8", "#000000");
so2.addVariable("cid", cid);
so2.addParam("allowScriptAccess", "always");
so2.write("gamecontent");	

var so3 = new SWFObject("../../gamefooter.swf", "footer", "600", "66", "8", "#000000");
so3.addVariable("cid", cid);
so3.addParam("allowScriptAccess", "always");
so3.write("footercontent");	