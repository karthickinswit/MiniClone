/**
 * This method create table to completed audit details.
 */
function createCompAuditTable(tx, success, error) {
    var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_comp_audits(store_id TEXT, id TEXT, comp_audit BOOLEAN, audited BOOLEAN, option_id TEXT, audit_id TEXT, store_image TEXT, sign_image TEXT, lat TEXT, lng TEXT, store_image_id TEXT, sign_image_id TEXT, channel_id TEXT, auditer_name TEXT, auditer_number TEXT, selfie_image TEXT, selfie_image_id TEXT, non_co_name TEXT, non_co_designation TEXT, accuracy TEXT)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX compAuditIndex ON mxpg_comp_audits(audit_id, store_id)";
    tx.executeSql(createIndex);
}

/**
 * This method create table to completed audit details.
 */
function createCompProductTable(tx, success, error) {
    var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_comp_products(store_id TEXT, store_name TEXT, product_id TEXT, product_name TEXT, category_id TEXT, norm_id TEXT, norm_name TEXT, option_id TEXT, option_name TEXT, remark_id TEXT, remark_name TEXT, image TEXT, image_uri TEXT, audit_id TEXT, store_score BOOLEAN, priority NUMBER, image_id TEXT, is_sos TEXT, qr_code TEXT, percentage NUMBER)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX compProductIndex ON mxpg_comp_products(audit_id, store_id, product_id, category_id, norm_id)";
    tx.executeSql(createIndex);
}

/**
 * This method Insert or Replace the record from Completed Product table of SQLite DB.
 * @param  {object} db
 * @param  {json} audit
 * @param  {function} callback function
 */

function populateCompAuditTable(db, audit, callback, error) {
    db.transaction(function(tx){
        tx.executeSql('INSERT OR replace INTO mxpg_comp_audits(store_id, id, comp_audit, audited, option_id, audit_id, store_image, sign_image, lat, lng, store_image_id, sign_image_id, channel_id, auditer_name, auditer_number, selfie_image, selfie_image_id, non_co_name, non_co_designation, accuracy) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);',
            [audit.storeId, audit.id, audit.isCompleted, audit.isContinued, audit.optionId, audit.auditId, audit.storeImage, audit.signImage, audit.lat, audit.lng, audit.storeImageId, audit.signImageId, audit.categoryId, audit.auditerName, audit.phoneNumber, audit.selfieImage, audit.selfieImageId, audit.nonCoName, audit.nonCoDesignation, audit.accuracy]
        , callback, error);
    });
}

/**
 * This method Insert or Replace the record from Completed Product table of SQLite DB.
 * @param  {object} db
 * @param  {json} store
 * @param  {function} callback function
 */

function populateCompProductTable(db, product, callback) {
    var obj = "";

    var storeId = product.storeId;
    var auditId = product.auditId;
    var storeName = product.storeName;
    var image = product.image;
    var imageId = product.imageId;
    var imageURI = product.imageURI;
    var priority = product.priority;
    var categoryId = product.categoryId;
    var isSOS = product.isSOS;
    var qrResult = product.qrResult

    var length = product.norms.length;

    $(".product_done").removeClass("clicked");
    db.transaction(function(tx){
        for(var i = 0; i < length; i++){
            var norm = product.norms[i];
            norm.isConsider == "true" ? true : false;

            tx.executeSql('INSERT OR replace INTO  mxpg_comp_products(store_id, store_name, product_id, product_name, norm_id, norm_name, option_id, option_name, remark_id, remark_name, image, image_uri, audit_id, store_score, priority, image_id, category_id, is_sos, qr_code, percentage) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);',
                [storeId, storeName, norm.productId, norm.productName, norm.normId, norm.normName, norm.optionId, norm.optionName, norm.remarkId, norm.remarkName, image, imageURI, auditId, norm.isConsider, priority, imageId, categoryId, isSOS, qrResult, norm.percentage]);

            if(i+1 == length){
                if(callback)
                    callback();
            }
        }
    });
}

/**
 * This method Select the all finished record from compProductTable
 * @param  {object} db
 * @param  {json} store
 */

function selectAllCompProducts(db, auditId, storeId, fn) {

    var query = "select * from mxpg_comp_products where audit_id='" + auditId + "' AND store_id='" + storeId + "'";
    
   
    db.transaction(function(tx){
        tx.executeSql(query , [], function(tx, response) {
            var results = [];
            var len = response.rows.length;

            for(var i = 0; i < len; i++){
                var obj = response.rows.item(i);
                results.push(obj);
            }
            
            fn(results);
        });
    });
}

