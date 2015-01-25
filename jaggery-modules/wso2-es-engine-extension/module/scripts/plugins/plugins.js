var plugins = {};
(function(plugins) {
	var log = new Log('wso2-es-engine-extension-plugins');
    plugins.init = function(engineContext) {
    	log.info('Registering plugins');
    };
}(plugins));