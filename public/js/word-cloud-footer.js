var wordsToSkip = [
  "==========================================================================",
  "__________________________"
];

$("#word-cloud-container .loading").hide();

$.ajax("data/source/word-cloud-categories.json")
  .done(function(cloudNavData) {
    $("#word-cloud-nav h3").on("click", function() {
      var options = {
        wordsToSkip: wordsToSkip
      };
      $("#word-cloud-nav h3").removeClass("active");
      $(this).addClass("active");
      $("#word-cloud-container .loading").show();
      $("#cloud").hide();

      var index = $("#word-cloud-nav h3").index($(this));

      setTimeout(function(){
        var threshold = 3;
        if ( index != 0 ) {
          options.wordsToInclude = cloudNavData.categories[index].keyphrases;
          threshold = 0;
        }
        makeCloud(options,threshold);
      }, 1000);


    });
});
