asset.manager = function(ctx){
	return {
		get:function(id){
			log.info('SITE overidden by carbon.super');	
			return this._super.get.call(this,id);
		}
	};
};