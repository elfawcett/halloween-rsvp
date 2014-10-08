var Mongo    = require('mongodb').MongoClient;
var mongoUrl = 'mongodb://10.0.3.11:27017/halloween';

var Test = require('assert');

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index');
};

/**
 * saveData
 * Saves data to Mongo or wherever.
 */
exports.saveData = function( req, res ) {
  console.log( req.body )

  // Punch into MongoDB
  Mongo.connect( mongoUrl, function( err, db ) {
    Test.equal( null, err );

    var data = req.body;

    // Collection and authenticate
    var collection = db.collection('2014');

    db.authenticate('fawcett','halloweenparty2014', function( err, result ) {
      Test.equal( null, err );

      // Remove .submit property and add timestamp and friends
      delete data.submit;
      data.timestamp = new Date();
      data.remoteIP  = ( req.headers['X-Forwarded-For'] ) ? req.headers['X-Forwarded-For'] : req.connection.remoteAddress;

      // Insert
      collection.insert( data, function( err, result ) {
        Test.equal( err, null );
        Test.equal( 1, result.length );

        res.send( req.body );

        db.close();
      });
    });
  });

};

/**
 * guests
 * Shows all guest information
 */
exports.guestList = function( req, res ) {
  Mongo.connect( mongoUrl, function( err, db ) {
    Test.equal( null, err );

    // Collection and authenticate
    var collection = db.collection('2014');

    db.authenticate('fawcett','halloweenparty2014', function( err, result ) {
      Test.equal( null, err );

      // Retrieve all data
      var query = {};
      collection.find( query ).toArray( function( err, docs ) {
        Test.equal( null, err );

        res.render('guestList', { guests: docs });

        db.close();
      });
    });
  });
};