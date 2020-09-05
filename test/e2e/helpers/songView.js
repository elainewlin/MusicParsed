import { WIDGET_IDS } from "./constants";
import { clickAllButtons } from "./browser";

export const checkAllWidgets = async page => {
  await clickAllButtons(page, WIDGET_IDS.INSTRUMENT);
  await clickAllButtons(page, WIDGET_IDS.CHORD_OPTION);
  await clickAllButtons(page, WIDGET_IDS.ORIENTATION);
  await clickAllButtons(page, WIDGET_IDS.TRANSPOSE);
  await clickAllButtons(page, WIDGET_IDS.COLUMNS);
};

export const checkSongView = async page => {
  // Wait for song to load
  await page.waitForSelector("#songContainer");
};
