include .env

seed:
	@npm run parser seed # This creates ALL_SONGS_DATA.json
	@mongoimport --db=musicparsed --collection=songs --drop --jsonArray < static/data/ALL_SONGS_DATA.json

prod-backup:
	@mongodump --uri="$(MONGO_URI_PROD)" -o backup_"+%Y-%m-%d"

prod-restore:
	@mongorestore backup_"+%Y-%m-%d" --drop