var instrumentsData = {
  ukulele: {
    strings: 4,
    frets: 4,
    chords: [
      /* C  */ { "": "0003", "7": "0001", "add9": "0203", "dim7": "2323", "m": "0333", "maj7": "0002" },
      /* C# */ { "": "1114", "m": "6444", "sus2": "1344" },
      /* D  */ { "": "2220", "7": "2223", "add9": "2425", "dim": "121x", "m": "2210", "m7": "2213", "maj7": "2224", "sus4": "0220" },
      /* Eb */ { "": "0331", "m": "3321" },
      /* E  */ { "": "1402", "7": "1202", "m": "0432", "m6": "0102", "m7": "0202", "madd9": "0422" },
      /* F  */ { "": "2010", "7": "2313", "dim7": "1212", "m": "1013", "m6": "1213", "maj7": "2413" },
      /* F# */ { "": "3121", "7": "3424", "dim": "2020", "m": "2120" },
      /* G  */ { "": "0232", "7": "0212", "add9": "0252", "m": "0132", "m7": "0211", "maj7": "0222" },
      /* G# */ { "": "1343", "m": "1342" },
      /* A  */ { "": "2100", "7": "0100", "9": "2132", "m": "2000", "m7": "0000", "madd9": "2002", "sus4": "2200" },
      /* Bb */ { "": "3211", "7": "1211", "m": "3111", "m7": "1111", "sus2": "3011" },
      /* B  */ { "": "4322", "7": "2322", "m": "4222", "m7": "2222" }
    ]
  },
  guitar: {
    strings: 6,
    frets: 5,
    chords: [
      /* C  */ { "": "x32010", "7": "x32310", "m": "x35543" },
      /* C# */ { "": "x43121", "m": "x46654" },
      /* D  */ { "": "xx0232", "7": "xx0212", "m": "xx0231" },
      /* Eb */ { "": "xx1343", "7": "xx1023" },
      /* E  */ { "": "x22100", "7": "020100", "m": "022000" },
      /* F  */ { "": "xx3211", "7": "131211", "m": "133111" },
      /* F# */ { "": "xx4322", "7": "xx4320", "m": "244222" },
      /* G  */ { "": "320003", "7": "320001", "m": "310033" },
      /* G# */ { "": "466544", "m": "466444" },
      /* A  */ { "": "x02220", "7": "x02020", "m": "x02210" },
      /* Bb */ { "": "x13331", "7": "x13131", "m": "x13321" },
      /* B  */ { "": "x24442", "7": "x21202", "m": "x24432" }
    ]
  }
};

var renderChords = function(data) {
  var currentInstrument = songView.getInstrument();
  $("#instrumentToggle").text(currentInstrument);

  var chordTemplate = document.getElementById("chordTemplate").innerHTML;

  var instrumentData = instrumentsData[currentInstrument];
  var chordData = {
    strings: instrumentData.strings,
    stringsMinus1: instrumentData.strings - 1,
    frets: instrumentData.frets,
    fretsPlusHalf: instrumentData.frets + 0.5,
    viewHeight: instrumentData.frets + 1.5,
    stringLines: Array.apply(null, Array(instrumentData.strings - 2)).map(function(_, i) {
      return i + 1;
    }),
    fretLines: Array.apply(null, Array(instrumentData.frets)).map(function(_, i) {
      return i + 0.5;
    }),
    chords: [].concat.apply([], data.allChords.map(function(chord) {
      var m = chord.match(/^([A-G](?:#|x|bb?)?)(.*)$/);
      var c = instrumentData.chords[(pitchToFifths.get(m[1]) * 7 + 12000) % 12][m[2]];
      if (c) {
        if (typeof c === 'string') {
          c = c.split('');
        }
        var offset =
          c.every(function(y) {
            return !(y > 0) || +y <= instrumentData.frets;
          }) ?
            1 :
            Math.min.apply(null, [].concat.apply([], c.map(function(y) {
              return y > 0 ? [+y] : [];
            })));
        var left = offset == 1 ? 0 : 0.5 * ('' + offset).length;
        return [{
          viewLeft: -0.5 - left,
          viewWidth: instrumentData.strings + left,
          width: (instrumentData.strings + left) * 11,
          chord: chord,
          offset: offset == 1 ? undefined : offset,
          openY: offset == 1 ? -0.5 : 0,
          dots: [].concat.apply([], c.map(function(y, x) {
            return y > 0 ? [{x: x, y: +y - offset + 1}] : [];
          })),
          open: [].concat.apply([], c.map(function(y, x) {
            return y == 0 ? [x] : [];
          })),
          mute: [].concat.apply([], c.map(function(y, x) {
            return y == 'x' ? [x] : [];
          })),
        }];
      } else {
        return [{
          chord: chord,
          unknown: true
        }];
      }
    }))
  };
  document.getElementById('chordPics').innerHTML = Mustache.render(chordTemplate, chordData);
};

var rerender = function(data) {
  $("#title").text(songView.getName());

  var songTemplate = document.getElementById('songTemplate').innerHTML;
  document.getElementById('song').innerHTML = Mustache.render(songTemplate, data);

  renderChords(data);
};

var loadSong = function(newSong) {

  $.getJSON("/static/data/json/"+newSong+".json", function(data) {
      songView.setName(`${data.title} - ${data.artist}`);
      songView.setSong(data);
      resetTranspose();
      rerender(songView.getData());
  });
};

window.onload = function() {
  loadWidgets();

  $("#tags").autocomplete({
      source: function(request, response) {
         $.ajax({
          url: "/static/data/allSongs.json",
          dataType: "json",
          data: {
            term: request.term
          },
          success: function(data) {
            var re = $.ui.autocomplete.escapeRegex(request.term);
            var matcher = new RegExp( re, "i" );
            var matches = $.grep(data, function(item){
              return matcher.test(item["value"]); // searching by song ID
            });
            response(matches);
          }
        });
      },
      select: function(event, ui) {
        var newSong = ui.item.id;
        window.history.pushState({'song': newSong}, ui.item.value, `/song/${ui.item.id_artist}/${ui.item.id_title}`)
        loadSong(newSong);
      }
  });

};