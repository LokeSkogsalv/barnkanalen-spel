
def write_url(name, file, i):
	file.write("https://media.svt.se/spel/gyllene-knorren/video/gylleneknorren/assets/guests/" + str(i) + "/" + name + ".f4v\n")

with open("files.txt", "w") as f:
	for i in range(1, 23):
		write_url("incheckning_1", f, i)
		write_url("incheckning_2", f, i)
		write_url("utcheckning", f, i)
		write_url("vill_ha_ETT", f, i)
		write_url("vill_ha_EN", f, i)
		write_url("torstig", f, i)
		write_url("hungrig", f, i)
	