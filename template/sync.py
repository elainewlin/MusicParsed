# Test to make sure the the /json and /text folders are in sync
# We need back-up text files for all of the JSON songs in case we need to manually edit the tabs

import os

textFolder = os.path.join(os.getcwd(), 'text')
jsonFolder = os.path.join(os.getcwd(), 'json')

allText = os.listdir(textFolder)
allJSON = os.listdir(jsonFolder)

assert len(allText) == len(allJSON)
def strip(file):
    return file.split('.')[0]

for i in xrange(len(allText)):
    text = allText[i]
    json = allJSON[i]

    assert strip(text) == strip(json), text