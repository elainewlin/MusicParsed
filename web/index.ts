import $ from "jquery";
import "bootstrap";
import { initRender, popStateHandler } from "./songView";
import "bootstrap/dist/css/bootstrap.css";
import "../css/styles.css";
import "../css/global.css";

$(document).ready(() => {
  initRender();
  popStateHandler(window.history);
  window.onpopstate = popStateHandler;
});
