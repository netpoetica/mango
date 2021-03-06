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
  if(typeof data === 'string'){
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
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      console.log("-> Mango::Logical::$or", query);

      // This is set by binding to the context of the document called within find (using bind() method)
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
      var _this = this,   // Represents reference to document
          results = null,
          collection = null;

      console.log("DOCUMENT: ", _this.toString(), typeof _this, _this);

      // Should be a single object passed to query
      // Wrap this single document in a throway collection
      collection = new Collection(_this);

      // Could be an object or an array of objects.
      $.each(query, function(queryChildProp, queryChildValue){
        if(!results){
          console.log("----------> Mango::Find::each logic query", queryChildValue);
          results = collection.find(queryChildValue);
        }
      });

      // Only return an array when the array has something in it.
      console.log("RESULTS: ", results);
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

      return results;
    },
    $and: function(query){
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      console.log("-> Mango::Logical::$and", query);

      var _this = this,         // Represents reference to document
          results = [],       // Array elements will ultimately be compared to see if they are the same
          finalResults = null,
          collection = null;

      console.log("DOCUMENT: ", _this.toString(), typeof _this, _this);

      // Should be a single object passed to query
      // Wrap this single document in a throway collection
      collection = new Collection(_this);

      $.each(query, function(queryChildProp, queryChildValue){
        var find = collection.find(queryChildValue);
        if(find){
          results.push(find);
        }
      });

      if(results.length > 1){
        results = $.unique(results);
        console.log("RESULTS: ", results);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        return results;
      }

      return null;

    },
    $not: function(context){

    },
    $nor: function(context){

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

  // Document Model
  var Document = function(){
    this._id = new ObjectID();
    this._v = 0;
  };
  Document.prototype.toString = function(){
    return '[object Mango::Document]';
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
      if(data){
        if($.isPlainObject(data) || data.toString() === '[object Mango::Document]'){
           // Insert 1 record
           _this.insert(data);
        } else if($.isArray(data)){
          var len = data.length,
              i = 0;

          for( ; i < len; i++){
             _this.insert(data[i]);
          }
        } else {
           // Handling case where data passed but did not validate.
           console.log("--> Invalid data type passed to collection: " + typeof data);
           return;
         }
       }

      // Empty collection is okay.
      //
      // Ouput collection to console for debug info.
      console.log("--> Collection contains " +  _this.count() + " documents.");

    };

    // Public API
    this.count = function(){
      //console.log("-> Mango::Collection::count()");
      return _this.length;
    };

    this.find = function(query, /* Optional */projection){
      console.log("-> Mango::Collection::find()");
      if(!query || !$.isPlainObject(query)){
        // Return all documents.
        return _this;
      } else {
        // Store results in all.
        var all = new Collection(),
            // Temp reference save mem
            doc = null,
            // How many documents in this collection?
            len = _this.count();

        console.log("--> Searching " + len + " documents");

        $.each(query, function(queryObjIndex, queryObjValue){
          console.log("-->---------------------------");
          console.log("--> Mango::Find::each query: ", queryObjIndex, queryObjValue);

          // Search all documents.
          $.each(_this, function(collectionItemIndex, collectionItemObj){
            doc = collectionItemObj;
            console.log("----->--------------------------------");
            console.log("-----> Mango::Find::each document("+collectionItemIndex+")");
            console.log("----->--------------------------------");

            // If this particular query is available as a logic filter, run it.
            if(typeof Logical[queryObjIndex] === 'function'){
              // Pass in the document context and more queries to perform a find against $or params
              var result = Logical[queryObjIndex].bind(doc, queryObjValue)();

              if(result){
                // For each document in the result collection
                $.each(result, function(index, elem){
                  all.insert(elem);
                });
              }

            } else {
              // Each document.
              $.each(doc, function(docItemIndex, docItemValue){
                if(typeof docItemValue === 'function'){
                  // Break out of properties that are not significant
                  return;
                }

                console.log("----------> Mango::Find::each property ", docItemIndex, docItemValue);

                // First level check
                if(queryObjIndex === docItemIndex && queryObjValue === docItemValue){
                  all.insert(doc);
                }

              });
              console.log("---> end each document("+collectionItemIndex+")");
            }
          });
          console.log("--> end each query");
        });

        // Wrap as Collection to allow for limiting.
        if(all.toString() === '[object Mango::Collection]' && all.count() > 0){
          // Return the collection
          return all;
        } else {
          // No results found.
          return null;
        }
      }

    };

    this.findOne = function(query, /* Optional */projection){
      console.log("-> Mango::Collection::findOne()");
      return _this.find(query, projection).limit(1);
    };

    this.insert = function(_data){
      //console.log("-> Mango::Collection::insert("+typeof _data+")");
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

            _this.push($.extend(new Document(), _data));

          } else {
            // We have an object {}
            //console.log("--> Collection is of Object type.");
            _this.push($.extend(new Document(), _data));
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
  Collection.prototype = [];
  Collection.prototype.limit = function(num){
    //console.log("-> Collection.limit("+num+")", this);
    return this.slice(0, num);
  };
  Collection.prototype.toString = function(){
    return '[object Mango::Collection]';
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
