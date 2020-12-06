<?php

$name = $_SERVER["QUERY_STRING"];
$file_name = $name . ".mp3";
$file_path = "sound/Namn/" . $file_name;

$first_letter = $name[0];
$does_exist = file_exists($file_path);

$xml = new XMLWriter();
$xml->openMemory();

$xml->startDocument("1.0", "UTF-8");

$xml->startElement("xsounds");
$xml->startAttribute("id");
$xml->text("USER");
$xml->endAttribute();

$xml->startElement("soundpath");
$xml->startAttribute("url");
$xml->text("Namn/");
$xml->endAttribute();
$xml->endElement();

$xml->startElement("simplesound");
$xml->startAttribute("id");
$xml->text("PLAYERNAME");
$xml->endAttribute();
$xml->startAttribute("url");
if ($does_exist)
	$xml->text($file_name);
else
	$xml->text("lilla_" . $first_letter . ".mp3");
$xml->endAttribute();
$xml->endElement();

if (!$does_exist)
{
	$xml->startElement("simplesound");
	$xml->startAttribute("id");
	$xml->text("LETTER");
	$xml->endAttribute();
	$xml->startAttribute("url");
	$xml->text($first_letter . ".mp3");
	$xml->endAttribute();
	$xml->endElement();
	
	$xml->startElement("simplesound");
	$xml->startAttribute("id");
	$xml->text("LETTERNAME");
	$xml->endAttribute();
	$xml->startAttribute("url");
	$xml->text("letter_" . $first_letter . ".mp3");
	$xml->endAttribute();
	$xml->endElement();
}

$xml->startElement("set");
$xml->startAttribute("path");
$xml->text("/REC");
$xml->endAttribute();
$xml->startAttribute("key");
$xml->text("differentName");
$xml->endAttribute();
$xml->startAttribute("value");
if ($does_exist)
	$xml->text("0");
else
	$xml->text("1");
$xml->endAttribute();
$xml->endElement();

$xml->endElement(); // </xsounds>

echo $xml->outputMemory();