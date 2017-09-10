$(document).ready(function() {
    initRender();
    var dataset = document.documentElement.dataset;
    // stupid check to make sure we don't load blank songs
    if (dataset.title) {
        var newSong = dataset.title + ' - ' + dataset.artist;
        loadSong(newSong);
    }
    else {
        // Default song
        loadSong(songView.getName());
    }
});
