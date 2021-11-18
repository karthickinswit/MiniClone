define(["jquery"], function(){
	var Audit = function() {

	};

	Audit.prototype = {

		auditDone: function(el, event) {

			var that = this;

			this.scrollView = el.scrollView;

			var mId = $(event.currentTarget).attr("href");

			this.getStoreName(el, mId);

			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];

			var takePhoto = "no";
			var ele = el.$el.find(".norms");
			var priority = ele.attr("href");


			if(priority == 8){
				var success = function(results){
					if(results.length == 0){
						inswit.alert("Please Audit Hotspot Execution first before audit hotspot brand");
					}else{
						that.update(el, mId, auditId, storeId, channelId);
					}
				}

				var hotspotPid = el.model.get("hotspotPid");
				selectHotSpotExecutionDecision(db, auditId, storeId, hotspotPid, success);
			}else{

				var isBrandsAvailable = $(".brand_select");
				var savedBrand, sgfBrandId;
				var optionValue = $($(".sgf").find(".question")[0]).find(".option option:selected").text();
				if(isBrandsAvailable.length > 0) {
					if(optionValue == "No"){
					    savedBrand = $(".brand_select").find("option:selected").attr("id");
                        if(!savedBrand) {
                            $(".brand_select").addClass("error");
                            el.scrollView.scrollToElement($(".brand_select")[0]);
                            return;
                        }
						sgfBrandId = el.model.get("brandId");

						checkSgfSavedBrands(db, storeId, sgfBrandId, savedBrand, function(res){
                            if(res.length > 0) {
                                var count = res[0].brandSavedCount;
                                if(count){
                                    inswit.alert("Selected SGF brand was already completed");
                                    return;
                                }
                            }else {
                                that.update(el, mId, auditId, storeId, channelId, sgfBrandId, savedBrand);
                            }
                        });
					}else {
						savedBrand = $(".brand_select").find("option:selected").attr("id");
						if(!savedBrand) {
							$(".brand_select").addClass("error");
							el.scrollView.scrollToElement($(".brand_select")[0]);
							return;
						}
						sgfBrandId = el.model.get("brandId");
						checkSgfSavedBrands(db, storeId, sgfBrandId, savedBrand, function(res){
							if(res.length > 0) {
								var count = res[0].brandSavedCount;
								if(count){
									inswit.alert("Selected SGF brand was already completed");
									return;
								}
							}else {
								that.update(el, mId, auditId, storeId, channelId, sgfBrandId, savedBrand);
							}
						});
					}
				}else {
					that.update(el, mId, auditId, storeId, channelId);
				}
			}
		},

		//Store the product details in client side DB temporarly.
		update: function(element, mId, auditId, storeId, channelId, sgfBrandId, savedBrand){
			var that = this;
			var takePhoto = "no";
			var ele = element.$el.find(".norms");
			var priority = ele.attr("href");
			var categoryId = element.model.get("categoryId");
			var cId = element.model.get("cId");
			var norms;

			var brandwiseNorm = element.model.get("brandwiseNorm");
			 
            var qrResult = $(".qrcode_text").val() || "";

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

			if(element.$el.find("#frontage_applicable").val()){
				takePhoto = element.$el.find("#frontage_applicable").val().toLowerCase() || "no";
			}

			getDistributor(db, auditId, storeId, function(distributor){

				var image = element.$el.find(".photo_block img").attr("src");
	 			if(distributor != inswit.DISTRIBUTOR){ //For certain distributor photo is not mandatory
					if(takePhoto == "yes" && !image){
						// inswit.alert("Please take a brand photo!");
						// return;
					}
	 			}

				if(takePhoto == "no"){
					image = "";
				}

				var isSGF = element.model.get("isSGF");
                if(isSGF) {
                    var sgfEl = element.$el.find(".sgf");
                    if(sgfEl.length == 1) {
                        var product = {};
                        product.storeId = storeId;
                        product.auditId = auditId;
                        product.storeName = that.storeName;
                        product.isContinued = true;
                        product.isCompleted = false;
                        product.image = "";
                        product.imageId = "";
                        product.norms = that.getValues(sgfEl);
                        product.imageURI = that.getImageUri(sgfEl) || "";
                        product.qrResult = "";
                        product.priority = priority;
                        product.cId = cId;
                        product.isSOS = (brandwiseNorm == "true")? "1":"0";
                        product.brandId = sgfBrandId;
                        product.savedBrand = savedBrand;
                        product.categoryId = categoryId;
                    }
                    populateCompSgfTable(db, product, function() {
                        window.history.back();
                        $(".product_done").removeClass("clicked");
                        return;
                    });
                }

				var categoryBrandEl = element.$el.find(".category-brand-norm");
				if(categoryBrandEl.length == 1) {
				    var product = {};
                    product.storeId = storeId;
                    product.auditId = auditId;
                    product.storeName = that.storeName;
                    product.isContinued = true;
                    product.isCompleted = false;
                    product.image = "";
                    product.imageId = "";
                    product.norms = that.getValues(categoryBrandEl);
                    product.imageURI = that.getImageUri(categoryBrandEl) || ""||categoryBrandEl.find(".takeMultiPhoto img").attr( 'src' );;
                    product.priority = priority;
                    product.cId = cId;
                    product.isSOS = (brandwiseNorm == "true")? "1":"0";
                    product.brandId = sgfBrandId;
                    product.savedBrand = savedBrand;
                    product.categoryId = categoryId;
                    product.qrResult = "";
                   // that.getImageUri(element.$el.find(".takeMultiPhoto")) || "";


				}

				 /* Smartspot category insert*/
                if(brandwiseNorm) {

                    var callback = function(){
                        //HotspotDescision is 'no' means we have to
                        //update all hotspot brand norms as 'no'
                        if(hotspotDecision == "no"){
                            that.getAllHotspotBrands(auditId, storeId, channelId);
                            window.history.back();
                            $(".product_done").removeClass("clicked");
                        }else if(hotspotDecision == "yes"){
                            //Remove all hotspot brands from completed product table
                            removeBrands(db, auditId, storeId);
                            //If it is in verify page we need to go back and to do audits
                            //for all other hotspot brands
                            if(element.model.get("isVerify")){
                                var route = "#audits/" + mId + "/products";
                                router.navigate(route, {
                                    trigger: true,
                                    replace: true
                                });
                            }else{
                                window.history.back();
                                $(".product_done").removeClass("clicked");
                            }
                        }else{
                            window.history.back();
                            $(".product_done").removeClass("clicked");
                        }
                    }

                    populateCompProductTable(db, product, function() {
                       // var mpdEl = categoryBrandEl.find(".gillette_table_row");
                        // if(categoryId=="0")
                        // {
                        //     mpdEl=element.$el.find(".category-brand-norm")
                        // }
                        var mpdEl = categoryBrandEl.find(".gillette_table_row");


                        if(mpdEl.length) {
                            var mpdPhotoEl = $(".question .gillette_table");
                           

                             for(var j = 0; j < mpdPhotoEl.length; j++) {
                                var el = $(mpdPhotoEl[j]);

                                var id =  el.attr("id").split("-");

                                var audit = {};
                                audit.storeId = storeId;
                                audit.normId = id[0];
                                audit.brandId = id[1];
                                audit.categoryId = categoryId;
                               
                                    that.getMPDImages(audit, el);
                                
                                
                                if(j + 1 == mpdPhotoEl.length){
                                    populateCompProductTable(db, product, callback);
                                }else{
                                    populateCompProductTable(db, product);
                                }

                             }
                        }else {
                             populateCompProductTable(db, product, callback);
                        }

//                        window.history.back();
//                        $(".product_done").removeClass("clicked");
                    });
                }

				if(!isSGF) {

                    populateCompProductTable(db, product, function() {
                        var categoryType = $(".norms").attr("id");
                        if(categoryType=="0")
                        {
                            var mpdEl = categoryBrandEl.find(".gillette_table_row");


                        if(mpdEl.length) {
                            var mpdPhotoEl = $(categoryBrandEl).find(".gillette_table");
                           

                             for(var j = 0; j < mpdPhotoEl.length; j++) {
                                var el = $(mpdPhotoEl[j]);

                                var id =  el.attr("id").split("-");

                                var audit = {};
                                audit.storeId = storeId;
                                audit.auditId = auditId;
                                audit.brandId = id[1];
                                audit.categoryId = categoryId;
                                if(categoryType=="0")
                                    {
                                        audit.categoryType=categoryType;
                                        audit.channelId=cId;
                                     }
                               
                                    that.getCatImages(audit, el);
                                
                                
                                if(j + 1 == mpdPhotoEl.length){
                                   // populateCompProductTable(db, product, callback);
                                }else{
                                    //populateCompProductTable(db, product);
                                }

                             }
                        }
                        }


                        var callback = function(){
                            //HotspotDescision is 'no' means we have to
                            //update all hotspot brand norms as 'no'
                            if(hotspotDecision == "no"){
                                that.getAllHotspotBrands(auditId, storeId, channelId);
                                window.history.back();
                                $(".product_done").removeClass("clicked");
                            }else if(hotspotDecision == "yes"){
                                //Remove all hotspot brands from completed product table
                                removeBrands(db, auditId, storeId);
                                //If it is in verify page we need to go back and to do audits
                                //for all other hotspot brands
                                if(element.model.get("isVerify")){
                                    var route = "#audits/" + mId + "/products";
                                    router.navigate(route, {
                                        trigger: true,
                                        replace: true
                                    });
                                }else{
                                    window.history.back();
                                    $(".product_done").removeClass("clicked");
                                }
                            }else{
                                window.history.back();
                                $(".product_done").removeClass("clicked");
                            }
                        }

                        var smartSpotEl = element.$el.find(".smartSpot");
                        var length = smartSpotEl.length;
                        if(length != 0){
                            for(var i = 0; i< length; i++ ){
                                var product = {};
                                product.storeId = storeId;
                                product.auditId = auditId;
                                product.storeName = that.storeName;
                                product.isContinued = true;
                                product.isCompleted = false;
                                product.image = "";
                                product.imageId = "";
                                product.norms = that.getValues($(smartSpotEl[i]));
                                product.imageURI = that.getImageUri($(smartSpotEl[i])) || "";
                                product.qrResult = that.getQrData($(smartSpotEl[i])) || "";
                                product.priority = priority;
                                product.cId = cId;
            //                    product.isSOS = (brandwiseNorm == "true")? "1":"0";
                                product.isSOS = 1;
                                product.brandId = sgfBrandId;
                                product.savedBrand = savedBrand;
                                product.categoryId = "27";

                                if(length-1 > i){
                                    populateCompProductTable(db, product, "");
                                }else {
                                    var mpdEl = smartSpotEl.find(".gillette_table_row");

                                    if(mpdEl.length) {
                                        var mpdPhotoEl = $(".question .gillette_table");

                                        for(var j = 0; j < mpdPhotoEl.length; j++) {
                                            var el = $(mpdPhotoEl[j]);

                                            var id =  el.attr("id").split("-");

                                            var audit = {};
                                            audit.storeId = storeId;
                                            audit.normId = id[0];
                                            audit.brandId = id[1];
                                            audit.categoryId = categoryId;

                                            that.getMPDImages(audit, el);
                                            if(j + 1 == mpdPhotoEl.length){
                                                populateCompProductTable(db, product, callback);
                                            }else{
                                                populateCompProductTable(db, product);
                                            }

                                        }

                                    }else {
                                        populateCompProductTable(db, product, callback);
                                    }

                                }

                            }
                        }else {
                            // window.history.back();
                        }


                        /*if(product.norms && product.norms.length > 0) {
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
                                    if(element.model.get("isVerify")){
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
                            var isSGF = element.model.get("isSGF");
                            if(isSGF) {
                                populateCompSgfTable(db, product, callback)
                            }else {
                                populateCompProductTable(db, product, callback);
                            }
                        }else{
                        //inswit.alert("No norms mapped to this product! \n Contact your administrator");
                        }*/

                    });
                }
	 		}, function(){

	 		});
	 		return false;
		},

		getImageUri: function(element) {
		     var flag = $(element).find(".take_product_photo").attr("rel");
		     if(!flag || flag == "true") {
		        flag = true;
		     }else {
		        flag = false;
		     }
            var isVisible = $(element).find(".photo_block").is(":visible");
            if(isVisible) {
                 var imageUri = element.find(".photo_block img").attr("src");
                 if(imageUri && imageUri.startsWith("images/matrix_icons")) {
                    imageUri = null;
                 }
                 if(!imageUri && flag) {
                    var photoBlock = element.find(".take_product_photo");
                    this.scrollView.scrollToElement(photoBlock[0]);
                    photoBlock.addClass("error").addClass("error_background");
                    var erMsgIsPresent = photoBlock.find(".error_message").length;
                    if(!erMsgIsPresent)
                        photoBlock.append('<div class="error_message" style="display:block"> Photo required </div>');

                    $(".product_done").removeClass("clicked");
                    throw new Error('Brand photo is not present');
                 }
                 console.log(imageUri);

                 return imageUri;
            }
		},


		getMPDImages: function(product, element) {

		    var no = element.parent().find("#frontage_applicable").find(":selected").text();

            cleanMPDTable(db, product, function() {

                var getMPDPhoto =  element.find(".gillette_table_row");

                var noOfRows = getMPDPhoto.length;

                for(var i=0; i<noOfRows; i++) {

                    if($(getMPDPhoto[i]).find("img")) {
                        var imgUrl = $(getMPDPhoto[i]).find("img").attr("src");


                        var imgPos = i+1;
                        console.log("Photo"+ imgUrl);

                        var mpdNorm = {};
                        mpdNorm.storeId = product.storeId;
                        mpdNorm.brandId = product.brandId;
                        mpdNorm.normId = product.normId;
                        mpdNorm.image = imgUrl;
                        mpdNorm.imgPos = imgPos;
                        mpdNorm.categoryId = product.categoryId;

                        console.log("mpdNorm"+ mpdNorm);

                         if(no == "No") {
                            removeMPDImageURI(db, imgUrl)
                         }else {

                            populateMPDTable(db, mpdNorm);

                         }
                    }
                }
            });

		},
        getCatImages: function(product, element) {

		    var no = element.parent().find("#frontage_applicable").find(":selected").text();

            cleanCatImageTable(db, product, function() {

                var getMPDPhoto =  element.find(".gillette_table_row");

                var noOfRows = getMPDPhoto.length;

                for(var i=0; i<noOfRows; i++) {

                    if($(getMPDPhoto[i]).find("img")) {
                        var imgUrl = $(getMPDPhoto[i]).find("img").attr("src");


                        var imgPos = i+1;
                        console.log("Photo"+ imgUrl);

                        var mpdNorm = {};
                        mpdNorm.storeId = product.storeId;
                        //mpdNorm.brandId = categoryType;
                        mpdNorm.normId = product.normId;
                       // mpdNorm.normId = product.normId;
                        mpdNorm.image = imgUrl;
                        mpdNorm.imgPos = imgPos;
                        mpdNorm.categoryId = product.categoryId;
                        mpdNorm.categoryType=product.categoryType;
                        mpdNorm.channelId=product.channelId;
                        mpdNorm.auditId=product.auditId;

                        console.log("mpdNorm"+ mpdNorm);

                         if(no == "No") {
                           // removeMPDImageURI(db, imgUrl)
                         }else {

                            populateCatImageTable(db, mpdNorm);

                         }
                    }
                }
            });

		},

		getQrData: function(element) {
		    var data = element.find(".qrcode_text").val();
            console.log(data);

            return data;
		},

		checkPromoValues: function(elements) {

		    var length = elements.length;
            for(var i = 0; i < length; i++){
                var flag = true;
                var normEl = $(elements[i]);
                var optionName = normEl.find(".field_value").val();
                if(!optionName) {
                    flag = false;
                    if(i == length-1 ){
                        return flag;
                    }
                    continue;
                }else {
                    return flag;
                }
            }
		},

		getValues: function(element) {
		    var that = this;
			var elements = element.find(".question");
			$(".norms").find(".error").removeClass("error");
			var categoryType = $(".norms").attr("id");
			var normFieldType;
			var norms = [];
			var isPromoValuePresent = false;
			var percentage = 0;

			if(categoryType == 4) {
                isPromoValuePresent = that.checkPromoValues(elements);
                if(!isPromoValuePresent) {
                    alert("Fill atleast one value.");
                    $(".product_done").removeClass("clicked");
                    return;
                }
			}
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
					var percentage = normEl.find(".field_value").attr("rel");

					if(optionName < 0) {
						alert("Negative value found, Please recheck the values.")
						$(".product_done").removeClass("clicked");
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

				
				if(categoryType != 4){
				    switch(normFieldType){
                        case 0:
                            if((optionName == "") || (remarkName == undefined) && !isPromoValuePresent) {
                                normEl.addClass("error");
                                this.scrollView.scrollToElement(normEl[0]);
                                $(".product_done").removeClass("clicked");
                                return;
                            }

                        break;
                        case 1:

                            if((optionId == "" ) || (optionId == undefined)) {
                                normEl.addClass("error");
                                this.scrollView.scrollToElement(normEl[0]);
                                $(".product_done").removeClass("clicked");
                                return;
                            }
                            if((remarkId == "" ) || (remarkId == undefined)) {
                                normEl.addClass("error");
                                this.scrollView.scrollToElement(normEl[0]);
                                $(".product_done").removeClass("clicked");
                                return;
                            }
                        break;
                    }
				}
              
				var mpdEl = normEl.find(".gillette_table_body");
                
                if(mpdEl.length) {

                    var noOfRowsEl = mpdEl.find(".gillette_table_row");
                    var isInvalidPhoto = false;

                    var len = noOfRowsEl.length;
                    for(var k = 0; k < len; k++) {
                        var availablePhoto = $(noOfRowsEl[k]).find(".photo_block_container img").attr("src");
                        var isInvalidPhoto = availablePhoto.startsWith("images/matrix_icons");
                        if(isInvalidPhoto){
                            break;
                        }
                    }

                   if(optionName == "Yes") {
                        if(len != (remarkName) || isInvalidPhoto) {
                           alert("Given MPD count and number of photos should be same.")
                           $(".product_done").removeClass("clicked");
                           throw new Error('Given MPD count and number of photos should be same');
                           return;
                        }
                   }
                }
                         if(categoryType == 0)
                            {
                                var mpdEl = element.find(".gillette_table_body1");
                                 if(mpdEl.length) {
                    
                                        var noOfRowsEl = mpdEl.find(".gillette_table_row");
                                        var isInvalidPhoto = false;
                    
                                        var len = noOfRowsEl.length;
                                        for(var k = 0; k < len; k++) {
                                            var availablePhoto = $(noOfRowsEl[k]).find(".photo_block_container img").attr("src");
                                            var isInvalidPhoto = availablePhoto.startsWith("images/matrix_icons");
                                            if(isInvalidPhoto){
                                                break;
                                            }
                                        }
                    
                                       
                                            if(isInvalidPhoto) {
                                               alert("Please take a Category Photo")
                                               $(".product_done").removeClass("clicked");
                                               throw new Error('Category Photo');
                                               return;
                                            }
                                       
                                    } 
                        
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
				norm.percentage = percentage;

				norms.push(norm);
			}

			return norms;
		},

		getAllHotspotBrands: function(auditId, storeId, channelId){
			var that = this;

            var callback = function(response){

            	var len = response.rows.length;
            	for(var i = 0; i < len; i++){
	                var obj = response.rows.item(i);
	                var pId = obj.product_id;
	                var pName = obj.product_name;
	                var priority = obj.priority;

					that.selectHotSpotNorms(auditId, storeId, channelId, pId, pName, priority);
	            }
			};
				
			var error = function(e, a){};

			selectAllHotSpotBrands(db, auditId, storeId, channelId, callback, error);
		},

		selectHotSpotNorms: function(auditId, storeId, channelId, pId, pName, priority){
			var that = this;
			var fetchCategory = true;

			var brandwiseNorm = that.model.get("brandwiseNorm");
			var channelId = that.model.get("channelId");

			var cId ;
			if(brandwiseNorm) {
				cId = that.model.get("cId");
			}
			
			cId = channelId;

			var fn = function(norms){
				fetchCategory = false;

				selectNorms(db, channelId, pId, priority, fetchCategory, function(results) {
					norms = results.concat(norms);

					var product = {};
					product.storeId = storeId;
					product.auditId = auditId;
					product.storeName = that.storeName;
					product.isContinued = true;
					product.isCompleted = false;
					product.image = "";
					product.imageId = "";
					product.norms = that.getDefaultValues(norms, pId, pName, priority);
					product.imageURI = "";
					product.priority = priority;
					product.channelId = channelId;
					product.cId = cId;
					//product.isSOS = ;

				var cb = function(){}

				populateCompProductTable(db, product, cb);

				}, fetchCategory, brandwiseNorm, channelId, false, false, storeId);
			}

				if(brandwiseNorm){
					fetchCategory = false;
					callback.call([]);
				}else {
					selectNorms(db, channelId, pId, priority, product.is_frontage, callback, fetchCategory, brandwiseNorm, channelId, false, false, storeId);
				}
		},

		getDefaultValues: function(norms, pId, pName, priority){
			var values = [];
			for(var i = 0; i < norms.length; i++){
				var norm = norms[i];
				
				//Getting default options
				var optionName, optionId, remarkName, remarkId;
				for(var j = 0; j < norm.options.length; j++){
					var option = norm.options[j];

					if(option.optionName.replace(/\s/g, '').toLowerCase() == "no"){
						optionName = option.optionName;
						optionId = option.optionId;
						break;
					}
				}

				//Getting default remarks
				for(var k = 0; k < norm.no.length; k++){
					var remark = norm.no[k];

					if(remark.remarkId == "44"){
						remarkName = remark.remarkName;
						remarkId = remark.remarkId;
						break;
					}
				}

				var value = {};
				value.productName = pName;
				value.productId = pId;
				value.isConsider = norm.isConsider;
				value.normName = norm.normName;
				value.normId = norm.normId;
				value.optionName = optionName;
				value.optionId = optionId;
				value.remarkName = remarkName;
				value.remarkId = remarkId;

				values.push(value);
			}

			return values;
		},

		getStoreName: function(el, mId){
			var that = this;

			fetchStoreName(db, mId, function(result){
				that.storeName = result.storeName;
				var channelId = el.model.get("categoryId");
				fetchCategoryName(db, channelId, function(result){
					that.categoryName = result;
				});
			});
		},

	}

	return new Audit();
});