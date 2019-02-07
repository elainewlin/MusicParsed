# -*- coding: utf-8 -*-
import re


def isLabel(line):
    # Checks whether a line is a label
    return line.startswith("[") and line.endswith("]") or line.endswith(":")


pitch = r"[A-G](?:bb|𝄫|b|♭|#|♯|x)?"
chordType = r"(?:maj|m|aug|dim)?\d*(?:(?:add|sus|no|bb|𝄫|b|♭|#|♯|x|𝄪)\d+)*(?:/"
# We use this when we override chord fingerings for ~fancy~ chords
fancyChordEnd = "(_[0-9]+)?"
chord = pitch + chordType + pitch + ")?" + fancyChordEnd
isChord = re.compile(chord + r"\Z").match
isChordLine = re.compile(r"\s*(?:" + chord + r"\s+)*" + chord + r"\Z").match


def isLyricLine(line):
    return not isLabel(line) and not isChordLine(line)
