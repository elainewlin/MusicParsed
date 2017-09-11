import re


def isLabel(line):
    # Checks whether a line is a label
    return line.startswith('[') and line.endswith(']')

pitch = r'[A-G][#b]?'
chord = pitch + '(?:maj|m|aug|dim)?\d*(?:(?:add|sus|[#b])\d+)*(?:/' + pitch + ')?'
isChord = re.compile(chord + r'\Z').match
isChordLine = re.compile(r'\s*(?:' + chord + r'\s+)*' + chord + r'\Z').match
