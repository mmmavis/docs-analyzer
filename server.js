var express = require('express');
var app = express();
var habitat = require('habitat');
var request = require('request');
var jsonfile = require('jsonfile');

// load env vars from .env file
habitat.load('./.env');
var env = new habitat('', { port: 3000 });
var PORT = env.get('port');

var ETHERPADS_FILENAME = 'public/etherpads.json';
var WORD_MAP_FILENAME = 'public/word_map.json';

// app configs
app.use(express.static('public'));

var ETHERPAD_SLUGS = [
  "mofolondon-mlnproductionbreakoutgroups",
  "Londonrecommendedrestaurants",
  "story",
  "mofolondon-strategicplanvisualdesignforversion",
  "mofo-wow",
  "mofolondon-internetenabledevicesforlearning",
  "mofolondon-openleadershipcurriculumpm",
  "mofolondon-mozfestfuturegoals",
  "mofolondon-commscouncilpmstart",
  "mofolondon-mlnproductionshareouts",
  "mozfest2016-mln",
  "mofolondon-mozfestsciencehub",
  "mofolondon-researchworkshopearlylearningsfromdso",
  "mofolondon-sciencehplanning",
  "mofolondon-mlnfundraisinggrantmanagement",
  "mofolondon-mozfestmarketing",
  "mofolondon-designvisionidentityprocess",
  "mofolondon-mlnmetricsconvenings",
  "mofo-communities",
  "mofolondon-mozfestplan"
];

var etherpads = [];

function getPadContent(slug,callback) {
  var originalUrl = "https://public.etherpad-mozilla.org/p/" + slug;
  request.get(
    originalUrl + "/export/txt",
    function(err, response) {
      var obj = {
        slug: slug,
        originalUrl: originalUrl,
        content: response.body
      }
      etherpads.push(obj);
      callback();
    }
  );
}

function generateJson(list) {
  var counter = 0;
  list.forEach(function(slug) {
    getPadContent(slug, function() {
      counter++;
      if ( counter == list.length ) {
        jsonfile.writeFile(ETHERPADS_FILENAME, etherpads, {spaces: 4}, function (err) {
          console.error(err)
        });
        generateWordCount();
      }
    });
  });
}

function generateWordCount() {
  var words = etherpads.map(function(etherpad) {
    return etherpad.content.replace(/(\r\n|\n|\r|\t)/gm," ");
  }).join(" ").split(" ");
  var wordMap = {};
  words.forEach(function(word) {
    if ( !wordMap[word] ) {
      wordMap[word] = 1;
    } else {
      wordMap[word]++;
    }
  });
  jsonfile.writeFile(WORD_MAP_FILENAME, wordMap, {spaces: 4}, function (err) {
    console.error(err)
  });
}

generateJson(ETHERPAD_SLUGS);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/wordcloud', function (req, res) {
  res.sendFile(__dirname + '/word_cloud.html');
});

app.listen(PORT, function () {
  console.log('Example app listening on port ' + PORT);
});
