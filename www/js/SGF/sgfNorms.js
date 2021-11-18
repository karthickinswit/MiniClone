define([
	"backbone",
	"mustache",
], function(Backbone, Mustache, sGrowthF) {
	var SgfNorm = {};
	SgfNorm.Model = Backbone.Model.extend({
		initialize: function() {

		}                             
	});

	SgfNorm.View = Backbone.View.extend({


		showSgfNorms: function(callback) {
			var that = this;

			var mId = that.model.get("mId");
			var product = that.model.get("product");
			var categoryId = that.model.get("categoryId");
			
			var productId = product.product_id;
			var priority = product.priority;
			var brandId = that.model.get("brandId");


			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];

            this.getStoreName(mId, categoryId);

            var fn = function(completedProducts){
            	if(completedProducts.length > 0) {
            		that.fetchNorms(categoryId, channelId, function(norms, brands) {
            			that.processCompNorm(norms, completedProducts, function(newArr, brands, takePhoto, imageURI){
            				newArr[0].isFrontage = true;
            				that.createHtml(newArr, mId, priority, function(result) {
            				    var isSelected = newArr[0].options[0].selected;
            				    if(isSelected) {
            				        callback(result);
            				    }else {
            				        callback(result, true);
            				    }
							}, brands, takePhoto, imageURI);
            			}, brands);
					},productId, priority, product.isFrontage, brands);
            	}else {
            	    var takePhoto = true;
            	    var imageURI = "";
            		that.fetchNorms(categoryId, channelId, function(newArr, brands) {
            			newArr[0].isFrontage = true;
						that.createHtml(newArr, mId, priority, function(result) {
						    var resetFrontage = true;
							callback(result, resetFrontage);
						}, brands,takePhoto, imageURI);
					},productId, priority, product.isFrontage, brands);
            	}
            }

			var isSOS = false;
			selectSGFProductsToVerify(db, auditId, storeId, productId, fn, categoryId, brandId);
 
		},

		/*appendHtml: function(newArr, mId, priority, fn) {
			var that = this;
			var htmlEl = this.createHtml(newArr, mId, priority);
			that.$el.empty().append(htmlEl);
			
		},*/

		createHtml: function(newArr, mId, priority, callback, brands, takePhoto, imageURI) {
			var that = this;
			require(['templates/t_sgf_questions'], function(template){
				var html = Mustache.to_html(
					template,
					{
						"norms":newArr, 
						"mId":mId,
						"takePhoto": true,
						"element":"retake_product_photo",
						"priority": priority,
						"name": that.storeName,
						"imageURI":imageURI,
                        "takePhoto":takePhoto,
						"categoryName": that.categoryName,
						"brands": brands
					}
				);
				var $el = that.$el.empty().append(html);
				return callback($el);
			});
		},

		fetchNorms: function(categoryId, channelId, fn, productId, priority, isFrontage, brands) {
			var query = "select t1.norm_id,  t1.norm_order, t1.category_id,\
				t2.norm_name, t2.field_type,\
				t3.option_id, t3.option_name,\
				t4.remark_id, t4.remark_name,\
				t5.category_name from mxpg_cn_map t1\
				JOIN mxpg_norm t2 JOIN mxpg_option t3\
				JOIN mxpg_remark t4 JOIN mxpg_category t5\
				where t1.category_id= " + categoryId + 
				" and t1.channel_id = " + channelId + 
				" and t1.norm_id = t2.norm_id\
				and t2.option_id = t3.option_id\
				and t2.remark_id = t4.remark_id\
				and t1.category_id = t5.category_id\
				and t1.norm_id = t2.norm_id\
				order by t1.norm_order ASC";

			processNormMap(db, query, channelId, productId, priority, isFrontage, function(norms){
			
				selectSgfBrands(db, function(brands) {
					var obj = {"brands": brands};
					return fn(norms, obj);
				});
			}, -1, -1);

		},

		getStoreName: function(mId, categoryId){
			var that = this;

			fetchStoreName(db, mId, function(result){
				that.storeName = result.storeName;
				fetchCategoryName(db, categoryId, function(result){
					that.categoryName = result;
				});
			});
		},

		processCompNorm: function(norms, results, callback, brands) {
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

			for(var j = 0; j < results.length; j++){
				var result = results[j];
				var selectedBrandId = result.savedBrand;
				var brandList = brands.brands;
				for (var i = 0; i < brandList.length; i++) {
					if(brandList[i].id == selectedBrandId) {
						brandList[i].selected = "selected";
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
            if(!imageURI ){
                takePhoto = true;
            }


            if(!imageURI){
                takePhoto = true;
            }



			return callback(norms, brands, takePhoto, imageURI);
		}


	});

	return SgfNorm;
});