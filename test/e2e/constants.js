import { range } from "lodash";
import { instrumentsData } from "../../lib/instrument";

export const WIDGET_IDS = {
  INSTRUMENT: Object.keys(instrumentsData).map(type => `#instrument-${type}`),
  CHORD_OPTION: ["#chord_option-simple", "#chord_option-original"],
  ORIENTATION: ["#orientation-left", "#orientation-right"],
  TRANSPOSE: range(-6, 7).map(num => `#transpose-${num}`),
  COLUMNS: range(1, 5).map(num => `#column-${num}`),
};
