asset.manager = function(ctx){

	return {
		get:function(id){
			log.info('c.com GADGET overridden ');
			return this._super.get.call(this,id);
		}
	};
};