from flask import render_template
from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello():
    return render_template('index.html', name='home')

@app.route("/all")
def allSongs():
    return render_template('allSongs.html', name='allSongs')

@app.route("/convert")
def convert():
    return render_template('convert.html', name='convert')

@app.route("/song/<artist>/<title>")
def getSong(artist, title):
    test1 = 'artist = ' + artist
    test2 = 'title = ' + title
    return render_template('index.html', title=title, artist=artist)
    return test1 + test2