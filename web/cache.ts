import { SongData } from "../lib/song";

interface Cache {
  setAllSongs(data: SongData[]): void;
  getAllSongs(): SongData[];
};

const cache: Cache = new ((function Cache(this: Cache) {
  let allSongs: SongData[];
  this.getAllSongs = function () {
    return allSongs;
  };

  this.setAllSongs = function(newAllSongs: SongData[]) {
    allSongs = newAllSongs;
  }
} as unknown) as { new (): Cache })();

export default cache;