import urllib2
from bs4 import BeautifulSoup
import json
import pprint
def get_soup(url):
    page = urllib2.urlopen(url)
    soup = BeautifulSoup(page, 'html.parser')
    return soup

def get_ukulele_notation(chord):
    url = 'https://ukulele-chords.com/'+chord
    soup = get_soup(url)
    notation = soup.find('ul', attrs={'class': 'list'})
    numbers = notation.findChildren()[-4].text.split(':')[1]
    return ','.join(numbers.split())

root_notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]
# types = ["", "m", "aug", "dim", "7", "m7", "maj7", "m7b5", "sus2", "sus4", "7sus4", "6", "m6", "add9", "m9", "9", "11", "13"]
types = ["5"]


def get_guitar_notation(chord):
    url = 'https://www.scales-chords.com/chord/guitar/'+chord
    soup = get_soup(url)
    for image in soup.body.findAll('img'):
        alt = image.get('alt', '')
        guitar_string = 'for guitar on frets'
        if guitar_string in alt:
            return alt.split(guitar_string)[1].replace(' ', '')

c_chord_dict = { "": "x,3,2,0,1,0", "dim": "x,3,1,x,1,1", "13": "8,x,8,9,10,x", "aug": "x,3,2,1,1,0", "m7b5": "x,3,4,3,4,x", "11": "8,8,8,9,8,8", "m6": "8,10,10,8,10,8", "m": "x,3,5,5,4,3", "add9": "x,3,0,0,0,0", "7sus4": "x,3,5,3,6,3", "m7": "x,3,5,3,4,3", "sus2": "x,3,0,0,3,3", "sus4": "8,10,10,10,8,8", "7": "x,3,2,3,1,0", "6": "x,3,5,5,5,5", "9": "x,3,2,3,3,3", "maj7": "x,3,2,0,0,0", "m9": "x,3,1,3,3,x" }
to_add = {'5': u'2,2,x,0'}
c_chord_dict['5'] = u'2,2,x,0'

def print_note(note):
    if len(note) == 1:
        print "/* {}  */".format(note)
    else:
        print "/* {} */".format(note)

def load_chord_info():
    with open("guitarChords.txt") as f:
        print f.readlines()

def add_new_chord_type(new_chord_type):
    for note in root_notes:
        print_note(note)
        chord_dict = c_chord_dict

        chord = note + chord_type
        chord_dict[new_chord_type] = get_ukulele_notation(chord)
        print json.dumps(chord_dict) + ','

load_chord_info()
"""
for root in root_notes:
    chord_fingerings = {}
    for chord_type in types:
        chord = root + chord_type
        chord_fingerings[chord_type] = get_ukulele_notation(chord)
    print chord_fingerings

before adding any additional code: scope out what there is to do
1. keep track of all existing chord types
    - each chord type supported on uke or guitar
2. load existing info
3. output updated info

GOAL: add new chord types should be easy
add_chord_type():

running it will output existing data w. new chord info added
"""