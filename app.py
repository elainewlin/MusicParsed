from flask import render_template
from flask import Flask
from flask import request
from flask_webpackext import FlaskWebpackExt
import os
app = Flask(__name__)

@app.route("/")
def hello():
    return render_template('index.html', name='home')

@app.route("/all")
def all_songs():
    return render_template('all_songs.html', name='all_songs')

@app.route("/convert")
def convert():
    return render_template('convert.html', name='convert')

@app.route("/import")
def import_song():
    return render_template('import.html', name='import')

@app.route("/aus")
def aus():
    return render_template('aus.html', name='aus')

@app.route("/guides/getting_started")
def getting_started():
    return render_template('getting_started.html', name='getting_started')

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

FlaskWebpackExt(app)

if __name__ == '__main__':
    app.jinja_env.auto_reload = True
    app.run(debug=True, use_reloader=True)

