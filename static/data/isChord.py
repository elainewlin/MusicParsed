# -*- coding: utf-8 -*-
import re


def isLabel(line):
    # Checks whether a line is a label
    return line.startswith("[") and line.endswith("]") or line.endswith(":")


pitch = r"[A-G](?:bb|𝄫|b|♭|#|♯|x)?"
chord = pitch + \
    "(?:maj|m|aug|dim)?\d*(?:(?:add|sus|bb|𝄫|b|♭|#|♯|x|𝄪)\d+)*(?:/" + \
    pitch + ")?"
isChord = re.compile(chord + r"\Z").match
isChordLine = re.compile(r"\s*(?:" + chord + r"\s+)*" + chord + r"\Z").match


def isLyricLine(line):
    return not isLabel(line) and not isChordLine(line)
