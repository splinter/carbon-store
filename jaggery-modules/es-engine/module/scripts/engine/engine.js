var engine = {};
(function(engine,core) {
    var utils = require('utils');
    var log = new Log('es-extension-engine');

    function EngineException(msg) {
        this.msg = msg;
    }

    function EngineContext() {
        this.plugins={};
    }
    EngineContext.prototype.registerPlugin = function(key,plugin){
        this.plugins[key] =  plugin;
    };

    EngineContext.prototype.getPlugin = function(key){
        return this.plugins[key];
    };
    //EngineContext.prototype = Object.create(core.ExtensionBase.prototype);

    function EngineInstance() {
        this.context = new EngineContext();
        this.workflows = {};
    }
    EngineInstance.prototype.getContext = function() {
        return this.context;
    };
    EngineInstance.prototype.registerPlugin = function(key, plugin) {
        if(this.context.hasOwnProperty('register')){
            log.info('Register method exists');
        }
        this.context.registerPlugin(key, plugin);
        log.info('Finished invoking register method');
    };
    EngineInstance.prototype.getPlugin = function(key) {
        var plugin = this.context.getPlugin(key);
        if(!plugin){
            throw 'Unable to locate plugin with key '+key;
        }
        var instance = new plugin();
        instance.init(this);
        return instance;
    };
    EngineInstance.prototype.registerWorkflow = function(workflowName, workflowImpl) {
        if (this.workflows.hasOwnProperty(workflowName)) {
            log.debug('The workflow: ' + workflowName + ' already exists and will be over written.');
        }
        this.workflows[workflowName] = new workflows.EngineWorkflow();
    };
    EngineInstance.prototype.getWorkflow = function(workflowName) {};

    function Engine() {
        this.engineInstances = {};
    }
    Engine.prototype.getEngineInstance = function(tenantId) {
        if (this.engineInstances[tenantId]) {
            return this.engineInstances[tenantId];
        }
        log.info('Creating new engine instances');
        this.engineInstances[tenantId] = new EngineInstance();
        return this.engineInstances[tenantId];
    };
    engine.extend = function(extensionModule) {
        //An extension module may contain workflows or plugin name spaces
        if ((extensionModule.hasOwnProperty('plugins')) && (extensionModule.plugins.hasOwnProperty('init'))) {
            extensionModule.plugins.init(this);
        }
        if ((extensionModule.hasOwnProperty('workflows')) && (extensionModule.workflows.hasOwnProperty('init'))) {
            extensionModule.workflows.init(this);
        }
    };
    engine.init = function() {
        var events = require('events');
        events.on('tenantLoad', function(tenantId) {
            init(tenantId);
        });
    };
    engine.forceInit = function(tenantId) {
        init(tenantId);
    };
    engine.getInstance = function(tenantId) {
        var engine = getEngine();
        return engine.getEngineInstance(tenantId);
    };
    var getEngine = function() {
        var engine = application.get(constants.ENGINE);
        if (engine) {
            return engine;
        }
        engine = new Engine();
        application.put(constants.ENGINE, engine);
        return engine;
    };
    var init = function(tenantId) {};
}(engine, core));