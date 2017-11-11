from isChord import isChord, isChordLine

NOTES = ["C", "D", "E", "F", "G", "A", "B"]

def minor(chord):
    return chord+"m"

def test_blank():
    assert not isChord("")

def test_basic():
    for note in NOTES:
        assert isChord(note)
        assert isChord(minor(note))

        sharp = note+"#"
        flat = note+"b"
        assert isChord(sharp)
        assert isChord(flat)
        assert isChord(minor(sharp))
        assert isChord(minor(flat))

def test_lines():
    shortLine = "A C"
    assert isChordLine(shortLine)
    notQuiteChords = "A carrot"
    assert not isChordLine(notQuiteChords)
    line = "Dm       C              Dm      C     Dm   C "
    assert isChordLine(line)

def test_false_matches():
    test = "Apple"
    assert not isChord(test)

def test_complex_chords():

    complex = ["Cmaj7", "Caug", "Bbsus2", "Dbdim", "Gadd9", "Dm", "Emadd9"]
    for chord in complex:
        assert isChord(chord), chord

    line = " ".join(complex)

    assert isChordLine(line)

