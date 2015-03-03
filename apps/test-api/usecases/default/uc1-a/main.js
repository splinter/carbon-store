// var install = function(ctx) {
// 	log.info('Copying to app: '+ctx.destinationAppName);
// 	log.info('Source root: '+ctx.sourceRoot);
//     // ctx.copy({
//     //     sourceAppName: 'test-api',
//     //     destinationAppName: ctx.destinationAppName,
//     //     destinationRootDir: '/extensions/tenants/test.com/',
//     //     sourceRoot: ctx.sourceRoot,
//     //     sourceRootDir: '/extensions/assets',
//     //     mount:'/extensions'
//     // });
//     ctx.copy(ctx.sourceRoot+'/extensions/assets','/extensions/tenants/test.com/assets','test-api','test-api');
// };

// var uninstall = function(ctx){
// 	ctx.remove(ctx.sourceRoot+'/extensions/assets','/extensions/tenants/test.com/assets','test-api','test-api');
// };