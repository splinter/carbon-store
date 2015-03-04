asset.manager = function(ctx){
	return {
		get:function(id){
			log.info('SITE overidden by c.com');	
			return this._super.get.call(this,id);
		}
	};
};