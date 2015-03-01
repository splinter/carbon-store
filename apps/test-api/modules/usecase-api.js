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
        log.info('Resource does not exist ' + to);
    };
    var resourceExists = function(file) {
        return file.exists();
    };
    var recursiveCopy = function(root, rootPath, destinationRootPath, fullPathToRoot) {
        log.info(rootPath);
        if (!root.isDirectory()) {
            var toFilePath = destinationRootPath + rootPath + '/' + root.getName();
            var fromFilePath = fullPathToRoot + rootPath + '/' + root.getName();
            copyResource(fromFilePath, toFilePath);
            return;
        } else if ((root.isDirectory()) && (root.listFiles().length == 0)) {
            return;
        } else {
            if (root.isDirectory()) {
                var path = destinationRootPath + rootPath + '/' + root.getName();
                mkdir(path);
            }
            var files = root.listFiles();
            var file;
            rootPath += '/' + root.getName();
            for (var index = 0; index < files.length; index++) {
                file = files[index];
                recursiveCopy(file, rootPath, destinationRootPath, fullPathToRoot);
            }
        }
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
    var copy = function(options) {
        // var destinationAppName = 'test-api';
        // var sourceAppName = 'test-api';
        // var destinationRootDir='/temp';
        // var sourceRoot='/usecases/default/uc1-a';
        // var sourceRootDir='/assets';
        // var root = new File(sourceRoot+sourceRootDir);
        var destinationAppName = options.destinationAppName;
        var sourceAppName = options.sourceAppName;
        var destinationRootDir = options.destinationRootDir;
        var sourceRoot = options.sourceRoot;
        var sourceRootDir = options.sourceRootDir;
        var root = new File(sourceRoot + sourceRootDir);
        try {
            recursiveCopy(root, '', buildPathToApp(destinationAppName) + destinationRootDir, buildPathToApp(sourceAppName) + sourceRoot);
        } catch (e) {
            log.error('Copy action failed', e);
            return false;
        }
        return true;
    };
    var remove = function(options) {
        var destinationAppName = options.destinationAppName;
        var sourceAppName = options.sourceAppName;
        var destinationRootDir = options.destinationRootDir;
        var sourceRoot = options.sourceRoot;
        var sourceRootDir = options.sourceRootDir;
        var root = new File(sourceRoot + sourceRootDir);
        try {
            recursiveRemove(root, '', buildPathToApp(destinationAppName) + destinationRootDir, buildPathToApp(sourceAppName) + sourceRoot);
        } catch (e) {
            log.error('Remove action failed', e);
            return false;
        }
        return true;
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
                    copy: copy,
                    resolve: resolvePath,
                    destinationAppName: appName,
                    sourceAppName: 'test-api',
                    usecaseId: usecaseId,
                    sourceRoot: sourceRoot,
                    req: req,
                    res: response,
                    session: session
                }) || true;
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
        status = copy({
            sourceAppName: 'test-api',
            destinationAppName: appName,
            destinationRootDir: '/',
            sourceRoot: sourceRoot,
            sourceRootDir: '/extensions'
        });
        return status;
        // copy({
        // 	sourceAppName:'test-api',
        // 	destinationAppName:'test-api',
        // 	destinationRootDir:'/temp',
        // 	sourceRoot:'/usecases/default/uc1-a',
        // 	sourceRootDir:'/assets'
        // });
    };
    api.uninstall = function(usecaseId, appName, args) {
        var sourceRoot = resolvePath(usecaseId, appName);
        var pathToMainScript = sourceRoot + '/main.js';
        var mainScript = new File(pathToMainScript);
        var status;
        if (mainScript.isExists()) {
            var mainScriptModule = require(pathToMainScript);
            if (mainScriptModule.hasOwnProperty('uninstall')) {
            	log.info('Executing main.js of '+usecaseId);
                status = mainScriptModule.uninstall({
                    copy: copy,
                    resolve: resolvePath,
                    destinationAppName: appName,
                    sourceAppName: 'test-api',
                    usecaseId: usecaseId,
                    sourceRoot: sourceRoot,
                    req: req,
                    res: response,
                    session: session
                }) || true;
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
        status = remove({
            sourceAppName: 'test-api',
            destinationAppName: appName,
            destinationRootDir: '/',
            sourceRoot: sourceRoot,
            sourceRootDir: '/extensions'
        });
        return status;
    };
}(api));