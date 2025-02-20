/**
 * @file Web controller logic for adding, editing, and deleting songs
 */

import $ from "jquery";
import "bootstrap";
import { getSongId, parseLines } from "../lib/parser";
import { SongInput } from "../lib/song";

/**
 * Wrapper function for jQuery .val()
 */
const getVal = function(id: string): string {
  let val = $(`#${id}`).val();
  val = val ? val : "";
  return val.toString();
};

// Client-side validation for deleting songs
const getBaseErrorMessage = function(input: SongInput): string {
  if (!input.title) {
    return "Missing song title";
  }
  if (!input.artist) {
    return "Missing song artist";
  }
  return "";
};

// Client-side validation for adding/editing songs
const getEditErrorMessage = function(input: SongInput): string {
  const message = getBaseErrorMessage(input);
  if (message) return message;
  if (!input.songText) {
    return "Missing song text";
  }
  return "";
};

const isValidInput = function(
  input: SongInput,
  errMsgGetter = getEditErrorMessage
): boolean {
  const errorMessage = errMsgGetter(input);
  if (errorMessage) {
    alert(errorMessage);
    return false;
  }
  return true;
};

const getSongInput = function(): SongInput {
  const title = getVal("title");
  const artist = getVal("artist");
  const songText = getVal("songText");

  return {
    title,
    artist,
    songText,
  };
};

$(document).on("ready", () => {
  $("#add").on("click", () => {
    const input = getSongInput();
    if (!isValidInput(input)) return;
    const songData = parseLines(input);

    $.ajax({
      url: "/api/song",
      type: "POST",
      data: JSON.stringify(songData),
      contentType: "application/json",
      success: function(input) {
        alert(input);
      },
    });
  });

  $("#edit").on("click", () => {
    const input = getSongInput();
    if (!isValidInput(input)) return;
    const songData = parseLines(input);

    $.ajax({
      url: `/api/song/${songData.songId}`,
      type: "PUT",
      data: JSON.stringify(songData),
      contentType: "application/json",
      success: function(input) {
        alert(input);
      },
    });
  });

  $("#delete").on("click", () => {
    const input = getSongInput();
    if (!isValidInput(input, getBaseErrorMessage)) return;

    const confirmMessage = `Are you sure you want to delete ${input.title}?`;
    const confirm = window.confirm(confirmMessage);
    if (!confirm) return;
    const songId = getSongId(input.title, input.artist);

    $.ajax({
      url: `/api/song/${songId}`,
      type: "DELETE",
      success: function(input) {
        alert(input);
      },
    });
  });
});
