import $ from "jquery";
import { initRender, popStateHandler } from "./songView";
import "bootstrap/dist/css/bootstrap.css";
import "../css/styles.css";

$(document).ready(() => {
  initRender();
  popStateHandler(window.history);
  window.onpopstate = popStateHandler;
});
