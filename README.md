# SongChords 

Start local server: 
```python -m SimpleHTTPServer ```

Template documentation
* Use Mustache for rendering HTML templates from JSON files

* Structure of JSON file
    - title: string with title of the song
    - artist: string with the artist of the song
    - allChords: array of strings of all chords in the song ex: ['Am', 'F', 'C', 'G']
    - lines: array of JSON objects for each chord-lyric pair in the song
        - count: id of the pair, used for jQuery selectors
        - chord: string with the chords + white spaces
        - lyrics: string with the lyrics
        - label: string with label of the section i.e. "Chorus", "Verse 1"

* Python script parser.py makes it easy to generate the JSON files
    - readURL(url): helper function to scrape HTML of a URL
    - toText(url): URL of a song --> text file of a song
    - allToText(): all songs URLs in urls.text --> all text files of songs
    - isLabel(line): helper function to check whether a line is "Verse", "Chorus", etc.
    - toJSON(fileName): text file of a song --> JSON file of a song
    - allToJSON(): all song text files in /text --> all JSON files in /json
    - addSong(url): URL of a song --> text files and JSON file of a song