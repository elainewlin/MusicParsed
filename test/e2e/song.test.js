import puppeteer from "puppeteer";
import { assert } from "chai";
import { getAllTextForSelector } from "./helpers/browser";
import { BASE_URL } from "./helpers/config";
import { checkSongView, checkAllWidgets } from "./helpers/songView";
import { checkChords } from "./helpers/chords";

describe("Song view", function() {
  before(async () => {
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
  });
  before("Go to song page", async () => {
    await this.page.goto(`${BASE_URL}/song/hamilton/wait_for_it`);
  });
  after(async () => {
    await this.browser.close();
  });

  it("shows the song", async () => {
    await checkSongView(this.page);
  });

  it("shows the chords + lyrics", async () => {
    const chordLine = "AmDeath doesn’t discriminate F";
    const lines = await getAllTextForSelector(this.page, ".chordLyricLine");
    assert(lines.includes(chordLine));
  });

  it("shows lines without chords", async () => {
    const tabLine = "preacher, preacher, preacher";
    const lines = await getAllTextForSelector(this.page, ".line");
    assert(lines.includes(tabLine));
  });

  it("shows a bunch of chords", async () => {
    await this.page.click("#instrument-ukulele");
    const knownChords = ["C", "Am", "Em", "F", "G", "Gsus4"];
    await checkChords(this.page, knownChords);
  });

  it("can click ALL the buttons", async () => {
    await checkAllWidgets(this.page);
  });
});
