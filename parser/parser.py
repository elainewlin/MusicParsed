import os
import json
import urllib2
from bs4 import BeautifulSoup
import argparse
from isChord import isChordLine, isLyricLine, isLabel
from helpers import nameToID, idToData, dataToName, clean

TEXT = "txt"
JSON = "json"
DATA_DIRECTORY = os.path.join(os.path.dirname(os.getcwd()), "static/data")
TEXT_FOLDER = os.path.join(DATA_DIRECTORY, "text")
JSON_FOLDER = os.path.join(DATA_DIRECTORY, JSON)
ALL_SONGS = "ALL_SONGS.json"
ALL_SONGS_PATH = os.path.join(JSON_FOLDER, ALL_SONGS)


def findBetween(s, first, last):
    """
    Find text in s between 2 strings: first, last.
    Used for parsing string of all text on a webpage.
      More readable/understandable than xpath selectors.
    """
    try:
        start = s.index(first) + len(first)
        end = s.index(last, start)
        return s[start:end]
    except ValueError:
        return ""


class URLParser:
    """
    Handles URL --> text file conversion
    """

    def __init__(self, textFolder=TEXT_FOLDER):
        self.textFolder = textFolder

    def soupFromURL(self, url):
        """
        Using BeautifulSoup to read a URL
        url -> BeautifulSoup
        """
        hdr = {"User-Agent": "Mozilla/5.0"}
        req = urllib2.Request(url, headers=hdr)
        f = urllib2.urlopen(req)
        myfile = f.read()
        return BeautifulSoup(myfile, "html5lib")

    def parseURL(self, url):
        """
        URL with song chords -> (title, artist, data)
          data = all chord + lyrics
        1. determine type of URL
        2. applies appropriate HTML parsing
        """

        # Parsing Ultimate Guitar website
        if "ultimate-guitar" in url:
            soup = self.soupFromURL(url)
            data = soup.find("pre", {"class": "js-tab-content"}).getText()
            title = soup.find("h1").getText()[:-7]  # Wonderwall Chords
            artist = soup.find("div", {"class": "t_autor"}).find("a").getText()

        # Parsing Ukutabs website
        if "ukutabs" in url:
            soup = self.soupFromURL(url)
            data = soup.findAll("pre", {"class": "qoate-code"})[-1].getText()

            titleSection = soup.find("span", {"class": "stitlecolor"})
            title = titleSection.getText()
            artistSection = titleSection.parent.parent.next_sibling
            artist = artistSection.find("a").getText()

        return (title, artist, data)

    def toText(self, url):
        (title, artist, data) = self.parseURL(url)

        fileName = dataToName(title, artist, TEXT)
        textFile = os.path.join(self.textFolder, fileName)
        print textFile
        with open(textFile, "w") as outfile:
            outfile.write(data.encode("utf-8"))
        return fileName

    # All song URLs --> all text files of songs
    def allToText(self):
        f = open("urls.txt", "r")
        lines = f.readlines()
        lines = [x.strip() for x in lines]
        for url in lines:
            self.toText(url)


