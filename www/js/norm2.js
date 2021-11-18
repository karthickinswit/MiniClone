"use strict";

define([
	"backbone",
	"mustache",
	"SGF/sgfNorms",
	"computeNorm",
	"submitAudit",
	"select2"
], function(Backbone, Mustache, sgfNorms, computeNorm, submitAudit) {
	var Norm = {};
	Norm.Model = Backbone.Model.extend({
		
		initialize: function() {}                             
	});

	Norm.View = Backbone.View.extend({

		className: "audits",

		events:{
			"click .take_product_photo": "takeProductPicture",
			"click .retake_product_photo": "retakeProductPicture",
			"click .retake_photo": "retakeProductPicture",
			"change .option": "onChangeOption",
            "change .moreOption": "onChangeMoreOption",
			"change #frontage_applicable" : "toggleFrontage",
			"change .hotspot_decision" : "toggleHotspot",
			"click .product_done": "done",
            "click .bays_done": "baysdone",
			"click .back": "back",
			"keyup .total_sos, .total_sku, .field_value": "onKeyUp",
			"keydown .field_value": "onkeyDown",
            "click .scan_qr": "scanQR",

            "click .add_item": "addPhoto",
            "click .add_item1": "addPhoto1",
            "click .remove_item": "removePhoto",
            "click .remove_item1": "removePhoto1",
		},
        showBays:function(mId, pId, product, hotspotPid)
        {
            
            var that = this;
			var fetchCategory = true;

		    this.getStoreName(mId);

			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];

            var productName = product.product_name;
            var priority = product.priority;
            var categoryType = product.category_type;
            var baysValue=that.$el.find(".question1 .field_intent .field_value").val();

            // Hotspot frontage not needed for mini-market

            /*var pName = productName.toLowerCase().trim();

            var brandName = pName.replace(/\s/g, '');*/
            var brandName = "";
            var hotspotExecution = false;
            if(brandName == "hotspotexecution"){
            	hotspotExecution = true;
            }

            var isFrontage = false;
            if(product.is_frontage == "true" || product.priority == 6){
            	isFrontage = true;
            }

            var previousQRcode = "";


            var brandwiseNorm = that.model.get("brandwiseNorm");

            var categoryId = that.model.get("categoryId");
            var brandId = that.model.get("brandId");
            var isSGF = that.model.get("isSGF");

            var fn = function(results) {
            var model = new computeNorm.Model({
                "mId": mId,
                "pId": pId,
                "product": product,
                "categoryId": categoryId,
                "brandId": brandId,
                "brandwiseNorm": brandwiseNorm,
                "channelId": channelId,
                "isFrontage": isFrontage,
                "hotspotExecution": hotspotExecution,
                "productName": productName,
                "categoryType": categoryType,
                "storeId": storeId,
                "previousQRcode": previousQRcode,
                "count":baysValue
            });

           
            var view = new computeNorm.View({model: model});
            
                view.showNorm(function(el){
                     that.$el.empty().append(el);  
                     if(!baysValue){ 
                    that.$el.find(".category-brand-norm").attr("hidden",true);
                    that.$el.find(".question2").attr("hidden",true);
                    //that.$el.find("#wrapper_norms").removeClass("question1"); 
                    that.$el.find(".product_done").css('display','none');
                     that.refreshScroll("wrapper_norms");
                     that.bindResizeEvent();
                     var scrollView = new iScroll("wrapper_norms");
                     scrollView.refresh();
                     }
                     else {
                     that.$el.find(".question1 .field_intent .field_value").val(baysValue);
                     that.$el.find(".question1 .field_intent .field_value").attr("disabled",true);
                     that.$el.find(".bays_done").attr("disabled",true);
                     //that.$el.find(".product_done").attr("hidden",false);
                     that.$el.find(".product_done").show();
                     var scrollView = new iScroll("wrapper_norms");
                     scrollView.refresh();
                     }
     
                 });
                 
            
            
         }
         selectProductsToVerify(db, auditId, storeId, pId, fn, categoryId);

           // that.$el.find(".category-brand-norm").after(el);
            //that.bindResizeEvent();
          //  that.refreshScroll("wrapper_norms");

        },

		showNorms: function(mId, pId, product, hotspotPid){
			var that = this;
			var fetchCategory = true;

		    this.getStoreName(mId);

			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];

            var productName = product.product_name;
            var priority = product.priority;
            var categoryType = product.category_type;

            // Hotspot frontage not needed for mini-market

            /*var pName = productName.toLowerCase().trim();

            var brandName = pName.replace(/\s/g, '');*/
            var brandName = "";
            var hotspotExecution = false;
            if(brandName == "hotspotexecution"){
            	hotspotExecution = true;
            }

            var isFrontage = false;
            if(product.is_frontage == "true" || product.priority == 6){
            	isFrontage = true;
            }

            var previousQRcode = "";


            var brandwiseNorm = that.model.get("brandwiseNorm");

            var categoryId = that.model.get("categoryId");
            var brandId = that.model.get("brandId");
            var isSGF = that.model.get("isSGF");
            if(isSGF) {
            	var model = new sgfNorms.Model({
            		"mId": mId,
            		"pId": pId,
            		"product": product,
            		"categoryId": categoryId,
            		"brandId": brandId
            	});
            	var view = new sgfNorms.View({model: model});

            	view.showSgfNorms(function(el, resetFrontage) {
            		that.$el.empty().append(el);
            		if(resetFrontage)  {
            		    that.$el.find("#frontage_applicable").trigger("change");
            		}
            		that.refreshScroll("wrapper_norms");	
					that.bindResizeEvent();
            	});

            }else {

				//Show completed norms(With user modified values)
				var fn = function(results) {
					if(results.length > 0) {
                         var model = new computeNorm.Model({
                            "mId": mId,
                            "pId": pId,
                            "product": product,
                            "categoryId": categoryId,
                            "brandId": brandId,
                            "brandwiseNorm": brandwiseNorm,
                            "results": results,
                            "channelId": channelId,
                            "isFrontage": isFrontage,
                            "hotspotExecution": hotspotExecution,
                            "productName": productName,
                            "categoryType": categoryType,
                            "storeId": storeId,
                            "qrCode": results[0].qrCode,
                            "previousQRcode": previousQRcode
                        });
                        var MPDnormId, normIdPos,MPDBrandId;
                        for(var i = 0; i <results.length; i++) {
                            if(results[i].multiple_photo == "true") {
                                MPDnormId = results[i].normId;
                                normIdPos = i;
                                MPDBrandId=results[i].productId;
                                
                                selectMPDAuditPhotos(db, MPDnormId, categoryId, storeId,MPDBrandId, normIdPos, function(pos, mpdPhotos) {

                                    if(mpdPhotos.length) {
                                         results[pos].auditImages = mpdPhotos;
                                    }

                                });
                            }

                            if((i+1) == results.length) {
                                var view = new computeNorm.View({model: model});
                                view.showCompletedNorms(function(el){
                                    that.$el.empty().append(el);
                                  //  that.$el.find("#frontage_applicable").trigger("change");
                                    var el = $(".gillette_table");
                                    if(el.length) {
                                       $(".gillette_table").removeClass("hide");
                                       $(".add_product_photo").removeClass("hide");
                                    }

                                    that.refreshScroll("wrapper_norms");
                                    that.bindResizeEvent();
                                    if(!brandwiseNorm) {
                                        var smartSpot = 1;
                                        view.showCompletedCategorySMbrands(function(el) {
                                            that.$el.find(".category-brand-norm").after(el);
                                            that.bindResizeEvent();

                                             var el = $(".gillette_table");
                                             if(el.length) {
                                                   $(".gillette_table").removeClass("hide");
                                                   $(".add_product_photo").removeClass("hide");
                                             }

                                             that.refreshScroll("wrapper_norms");

                                        }, smartSpot);
                                    }
                                });
                            }
                        }
                       

                    }else{

						var model = new computeNorm.Model({
							"mId": mId,
		            		"pId": pId,
		            		"product": product,
		            		"categoryId": categoryId,
		            		"brandId": brandId,
		            		"brandwiseNorm": brandwiseNorm,
		            		"channelId": channelId,
		            		"isFrontage": isFrontage,
		            		"hotspotExecution": hotspotExecution,
		            		"productName": productName,
		            		"categoryType": categoryType,
		            		"storeId": storeId,
		            		"previousQRcode": previousQRcode
						});

		            	var view = new computeNorm.View({model: model});
		            	view.showNorm(function(el){
		            		that.$el.empty().append(el);
		            		that.refreshScroll("wrapper_norms");	
							that.bindResizeEvent();
                            if(!brandwiseNorm) {
                                view.showCategorySmartSpotBrandNorms(function(el){
                                    that.$el.find(".category-brand-norm").after(el);
                                    that.refreshScroll("wrapper_norms");
                                    that.bindResizeEvent();

                                });
                            }

						});
					}
				}
				if(pId) {
					selectProductsToVerify(db, auditId, storeId, pId, fn, categoryId );
				}else {
					selectProductsToVerify(db, auditId, storeId, pId, fn, categoryId);
				}
            }
		},

		retakeProductPicture: function(event) {

            var parentsEl = $(event.currentTarget).parent();
            this.takePhoto(parentsEl);
		},

		takeProductPicture:function(event){

			var parentsEl = $(event.currentTarget).parent();
            this.takePhoto(parentsEl);
		},

		takePhoto: function(parentsEl) {
            var that = this;

            var mId = $(".product_done").attr("href");

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
                        that.refreshScroll("wrapper_norms");
                    }

                    var takeEl = "take_product_photo";
                    var retakeEl = "retake_product_photo";
                    if(lat.length != 0) {
						storeCode = storeCode + "Z" + "Lat: "+ lat + "Z" + "Lng: "+lng;
					}
                    inswit.takePicture(callback, takeEl, retakeEl, storeCode, parentsEl);
                });
            });
		},
        onChangeMoreOption:function(e){
            var that=this;
			var option = e.target.options[e.target.selectedIndex].text;

			var isCategory = ($(e.target).attr("rel") == "category")? true:false;
            console.log(e);

			if(isCategory) {
				return;
            }            
            
			if(option == "Yes" )
            {
                that.$el.find("."+e.target.nextElementSibling.className).attr("hidden",false);
                that.$el.find("#moreexclusion"+e.target.classList[1]).attr("hidden",false);
            }
            else if(option=="No")
            {
                that.$el.find("."+e.target.nextElementSibling.className).attr("hidden",true);
                that.$el.find("#moreexclusion"+e.target.classList[1]).attr("hidden",true);
            }
        },
		onChangeOption: function(e){
			var option = e.target.options[e.target.selectedIndex].text;

			var isCategory = ($(e.target).attr("rel") == "category")? true:false;
            console.log(option);

			if(isCategory) {
				return;
            }            
            
			if(option == "Yes" || option == "100"){
				$(e.target).parents(".question").find(".remarks_1").show();
				$(e.target).parents(".question").find(".remarks_2").hide();
				var sgfEl = this.$el.find(".sgf .question");
				if(sgfEl.length > 0) {
				    var selectEl = $(e.target).parents(".question");
                    selectEl.find(".remarks_1 select option:eq(1)").attr("selected", "true")
				}

				var multiplePhotoEL = $(e.target).parents(".question").find(".gillette_table");
				if(multiplePhotoEL.length == 1) {
				    multiplePhotoEL.removeClass("hide");
				    if(multiplePhotoEL.find(".add_product_photo").length == 0) {
				        var el = '<span class="add_product_photo">\
                                      <button class="btn-mini btn-success add_item">\
                                      +</button>\
                                   </span>';
				        multiplePhotoEL.append(el);
				    }else {
				        multiplePhotoEL.find(".add_product_photo").removeClass("hide");
				    }
				    this.$el.find(".gillette_table_row").removeClass("hide");
				}
			}else{
				$(e.target).parents(".question").find(".remarks_1").hide();
				$(e.target).parents(".question").find(".remarks_2").show();
				$(e.target).parents(".question").find("#frontage_applicable option:eq(2)").prop('selected', true);
                $(e.target).parents(".question").find(".remarks_2 option:eq(1)").attr("selected", "true");

				var multiplePhotoEL = $(e.target).parents(".question").find(".gillette_table");
                if(multiplePhotoEL.length == 1) {
                    var imageEl= $(e.target).parents(".question").find(".gillette_table img");

                    $(e.target).parents(".question").find(".gillette_table, .add_product_photo").addClass("hide");
                }
            }
            
            // if(option != "Yes"){
            //     var ids = $(e.target.parentElement).find(".field_type").attr("id");
            //     this.checkScoreValidation(ids, option);
            // }
		},

		toggleFrontage: function(event){
			var value = $(event.currentTarget).val().toLowerCase();
            var questions = $(event.target).parent().parent().find(".question");
			var questionLen = questions.length;
            var questionEl = $(event.target).parent().parent().find(".question")[questionLen -1];

            var isConsider = ($(event.target).parents(".question").attr("rel") == "true")? true: false;

			var elements = this.$el.find(".smartspotbrand .question");

			var sgfEl = this.$el.find(".sgf .question");

			if(value == "yes"){
			    var selectEl = sgfEl.find(".question");
                sgfEl.find(".remarks_1").show();
                sgfEl.find(".remarks_2").hide();

                 var selectEl = $(event.target).parents(".question");
                 selectEl.find(".remarks_1 select option:eq(1)").attr("selected", "true")

                for(var i = 1; i < sgfEl.length; i++){
                    var normEl = $(sgfEl[i]);
                    var val = normEl.find(".option").val();

                    if(!val || val == "" || val == undefined){
                        normEl.find(".option").prop("selectedIndex", 0);
                    }else {
                        normEl.find(".option").prop("selectedIndex", 0);
                        normEl.find(".remarks_1 option:eq(0)").attr("selected", "true");
                    }
                    $(normEl).show();
                }


                $(".normal, .take_product_photo, .photo_block, .brands").show();


                // isconsider: true, set the last norm to yes or no based on last beform three norms.
				if(isConsider) {
//				    var count = 0;
//                    var elCount = questions.length;
//                    for(var i = 0; i < elCount; i++){
//                        var normEl = $(questions[i]);
//                        var optionName = normEl.find(".option option:selected").text();
//                        console.log(optionName);
//                        var considerLen = $(".question[rel=true]").length
//                        if(optionName == "Yes" || optionName == "select") {
//                            count++;
//                        }
//                        if(i == elCount-2) {
//                             if(count >= considerLen) {
//                                 $(questionEl).find(".remarks_1").show();
//                                 $(questionEl).find(".remarks_2").hide();
//                                 $(questionEl).find(".option option:selected").removeAttr("selected");
//                                 $(questionEl).find("#frontage_applicable option:eq(1)").prop('selected', true);
//                                 $(questionEl).find(".remarks_1 option:eq(1)").attr("selected", "true");
//                                 $(questionEl).next().attr("rel", true);
//
//                            }else {
//                                $(questionEl).find(".remarks_1").hide();
//                                $(questionEl).find(".remarks_2").show();
//                                $(questionEl).find(".option option:selected").removeAttr("selected");
//                                $(questionEl).find("#frontage_applicable option:eq(2)").prop('selected', true);
//                                $(questionEl).find(".remarks_2 option:eq(1)").attr("selected", "true");
//                                $(questionEl).next().attr("rel", false);
//                            }
//                            console.log(optionName);
//                        }
//
//                    }
                    var count = 0;
                    var considerLen = 0;
                    var elCount = questions.length;
                    questions.each(function(i){
                      if($(this).attr("rel") == "true"){
                    	 considerLen++;
                      }
                    })
//                    var considerLen = $(".question[rel=true]").length
                    for(var i = 0; i < elCount; i++){
                         var normEl = $(questions[i]);
                         var relFlag = normEl.attr("rel");
                         var optionName = normEl.find(".option option:selected").text();
                         if(optionName == "Yes" && relFlag == "true" || optionName == "select" && relFlag == "true" ) {
                             count++;
                         }
                    }

                    if(count >= considerLen-1) {
                         $(questionEl).find(".remarks_1").show();
                         $(questionEl).find(".remarks_2").hide();
                         $(questionEl).find(".option option:selected").removeAttr("selected");
                         $(questionEl).find("#frontage_applicable option:eq(1)").prop('selected', true);
                         $(questionEl).find(".remarks_1 option:eq(1)").attr("selected", "true");
                         $(questionEl).next().attr("rel", true);
                    }else {
                          $(questionEl).find(".remarks_1").hide();
                          $(questionEl).find(".remarks_2").show();
                          $(questionEl).find(".option option:selected").removeAttr("selected");
                          $(questionEl).find("#frontage_applicable option:eq(2)").prop('selected', true);
                          $(questionEl).find(".remarks_2 option:eq(1)").attr("selected", "true");
                          $(questionEl).next().attr("rel", false);
                    }

                }else {
                    var smartSpotTxt = $(questions[0]).find(".product_name").attr("rel");
                    if(smartSpotTxt == "Device Available"){
                        if($(questions[0]).find("#frontage_applicable").val() == "Yes") {
                            $(".take_product_photo").attr("rel", true);
                        }else {
                             $(".take_product_photo").attr("rel", false);
                        }
                    }
                }

                 /*if(sgfEl.length > 1) {
                      var selectEl = $(event.target).parents(".question");
                        selectEl.find(".sgf .remarks_1").show();
                        selectEl.find(".sgf .remarks_2").hide();

                       for(var i = 1; i < elements.length; i++){
                            var normEl = $(sgfEl[i]);
                            var val = normEl.find(".option").val();

                            if(!val || val == "" || val == undefined){
                                normEl.find(".option").prop("selectedIndex", 1);
                            }
                            $(normEl).show();
                        }


                        $(".normal, .take_product_photo, .photo_block, .brands").show();

                 }*/

			}else{

			    if(sgfEl.length > 1) {
//			        $(".remarks_1").hide();
//                    $(".remarks_2").show();
//                    var normEl = $(sgfEl[0]);
//                    normEl.find(".option").prop("selectedIndex", 2);
//                    normEl.find(".audit_no").prop("selectedIndex", 1);
//                    for(var i = 1; i < sgfEl.length; i++){
//                        var normEl = $(sgfEl[i]);
//                        normEl.find(".option").prop("selectedIndex", 2);
//                        normEl.find(".audit_no").prop("selectedIndex", 1);
//
//                        if(normEl.find(".audit_no").val() !== "50"){
//                            normEl.find(".audit_no").prop("selectedIndex", 1);
//                        }
//                        $(normEl).hide();
//
//                    }
//                    $(".photo_block img").attr("src", "");
//                    $(".normal, .take_product_photo, .photo_block").hide();
			    }

//			     var selectEl = $(event.target).parents(".question");
//                 selectEl.find(".remarks_2 select option:eq(1)").attr("selected", "true");



                // isconsider: true, set the last norm to yes or no based on last beform three norms.
                if(isConsider) {

                    if(value == "Yes" || value == "100"){
                        $(questionEl).find(".remarks_1").show();
                        $(questionEl).find(".remarks_2").hide();
                         $(questionEl).find(".option option:selected").removeAttr("selected");
                         $(questionEl).next().attr("rel", true);
                    }else{
                        $(questionEl).find(".remarks_1").hide();
                        $(questionEl).find(".remarks_2").show();
                        $(questionEl).find(".option option:selected").removeAttr("selected");
                        $(questionEl).next().attr("rel", false);
                        // var ids = $(questionEl).find(".field_type").attr("id");
                        // this.checkScoreValidation(ids, value);    
                    }
                    $(questionEl).find("#frontage_applicable option:eq(2)").prop('selected', true);
                    $(questionEl).find(".remarks_2 option:eq(1)").attr("selected", "true");

                }else {
                 var smartSpotTxt = $(questions[0]).find(".product_name").attr("rel");
                     if(smartSpotTxt == "Device Available"){
                         if($(questions[0]).find("#frontage_applicable").val() == "No") {
                             $(".take_product_photo").attr("rel", false);
                         }
                     }
                 }


			}
			this.refreshScroll("wrapper_norms");
		},

		toggleHotspot: function(event, value, isHotSpotBrand){
			if(event){
				value = $(event.currentTarget).val().toLowerCase();
			}
			
			var elements = this.$el.find(".question");
			elements.show();
			if(value == "select"){
				$(".remarks_2").hide();
				$(".remarks_1").show();

				$(".option").prop("selectedIndex", 0).prop("disabled", false);
				$(".audit_yes").prop("selectedIndex", 0).prop("disabled", false);

				$(".take_product_photo, .photo_block").show();

			}else if(value == "yes"){
				$(".remarks_2").hide();
				$(".remarks_1").show();

				$(".option").prop("selectedIndex", 0).prop("disabled", false);
				$(".audit_yes").prop("selectedIndex", 0).prop("disabled", false);

				$(".audit_no").prop("disabled", false);

				var normEl = $(elements[0]);
				normEl.find(".option").prop("selectedIndex", 1);

				$(".take_product_photo, .photo_block").show();

			}else{
				$(".remarks_1").hide();
				$(".remarks_2").show();

				var index = 0;
				if(!isHotSpotBrand){
					index = 1;

					var normEl = $(elements[0]);
					normEl.find(".audit_no").prop("selectedIndex", 1);
				}else{
					$(".product_done").hide();
				}
				
				for(var i = index; i < elements.length; i++){
					normEl = $(elements[i]);
					normEl.find(".option").prop("selectedIndex", 2).trigger("change").prop("disabled", true);
					normEl.find(".audit_no").val("44").prop("disabled", true);

					if(!isHotSpotBrand && i > 0){
						$(elements[i]).hide();
					}
				}

				$(".take_product_photo, .photo_block").hide();
			}

			this.refreshScroll("wrapper_norms");
		},

		done: function(event){

           if(this.$el.find(".product_done").hasClass("clicked")){
           				//inswit.errorLog({"Clicked": that.$el.find(".upload_audit").hasClass("clicked")});
                return;
           }

            this.$el.find(".product_done").addClass("clicked");

			submitAudit.auditDone(this, event);
		},
        baysdone: function(event){
            var that=this;

            if(this.$el.find(".bays_done").hasClass("clicked")){
                            //inswit.errorLog({"Clicked": that.$el.find(".upload_audit").hasClass("clicked")});
                 return;
            }
 
             this.$el.find(".bays_done").addClass("clicked");
 
             this.$el.find(".category-brand-norm").attr("hidden",false);
             //mId, pId, product, hotspotPid,count=6
             var mId=that.model.get("mId");
             var product=that.model.get("product");
             var hotspotPid=that.model.get("hotspotPid");
             var count=6;
             that.showBays(mId, undefined, product, hotspotPid);
             
             //that.bindResizeEvent();
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

		unbindResizeEvent: function() {
        	$(window).unbind('resize.normKeyboard');
        },

        remove: function() {
        	this.unbindResizeEvent();
        },

        onKeyUp: function(evt) {
        	var that = this;

        	var elements = that.$el.find(".question");
        	var totalSku = 0, totalSos = 0, sosPercent = 0, skuPercent = 0;
        	totalSos = parseFloat(elements.find("input.total_sos").val()) || 0;
        	totalSku = parseFloat(elements.find("input.total_sku").val()) || 0;

        	totalSos = Math.round( totalSos * 1e2 ) / 1e2;
            totalSku = Math.round( totalSku * 1e2 ) / 1e2;

			var resultSos = 0, resultSku = 0;
			for(var i = 0; i < elements.length; i++) {
				var normEl = $(elements[i]);

		        var sosValue = parseFloat(normEl.find("input.sos").val() || 0);
		        var skuValue = parseFloat(normEl.find("input.sku").val() || 0);

		        sosValue = Math.round( sosValue * 1e2 ) / 1e2;
		        skuValue = Math.round( skuValue * 1e2 ) / 1e2;

		        sosPercent = ((sosValue/totalSos) * 100).toFixed(0) || 0;
		        skuPercent  = ((skuValue/totalSku) * 100).toFixed(0) || 0;


		        normEl.find("input.sos").attr('rel', sosPercent);
		        normEl.find("input.sku").attr('rel', skuPercent);
		        
		        if(!isNaN(sosValue)) {
		        	resultSos = resultSos+sosValue;
		        }

		        if(!isNaN(skuValue)) {
		        	resultSku = resultSku+skuValue;
		        }
		       
			}
			var otherSos = totalSos-resultSos;
			var otherSku = totalSku-resultSku;

			 otherSos = Math.round( otherSos * 1e2 ) / 1e2;
             otherSku = Math.round( otherSku * 1e2 ) / 1e2;
			if(!isNaN(otherSos))
				elements.find("input.other_sos").val(otherSos);
			if(!isNaN(otherSku))
				elements.find("input.other_sku").val(otherSku);
        },

        onkeyDown: function(evt) {
		    if (evt.keyCode == 9) {
		    	evt.preventDefault();
		    }
        },

       scanQR: function(e) {
		     var that = this;
		     e.stopPropagation();
		     e.preventDefault();
		     var target = e.currentTarget;
		     var previousQRcode = $(target).parent().find(".qrcode_text").attr("id") || "";
		     var qrTxtEl = $(target).parent().find(".qrcode_text");
		     qrTxtEl.val("");
		     cordova.plugins.barcodeScanner.scan(
                   function (result) {
                          var qrCode = result.text;
                          if(previousQRcode && qrCode != previousQRcode) {
                                alert("QR code in the masters and asset are different");
                          }
                          qrTxtEl.val(result.text);

                   },
                   function (error) {
                       alert("Scanning failed: " + error);
                   }
             );
       },


        addPhoto: function(event) {
           event.preventDefault();
           event.stopPropagation();
           var that = this;

           if(this.$el.find(".add_item").hasClass("clicked")){
                      				//inswit.errorLog({"Clicked": that.$el.find(".upload_audit").hasClass("clicked")});
               return;
           }

           this.$el.find(".add_item").addClass("clicked");
           var addItemEl = $(event.target);
           that.questionEl = addItemEl.parents(".question");
           var count = parseInt(that.questionEl.find(".audit_yes :selected").html()) || 0;

           var tableRowElLen = that.questionEl.find(".gillette_table_row").length;
           if(count <= tableRowElLen) {
               inswit.alert("Given MPD count and number of photos should to be same");
               that.$el.find(".add_item").removeClass("clicked");
               return;
           }else {
               require(['templates/t_audits'], function(template){
                   var html = Mustache.to_html(template.photoBlock);
                   var tableBodyEl = that.questionEl.find(".gillette_table_body").append(html);
                   that.scrollView.refresh();
                   that.$el.find(".add_item").removeClass("clicked");
               });
           }

       },
       
       addPhoto1: function(event) {
        event.preventDefault();
        event.stopPropagation();
        var that = this;

        if(this.$el.find(".add_item1").hasClass("clicked")){
                                   //inswit.errorLog({"Clicked": that.$el.find(".upload_audit").hasClass("clicked")});
            return;
        }

        this.$el.find(".add_item1").addClass("clicked");
        var addItemEl = $(event.target);
        that.questionEl = addItemEl.parents(".category-brand-norm");
        var count = 10 || 0;

        var tableRowElLen = that.questionEl.find(".gillette_table_row").length;
        if(count <= tableRowElLen) {
            inswit.alert("You have reached maximum limit of Category Photos");
            that.$el.find(".add_item1").removeClass("clicked");
            return;
        }else {
            require(['templates/t_audits'], function(template){
                var html = Mustache.to_html(template.catPhotoBlock);
                var tableBodyEl = that.questionEl.find(".gillette_table_body").append(html);
                that.scrollView.refresh();
                that.$el.find(".add_item1").removeClass("clicked");
                
            });
        }

    },

       removePhoto: function(event) {
           var target =  $(event.target).parents().parents().parents().get(0);
           target.remove();
       },
       removePhoto1: function(event) {
        var addItemEl = $(event.target);
        var that = this;

        that.questionEl = addItemEl.parents(".category-brand-norm");
        var tableRowElLen = that.questionEl.find(".gillette_table_row").length;
        if(tableRowElLen>1)
        {
        var target =  $(event.target).parents().parents().parents().get(0);
        target.remove();
        }
        else {
            inswit.alert("At least one category photo is must!");
        }
    },

       checkScoreValidationAPI: function(data) {
            inswit.showLoaderEl("Checking please wait....");

            var processVariables = {
                "projectId":inswit.SCORE_VALIDATION.projectId,
                "workflowId":inswit.SCORE_VALIDATION.workflowId,
                "processId":inswit.SCORE_VALIDATION.processId,
                "ProcessVariables":{
                    "auditid": data.auditid,
                    "storeid": data.storeid,
                    "brandid": data.brandid,
                    "normid": data.normid,
                    "categoryId": data.categoryId
                }
            };

            inswit.executeProcess(processVariables, {
                success: function(response){
                    if(response.Error == "0"){
                        console.log("response",response);
                        var message = response.ProcessVariables.message;
                        if(message.type == "0") {
                            alert(message.value)
                        }
                    }
                    inswit.hideLoaderEl();
                },
                failure: function(error){
                    inswit.hideLoaderEl();
                    switch(error){
                        case 0:{
                            inswit.alert("No Internet Connection!");
                            break;
                        }
                        case 1:{
                            inswit.alert("Check your network settings!");
                            break;
                        }
                        case 2:{
                            inswit.alert("Server Busy.Try Again!");
                            break;
                        }
                    }
                }
            });
        },

        checkScoreValidation: function(ids, option) {
            var mId = $(".product_done").attr("href");

		    var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];
            var categoryId = this.model.get("categoryId");

            var normId = ids.split("-")[0];
            var brandId = ids.split("-")[1];
            var empId = LocalStorage.getEmployeeId();

            if(categoryId == "30"){
                brandId = $('.sgf .brand_select').find(":selected").attr("id");
            }
           
            let data = {
                "auditid": auditId,
                "storeid": storeId,
                "brandid": brandId,
                "normid": normId,
                "categoryId": categoryId,
                "empId": empId
            }

            console.log("Data", data);

            if(option != "Yes"){
                if(data.brandid){
                    this.checkScoreValidationAPI(data);
                }
            }

        }

	});

	return Norm;
});