/**
 * This method Select the all distinct record from compProductTable
 * @param  {object} db
 * @param  {json} store
 */

function selectCompProducts(db, auditId, storeId, fn, categoryId, isSOS) {

    var query = "select DISTINCT product_id, product_name, image_uri, priority, image_id, category_id, is_sos from mxpg_comp_products where audit_id='" + auditId + "' AND store_id= '" + storeId + "' group by image_uri";
    if(categoryId) {
        //query = query+ " AND channel_id='" + categoryId + "'";
    }
    if(isSOS) {
        query = query+ " AND is_sos = '1' ";
    }

    //query = query+ " group by channel_id";

    db.transaction(function(tx){
        tx.executeSql(query , [], function(tx, response) {
            var results = [];
            var len = response.rows.length;

            for(var i = 0; i < len; i++){
                var obj = response.rows.item(i);
                results.push(obj);
            }
            
            fn(results);
        });
    });
}



/**
 * This method Select the all distinct record from compProductTable
 * @param  {object} db
 * @param  {json} store
 */

function compledProducts(db, auditId, storeId, fn, categoryId, isSOS) {

    var query = "select DISTINCT product_id, product_name, image_uri, priority, image_id, category_id from mxpg_comp_products where audit_id='" + auditId + "' AND store_id= '" + storeId + "'";
    if(categoryId) {
        //query = query+ " AND channel_id='" + categoryId + "'";
    }
    if(isSOS) {
        query = query+ " AND is_sos = '1' ";
    }

    //query = query+ " group by channel_id";

    db.transaction(function(tx){
        tx.executeSql(query , [], function(tx, response) {
            var results = [];
            var len = response.rows.length;

            for(var i = 0; i < len; i++){
                var obj = response.rows.item(i);
                results.push(obj);
            }
            
            fn(results);
        });
    });
}


/**
 * This method clear the unwanted products from compProductTable
 * @param  {object} db
 * @param  {json} store
 */

function clearCompProducts(db, auditId, storeId, fn) {
    db.transaction(function(tx){
        tx.executeSql('DELETE FROM mxpg_comp_products WHERE store_id=? AND audit_id=?;', [storeId, auditId], fn);
    });
}

/**
 * This method Select all the record from compProductTable
 * @param  {object} db
 * @param  {json} store
 */

function selectProductsToVerify(db, auditId, storeId, productId, fn, categoryId) {

    var tempProductId = "0";

    //and t2.category_id = '" + categoryId +"'\ Removed this to solve Google chrome issue

    var productQuery = "select t1.product_id as csbProduct, t2.product_id as categoryProduct from mxpg_csb_map t1\
                        join mxpg_pn_map t2 on t2.category_id = t1.category_id\
                        where t1.category_id = '" + categoryId +"'\
                        group by t2.product_id, t1.product_id";

        db.transaction(function(tx){
            tx.executeSql(productQuery , [], function(tx, response) {
                var results = [];
                var len = response.rows.length;

                 for(var i = 0; i < len; i++){
                      var obj = response.rows.item(i);

                      tempProductId += ","+ obj.csbProduct;

                      tempProductId += ","+ obj.categoryProduct;

                 }

                 var query = "select store_id as storeId, product_id as productId, product_name as productName, mxpg_comp_products.norm_id as normId, mxpg_comp_products.norm_name  as normName, mxpg_comp_products.option_id  as optionId, option_name as optionName, mxpg_comp_products.remark_id as remarkId, remark_name as remarkName, image, image_uri as imageURI, audit_id as auditId, store_score as isConsider, priority, qr_code as qrCode, multiple_photo from mxpg_comp_products join mxpg_norm where mxpg_norm.norm_id = mxpg_comp_products.norm_id and audit_id='" + auditId + "' ";

                 if(storeId){
                     query += " AND store_id='" + storeId + "'"+ "AND category_id in (" + categoryId +", 27) AND product_id in (" + tempProductId +")";
                 }

                 if(productId){
                     query += " AND product_id='" + productId + "' ";
                 }

                 query += " group by productId, mxpg_norm.norm_id ORDER BY priority ASC";

                 db.transaction(function(tx){
                     tx.executeSql(query , [], function(tx, response) {
                         var results = [];
                         var len = response.rows.length;

                         for(var i = 0; i < len; i++){
                             var obj = response.rows.item(i);
                             results.push(obj);
                         }

                         fn(results);
                     });
                 });

            })
        });
}


