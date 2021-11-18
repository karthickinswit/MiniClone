define([
	"backbone",
	"mustache",
], function(Backbone, Mustache) {
	var AuditDone = {};

	AuditDone.Model  = Backbone.Model.extend({

	});

	AuditDone.View = Backbone.View.extend({
		className: "audits",

		auditDone: function(event) {

			var that = this;

			var mId = $(event.currentTarget).attr("href");
			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];

			var takePhoto = "no";
			var ele = that.$el.find(".norms");
			var priority = ele.attr("href");


			if(priority == 8){
				var success = function(results){
					if(results.length == 0){
						inswit.alert("Please Audit Hotspot Execution first before audit hotspot brand");
					}else{
						that.update(mId, auditId, storeId, channelId);
					}
				}

				var hotspotPid = that.model.get("hotspotPid");
				selectHotSpotExecutionDecision(db, auditId, storeId, hotspotPid, success);
			}else{

				var isBrandsAvailable = $(".brand_select");
				var savedBrand, sgfBrandId;
				var optionValue = $($(".sgf").find(".question")[0]).find(".option option:selected").text();
				if(isBrandsAvailable.length > 0) {
					if(optionValue == "No"){
						sgfBrandId = that.model.get("brandId");
						savedBrand = "";
						that.update(mId, auditId, storeId, channelId, sgfBrandId, savedBrand);
					}else {
						savedBrand = $(".brand_select").find("option:selected").attr("id");
						if(!savedBrand) {
							$(".brand_select").addClass("error");
							this.scrollView.scrollToElement($(".brand_select")[0]);
							return;
						}
						sgfBrandId = that.model.get("brandId");
						checkSgfSavedBrands(db, storeId, sgfBrandId, savedBrand, function(res){
							if(res.length > 0) {
								var count = res[0].brandSavedCount;
								if(count){
									inswit.alert("Selected SGF brand was already completed");
									return;
								}
							}else {
								that.update(mId, auditId, storeId, channelId, sgfBrandId, savedBrand);
							}
						});
					}
				}else {
					that.update(mId, auditId, storeId, channelId);
				}
			}
		},


		//Store the product details in client side DB temporarly.
		update: function(mId, auditId, storeId, channelId, sgfBrandId, savedBrand){
			var that = this;
			var takePhoto = "no";
			var ele = that.$el.find(".norms");
			var priority = ele.attr("href");
			var categoryId = that.model.get("categoryId");
			var cId = that.model.get("cId");

			var brandwiseNorm = that.model.get("brandwiseNorm");
			 

			var hotspotDecision;
			if($(".hotspot_decision").val()){
				hotspotDecision = $(".hotspot_decision").val().trim().toLowerCase();
			}
			
			if(priority == 10 && hotspotDecision != "no"){
				takePhoto = "yes"
			}

			if(priority == 6){
				takePhoto = "yes"
			}

			if(that.$el.find("#frontage_applicable").val()){
				takePhoto = that.$el.find("#frontage_applicable").val().toLowerCase() || "no";
			}

			getDistributor(db, auditId, storeId, function(distributor){

				var image = $(".photo_block img").attr("src");
	 			if(distributor != inswit.DISTRIBUTOR){ //For certain distributor photo is not mandatory
					if(takePhoto == "yes" && !image){
						// inswit.alert("Please take a brand photo!");
						// return;
					}
	 			}

				if(takePhoto == "no"){
					image = "";
				}

				var product = {};
				product.storeId = storeId;
				product.auditId = auditId;
				product.storeName = that.storeName;
				product.isContinued = true;
				product.isCompleted = false;
				product.image = "";
				product.imageId = "";
				product.norms = that.getValues();
				product.imageURI = image || "";
				product.priority = priority;
				product.cId = cId;
				product.isSOS = (brandwiseNorm == "true")? "1":"0";
				product.brandId = sgfBrandId;
				product.savedBrand = savedBrand;
				product.categoryId = categoryId;

				if(product.norms && product.norms.length > 0) {
					var callback = function(){
						//HotspotDescision is 'no' means we have to
						//update all hotspot brand norms as 'no'
						if(hotspotDecision == "no"){
							that.getAllHotspotBrands(auditId, storeId, channelId);
							window.history.back();
						}else if(hotspotDecision == "yes"){
							//Remove all hotspot brands from completed product table
							removeBrands(db, auditId, storeId);
							//If it is in verify page we need to go back and to do audits
							//for all other hotspot brands
							if(that.model.get("isVerify")){
								var route = "#audits/" + mId + "/products";
								router.navigate(route, {
					                trigger: true,
					                replace: true
					            });
							}else{
								window.history.back();
							}
						}else{
							window.history.back();
						}
					}
					var isSGF = that.model.get("isSGF");
            		if(isSGF) {
            			populateCompSgfTable(db, product, callback)
            		}else {
            			populateCompProductTable(db, product, callback);
            		}
				}else{
					//inswit.alert("No norms mapped to this product! \n Contact your administrator");
				}
	 		}, function(){

	 		});
		},

		getValues: function(){

			var elements = this.$el.find(".question");
			this.$(".norms").find(".error").removeClass("error");
			var normFieldType;
			var norms = [];
			for(var i = 0; i < elements.length; i++){
				var norm = {},
					remarkName,
					remarkId;

				var normEl = $(elements[i]);

				var id =  normEl.find(".field_type").attr("id").split("-");
	            var normId = id[0];
	            var productId = id[1];
	            var productName = id[2];


				var isConsider = normEl.attr("rel") || false;
				var normName = normEl.find(".product_name").attr("rel");
				// var normId = normEl.find(".product_name").attr("id");

				var productName = normEl.find(".product_header h2").parent().text();


			//	var normFieldType = normEl.find(".product_name").hasClass("field_type") ? 0:1;


				if(normEl.find("select").length){
					normFieldType = 1;
				}else if(normEl.find("input").length){
					normFieldType = 0;
				}

				
				if(normFieldType == inswit.FIELDS.TEXT_INPUT){
					var optionName = normEl.find(".field_value").val();
					if(optionName < 0) {
						alert("Negative value found, Please recheck the values.")
						return;
					}
					var optionId = normEl.find(".field_value").attr("id");
					remarkName = "No Remark";
					remarkId = "100"
				}else {
					var optionName = normEl.find(".option option:selected").text();
					var optionId = normEl.find(".option option:selected").attr("id");
				}


				
				if(optionName == "Yes" || optionName == "100" && normFieldType == 3){
					remarkName = normEl.find(".audit_yes option:selected").text() || "";
					remarkId = normEl.find(".audit_yes option:selected").attr("id") || "";
				}else if(normId == "000" && normFieldType == 1) {
					optionName = normEl.find("option:selected").text();
					optionId = normEl.find("option:selected").attr("id");
					remarkName =  normEl.find("option:selected").text();
					remarkId = normEl.find("option:selected").attr("id");
				}else if(normFieldType == 1){
					remarkName = normEl.find(".audit_no option:selected").text() || "";
					remarkId = normEl.find(".audit_no option:selected").attr("id") || "";
				}else if(normFieldType == 0 && !optionName) {
					normEl.find(".field_value").val("");
					remarkName = "No Remark";
					//remarkId = normEl.find(".audit_no option:selected").attr("id") || "";
				}

				var isCategory = (normEl.find("select").attr("rel") == "category")? true:false;

				if(isCategory && optionName == "Yes") {
					remarkName = "Available";
					remarkId = "1";
				}else if(isCategory && optionName == "No"){
					remarkName = "Not Available";
					remarkId = "2";
				}

				switch(normFieldType){
					case 0:
						if((optionName == "") || (remarkName == undefined)) {
							normEl.addClass("error");
							this.scrollView.scrollToElement(normEl[0]);
							return;
						}
						
					break;
					case 1:

						if((optionId == "" ) || (optionId == undefined)) {
							normEl.addClass("error");
							this.scrollView.scrollToElement(normEl[0]);
							return;
						}
						if((remarkId == "" ) || (remarkId == undefined)) {
							normEl.addClass("error");
							this.scrollView.scrollToElement(normEl[0]);
							return;
						}
					break;
				}

				
				
				norm.productName = productName;
				norm.productId = productId;
				norm.isConsider = isConsider;
				norm.normName = normName;
				norm.normId = normId;
				norm.optionName = optionName;
				norm.optionId = optionId;
				norm.remarkName = remarkName;
				norm.remarkId = remarkId;

				norms.push(norm);
			}

			return norms;
		}
	});

	return AuditDone;
});