define([
	"backbone",
	"mustache",
	'templates/t_holistic_screen'
], function(Backbone, Mustache, template) {

    var Signature = {};

    Signature.Model = Backbone.Model.extend({

        initialize: function() {}
    });

    Signature.View = Backbone.View.extend({

          className: "audits",

          events:{
                "click .go_next": "showSignaturePage",
                "click .back": "back",
                "click .take_signature_photo": "takeSignaturePicture",
                "click .retake_signature_photo": "takeSignaturePicture",
                "click .complete_audit": "completeAudit",


          },

        render: function() {

           var that = this;

           var mId = this.model.get("mId");

           this.getStoreName(mId);

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

        getStoreName: function(mId){
            var that = this;

            fetchStoreName(db, mId, function(result){
                that.storeName = result.storeName;
                that.model.set("storeName", that.storeName);
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

        refreshScroll: function(wrapperEle) {
            if(!this.scrollView) {
                this.scrollView = new iScroll(wrapperEle);
            }
            this.scrollView.refresh();
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
	 				var image = $(".take_signature_photo img").attr("src");
	 				if(image.startsWith("images/matrix_icons/take_photo_48.png")) {
	 				     inswit.alert("Please take a sign off photo!");
                         $(event.currentTarget).removeClass("clicked");
                         return;
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
		}



    });

    return Signature;
});