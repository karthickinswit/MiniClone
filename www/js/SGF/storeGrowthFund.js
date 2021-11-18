define([
	"backbone",
	"mustache",
	"select2"
], function(Backbone, Mustache) {
	var SGF = {};
	SGF.Model = Backbone.Model.extend({
		
		initialize: function() {}                             
	});

	SGF.View = Backbone.View.extend({

		className: "audits",

		events:{
			"click .back": "back",
			"change #frontage_applicable" : "toggleFrontage"
		},

		showSgfbrands: function(mId, pId, product, hotspotPid){
			var that = this;

			var categoryId = that.model.get("channelId");
			var mId = that.model.get("mId");
			
			var productId = product.product_id;
			var priority = product.priority;

			this.getStoreName(mId, categoryId);

			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];

			fetchSgfBrands(db, storeId, function(result) {
				var brndLength = result.length;
				console.log("length"+length);
				var fn = function(completedBrands) {


					var length = result.length;
					for(var i =0; i<length; i++){
						for(var j = 0; j < completedBrands.length; j++){
							var cProduct = completedBrands[j];
							if(result[i].brand_id == cProduct.brand_id) {
								result[i].done = true;
							}
						}
					}

					require(['templates/t_list'], function(template){
						brands = {"brands" : result,
						 "cId": channelId,
						 "product_id": "",
						 "sgf": true,
						 "category_id": categoryId,
						 "categoryName": that.categoryName};
						brands.mId = mId;
						brands.name = that.storeName;
						var html = Mustache.to_html(template.brand, brands);
						that.$el.empty().append(html);
					});

				};
				compledSgfBrands(db, auditId, storeId, fn);
			});

			return that;
		},
	
		back: function(){
			window.history.back();
			console.log("back");
		},

		refreshScroll: function(wrapperEle) {
			if(!this.scrollView) {
				this.scrollView = new iScroll(wrapperEle);
			}
			this.scrollView.refresh();
		},

		bindResizeEvent: function() {
			var that = this;
        	$(window).bind('resize.normKeyboard', function() {
	        	setTimeout(function(){
	        		that.scrollView.refresh();
	        	}, 1000);
	        });
		},

		fetchBrands: function(channelId, fn) {
			selectBrands(db, channelId, function(result) {
				var brands = {};
				brands = {"brands" : result};
				fn(brands);
			});
		},

		getStoreName: function(mId, categoryId){
			var that = this;

			fetchStoreName(db, mId, function(result){
				that.storeName = result.storeName;
				fetchCategoryName(db, categoryId, function(result){
					that.categoryName = result;
				});
			});
		}

	});

	return SGF;
});