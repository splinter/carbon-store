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
var tenant = {};
(function() {
    var tryParseInt = function(value) {
        if (typeof value !== 'string') {
            return value;
        }
        value = value || '0';
        try {
            return parseInt(value);
        } catch (e) {
            return 0;
        }
    };
    /**
     * Returns the tenant domain given the tenant id
     * @param  {Number} tenantId An integer tenant id
     * @return {String}          The tenant domain
     */
    tenant.getTenantDomain = function(tenantId) {
        tenantId = tryParseInt(tenantId);
        var server = require('carbon').server;
        var domain = server.tenantDomain({
            tenantId: tenantId
        });
        return domain;
    };
    tenant.getTenantId = function(tenantDomain) {
        var server = require('carbon').server;
        var tenatId = server.tenantId({
            domain:tenantDomain
        });
        return tenatId;
    };
    tenant.getSuperTenantDomain = function() {
        var server = require('carbon').server;
        return  server.superTenant.domain;
    };
    tenant.getSuperTenantId = function(){
        var server = require('carbon').server;
        return server.superTenant.tenatId;
    };
    tenant.superTenant = function(){
        var server = require('carbon').server;
        return server.superTenant;
    };
}(tenant));