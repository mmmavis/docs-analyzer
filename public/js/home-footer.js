var SCROLL_OFFSET = 150;
var MARK_OPTIONS = {
  // see docs on https://markjs.io#mark
  element: "span",
  className: "marked",
  separateWordSearch: false,
  accuracy: "exactly"
};
var highlightIndex = 0, highlightCount = 0;

$("#search-result .help-text").show();
$("#search-result .status").hide();
$("#etherpad-num-found").text($(".etherpad:visible").length);

var issueHighlighter = function(event) {

  var $selected = $(this);
  resetHighlight();

  var keyphrases = $selected.data("keyphrases").split(",");
  if ( !$selected.hasClass("active") ) {
    $(".etherpad").mark(keyphrases,MARK_OPTIONS);
  }
  $selected.addClass("active");

  // hide etherpads with no match and show etherpads with matches
  $(".etherpad").hide();
  $(".marked").parents(".etherpad").show();

  // scroll to the first match
  var newPosition = getScrollPosition($(".marked").eq(0));
  $("html, body").animate({
    scrollTop: newPosition
  });

  // update num of matches
  updateNumOfMatches();
};

function scrollToHighlight(highlightIndex) {
  // todo display 1 of ...
  var highlightCurrent = highlightIndex + 1;
  $("#match-index").text(highlightCurrent);
  var newPosition = getScrollPosition($(".marked").eq(highlightIndex));
  $("html, body").animate({
    scrollTop: newPosition
  }, 600);      
}


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
  $(".etherpad").unmark();
  // scroll to page top
  $("html, body").animate({
    scrollTop: 0
  }, 200);
  // remove all the "match dot"
  $(".match").remove();
  $(".etherpad-nav").hide();
}

function updateNumOfMatches() {
  highlightIndex = 0; 
  var highlightLength = $(".marked").length;
  highlightCount = highlightLength - 1;
  // update num of matches
  $("#match-num-found").text(highlightLength);
  $("#etherpad-num-found").text($(".etherpad:visible").length);
  // toggle status and help-text accordingly
  $("#search-result .help-text").hide();
  $("#search-result .status").show();
  // nav highlights
  var highlightCurrent = highlightIndex + 1;
  $("#match-index").text(highlightCurrent);
}

function getScrollPosition($elem) {
  return $elem.offset().top - SCROLL_OFFSET;
}

$(".issue a").on("click", issueHighlighter);


function handleHighlightNav() {
  var $prev = $("#etherpad-nav .prev");
  var $next = $("#etherpad-nav .next");

  $prev.on("click", function(){
      highlightIndex -= 1;
      if (highlightIndex < 0) { highlightIndex = highlightCount; }
      scrollToHighlight(highlightIndex);
  });    
  $next.on("click", function(){
      highlightIndex += 1;
      if (highlightIndex > highlightCount) { highlightIndex = 0; }
      scrollToHighlight(highlightIndex);
  });
}
handleHighlightNav();

