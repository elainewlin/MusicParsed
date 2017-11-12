from flask import render_template
from flask import Flask
from flask_webpackext import FlaskWebpackExt

app = Flask(__name__)


@app.route("/")
def hello():
    return render_template("index.html", name="home")


@app.route("/all")
def all_songs():
    return render_template("all_songs.html", name="all_songs")


@app.route("/convert")
def convert():
    return render_template("convert.html", name="convert")


@app.route("/import")
def import_song():
    return render_template("import.html", name="import")


@app.route("/aus")
def aus():
    return render_template("aus.html", name="aus")


@app.route("/guides")
def guides():
    return render_template("guides/index.html", name="guides")


guide_types = [
    "buy_ukulele",
    "before_playing",
    "beginner_ukulele_chords",
    "song_chords",
    "beginner_strum_patterns",
    "playing_and_singing",
    "beginner_ukulele_songs"
]


@app.route("/guides/<guide_type>")
def get_guide(guide_type):
    guide_template = "guides/{0}.html".format(guide_type)
    return render_template(guide_template, name=guide_type)


@app.route("/song/<artist>/<title>")
def get_song(artist, title):
    return render_template("index.html", title=title, artist=artist)


FlaskWebpackExt(app)

if __name__ == "__main__":
    app.jinja_env.auto_reload = True
    app.run(debug=True, use_reloader=True)
