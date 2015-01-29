var plugins = {};
(function(plugins) {
    var log = new Log('wso2-es-engine-extension-plugins');
    var es_engine = require('es-engine');

    function ConcreateAssetContextFactory(){
    	this.engine=null;
    }
    ConcreateAssetContextFactory.prototype = Object.create(es_engine.interfaces.IAssetContextFactory);
    ConcreateAssetContextFactory.prototype.init = function(engine){
    	this.engine = engine;
    }
    ConcreateAssetContextFactory.prototype.createUserAssetContext = function(req, res, session, ten){
          log.info('Creating a user asset context');  
    };

    plugins.init = function(engineContext) {
        log.info('Registering plugins');
        var instance = engineContext.getInstance(-1234);
        instance.registerPlugin(es_engine.constants.PLUGIN_ASSET_CONTEXT_FACTORY,ConcreateAssetContextFactory);
        //instance.registerPlugin('plugin.asset.context.factory',ConcreateAssetContextFactory);
        log.info('Finished registering plugin');
    };
}(plugins));