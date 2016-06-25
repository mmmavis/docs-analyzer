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
      .size([600, 600])
      .words(cloned)
      .rotate(function() { return ~~(Math.random()*2) * 90;}) // 0 or 90deg
      .fontSize(function(d) { return d.size; })
      .on('end', drawCloud)
      .start();
  }
  // from https://www.pubnub.com/blog/2014-10-09-quick-word-cloud-from-a-chatroom-with-d3js/
  function drawCloud(words) {
    d3.select('#cloud').html("").append('svg')
      .attr('width', 600).attr('height', 600)
      .attr("viewBox", "-300 -300 600 600")
      .append('g')
      .selectAll('text')
      .data(words)
      .enter().append('text')
      .style('font-size', function(d) { return d.size + 'px'; })
      .style('font-family', function(d) { return d.font; })
      .style('fill', function(d, i) { 
        return randomColor({
           luminosity: 'random',
           hue: 'random'
        }); 
      })
      // .style('fill', function(d, i) { return "black"; })
      .attr('text-anchor', 'middle')
      .attr('transform', function(d) {
        return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
      })
      .text(function(d) { return d.text; });
  }

}

