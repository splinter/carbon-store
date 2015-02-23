var caramel = require('caramel');
var carbon = require('carbon');
var conf = carbon.server.loadConfig('carbon.xml');
var offset = conf.*::['Ports'].*::['Offset'].text();
var hostName = conf.*::['HostName'].text().toString();
if (hostName === null || hostName === '') {
    hostName = 'localhost';
}
var httpPort = 9763 + parseInt(offset, 10);
var httpsPort = 9443 + parseInt(offset, 10);
var process = require('process');
process.setProperty('server.host', hostName);
process.setProperty('http.port', httpPort.toString());
process.setProperty('https.port', httpsPort.toString());
caramel.configs({
    context: '/store',
    cache: true,
    negotiation: true,
    themer: function() {
        /*var meta = caramel.meta();
        if(meta.request.getRequestURI().indexOf('gadget') != -1) {
            return 'modern';
        }*/
        return 'store';
    }
    /*,
    languagesDir: '/i18n',
    language: function() {
        return 'si';
    }*/
});
var configs = require('/config/store.js').config();
var log = new Log();
if (log.isDebugEnabled()) {
    log.debug('#### STORE CONFIG LOGIC ####');
}
var mod = require('store');
mod.server.init(configs);
mod.user.init(configs);
var rxt = require('rxt');
var lifecycle = require('lifecycle');
rxt.core.init();
rxt.resources.init();
var context = caramel.configs().context;
rxt.app.init(context);
lifecycle.core.init();
var store = require('/modules/store.js');
store.init(configs);
//TODO : fix this
var tenantId = rxt.tenant.getSuperTenantId();
var event = require('event');
event.emit('tenantLoad', tenantId);
if (log.isDebugEnabled()) {
    log.debug('#### FINISHED STORE CONFIG LOGIC #####');
}
//for server startup log for informing store URL
var logStoreUrl = function() {
    var log = new Log();
    log.info("Store URL : " + configs.server.http + caramel.configs().context);
};
setTimeout(logStoreUrl, 7000);