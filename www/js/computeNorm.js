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
			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            


			var pId = that.model.get("pId");
			var product = that.model.get("product");
			var brandwiseNorm = that.model.get("brandwiseNorm");
            var categoryId = that.model.get("categoryId");
            var categoryType = that.model.get("categoryType");
            var brandId = that.model.get("brandId");
            var channelId = that.model.get("channelId");
            var isFrontage = that.model.get("isFrontage");
            var hotspotExecution = that.model.get("hotspotExecution");
            var productName = that.model.get("productName");
            var storeId = that.model.get("storeId");
            var qrCode = that.model.get("qrCode");
            var priority = product.priority


            //Show completed norms(With user modified values)
            var results = that.model.get("results");
            require(['templates/t_audit_questions'], function(template){
                var qrFlag;
                var takeMultiPhoto=false;
                var CatImages=[];
                if(categoryType=="0"){takeMultiPhoto=true;}
                var callback = function(norms){
                    var fetchCategory = false;
                    var alreadyAudited = true;
                    

                    var fn = "selectNorms";

                    if(brandwiseNorm) {
                        fn = "completedSmartSpotNorms";
                    }


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

                            if(norms[0]) {
                                qrFlag =  norms[0].qrFlag ;
                            }

                            for(var i = 0; i < norms.length; i++){
                                var norm = norms[i];
                                var no = norm.no;
                                var yes = norm.yes;
                                var options = norm.options;



                                for(var j = 0; j < results.length; j++){
                                    var result = results[j];

                                    if(norm.normId == result.normId){
                                        if(norm.multiplePhoto == true) {
                                            console.log("multiplePhoto");
                                            norm.auditImages = result.auditImages;
                                             if(result.remarkId == "2") {
                                                norm.hideMultiplePhotos = true;
                                             }
                                        }
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
                                norms.imageURI = imageURI;

                            }

                            var takePhoto = false;
                            if(!imageURI && priority == 6){
                                takePhoto = true;
                            }

                            if(!imageURI && priority == 10){
                                takePhoto = true;
                            }

                            norms.takePhoto = takePhoto;
                             norms.qrFlag = qrFlag;
                             

                            console.log(norms);
                            
                            
                           
                            selectCatImagePhotos(db,categoryId,auditId, storeId, function(mpdPhotos) {

                                if(mpdPhotos.length) {
                                    for(var i=0;i<mpdPhotos.length;i++)
                                    {
                                        CatImages[i]= mpdPhotos[i];
                                    }
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
                                            "categoryName": that.categoryName,
                                            "categoryType": categoryType,
                                            "qrFlag": qrFlag,
                                            "qrCode": qrCode,
                                            "takeMultiPhoto":takeMultiPhoto,
                                            "CatImages":CatImages,
                                            "takeCatPhoto":CatImages.length>0||false,
                                        },{multiplePhotoRows: template.multiplePhotoRows}
                                    );
                                }
                                else
                                {
                                 var   html = Mustache.to_html(
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
                                            "categoryName": that.categoryName,
                                            "categoryType": categoryType,
                                            "qrFlag": qrFlag,
                                            "qrCode": qrCode,
                                            "takeMultiPhoto":takeMultiPhoto,
                                            "CatImages":CatImages,
                                        },{multiplePhotoRows: template.multiplePhotoRows}
                                    );
                                }
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
                                that.$el.find(".takeMultiPhoto .remove_item").prop("disabled", true);

                                
                                return callbackFn(html);

                            });
                        
                        
                           

                            //toggleHotspot function will disable certain elements based on hotspot decision value
                            
                        });
                     }, fetchCategory, brandwiseNorm, categoryId, alreadyAudited, false, storeId);

                }

            if(brandwiseNorm){
                // Render (smartspot) brand norm without category that is already audited
                // No need to call category
                var alreadyAudited = true;
                callback([]);
            }else {
                //Render category and brandwise norm which is already audited.
                var alreadyAudited = true;
                var fetchCategory = true;
                selectNorms(db, channelId, pId, product.priority, product.is_frontage, callback, fetchCategory, brandwiseNorm, categoryId, alreadyAudited, false, storeId);
            }

            return that;

            });
		},

		showCompletedCategorySMbrands: function(callbackFn) {
		    var that = this;
		    var pId = that.model.get("pId");
            var channelId = that.model.get("channelId");
            var product = that.model.get("product");
            var priority = product.priority || "";
            var categoryId = that.model.get("categoryId");
            var brandwiseNorm = that.model.get("brandwiseNorm");
            var fetchCategory = false;
            var isFrontage = that.model.get("isFrontage");
            var hotspotExecution = that.model.get("hotspotExecution");
            var productName = that.model.get("productName");
            var qrCode = that.model.get("qrCode");

            var mId = that.model.get("mId");
            this.getStoreName(mId);

            var qrFlag;

            var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];

            var allResults = that.model.get("results");

            selectSmartSpotProductsToVerify(db, auditId, storeId, pId, function(response) {

                var results = response;

                for(var i = 0; i < results.length; i++ ){
                    var result = results[i];

                    for(var j = 0; j < allResults.length; j++){
                         var allResult = allResults[j];

                        if(result.normId == allResult.normId && result.productId == allResult.productId && allResult.multiple_photo == "true"){
                            if(allResult.auditImages && allResult.auditImages.length) {
                                result.auditImages = allResult.auditImages;
                            }
                            break;
                        }
                    }

                }

                 completedSmartSpotNorms(db, channelId, pId, priority, product.is_frontage, function(data) {
                      var norms = data;

                      //var results = that.model.get("results");

                       selectProduct(db, pId, categoryId, function(product){

                       require(['templates/t_category_smartspot'], function(template){

                            //Set first question as a frontage norm
                            if(isFrontage && norms[0]){
                                norms[0].isFrontage = isFrontage;
                            }

                            //Set first question as a hotspot decision norm
                            if(hotspotExecution && norms[0]){
                                norms[0].hotspotExecution = hotspotExecution;
                            }

                             if(norms[0]) {
                                qrFlag =  norms[0].qrFlag ;
                             }

                            for(var i = 0; i < norms.length; i++){
                                var norm = norms[i];
                                var no = norm.no;
                                var yes = norm.yes;
                                var options = norm.options;



                                for(var j = 0; j < results.length; j++){
                                    var result = results[j];

                                    if(norm.normId == result.normId && norm.productId == result.productId){
                                        var takePhoto = true;
                                        if(result.imageURI) {
                                            takePhoto = false;
                                            norm.imageURI = result.imageURI || "";
                                        }

                                        if(norm.multiplePhoto == true) {
                                            console.log("multiplePhoto");
                                            if(result.remarkId == "2") {
                                                norm.hideMultiplePhotos = true;
                                            }
                                            norm.auditImages = result.auditImages;
                                        }

                                        if(result.qrCode) {
                                            qrFlag = true;
                                            qrCode = result.qrCode;
                                        }

                                        norm.takePhoto = takePhoto;

                                        for(var k = 0; k < options.length; k++){

                                            if(result.optionId == options[k].optionId){
//                                                if(norm.productId == result.productId ){
                                                        options[k].optionName = result.optionName;
                                                        options[k].selected = "selected";
                                                        break;
                                                }/*else {
                                                    options[k].selected = "selected";
                                                    break;
                                                }*/
//                                            }
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

                          /*  var isImage = false;
                            var imageURI = results[0].imageURI || "";
                            if(imageURI){
                                isImage = true;
                            }

                            var takePhoto = false;
                            if(!imageURI && priority == 6){
                                takePhoto = true;
                            }

                            */
                            /*if(!imageURI && priority == 10){
                                takePhoto = true;
                            }*/
                            console.log(norms);
                            var html = Mustache.to_html(
                                template.smartSpot,
                                {
                                    "norms":norms,
                                    "mId":mId,
                                    "productName":productName,
                                    "productId":pId,
                                    "name": that.storeName,
//                                    "imageURI":imageURI,
//                                    "isImage":isImage,
                                    "takePhoto":takePhoto,
                                    "element":"retake_product_photo",
                                    "priority": priority,
                                    "categoryName": that.categoryName,
                                    "qrFlag": qrFlag,
                                    "qrCode": qrCode

                                }, {multiplePhotoRows: template.multiplePhotoRows}
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

                    });

                 },fetchCategory, brandwiseNorm, categoryId, false, false, storeId);
            }, categoryId);
		},

		showCategorySmartSpotBrandNorms: function(callbackFn) {
		    var that = this;
            var pId = that.model.get("pId");
            var channelId = that.model.get("channelId");
            var product = that.model.get("product");
            var priority = product.priority || "";
            var categoryId = that.model.get("categoryId");
            var brandwiseNorm = that.model.get("brandwiseNorm");
            var fetchCategory = false;
            var isFrontage = that.model.get("isFrontage");
            var hotspotExecution = that.model.get("hotspotExecution");
            var productName = that.model.get("productName");

            var mId = that.model.get("mId");
            this.getStoreName(mId);


            var storeId = that.model.get("storeId");


            selectSmarsportNorms(db, channelId, pId, priority, product.is_frontage, function(data) {
                var norms = data;
                   norms[0].isConsider = false;

                  if(isFrontage && norms[0]){
                        norms[0].isFrontage = isFrontage;
                   }
                    //Set first question as a hotspot decision norm
                    if(hotspotExecution && norms[0]){
                        norms[0].hotspotExecution = hotspotExecution;
                    }
                norms[0].takePhoto = true;

                selectProduct(db, pId, channelId, function(product){
                    require(['templates/t_category_smartspot'], function(template){
                        var takePhoto = false;
                        if(product.priority == 6 || product.priority == 10){
                            takePhoto = true;
                        }
                        norms.productName = productName;
                        norms.productId = pId;
                        norms.mId = mId;

                        var html = Mustache.to_html(
                            template.smartSpot,
                            {
                                "norms":norms,
                                "mId":mId,
                                "productName":productName,
                                "productId":norms[0].productId,
                                "name":that.storeName,
                                "takePhoto": takePhoto,
                                "element":"retake_product_photo",
                                "priority": priority,
                                "categoryName": that.categoryName,
                                "qrFlag": norms[0].qrFlag,
                                "previousQRcode": norms[0].previousQRcode
                            }, {multiplePhotoRows: template.multiplePhotoRows}
                        );
                        return callbackFn(html);
                    });
                });

            },fetchCategory, brandwiseNorm, categoryId, "", "", storeId);
		},

		showNorm: function(callbackFn) {
			var that = this;
			var qrFlag;
			var pId = that.model.get("pId");
			var channelId = that.model.get("channelId");
			var product = that.model.get("product");
			var priority = product.priority || "";
			var categoryId = that.model.get("categoryId");
			var categoryType = that.model.get("categoryType");
			var brandwiseNorm = that.model.get("brandwiseNorm");
			var isFrontage = that.model.get("isFrontage");
			var hotspotExecution = that.model.get("hotspotExecution");
			var productName = that.model.get("productName");
            var count=that.model.get("count");
           // normsArr["key"]=[];
           // normsArr["value"]=[];
            var normItem=[];
            

			var auditPhotos = [];

			var mId = that.model.get("mId");
			this.getStoreName(mId);

			var storeId = that.model.get("storeId");

			var callback = function(norms, brandwiseNorm){
				var fetchCategory = false;
				var alreadyAudited = false;
                

				selectNorms(db, channelId, pId, priority, product.is_frontage, function(results) {
					
					norms = norms.concat(results);
                    if(isFrontage && norms[0]){
                        norms[0].isFrontage = isFrontage;
                    }
                    //Set first question as a hotspot decision norm
                    if(hotspotExecution && norms[0]){
                        norms[0].hotspotExecution = hotspotExecution;
                    }

                    if(norms[0]) {
                         qrFlag =  norms[0].qrFlag ;
                    }

                    norms[0].takePhoto = true;
                    
                    if(count)
                    {
                        for(var i=0;i<count;i++)
                        { 
                           var normsArr={};
                           normsArr["key"]=i;
                           var norms1=norms;
                           var norms3= norms.concat(norms1);
                           //norms=norms3;
                           //normItem.push(norms3);
                           normsArr["value"]=norms3;
                           normItem.push(normsArr);
                        }
                    }
                    else {
                        var normsArr={};
                        normsArr["key"]=0;
                        normsArr["value"]=(norms);
                        normItem.push(normsArr);
                    }
                    
    


                    selectProduct(db, pId, channelId, function(product){
                        require(['templates/t_audit_questions'], function(template){
                            var takePhoto = false;
                            if(product.priority == 6 || product.priority == 10){
                                takePhoto = true;
                            }
                            norms.productName = productName;
                            norms.productId = pId;
                            norms.mId = mId;
                            norms.qrFlag = qrFlag;
                            var takeMultiPhoto=false;
                            takePhoto=true;
                            //  if(categoryType=="0")
                            //  {
                            //     takeMultiPhoto=true;  
                            //     takePhoto=false;
                            //  }
                            
               
                            var html = Mustache.to_html(
                                template.normTemplate,
                                {
                                    "norms":norms,
                                    "mId":mId,
                                    "productName":productName,
                                    "productId":pId,
                                    "name":that.storeName,
                                    "takePhoto": takePhoto,
                                    "element":"retake_product_photo",
                                    "priority": priority,
                                    "categoryName": that.categoryName,
                                    "qrFlag": qrFlag,
                                    "categoryType": categoryType,
                                    "takeMultiPhoto":takeMultiPhoto,
                                    "normItem":normItem
                                }, {multiplePhotoRows: template.multiplePhotoRows}
                            );
                            var imageURI="",isImage="";
                            
                        

                           // that.$el.append(html1);
                            return callbackFn(html);
                        });
                    });
				}, fetchCategory, brandwiseNorm, categoryId, false, false, storeId);
			}

			if(brandwiseNorm){
				// No need to call category
				var fetchCategory = false;
				callback([], brandwiseNorm);
			}else {
				var alreadyAudited = false;
				var fetchCategory = true;
				selectNorms(db, channelId, pId, priority, product.is_frontage, callback, fetchCategory, brandwiseNorm, categoryId, alreadyAudited, false, storeId);
			}
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


		 addPhoto: function(event) {
           event.preventDefault();
           var that = this;
           var count = this.$el.find(".field_value").val();
           var photoElLen = this.$el.find(".gillette_table_row").length;
           if(count <= photoElLen) {
               inswit.alert("Given MPD count and number of photos should to be same");
               return;
           }else {
               require(['templates/t_audits'], function(template){
                   var html = Mustache.to_html(template.photoBlock);
                   that.$el.find(".gillette_table_body").append(html);
                   that.scrollView.refresh();
               });
           }

        },

        removePhoto: function(event) {
           var target =  $(event.target).parents().parents().parents().get(0);
           target.remove();
        }
	});

	return NormCompleted;
});
