import puppeteer from "puppeteer";
import { assert } from "chai";
import { getAllHtmlForSelector, clickAllButtons } from "./helpers/browser";
import { BASE_URL } from "./helpers/config";
import { WIDGET_IDS } from "./helpers/constants";
import { checkChords } from "./helpers/chords";

describe("Render chords page", function() {
  before(async () => {
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
  });
  before("Go to render page", async () => {
    const renderUrl = `${BASE_URL}/render`;
    await this.page.goto(renderUrl);
  });
  after(async () => {
    await this.browser.close();
  });

  it("should render the default chords", async () => {
    await this.page.waitForSelector(".chordPics");

    const knownChords = ["Am", "F", "C", "G"];
    await checkChords(this.page, knownChords);
  });

  it("can click all of the instrument buttons", async () => {
    await clickAllButtons(this.page, WIDGET_IDS.INSTRUMENT);
  });

  it("can click all of the orientation buttons", async () => {
    await clickAllButtons(this.page, WIDGET_IDS.ORIENTATION);
  });

  it("can render different chords", async () => {
    await this.page.$eval(".form-control", el => (el.value = "D;A;Bm"));
    await this.page.click("#renderChords");

    const knownChords = ["D", "A", "Bm"];
    await checkChords(this.page, knownChords);
  });

  it("can gracefully handle unknown chords", async () => {
    await this.page.$eval(".form-control", el => (el.value = "C_123;Bb;F"));
    await this.page.click("#renderChords");

    const knownChords = ["B♭", "F"];
    const unknownChords = ["C_123"];

    await checkChords(this.page, knownChords, unknownChords);
  });

  it("can render chord overrides", async () => {
    await this.page.$eval(
      ".form-control",
      el => (el.value = "C_123|1,2,3,1;Bb;F;Dm")
    );
    await this.page.click("#renderChords");

    const knownChords = ["C_123", "B♭", "F", "Dm"];
    await checkChords(this.page, knownChords);
  });
});
