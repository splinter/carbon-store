var interfaces = {};
(function(interfaces){

	interfaces.IAssetManagerFactory = {
		createAssetManagerInstance:function(type){
			throw 'Method not implemented';
		}
	};

	interfaces.IAssetContextFactory =  {
		createAnonAssetContext:function(req,res,session,tenantId){
			throw 'Method not implemented'; 
		},
		createUserAssetContext:function(req,res,session,tenantId){
			
		}
	};

}(interfaces));