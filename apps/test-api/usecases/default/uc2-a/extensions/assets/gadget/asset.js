asset.manager = function(ctx){

	return {
		get:function(id){
			log.info('carbon.super GADGET overridden ');
			return this._super.get.call(this,id);
		}
	};
};