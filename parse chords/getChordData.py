import urllib2
from bs4 import BeautifulSoup
import json
import pprint

def get_ukulele_notation(chord):
    url = 'https://ukulele-chords.com/'+chord
    soup = get_soup(url)
    notation = soup.find('ul', attrs={'class': 'list'})
    numbers = notation.findChildren()[-4].text.split(':')[1]
    return ','.join(numbers.split())

def get_guitar_notation(chord):
    url = 'https://www.scales-chords.com/chord/guitar/'+chord
    soup = get_soup(url)
    for image in soup.body.findAll('img'):
        alt = image.get('alt', '')
        guitar_string = 'for guitar on frets'
        if guitar_string in alt:
            return alt.split(guitar_string)[1].replace(' ', '')

def get_soup(url):
    page = urllib2.urlopen(url)
    soup = BeautifulSoup(page, 'html.parser')
    return soup

def print_note(note):
    if len(note) == 1:
        print "/* {}  */".format(note)
    else:
        print "/* {} */".format(note)

class ChordParser:

    def __init__(self, is_ukulele):
        if is_ukulele:
            self.chord_file = "ukuleleChords.txt"
            self.get_notation = get_ukulele_notation
        else:
            self.chord_file = "guitarChords.txt"
            self.get_notation = get_guitar_notation

    # TO DO clean up duplicate info
    def load_chord_info(self):
        with open(self.chord_file) as f:
            lines = [x.strip() for x in f.readlines()]
            all_data = []

            for l in lines:
                if l.startswith('{'):
                    l = l.rstrip(',')
                    all_data.append(json.loads(l))

            return all_data

    def add_new_chord_type(self, new_chord_type):
        old_chord_info = self.load_chord_info()
        for i in xrange(len(root_notes)):
            note = root_notes[i]
            print_note(note)

            chord_dict = old_chord_info[i]

            chord = note + new_chord_type
            chord_dict[new_chord_type] = self.get_notation(chord)
            print json.dumps(chord_dict) + ','


root_notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]
# types = ["", "m", "aug", "dim", "7", "m7", "maj7", "m7b5", "sus2", "sus4", "7sus4", "6", "m6", "add9", "m9", "9", "11", "13"]
types = ["5"]


chord_parser = ChordParser(is_ukulele=False)
chord_parser.add_new_chord_type('5')
"""
for root in root_notes:
    chord_fingerings = {}
    for chord_type in types:
        chord = root + chord_type
        chord_fingerings[chord_type] = get_ukulele_notation(chord)
    print chord_fingerings
"""

"""
TO DO clean up logic for ukulele + guitar chords, prolly need to create some classes
before adding any additional code: scope out what there is to do
1. keep track of all existing chord types
    - each chord type supported on uke or guitar
2. load existing info
3. output updated info

GOAL: add new chord types should be easy
add_chord_type():

running it will output existing data w. new chord info added
"""