// for more documentation, 
// cf. http://dev.iks-project.eu:8081/entityhub#
// 
// find()
// lookup()
// referenced()
// ldpath()
// query()
// createEntity() alias save()
// readEntity() alias load()
// udpateEntity()
// deleteEntity()
// getMapping()
// 

(function(){
		
    jQuery.extend(true, VIE.prototype.StanbolConnector.prototype, {
        
		// ### find(term, limit, offset, success, error, options)
		// This method finds entities given the term from the entity hub and 
    	// returns the result by the success callback.  
		// **Parameters**:  
		// *{string}* **term** The term to be searched for. (The name of the 
    	// Entity to search. Supports '*' and '?')
		// *{int}* **limit** The limit of results to be returned. (The maximum 
    	//		number of returned Entities) 
		// *{int}* **offset** The offset to be search for. (The offset of the 
    	//		first returned Entity)  
		// *{function}* **success** The success callback.  
		// *{function}* **error** The error callback.  
		// *{object}* **options** Options, like the output ```format```. 
    	// If ```local``` is set, only the local entities are accessed. 
    	// Search-related options are:
    	// * field: The name of the field to search the term (optional, default 
    	//		is "http://www.iks-project.eu/ontology/rick/model/label")
    	// * lang: The language of the parsed name (default: any)
    	// * select: A list of fields included for returned Entities
    	// * ldpath: The LDPath program executed for entities selected by the 
    	//		find query. The LDPath program needs to be URLEncoded
		// **Throws**:  
		// *nothing*  
		// **Returns**:  
		// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
		// **Example usage**:  
		//
		//		     var stnblConn = new vie.StanbolConnector(opts);
		//		     stnblConn.find("Bisho", 10, 0,
		//		                 function (res) { ... },
		//		                 function (err) { ... });
		find: function(term, limit, offset, success, error, options) {
			options = (options)? options :  {};
			/* curl -X POST -d "name=Bisho&limit=10&offset=0" http://localhost:8080/entityhub/sites/find */

			var connector = this;

			if (!term || term === "") {
				error ("No term given!");
				return;
			}

			offset = (offset)? offset : 0;
			limit  = (limit)? limit : 10;
			var data = "name=" + term + "&limit=" + limit + "&offset=" + offset;
			if (options.field) {
				data += "&field=" + options.field;
			}
			if (options.lang) {
				data += "&lang=" + options.lang;
			}
			if (options.select) {
				data += "&select=" + options.select;
			}
			if (options.ldpath) {
				data += "&ldpath=" + options.ldpath;
			}
			
			connector._iterate({
				method : connector._find,
				methodNode : connector._findNode,
				success : success,
				error : error,
				url : function (idx, opts) {
					var site = (opts.site)? opts.site : this.options.entityhub.site;
					site = (site)? "/" + site : "s";

					var isLocal = opts.local;

					var u = this.options.url[idx].replace(/\/$/, '') + this.options.entityhub.urlPostfix;
					if (isLocal) {
						u += "/find";
					} else {
						u += "/site" + site + "/find";
					}

					return u;
				},
				args : {
					auth : this.options.auth,
					data : data,
					format : options.format || "application/rdf+json",
					options : options
				},
				urlIndex : 0
			});
		},

		_find : function (url, args, success, error) {
			jQuery.ajax({
				beforeSend : function(req) {
		            req.setRequestHeader('Authorization', args.auth);
		          },
				success: success,
				error: error,
				url: url,
				type: "POST",
				data: args.data,
				dataType: args.format,
				contentType : "application/x-www-form-urlencoded",
				accepts: {"application/rdf+json": "application/rdf+json"}
			});
		},

		_findNode: function(url, args, success, error) {
			var request = require('request');
			var r = request({
				method: "POST",
				uri: url,
				body : args.data,
				headers: {
					Accept: "application/rdf+json",
					'Data-Type': args.format,
					'Content-Type': application/x-www-form-urlencoded
				}
			}, function(err, response, body) {
				try {
					success({results: JSON.parse(body)});
				} catch (e) {
					error(e);
				}
			});
			r.end();
		},

		

		// ### lookup(uri, success, error, options)
		// checks if an entity (specified by **uri**) is available on the local
		// entityhub. If 'create : true' is specified in the **options** object,
		// then the entity will be reference on the local entityhub in case it
		// is doesn't live there already.
		// **Parameters**:  
		// *{string}* **uri** The URI of the entity to be loaded.  
		// *{function}* **success** The success callback.  
		// *{function}* **error** The error callback.  
		// *{object}* **options** Options, ```create```.
		//		    If the parsed ID is a URI of a Symbol, than the stored information of the Symbol are returned in the requested media type ('accept' header field).
		//		    If the parsed ID is a URI of an already mapped entity, then the existing mapping is used to get the according Symbol.
		//		    If "create" is enabled, and the parsed URI is not already mapped to a Symbol, than all the currently active referenced sites are searched for an Entity with the parsed URI.
		//		    If the configuration of the referenced site allows to create new symbols, then the entity is imported in the Entityhub, a new Symbol and EntityMapping is created and the newly created Symbol is returned.
		//		    In case the entity is not found (this also includes if the entity would be available via a referenced site, but create=false) a 404 "Not Found" is returned.
		//		    In case the entity is found on a referenced site, but the creation of a new Symbol is not allowed a 403 "Forbidden" is returned.   
		// 		In the **options** parameter, you can specify the ```accept```
		//		format of the returned data. (default is application/json). 
		//		Available are:
		// 		application/rdf+json,
		//		application/rdf+xml,
		//		application/x-turtle,
		// 		text/rdf+n3,
		// 		text/rdf+nt,
		// 		text/turtle
		// **Throws**:  
		// *nothing*  
		// **Returns**:  
		// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
		lookup: function(uri, success, error, options) {
			options = (options)? options :  {};
			var accept = (options.accept) ? options.accept : "application/json";
			
			/*/lookup/?id=http://dbpedia.org/resource/Paris&create=false"*/
			
			var connector = this;

			uri = uri.replace(/^</, '').replace(/>$/, '');

			options.uri = uri;
			options.create = (options.create)? options.create : false;

			connector._iterate({
				method : connector._lookup,
				methodNode : connector._lookupNode,
				success : success,
				error : error,
				url : function (idx, opts) {

					var u = this.options.url[idx].replace(/\/$/, '') + this.options.entityhub.urlPostfix;
					u += "/lookup?id=" + escape(opts.uri) + "&create=" + opts.create;
					return u;
				},
				args : {
					auth : this.options.auth,
					accept : accept,
					format : options.format || "application/rdf+json",
					options : options
				},
				urlIndex : 0
			});
			
		},

		_lookup : function (url, args, success, error) {
			jQuery.ajax({
				beforeSend: function(xhrObj) {
	    			xhrObj.setRequestHeader("Accept", args.accept);
//	    			xhrObj.setRequestHeader('Authorization', args.auth);
				},
				success: success,
				error: error,
				url: url,
				type: "GET",
				contentType: "text/plain"
			});
		},

		_lookupNode: function(url, args, success, error) {
			var request = require('request');
			var r = request({
				method: "GET",
				uri: url,
				body: args.text,
				headers: {
					Accept: args.accept
				}
			}, function(err, response, body) {
				try {
					success({results: JSON.parse(body)});
				} catch (e) {
					error(e);
				}
			});
			r.end();
		},


		// ### referenced(success, error, options)
		// This method returns a list of all referenced sites that the entityhub
		// comprises.  
		// **Parameters**:  
		// *{function}* **success** The success callback.  
		// *{function}* **error** The error callback.  
		// *{object}* **options** Options, unused here.   
		// **Throws**:  
		// *nothing*  
		// **Returns**:  
		// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
		// **Example usage**:  
		//
		//		var stnblConn = new vie.StanbolConnector(opts);
		//		stnblConn.referenced(
		//		function (res) { ... },
		//		function (err) { ... });  
		referenced: function(success, error, options) {
			options = (options)? options :  {};
			var connector = this;

			var successCB = function (sites) {
				if (_.isArray(sites)) {
					var sitesStripped = [];
					for (var s = 0, l = sites.length; s < l; s++) {
						sitesStripped.push(sites[s].replace(/.+\/(.+?)\/?$/, "$1"));
					}
					return success(sitesStripped);
				} else {
					return success(sites);
				}
			};

			connector._iterate({
				method : connector._referenced,
				methodNode : connector._referencedNode,
				success : successCB,
				error : error,
				url : function (idx, opts) {
					var u = this.options.url[idx].replace(/\/$/, '');
					u += this.options.entityhub.urlPostfix + "/sites/referenced";

					return u;
				},
				args : {
					auth : this.options.auth,
					options : options
				},
				urlIndex : 0
			});
		},

		_referenced : function (url, args, success, error) {
			jQuery.ajax({
//				beforeSend : function(req) {
//		            req.setRequestHeader('Authorization', args.auth);
//		          },
				success: success,
				error: error,
				url: url,
				type: "GET",
				accepts: {"application/rdf+json": "application/rdf+json"}
			});
		},

		_referencedNode: function(url, args, success, error) {
			var request = require('request');
			var r = request({
				method: "GET",
				uri: url,
				headers: {
					Accept: "application/rdf+json"
				}
			}, function(err, response, body) {
				try {
					success({results: JSON.parse(body)});
				} catch (e) {
					error(e);
				}
			});
			r.end();
		},

        // ### ldpath(query, success, error, options)
        // execute an LDPath program on one or more Entities (contexts). 
		// Produces an RDF Graph with the parsed context(s) as subject the field
		// selected by the LDPath program as properties and the selected values
		// as object.  
        // **Parameters**:
        // *{function}* **success** The success callback.  
        // *{function}* **error** The error callback.  
        // *{object}* **options** Options, unused here.   
        // **Throws**:  
        // *nothing*  
        // **Returns**:  
        // *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
        ldpath: function(ldpath, context, success, error, options) {
            options = (options)? options :  {};
            var connector = this;

            context = (_.isArray(context))? context : [ context ];

            var contextStr = "";
            for (var c = 0; c < context.length; c++) {
                contextStr += "&context=" + context[c];
            }

            connector._iterate({
                method : connector._ldpath,
                methodNode : connector._ldpathNode,
                success : success,
                error : error,
                url : function (idx, opts) {
                    var site = (opts.site)? opts.site : this.options.entityhub.site;
                    site = (site)? "/" + site : "s";

                    var isLocal = opts.local;

                    var u = this.options.url[idx].replace(/\/$/, '') + this.options.entityhub.urlPostfix;
                    if (!isLocal)
                        u += "/site" + site;
                    u += "/ldpath";

                    return u;
                },
                args : {
                	auth : this.options.auth,
                    ldpath : ldpath,
                    context : contextStr,
                    format : options.format || "application/rdf+json",
                    options : options
                },
                urlIndex : 0
            });
        },

        _ldpath : function (url, args, success, error) {
            jQuery.ajax({
            	beforeSend : function(req) {
                    req.setRequestHeader('Authorization', args.auth);
                  },
                success: success,
                error: error,
                url: url,
                type: "POST",
                data : "ldpath=" + args.ldpath + args.context,
                contentType : "application/x-www-form-urlencoded",
                dataType: args.format,
                accepts: {"application/rdf+json": "application/rdf+json"}
            });
        },

        _ldpathNode: function(url, args, success, error) {
            var request = require('request');
            var r = request({
                method: "POST",
                uri: url,
                body : "ldpath=" + args.ldpath + args.context,
                headers: {
                    Accept: "application/rdf+json",
                    'Content-Type': "application/x-www-form-urlencoded",
                    'Data-Type': args.format
                }
            }, function(err, response, body) {
                try {
                    success({results: JSON.parse(body)});
                } catch (e) {
                    error(e);
                }
            });
            r.end();
        },

        // ### query(query, success, error, options)
        // parse JSON serialized field queries to search for entities on the 
        // entityhub
        // **Parameters**:
        // *{function}* **success** The success callback.  
        // *{function}* **error** The error callback.  
        // *{object}* **options** Options, unused here.   
        // **Throws**:  
        // *nothing*  
        // **Returns**:  
        // *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
        query : function(query, success, error, options) {
            options = (options)? options :  {};
            var connector = this;

            connector._iterate({
                method : connector._query,
                methodNode : connector._queryNode,
                success : success,
                error : error,
                url : function (idx, opts) {
                    var site = (opts.site)? opts.site : this.options.entityhub.site;
                    site = (site)? "/" + site : "s";
                    
                    var isLocal = opts.local;

                    var u = this.options.url[idx].replace(/\/$/, '') + this.options.entityhub.urlPostfix;
                    if (!isLocal)
                        u += "/site" + site;
                    u += "/query";
                    
                    return u;
                },
                args : {
                	auth : this.options.auth,
                    query : JSON.stringify(query),
                    options : options
                },
                urlIndex : 0
            });
        },

        _query : function (url, args, success, error) {
            jQuery.ajax({
            	beforeSend : function(req) {
                    req.setRequestHeader('Authorization', args.auth);
                  },
                success: success,
                error: error,
                url: url,
                type: "POST",
                data : args.query,
                contentType : "application/json"
            });
        },

        _queryNode: function(url, args, success, error) {
            var request = require('request');
            var r = request({
                method: "POST",
                uri: url,
                body : args.query,
                headers: {
                    'Content-Type': "application/json"
                }
            }, function(err, response, body) {
                try {
                    success({results: JSON.parse(body)});
                } catch (e) {
                    error(e);
                }
            });
            r.end();
        },
        
                
        // ### createEntity(entity, success, error, option) alias save()
    	// @author mere01
    	// This method creates a new local entity on the Apache Stanbol 
        // entityhub endpoint.
        // If options.update is not set to true, the method fails if the entity 
        // is already existing in the entityhub.
    	// **Parameters**:  
    	// *{string}* **entity** the rdf xml formatted entity to be sent to the 
        //	 entityhub/entity/
        // *{function}* **success** The success callback.  
    	// *{function}* **error** The error callback.  
        // *{object}* **options** the options to append to the URL request, e.g. 
        //		"update: true" will enable updating an already existing entity.
        //		"id : <id>" will store the entity under the specified id.
    	// **Example usage**:  
    	//
        //    	     var stnblConn = new vie.StanbolConnector(opts);
        //    	     stnblConn.createEntity(<entity>,
        //    	                 function (res) { ... },
        //    	                 function (err) { ... },);	to create a new entity in the entityhub
        createEntity: function(entity, success, error, options) {
        	
    			options = (options)? options :  {};
    			var id = (options.id) ? options.id : false;

    			var connector = this;
    	
    	    	connector._iterate({
    	        	method : connector._createEntity,
    	        	methodNode : connector._createEntityNode,
    	        
    	        	url : function (idx, opts) {
    	        		
    	                var update = options.update;
    	                
    	                var u = this.options.url[idx].replace(/\/$/, '') + this.options.entityhub.urlPostfix;
    	                
    	                u += "/entity";
    	                
    	                if (update || id) {
    	                	u += "?"
    	                }
    	                
    	                if(id) {
    	                	u += "id=" + id + "&";
    	                }
    	                
    	                if (update) {
    	                	u += "update=true";
    	                }
    	                
    	        		return u;
    	        	},
    	        	
    	        	args : {
    	        		auth : this.options.auth,
    	        		entity : entity,
    	        		format : "application/rdf+xml"
    	        	},
    	        	success : success,
    	        	error : error,
    	        	urlIndex : 0
    	        });
    	    },

        _createEntity : function (url, args, success, error) {
        	jQuery.ajax({
        		beforeSend : function(req) {
                    req.setRequestHeader('Authorization', args.auth);
                  },
                success: success,
                error: error,
                url: url,
                type: "POST",
                data: args.entity,
                contentType: args.format
            });
        }, 

        _createEntityNode: function(url, args, success, error) {
            var request = require('request');
            var r = request({
                method: "POST",
                uri: url,
                body: args.entity,
                headers: {
                    'Content-Type': args.format
                }
            }, function(err, response, body) {
                try {
                    success({results: JSON.parse(body)});
                } catch (e) {
                    error(e);
                }
            });
            r.end();
        },
        
        
        // ### save(id, success, error, option)
        // This is an alias to createEntity
        save: function (entity, success, error, options) {
            return this.createEntity.call(this, entity, success, error, options);

        },

        // ### readEntity(uri, success, error, options)
        // This method loads all properties from an entity and returns the 
        // result by the success callback.  
        // **Parameters**:  
        // *{string}* **uri** The URI of the entity to be loaded.  
        // *{function}* **success** The success callback.  
        // *{function}* **error** The error callback.  
        // *{object}* **options** Options, like the ```format```, the ```site```. 
        // 		If ```local``` is set, only the local entities are accessed.   
        //		In the **options** parameter, you can specify the ```accept```
		//		format of the returned data. (default is application/json). 
		//		Available are:
		// 		application/rdf+json,
		//		application/rdf+xml,
		//		application/x-turtle,
		// 		text/rdf+n3,
		// 		text/rdf+nt,
		// 		text/turtle
        //		Note: in case you set ```accept``` to something different from
        //		the default, you might need to set ```format``` to "text" in
        //		order to avoid a parsererror in the ajax callback.
        // **Throws**:  
        // *nothing*  
        // **Returns**:  
        // *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
        // **Example usage**:  
        //
        //       var stnblConn = new vie.StanbolConnector(opts);
        //       stnblConn.load("<http://dbpedia.org/resource/Barack_Obama>",
        //                   function (res) { ... },
        //                   function (err) { ... });

        readEntity: function (uri, success, error, options) {
            var connector = this;
            options = (options)? options :  {};
            var accept = (options.accept) ? options.accept : "application/rdf+json";
            
            options.uri = uri.replace(/^</, '').replace(/>$/, '');

            connector._iterate({
                method : connector._readEntity,
                methodNode : connector._readEntityNode,
                success : success,
                error : error,
                
                url : function (idx, opts) {
                    var site = (opts.site)? opts.site : this.options.entityhub.site;
                    site = (site)? "/" + site : "s";

                    var isLocal = opts.local;

                    var u = this.options.url[idx].replace(/\/$/, '') + this.options.entityhub.urlPostfix;
                    if (isLocal) {
                        u += "/entity?id=" + escape(opts.uri);
                    } else {
                        u += "/site" + site + "/entity?id=" + escape(opts.uri);
                    }
                    return u;
                },
                args : {
                	auth : this.options.auth,
                    format : options.format || "application/rdf+json",
                    content : options.content || "application/rdf+json",
                    options : options,
                    accept : accept
                },
                urlIndex : 0
            });
        },

        _readEntity : function (url, args, success, error) {
        	console.log("accept is: ")
        	console.log(args.accept)
        	jQuery.ajax({
            	beforeSend: function(xhrObj) {
	    		xhrObj.setRequestHeader("Accept", args.accept);
	    		xhrObj.setRequestHeader('Authorization', args.auth);
				},
                success: success,
                error: error,
                url: url,
                type: "GET",
                dataType: args.format,
                contentType: args.content
            });
        },

        _readEntityNode: function(url, args, success, error) {
            var request = require('request');
            var r = request({
                method: "GET",
                uri: url,
                headers: {
                    'Data-Type': args.format,
                    'Content-Type': args.content
                }
            }, function(err, response, body) {
                try {
                    success({results: JSON.parse(body)});
                } catch (e) {
                    error(e);
                }
            });
            r.end();
        },
        
        
        // ### load(id, success, error, option)
        // This is an alias to readEntity
        load: function (uri, success, error, options) {
            return this.readEntity.call(this, uri, success, error, options);

        },
        
        
        // ### udpateEntity(entity, success, error, options, id)
    	// @author mere01
    	// This method updates a local entity on the Apache Stanbol 
        // entityhub/entity endpoint.
    	// **Parameters**:  
    	// *{string}* **entity** the rdf xml formatted entity to be sent to the
        //	 entityhub/entity
        // *{function}* **success** The success callback.  
    	// *{function}* **error** The error callback.  
        // *{object}* **options** Options: if e.g. "create: 'true'" is 
        //	 specified, then the method will create the entity on the entityhub,
        //	 if it does not already exist.        		
        // *{string}* **id** the ID of the entity which is to be updated 
        //	 (optional argument)
    	// **Throws**:  
    	// *nothing*  
    	// **Returns**:  
    	// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
    	// **Example usage**:  
    	//
//    	     var stnblConn = new vie.StanbolConnector(opts);
//    	     stnblConn.updateEntity(<entity>,
//    	                 function (res) { ... },
//    	                 function (err) { ... }, id);	to update the entity referenced by the specified ID
        updateEntity: function(entity, success, error, options, id) {
    			id = (id)? (id) :  "";
    		
    			var connector = this;
    	
    	    	connector._iterate({
    	        	method : connector._updateEntity,
    	        	methodNode : connector._updateEntityNode,

    	        	url : function (idx, opts) {
    	        		
    	                var isCreate = opts.create;
    	                
    	                var u = this.options.url[idx].replace(/\/$/, '') + this.options.entityhub.urlPostfix;
    	                
    	                u += "/entity?id=" + escape(id);
    	                
    	                if (!isCreate) {
    	                	u += "&create=false";
    	                }
    	        		return u;
    	        	},
    	        	args : {
    	        		auth : this.options.auth,
    	        		entity : entity,
    	        		format : "application/rdf+xml",
    	        		options: options
    	        	},
    	        	success : success,
    	        	error : error,
    	        	urlIndex : 0
    	        });
    	    }, // end of updateEntity

        _updateEntity : function (url, args, success, error) {
        	jQuery.ajax({
        		beforeSend : function(req) {
                    req.setRequestHeader('Authorization', args.auth);
                  },
                success: success,
                error: error,
                url: url,
                type: "PUT",
                data: args.entity,
                contentType: args.format,
                accepts: "application/json"
                
            });
        }, // end of _updateEntity

        _updateEntityNode: function(url, args, success, error) {
            var request = require('request');
            var r = request({
                method: "PUT",
                uri: url,
                body: args.entity,
                headers: {
                    Accept: "application/json",
                    'Content-Type': args.format
                }
            }, function(err, response, body) {
                try {
                    success({results: JSON.parse(body)});
                } catch (e) {
                    error(e);
                }
            });
            r.end();
        }, // end of _updateEntityNode 

        // ### deleteEntity(id, success, error, options)
    	// @author mere01
    	// This method deletes a local entity from the Apache Stanbol 
        // entityhub/entity endpoint. It is possible to delete *all* entities
        // at the same time, by passing "*" as the **id**. Be careful with
        // that, however, since other users might be relying on the existence
        // of entities.
    	// **Parameters**:  
        // *{string}* **id** the ID of the entity which is to be deleted from 
        //  	the entityhub.
        // *{function}* **success** The success callback.  
    	// *{function}* **error** The error callback.  
        // *{object}* **options** Options. 
    	// **Throws**:  
    	// *nothing*  
    	// **Returns**:  
    	// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
    	// **Example usage**:  
    	//
        //    	     var stnblConn = new vie.StanbolConnector(opts);
        //    	     stnblConn.deleteEntity(
        //    					 id,
        //    	                 function (res) { ... },
        //    	                 function (err) { ... }, 
        //        	);	to delete the entity referenced by the specified ID
        deleteEntity: function(id, success, error, options) {
    			var connector = this;
    	
    	    	connector._iterate({
    	        	method : connector._deleteEntity,
    	        	methodNode : connector._deleteEntityNode,

    	        	url : function (idx, opts) {
    	        		
    	                var u = this.options.url[idx].replace(/\/$/, '') 
    	                	+ this.options.entityhub.urlPostfix;
    	                
    	                u += "/entity?id=" + escape(id);
    	                
    	        		return u;
    	        	},
    	        	args : {
    	        		auth : this.options.auth,
    	        		format : "application/rdf+xml",
    	        		options: options
    	        	},
    	        	success : success,
    	        	error : error,
    	        	urlIndex : 0
    	        });
    	    }, // end of deleteEntity

        _deleteEntity : function (url, args, success, error) {
        	jQuery.ajax({
        		beforeSend : function(req) {
                    req.setRequestHeader('Authorization', args.auth);
                  },
                success: success,
                error: error,
                url: url,
                type: "DELETE",
                contentType: args.format             
            });
        }, // end of _deleteEntity

        _deleteEntityNode: function(url, args, success, error) {
            var request = require('request');
            var r = request({
                method: "DELETE",
                uri: url,
                headers: {
                    'Content-Type': args.format
                }
            }, function(err, response, body) {
                try {
                    success({results: JSON.parse(body)});
                } catch (e) {
                    error(e);
                }
            });
            r.end();
        }, // end of _deleteEntityNode
     
     // ### getMapping(id, success, error, options)
    	// @author mere01
    	// This method looks up mappings from local Entities to Entities managed
        // by a Referenced Site.
    	// **Parameters**:  
        // *{string}* **id** is:	
        //		(a) the entity ID, when **options** specifies "entity: true"
        //		(b) the symbol ID, when **options** specified "symbol: true"
        //		(c) the mapping ID, otherwise
        // *{function}* **success** The success callback.  
    	// *{function}* **error** The error callback.  
        // *{object}* **options** Options. 
        //		If you want to look up the mappings for an entity, specify 
        //		"entity: true".
        //		If you want to look up the mappings for a symbol, specify 
        //		"symbol: true".
        //		If you want to look up the mappings by the mapping ID itself, 
        //		specify nothing.
        // 		In the **options** parameter, you can specify the ```accept```
		//		format of the returned data. (default is application/json). 
		//		Available are:
		// 		application/rdf+json,
		//		application/rdf+xml,
		//		application/x-turtle,
		// 		text/rdf+n3,
		// 		text/rdf+nt,
		// 		text/turtle 		
        // 		When asking for a symbol ID, only application/json is available.
        //		
    	// **Throws**:  
    	// *nothing*  
    	// **Returns**:  
    	// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
    	// **Example usage**:  
    	//
        //    	     var stnblConn = new vie.StanbolConnector(opts);
        //    	     stnblConn.getMapping(
        //    					 "http://dbpedia.org/resource/Paris",
        //    	                 function (res) { ... },
        //    	                 function (err) { ... }, 
        //        				 {
        //							entity: true
    	//							});						
        // 			will retrieve the mapping for dbpedia entity Paris
        getMapping: function(id, success, error, options) {

    			var connector = this;
    	
    			options = (options)? options :  {};
    			var accept = (options.accept) ? options.accept : "application/json";
    			
    			// curl -iv -X GET 
    			//  -H "Accept: text/turtle"
    			//  "http://lnv-89012.dfki.uni-sb.de:9001/entityhub/mapping/entity?id=http://dbpedia.org/resource/Paris"
    			
    	    	connector._iterate({
    	        	method : connector._getMapping,
    	        	methodNode : connector._getMappingNode,

    	        	url : function (idx, opts) {
    	        		
    	                var u = this.options.url[idx].replace(/\/$/, '') + this.options.entityhub.urlPostfix;
    	                
    	                u += "/mapping";
    	                
    	                var entity = options.entity;
    	                if (entity) {
    	                	u += "/entity";
    	                }
    	                
    	                var symbol = options.symbol;
    	                if (symbol) {
    	                	u += "/symbol";
    	                }
    	                
    	                u += "?id=" + id;
    	                
    	        		return u;
    	        	},
    	        	args : {
    	        		auth : this.options.auth,
    	        		format : "application/json",
    	        		options: options,
    	        		accept : accept
    	        	},
    	        	success : success,
    	        	error : error,
    	        	urlIndex : 0
    	        });
    	    }, // end of getMapping

        _getMapping : function (url, args, success, error) {
        	jQuery.ajax({
        		beforeSend: function(xhrObj) {
	    		xhrObj.setRequestHeader("Accept", args.accept);
	    		xhrObj.setRequestHeader('Authorization', args.auth);
				},
                success: success,
                error: error,
                url: url,
                type: "GET",
                accepts: args.accept,
                contentType: args.format             
            });
        }, // end of _getMapping

        _getMappingNode: function(url, args, success, error) {
            var request = require('request');
            var r = request({
                method: "GET",
                uri: url,
                headers: {
                    Accept: args.accept,
                    'Content-Type': args.format
                }
            }, function(err, response, body) {
                try {
                    success({results: JSON.parse(body)});
                } catch (e) {
                    error(e);
                }
            });
            r.end();
        } // end of _getMappingNode
     
	});
})();