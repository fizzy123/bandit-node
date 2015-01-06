var ff = require('ff');
var async = require('async');

var BanditSchema = new mongoose.Schema({
  name: String,
  cases: {},
  totalN: Number
},{
  autoIndex: true
});

var Bandit = mongoose.model('Bandit', BanditSchema);
module.exports.test = function(name, caseNames, next) {
  'use strict';
  var bandit;
  var f = ff(function () {
    Bandit.findOne({name:name}).exec(f.slot());
  }, function (doc) {
    if (!doc) {
      bandit = new Bandit({
        name: name,
        totalN: caseNames.length,
        cases: {}
      });
      async.each(caseNames, function (caseName, cb) {
        bandit.cases[caseName] = {};
        bandit.cases[caseName].n = 1;
        bandit.cases[caseName].avg = 0;
        cb();
      }, f.wait());
    } else {
      bandit = doc;
      if (Object.keys(bandit.cases).sort().join(',') !== caseNames.sort().join(',')) {
        bandit.cases = {}
        async.each(caseNames, function (caseName, cb) {
          bandit.cases[caseName] = {};
          bandit.cases[caseName].n = 1;
          bandit.cases[caseName].avg = 0;
          cb();
        }, f.wait()) ;
        bandit.totalN = caseNames.length;
      }
    }
  }, function () {
    var winner = Object.keys(bandit.cases).sort(function(a, b) {
      return (
        bandit.cases[b].avg + 
        Math.sqrt(
          2*
          Math.log(bandit.totalN)/
          bandit.cases[b].n
        )) - (
        bandit.cases[a].avg + 
        Math.sqrt(
          2*
          Math.log(bandit.totalN)/
          bandit.cases[a].n
        ));
    })[0];
    bandit.cases[winner].n += 1;
    bandit.totalN += 1;
    bandit.avg = (bandit.cases[winner].avg *  (bandit.cases[winner].n - 1)) / bandit.cases[winner].n;
    bandit.markModified('cases');
    bandit.save();
    f.pass({name:name,case:winner});
  }).onError(function(err) {
    console.log(err.stack);
  }).onSuccess(function(winner) {
    next(null, winner);
  })
}

module.exports.routes = function(app) {
  'use strict';
  app.post('/bandit', function (req, res) {
    var bandit;
    var f = ff(function () {
      Bandit.findOne({name:req.body.name}).exec(f.slot())
    }, function (doc) {
      if (!doc) {
        return f.fail({stack:'error in /bandit/:name/:case in bandit.js'})
      } else {
        bandit = doc;
        bandit.cases[req.body.case].avg = (bandit.cases[req.body.case].avg * bandit.cases[req.body.case].n + 1) / bandit.cases[req.body.case].n;
        bandit.markModified('cases');
        bandit.save();
      }
    })
  })
}
