var express = require('express');
var app = express();
var habitat = require('habitat');
var request = require('request');
var jsonfile = require('jsonfile');
var _ = require('underscore');
var schedule = require('node-schedule');
var tm = require('text-miner');

// load env vars from .env file
habitat.load('./.env');
var env = new habitat('', { port: 3000 });
var PORT = env.get('port');

var ETHERPADS_FILENAME = 'public/data/etherpads.json';
var WORD_MAP_FILENAME = 'public/data/word_map.json';

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
      try {
        var obj = {
          slug: slug,
          originalUrl: originalUrl,
          content: response.body
        }
        etherpads.push(obj);
      } catch(e) {

      }
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
          if (err) console.error(err);
          console.log("[Updated] " + ETHERPADS_FILENAME);
        });
        generateWordCount(function() {
          console.log("[Updated] " + WORD_MAP_FILENAME);
        });
      }
    });
  });
}

function generateWordCount(callback) {
  var rawEtherpadContent = etherpads.map(function(etherpad){
    return etherpad.content.replace(/(\r\n|\n|\r|\t)/gm," ")
                           .replace(/\,/g, " ")
                           .replace(/\!/g, " ")
                           .replace(/\?/g, " ")
                           .replace(/\(/g, " ")
                           .replace(/\)/g, " ");
  });

  var my_corpus = new tm.Corpus(rawEtherpadContent);
  var terms = new tm.Terms(my_corpus);
  var termsArray = terms.findFreqTerms(0).map(function(term) {
    return { text: term.word, size: term.count };
  }).filter(function(term) {
    return tm.STOPWORDS.EN.indexOf(term.text) < 0 && term.text[term.text.length-1] != ".";
  });
  termsArray = _.sortBy(termsArray, 'size').reverse();

  jsonfile.writeFile(WORD_MAP_FILENAME, termsArray, {spaces: 4}, function (err) {
    if (err) console.error(err);
    callback();
  });
}

generateJson(ETHERPAD_SLUGS);

// run every 10 mins
var recurringTask = schedule.scheduleJob('*/10 * * * *', function(){
  etherpads = []; // reset etherpads
  generateJson(ETHERPAD_SLUGS);
});


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/wordcloud', function (req, res) {
  res.redirect('/word_cloud');
});

app.get('/word_cloud', function (req, res) {
  res.sendFile(__dirname + '/word_cloud.html');
});

app.listen(PORT, function () {
  console.log('Example app listening on port ' + PORT);
});
