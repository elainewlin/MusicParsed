window.onload = function() {
  //Grab the inline template
  var template = document.getElementById('template').innerHTML;

  //Parse it (optional, only necessary if template is to be used again)
  Mustache.parse(template);

  // Love Story - Taylor Swift
  // Wonderwall - Oasis
  // Monster - Imagine Dragons
  // Set Fire to the Rain - Adele
  $.getJSON("/template/json/Set Fire to the Rain - Adele.json", function(data) {

    //Render the data into the template
    var rendered = Mustache.render(template, data);

    //Overwrite the contents of #target with the rendered HTML
    document.getElementById('song').innerHTML = rendered;
  });
 
}