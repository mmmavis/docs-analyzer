var WORD_MAP;

function loadWordMap(callback) {
  $.ajax({
    url: "data/word-map.json"
  })
  .done(function(response) {
    WORD_MAP = response;
    callback();
  });
}

function filterWordMap(options, threshold) {
  var data = WORD_MAP.filter(function(obj) {
    var passed = obj.size > threshold && options.wordsToSkip.indexOf(obj.text) < 0;
    if ( options.wordsToInclude ) {
      return passed && options.wordsToInclude.indexOf(obj.text) >= 0
    }
    return passed;
  });
  
  return data;
}

function makeCloud(options, threshold) {
  var WIDTH = 900;
  var HEIGHT = 600;

  options.wordsToSkip = options.wordsToSkip ? options.wordsToSkip : [];

  if ( !WORD_MAP ) {
    loadWordMap(function() {
      // filterWordMap(options, threshold);
      calculateCloud( filterWordMap(options, threshold) );
    })
  } else {
    // filterWordMap(options, threshold);
    calculateCloud( filterWordMap(options, threshold) );
  }

  // from https://www.pubnub.com/blog/2014-10-09-quick-word-cloud-from-a-chatroom-with-d3js/
  function calculateCloud(data) {
    var cloned = data.map(function(obj) {
      return obj
    });
    d3.layout.cloud()
      .size([WIDTH, HEIGHT])
      .words(cloned)
      .rotate(function() { return ~~(Math.random()*2) * 90;}) // 0 or 90deg
      .font("Open Sans")
      .fontSize(function(d) { return d.size; })
      .padding(function() { return 2; })
      // .spiral("rectangular")
      .on('end', drawCloud)
      .start();
  }
  // from https://www.pubnub.com/blog/2014-10-09-quick-word-cloud-from-a-chatroom-with-d3js/
  function drawCloud(words) {
    d3.select('#cloud').html("").append('svg')
      .attr('width', WIDTH).attr('height', HEIGHT)
      .attr("viewBox", "-500 -300 " + WIDTH + " " + HEIGHT)
      .append('g')
      .selectAll('text')
      .data(words)
      .enter().append('text')
      .style('font-size', function(d) { return d.size + 'px'; })
      .style('font-family', function(d) { return d.font; })
      // .style('fill', function(d, i) { 
      //   console.log(d);
      //   var red = Math.floor(Math.random()*256);
      //   var green = Math.floor(Math.random()*256);
      //   var blue = Math.floor(Math.random()*256);
      //   return "rgb(" + red + ", " + green + ", " + blue + ")";
      // })
      .style('fill', function(d, i) { 
        // mozilla.org colours
        var colors = [ "#C03F3A", "#E55525", "#005DA5", 
                       "#95368C", "#5B88C6", "#E24A60", 
                       "#1D96DB", "#ADB1CE", "#71BE4C",
                       "#759839", "#D4ADD0", "#E19C83" ];
        return colors[ Math.floor(Math.random()*colors.length) ];
      })
      .attr('text-anchor', 'middle')
      .attr('transform', function(d) {
        return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
      })
      .text(function(d) { return d.text; });
  }

}

