$("#search-result .help-text").show();
$("#search-result .status").hide();
$("#etherpad-num-found").text($(".etherpad:visible").length);

$(".scanner-mask").hide();

var issueHighlighter = function(event) {
  $("#etherpads-container .scanner").remove();
  $("#etherpads-container").prepend("<div class='scanner'></div>");
  $(".scanner-mask").show();

  var $selected = $(this);

  // wait for scanning animation to finish first
  setTimeout(function(){
    $(".scanner-mask").hide();

    resetHighlight();

    var keyphrases = $selected.data("keyphrases").split(",");
    if ( !$selected.hasClass("active") ) {
      keyphrases.forEach(function(keyphrase) {
        $(".etherpad").highlight(keyphrase);
      });
    }
    $selected.addClass("active");

    // hide etherpads with no match
    $(".etherpad").hide();
    $(".highlight").parents(".etherpad").show();

    // update num of matches
    updateNumOfMatches();

    $(".highlight").each(function() {
      var $dot = $("<a class='match'>&#9632;</a>");
      $dot.on("click", function() {
        var index = $selected.parents(".issue").find(".match").index($(this));
        $("html, body").animate({
          scrollTop: $(".highlight").eq(index).offset().top - 50
        }, 600);
      });

      $selected.parents(".issue").find(".matches").append($dot);
    });

  }, 1000);
};

$("#reset").on('click', function() {
  resetHighlight();
  // make all Etherpads visible
  $(".etherpad").show();
  // update num of matches
  updateNumOfMatches();
  // toggle status and help-text accordingly
  $("#search-result .help-text").show();
  $("#search-result .status").hide();
});

function resetHighlight() {
  // clear previously highlighted
  $(".issue a.active").removeClass("active");
  $(".etherpad").removeHighlight();
  // scroll to page top
  $("html, body").animate({
    scrollTop: 0
  }, 200);
  // remove all the "match dot"
  $(".match").remove();
}

function updateNumOfMatches() {
  // update num of matches
  $("#match-num-found").text($(".highlight").length);
  $("#etherpad-num-found").text($(".etherpad:visible").length);
  // toggle status and help-text accordingly
  $("#search-result .help-text").hide();
  $("#search-result .status").show();
}

$(".issue a").on("click", issueHighlighter);
