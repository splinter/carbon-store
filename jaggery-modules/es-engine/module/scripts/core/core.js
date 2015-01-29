var core = {};
(function(core) {
    var log = new Log('store-extension-core');
    core.test = function() {
        log.info('This is a test!');
    };

    function ExtensionBase() {
        this.impls = {};
    }
    ExtensionBase.prototype.register = function(key, impl) {
        log.info('Register callled');
        this.impls[key] = impl;
    };
    ExtensionBase.prototype.getPlugin = function(key) {
        return this.impls[key];
    };

    
    core.ExtensionBase = ExtensionBase;
}(core));