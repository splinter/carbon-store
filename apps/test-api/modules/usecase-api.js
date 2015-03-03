/*
 *  Copyright (c) 2005-2014, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */
var api = {};
(function(api) {
    var USECASES_DIR = '/usecases';
    var DEFAULT_DIR = 'default';
    var log = new Log('usecase-api');
    var Commons = Packages.org.apache.commons.io.FileUtils;
    var resolvePath = function(usecaseId, appname) {
        //Check the app specific folder
        var appPath = USECASES_DIR + '/' + appname + '/' + usecaseId;
        var appDir = new File(appPath);
        if (appDir.isExists()) {
            return appPath;
        }
        var defaultPath = USECASES_DIR + '/' + DEFAULT_DIR + '/' + usecaseId;
        var defaultDir = new File(defaultPath);
        if (defaultDir.isExists()) {
            return defaultPath;
        }
        throw 'Cannot resolve resource location';
    };
    var buildPathToApp = function(app) {
        var carbon = require('carbon');
        var home = carbon.server.home;
        home = home.replace('file://', '');
        return home + '/repository/deployment/server/jaggeryapps/' + app;
    };
    var copyResource = function(from, to) {
        var fromFile = new java.io.File(from);
        var toFile = new java.io.File(to);
        Commons.copyFile(fromFile, toFile);
    };
    var mkdir = function(dirPath) {
        var dir = java.io.File(dirPath);
        Commons.forceMkdir(dir);
    };
    var removeResource = function(to) {
        var file = java.io.File(to);
        if (resourceExists(file)) {
            Commons.forceDelete(file);
            return;
        }
        log.info('Resource does not exist ' + to);
    };
    var removeDir = function(to) {
        var file = java.io.File(to);
        if (resourceExists(file)) {
            Commons.forceDelete(file);
            return;
        }
        log.debug('Resource does not exist ' + to);
    };
    var resourceExists = function(file) {
        return file.exists();
    };
    var rec2copy = function(sourceFilePtr, sourceRootPath, destinationRootPath, traversedPath, sourceAppPath, destinationAppPath) {
        if (!sourceFilePtr.isDirectory()) {
            var srcFile = [sourceAppPath, sourceRootPath, traversedPath].join('/');
            var destinationFile = [destinationAppPath, destinationRootPath, traversedPath].join('/');
            copyResource(srcFile, destinationFile);
            return;
        } else {
            //Copy the directory
            var destinationDir = [destinationAppPath, destinationRootPath, sourceFilePtr.getName()].join('/');
            mkdir(destinationDir);
            var subResources = sourceFilePtr.listFiles();
            var file;
            for (var index = 0; index < subResources.length; index++) {
                file = subResources[index];
                if (traversedPath === '') {
                    traversedPath += file.getName();
                } else {
                    traversedPath = [traversedPath, file.getName()].join('/');
                }
                rec2copy(file, sourceRootPath, destinationRootPath, traversedPath, sourceAppPath, destinationAppPath);
            }
        }
    };
    var copy2 = function(sourceRootPath, destinationRootPath, sourceApp, destinationApp) {
        var sourceAppPath = buildPathToApp(sourceApp);
        var destinationAppPath = buildPathToApp(destinationApp);
        var fullSourceRootPath = [sourceAppPath, sourceRootPath].join('/');
        var ptr = new java.io.File(fullSourceRootPath);
        rec2copy(ptr, sourceRootPath, destinationRootPath, '', sourceAppPath, destinationAppPath);
    };
    var rec2remove = function(sourceFilePtr, sourceRootPath, destinationRootPath, traversedPath, sourceAppPath, destinationAppPath) {
        if (!sourceFilePtr.isDirectory()) {
            var destinationFile = [destinationAppPath, destinationRootPath, traversedPath].join('/');
            removeResource(destinationFile);
            return;
        } else {
            var subResources = sourceFilePtr.listFiles();
            for (var index = 0; index < subResources.length; index++) {
                file = subResources[index];
                if (traversedPath === '') {
                    traversedPath += file.getName();
                } else {
                    traversedPath = [traversedPath, file.getName()].join('/');
                }
                rec2remove(file, sourceRootPath, destinationRootPath, traversedPath, sourceAppPath, destinationAppPath);
            }
            var destinationDir = [destinationAppPath, destinationRootPath, sourceFilePtr.getName()].join('/');
            removeDir(destinationDir);
        }
    };
    var remove2 = function(sourceRootPath, destinationRootPath, sourceApp, destinationApp) {
        var sourceAppPath = buildPathToApp(sourceApp);
        var destinationAppPath = buildPathToApp(destinationApp);
        var fullSourceRootPath = [sourceAppPath, sourceRootPath].join('/');
        var ptr = new java.io.File(fullSourceRootPath);
        rec2remove(ptr, sourceRootPath, destinationRootPath, '', sourceAppPath, destinationAppPath);
    };
    var recursiveRemove = function(root, rootPath, destinationRootPath, fullPathToRoot) {
        if (!root.isDirectory()) {
            var toFilePath = destinationRootPath + rootPath + '/' + root.getName();
            removeResource(toFilePath);
            return;
        } else if ((root.isDirectory()) && (root.listFiles().length == 0)) {
            return;
        } else {
            var files = root.listFiles();
            var file;
            for (var index = 0; index < files.length; index++) {
                file = files[index];
                recursiveRemove(file, rootPath, destinationRootPath, fullPathToRoot);
            }
            if (root.isDirectory()) {
                var path = destinationRootPath + rootPath + '/' + root.getName();
                removeDir(path);
            }
        }
    };
    api.install = function(usecaseId, appName, request, response, session) {
        var sourceRoot = resolvePath(usecaseId, appName);
        var pathToMainScript = sourceRoot + '/main.js';
        var mainScript = new File(pathToMainScript);
        var status;
        if (mainScript.isExists()) {
            var mainScriptModule = require(pathToMainScript);
            if (mainScriptModule.hasOwnProperty('install')) {
                status = mainScriptModule.install({
                    copy: copy2,
                    resolve: resolvePath,
                    destinationAppName: appName,
                    sourceAppName: 'test-api',
                    usecaseId: usecaseId,
                    sourceRoot: sourceRoot,
                    req: request,
                    res: response,
                    session: session
                });
                status = (status === 'undefined') ? false : status;
                return status;
            }
        }
        //Check if the source root has an extension directory
        var pathToExtensions = sourceRoot + '/extensions';
        var extensionsDir = new File(pathToExtensions);
        if (!extensionsDir.isExists()) {
            log.error('Failed to copy use cases as the use case directory does not have an extensions directory');
            return status;
        }
        var subResources = extensionsDir.listFiles();
        var subResource;
        for (var index = 0; index < subResources.length; index++) {
            subResource = subResources[index];
            if (subResource.isDirectory()) {
                log.info('copying resource ' + subResource.getName());
                status = copy2(pathToExtensions + '/' + subResource.getName(), '/extensions/' + subResource.getName(), 'test-api', 'test-api');
            }
        }
        return status;
    };
    api.uninstall = function(usecaseId, appName, args) {
        var sourceRoot = resolvePath(usecaseId, appName);
        var pathToMainScript = sourceRoot + '/main.js';
        var mainScript = new File(pathToMainScript);
        var status;
        if (mainScript.isExists()) {
            var mainScriptModule = require(pathToMainScript);
            if (mainScriptModule.hasOwnProperty('uninstall')) {
                log.info('Executing main.js of ' + usecaseId);
                status = mainScriptModule.uninstall({
                    remove: remove2,
                    resolve: resolvePath,
                    destinationAppName: appName,
                    sourceAppName: 'test-api',
                    usecaseId: usecaseId,
                    sourceRoot: sourceRoot,
                    req: request,
                    res: response,
                    session: session
                });
                status = (status === 'undefined') ? false : status;
                return status;
            }
        }
        //Check if the source root has an extension directory
        var pathToExtensions = sourceRoot + '/extensions';
        var extensionsDir = new File(pathToExtensions);
        if (!extensionsDir.isExists()) {
            log.error('Failed to copy use cases as the use case directory does not have an extensions directory');
            return status;
        }
        var subResources = extensionsDir.listFiles();
        var subResource;
        for (var index = 0; index < subResources.length; index++) {
            subResource = subResources[index];
            if (subResource.isExists()) {
                log.info('removing resource ' + subResource.getName());
                status = remove2(sourceRoot + '/' + subResource.getName(), '/extensions/'+subResource.getName(), 'test-api', 'test-api');
            }
        }
        return status;
    };
}(api));