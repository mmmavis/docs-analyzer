var wordsToSkip = [
  "==========================================================================",
  "__________________________"
];

$.ajax("data/source/word-cloud-categories.json")
  .done(function(cloudNavData) {
    $("#word-cloud-nav h3").on("click", function() {
      var options = {
        wordsToSkip: wordsToSkip
      };
      $("#word-cloud-nav h3").removeClass("active");
      $(this).addClass("active");

      var index = $("#word-cloud-nav h3").index($(this));
      if ( index == 0 ) {
        makeCloud(options,5);
      } else {
        options.wordsToInclude = cloudNavData.categories[index].keyphrases;
        makeCloud(options,0);
      }
    });
});
