"use strict";

define([
	"backbone",
	"mustache"
], function(Backbone, Mustache) {

	var NormCompleted = {};
	NormCompleted.Model = Backbone.Model.extend({
		
		initialize: function() {}                             
	});

	NormCompleted.View = Backbone.View.extend({
		className: "audits",

		showCompletedNorms: function(callbackFn) {	
			
			var that = this;

			var mId = that.model.get("mId");
			this.getStoreName(mId);
			
			var pId = that.model.get("pId");
			var product = that.model.get("product");
			var brandwiseNorm = that.model.get("brandwiseNorm");
            var categoryId = that.model.get("categoryId");
            var brandId = that.model.get("brandId");
            var channelId = that.model.get("channelId");
            var isFrontage = that.model.get("isFrontage");
            var hotspotExecution = that.model.get("hotspotExecution");
            var productName = that.model.get("productName");
            var priority = product.priority;
            var storeId = that.model.get("storeId");

            require(['templates/t_audit_questions'], function(template){

				//Show completed norms(With user modified values)
				var results = that.model.get("results");
				require(['templates/t_audit_questions'], function(template){

					var callback = function(norms){
						var fetchCategory = false;
						var alreadyAudited = true;

						 selectNorms(db, channelId, pId, product.priority, product.is_frontage, function(data) {
							
							norms = data.concat(norms);

							selectProduct(db, pId, categoryId, function(product){
							//Set first question as a frontage norm
								if(isFrontage && norms[0]){
									norms[0].isFrontage = isFrontage;
								}

								//Set first question as a hotspot decision norm
								if(hotspotExecution && norms[0]){
									norms[0].hotspotExecution = hotspotExecution;
								}

								for(var i = 0; i < norms.length; i++){
									var norm = norms[i];
									var no = norm.no;
									var yes = norm.yes;
									var options = norm.options;



									for(var j = 0; j < results.length; j++){
										var result = results[j];

										if(norm.normId == result.normId){
											for(var k = 0; k < options.length; k++){

												if(result.optionId == options[k].optionId){
													if(norm.productId == result.productId && result.optionId == "9" ){
															options[k].optionName = result.optionName;
															break;	
													}else {
														options[k].selected = "selected";
														break;
													}
												}
											}

											var isOk = false;
											for(var l = 0; l < yes.length; l++){
												if(result.remarkId == yes[l].remarkId){
													yes[l].selected = "selected";
													norm.show1 = "block";
													norm.show2 = "none";
													isOk = true;
													break;
												}
											}

											if(!isOk){
												for(var m = 0; m < no.length; m++){
													if(result.remarkId == no[m].remarkId){
														no[m].selected = "selected";
														norm.show1 = "none";
														norm.show2 = "block";
														break;
													}
												}
											}
											break;
										}
									}
								}

								var isImage = false;
								var imageURI = results[0].imageURI || "";
								if(imageURI){
									isImage = true;
								}

								var takePhoto = false;
								if(!imageURI && priority == 6){
									takePhoto = true;
								}

								if(!imageURI && priority == 10){
									takePhoto = true;
								}
								console.log(norms);
								var html = Mustache.to_html(
									template.normTemplate,
									{
										"norms":norms, 
										"mId":mId, 
										"productName":productName,
										"productId":pId,
										"name": that.storeName,
										"imageURI":imageURI,
										"isImage":isImage,
										"takePhoto":takePhoto,
										"element":"retake_product_photo",
										"priority": priority,
										"categoryName": that.categoryName
									}
								);
								
								//toggleHotspot function will disable certain elements based on hotspot decision value
								if(priority == 10){
									var hotspotDecision = $(".hotspot_decision").val().replace(/\s/g, '').toLowerCase();
									if(hotspotDecision == "no"){
										that.toggleHotspot("", "no");

										//Hide all other norms except first
										var elements  = $(".question");
										for(var i = 1; i < elements.length; i++){
											$(elements[i]).hide();
										}	
									}
								}

								if(priority == 8){
									var success = function(results){
										if(results.item(0)){
											if(results.item(0).option_name.replace(/\s/g, '').toLowerCase() == "no"){
												that.$el.find(".question_list .norms").prepend("<div class='warning_msg'>This hotspot brand can not be edited. Because hotspot execution is not available</div>");
												that.toggleHotspot("", "no", true);
											}
										}
									}

									selectHotSpotExecutionDecision(db, auditId, storeId, hotspotPid, success);
								}
								
								return callbackFn(html);
							});
						 }, fetchCategory, brandwiseNorm, categoryId, alreadyAudited, false, storeId);
						
					}

				if(brandwiseNorm){
					// Render (smartspot) brand norm without category that is already audited
					// No need to call category
					var alreadyAudited = true;
					fetchCategory = false;
					callback([]);
				}else {
					//Render category and brandwise norm which is already audited.
					var alreadyAudited = true;
					selectNorms(db, channelId, pId, product.priority, product.is_frontage, callback, fetchCategory, brandwiseNorm, categoryId, alreadyAudited, false, storeId);
				}

				return that;
				
				});
			});
		},

		getStoreName: function(mId){
			var that = this;

			fetchStoreName(db, mId, function(result){
				that.storeName = result.storeName;
				var channelId = that.model.get("categoryId");
				fetchCategoryName(db, channelId, function(result){
					that.categoryName = result;
				});
			});
		},
	});

	return NormCompleted;
});
