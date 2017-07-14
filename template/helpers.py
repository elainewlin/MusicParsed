# Helper functions for handling song data

"""
title + artist <-> songID <-> filename (JSON, text)
data           <-> songID <-> name
"""

# name -> songID
def nameToID(fileName):
    return fileName.split(".")[0]

# songID -> data
def idToData(songID):
    return songID.split(" - ")

# data -> songID -> name
def dataToName(title, artist, fileType):
    return "{0} - {1}.{2}".format(title, artist, fileType)