/**
 * This method Select all the record from compProductTable
 * @param  {object} db
 * @param  {json} store
 */

function selectSmartSpotProductsToVerify(db, auditId, storeId, productId, fn, categoryId) {

    var tempProductId = "0";

    var productQuery = "select t1.product_id as csbProduct, t2.product_id as categoryProduct from mxpg_csb_map t1\
                        join mxpg_pn_map t2 on t2.category_id = t1.category_id\
                        where t1.category_id = '" + categoryId +"'\
                        and t2.category_id = '" + categoryId +"'\
                        group by t2.product_id, t1.product_id";

        db.transaction(function(tx){
            tx.executeSql(productQuery , [], function(tx, response) {
                var results = [];
                var len = response.rows.length;

                 for(var i = 0; i < len; i++){
                      var obj = response.rows.item(i);

                      tempProductId += ","+ obj.csbProduct;

                      tempProductId += ","+ obj.categoryProduct;

                 }

                 var query = "select store_id as storeId, product_id as productId, product_name as productName, norm_id as normId, norm_name  as normName, option_id  as optionId, option_name as optionName, remark_id as remarkId, remark_name as remarkName, image, image_uri as imageURI, audit_id as auditId, store_score as isConsider, priority, qr_code as qrCode from mxpg_comp_products where audit_id='" + auditId + "' ";

                 if(storeId){
                     query += " AND store_id='" + storeId + "'"+ "AND category_id = 27 AND product_id in (" + tempProductId +")";
                 }

                 if(productId){
                     query += " AND product_id='" + productId + "' AND is_sos = 1";
                 }

                 query += " ORDER BY product_id ASC";

                 db.transaction(function(tx){
                     tx.executeSql(query , [], function(tx, response) {
                         var results = [];
                         var len = response.rows.length;

                         for(var i = 0; i < len; i++){
                             var obj = response.rows.item(i);
                             results.push(obj);
                         }

                         fn(results);
                     });
                 });

            })
        });
}

/**
 * This method Select all completed record from Completed Audit table.
 * @param  {object} db
 * @param  {function} callback function
 */

function selectAllCompAuditWithJoin(db, callback) {
    var query = 'SELECT t1.id,t2.audit_id,t2.store_id,t2.store_code,t2.store_name,t2.due FROM mxpg_comp_audits t1 JOIN mxpg_store t2 ON t1.id=t2.id WHERE t1.comp_audit=?;';
    
    db.transaction(function(tx){
        tx.executeSql(query, ["true"], function(tx, response){

            var results = [];
            var len = response.rows.length;

            for(var i = 0; i < len; i++){
                var obj = response.rows.item(i);
                obj.mId = obj.audit_id + "-" + obj.store_id ;
                results.push(obj);
            }
            
            callback(results);
        },function(a, e){
            alert(e);
        });
    });
}

/**
 * This method Select all completed record from Completed Audit table.
 * @param  {object} db
 * @param  {function} callback function
 */
function selectAllCompletedAudit(db, callback) {
    var query = 'SELECT * FROM mxpg_comp_audits;';
    
    db.transaction(function(tx){
        tx.executeSql(query, [], function(tx, response){

            var results = [];
            var len = response.rows.length;

            for(var i = 0; i < len; i++){
                var obj = response.rows.item(i);
                results.push(obj);
            }
            
            callback(results);
        });
    });
}

/**
 * This method Select one record from Completed Audit table.
 * @param  {object} db
 * @param  {json} auditId
 * @param  {function} callback function
 */

function selectCompletedAudit(db, mId, callback, error) {
    var id = mId.split("-");
    var auditId = id[0];
    var storeId = id[1];
    var categoryId = id[2];

    var query = 'SELECT * FROM mxpg_comp_audits WHERE audit_id=? AND store_id=?';
    
    db.transaction(function(tx){
        tx.executeSql(query, [auditId, storeId], function(tx, response){
            callback(response.rows);
        }, function(a, e){
            if(error){
                error(a, e);
            }
        });
    });
}

/**
 * This method update the status of Completed Audit.
 * @param  {object} db
 * @param  {json} auditId
 *  @param  {json} storeId
 * @param  {function} callback function
 */
