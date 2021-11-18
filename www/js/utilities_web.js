var inswit = {};

//var PROJECTID = "a8fe973aff5c11e79d0d0050569cb68c"; //production
var PROJECTID = "3d916a1c-60fb-4e86-8222-5f4d7c66951f"; //process

window.device = {
	platform: "android",
	version: 6.0
};

inswit = {

	URI: "https://www.appiyo.com/",
	
	DB: "mxpg",
	
	TEST_ACCOUNT: {
		email: "",
		password: "",
	},

	VERSION : "1.1",

LOGIN_CREDENTIAL: {
		"email": "minimarket@matrixbsindia.com",
		"password": "admin@matrix123"
	},

	LOGIN_PROCESS: {
		"projectId":PROJECTID,
		"workflowId":"f474e9a6382c40a6bc4232e50d1bb167",
		"processId":"037852e078ca4ae5aecf6b2d760c36ee"
	},

	UPLOAD_PROCESS: {
		"projectId":PROJECTID,
		"workflowId":"9a450cb9b7f6416abfc2c4f706e31403",
		"processId":"e01e657a91824027802d4feac1168617"
	},

	FORGOT_PROCESS: {
		"projectId":PROJECTID,
		"workflowId":"ce83479cad6a4a6f951c66a1990ca3f2",
		"processId":"bbbb9a09f36941538e84dbe76da86549"
	},

	RESET_PROCESS: {
		"projectId":PROJECTID,
		"workflowId":"ce83479cad6a4a6f951c66a1990ca3f2",
		"processId":"417ec4429beb475fb71090084f319632"
	},

	GET_DETAILED_AUDIT_PROCESS: {
		"projectId":PROJECTID,
		"workflowId":"47e6ab168f6711e5a9bb0050569ccb08",
		"processId":"484eb7568f6711e5a9bb0050569ccb08"
	},

	GET_ASSIGNED_AUDIT_PROCESS: {
		"projectId":PROJECTID,
		"workflowId":"a6e3595105f840f09d430829bff59235",
		"processId":"9b27e388222f4f238fde82659a38c3c3"
	},

	INIT_PROCESS: {
		"projectId":PROJECTID,
		"workflowId":"a5deb0663c754763a93fccd9289e8ff0",
		"processId":"8e7adb41ad194c93b7664db684c108ba"
	},

	ERROR_LOG: {
		"projectId":PROJECTID,
		"workflowId":"28e722a7522843c98211b30b5f2cd61f",
		"processId":"17f4b1d0be9549d9b6106c76b5aa4315"
	},

	ERROR_LOG_UPLOAD: {
		"projectId":PROJECTID,
		"workflowId":"c8d262b2d48347e485714042cd13cb49",
		"processId":"7ea6c23bb1724838bab4b2681c29c4b1"
	},

	SERVER_TIME: {
        "projectId":PROJECTID,
        "workflowId":"c33bd4a78755407ba70352624144de7c",
        "processId":"935ec05204224e53bcac63f6d84813bd"
    },

	COLORS:[
		"#FF0000",
		"#808000",
		"#800080",
		"#000080",
		"#008000",
		"#008080",
		"#800080",
		"#F5DEB3",
		"#FF6347",
		"#A0522D",
		"#FA8072",
		"#663399",
		"#EEE8AA",
		"#778899",
		"#ADFF2F",
		"#DAA520",
		"#808080",
		"#000000",
		"#800000",
		"#4B0082"
	],

	//To this distributor photo is not mandatory
	DISTRIBUTOR: 3,

	TIMEOUT: 30,

	MAXIMUM_AGE: 10,

	alertMessages : {
		"logOut" : "Are you sure you want to logout?"
	},

	ErrorMessages: {
		
		"noNetwork" : "check your network settings!",

		"password" : "* Enter valid password",

		"emailError" : "* Enter email id",

		"inValidEmailId" : "Invalid email id",
	},

	ERROR_LOG_TYPES: {
		LOGIN_FAILED: "LOGIN_FAILED",
		IMAGE_UPLOAD: "IMAGE_UPLOAD",
		DB_CREATION: "DB_CREATION",
		DB_UPDATION: "DB_UPDATION",
		UPLOAD_AUDIT: "UPLOAD_AUDIT",
		UPDATE_MASTER: "UPDATE_MASTER"
	},

	FIELD_TYPES: {
		INT: "1",
		TEXT: "2",
		OPTION: "3"
	},

	FIELDS: {
		"TEXT_INPUT": "0"
	},

	
	alert: function( msg ) {
    	alert( msg, function(){}, 'Alert' );
    },
    
    confirm: function ( msg , OnConfirm, title,  buttons ) {
		OnConfirm(window.confirm(msg));
    },

    showLoaderEl: function(message){
    	require(["jquery"], function($){
	    	$(".loader-container").mask(message || "", 100);
    	});
    },

    hideLoaderEl: function(){
    	require(["jquery"], function($){
    		$(".loader-container").unmask();
    	});
    },

	clearAudits: function(allAudits, processedAudits){

    	var currentDate = new Date();
    	var currentYear = currentDate.getFullYear();
    	var currentMonth = currentDate.getMonth() + 1;
    	var currentDay = currentDate.getDate();

    	for(var i = 0; i < allAudits.length; i++){
    		var audit = allAudits[i];
    		var auditId = audit.auditId;
    		var storeId = audit.id;

    		var isProcessed = false;
    		for(var j = 0; j < processedAudits.length; j++){
    			var pAudit = processedAudits[j];

    			if(storeId == pAudit.store_id && auditId == pAudit.audit_id){
    				isProcessed = true;
    				break;
    			}
    		}

    		if(!isProcessed){
    			var date = audit.endDate;

	    		date = date.split("-");
		    	var day = parseInt(date[0]);
		    	var month = parseInt(date[1]);
		    	var year = parseInt(date[2]);

		    	var clear = false;
		    	if(year < currentYear){
		    		clear = true;
		    	}else if(month < currentMonth){
		    		clear = true;
		    	}

		    	if(clear){

		    		allAudits.splice(i, 1);
		    		removeAudit(db, auditId, storeId, function(){

		    		});
		    	}
    		}
    	}
    },

	makeRequest: function(method, url,  callbacks, data){
		var success = checkConnection();
	   	if(!success) {
	   		if(callbacks.failure){
	   			callbacks.failure(0);
	   			return;
	   		}

	   		inswit.alert("No Internet Connection!", "Error");
	   		return;
	   	}

		var that = this;
		
		$.ajax({
			url: url,
			type: method,
			data: data,
			timeout: 90000, //60 sec
			dataType: 'json',
			cache: false,
			success: function(response, textStatus, jqXHR){
				
				//that.sessionOut(response.login_required);

				callbacks.success.call(callbacks.scope, response);
			},
			failure: function () {
				inswit.hideLoaderEl();

				if(callbacks.failure){
					callbacks.failure(1);
					return;
				}

                that.alert('Check your network settings!');
            },
			error: function(jqXHR, textStatus, errorThrown){
				inswit.hideLoaderEl();

				if(callbacks.failure){
					callbacks.failure(2);
					return;
				}

				if(textStatus === "timeout"){
					that.alert("Check your network settings!");
				}else {
					if(that.networkAvailable()) {
						that.alert('Server error.Try again!');
					}
				}
			}
		});
	},

	executeProcess: function(processVariables, callbacks){

		var success = checkConnection();
		if(!success) {
	   		if(callbacks.failure){
	   			callbacks.failure(0);
	   			return;
	   		}

	   		inswit.alert("No Internet Connection!", "Error");
	   		return;
	   	}

		var that = this;

		var projectId = processVariables.projectId;
		var workflowId = processVariables.workflowId;
		var url = this.URI + "ProcessStore/d/workflows/" + workflowId + "/execute?projectId=" + projectId;

		processVariables = {"processVariables": JSON.stringify(processVariables)}
		
		$.ajax({
			url: url,
			type: "PUT",
			data: processVariables,
			timeout: 90000, //60 sec
			dataType: 'json',
			cache: false,
			success: function(response, textStatus, jqXHR){

				//that.sessionOut(response.login_required);

				if(response.Error === "0"){
					callbacks.success.call(callbacks.scope, response);
				}else{
					if(callbacks.failure){
						callbacks.failure(2);
						return;
					}else{
						inswit.alert("Server Error. Try Again Later!", "Error");
					}
				}	
			},
			failure: function() {
				inswit.hideLoaderEl();
				if(callbacks.failure){
					callbacks.failure(1);
					return;
				}

                that.alert('Check your network settings!');
            },
			error: function(jqXHR, textStatus, errorThrown){
				inswit.hideLoaderEl();
				if(callbacks.failure){
					callbacks.failure(2);
					return;
				}

				if(textStatus === "timeout"){
					that.alert("Check your network settings!");
				}else {
					if(that.networkAvailable()) {
						that.alert('Server error.Try again later!');
					}
				}
			}
		});
	},

	networkAvailable: function() {
		if(isDesktop()){
	        return true;
	    }

	    var networkState = navigator.connection.type;
		if (Connection.NONE == networkState) {
			return false;
		}
		
		return true;
	},

	sessionOut: function(callback) {
		LocalStorage.removeAccessToken();
		LocalStorage.removeEmployeeId();
		LocalStorage.resetAuditFilter();
		
		router.navigate("/", {
			trigger: true
		});
  	},

  	isValidSession: function() {
  		var isValid = false;
		var token = LocalStorage.getAccessToken();

		if(token)
			isValid = true;

		return isValid;
  	},

  	clearPhoto: function(imageList){

		// simple error handler
		function onFailure(e) { 
	        console.log('Error: Image file delete failed');
		};
		// delete the file
		function onSuccess(fileEntry){
			console.log(fileEntry.name);

			fileEntry.remove(function(){
				console.log("Image file deleted");
			}, function(){
				console.log("Image file delete failed");
			});
		};

		for(var i = 0; i < imageList.length; i++){
			var imageURI = imageList[i].imageURI;
			if(imageURI)
				window.resolveLocalFileSystemURI(imageURI, onSuccess, onFailure);
		}
	},
  	
	loginInToAppiyo: function(callback){
		var that = this;

		var data = {
			"email": inswit.LOGIN_CREDENTIAL.email.trim(),
			"password": inswit.LOGIN_CREDENTIAL.password.trim(),
			"longTermToken": true
		}

		var url = inswit.URI + "ProcessStore/account/login";
		inswit.makeRequest("POST", url, {
            success: function(response){    
               if(response.token) {
               		LocalStorage.setAccessToken(response.token);
					callback();

				}else {
					inswit.alert("Login Failed.Try Again!");
					inswit.hideLoaderEl();
				}
            }, failure: function(error){
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
            			inswit.alert("Login Failed.Try Again!");
            			break;
            		}
            	}
            	
            	inswit.hideLoaderEl();
            }
        }, data);
	},

	/**
	 * Get Latitude and longitude using HTML5 geolocation
	 * Recursively it may try twice with 30 seconds timeout(totally 1 minute)
	 * @param  {Function} callback [description]
	 * @param  {[type]}   options  [description]
	 * @param  {[type]}   retry    [description]
	 * @return {[type]}   object   [description]
	 */
	getLatLng: function(callback, options, retry){
		var that = this;
		
		if(navigator.geolocation) {
		    navigator.geolocation.getCurrentPosition(
		    	function(position) {
		    		var pos = {
						lat: position.coords.latitude || "",
						lng: position.coords.longitude || ""
					};

					callback(pos);
					return;

		    	}, function(error) {
			    	options = {
						enableHighAccuracy:false,
				    	maximumAge:inswit.MAXIMUM_AGE,
		    			timeout:inswit.TIMEOUT
					};

					if(retry){

		    			options = {
		    				enableHighAccuracy:false,
					    	maximumAge:inswit.MAXIMUM_AGE,
		    				timeout:inswit.TIMEOUT,
					    	priority: inswit.PRIORITY.PRIORITY_HIGH_ACCURACY
						};

		    			that.getLatLngUsingLocationServices(callback, options, false);
		    			return;
		    		}

		    		that.getLatLng(callback, options, true);

			    }, options);
		}else{
			options = {
				enableHighAccuracy:true,
		    	maximumAge:inswit.MAXIMUM_AGE,
		    	timeout:inswit.TIMEOUT,
		    	priority: inswit.PRIORITY.PRIORITY_HIGH_ACCURACY
			};

			that.getLatLngUsingLocationServices(callback, options, false);
		}  
	},

	/**
	 * Get Latitude and longitude using Location services plgin
	 * Recursively it may try twice with 30 seconds timeout(totally 1 minute)
	 * @param  {Function} callback [description]
	 * @param  {[type]}   options  [description]
	 * @param  {[type]}   retry    [description]
	 * @return {[type]}   object   [description]
	 */
	getLatLngUsingLocationServices: function(callback, options, retry){
		var that = this;

		cordova.plugins.locationServices.geolocation.getCurrentPosition(
			function(position) {
				var pos = {
					lat: position.coords.latitude || "",
					lng: position.coords.longitude || ""
				};
					
				callback(pos);
				return;

			}, function(error) {
				if(retry){
					
					callback("");
					return;
				}

		    	options = {
		    		enableHighAccuracy:false,
			    	maximumAge:inswit.MAXIMUM_AGE,
		    		timeout:inswit.TIMEOUT,
			    	priority: inswit.PRIORITY.PRIORITY_NO_POWER
				};

				that.getLatLngUsingLocationServices(callback, options, true);

		    }, options);
	},

	takePicture: function(callback, takeEl, retakeEl) {
		 var that = this;

        //inswit.errorLog({"info":"Before taking picture"});

        if(!parentsEl) {

            if($("."+ takeEl + ", ." + retakeEl).hasClass("disable")) {
                return;
            }

            $("."+ takeEl + ", ." + retakeEl).addClass("disable");
        }else {
            if(parentsEl.find("."+ takeEl + ", ." + retakeEl).hasClass("disable")) {
                return;
            }

            parentsEl.find("."+ takeEl + ", ." + retakeEl).addClass("disable");
        }

        if (!navigator.camera) {
            inswit.alert("Camera API not supported", "Error");
            return;
        }

        var cameraOptions = {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,//0=DATA_URL, 1=FILE_URI
        sourceType: Camera.PictureSourceType.CAMERA,  // 0=Photo Library, 1=Camera, 2=Saved Album
        encodingType: Camera.EncodingType.JPEG,// 0=JPEG 1=PNG,
        targetWidth: 728,
        targetHeight: 1024,
        correctOrientation: true,
        inbuiltCamera: true,
        superImposeTimeStamp: true,
        superImposeText: superImposeText || ""
        };

        var oldImageURI = $(".photo_block img").attr("src") || "";
        navigator.camera.getPicture(function(imageURI) {
        var template = "<img src='{{imageURI}}' width='100%' height='200'><a class='{{element}} retake_photo'>Retake</a>";
        var html = Mustache.to_html(template, {"imageURI":imageURI, "element":retakeEl});

        if(!parentsEl) {
            $("." + takeEl).remove();
            $(".photo_block").empty().append(html);
        }else {
            parentsEl.find("." + takeEl).remove();
             parentsEl.find(".photo_block").empty().append(html);
        }

        callback(imageURI);

        if(oldImageURI){
            var imageList = [{"imageURI":oldImageURI}];
            inswit.clearPhoto(imageList);
        }

        if(!parentsEl) {
            $("."+ takeEl + ", ." + retakeEl).removeClass("disable");
        }else {
            parentsEl.find("."+ takeEl + ", ." + retakeEl).removeClass("disable");
        }

        },function(err) {
            var imageURI = $(".photo_block img").attr("src") || "";
            callback(imageURI);
            $("."+ takeEl + ", ." + retakeEl).removeClass("disable");
        }, cameraOptions);
	},

	updateMasterData: function(processVariables, callback){
		var that = this;

		db.transaction(function(tx){
			var products = processVariables.brandChanMap;
			var productNormMap = processVariables.brandNormMap;
			var norms = processVariables.normOptionRemarkMap;
			var options = processVariables.options;
			var remarks = processVariables.remarks;
			var distributors = processVariables.DistributorBranch;
			var empId = LocalStorage.getEmployeeId();
			var channels = processVariables.channelList;
			var categoryList = processVariables.categoryList;
			
			var modified = false;
			//Remove and populate the product table
			if(products && products.length > 0){
				modified = true;

				removeTable(db, "mxpg_product", function(){
					populateProductTable(db, products, function(){}, function(error, info){
						
						var desc = {
							value: products,
							table: "mxpg_product"
						};

						var pVariables = {
						    "projectId":inswit.ERROR_LOG.projectId,
						    "workflowId":inswit.ERROR_LOG.workflowId,
						    "processId":inswit.ERROR_LOG.processId,
						    "ProcessVariables":{
						    	"errorType": inswit.ERROR_LOG_TYPES.UPDATE_MASTER,
						    	"empId":empId,
						    	"issueDate": new Date(),
						    	"issueDescription": JSON.stringify(desc),
						    	"version": inswit.VERSION
						    }
						};
		
						inswit.executeProcess(pVariables, {
						    success: function(response){
						    	if(response.ProcessVariables){
						    		
						    	}
			                }, failure: function(error){
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
					});
				});
			}
			
			//Remove and populate the norm table
			if(norms && norms.length > 0){
				modified = true;

				removeTable(db, "mxpg_norm", function(){
					populateNormTable(db, norms, function(){}, function(error, info){
						var desc = {
							value: norms,
							table: "mxpg_norm"
						};
						var pVariables = {
						    "projectId":inswit.ERROR_LOG.projectId,
						    "workflowId":inswit.ERROR_LOG.workflowId,
						    "processId":inswit.ERROR_LOG.processId,
						    "ProcessVariables":{
						    	"errorType": inswit.ERROR_LOG_TYPES.UPDATE_MASTER,
						    	"empId":empId,
						    	"issueDate":new Date(),
						    	"issueDescription": JSON.stringify(desc),
						    	"version": inswit.VERSION
						    }
						};
		
						inswit.executeProcess(pVariables, {
						    success: function(response){
						    	if(response.ProcessVariables){
						    		
						    	}
			                }, failure: function(error){
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
					});
				});
			}

			//Remove and populate the category table
			if(categoryList && categoryList.length > 0){
				modified = true;

				removeTable(db, "mxpg_category", function(){
					populateCategoryTable(db, categoryList, function(){}, function(error, info){
						var desc = {
							value: categoryList,
							table: "mxpg_category"
						};
						var pVariables = {
						    "projectId":inswit.ERROR_LOG.projectId,
						    "workflowId":inswit.ERROR_LOG.workflowId,
						    "processId":inswit.ERROR_LOG.processId,
						    "ProcessVariables":{
						    	"errorType": inswit.ERROR_LOG_TYPES.UPDATE_MASTER,
						    	"empId":empId,
						    	"issueDate":new Date(),
						    	"issueDescription": JSON.stringify(desc),
						    	"version": inswit.VERSION
						    }
						};
		
						inswit.executeProcess(pVariables, {
						    success: function(response){
						    	if(response.ProcessVariables){
						    		
						    	}
			                }, failure: function(error){
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
					});
				});
			}

			//Remove and populate the channel table
			if(channels && channels.length > 0){
				modified = true;

				removeTable(db, "mxpg_channel", function(){
					populateChannelTable(db, channels, function(){}, function(error, info){
						var desc = {
							value: channels,
							table: "mxpg_channel"
						};
						var pVariables = {
						    "projectId":inswit.ERROR_LOG.projectId,
						    "workflowId":inswit.ERROR_LOG.workflowId,
						    "processId":inswit.ERROR_LOG.processId,
						    "ProcessVariables":{
						    	"errorType": inswit.ERROR_LOG_TYPES.UPDATE_MASTER,
						    	"empId":empId,
						    	"issueDate":new Date(),
						    	"issueDescription": JSON.stringify(desc),
						    	"version": inswit.VERSION
						    }
						};
		
						inswit.executeProcess(pVariables, {
						    success: function(response){
						    	if(response.ProcessVariables){
						    		
						    	}
			                }, failure: function(error){
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
					});
				});
			}


			//Remove and populate the option table
			if(options && options.length > 0){
				modified = true;

				removeTable(db, "mxpg_option", function(){
					populateOptionTable(db, options, function(){}, function(error, info){
						var desc = {
							value: options,
							table: "mxpg_option"
						};
						var pVariables = {
						    "projectId":inswit.ERROR_LOG.projectId,
						    "workflowId":inswit.ERROR_LOG.workflowId,
						    "processId":inswit.ERROR_LOG.processId,
						    "ProcessVariables":{
						    	"errorType": inswit.ERROR_LOG_TYPES.UPDATE_MASTER,
						    	"empId":empId,
						    	"issueDate":new Date(),
						    	"issueDescription": JSON.stringify(desc),
						    	"version": inswit.VERSION
						    }
						};
		
						inswit.executeProcess(pVariables, {
						    success: function(response){
						    	if(response.ProcessVariables){
						    		
						    	}
			                }, failure: function(error){
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
					});
				});
			}

			//Remove and populate the remark table
			if(remarks && remarks.length > 0){
				modified = true;

				removeTable(db, "mxpg_remark", function(){
					populateRemarkTable(db, remarks, function(){}, function(error, info){
						var desc = {
							value: remarks,
							table: "mxpg_remark"
						};
						var pVariables = {
						    "projectId":inswit.ERROR_LOG.projectId,
						    "workflowId":inswit.ERROR_LOG.workflowId,
						    "processId":inswit.ERROR_LOG.processId,
						    "ProcessVariables":{
						    	"errorType": inswit.ERROR_LOG_TYPES.UPDATE_MASTER,
						    	"empId":empId,
						    	"issueDate":new Date(),
						    	"issueDescription": JSON.stringify(desc),
						    	"version": inswit.VERSION
						    }
						};
		
						inswit.executeProcess(pVariables, {
						    success: function(response){
						    	if(response.ProcessVariables){
						    		
						    	}
			                }, failure: function(error){
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
					});
				});
			}
			
			//Remove and populate the ProductNormMap table
			if(productNormMap && productNormMap.length > 0){
				modified = true;

				removeTable(db, "mxpg_pn_map", function(){
					populateProductNormMap(db, productNormMap, function(){}, function(error, info){
						
						var desc = {
							value: productNormMap,
							table: "mxpg_pn_map"
						};

						var pVariables = {
						    "projectId":inswit.ERROR_LOG.projectId,
						    "workflowId":inswit.ERROR_LOG.workflowId,
						    "processId":inswit.ERROR_LOG.processId,
						    "ProcessVariables":{
						    	"errorType": inswit.ERROR_LOG_TYPES.UPDATE_MASTER,
						    	"empId":empId,
						    	"issueDate":new Date(),
						    	"issueDescription": JSON.stringify(desc),
						    	"version": inswit.VERSION
						    }
						};
		
						inswit.executeProcess(pVariables, {
						    success: function(response){
						    	if(response.ProcessVariables){
						    		
						    	}
			                }, failure: function(error){
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
					});
				});
			}
			
			//Remove and populate the DistributorBranchLocationMap table
			if(distributors && distributors.length > 0){
				modified = true;

				removeTable(db, "mxpg_dist_brch_loc", function(){
					populateDistBranchLocationTable(db, distributors, function(){}, function(error, info){
						
						var desc = {
							value: distributors,
							table: "mxpg_dist_brch_loc"
						};

						var pVariables = {
						    "projectId":inswit.ERROR_LOG.projectId,
						    "workflowId":inswit.ERROR_LOG.workflowId,
						    "processId":inswit.ERROR_LOG.processId,
						    "ProcessVariables":{
						    	"errorType": inswit.ERROR_LOG_TYPES.UPDATE_MASTER,
						    	"empId":empId,
						    	"issueDate":new Date(),
						    	"issueDescription": JSON.stringify(desc),
						    	"version": inswit.VERSION
						    }
						};
		
						inswit.executeProcess(pVariables, {
						    success: function(response){
						    	if(response.ProcessVariables){
						    		
						    	}
			                }, failure: function(error){
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
					});
				});
			}

			//Remove completed audits from the DB
			if(modified){
				selectAllCompletedAudit(db, function(audits){
					var imageList = [];
					var i;
					if(audits.length > 0){
						for(i = 0; i < audits.length; i++){
							(function(index){
								var auditId = audits[index].audit_id;
								var storeId = audits[index].store_id;

								if(audits[index].comp_audit == "false"){
									imageList.push({"imageURI":audits[index].store_image});
									if(audits[index].audited == "true"){
										
										selectCompProducts(db, auditId, storeId, function(products){
											for(var j = 0; j < products.length; j++){
												var product = products[j];

												if(product.image_uri){
													imageList.push({"imageURI":product.image_uri});
												}
											}
											
											//Remove unfinished audit from the DB
											removeAudit(db, auditId, storeId, function(){
												if(index + 1 == audits.length){
													callback();
													//Clear unwanted photo from mobile cache
													inswit.clearPhoto(imageList);
												}
											});
										});
									}else{
										removeAudit(db, auditId, storeId, function(){
											if(index + 1 == audits.length){
												callback();
												//Clear unwanted photo from mobile cache
												inswit.clearPhoto(imageList);
											}
										});
									}
								}

								if(index + 1 == audits.length){
									callback();
									//Clear unwanted photo from the mobile cache
									inswit.clearPhoto(imageList);
								}

							})(i);
						}
					}else{
						callback();
					}
				});
			}else{
				callback();
			}					              
		});
	},

	errorLog: function(error) {
		inswit.hideLoaderEl();

		var pVariables = {
		    "projectId":inswit.ERROR_LOG_UPLOAD.projectId,
		    "workflowId":inswit.ERROR_LOG_UPLOAD.workflowId,
		    "processId":inswit.ERROR_LOG_UPLOAD.processId,
		    "ProcessVariables":{
		    	"executing": JSON.stringify(error),
		    	"empId":LocalStorage.getEmployeeId(),
		    	"issueDate":new Date(),
		    	"version": inswit.VERSION
		    }
		};

		inswit.executeProcess(pVariables, {
		    success: function(response){
		    	if(response.ProcessVariables){
		    		
		    	}
            }, failure: function(error){
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
	}
};