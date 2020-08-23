seed:
	npm run parser seed # This creates ALL_SONGS_DATA.json
	mongoimport --db=musicparsed --collection=songs --drop --jsonArray < static/data/ALL_SONGS_DATA.json