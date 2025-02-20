# MusicParsed

Start local server:

    yarn
    yarn app

Seed local Mongo DB:

    make seed

Start local Mongo DB:

    mongod

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

Deploy:

    heroku login
    heroku git:remote -a musicparsed
    git push heroku master

Validate git remotes:
    git remote -v

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

Magic rendering logic:

The `lib/parser` logic has some special rendering Easter eggs for the first line i.e.

- `CAPO 1` to indicate a capo
- `ALL CHORDS F|0,0,1,0;G|2,2,3,2;Fmaj7|0,0,0,0;G6|2,2,0,2;Am|4,0,0,0` to handle custom chord charts / tunings

There is also a rendering bug:

- The last line cannot be a chord. If the last line is a chord, you need to add another line with an empty space after the chord line.
