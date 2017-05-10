import os
import json
import urllib2
from bs4 import BeautifulSoup

textFolder = os.path.join(os.getcwd(), 'temp')
jsonFolder = os.path.join(os.getcwd(), 'json')

# URL of a song --> text file of a song
def readURL(url):
    hdr = {'User-Agent': 'Mozilla/5.0'}
    req = urllib2.Request(url, headers = hdr)
    f = urllib2.urlopen(req)           
    myfile = f.read()  
    return myfile

def toText(url):
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
def allToText():
    f = open('urls.txt', 'r') 
    lines = f.readlines()
    lines = [x.strip() for x in lines] 
    for url in lines:
        toText(url)
  
# Checks whether a line is a label
def isLabel(line):
    labels = ['Verse', 'Bridge', 'Chorus', 'Solo', 'Outro']
    return line.startswith('[') and line.endswith(']')
    # for l in labels:
    #     if l in line:
    #         return True
    # return False

# Checks whether a line is a chord
def isChord(line):
    lCount = 0
    for c in line:
        if c != ' ':
            lCount += 1
    if line.startswith(' '):
        return True

    if lCount > 0:
        chord = line.split()[0]
        return (lCount < 9 and len(chord) < 5)
    
# Text file of a song --> JSON file of a song
def toJSON(fileName):
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
            if isChord(lines[i]): 
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
    
    jsonFile = os.path.join(jsonFolder, song+'.json')
    with open(jsonFile, 'w') as outfile:
        json.dump(data, outfile)

# All song text files --> all JSON files of songs
def allToJSON():
    allSongs = []
    for fileName in os.listdir(textFolder):
        if fileName.endswith(".txt"):
            toJSON(fileName)
            allSongs.append(fileName.split(".txt")[0])
    with open('allSongs.json', 'w') as outfile:
        json.dump(allSongs, outfile)

# URL of a song --> JSON file of a song
def addSong(url):
    fileName = toText(url)
    toJSON(fileName)

allToJSON()