function updateAuditStatus(db, auditId, storeId, success, error){
    db.transaction(function(tx){
        tx.executeSql('UPDATE mxpg_comp_audits SET comp_audit=? WHERE audit_id=? AND store_id=?;',
            [true, auditId, storeId]
        );
    });
}

/**
 * This method update Geo location position.
 * @param  {object} db
 * @param  {json} auditId
 * @param  {json} storeId
 * @param  {json} pos
 */
function updateGeoLocation(db, auditId, storeId, pos){
    db.transaction(function(tx){
        tx.executeSql('UPDATE mxpg_comp_audits SET lat=?, lng=? WHERE audit_id=? AND store_id=?;',
            [pos.lat, pos.lng, auditId, storeId]
        );
    });
}


/**
 * This method update signature photo of the store.
 * @param  {object} db
 * @param  {json} auditId
 * @param  {json} storeId
 * @param  {json} imageURI
 * @param  {function} callback function
 */
function updateSignaturePhoto(db, auditId, storeId, imageURI){
    db.transaction(function(tx){
        tx.executeSql('UPDATE mxpg_comp_audits SET sign_image=? WHERE audit_id=? AND store_id=?;',
            [imageURI, auditId, storeId]
        );
    });
}

/**
 * This method update Store photo id of the store.
 * @param  {object} db
 * @param  {json} auditId
 * @param  {json} storeId
 * @param  {json} imageId
 * @param  {function} callback function
 */
function updateStoreImageId(db, auditId, storeId, imageId, success, error){
    db.transaction(function(tx){
        tx.executeSql('UPDATE mxpg_comp_audits SET store_image_id=? WHERE audit_id=? AND store_id=?;',
            [imageId, auditId, storeId], success, error
        );
    });
}

/**
 * This method update signature photo id  of the store.
 * @param  {object} db
 * @param  {json} auditId
 * @param  {json} storeId
 * @param  {json} imageId
 * @param  {function} callback function
 */
function updateSignImageId(db, auditId, storeId, imageId, success, error){
    db.transaction(function(tx){
        tx.executeSql('UPDATE mxpg_comp_audits SET sign_image_id=? WHERE audit_id=? AND store_id=?;',
            [imageId, auditId, storeId], success, error
        );
    });
}

/**
 * This method update selfie photo id  of the store.
 * @param  {object} db
 * @param  {json} auditId
 * @param  {json} storeId
 * @param  {json} imageId
 * @param  {function} callback function
 */
function updateSelfieImageId(db, auditId, storeId, imageId, success, error){
    db.transaction(function(tx){
        tx.executeSql('UPDATE mxpg_comp_audits SET selfie_image_id=? WHERE audit_id=? AND store_id=?;',
            [imageId, auditId, storeId], success, error
        );
    });
}

/**
 * This method update product photo of the store.
 * @param  {object} db
 * @param  {json} auditId
 * @param  {json} storeId
 * @param  {json} productId
 * @param  {json} imageId
 * @param  {function} callback function
 */
function updateProductImageId(db, auditId, storeId, productId, imageId, success, error, categoryId, isSmartSpot){
    var query = 'select priority from mxpg_comp_products WHERE audit_id=? AND store_id=? AND product_id=?;';

    db.transaction(function(tx){
        tx.executeSql(query, [auditId, storeId, productId], function(tx, response){
            var priority = "";
            if(response.rows.length > 0){
                priority = response.rows.item(0).priority;
            }

            var intCategoryId = parseInt(categoryId);
             var query;
             if(categoryId == "30"){
                 query = 'UPDATE mxpg_comp_sgf SET image_id=? WHERE audit_id=? AND store_id=? AND category_id=? AND saved_brand=?';
                tx.executeSql(query,
                    [imageId, auditId, storeId, categoryId, productId], success, error);
            }else  if(categoryId == "27") {

                query = 'UPDATE mxpg_comp_products SET image_id=? WHERE audit_id=? AND store_id=? AND category_id=? and product_id=?'
                tx.executeSql(query,
                [imageId, auditId, storeId, categoryId, productId], success, error);
            }else if(parseInt(categoryId) >= 31){
                 query = 'UPDATE mxpg_comp_products SET image_id=? WHERE audit_id=? AND store_id=? AND category_id=? and product_id=?'
                                tx.executeSql(query,
                                [imageId, auditId, storeId, categoryId, productId], success, error);
            }else {
                query = 'UPDATE mxpg_comp_products SET image_id=? WHERE audit_id=? AND store_id=? AND category_id=?'
                                                tx.executeSql(query,
                                                [imageId, auditId, storeId, categoryId], success, error);
            }

            /*if(priority == 10){
                tx.executeSql('UPDATE mxpg_comp_products SET image_id=? WHERE audit_id=? AND store_id=? AND priority=8;',
                    [imageId, auditId, storeId]
                );
            }*/
        });
    });
}


