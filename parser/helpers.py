# Helper functions for handling song data

"""
title + artist <-> songID <-> filename (JSON, text)
data           <-> songID <-> name
"""
import re

# name -> songID


def nameToID(fileName):
    return fileName.rpartition(".")[0]


def idToData(songID):
    """
    songID -> data
    """
    return songID.split(" - ")


def dataToName(title, artist, fileType):
    """
    data -> songID -> name
    """
    return "{0} - {1}.{2}".format(title, artist, fileType)


def clean(string):
    string = re.sub("[^A-Za-z0-9 ]+", "", string)
    return string.lower().replace(" ", "_")
