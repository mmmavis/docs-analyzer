$("#etherpad-num-found").text($(".etherpad:visible").length);

var highlighter = function(event) {
  console.log("clickedddd");
  var selectedPhrase = event.target.innerText;
  // clear previously highlighted
  $(".keyphrase.active").removeClass("active");
  $(".etherpad").removeHighlight();
  // highlight new keyphrase
  $(".etherpad").highlight(selectedPhrase);
  $(event.target).addClass("active");
  // hide etherpads with no match
  $(".etherpad").hide();
  $(".highlight").parents(".etherpad").show();
  // update num of matches
  $("#match-num-found").text($(".highlight").length);
  $("#etherpad-num-found").text($(".etherpad:visible").length);
}

$("#reset").on('click', function() {
  $(".keyphrase.active").removeClass("active");
  $(".etherpad").removeHighlight();
  $(".etherpad").show();
  $("#match-num-found").text($(".highlight").length);
  $("#etherpad-num-found").text($(".etherpad:visible").length);
});

$(".keyphrase").on("click", highlighter);
