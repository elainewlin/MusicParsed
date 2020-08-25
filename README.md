# MusicParsed

Start local server:

    yarn
    yarn app

Seed local Mongo DB:

    make seed

Useful commands:

    yarn watch

    pre-commit run -a
    pre-commit run eslint -a
    pre-commit run eslint:ts -a
    pre-commit run typescript -a
    pre-commit run prettier -a

    tsc
    eslint . --ext ts,js --fix
    node -r babel-register-ts scripts/parser-cli.ts

Run unit tests:

    npm run test

Template documentation

- Use Mustache for rendering HTML templates from JSON files

- Structure of JSON file

  - title: string with title of the song
  - artist: string with the artist of the song
  - allChords: array of strings of all chords in the song ex: ["Am", "F", "C", "G"]
  - lines: array of JSON objects for each chord-lyric pair in the song
    - count: id of the pair, used for jQuery selectors
    - chord: string with the chords + white spaces
    - lyrics: string with the lyrics
    - label: string with label of the section i.e. "Chorus", "Verse 1"

- parser-cli (`yarn parser`) makes it easy to generate the JSON files
