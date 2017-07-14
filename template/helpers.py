# Helper functions for handling song data
# (title, artist) <--> file names

def getID(title, artist):
    return title + ' - ' + artist

def getFile(songID, fileType):
    return songID + '.' + fileType

def getSongInfo(fileName):
    return fileName.split(".")[0].split(" - ")