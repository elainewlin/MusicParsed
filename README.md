# MusicParsed

## Development

### Local server / frontend

Start local server:

    yarn
    yarn app

Watch for frontend changes:

    yarn watch

### Database

MusicParsed uses MongoDB.

Seed local DB from `static/data/` files:

    make seed

Backup prod DB + seed local DB from prod:

    make prod-backup
    make prod-restore

Start local DB:

    mongod

### Pre-commit hooks

MusicParsed uses pre-commit hooks, Typescript, eslint, and prettier.

Useful commands:

    pre-commit run -a
    pre-commit run eslint -a
    pre-commit run eslint:ts -a
    pre-commit run typescript -a
    pre-commit run prettier -a

    tsc
    eslint . --ext ts,js --fix

### Tests

    npm run test:unit
    npm run test:e2e

### Deploy

    heroku login
    heroku git:remote -a musicparsed
    git push heroku master

To troubleshoot, validate git remotes:

    git remote -v

Codebase documentation:

- MusicParsed uses Mustache templates.

- See `lib/song.ts` for the structure of songs. The main song data is:
  - title: string with title of the song.
  - artist: string with the artist of the song.
  - allChords: array of strings of all chords in the song ex: ["Am", "F", "C", "G"].
  - lines: array of objects for each chord-lyric pair in the song. Each line is either:
    - { label: string } - label of the section i.e. "Chorus", "Verse 1"
    - ChordLyricLine - object representing the chords and corresponding lyrics

Magic rendering logic:

The `lib/parser` logic has some special rendering Easter eggs for the first line i.e.

- `CAPO 1` to indicate a capo
- `ALL CHORDS F|0,0,1,0;G|2,2,3,2;Fmaj7|0,0,0,0;G6|2,2,0,2;Am|4,0,0,0` to handle custom chord charts / tunings

There is also a rendering bug:

- The last line cannot be a chord. If the last line is a chord, you need to add another line with an empty space after the chord line.
