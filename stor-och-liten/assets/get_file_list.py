#!python3
import os

with open("files.txt", "w") as f:
	for root, dirs, files in os.walk("."):
		for file in files:
			filepath = os.path.join(root, file).replace("\\", "/")
			filepath = filepath.lstrip("./")
			url = "https://web.archive.org/web/20140116185930id_/http://downloads.bbc.co.uk/cbeebies/bigandsmall/swf/assets/" + filepath
			f.write(url + "\n")
			print(filepath)
		
input()