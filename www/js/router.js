define(["backbone", "bootstrap", "mustache"], function() {
    $.ajaxSetup({
        beforeSend: function(response) {
        },
        complete: function(response) {
        },
        error: function(statusCode, errorThrown) {
            checkConnection();
        }
    });

    $.ajaxPrefilter(function(options) {
    	var ajaxUrl = options.url;
    	if(ajaxUrl.indexOf("http://") !==  0 && ajaxUrl.indexOf("https://") !== 0) {
    		options.url = url + ajaxUrl;
    	}
        options.crossDomain = true;
        
        var token = LocalStorage.getAccessToken();
        if(token) {
          options.headers = {Cookie: "authentication-token="+ token};
        }
    });

    var Router = Backbone.Router.extend({

        currentView: null,

        initialize: function() {

        },
        routes: {
            "":"renderLogin",
            "forgotpassword" : "showForgotPassword",
            "audits" : "getAuditList",
            "audits/:id" : "showAuditDetails",
            "audits/:id/continue/:pos" : "startAudit",
            "audits/:id/categoryList" : "showCategory",
            "audits/:id/products" : "showProducts",
            "audits/:id/mainProducts" : "showMainProducts",
            "audits/:id/category/:id/brands" : "showBrands",
            "audits/:id/category/:id" : "showAllBrandNorms",
            "audits/:id/category/:id/SGF" : "showSGFBrands",
            "audits/:id/category/:id/brand/:id/sgfNorms" : "showSGFNorms",
            "audits/:id/products/:id/category/:id/brandNorms/:true/cId/:id" : "showNorms",
            "audits/:id/product/verify" : "verifyAudit",
            "audits/:id/upload" : "onUploadAudit",
            "audits/:id/category/:id/SOD" : "openSOD",
            "holistic/:id": "openHolisticScreen",
            "signature/:id": "showSignatureScreen",
            "register" : "showRegister",
            /* "audits/upload" : "uploadAll"*/
        },

        renderLogin: function() {
            var that = this;

            var employeeId = LocalStorage.getEmployeeId();
            if(employeeId){
                router.navigate("/audits", {
                    trigger: true
                });
            }else{
                require(["login"], function(Register) {
                    var RegisterModel = new Register.Model({
                    });
                    var RegisterView = new Register.View({
                        model: RegisterModel
                    });
                    RegisterView.render();
                    that.appendView(RegisterView);
                });  
            }
            $(".timer_container").hide();
        },

        getAuditList: function(){
            var that = this;

            require(["auditList"], function(Audit) {
                var AuditModel = new Audit.Model({
                });
                var AuditView = new Audit.View({
                    model: AuditModel
                });
                AuditView.render();

                that.appendView(AuditView);
            });
            $(".timer_container").hide();
        },

        uploadAll: function(){
            var that = this;

            require(["auditList"], function(Audit) {
                var AuditModel = new Audit.Model({
                });
                var AuditView = new Audit.View({
                    model: AuditModel
                });
                AuditView.showCompletedAuditList();

                that.appendView(AuditView);
            });
            $(".timer_container").hide();
        },

        showAuditDetails: function(mId){
            var that = this;

            require(["auditDetails"], function(AuditDetails) {
                var AuditDetailsModel = new AuditDetails.Model({
                    "mId":mId
                });
                var AuditDetailsView = new AuditDetails.View({
                    model: AuditDetailsModel
                });
                AuditDetailsView.showAuditDetails(mId);

                that.appendView(AuditDetailsView);
            });
            $(".timer_container").hide();
        },

        startAudit: function(mId, pos){
            var that = this;

            var position = JSON.parse(pos);
            var callback = function(time, noInternet){
                if(noInternet == 1){
                    window.history.back();
                    return;
                }

                LocalStorage.setServerTime(mId, time);

                require(["initAudit"], function(InitAudit) {
                    var InitAuditModel = new InitAudit.Model({
                        "mId":mId,
                        "pos": position
                    });
                    var InitAuditView = new InitAudit.View({
                        model: InitAuditModel
                    });
                    InitAuditView.startAudit(mId);

                    that.appendView(InitAuditView);
                });

             };

            inswit.getServerTime(callback);
        },

        showProducts: function(mId){
            var that = this;

            require(["product"], function(Product) {
                var ProductModel = new Product.Model({
                    "mId":mId
                });
                var ProductView = new Product.View({model: ProductModel});

                ProductView.showProducts(mId);
                that.appendView(ProductView);
            });
        },
        showMainProducts: function(mId){
            var that = this;

            require(["mainProduct"], function(Product) {
                var ProductModel = new Product.Model({
                    "mId":mId
                });
                var ProductView = new Product.View({model: ProductModel});

                ProductView.showProducts(mId);
                that.appendView(ProductView);
            });
        },
        showForgotPassword: function() {
            var that = this;
            require(["forgotpassword"], function(ForgotPassword){
                var forgotpasswordModel = new ForgotPassword.model();
                var forgotpasswordView = new ForgotPassword.view({model:forgotpasswordModel});

                forgotpasswordView.render();
                that.appendView(forgotpasswordView);
            });
            $(".timer_container").hide();
        },

        verifyAudit: function(mId){
            var that = this;

            var disabled = $(".verify_audit").attr("disabled");

            if(!disabled){

                var id = mId.split("-");
                var auditId = id[0];
                var storeId = id[1];

                require(["verify"], function(Verify) {
                    var VerifyModel = new Verify.Model({
                        "mId":mId
                    });
                    var VerifyView = new Verify.View({
                        model: VerifyModel
                    });

                    VerifyView.verifyAudit(mId);

                    that.appendView(VerifyView);
                });
            }
        },

        showNorms: function(mId, pId, categoryId, brandwiseNorm, cId){
            var that = this;

            //Getting hotspot execution brand id to disable all the norms(Audit time)
            var hotspotPid = $(this.currentView.$el.find(".product")[0]).attr("id");
            var isVerify = false;

            //Getting hotspot execution brand id to disable all the norms(verify time)
            if(!hotspotPid){
                hotspotPid = $(this.currentView.$el.find(".p_header")[0]).attr("id");
                isVerify = true;
            }
            
            setTimeout(function(){
                var callback = function(product){
                    require(["norm"], function(Norm) {
                        var NormModel = new Norm.Model({
                            "mId":mId,
                            "hotspotPid": hotspotPid,
                            "isVerify":isVerify,
                            "brandwiseNorm": (brandwiseNorm == "true")? true:false,
                            "categoryId": categoryId,
                            "cId": cId
                        });
                        var NormView = new Norm.View({
                            model: NormModel
                        });
                        NormView.showNorms(mId, pId, product, hotspotPid);

                        that.appendView(NormView);

                    });
                }

                getProductName(db, mId, categoryId, callback);
            }, 350);
        },

        showAllBrandNorms: function(mId, categoryId) {
            var that = this;

            //Getting hotspot execution brand id to disable all the norms(Audit time)
            var hotspotPid = $(this.currentView.$el.find(".product")[0]).attr("id");
            var isVerify = false;

            //Getting hotspot execution brand id to disable all the norms(verify time)
            if(!hotspotPid){
                hotspotPid = $(this.currentView.$el.find(".p_header")[0]).attr("id");
                isVerify = true;
            }
            
            setTimeout(function(){
                var callback = function(product){
                    require(["norm2"], function(Norm) {
                        var NormModel = new Norm.Model({
                            "mId":mId,
                            "hotspotPid": hotspotPid,
                            "isVerify":isVerify,
                            "categoryId": categoryId,
                            "cId": categoryId,
                            "product":product
                        });
                        var NormView = new Norm.View({
                            model: NormModel
                        });
                        NormView.showBays(mId, undefined, product, hotspotPid);

                        that.appendView(NormView);

                    });
                }

                getProductName(db, mId, categoryId, callback);
            }, 350);
        },

        showSGFNorms: function(mId, categoryId, brandId) {
            var that = this;

            //Getting hotspot execution brand id to disable all the norms(Audit time)
            var hotspotPid = $(this.currentView.$el.find(".product")[0]).attr("id");
            var isVerify = false;

            //Getting hotspot execution brand id to disable all the norms(verify time)
            if(!hotspotPid){
                hotspotPid = $(this.currentView.$el.find(".p_header")[0]).attr("id");
                isVerify = true;
            }
            
            setTimeout(function(){
                var callback = function(product){
                    require(["norm"], function(Norm) {
                        var NormModel = new Norm.Model({
                            "mId":mId,
                            "hotspotPid": hotspotPid,
                            "isVerify":isVerify,
                            "categoryId": categoryId,
                            "cId": categoryId,
                            "isSGF": true,
                            "brandId": brandId
                        });
                        var NormView = new Norm.View({
                            model: NormModel
                        });
                        NormView.showNorms(mId, undefined, product, hotspotPid);

                        that.appendView(NormView);

                    });
                }

                getProductName(db, mId, categoryId, callback);
            }, 350);
        },

        showSGFBrands: function(mId, channelId) {
            var that = this;

            //Getting hotspot execution brand id to disable all the norms(Audit time)
            var hotspotPid = $(this.currentView.$el.find(".product")[0]).attr("id");
            var isVerify = false;

            //Getting hotspot execution brand id to disable all the norms(verify time)
            if(!hotspotPid){
                hotspotPid = $(this.currentView.$el.find(".p_header")[0]).attr("id");
                isVerify = true;
            }
            
            setTimeout(function(){
                var callback = function(product){
                    require(["SGF/storeGrowthFund"], function(SGF) {
                        var SGFModel = new SGF.Model({
                            "mId":mId,
                            "hotspotPid": hotspotPid,
                            "isVerify":isVerify,
                            "channelId": channelId,
                            "cId": channelId,
                            "isSGF": true
                        });
                        var SGFView = new SGF.View({
                            model: SGFModel
                        });
                        SGFView.showSgfbrands(mId, undefined, "", hotspotPid);

                        that.appendView(SGFView);

                    });
                }

                getProductName(db, mId, channelId, callback);
            }, 350);
        },

        showBrandNorms: function(mId, pId) {
            var brandwiseNorm = true;
            this.getNorm(mId, pId, brandwiseNorm);
        },

        onUploadAudit: function(mId) {
            var that = this;

            require(["upload"], function(Upload) {
                var UploadModel = new Upload.Model({
                    "mId":mId
                });
                var UploadView = new Upload.View({model: UploadModel});

                UploadView.onUploadAudit(mId);
                that.appendView(UploadView);
            });
            $(".timer_container").hide();
        },
        showCategory: function(mId) {
            var that = this;

            require(["category"], function(Category) {
                var CategoryModel = new Category.Model({
                    "mId":mId
                });
                var CategoryView = new Category.View({model: CategoryModel});

                CategoryView.showCategories(mId);
                that.appendView(CategoryView);
            });
        },

        showBrands: function(mId, categoryId) {
            var that = this;

            require(["brands"], function(Brands) {
                var BrandsModel = new Brands.Model({
                    "mId":mId,
                    "categoryId": categoryId
                });
                var BrandsView = new Brands.View({model: BrandsModel});
                
                var brandwiseNorm = true;
                BrandsView.showBrands(mId, categoryId, brandwiseNorm);
                that.appendView(BrandsView);
            });
        },

        openSOD: function(mId, categoryId) {
            var that = this;

            require(["shareOfDisplay"], function(ShareOfDisplay) {
                var ShareOfDisplayModel = new ShareOfDisplay.Model({
                    "mId":mId,
                    "categoryId": categoryId
                });
                var ShareOfDisplayView = new ShareOfDisplay.View({model: ShareOfDisplayModel});
                
                var brandwiseNorm = false;
                ShareOfDisplayView.showBrands(mId, categoryId, brandwiseNorm);
                that.appendView(ShareOfDisplayView);
            });
        },

        openHolisticScreen: function(mId) {
             var that = this;

            require(["holisticScreen"], function(Holistic) {
                var HolisticModel = new Holistic.Model({
                    "mId":mId
                });
                var HolisticView = new Holistic.View({model: HolisticModel});
                HolisticView.render();
                that.appendView(HolisticView);
            });

        },

        showSignatureScreen: function(mId) {
            var that = this;

            require(["signature"], function(Signature) {
                var SignatureModel = new Signature.Model({
                    "mId":mId
                });
                var SignatureView = new Signature.View({model: SignatureModel});
                SignatureView.render();
                that.appendView(SignatureView);
            });

        },

        getNorm: function(mId, pId, brandwiseNorm) {
            
        },

        appendView: function(view) {
            if(this.currentView) {
                this.currentView.remove();
                this.currentView = null;
            }

            $("#content").empty().append(view.$el);
            this.currentView = view;
        },


        showRegister: function() {
            var that = this;
            require(["register"], function(RegisterUniqueId){
                var registerModel = new RegisterUniqueId.Model({});
                var registerView = new RegisterUniqueId.View({model:registerModel});

                registerView.render();
                that.appendView(registerView);
            });
        }


    });
    return Router;
});