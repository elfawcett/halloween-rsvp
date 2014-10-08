var Test = require('assert');

var Mongo    = require('mongodb').MongoClient;
var mongoUrl = 'mongodb://10.0.3.11:27017/halloween';

var collectionYear = String( new Date().getFullYear() );
var auth           = ['fawcett', 'halloweenparty2014'];
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
  // Reject incomplete forms
  var formValid = true;
  if ( req.body.guestName == undefined || req.body.guestName == '' ) formValid = false;
  if ( req.body.guestNumber == undefined || req.body.guestNumber == '' ) formValid = false;
  if ( req.body.guestFood == undefined || req.body.guestFood == '' ) formValid = false;

  if ( !formValid ) {
    res.render('index', { errorMessage: 'Fill out the form!' });
    return false;
  }

  // Punch into MongoDB
  Mongo.connect( mongoUrl, function( err, db ) {
    Test.equal( null, err );

    var data = req.body;

    // Collection and authenticate
    var collection = db.collection( collectionYear );

    db.authenticate( auth[0], auth[1], function( err, result ) {
      Test.equal( null, err );

      // Remove submit property
      delete data.submit;

      // Query
      query = {
        guestName   : data.guestName
      , guestFood   : data.guestFood
      , guestNumber : data.guestNumber
      };

      // Check for duplicate
      collection.find( query ).toArray( function( err, result ) {

        if ( result.length === 0 ) {
          // Add timestamp and friends
          data.timestamp = new Date();
          data.remoteIP  = ( req.headers['X-Forwarded-For'] ) ? req.headers['X-Forwarded-For'] : req.connection.remoteAddress;

          // Insert
          collection.insert( data, function( err, result ) {
            console.log( err || result )
            // Remove some sensitives
            var data = result[0];
            delete data.remoteIP;
            delete data._id;

            res.render('thanks', { data: data });
            db.close();
          });
        } else {
          res.render('index', { errorMessage: 'An entry like that already exists.' });
          db.close();
        }

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
    var collection = db.collection( collectionYear );

    db.authenticate( auth[0], auth[1], function( err, result ) {
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

/**
 * clearAllGuests
 * Removes all guests from the DB
 */
exports.clearAllGuests = function( req, res ) {
  // Check for a valid passcode
  if ( !req.params['passcode'] || req.params['passcode'] !== 'neenis') {
    res.send('Not authorized to do this.');
    return false;
  }

  Mongo.connect( mongoUrl, function( err, db ) {
    Test.equal( null, err );

    // Collection and authenticate
    var collection = db.collection( collectionYear );

    db.authenticate( auth[0], auth[1], function( err, result ) {
      // Empty collection
      collection.drop( function( err, reply ) {
        if ( err ) {
          res.send( err );
          db.close();
        } else {
          res.send( reply );
          db.close();
        }

      });
    });
  })
};