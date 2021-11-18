define([
	"backbone",
	"mustache",
	"select2"
], function(Backbone, Mustache) {
	var Brands = {};
	Brands.Model = Backbone.Model.extend({
		
		initialize: function() {}                             
	});

	Brands.View = Backbone.View.extend({

		className: "audits",

		events:{
			"click .back": "back",
		},

		showBrands: function(mId, channelId, brandwiseNorm){
			var that = this;

			this.getStoreName(mId);

			var categoryId = this.model.get("categoryId");

			setTimeout(function(){
				var id = mId.split("-");
	            var auditId = id[0];
	            var storeId = id[1];
	            var channelId = id[2];

				var callback = function(result){
					require(['templates/t_list'], function(template){
							var brands = {};
						var fn = function(completedProducts){

							var length = result.length;
							for(var i =0; i<length; i++){
								for(var j = 0; j < completedProducts.length; j++){
									var cProduct = completedProducts[j];
									if(result[i].product_id == cProduct.product_id) {
										result[i].done = true;
									}
								}
							}


							brands = {"brands" : result, "cId": channelId};
							brands.mId = mId;
							brands.name = that.storeName;
							var html = Mustache.to_html(template.brand, brands);
							that.$el.empty().append(html);

							that.refreshScroll("wrapper_products");
						}
						    if(brandwiseNorm) {
						        compledProducts(db, auditId, storeId, fn, channelId);
						        return;
						    }
							var isSOS = true;

							compledProducts(db, auditId, storeId, fn, channelId, isSOS);
					});
				};
				
				selectBrands(db, channelId, categoryId, callback);

				//isSmartSpotCompleted();
				
			}, 350);
		},

		isSmartSpotCompleted: function() {

		},

		back: function(){
			window.history.back();
		},

		getStoreName: function(mId){
			var that = this;
			
			fetchStoreName(db, mId, function(result){
				that.storeName = result.storeName;
			});
		},

		refreshScroll: function(wrapperEle) {
			if(!this.scrollView) {
				this.scrollView = new iScroll(wrapperEle);
			}
			this.scrollView.refresh();
		}


	});

	return Brands;
});