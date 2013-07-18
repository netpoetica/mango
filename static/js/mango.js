var Mango = function(
  data  /* Object - Data from static resource */,
  $     /* jQuery - reference to jQuery */
){
  // ////
  // TODO:
  // 1. Implement all of these: http://docs.mongodb.org/manual/reference/operator/
  // ////

  // Pass Mango a data object which it will privatize, proving a public MongoDB-like
  // API & Syntax for searching the "database", even though it's really just a static
  // JSON object.

  // Validate initial input
  // You should be able to pass in stringified JSON, or an object we will stringify for you.
  if(typeof data == 'string'){
    // Should be stringified JSON
    // Validate by parsing JSON  to ensure it doesn't fail.
    try {
      // We actually need parsed JSON to work with these objects behind the scenes.
      data = JSON.parse(data);
    } catch(e){
      if(e){
        console.log("-> Mango Error: invalid JSON string passed to Mango, parse error: ", e);
        // break out of flow.
        return false;
      }
    }
  } else if($.isPlainObject(data)){
    // Stringify this object just as a precaution - ensure user is providing valid JSON objects.
    try {
      JSON.stringify(data);
    } catch(e){
      if(e){
        console.log("-> Mango Error: invalid, JSON-compatible object passed to Mango, stringify error: ", e);
        // break out of flow.
        return false;
      }
    }
  } else {
    // Check and make sure we have a JS object here.
    console.log("-> Mango Error: null or invalid initial data provided.");
    return false;
  }

  // ////////////////// //
  // Private Attributes //
  // ////////////////// //
  var store = $.extend({}, data),     // Store will hold a mutable version of original data.
      collections = {},               // All collections which can be operated on via public API.
      ids = [];                       // Used IDs.

  // //////////////////// //
  // Static Value Objects //
  // //////////////////// //
  /*
   *
   * PROJECTIONS
   * Expecting the context of the current search.
   *
   * $           - Projects the first element in an array that matches the query condition.
   * $elemMatch  - Projects only the first element from an array that matches the specified $elemMatch condition.
   * $slice      - Limits the number of elements projected from an array. Supports skip and limit slices.
   *
   */
  var Projections = {
    $: function(context){
      console.log("-> Projections[$]....");
    },
    $elemMatch: function(context){
      console.log("-> Projections[$elemMatch]....");
    },
    $slice: function(context){
      console.log("-> Projections[$slice]....");
    }
  };
  //http://docs.mongodb.org/manual/reference/operator/
  var QuerySelectors = {
    $all: function(context){
      //Matches arrays that contain all elements specified in the query.

    },
    $gt: function(context){
      //
    },
    $gte: function(context){
      //
    },
    $in: function(context){
      //
    },
    $lt: function(context){
      //
    },
    $lte: function(context){
      //
    },
    $ne: function(context){
      //
    },
    $nin: function(context){
      //
    }
 };
 var Logical = {
    $or: function(query){
      console.log("-> Mango::Logical::$or", query);

      // This is set by binding to the context of the document called within find (using bind() method)
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
      var _this = this,   // Represents reference to document
          results = [],
          collection = null;

      console.log("DOCUMENT: ", _this);

      // Query can be an array or a single object.
      $.each(query, function(queryObjIndex, queryObjValue){
        //console.log("each query: ",this);
        collection = new Collection(_this);
        results.push(collection.find(this));
      });

      // Only return an array when the array has something in it.
      console.log("RESULTS: ", results);
      return results.length ? results: null;

    },
    $and: function(context){

    },
    $not: function(context){

    },
    $not: function(context){

    }
 };
 var Element = {
    $exists: function(context){

    },
    $mod: function(context){

    },
    $type: function(context){

    }
 };
 var JavaScript = {
    $where: function(context){
      // Matches documents that satisfy a JavaScript expression.
    },
    $regex: function(context){
      // Selects documents where values match a specified regular expression.
    }
 };

  // ////// //
  // MODELS //
  // ////// //
  // ObjectID Model
  var ObjectID = function(){
    //console.log("-> Mango::new ObjectId()");
    var id = 0;

    if(ids.indexOf(id) > -1){
      return new ObjectId();
    }

    return id;
  };

  // Collection Model
  var Collection = function(data){
    // data - obj or array of objects
    // data is document or an array of documents. Documents can be arrays or objects.
    console.log("--------------------------");
    console.log("-> Mango::new Collection()");

    var _this = this;

    // Private Methods
    function _init(){
      if($.isPlainObject(data)){
         // Insert 1 record
         _this.insert(data);
      } else if($.isArray(data)){
       var len = data.length,
           i = 0;

       for( ; i < len; i++){
          _this.insert(data[i]);
       }
      } else {
          console.log("--> Invalid data type passed to collection: " + typeof data);
      }

      // Ouput collection to console for debug info.
      console.log("--> Collection contains " +  _this.count() + " documents.");
    }

    // Public API
    this.count = function(){
      console.log("-> Mango::Collection::count()");
      return _this.length;
    };

    this.find = function(query, /* Optional */projection){
      console.log("-> Mango::Collection::find()");
      if(!query || !$.isPlainObject(query)){
        // Return all documents.
        return _this;
      } else {
        // Store results in all.
        var all = [],
            // Temp reference save mem
            doc = null,
            // How many documents in this collection?
            len = _this.count();

        // Search all documents.
        while(len--){
          doc = _this[len];
          //console.log("ITEM: ", item);
          // Each document.
          $.each(doc, function(docItemIndex, docItemValue){
            //console.log("each doc: ", docItemIndex, docItemValue);
            // Handle a seach where the value of individual attributes equals the query exactly
            /*if(value === query || JSON.stringify(value) === JSON.stringify(query)){
              if(projection){
                var result = checkProjection(projection, value);
                if(result){
                  all.push(result);
                }
              } else {
                  // Return document if match is found
                  all.push(item);
              }
            }
            */
            $.each(query, function(queryObjIndex, queryObjValue){
              console.log("each query: ", queryObjIndex, queryObjValue);
              // First level check
              if(queryObjIndex === docItemIndex && queryObjValue === docItemValue){
                all.push(doc);
              }
              // If this particular query is available as a logic filter, run it.
              if(typeof Logical[queryObjIndex] === 'function'){
                // Pass in the document context and more queries to perform a find against $or params
                var result = Logical[queryObjIndex].bind(doc, queryObjValue)();
                if(result){
                  all.push(result);
                }
              }
            });
          });
        }
        // Wrap as Collection to allow for limiting.
        return new Collection(all);
      }
    };
    this.findOne = function(query, /* Optional */projection){
      console.log("-> Mango::Collection::findOne()");
      return _this.find(query, projection).limit(1);
    };
    this.insert = function(_data){
      console.log("-> Mango::Collection::insert("+typeof _data+")");
      // Inserts a record into a collection. If item passed in is not an object, it gets wrapped in one.
      // Handle various types of data that may have been passed to a collection
      switch(typeof _data){
        case 'object':
          // Is it an array or actual object?
          if($.isArray(_data)){
            //console.log("--> Collection is of Array type.");
            var len = _data.length,
                i = 0,
                items = {};

            // Make individual elements part of this array
            for( ; i < len; i++){
              items[i] = _data[i];
            }

            _this.push($.extend({ _id: new ObjectID(), _v: 0 }, _data));

          } else {
            // We have an object {}
            //console.log("--> Collection is of Object type.");
            _this.push($.extend({ _id: new ObjectID(), _v: 0 }, _data));
          }
          break;
        default:
          console.log("--> Invalid data type passed to record: " + typeof _data);
          break;
      }
    };

    this.remove = function(query, /* Optional */bJustOne){
      console.log("-> Mango::Collection::remove()");
      //_this.find(query)
      // if found, delete it. Use slice, not "delete", to make sure the array doesn't contain undefined elements
    };
    this.save = function(docOrArray){
      console.log("-> Mango::Collection::save()");
      // _this.find(query)
      // increment version number
      // possibly store old one in history
      // replace as specified index
    };

    // Initialize after public API methods defined.
    _init();

  };

  // Make a collection an array with extra functions.
  Collection.prototype = new Array();
  Collection.prototype.limit = function(num){
    //console.log("-> Collection.limit("+num+")", this);
    return this.slice(0, num);
  };

  // Go through all of the data in the store, turning it into collections.
  (function _init(){
    console.log("-> Mango::init(",store,")");
    var keys = Object.keys(store),
        len = keys.length;

    while(len--){
      collections[keys[len]] = new Collection(store[keys[len]]);
    }

  }());

  // //////////////// //
  //  Private Methods //
  // //////////////// //
  var checkProjection = function(s, context){
    console.log("-> Mango::checkProjection(" + s + "," + typeof context + ")");
    if(typeof s === 'string' && typeof projections[s] === 'function'){
      projections[s](context);
    }
  };
  // /////////// //
  //  Public API //
  // /////////// //
  /*
     Reference: http://docs.mongodb.org/manual/reference/method/
     Implements:
      - db.getCollection()
      - db.getCollectionNames()
      - db.collection.*
        - count()
        - find()
        - findOne()
        - findAndModify()
        - insert()
        - remove()
        - save()
  */

  this.getCollection = function(name){
    console.log("-> Mango::getCollection(" + name + ")");
    return collections[name] || null;
  };

  this.getCollectionNames = function(){
    console.log("-> Mango::getCollectionNames()");
    return Object.keys(store);
  };

};
