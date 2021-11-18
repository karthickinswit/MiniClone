define([
	"backbone",
	"mustache",
	"select2"
], function(Backbone, Mustache) {
	var Product = {};
	Product.Model = Backbone.Model.extend({
		
		initialize: function() {}                             
	});

	Product.View = Backbone.View.extend({

		className: "audits",

		events:{
			"click .verify_audit": "verify",
			"click .back": "back",
            "click .restart_audit": "restartAudit"
		},

		showProducts: function(mId){
			var that = this;

			this.getStoreName(mId);

			setTimeout(function(){
				var id = mId.split("-");
	            var auditId = id[0];
	            var storeId = id[1];
	            var channelId = id[2];
                    var products={};
				
					require(['templates/t_audit_main_products'], function(template){

						// var fn = function(completedProducts){
						// 	var cLength = completedProducts.length;
						// 	var length = products.products.length;

						// 	for(var i = 0; i < cLength; i++){
						// 		var cProduct = completedProducts[i];
						// 		for(var j = 0; j < length; j++){
						// 			var product = products.products[j];
						// 			if(product.product_id == cProduct.product_id){
						// 				product.done = true;
						// 				break;
						// 			}
						// 		}
						// 	}
						 	products.mId = mId;
						 	products.name = that.storeName;

						// 	var html = Mustache.to_html(template, products);
						// 	that.$el.empty().append(html);

						// 	if(cLength == length){
						// 		that.$el.find(".verify_audit").attr("disabled", false);
						// 	}
						// 	that.refreshScroll("wrapper_products");
						// 	return that;
						// }
						// selectCompProducts(db, auditId, storeId, fn);
                        var html = Mustache.to_html(template, products);
							that.$el.empty().append(html);
                            that.$el.find(".verify_audit").attr("disabled", false);
                            that.refreshScroll("wrapper_products");
							return that;


					});
			}, 350);
            //that.ex1();
		},
        ex1:function(){
        
            var route ="#audits/105-215158-19/categoryList";
			router.navigate(route, {
                trigger: true
            });
        },

		verify: function(event){
			var route = $(event.currentTarget).attr("href");
			router.navigate(route, {
                trigger: true
            });
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
		},

        restartAudit: function() {
             inswit.confirm(inswit.alertMessages.restartAudit, function onConfirm(buttonIndex) {
                  if(buttonIndex == 1) {
                     inswit.showLoaderEl("Clearing photo(s) ! Please wait...");
                     var el = "timer";
                     inswit.stopTimer(el);
                     inswit.exitTimer();
                     setTimeout(function(){
                         inswit.hideLoaderEl();
                         router.navigate("/audits", {
                                trigger: true
                         });
                     }, 2000);
                  }
             }, "Confirm", ["Ok", "No"]);
        }


	});

	return Product;
});