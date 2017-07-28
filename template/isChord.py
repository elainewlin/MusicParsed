import re


def isLabel(line):
    # Checks whether a line is a label
    return line.startswith('[') and line.endswith(']')

def isChord(phrase):
    chord = '[A-G][#b]?(maj|m|aug|dim|sus)?(add)?[24579]?'

    # Handle bass notes ex: G/C
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
