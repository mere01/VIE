var stanbolRootUrl = (window.STANBOL_URLS) ? window.STANBOL_URLS : [
"http://dev.iks-project.eu:8081",
"http://dev.iks-project.eu/stanbolfull" ];


test("VIE.js StanbolService - API", function() {
    var z = new VIE();
    z.use(new z.StanbolService);

    ok(z.service('stanbol').init);
    equal(typeof z.service('stanbol').init, "function");
    ok(z.service('stanbol').analyze);
    equal(typeof z.service('stanbol').analyze, "function");
    ok(z.service('stanbol').find);
    equal(typeof z.service('stanbol').find, "function");
    ok(z.service('stanbol').load);
    equal(typeof z.service('stanbol').load, "function");
    ok(z.service('stanbol').query);
    equal(typeof z.service('stanbol').query, "function");
    ok(z.service('stanbol').save);
    equal(typeof z.service('stanbol').save, "function");
    ok(z.service('stanbol').connector);
    ok(z.service('stanbol').connector instanceof z.StanbolConnector);
    ok(z.service('stanbol').rules);
    equal(typeof z.service('stanbol').rules, "object");
});

test("VIE.js StanbolConnector - API", function() {
    var z = new VIE();
    var stanbol = new z.StanbolService( {
        url : stanbolRootUrl
    });
    z.use(stanbol);

    // API
    
    // enhancer
    ok(stanbol.connector.analyze);
    equal(typeof stanbol.connector.analyze, "function");
    ok(stanbol.connector.enhancers);
    equal(typeof stanbol.connector.enhancers, "function");
    ok(stanbol.connector.getExecutionPlan);
    equal(typeof stanbol.connector.getExecutionPlan, "function");
    
    // sparql
    ok(stanbol.connector.sparql);
    equal(typeof stanbol.connector.sparql, "function");
    
    // entityhub
    ok(stanbol.connector.createEntity);
    equal(typeof stanbol.connector.createEntity, "function");
    ok(stanbol.connector.save);
    equal(typeof stanbol.connector.save, "function");
    ok(stanbol.connector.readEntity);
    equal(typeof stanbol.connector.readEntity, "function");
    ok(stanbol.connector.load);
    equal(typeof stanbol.connector.load, "function");
    ok(stanbol.connector.updateEntity);
    equal(typeof stanbol.connector.updateEntity, "function");
    ok(stanbol.connector.deleteEntity);
    equal(typeof stanbol.connector.deleteEntity, "function");
    ok(stanbol.connector.find);
    equal(typeof stanbol.connector.find, "function");
    ok(stanbol.connector.lookup);
    equal(typeof stanbol.connector.lookup, "function");
    ok(stanbol.connector.referenced);
    equal(typeof stanbol.connector.referenced, "function");
    ok(stanbol.connector.ldpath);
    equal(typeof stanbol.connector.ldpath, "function");
    ok(stanbol.connector.query);
    equal(typeof stanbol.connector.query, "function");
    ok(stanbol.connector.getMapping);
    equal(typeof stanbol.connector.getMapping, "function");

    // contenthub
    ok(stanbol.connector.uploadContent);
    equal(typeof stanbol.connector.uploadContent, "function");
    ok(stanbol.connector.updateContent);
    equal(typeof stanbol.connector.updateContent, "function");
    ok(stanbol.connector.getTextContentByID);
    equal(typeof stanbol.connector.getTextContentByID, "function");
    ok(stanbol.connector.getMetadataByID);
    equal(typeof stanbol.connector.getMetadataByID, "function");
    ok(stanbol.connector.createIndex);
    equal(typeof stanbol.connector.createIndex, "function");
    ok(stanbol.connector.contenthubIndices);
    equal(typeof stanbol.connector.contenthubIndices, "function");
    ok(stanbol.connector.deleteIndex);
    equal(typeof stanbol.connector.deleteIndex, "function");
    ok(stanbol.connector.deleteContent);
    equal(typeof stanbol.connector.deleteContent, "function");
    ok(stanbol.connector.downloadContent);
    equal(typeof stanbol.connector.downloadContent, "function");
    ok(stanbol.connector.existsIndex);
    equal(typeof stanbol.connector.existsIndex, "function");
    ok(stanbol.connector.getIndex);
    equal(typeof stanbol.connector.getIndex, "function");
    ok(stanbol.connector.search);
    equal(typeof stanbol.connector.search, "function");
    
    // factstore
    ok(stanbol.connector.createFactSchema);
    equal(typeof stanbol.connector.createFactSchema, "function");
    ok(stanbol.connector.createFact);
    equal(typeof stanbol.connector.createFact, "function");
    ok(stanbol.connector.queryFact);
    equal(typeof stanbol.connector.queryFact, "function");
    ok(stanbol.connector.getFactData);
    equal(typeof stanbol.connector.getFactData, "function");

    // ontonet
    ok(stanbol.connector.createScope);
    equal(typeof stanbol.connector.createScope, "function");
    ok(stanbol.connector.deleteScope);
    equal(typeof stanbol.connector.deleteScope, "function");
    ok(stanbol.connector.getScope);
    equal(typeof stanbol.connector.getScope, "function");
//    ok(stanbol.connector.appendOntology);
//    equal(typeof stanbol.connector.appendOntology, "function");
    ok(stanbol.connector.getOntology);
    equal(typeof stanbol.connector.getOntology, "function");
//    ok(stanbol.connector.appendLibrary);
//    equal(typeof stanbol.connector.appendLibrary, "function");
    ok(stanbol.connector.getLibrary);
    equal(typeof stanbol.connector.getLibrary, "function");
    ok(stanbol.connector.ontoScopes);
    equal(typeof stanbol.connector.ontoScopes, "function");
    ok(stanbol.connector.createSession);
    equal(typeof stanbol.connector.createSession, "function");
    ok(stanbol.connector.deleteSession);
    equal(typeof stanbol.connector.deleteSession, "function");
    ok(stanbol.connector.getSession);
    equal(typeof stanbol.connector.getSession, "function");
    ok(stanbol.connector.updateScopes);
    equal(typeof stanbol.connector.updateScopes, "function");
    ok(stanbol.connector.detachOntology);
    equal(typeof stanbol.connector.detachOntology, "function");
    ok(stanbol.connector.ontoSessions);
    equal(typeof stanbol.connector.ontoSessions, "function");

    // rules
    ok(stanbol.connector.getRecipe);
    equal(typeof stanbol.connector.getRecipe, "function");
    ok(stanbol.connector.createRecipe);
    equal(typeof stanbol.connector.createRecipe, "function");
    ok(stanbol.connector.deleteRecipe);
    equal(typeof stanbol.connector.deleteRecipe, "function");
    ok(stanbol.connector.findRule);
    equal(typeof stanbol.connector.findRule, "function");
    ok(stanbol.connector.createRule);
    equal(typeof stanbol.connector.createRule, "function");
    ok(stanbol.connector.deleteRule);
    equal(typeof stanbol.connector.deleteRule, "function");
    ok(stanbol.connector.findRecipe);
    equal(typeof stanbol.connector.findRecipe, "function");
//    ok(stanbol.connector.getRule);
//    equal(typeof stanbol.connector.getRule, "function");
    ok(stanbol.connector.exportRecipe);
    equal(typeof stanbol.connector.exportRecipe, "function");
    
    // cmsadapter
    ok(stanbol.connector.getReposSessionKey);
    equal(typeof stanbol.connector.getReposSessionKey, "function");
    ok(stanbol.connector.mapRDFtoRepository);
    equal(typeof stanbol.connector.mapRDFtoRepository, "function");
//    ok(stanbol.connector.mapRepositoryToRDF);
//    equal(typeof stanbol.connector.mapRepositoryToRDF, "function");
    ok(stanbol.connector.submitRepositoryItem);
    equal(typeof stanbol.connector.submitRepositoryItem, "function");
//    ok(stanbol.connector.deleteRepositoryItem);
//    equal(typeof stanbol.connector.deleteRepositoryItem, "function");

});