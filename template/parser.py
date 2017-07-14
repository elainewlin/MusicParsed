import os
import json
import urllib2
from bs4 import BeautifulSoup
import argparse
from isChord import isChordLine
JSON_FOLDER = os.path.join(os.getcwd(), 'json')

class Parser:
    def __init__(self, textFolder):
        self.textFolder = textFolder

    # URL of a song --> text file of a song
    def readURL(self, url):
        hdr = {'User-Agent': 'Mozilla/5.0'}
        req = urllib2.Request(url, headers = hdr)
        f = urllib2.urlopen(req)           
        myfile = f.read()  
        return myfile

    def toText(self, url):
        try:
            web_page = readURL(url)
            soup = BeautifulSoup(web_page, 'html.parser')

            # HTML markup for Ultimate Guitar website
            if 'ultimate-guitar' in url:
                data = soup.find('pre', {'class':'js-tab-content'}) # all of the lyrics and chords
                title = soup.find('h1').get_text()[:-7] # Wonderwall Chords
                artist = soup.find('div', {'class': 't_autor'}).find('a').get_text()

            # HTML markup for Ukutabs website
            if 'ukutabs' in url:
                data = soup.findAll('pre', {'class': 'qoate-code'})[0]
                title = soup.find('span', {'class': 'stitlecolor'})
                artist = title.parent.parent.parent.findAll('tr')[1].find('a').get_text()
                title = title.get_text()
      
            fileName =  title + ' - ' + artist + '.txt'
            textFile = os.path.join(textFolder, fileName)
            print textFile
            with open(textFile, 'w') as outfile:
                outfile.write(data.get_text())
            return fileName

        except urllib2.HTTPError :
            print("HTTPERROR!")
        except urllib2.URLError :
            print("URLERROR!")

    # All song URLs --> all text files of songs
    def allToText(self):
        f = open('urls.txt', 'r') 
        lines = f.readlines()
        lines = [x.strip() for x in lines] 
        for url in lines:
            toText(url)
      
        
    # Text file of a song --> JSON file of a song
    def toJSON(self, fileName):
         # Checks whether a line is a label
        def isLabel(line):
            return line.startswith('[') and line.endswith(']')

        textFile = os.path.join(textFolder, fileName)
        f = open(textFile, 'r') 
        lines = f.readlines()
        lines = [x.rstrip() for x in lines] 
        data = {}

        song = os.path.splitext(fileName)[0]

        [title, artist] = song.split(" - ")
        data['title'] = title
        data['artist'] = artist
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
                        c = c.replace("#", "%23")
                        if "/" in c:
                            c = c.split("/")[0]
                        allChords.add(c)
                    count += 1
                    data['lines'].append(newLine)
            
        data['allChords'] = list(allChords)
        
        jsonFile = os.path.join(JSON_FOLDER, song+'.json')
        with open(jsonFile, 'w') as outfile:
            json.dump(data, outfile)

    # All song text files --> all JSON files of songs
    def allToJSON(self):
        allSongs = []
        for fileName in os.listdir(textFolder):
            if fileName.endswith(".txt"):
                self.toJSON(fileName)
                allSongs.append(fileName.split(".txt")[0])
        with open('allSongs.json', 'w') as outfile:
            json.dump(allSongs, outfile)
        self.getAllSongs()

    # Get all songs
    def getAllSongs(self):
        allSongs = []
        for fileName in os.listdir(JSON_FOLDER):
            newSong = {}
            songID = fileName.split(".json")[0]
            title = songID.split(" - ")[0]
            artist = songID.split(" - ")[1]
            # tags = []

            newSong["id"] = songID
            newSong["label"] = title
            newSong["value"] = songID
            newSong["title"] = title
            newSong["artist"] = artist
            allSongs.append(newSong)
        with open('allSongs.json', 'w') as outfile:
            json.dump(allSongs, outfile)
                 
    # URL of a song --> JSON file of a song
    def addSong(self, url):
        fileName = toText(url)
        toJSON(fileName)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Add files")

    args = parser.parse_args()

    textFolder = os.path.join(os.getcwd(), 'text') # might be temp
    converter = Parser(textFolder)
    converter.toJSON('Clocks - Coldplay.txt')

    # converter.toJSON('Fluorescent Adolescent - Arctic Monkeys.txt')
    # converter.toJSON('Dani California - Red Hot Chili Peppers.txt')
    # converter.toJSON('Leave Out All The Rest - Linkin Park.txt')
    # if not args:
    #     print "NO ARGUMENT"
    #     parser.allToJSON()
    # else:
    #     print "ARGUMENTS"

    # converter.toJSON("Somebody That I Used to Know - Gotye.txt")
    # allToText()
    # allToJSON()
    # getAllSongs()