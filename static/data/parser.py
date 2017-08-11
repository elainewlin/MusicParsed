import os
import json
import urllib2
from bs4 import BeautifulSoup
import argparse
from isChord import isChordLine, isLabel
from helpers import nameToID, idToData, dataToName, clean
from selenium import webdriver
import json
TEXT = 'txt'
JSON = 'json'
JSON_FOLDER = os.path.join(os.getcwd(), JSON)
PHANTOM_DRIVER = os.path.join(os.getcwd(), 'phantomjs')
DRIVER = webdriver.PhantomJS(PHANTOM_DRIVER)

def findBetween(s, first, last):
    """
    Find text in s between 2 strings: first, last.
    Used for parsing string of all text on a webpage.
        More readable/understandable than xpath selectors.
    """
    try:
        start = s.index(first) + len(first)
        end = s.index( last, start )
        return s[start:end]
    except ValueError:
        return ""

class URLParser:
    """
    Handles URL --> text file conversion
    """
    def __init__(self, textFolder):
        self.textFolder = textFolder

    def soupFromURL(self, url):
        """
        Using BeautifulSoup to read a URL
        url -> BeautifulSoup
        """
        hdr = {'User-Agent': 'Mozilla/5.0'}
        req = urllib2.Request(url, headers = hdr)
        f = urllib2.urlopen(req)
        myfile = f.read()
        return BeautifulSoup(myfile, 'html.parser')

    def collapseSong(self, data):
        """
        Param:
            data = string of all chord + lyrics from ukutabs
        Return:
            data without "unnecessary" \n characters
            - removes all blank lines
            - collapses stacked chord lines
                ex: Am\n       G\n     C\n
        """
        lines = data.split('\n')
        lines = [x.rstrip() for x in lines]
        chord = ''

        newFile = []
        for i in xrange(len(lines)):
            currentLine = lines[i]

            if isChordLine(currentLine):
                chord += currentLine
                nextLine = lines[i+1]
                if not isChordLine(nextLine):
                    newFile.append(chord)
                    chord = ''
            else:
                if len(currentLine) > 0:
                    newFile.append(currentLine)
        return "\n".join(newFile)

    def parseURL(self, url):
        """
        URL with song chords -> (title, artist, data)
            data = all chord + lyrics
        1. determine type of URL
        2. applies appropriate HTML parsing
        """

        # Parsing Ultimate Guitar website
        if 'ultimate-guitar' in url:
            soup = self.soupFromURL(url)
            data = soup.find('pre', {'class':'js-tab-content'}).get_text()
            title = soup.find('h1').get_text()[:-7] # Wonderwall Chords
            artist = soup.find('div', {'class': 't_autor'}).find('a').get_text()

        # Parsing Ukutabs website
        if 'ukutabs' in url:
            DRIVER.get(url)
            data = DRIVER.find_elements_by_class_name('qoate-code')[-1].text
            data = self.collapseSong(data)

            allText = DRIVER.find_element_by_tag_name('body').text
            title = findBetween(allText, 'Title ', '\n')
            artist = findBetween(allText, 'Artist ', '\n')

        return (title, artist, data)

    def toText(self, url):
        (title, artist, data) = self.parseURL(url)

        fileName = dataToName(title, artist, TEXT)
        textFile = os.path.join(textFolder, fileName)
        print textFile
        with open(textFile, 'w') as outfile:
            outfile.write(data.encode('utf-8'))
        return fileName

    # All song URLs --> all text files of songs
    def allToText(self):
        f = open('urls.txt', 'r')
        lines = f.readlines()
        lines = [x.strip() for x in lines]
        for url in lines:
            self.toText(url)

class TextParser:
    """
    Handles text --> JSON conversion
    """
    def __init__(self, textFolder):
        self.textFolder = textFolder

    def toJSON(self, fileName):
        """
        Text file of a song --> JSON file of a song
        """
        textFile = os.path.join(textFolder, fileName)
        f = open(textFile, 'r')
        lines = f.readlines()
        lines = [x.rstrip() for x in lines]
        data = {}

        songID = nameToID(fileName)

        [title, artist] = idToData(songID)
        data['title'] = title
        data['artist'] = artist
        data['id'] = songID
        data['lines'] = []
        count = 0
        print title

        allChords = set()

        for i in xrange(len(lines)):
            l = lines[i]

            newLine = {}
            if(isLabel(lines[i])):
                newLine['label'] = lines[i]
                data['lines'].append(newLine)
            else:
                # Checks whether a line has chords
                if isChordLine(lines[i]):

                    newLine['lyrics'] = lines[i+1]
                    newLine['chord'] = lines[i]
                    newLine['count'] = count

                    for c in lines[i].split():
                        if "/" in c:
                            c = c.split("/")[0]
                        allChords.add(c)
                    count += 1
                    data['lines'].append(newLine)

        data['allChords'] = list(allChords)

        title = clean(title)
        artist = clean(artist)
        fileName = dataToName(title, artist, JSON)
        jsonFile = os.path.join(JSON_FOLDER, fileName)
        with open(jsonFile, 'w') as outfile:
            json.dump(data, outfile)

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
        for fileName in os.listdir(textFolder):
            if fileName.endswith(TEXT):
                allText.append(fileName)
        return allText

    def getAllModified(self):
        """
        Return:
            array of all modified text files
            - each entry is "title - artist.txt'"
        """

        modifiedTextFile = "modified.txt"
        open(modifiedTextFile, 'w').close()
        os.system("git status -s >> %s" % modifiedTextFile)
        f = open(modifiedTextFile, 'r')
        lines = f.readlines()

        """
        git status output needs to be parsed
        1. remove new line character
        2. remove first 3 characters  ' M ' or '?? '
        3. remove quotes
        """
        cleanedLines = []
        deleted = ' D '

        for l in lines:
            if not l.startswith(deleted):
                cleanedLines.append(l.strip('\n')[3:].replace('"', ''))
        print cleanedLines
        allModifiedText = []
        for l in cleanedLines:
            textFolder = 'text/'
            if l.startswith(textFolder) and l.endswith(TEXT):
                fileName = l[5:] # stripping out text/ extension
                allModifiedText.append(fileName)

        return allModifiedText

    def getAllSongs(self):
        """
        Updates allSongs.json with data from all songs
        """
        allSongs = []
        for fileName in os.listdir(JSON_FOLDER):
            newSong = {}
            songID = nameToID(fileName)
            print fileName
            [title, artist] = idToData(songID)
            # tags = []
            with open(os.path.join(JSON_FOLDER, fileName)) as data_file:
                data = json.load(data_file)
                newSong["label"] = data['title']
                newSong["title"] = data['title']
                newSong["artist"] = data['artist']
                newSong["value"] = data['id']
            newSong["id"] = songID
            allSongs.append(newSong)
        with open('allSongs.json', 'w') as outfile:
            json.dump(allSongs, outfile)

if __name__ == "__main__":
    # Argument parsing is currently un-used
    # TO DO modify for use on the app's import feature
    parser = argparse.ArgumentParser(description="Add files")
    args = parser.parse_args()

    textFolder = os.path.join(os.getcwd(), 'text') # either 'text' or 'temp'

    urlParser = URLParser(textFolder)
    # urlParser.allToText()

    textParser = TextParser(textFolder)
    modified = textParser.getAllText()
    # textParser.allToJSON(modified)
    textParser.getAllSongs()
