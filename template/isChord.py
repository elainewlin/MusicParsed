import re

# import from the file it exists in
def isChord(phrase):
    chord = '[A-G][#b]?m?[2479]?'
    # TO DO add support for weird words aug,dim,sus,add,maj
    # Maybe we have weird bass notes
    bassNote = '(\/{0})?'.format(chord)
    chordRegex = re.compile(chord+bassNote)

    # Ignore additional text ex: Apple, Bridge

    match = chordRegex.match(phrase)
    if match:
        return match.end() == len(phrase)
    return False

def isChordLine(line):
    lCount = 0
    for c in line:
        if c != ' ':
            lCount += 1
    if lCount > 0:
        for phrase in line.split():

            if not isChord(phrase):
                return False
        return True
    return False
        # chord = line.split()[0]
        # return (lCount < 10 and len(chord) < 5)