# Test to make sure the the /json and /text folders are in sync
# We keep text files in case we need to manually edit the tabs

import os
from helpers import clean, dataToName, idToData
from parser import TEXT_FOLDER, JSON_FOLDER

allText = os.listdir(TEXT_FOLDER)
allJSON = os.listdir(JSON_FOLDER)
allJSON.remove("ALL_SONGS.json")


def strip(file):
    return file.split(".txt")[0]


for i in xrange(len(allText)):
    [title, artist] = idToData(strip(allText[i]))
    title = clean(title)
    artist = clean(artist)
    fileName = dataToName(title, artist, 'json')
    assert fileName in allJSON, fileName

assert len(allText) == len(allJSON), \
    "{} {}".format(len(allText), len(allJSON))
