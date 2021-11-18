function createCategoryNormMap(tx, success, error) {
    var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_cn_map(norm_id TEXT, category_id TEXT, norm_order NUMBER, channel_id TEXT)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX cnMapIndex ON mxpg_cn_map(norm_id, category_id, channel_id)";
    tx.executeSql(createIndex);
}


function selectBrands (db, channelId, category_id, fn) {
	var query = "select t1.category_id,t1.product_id, t2.product_name, t2.channel_name,t2.is_hotspot, t2.priority, t2.is_frontage, t2.brand_order, t2.channel_id  from mxpg_csb_map t1 join mxpg_product t2 where t1.category_id ="+ category_id +" and t2.product_id = t1.product_id group by t1.product_id order by t1.category_id asc";
    db.transaction(function(tx){
        tx.executeSql(query, [], function(tx,response) {
            var results = [];
            var len = response.rows.length;
            for(var i = 0; i < len; i++){
                var obj = response.rows.item(i);
                results.push(obj);
            }
            
            fn(results);
        }, function(tx,error){
            console.log(error);
        });
    });
}


function selectCategoryBrands(db, categoryId, fn) {
    var query = "select * from mxpg_product where category_id = "+ categoryId +" group by product_id order by category_id asc";
    db.transaction(function(tx){
        tx.executeSql(query, [], function(tx,response) {
            var results = [];
            var len = response.rows.length;
            for(var i = 0; i < len; i++){
                var obj = response.rows.item(i);
                results.push(obj);
            }
            
            fn(results);
        }, function(tx,error){
            console.log(error);
        });
    });
}

function selectSgfBrands(db, fn) {
    var query = "select * from mxpg_sgf_brand";
    db.transaction(function(tx){
        tx.executeSql(query, [], function(tx,response) {
            var results = [];
            var len = response.rows.length;
            for(var i = 0; i < len; i++){
                var obj = response.rows.item(i);
                results.push(obj);
            }
            
            fn(results);
        }, function(tx,error){
            console.log(error);
        });
    });
}

function populateCategoryNormTable(db, norms, success, error) {
    db.transaction(function(tx){
        for(var i = 0; i < norms.length; i++){
            var norm = norms[i];
            tx.executeSql('INSERT OR replace INTO mxpg_cn_map(norm_id, category_id, norm_order, channel_id) VALUES (?,?,?,?);',
                [norm.normId, norm.categoryId, norm.normOrder, norm.channelId]
            , success, error);
        }
    });
}

function smartSpotCompleted(db, categoryId, channelId, storeId, success, error) {
    var query = "select count(norm_id) as normCompCount from mxpg_comp_products where category_id = " + categoryId + " and store_id =" + storeId + " and product_id in (select product_id from mxpg_csb_map where category_id = " + categoryId + ")";
    
    db.transaction(function(tx){
        tx.executeSql(query, [], function(tx, response){
            var rows = response.rows;
            var len = response.rows.length;
            var normCompCount;
            if(len > 0){
                normCompCount = response.rows.item(0).normCompCount;
            }
            var query = "select count(norm_id) as normPnCount from mxpg_pn_map where category_id = " + categoryId + " and channel_id = "+ channelId + " and product_id in (select product_id from mxpg_csb_map where category_id = " + categoryId + ")";
            tx.executeSql(query, [], function(tx, response){
                var rows = response.rows; 
                var len = rows.length;
                var normPnCount;
                if(len > 0){
                    normPnCount = response.rows.item(0).normPnCount;
                }
                if(normCompCount == normPnCount){
                    success(true)
                }
                console.log("results"+ normCompCount + normPnCount);
            });
        }, error);
    });

}


function checkPromoCompleted(db, categoryId, channelId, storeId, success, error) {
    var query = "select count(norm_id) as normCompCount from mxpg_comp_products where category_id = " + categoryId + " and store_id =" + storeId + " and product_id in (select product_id from mxpg_csb_map where category_id = " + categoryId + ")";

    db.transaction(function(tx){
        tx.executeSql(query, [], function(tx, response){
            var rows = response.rows;
            var len = response.rows.length;
            var normCompCount;
            if(len > 0){
                normCompCount = response.rows.item(0).normCompCount;
            }
            var query = "select count(norm_id) as normPnCount from mxpg_pn_map where category_id = " + categoryId + " and channel_id = "+ channelId + " and product_id in (select product_id from mxpg_csb_map where category_id = " + categoryId + ")";
            tx.executeSql(query, [], function(tx, response){
                var rows = response.rows;
                var len = rows.length;
                var normPnCount;
                if(len > 0){
                    normPnCount = response.rows.item(0).normPnCount;
                }
                if(normCompCount >1){
                    success(true)
                }
                console.log("results"+ normCompCount + normPnCount);
            });
        }, error);
    });
}
function isSgfCompleted(db, channelId, storeId, success, error) {
    var query = "select count(norm_id) as normCompCount from mxpg_comp_sgf where store_id =" + storeId;
    
    db.transaction(function(tx){
        tx.executeSql(query, [], function(tx, response){
            var rows = response.rows;
            var len = response.rows.length;
            var normCompCount;
            if(len > 0){
                normCompCount = response.rows.item(0).normCompCount;
            }
            var query = "select count(norm_id) as normPnCount from mxpg_sgf where store_id = " + storeId;
            tx.executeSql(query, [], function(tx, response){
                var rows = response.rows; 
                var len = rows.length;
                var normPnCount;
                if(len > 0){
                    normPnCount = response.rows.item(0).normPnCount;
                }
                if(normCompCount == normPnCount){
                    success(true)
                }
                console.log("results"+ normCompCount + normPnCount);
            });
        }, error);
    });
}


