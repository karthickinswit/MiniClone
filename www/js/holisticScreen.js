define([
	"backbone",
	"mustache",
	'templates/t_holistic_screen'
], function(Backbone, Mustache, template) {


	var HolisticScreen = {};

	HolisticScreen.Model = Backbone.Model.extend({

		initialize: function() {}
	});

	HolisticScreen.View = Backbone.View.extend({

	    className: "audits",

	    events:{
            "click .go_next": "showSignaturePage",
            "click .back": "back",
            "click .take_signature_photo": "takeSignaturePicture",
            "click .retake_signature_photo": "takeSignaturePicture",

	    },

	    render: function() {

	        var that = this;

	        var mId = this.model.get("mId");

	        this.getStoreName(mId);

            this.computeLogic(mId, function(arrResult) {

                that.model.set("audits", arrResult);
                that.model.set("storeName", that.storeName);

                var html = Mustache.to_html(template,that.model.toJSON());
                that.$el.html(html);

                that.$el.find(".center_content").text(that.storeName);

                that.refreshScroll("wrapper_products");

            });

	    },

        getStoreName: function(mId){
            var that = this;

            fetchStoreName(db, mId, function(result){
                that.storeName = result.storeName;
                that.model.set("storeName", that.storeName);
            });
        },

        computeLogic: function(mId, callback) {
            var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];

            var arrayJson = [];

            selectBrandToDisplay(db, function(brandId) {
                console.log(brandId);
                var brandIds = brandId;

                selectComputeLogic(db, storeId, function (response) {

                    console.log(response);

                    var prodId = -1;

                    var prodJson = {};



                    for(var i = 0; i < response.length; i++) {

                         var prodId = response[i].product_id;
                         var prodName = response[i].product_name;


                         if(!prodJson[prodName]) {
                            console.log(prodName);
                            console.log(prodJson);
                            prodJson[prodName] = {}
                         }

                         var aJson = prodJson[prodName];

                         aJson[prodName] = prodId;

                         for(var j = 0; j < response.length; j++) {

                            if(prodId == response[j].product_id) {


                                aJson["brandId"] =  response[j].product_id;
                                aJson["categoryId"] =  response[j].category_id;
                                aJson["productName"] = response[j].product_name;
                                if(response[j].norm_id == "126") {
                                    aJson["sos_percnt"] = response[j].percentage;
                                }else if(response[j].norm_id == "127"){
                                     aJson["sku_percnt"] = response[j].percentage;
                                }else if(response[j].option_id == "7") {
                                    aJson["smartspot"] = "Not available";
                                }else if(response[j].option_id == "6") {
                                     aJson["smartspot"] = "Available";
                                }

                               // arrayJson[i] = aJson;
                            }
                         }
                    }

                    var i = 0
                    for(var key in prodJson) {
                        arrayJson[i] = prodJson[key];
                        i++;
                    }


                    for(var l = 0; l < arrayJson.length; l++) {

                       var productId = arrayJson[l].brandId;
                        var fBool = false;

                        for(var j = 0; j < brandIds.length; j++) {

                            var prodId = brandIds[j].product_id;

                            if(productId == prodId) {
                                arrayJson[l].smId =  brandIds[j].category_id;
                                fBool = true;
                                break;
                            }

                        }
                        if(!fBool) {
                            arrayJson[l].smId =  arrayJson[l].categoryId;
                        }
                    }



                    for(var i = 0; i < arrayJson.length; i++) {
                        var flagSku = arrayJson[i].sku_percnt;
                        if(!flagSku) {
                            var smId = arrayJson[i].smId;
                            for(var j = 0; j <  arrayJson.length; j++) {
                                if(i != j) {
                                    var jSmid = arrayJson[j].smId;
                                    var jFlagSku = arrayJson[j].sku_percnt;
                                    if(jSmid == smId && jFlagSku) {
                                          arrayJson[i].sku_percnt = arrayJson[j].sku_percnt;
                                          arrayJson[i].sos_percnt = arrayJson[j].sos_percnt;
                                          break;
                                    }
                                }
                            }
                        }
                    }


//                    for(var i = 0; i< arrayJson.length; i++ ) {
//                        var isSmartSpotAvailable = arrayJson[i].smartspot;
//                        if(!isSmartSpotAvailable) {
//                            if (i > -1) {
//                              arrayJson.splice(i, 1);
//                            }
//                        }
//                    }

                    var newArrJson = [];

                    var index = 0;
                    for(var i = 0; i< arrayJson.length; i++ ) {
                        var isSmartSpotAvailable = arrayJson[i].smartspot;
                        if(isSmartSpotAvailable) {
                            newArrJson[index] = arrayJson[i];
                            index ++;
                        }
                    }


                    callback(newArrJson);



                });
            });

        },

        showSignaturePage: function() {
            var that = this;
            var mId = this.model.get("mId");
            var route = "#signature/" + mId;
            router.navigate(route, {
                trigger: true
            });
            return;
        },

        refreshScroll: function(wrapperEle) {
            if(!this.scrollView) {
                this.scrollView = new iScroll(wrapperEle);
            }
            this.scrollView.refresh();
        },

        back: function(){
            window.history.back();
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
        }



	});

	return HolisticScreen;

});
