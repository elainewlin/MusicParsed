# Test to make sure the the /json and /text folders are in sync
# We keep text files in case we need to manually edit the tabs

import os
from helpers import clean, dataToName, idToData
textFolder = os.path.join(os.getcwd(), "text")
jsonFolder = os.path.join(os.getcwd(), "json")

allText = os.listdir(textFolder)
allJSON = os.listdir(jsonFolder)
allJSON.remove("ALL_SONGS.json")


def strip(file):
    return file.split(".")[0]


for i in xrange(len(allText)):
    [title, artist] = idToData(strip(allText[i]))
    title = clean(title)
    artist = clean(artist)
    fileName = dataToName(title, artist, 'json')
    assert fileName in allJSON, fileName

assert len(allText) == len(allJSON), \
    "{} {}".format(len(allText), len(allJSON))
