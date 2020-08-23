import $ from "jQuery";

$(document).ready(function() {
  $("#loginForm").submit(function(e) {
    e.preventDefault();
    const username = $("#name").val();
    const password = $("#password").val();

    const data = { username, password };
    $.ajax({
      url: "/api/login",
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      success: function(input) {
        alert(input);
      },
      error: function () {
        alert("Invalid login");
      }
    });
    return false;
  });
});