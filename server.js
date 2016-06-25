var express = require('express');
var app = express();
var habitat = require('habitat');
var request = require('request');
var jsonfile = require('jsonfile');
var _ = require('underscore');
var schedule = require('node-schedule');
var tm = require('text-miner');
var pug = require('pug');
var path = require('path');
var fs = require("fs");

// load env vars from .env file
habitat.load('./.env');
var env = new habitat('', { port: 3000 });
var PORT = env.get('port');

// data source
var ETHERPADS_SLUGS_FILENAME = 'public/data/etherpad-slugs.json';
var ISSUES_FILENAME = 'public/data/issues.json';
var WORD_CLOUD_CATEGORIES_FILENAME = 'public/data/word-cloud-categories.json';
// output files
var ETHERPADS_FILENAME = 'public/data/etherpads.json';
var WORD_MAP_FILENAME = 'public/data/word-map.json';

// app configs
app.use(express.static('public'));
app.set('view engine', 'pug');
app.set('view options', { pretty: true });

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

function generateJson() {
  var file = __dirname + "/" + ETHERPADS_SLUGS_FILENAME;
  var etherpadSlugs = JSON.parse(fs.readFileSync(file, 'utf8'));

  var counter = 0;
  etherpadSlugs.forEach(function(slug) {
    getPadContent(slug, function() {
      counter++;
      if ( counter == etherpadSlugs.length ) {
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

generateJson();

// run every 15 mins
var recurringTask = schedule.scheduleJob('*/15 * * * *', function(){
  etherpads = []; // reset etherpads
  generateJson();
});


app.get('/', function (req, res) {
  var templateFile = "home";
  var data = {
    issues: JSON.parse(fs.readFileSync(__dirname + "/" + ISSUES_FILENAME, 'utf8')),
    etherpads: JSON.parse(fs.readFileSync(__dirname + "/" + ETHERPADS_FILENAME, 'utf8'))
  };
  data.pageClass = templateFile;

  res.render(templateFile, data);
});

app.get('/word-cloud', function (req, res) {
  var templateFile = "word-cloud";
  var file = __dirname + "/" + WORD_CLOUD_CATEGORIES_FILENAME;
  var data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.pageClass = templateFile;

  res.render(templateFile, data);
});


// redirects
app.get('/wordcloud', function (req, res) {
  res.redirect('/word-loud');
});
app.get('/word_cloud', function (req, res) {
  res.redirect('/word-cloud');
});


app.listen(PORT, function () {
  console.log('Example app listening on port ' + PORT);
});
