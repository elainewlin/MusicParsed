import os
import json

textFolder = os.path.join(os.getcwd(), 'text')
jsonFolder = os.path.join(os.getcwd(), 'json')

def toJSON(fileName):
    textFile = os.path.join(textFolder, fileName)
    f = open(textFile, 'r') 
    lines = f.readlines()
    lines = [x.strip() for x in lines] 

    data = {}

    song = os.path.splitext(fileName)[0]
    [title, artist] = song.split(" - ")
    data['title'] = title
    data['artist'] = artist
    data['lines'] = []

    for i in xrange(len(lines)):
        l = lines[i]
        lCount = 0
        
        # figuring out if l is a chord line
        # counts number of characters
        for c in l:
            if c != ' ':
                lCount += 1

        if lCount > 0 and lCount < 10:
            data['lines'].append({'lyrics': lines[i+1], 'chord': lines[i]})

    jsonFile = os.path.join(jsonFolder, song+'.json')
    with open(jsonFile, 'w') as outfile:
        json.dump(data, outfile)

for fileName in os.listdir(textFolder):
    print fileName
    if fileName.endswith(".txt"):
        toJSON(fileName)