function updateMPDphotos(db, auditId, storeId, categoryId, imageId, imgURI, position, success, error) {

   // if(auditId == "mpd_audits") {
        db.transaction(function(tx){
            tx.executeSql('UPDATE mxpg_mpd SET image_id=? WHERE store_id=? AND category_id=? AND image_uri=? AND position=?;',
                [imageId, storeId, categoryId, imgURI, position], success, error
            );
        });
   // }

}
function updateCatImagephotos(db, brandId, storeId, categoryId, imageId, imgURI, position,auditId, success, error) {

    //console.log(db, brandId, storeId, categoryId, imageId, imgURI, position,auditId);
                    // brandId, storeId, categoryId, image, imgURI, imgPosition,auditId

   // if(brandId == "0") {
        db.transaction(function(tx){
            tx.executeSql('UPDATE mxpg_cat_mpd SET image_id=? WHERE store_id=? AND category_id=? AND image_uri=? AND position=? AND audit_id=?;',
                [imageId, storeId, categoryId, imgURI, position,auditId],success, error
            );
        });
   // }

}



function updateProductImageIdForHotSpot(db, auditId, storeId, priority, imageId){
    db.transaction(function(tx){
        tx.executeSql('UPDATE mxpg_comp_products SET image_id=? WHERE audit_id=? AND store_id=? AND priority=?;',
            [imageId, auditId, storeId, priority]
        );
    });
}

/**
 * This method Remove the record from Completed Audit table.
 * @param  {object} db
 * @param  {json} auditId
 * @param  {function} callback function
 */

function removeAudit(db, auditId, storeId, success, error) {
    db.transaction(function(tx){
        tx.executeSql('DELETE FROM mxpg_store WHERE store_id=? AND audit_id=?;', [storeId, auditId], success);
    });

    db.transaction(function(tx){
        tx.executeSql('DELETE FROM mxpg_comp_audits WHERE store_id=? AND audit_id=?;', [storeId, auditId]);
    });

    db.transaction(function(tx){
        tx.executeSql('DELETE FROM mxpg_comp_products WHERE store_id=? AND audit_id=?;', [storeId, auditId]);
    });
    db.transaction(function(tx){
        tx.executeSql('DELETE FROM mxpg_comp_sgf WHERE store_id=? AND audit_id=?;', [storeId, auditId]);
    });
    db.transaction(function(tx){
            tx.executeSql('DELETE FROM mxpg_comp_sod WHERE store_id=? AND audit_id=?;', [storeId, auditId]);
    });

    db.transaction(function(tx){
         tx.executeSql('DELETE FROM mxpg_mpd WHERE store_id=?;', [storeId]);
    });
    db.transaction(function(tx){
        tx.executeSql('DELETE FROM mxpg_cat_mpd WHERE store_id=?;', [storeId]);
   });
}

/**
 * This method Remove the record from Completed Audit table.
 * @param  {object} db
 * @param  {json} auditId
 * @param  {function} callback function
 */

function removeStore(db, fn) {
    var query0 = 'SELECT store_id, audit_id FROM mxpg_store;';

    db.transaction(function(tx){
        tx.executeSql(query0, [], function(tx, response){
            var rows = response.rows;

            var query1 = 'DELETE FROM mxpg_store WHERE audit_id=? AND store_id=?;';
            var query2 = 'DELETE FROM mxpg_comp_products WHERE audit_id=? AND store_id=?;';
            var query3 = 'DELETE FROM mxpg_comp_audits WHERE comp_audit=?;';
            var query4 = 'SELECT store_id, audit_id FROM mxpg_comp_audits WHERE comp_audit=?;';

            tx.executeSql(query4, ["true"], function(tx, results){
                var result = results.rows;
                

                for(var i = 0; i < rows.length; i++){
                    var storeId = rows.item(i).store_id;
                    var auditId = rows.item(i).audit_id;
                    
                    var isCompleted = false;
                    for(var j = 0; j < result.length; j++){
                        var sId = rows.item(j).store_id;
                        var aId = rows.item(j).audit_id;
                        
                        if(auditId == aId && storeId == sId){
                            isCompleted = true;
                            break;
                        }                        
                    }

                    if(!isCompleted){
                        tx.executeSql(query1, [auditId, storeId], function(a,e){
                            //alert(a);
                        }, function(a, e){
                            //alert(e);
                        });

                        tx.executeSql(query2, [auditId, storeId], function(a,e){
                            //alert(a);
                        }, function(a, e){
                            //alert(e);
                        });
                    }
                }

                if(fn){
                    fn();
                }
            });

            tx.executeSql(query3, ["false"], function(){
                //alert(a);
            }, function(a, e){
                //alert(e);
            });

        }, function(a, e){
            //alert(e);
        });
    });
}

