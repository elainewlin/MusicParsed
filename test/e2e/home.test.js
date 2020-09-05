import puppeteer from "puppeteer";
import { assert } from "chai";
import { getHtmlForSelector, getAllHtmlForSelector } from "./helpers/browser";
import { BASE_URL } from "./helpers/config";
import { checkSongView } from "./helpers/songView";

describe("Home page", function() {
  before(async () => {
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
  });
  before("Go to home page", async () => {
    await this.page.goto(BASE_URL);
  });
  after(async () => {
    await this.browser.close();
  });

  it("can click on the hamburger menu", async () => {
    await this.page.click(".navbar-toggler-icon");
  });

  it("shows navigation links", async () => {
    const expectedLinks = ["Render", "Convert", "Guides"];
    const navLinks = await getAllHtmlForSelector(this.page, ".nav-link");
    assert.deepStrictEqual(navLinks, expectedLinks);
  });

  it("shows the social section", async () => {
    const socialIcons = ["fa-youtube", "fa-facebook-f", "fa-github"];
    const socialLinks = [
      "https://www.youtube.com/channel/UCtscOI_XyD8WxEgWyYtAXaQ",
      "https://www.facebook.com/musicparsed/",
      "https://github.com/elainewlin/MusicParsed",
    ];
    const socialSection = await getHtmlForSelector(
      this.page,
      ".social-section"
    );
    socialIcons.forEach(icon => assert(socialSection.includes(icon)));
    socialLinks.forEach(link => assert(socialSection.includes(link)));
  });

  it("can click on a random song", async () => {
    await this.page.click("#random");
    await checkSongView(this.page);
  });
});
