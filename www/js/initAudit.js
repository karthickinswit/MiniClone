define([
	"backbone",
	"mustache",
	"select2"
], function(Backbone, Mustache) {
	var InitAudit = {};

	var NON_COOPERATION = 3;
	InitAudit.Model = Backbone.Model.extend({

		initialize: function() {}                             
	});

	InitAudit.View = Backbone.View.extend({

		className: "audits",

		events:{
			"click .continue_audit": "continueAudit",
			"click .finish_audit" : "finishAudit",
			"click .take_store_photo": "takeStorePicture",
			"click .take_selfie_photo": "takeSelfiePicture",
			"click .retake_store_photo": "takeStorePicture",
			"click .retake_selfie_photo": "takeSelfiePicture",
			"change .aud_confirmation" : "toggleConfirmationBlock",
			"change .audit_status": "onAuditStatus",
			"click .back": "back"
		},

		startAudit: function(mId){
			var that = this;

			var pos = this.model.get("pos");
			console.log("position"+pos.lat);


			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            //var channelId = id[2];

            that.getStoreName(mId);

            var ele = that.$el;
            selectCompletedAudit(db, mId, function(audit){
            	require(['templates/t_audit_confirmation'], function(template){
            		selectStoreStatus(db, function(response){

            			var yesStoreOptions = [],
            				noStoreOptions = [],
            				storeStatus = [],
            				len = response.length;

            			for(var i = 0; i < len; i++) {
            			    var obj = response.item(i);
            			    storeStatus.push(obj);
            			    if(obj.status_name !== "audited") {
            			        noStoreOptions.push(obj);
            			    }else {
            			    	yesStoreOptions.push(obj);
            			    }
            			}
            			LocalStorage.setAuditStatus(storeStatus);

            			var auditerName,auditerNumber;
            			if(audit.length > 0 && audit[0].auditer_name && audit[0].auditer_number) {
            				auditerName = audit[0].auditer_name;
            				auditerNumber = audit[0].auditer_number;
            			}

	            		var html = Mustache.to_html(template, {
	            			"mId":mId,
	            			"name":that.storeName,
	            			"yesStoreOptions": yesStoreOptions,
	            			"noStoreOptions" : noStoreOptions,
	            			"auditerName": auditerName || "",
	            			"auditerNumber": auditerNumber || ""
	            		});
						ele.append(html);

						if(audit.length > 0){
							audit = audit.item(0);
		            		var imageURI = audit.store_image;

		            		if(imageURI){
		            			var imgTemplate = "<img src='{{imageURI}}' width='100%' height='200'><a class='retake_store_photo retake_photo'>Retake</a>";
								var html = Mustache.to_html(imgTemplate, {"imageURI":imageURI});

								ele.find(".take_store_photo").remove();
								ele.find(".photo_block").empty().append(html);
		            		}
		                }

		                that.refreshScroll("continue_audit_wrapper");
            		});
				});
            });
		},

		continueAudit: function(event){
			var that = this;
			var name = this.$el.find(".audit_name").val() || "";
			var phoneNumber = this.$el.find(".audit_number").val() || "";

			var nonCoName = this.$el.find(".audit_co_name").val() || "";
            var nonCoDesignation = this.$el.find(".audit_co_desg").val() || "";

            var auditStatus;
            // check audit status to non-co-operation

            var optionName = that.$el.find(".audit_no option:selected").text();

            var storeStatusArr = LocalStorage.getAuditStatus();

            for(var i = 0; i < storeStatusArr.length; i++){
                var status = storeStatusArr[i];

                if(status.status_name == optionName){
                    auditStatus = status.status_id.toString();
                }
            }

            if(auditStatus == NON_COOPERATION) {
                if(!nonCoName) {
                    alert("Please enter non-cooperator name");
                    return;
                }else if(!nonCoDesignation) {
                    alert("Please enter non-cooperator designation");
                    return;
                }
            }


            //***End**//

			/*if(!name) {
				alert("Please enter spoc name");
				return;
			}else if(!phoneNumber) {
				alert("Please enter spoc phone number");
				return;
			}
			var nameLen = name.length;
			var phoneLen = phoneNumber.length;

			if(nameLen > 1 && nameLen > 100 ) {
				alert("Please enter spoc name between 1-100 characters");
				return;
			}
			if(phoneLen > 1 && phoneLen > 15) {
				alert("Please enter spoc phone between 1-15 characters");
				return;
			}*/

		
			var mId = $(event.currentTarget).attr("href");
			var id = mId.split("-");
			var auditId = id[0];
			var storeId = id[1];
			var channelId = id[2];
			var position = this.model.get("pos");


			// var gpsDetect = cordova.require('cordova/plugin/gpsDetectionPlugin');
	        // gpsDetect.checkGPS(function onGPSSuccess(on) {
				//Check: GPS is enabled or not
				var on= true;
	            if(!on){
	            	//GPS is OFF
	            	inswit.confirm("GPS/Location is switched off. Please enable the same to continue audit. \n * Enable GPS with HIGH ACCURACY \n\n Do you want to enable GPS?", function onConfirm(buttonIndex) {
				        if(buttonIndex == 1) {
				            gpsDetect.switchToLocationSettings(function onSwitchToLocationSettingsSuccess() {

	        				}, function onSwitchToLocationSettingsError(e) {
					            //inswit.alert("Error to switch GPS location: " + e);
					        });
				        }
				    }, "confirm", ["YES", "NO"]);
	            }else{
	            	setTimeout(function(){
						
			            var dist = getDistributor(db, auditId, storeId, function(distributor){

			            	var image = $(".store_photo").find(".photo_block img").attr("src");
			            	if(distributor != inswit.DISTRIBUTOR){ //For certain distributor photo is not mandatory
								if(!image){
									inswit.alert("Please take a store photo!");
									$(event.currentTarget).removeClass("clicked");
									return;
								}
				            }

				            var selfieImage = $(".selfie_photo").find(".photo_block img").attr("src");

				            // if(!selfieImage){
				            //     inswit.alert("Please take a selfie photo!");
				            //     $(event.currentTarget).removeClass("clicked");
                            // 	return;
				            // }

			            	findStore(db, auditId, storeId, function(result){
				            	//Store basic audit details
				            	var auditStatus = that.$el.find(".audit_yes option:selected").val();

								if(!auditStatus){
									var optionName = that.$el.find(".audit_yes option:selected").text();

									var storeStatusArr = LocalStorage.getAuditStatus();

									for(var i = 0; i < storeStatusArr.length; i++){
										var status = storeStatusArr[i];

										if(status.status_name == optionName){
											auditStatus = status.status_id.toString();
										}
									}
								}

								var audit = {};
								audit.storeId = storeId;
								audit.auditId = auditId;
								audit.id = result.id;
								audit.isContinued = true;
								audit.isCompleted = false;
								audit.optionId = auditStatus;
								audit.signImage = "";
								audit.storeImage = image;
								audit.lat = position.lat;
								audit.lng = position.lng;
								audit.selfieImage = selfieImage;
								audit.storeImageId = "";
								audit.signImageId = "";
								audit.selfieImageId = "";
								audit.auditerName = name;
								audit.phoneNumber = phoneNumber;
								audit.nonCoName = nonCoName;
								audit.nonCoDesignation = nonCoDesignation;
								audit.accuracy = position.accuracy;

								

								/**
								 * Geolocation exists check done here because, 
								 * There could be a possibility of multiple time revisit this page. So
								 * No need to capture every time if Geolocation is already captured.
								 */
								selectCompletedAudit(db, mId, function(auditDetails){
									
										// audit.lat = auditDetails.item(0).lat;
										// audit.lng = auditDetails.item(0).lng;

										populateCompAuditTable(db, audit, function(){
						                    //that.startTimer(storeId);
								        	var route = "#audits/" + mId + "/mainProducts";
											router.navigate(route, {
								                trigger: true
								            });

										}, function(a, e){
											//Error callback of populateCompAuditTable function.
										});
								});
				            });
			            }, function(a, e){
			            	console.log(e);
			            });
					});
	            }
	        // }, function onGPSError(e) {
	        //     inswit.alert("Error : " + e);
	        // });
		},

		finishAudit: function(event){
			var that = this;

			var name = this.$el.find(".audit_name").val() || "";
			var phoneNumber = this.$el.find(".audit_number").val() || "";

            var nonCoName = this.$el.find(".audit_co_name").val() || "";
            var nonCoDesignation = this.$el.find(".audit_co_desg").val() || "";

			var position = this.model.get("pos");

			 var auditStatus;

            // check audit status to non-co-operation

            var optionName = that.$el.find(".audit_no option:selected").text();

            var storeStatusArr = LocalStorage.getAuditStatus();

            for(var i = 0; i < storeStatusArr.length; i++){
                var status = storeStatusArr[i];

                if(status.status_name == optionName){
                    auditStatus = status.status_id.toString();
                }
            }

            if(auditStatus == NON_COOPERATION) {
                if(!nonCoName) {
                    alert("Please enter non-cooperator name");
                    return;
                }else if(!nonCoDesignation) {
                    alert("Please enter non-cooperator designation");
                    return;
                }
            }


		/*	if(!name) {
				alert("Please enter your name");
				return;
			}else if(!phoneNumber) {
				alert("Please enter your phone number");
				return;
			}*/


			if($(event.currentTarget).hasClass("clicked")){
				return;
			}
			$(event.currentTarget).addClass("clicked");
			var mId = $(event.currentTarget).attr("href");
			
			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            //var channelId = id[2];

            that.auditId = auditId;
            that.storeId = storeId;

            getDistributor(db, auditId, storeId, function(distributor){

				var image = $(".photo_block img").attr("src");
	 			if(distributor != inswit.DISTRIBUTOR){//For certain distributor photo is not mandatory
					if(!image){
						inswit.alert("Please take a store photo!");
						$(event.currentTarget).removeClass("clicked");
						return;
					}
			    }

			     var selfieImage = $(".selfie_photo").find(".photo_block img").attr("src");

                // if(!selfieImage){
                //     inswit.alert("Please take a selfie photo!");
                //     $(event.currentTarget).removeClass("clicked");
                //     return;
                // }

				var callback = function(isYes){
					$(event.currentTarget).removeClass("clicked");
					if(isYes == 1){

						findStore(db, auditId, storeId, function(result){
							var auditStatus = that.$el.find(".audit_no option:selected").val();
							
							if(!auditStatus){
								var optionName = that.$el.find(".audit_no option:selected").text();

								var storeStatusArr = LocalStorage.getAuditStatus();

								for(var i = 0; i < storeStatusArr.length; i++){
									var status = storeStatusArr[i];

									if(status.status_name == optionName){
										auditStatus = status.status_id.toString();
									}
								}
							}
							
							var audit = {};
							audit.storeId = storeId;
							audit.auditId = auditId;
							audit.id = result.id;
							audit.isContinued = false;
							audit.isCompleted = true;
							audit.optionId = auditStatus;
							audit.storeImage = image || "";
							audit.selfieImage = selfieImage;
							audit.signImage = "";
							audit.lat = position.lat;
							audit.lng = position.lng;
							audit.storeImageId = "";
							audit.signImageId = "";
							audit.selfieImageId = "";
						    audit.auditerName = name;
                            audit.phoneNumber = phoneNumber;
                            audit.nonCoName = nonCoName;
                            audit.nonCoDesignation = nonCoDesignation;
							audit.accuracy = position.accuracy;


							//Completed products need to cleared for audit status changed from 'YES' to 'NO'.
							clearCompProducts(db, auditId, storeId, function(){

								/**
								 * Geolocation exists check done here because, 
								 * There could be a possibility of multiple time revisit this page. So
								 * No need to capture every time if Geolocation is already captured.
								 */
								selectCompletedAudit(db, mId, function(auditDetails){
									if(auditDetails && auditDetails.length > 0 && auditDetails.item(0).lat){
										audit.lat = auditDetails.item(0).lat;
										audit.lng = auditDetails.item(0).lng;

										populateCompAuditTable(db, audit, function(){
											router.navigate("/audits/"+ mId + "/upload", {
					                        	trigger: true
					                    	});

										}, function(a, e){
											// Error callback of populateCompAuditTable function
										});

									}else{
										populateCompAuditTable(db, audit, function(){
//											var getBack = function(){
//												$(".android").unmask();
												router.navigate("/audits/"+ mId + "/upload", {
							                        trigger: true
							                    });
//											}
										
										//	that.setGeoLocation(auditId, storeId);
//											$(".android").mask("Capturing Geolocation... Please wait...", 100);

										}, function(a, e){
											// Error callback of populateCompAuditTable function
										});
									}

								}, function(a, e){
									// Error callback of selectCompletedAudit table
								});
								
							})
						});
						inswit.exitTimer();
						LocalStorage.removeServerTime(mId);
					}
				}

					// var gpsDetect = cordova.require('cordova/plugin/gpsDetectionPlugin');
					// gpsDetect.checkGPS(function onGPSSuccess(on) {
					//Check: GPS is enabled or not
					var on= true;		        	
		        	//Check: GPS is enabled or not
		            if(!on){
		            	//GPS is OFF
		            
		            	$(event.currentTarget).removeClass("clicked");
		            	inswit.confirm("GPS/Location is switched off. Please enable the same to continue audit. \n\n Do you want to enable GPS?", function onConfirm(buttonIndex) {
					        if(buttonIndex == 1) {
					            gpsDetect.switchToLocationSettings(function onSwitchToLocationSettingsSuccess() {

		        				}, function onSwitchToLocationSettingsError(e) {
						            //alert("Error: " + e);
						        });
					        }
					    }, "confirm", ["YES", "NO"]);
		            }else{
		            	var title = "Alert";
						var optionName = $(".audit_no option:selected").text();
						var message = "Are you sure you want to complete this audit?\n\n" +
									  "This will update the audit status as '" + optionName + "', after which audit details cannot be modified.";
			            var buttons = ["Yes", "No"];

						inswit.confirm(message, callback, title, buttons);
		            }
		        }, function(){
            });
		},

		//Get latitude and longitude position of the device
		setGeoLocation: function(auditId, storeId, fn){
			
			var callback = function(pos){
				if(pos == ""){
				    pos = {
                        lat: "",
                        lng: ""
                    };
				}
				updateGeoLocation(db, auditId, storeId, pos);
				if(fn){
					fn();
				}
			};

			var options = {
		    	maximumAge:inswit.MAXIMUM_AGE,
		    	timeout:inswit.TIMEOUT,
		    	enableHighAccuracy:false
			};
			inswit.getLatLng(callback, options, false);
		},

		takeStorePicture:function(event){
			var that = this;

			var parentsEl = $(event.currentTarget).parent();

			var mId = $(".continue_audit").attr("href");

			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            //var channelId = id[2];
			var pos = this.model.get("pos");
			selectCompletedAudit(db, mId, function(data){
				var auditData = data[0];
				var lat = pos.lat;
				var lng = pos.lng;

				getStoreCode(db, storeId, function(storeCode){
					var callback = function(imageURI){
						that.refreshScroll("continue_audit_wrapper");
					}

					var takeEl = "take_store_photo";
					var retakeEl = "retake_store_photo";
					if(lat.length != 0) {
						storeCode = storeCode + "Z" + "Lat: "+ lat + "Z" + "Lng: "+lng;
					}
					inswit.takePicture(callback, takeEl, retakeEl, storeCode, parentsEl);
				});
			});
		},

		takeSelfiePicture:function(event){
            var that = this;

            var parentsEl = $(event.currentTarget).parent();

            var mId = $(".continue_audit").attr("href");

            var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
			//var channelId = id[2];
			
			var pos = this.model.get("pos");
			var lat = pos.lat;
			var lng = pos.lng;
            getStoreCode(db, storeId, function(storeCode){
                var callback = function(imageURI){
                    that.refreshScroll("continue_audit_wrapper");
                }

                var takeEl = "take_selfie_photo";
                var retakeEl = "retake_selfie_photo";
				if(lat.length != 0) {
					storeCode = storeCode + "Z" + "Lat: "+ lat + "Z" + "Lng: "+lng;
				}                
				inswit.takePicture(callback, takeEl, retakeEl, storeCode, parentsEl, true);
            });
        },



		takeSelfiePhoto: function(){
		    var that = this;

            var mId = $(".continue_audit").attr("href");

            var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            //var channelId = id[2];
			var pos = this.model.get("pos");
			var lat = pos.lat;
			var lng = pos.lng;

            getStoreCode(db, storeId, function(storeCode){
                var callback = function(imageURI){
                    that.refreshScroll("continue_audit_wrapper");
                }

                var takeEl = "take_selfie_photo";
                var retakeEl = "retake_selfie_photo";
				if(lat.length != 0) {
					storeCode = storeCode + "Z" + "Lat: "+ lat + "Z" + "Lng: "+lng;
				}
                inswit.takePicture(callback, takeEl, retakeEl, storeCode);
            });
		},

		onAuditStatus: function(event) {
		    var that = this;
		    console.log("onAuditStatus", $(event.target).val());
		    if($(event.target).val() == NON_COOPERATION){
                $(".non_co_auditer").css({"display":"block"});
                $(".audit_co_name").val("");
                $(".audit_co_desg").val("");
		    }else {
		        $(".non_co_auditer").css({"display":"none"});
                $(".audit_co_name").val("");
                $(".audit_co_desg").val("");
		    }

		    that.refreshScroll("continue_audit_wrapper");
		},

		toggleConfirmationBlock: function(event) {
			if($(event.target).val() == 1){
			    this.$el.find(".continue_audit").css({"display":"block"});
			    this.$el.find(".audit_no_block, .finish_audit").css({"display":"none"});
			    $(".non_co_auditer").css({"display":"none"});
			    $(".audit_no").prop("selectedIndex", 0);
			}else{
				this.$el.find(".continue_audit").css({"display":"none"});
			    this.$el.find(".audit_no_block, .finish_audit").css({"display":"block"});
			    $(".non_co_auditer").css({"display":"none"});
			}
			this.refreshScroll("continue_audit_wrapper");
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


        startTimer: function(storeId) {
            if(inswit.TIMER) {
                return;
            }else  {
                var ele = $(".timer_container").show();
                var el = "timer";
                var minutes = LocalStorage.getAuditTimeLimit();
                var seconds = 0;
                inswit.setTimer(el, minutes, seconds, storeId);
            }
        }
	});

	return InitAudit;
});