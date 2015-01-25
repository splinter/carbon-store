var workflows = {};
(function(workflows){
	var utils = require('utils');
	function EngineWorkflow(){
		this.impl = new utils.patterns.GenericPipe();
	}

	EngineWorkflow.prototype.execute = function(context){
		this.impl.resolve(context,context.req,context.res,context.session);
	};

	EngineWorkflow.prototype.registerWorkflowAction = function(action){
		this.impl.plug(action);
	}

	workflows.EngineWorkflow = EngineWorkflow;

}(workflows));