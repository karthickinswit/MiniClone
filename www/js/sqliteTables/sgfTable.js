function createSGFBrand (tx, success, error) {
	var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_sgf_brand(id TEXT, name TEXT)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX sgfBrandMapIndex ON mxpg_sgf_brand(id)";
    tx.executeSql(createIndex);
}

function populateSgfBrandTable(db, sgBrands, callback, error) {
    db.transaction(function(tx){
        for(var i = 0; i < sgBrands.length; i++){
            var sgfBrand = sgBrands[i];
            tx.executeSql('INSERT OR replace INTO mxpg_sgf_brand(id, name) VALUES (?,?);',
                [sgfBrand.id, sgfBrand.name]
            , callback, error);
        }
    });
}

function createSGFTable (tx, success, error) {
	var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_sgf(store_id TEXT, brand_id TEXT, norm_id, norm_order)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX sgfMapIndex ON mxpg_sgf(store_id, brand_id, norm_id)";
    tx.executeSql(createIndex);
}

function createSGFCompTable(tx, success, error) {
 	var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_comp_sgf(store_id TEXT, brand_id TEXT, saved_brand TEXT, product_id TEXT, product_name TEXT, category_id TEXT, norm_id TEXT, norm_name TEXT, option_id TEXT, option_name TEXT, remark_id TEXT, remark_name TEXT, image TEXT, image_uri TEXT, audit_id TEXT, store_score BOOLEAN, priority NUMBER, image_id TEXT, is_sos TEXT)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX compSGFIndex ON mxpg_comp_sgf(audit_id, store_id, brand_id, product_id, category_id, norm_id)";
    tx.executeSql(createIndex);
}
//mxpg_csb_map

function populateSgfTable(db, sgfNMap, callback, error) {
    db.transaction(function(tx){
        for(var i = 0; i < sgfNMap.length; i++){
            var sgfNormMap = sgfNMap[i];
            tx.executeSql('INSERT OR replace INTO mxpg_sgf(store_id, brand_id, norm_id, norm_order) VALUES (?,?,?,?);',
                [sgfNormMap.storeId, sgfNormMap.brandId, sgfNormMap.normId, sgfNormMap.normOrder]
            , callback, error);
        }
    });
}


function fetchSgfBrands(db, storeId, fn) {
    var query = "select t1.brand_id,  t2.product_name  from mxpg_sgf t1  join mxpg_product t2  where store_id = "+ storeId + " and t2.product_id=t1.brand_id group by brand_id";
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

function fetchSgfNorms(productId, fn, er) {
	var query = "select norm_id from mxpg_sgf where product_id = "+ productId;
	db.transaction(function(tx){
        tx.executeSql(query , [], function(tx, response) {
            var results = [];
            var len = response.rows.length;

            for(var i = 0; i < len; i++){
                var obj = response.rows.item(i);
                results.push(obj);
            }
            fn({"norms":results});
        }, er);
    });
}


/**
 * This method Insert or Replace the record from Completed SGF table of SQLite DB.
 * @param  {object} db
 * @param  {json} store
 * @param  {function} callback function
 */

function populateCompSgfTable(db, product, callback) {
    var obj = "";

    var storeId = product.storeId;
    var auditId = product.auditId;
    var storeName = product.storeName;
    var image = product.image;
    var imageId = product.imageId;
    var imageURI = product.imageURI;
    var priority = product.priority;
    var cId = product.cId;
    var isSOS = product.isSOS;
    var brandId = product.brandId;
    var savedBrand = product.savedBrand;


    var length = product.norms.length;
    db.transaction(function(tx){
        for(var i = 0; i < length; i++){
            var norm = product.norms[i];
            norm.isConsider == "true" ? true : false;

            tx.executeSql('INSERT OR replace INTO  mxpg_comp_sgf(store_id, brand_id, product_id,\
             product_name, norm_id, norm_name, option_id, option_name, remark_id, remark_name, image,\
              image_uri, audit_id, store_score, priority, image_id, category_id, is_sos, saved_brand)\
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);',
                [storeId, brandId, norm.productId, norm.productName, norm.normId, norm.normName, norm.optionId, norm.optionName, norm.remarkId, norm.remarkName, image, imageURI, auditId, norm.isConsider, priority, imageId, cId, isSOS, savedBrand]);

            if(i+1 == length){
                callback();
            }
        }
    });
}


/**
 * This method Select all the record from SGF compProductTable
 * @param  {object} db
 * @param  {json} store
 */

function selectSGFProductsToVerify(db, auditId, storeId, productId, fn, channelId, brandId) {

    var query = "select saved_brand as savedBrand, brand_id as brandId, store_id as storeId,\
     product_id as productId, product_name as productName,\
      norm_id as normId, norm_name  as normName, option_id  as optionId,\
       option_name as optionName, remark_id as remarkId,\
        remark_name as remarkName, image, image_uri as imageURI,\
         audit_id as auditId, store_score as isConsider,\
          priority from mxpg_comp_sgf where audit_id =" + auditId +
          " and brand_id ="+ brandId;

    if(storeId){
        query += " AND store_id='" + storeId + "'"+ "AND category_id='" + channelId +"'";
    }
    
    if(productId){
        query += " AND product_id='" + productId + "' AND is_sos = 1";
    }

    query += " ORDER BY priority ASC";
    
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


function compledSgfBrands(db, auditId, storeId, fn) {

    var query = "select DISTINCT brand_id from mxpg_comp_sgf where audit_id='" + auditId + "' AND store_id= '" + storeId + "'";


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


function checkSgfAvailable(db, storeId, fn) {
    var query = "select count(norm_id) as count from mxpg_sgf where store_id = "+ storeId;
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


function checkSgfSavedBrands(db, storeId, brandId, savedBrand, fn) {
    var query = "select count(brand_id) as brandSavedCount from mxpg_comp_sgf where store_id = "+ storeId+" and saved_brand = "+ savedBrand +" and brand_id != "+ brandId +" group by brand_id";
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