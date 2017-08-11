from helpers import nameToID
def test_get_id_file():
    song = "Hello - Adele.txt"
    assert nameToID(song) == "Hello - Adele"

def test_get_id_file_folder():
    song = "text/Hello - Adele.txt"
    assert nameToID(song) == "Hello - Adele"