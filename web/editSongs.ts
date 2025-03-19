/**
 * @file Web controller logic for adding, editing, and deleting songs
 */

import $ from "jquery";
import "bootstrap";
import { getSongId, parseLines } from "../lib/parser";
import { SongInput } from "../lib/song";
import { showSuccessAlert, showErrorAlert, hideAlert } from "../lib/alert";

// Wrapper function for jQuery .val().
const getVal = function(id: string): string {
  let val = $(`#${id}`).val();
  val = val ? val : "";
  return val.toString();
};

/**
 * Client-side validation if the form is missing a title / artist.
 * Used when deleting songs.
 * @param input
 * @returns error message
 */
const getBaseErrorMessage = function(input: SongInput): string {
  if (!input.title) {
    return "Please add a song title.";
  }
  if (!input.artist) {
    return "Please add a song artist.";
  }
  return "";
};

/**
 * Client-side validation if the form is missing chords / lyrics.
 * Used when adding / editing songs.
 * @param input
 * @returns error message
 */
const getEditErrorMessage = function(input: SongInput): string {
  const message = getBaseErrorMessage(input);
  if (message) return message;
  if (!input.songText) {
    return "Please add chords / lyrics for the song.";
  }
  return "";
};

const isValidInput = function(
  input: SongInput,
  errMsgGetter = getEditErrorMessage
): boolean {
  const errorMessage = errMsgGetter(input);
  if (errorMessage) {
    showErrorAlert(errorMessage);
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

const onSuccess = function(message: string) {
  showSuccessAlert(message);
};

const onError = function(jqXHR: JQuery.jqXHR<string>) {
  showErrorAlert(jqXHR.responseJSON);
};

$(() => {
  $("input, textarea").on("input", () => {
    hideAlert();
  });

  $("#add").on("click", () => {
    const input = getSongInput();
    if (!isValidInput(input)) return;
    const songData = parseLines(input);

    $.ajax({
      url: "/api/song",
      type: "POST",
      data: JSON.stringify(songData),
      contentType: "application/json",
      success: onSuccess,
      error: onError,
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
      success: onSuccess,
      error: onError,
    });
  });

  $("#delete").on("click", () => {
    const input = getSongInput();
    if (!isValidInput(input, getBaseErrorMessage)) return;

    const confirmMessage = `Are you sure you want to delete the song: ${input.title}?`;
    const confirm = window.confirm(confirmMessage);
    if (!confirm) return;
    const songId = getSongId(input.title, input.artist);

    $.ajax({
      url: `/api/song/${songId}`,
      type: "DELETE",
      success: onSuccess,
      error: onError,
    });
  });
});
