"""
spaces => _
delete apostrophes
"""
import os
from helpers import nameToID, idToData, dataToName


def makeURLFriendly(string):
    return string.lower().replace("'", "").replace(" ", "_")


newJSON = os.path.join(os.getcwd(), 'json2')

"""
TO DO adjust parser.py script so that we automatically name the JSON files with friendly names
TO DO restructure the /data folder, the Python code doesn't necessarily need to live in static?
    maybe this can wait until we have the import functionality
"""
for fileName in os.listdir(newJSON):
    songID = nameToID(fileName)
    title = makeURLFriendly(idToData(songID)[0])
    artist = makeURLFriendly(idToData(songID)[1])

    newName = dataToName(title, artist, 'json')

    fullFile = os.path.join(newJSON, fileName)

    newFullFile = fullFile.replace(fileName, newName)
    os.rename(fullFile, newFullFile)