class TextParser:
    """
    Handles text --> JSON conversion
    """

    def __init__(self, textFolder=TEXT_FOLDER):
        self.textFolder = textFolder

    def toJSON(self, fileName):
        """
        Text file of a song --> JSON file of a song
        """
        textFile = os.path.join(self.textFolder, fileName)
        f = open(textFile, "r")
        lines = f.readlines()
        lines = [x.rstrip() for x in lines]
        data = {}

        songID = nameToID(fileName)

        [title, artist] = idToData(songID)
        data["title"] = title
        data["artist"] = artist
        data["id"] = songID
        data["lines"] = []
        print title

        allChords = []

        def updateAllChords(line):
            for chord in line.split():
                # Chords with a bass note
                if "/" in chord:
                    chord = chord.split("/")[0]
                if chord not in allChords:
                    allChords.append(chord)

        linesIter = iter(lines)

        firstLine = lines[0]
        capo = "CAPO "
        if firstLine.startswith(capo):
            data["capo"] = firstLine.split(capo)[1]
            next(linesIter)

        for line in linesIter:
            if isLabel(line):
                data["lines"].append({"label": line})
            elif isChordLine(line):
                while True:
                    next_line = next(linesIter)
                    lyrics = next_line if isLyricLine(next_line) else ""
                    data["lines"].append({"lyrics": lyrics, "chord": line})
                    updateAllChords(line)

                    line = next_line
                    if isLabel(line):
                        data["lines"].append({"label": line})
                        break
                    elif not isChordLine(line):
                        break
            elif line:
                data["lines"].append({"lyrics": line, "chord": ""})
            # FIXME: should we preserve blank lines?

        data["allChords"] = allChords

        title = clean(title)
        artist = clean(artist)
        fileName = dataToName(title, artist, JSON)
        jsonFile = os.path.join(JSON_FOLDER, fileName)
        with open(jsonFile, "w") as outfile:
            json.dump(data, outfile, indent=2, sort_keys=True)

    def allToJSON(self, toConvert):
        """
        Bulk convert text files -> JSON
        Param:
          toConvert = array of text file names
          - each entry is "title - artist.txt"
        """
        for fileName in toConvert:
            self.toJSON(fileName)
        self.getAllSongs()

    def getAllText(self):
        """
        Return:
          array of all text file names in textFolder
          - each entry is "title - artist.txt"
        """
        allText = []
        for fileName in sorted(os.listdir(self.textFolder)):
            if fileName.endswith(TEXT):
                allText.append(fileName)
        return allText

    def getAllModified(self):
        """
        Return:
          array of all modified text files
          - each entry is "title - artist.txt"
        """

        modifiedTextFile = "modified.txt"
        open(modifiedTextFile, "w").close()
        os.system("git status -s >> %s" % modifiedTextFile)
        f = open(modifiedTextFile, "r")
        lines = f.readlines()

        """
        git status output needs to be parsed
        1. remove new line character
        2. remove first 3 characters  " M " or "?? "
        3. remove quotes
        """
        cleanedLines = []
        deleted = " D "

        for l in lines:
            if not l.startswith(deleted):
                cleanedLines.append(l.strip("\n")[3:].replace("\"", ""))
        allModifiedText = []
        for l in cleanedLines:
            textFolder = "text/"
            if textFolder in l and l.endswith(TEXT):
                fileName = l.split(textFolder)[1]
                allModifiedText.append(fileName)
        return allModifiedText

    def getAllSongs(self):
        """
        Updates ALL_SONGS.json with data from all songs
        """
        allSongs = []
        for fileName in sorted(os.listdir(JSON_FOLDER)):
            if fileName == ALL_SONGS:
                continue
            newSong = {}
            songID = nameToID(fileName)
            [title, artist] = idToData(songID)
            # tags = []
            with open(os.path.join(JSON_FOLDER, fileName)) as dataFile:
                data = json.load(dataFile)
                # Song title, called label for jQuery autocomplete
                newSong["label"] = data["title"]
                newSong["artist"] = data["artist"]
                newSong["value"] = data["id"]

            # URL friendly i.e. love_story - taylor_swift
            newSong["id"] = songID

            urlInfo = {
                "title": idToData(songID)[0],
                "artist": idToData(songID)[1]
            }
            newSong["url"] = "/song/{artist}/{title}".format(**urlInfo)
            allSongs.append(newSong)
        with open(ALL_SONGS_PATH, "w") as outfile:
            json.dump(allSongs, outfile, indent=2, sort_keys=True)


if __name__ == "__main__":
    # Argument parsing is currently un-used
    # TO DO modify for use on the app"s import feature
    parser = argparse.ArgumentParser(description="Add files")
    args = parser.parse_args()

    urlParser = URLParser()
    # urlParser.allToText()

    textParser = TextParser()
    modified = textParser.getAllModified()
    textParser.allToJSON(modified)
    # textParser.getAllSongs()
