"use strict"

define([
	"backbone",
	"mustache",
	"select2"
], function(Backbone, Mustache) {
	var Category = {};
	Category.Model = Backbone.Model.extend({
		
		initialize: function() {}                             
	});

	Category.View = Backbone.View.extend({

		className: "audits",

		events:{
			"click .back": "back",
			"click .go_next": "showSignaturePage",
			"click .complete_audit": "completeAudit",
			"click .take_signature_photo": "takeSignaturePicture",
            "click .retake_signature_photo": "takeSignaturePicture",
            "click .proceed_holistic_screen": "showHolisticScreen"
		},

		showCategories: function(mId){
			var that = this;

			this.getStoreName(mId);

			this.model.set("mId", mId);

			setTimeout(function(){
				var id = mId.split("-");
	            var auditId = id[0];
	            var storeId = id[1];
	            var channelId = id[2];
	            var isSgfAvailable = false;
	            var sgfIndex = -1;

	            

				var callback = function(result){
//					console.log(result);

					require(['templates/t_list'], function(template){
						var categories = {};
						inswit.showLoaderEl("Please wait...");

						checkSgfAvailable(db, storeId, function(sgfResult) {

							var fn = function(completedProducts){
								var smartSpotId, sgfId;
								var auditedProducts = completedProducts;
								var length = result.length;
								for(var i =0; i<length; i++){
									if(result[i].category_type == 1) {
										result[i].sod = true;
									}else if(result[i].category_type == 0) {
										result[i].defaultSpot = true;
									}else if(result[i].category_type == 2) {
										result[i].smartSpot = true;
										smartSpotId = result[i].category_id;
									}else if(result[i].category_type == 3) {
										result[i].sgf = true;
										sgfId =  result[i].category_id;
										//isSgfAvailable = true;
										if(sgfResult[0].count == 0 ){
											//isSgfAvailable = false;
											sgfIndex = i;
										}
									}else if(result[i].category_type == 4) {
                                        result[i].smartSpot = true;
                                        smartSpotId = result[i].category_id;
                                    }


									for(var j = 0; j < auditedProducts.length; j++){
										var cProduct = auditedProducts[j];
//										console.log(result[i]);
										if(result[i].category_id == cProduct.category_id) {
											if(result[i].category_type == 0) {
											    result[i].done = true;
                                                smartSpotId = result[i].category_id;
											}else if(result[i].category_type == 2) {
                                                result[i].smartSpot = true;
                                                smartSpotId = result[i].category_id;
                                                that.checkSmartSpotComplete(smartSpotId, channelId, storeId);
                                            }else if(result[i].category_type == 4) {
                                                 result[i].smartSpot = true;
                                                 smartSpotId = result[i].category_id;
                                                 that.checkPromoBrandComplete(smartSpotId, channelId, storeId);
                                            }

										}
									}
								}

								if(sgfIndex != -1){
									result.splice(sgfIndex, 1);
								}
								
								categories = {"categories" : result};
								categories.mId = mId;
								categories.name = that.storeName;
								var html = Mustache.to_html(template.category, categories);
								that.$el.empty().append(html);

								that.refreshScroll("wrapper_products");



								that.checkSgfComplete(sgfId, storeId);

								/*selectProducts(db, auditId, storeId, channelId, function(products){
									var length = products.products.length;
									var cLength = auditedProducts.length;
									if(cLength == length){
										that.$el.find(".verify_audit").attr("disabled", false);
									}
								}, er);

								var er = function(e, a){
								};*/
								isAuditCompleted(db, storeId, smartSpotId, channelId, function(isCompleted) {
									if(isCompleted) {
										that.$el.find(".complete_audit, .audit-btn").prop("disabled", false);
									}
									inswit.hideLoaderEl();
								});
							}		
							
							compledProducts(db, auditId, storeId, fn, channelId);
						});
					});
				};
				
				fetchCategories(db, channelId,callback, true);
				
			}, 150);
		},

		checkSmartSpotComplete: function(categoryId, channelId, storeId) {
			var that = this;
			var callback = function(result) {
				if(result) {
					that.$el.find(".list-group-item span"+ "#"+categoryId).find("img").show();
				}
			};
			smartSpotCompleted(db, categoryId, channelId, storeId, callback);
		},

		checkPromoBrandComplete: function(categoryId, channelId, storeId) {
            var that = this;
            var callback = function(result) {
                if(result) {
                    that.$el.find(".list-group-item span"+ "#"+categoryId).find("img").show();
                }
            };
            checkPromoCompleted(db, categoryId, channelId, storeId, callback);
        },

		checkSgfComplete: function(channelId, storeId) {
			var that = this;
			var callback = function(result) {
				if(result) {
					that.$el.find(".list-group-item span"+ "#"+channelId).find("img").show();
				}
			};
			isSgfCompleted(db, channelId, storeId, callback);
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

		showSignaturePage: function(){
			var that = this;

			this.showHolisticScreen();

			return;

			var mId = this.model.get("mId");

			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];

			require(['templates/t_store_score'], function(template){
				var html = Mustache.to_html(template, {"mId": mId, "name": that.storeName});
				that.$el.empty().append(html);

				selectCompletedAudit(db, mId, function(audit){
	            	if(audit.length > 0){
	            		var imageURI = audit.item(0).sign_image;

	            		if(imageURI){
	            			var template = "<img src='{{imageURI}}' width='100%' height='200'><a class='retake_signature_photo retake_photo'>Retake</a>";
							var html = Mustache.to_html(template, {"imageURI":imageURI});

							that.$el.find(".take_signature_photo").remove();
							that.$el.find(".photo_block").empty().append(html);
							that.refreshScroll("audit_score");
	            		}
	                }
            	});

				return that;
			});
		},

		completeAudit: function(event){
			var that = this;


			if($(event.currentTarget).hasClass("clicked")){
				return;
			}
			$(event.currentTarget).addClass("clicked");

			var mId = $(event.currentTarget).attr("href");
			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];

			getDistributor(db, auditId, storeId, function(distributor){

	 			if(distributor != inswit.DISTRIBUTOR){ //For certain distributor photo is not mandatory
	 				var image = $(".photo_block img").attr("src");
					if(!image){
						// inswit.alert("Please take a sign off photo!");
						// $(event.currentTarget).removeClass("clicked");
						// return;
					}
	 			}

	 			var callback = function(isYes){
					$(event.currentTarget).removeClass("clicked");
					if(isYes == 1){
                       inswit.exitTimer();

		   	           updateAuditStatus(db, auditId, storeId);

		   	            var route = "#audits/" + mId + "/upload";
		   				router.navigate(route, {
		   	                trigger: true
		   	            });
					}
				}

				/*var title = "Alert";
				var message = "Are you sure you want to complete this audit?\n\n" +
							  "This will update the audit status as 'Audited', after which audit details cannot be modified.";
	            var buttons = ["Yes", "No"];

				inswit.confirm(message, callback, title, buttons);*/

				callback(1);

	 		}, function(){

	 		});
		},


		takeSignaturePicture:function(event){
			var that = this;

			var mId = that.$el.find(".complete_audit").attr("href");
			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];

			selectCompletedAudit(db, mId, function(data){
				var auditData = data[0];
				var lat = auditData.lat;
				var lng = auditData.lng;

				getStoreCode(db, storeId, function(storeCode){
					var callback = function(imageURI){
						updateSignaturePhoto(db, auditId, storeId, imageURI);
						that.refreshScroll("audit_score");
					}

					var takeEl = "take_signature_photo";
					var retakeEl = "retake_signature_photo";
					var signPhotoEl = that.$el.find(".take_signature_photo");
					if(lat.length != 0) {
						storeCode = storeCode + "Z" + "Lat: "+ lat + "Z" + "Lng: "+lng;
					}
					inswit.takePicture(callback, takeEl, retakeEl, storeCode, signPhotoEl);
				});
			});
		},


		showHolisticScreen: function() {
            var that = this;
            var mId = this.model.get("mId");
            var route = "#holistic/" + mId;
            router.navigate(route, {
                trigger: true
            });
            return;
        }


	});

	return Category;
});