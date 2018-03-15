import "babel-polyfill";
import $ from "jquery";
import { songView } from "./model.js";
import { initRender, loadSong, popStateHandler} from "./render.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/styles.css";

$(document).ready(function() {
  initRender();
  popStateHandler(window.history);
  window.onpopstate = popStateHandler;
});