/**
 * This method Remove the record from Completed Product table.
 * @param  {object} db
 * @param  {json} auditId
 * @param  {function} callback function
 */

function removeBrands(db, auditId, storeId, success, error) {

    db.transaction(function(tx){
        tx.executeSql('DELETE FROM mxpg_comp_products WHERE store_id="' + storeId + '" AND audit_id="' + auditId + '" AND priority=8;', [], success, error);
    });
}

/**
 * This method select hotspot execution decision option value from completed audit table.
 * @param  {object} db
 * @param  {json} auditId
 * @param  {function} success function
 */
function selectHotSpotExecutionDecision(db, auditId, storeId, pId, success, error){
    var query = 'SELECT t1.norm_id, t1.norm_name, t1.option_id, t1.option_name FROM mxpg_comp_products t1 join mxpg_pn_map t2 on t2.norm_id = t1.norm_id WHERE t1.audit_id=? AND t1.store_id=?  AND t1.product_id=? AND t1.priority=10 order by t2.norm_order asc limit 1';
    
    db.transaction(function(tx){
        tx.executeSql(query, [auditId, storeId, pId], function(tx, response){
            success(response.rows);
        }, error);
    });
}
/**
 * This method Remove the record from Completed Product table where the audit is partial.
 * @param  {object} db
 * @param  {string} storeId
 */


function removePartialAudit(db, storeId) {

    db.transaction(function(tx){
        tx.executeSql('DELETE FROM mxpg_comp_audits WHERE store_id=? AND comp_audit=?;', [storeId, false]);
    });

    db.transaction(function(tx){
        tx.executeSql('DELETE FROM mxpg_comp_products WHERE store_id=?;', [storeId]);
    });

    db.transaction(function(tx){
        tx.executeSql('DELETE FROM mxpg_comp_audits WHERE store_id=?;', [storeId]);
    });

   db.transaction(function(tx){
         tx.executeSql('DELETE FROM mxpg_mpd WHERE store_id=?;', [storeId]);
     });
     db.transaction(function(tx){
        tx.executeSql('DELETE FROM mxpg_cat_mpd WHERE store_id=?;', [storeId]);
    }); 

    db.transaction(function(tx){
         tx.executeSql('DELETE FROM mxpg_comp_sgf WHERE store_id=?;', [storeId]);
    });

    db.transaction(function(tx){
       tx.executeSql('DELETE FROM mxpg_comp_sod WHERE store_id=?;', [storeId]);
    });
}


/**
 * This method Select one record from Completed SOD table.
 * @param  {object} db
 * @param  {json} auditId
 * @param  {function} callback function
 */

function selectCompletedSod(db, auditId, storeId, callback, error) {
    var query = 'SELECT * FROM mxpg_comp_sod WHERE audit_id=? AND store_id=?';
    
    db.transaction(function(tx){
        tx.executeSql(query, [auditId, storeId], function(tx, response){

            var results = [];
            var len = response.rows.length;

            for(var i = 0; i < len; i++){
                var obj = response.rows.item(i);
                results.push(obj);
            }
            
            callback(results);

        }, function(a, e){
            if(error){
                error(a, e);
            }
        });
    });
}

function selectCompletedSGF(db, auditId, storeId, callback, error) {
    var query = 'SELECT * FROM mxpg_comp_sgf WHERE audit_id=? AND store_id=?';
    
    db.transaction(function(tx){
        tx.executeSql(query, [auditId, storeId], function(tx, response){

            var results = [];
            var len = response.rows.length;

            for(var i = 0; i < len; i++){
                var obj = response.rows.item(i);
                results.push(obj);
            }
            
            callback(results);

        }, function(a, e){
            if(error){
                error(a, e);
            }
        });
    });
}

 //group by image_uri