from flask import render_template
from flask import Flask
from flask import request
import os
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

@app.route("/import")
def importSong():
    return render_template('import.html', name='import')
"""
@app.route("/importText", methods=['POST'])
def importText():
    data = request.form['text']
    print os.path.join(os.getcwd(), 'text')
    textFile = 'test.txt'
    with open(textFile, 'w') as outfile:
        outfile.write(data.encode('utf-8'))
    return render_template('import.html', name='import')

@app.route("/importURL", methods=['POST'])
def importURL():
    data = request.form['text']
    print os.path.join(os.getcwd(), 'text')
    textFile = 'test.txt'
    with open(textFile, 'w') as outfile:
        outfile.write(data.encode('utf-8'))
    return render_template('import.html', name='import')
"""
@app.route("/song/<artist>/<title>")
def getSong(artist, title):
    return render_template('index.html', title=title, artist=artist)

if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)

