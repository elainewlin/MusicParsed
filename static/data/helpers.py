# Helper functions for handling song data

"""
title + artist <-> songID <-> filename (JSON, text)
data           <-> songID <-> name
"""
import re
# name -> songID
def nameToID(fileName):
    return fileName.split(".")[0]

# songID -> data
def idToData(songID):
    return songID.split(" - ")

# data -> songID -> name
def dataToName(title, artist, fileType):
    return "{0} - {1}.{2}".format(title, artist, fileType)

def clean(string):
    string = re.sub('[^A-Za-z0-9 ]+', '', string)
    return string.lower().replace(" ", "_")
