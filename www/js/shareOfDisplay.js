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
			"change .category_option": "onCategoryChange",
			"change .brand_select": "onBrandChange",
			"click .add_item": "addItem",
			"click .remove_item": "removeItem",
			"click .save_sod_audit": "saveItem"
		
		},

		showBrands: function(mId, categoryId){
			var that = this;

			this.getStoreName(mId);


			setTimeout(function(){
				var id = mId.split("-");
	            var auditId = id[0];
	            var storeId = id[1];
	            var channelId = id[2];

	            that.model.set("auditId", auditId);
	            that.model.set("storeId", storeId);
	            that.model.set("channelId", channelId);

				var callback = function(result){
					require(['templates/t_list'], function(template){
							var categories = {};
							
							var length = result.length;
							for(var i =0; i<length; i++){
								if(result[i].category_type == 1) {
									result[i].smartSpot = true;
								}
							}
							
							categories = {"categories" : result};
							categories.mId = mId;
							categories.name = that.storeName;
							var html = Mustache.to_html(template.categoryOption, categories);
							that.$el.empty().append(html);

							that.$el.find(".SOD_header, .brand_header, .save_sod_audit").hide();
							that.$el.find(".brand_option").show();

							that.refreshScroll("wrapper_products");
					});
				};
				var sod = true;
				fetchCategories(db, channelId, callback, sod);
				
			}, 350);
		},

		onBrandChange: function(e) {
			var that = this;
			var brandId = e.target.options[e.target.selectedIndex].id;
			if(brandId == ""){
				that.$el.find(".save_sod_audit, .SOD, .SOD_header").hide();
				return;
			}

			this.model.set("brandId", brandId);

			var categoryId = this.model.get("categoryId");

			var auditId = that.model.get("auditId");
	        var storeId = that.model.get("storeId");


			that.$el.find(".SOD").empty();

			setTimeout(function(){

				var callback = function(result){
					var data = result;

					require(['templates/t_list'], function(template){
				

						var tos = [];
						var length = data.length;
						for (var i = 0; i < length; i++) {
							var obj = {};
							obj.id = data[i].sod_id;
							obj.name = data[i].sod_name;
							obj.value = data[i].count || 0;

							tos.push(obj);
						};



						var json = {"tos" : tos};
						var html = Mustache.to_html(template.SOD, json);
						that.$el.find(".SOD").empty().append(html);

						that.$el.find(".SOD_header, .SOD").show();

						that.$el.find(".save_sod_audit").show();

						that.refreshScroll("wrapper_products");
					});
				};
				
				selectCompSodTable(db, categoryId, brandId, auditId, storeId, callback);
				
			}, 350);		
		},

		onCategoryChange: function(e) {
			var that = this;
			var categoryId = e.target.options[e.target.selectedIndex].id;
			that.$el.find(".brand_option, .SOD").empty();

			this.model.set("categoryId", categoryId);
			setTimeout(function(){

				var callback = function(result){
					require(['templates/t_list'], function(template){
							var brands = {};
							
							brands = {"brands" : result};
							var html = Mustache.to_html(template.brandOption, brands);
							that.$el.find(".brand_option").empty().append(html);

							that.refreshScroll("wrapper_products");
							that.$el.find(".brand_header, .brand_option").show();
					});
				};
				
				selectCategoryBrands(db, categoryId,  callback);
				
			}, 350);

			that.$el.find(".save_sod_audit").hide();

			that.refreshScroll("wrapper_products");

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

		addItem: function(event) {
			var el = $(event.target.parentElement.parentElement).find(".item_count");
			var count = parseInt(el.text())+1;
			el.text(count);
		},

		removeItem: function(event) {
			var el = $(event.target.parentElement.parentElement).find(".item_count");
			var count = parseInt(el.text())-1;
			if(count >= 0)
				el.text(count);
		},

		saveItem: function() {
			var that = this;
			this.model;
			var result = [];
			
			var sodRow =  this.$el.find(".sod_row");
			var length = sodRow.length;
			for(var i =0; i<length; i++){
				var data = {};
				var el = $(sodRow[i]);

				var sodId =  el.find(".sod_name").attr("id"); 
				var itemCount = el.find(".item_count").text();
				data.sod_id = sodId
				data.count = itemCount;
				data.audit_id = that.model.get("auditId");
				data.store_id = that.model.get("storeId");
				data.category_id = that.model.get("categoryId");
				data.brand_id = that.model.get("brandId");

				result.push(data);

			}
			populateCompSodTable(db, result, function() {
				console.log("success");
			});
			that.$el.find(".brand_option, .save_sod_audit, .brand_header, .SOD, .SOD_header").hide();

			that.$el.find(".category_option").prop('selectedIndex',0)
			that.refreshScroll("wrapper_products");

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