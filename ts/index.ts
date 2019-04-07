import $ from "jquery";
import { initRender, popStateHandler } from "./render";
import "bootstrap/dist/css/bootstrap.css";
import "../css/styles.css";

$(document).ready(() => {
  initRender();
  popStateHandler(window.history);
  window.onpopstate = popStateHandler;
});
