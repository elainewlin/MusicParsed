/**
 * @file Web controller logic for adding, editing, and deleting songs
 */

import $ from "jQuery";
import { slugify, parseLines } from "../lib/parser";
import { SongInput, SongData, RenderedLine } from "../lib/song";

/**
 * Wrapper function for jQuery .val()
 */
const getVal = function(id: string): string {
  let val = $(`#${id}`).val();
  val = val ? val : "";
  return val.toString();
};

const getSongInput = function(): SongInput {
  const title = getVal("title");
  const artist = getVal("artist");
  const songText = getVal("songText");

  return {
    title,
    artist,
    songText,
  }
};

$(document).ready(function() {
  $("#submit").click(function() {
    const input = getSongInput();
    const songData = parseLines(input);

    $.ajax({
      url: "/api/song",
      type: "POST",
      data: JSON.stringify(songData),
      contentType: "application/json",
      success:function(input) {
        alert(input.id);
      }
    });
  });

  $("#delete").click(function() {
    const input = getSongInput();
    const songData = parseLines(input);

    $.ajax({
      url: `/api/song/${songData.id}`,
      type: "DELETE",
      success: function (input) {
        alert(input);
      }
    });
  });
});