function fetchCategoryName(db, categoryId, success, error) {
    var query = "select category_name as categoryName from mxpg_category where category_id = ?";
    
    db.transaction(function(tx){
        tx.executeSql(query, [categoryId], function(tx, response){
            var rows = response.rows;
            var categoryName = response.rows.item(0).categoryName;
            success(categoryName);
        });
    });   
}

function isAuditCompleted(db, auditId, categoryId, channelId, success, error){
    var compNormCount = 0;
    var pnNormCount = 0;
    var cnNormCount = 0;
    var sgfNormCount = 0;
    var sgfCount = 0;
    var promoCount = 0;
    var promoCompCount = 0;
    var query1 = "select count(norm_id) as normCompCount from mxpg_comp_products where store_id ="+ auditId +" and category_id not in (select category_id from mxpg_category where category_name like '%promo%')";

    //var query1 = "select count(norm_id) as normCompCount from mxpg_comp_products where store_id ="+ auditId;
    db.transaction(function(tx){
        tx.executeSql(query1, [], function(tx, response){
            var rows = response.rows;
            var len = response.rows.length;
            compNormCount = response.rows.item(0).normCompCount;
            var query2 = "select count(norm_id) as normPncount  from mxpg_pn_map where channel_id = "+ channelId + " and category_id not in (select category_id from mxpg_category where category_name like '%promo%')";

            //var query2 = "select count(norm_id) as normPncount  from mxpg_pn_map where channel_id = "+ channelId;
            db.transaction(function(tx){
                tx.executeSql(query2, [], function(tx, response){
                    var rows = response.rows;
                    var len = response.rows.length;
                    pnNormCount = response.rows.item(0).normPncount;

                });
            });
            
            var query3 = "select count(norm_id) as normCncount from mxpg_cn_map where category_id in (select category_id from mxpg_category where category_type in (0,2)) and channel_id = "+ channelId;
            db.transaction(function(tx){
                tx.executeSql(query3, [], function(tx, response){
                    var rows = response.rows;
                    var len = response.rows.length;
                    cnNormCount = response.rows.item(0).normCncount;
                    totalNormCount = pnNormCount + cnNormCount;
                    var query4 = "select count(brand_id) as sgfCmpCount from mxpg_comp_sgf where store_id = "+ auditId;
                    db.transaction(function(tx){
                        tx.executeSql(query4, [], function(tx, response){
                            var rows = response.rows;
                            var len = response.rows.length;
                            sgfCompCount = response.rows.item(0).sgfCmpCount;
                            var query5 = " select count(brand_id) as sgfCount from mxpg_sgf where store_id = "+ auditId;
                            db.transaction(function(tx){
                                tx.executeSql(query5, [], function(tx, response){
                                    var rows = response.rows;
                                    var len = response.rows.length;
                                    sgfCount = response.rows.item(0).sgfCount;

                                    var query6 = "select count(distinct(category_id)) as promoCount from mxpg_comp_products where store_id ="+auditId +" and category_id in (select category_id from mxpg_category where category_name like '%promo%')";
                                    db.transaction(function(tx){
                                        tx.executeSql(query6, [], function(tx, response){
                                            var rows = response.rows;
                                            var len = response.rows.length;
                                            promoCount = response.rows.item(0).promoCount;

                                        var query7 = "select count(distinct(category_id)) as promoCompCount from mxpg_cc_map where channel_id = "+ channelId +" and category_id in (select category_id from mxpg_category where category_name like '%promo%')";
                                        db.transaction(function(tx){
                                            tx.executeSql(query7, [], function(tx, response){
                                                var rows = response.rows;
                                                var len = response.rows.length;
                                                promoCompCount = response.rows.item(0).promoCompCount;

                                    
                                                if(compNormCount == totalNormCount && sgfCount ==  sgfCompCount && promoCount == promoCompCount) {
                                                    success(true);
                                                }else {
                                                    success(false);
                                                }

                                            });

                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });

        });

    });
});
}