
function createMPDTable (tx, success, error) {
    const createStatement = " CREATE TABLE IF NOT EXISTS mxpg_mpd(store_id TEXT, category_id TEXT, brand_id TEXT, norm_id TEXT, image_uri TEXT, image_id TEXT, position INTEGER)";
    tx.executeSql(createStatement, [], success, error);
    // return new Promise((resolve, reject) => {
    //     tx.executeSql(createStatement, [], () => {
    //         resolve();
    //     }, (err, info) => { 
    //         reject(info)
    //     });
    // })
    var createIndex = "CREATE UNIQUE INDEX mxpg_mpd_index ON mxpg_mpd(store_id, category_id, brand_id, norm_id, image_uri, position)";
    tx.executeSql(createIndex);
}
function createCatImageTable (tx, success, error) {
    var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_cat_mpd(store_id TEXT, category_id TEXT, brand_id TEXT, audit_id TEXT, image_uri TEXT, image_id TEXT, position INTEGER)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX mxpg_cat_mpd_index ON mxpg_cat_mpd(store_id, category_id, brand_id, audit_id, image_uri, position)";
    tx.executeSql(createIndex);
}


function populateMPDTable(db, product) {
     db.transaction(function(tx){
        var storeId = product.storeId;
        var categoryId = product.categoryId;
        var brandId = product.brandId;
        var normId = product.normId;
        var imageUrl = product.image;
        var position = product.imgPos;
        var productName = product.productName;

         tx.executeSql('INSERT OR replace INTO mxpg_mpd(store_id, category_id, brand_id, norm_id, image_uri, position) VALUES (?,?,?,?,?,?);',
                [storeId, categoryId, brandId, normId, imageUrl, position]);
     });

}
function populateCatImageTable(db, product) {
    db.transaction(function(tx){
       var storeId = product.storeId;
       var categoryId = product.categoryId;
       var brandId = product.categoryType;
       var auditId = product.auditId;
       var imageUrl = product.image;
       var position = product.imgPos;
       var productName = product.productName;

        tx.executeSql('INSERT OR replace INTO mxpg_cat_mpd(store_id, category_id, brand_id, audit_id, image_uri, position) VALUES (?,?,?,?,?,?);',
               [storeId, categoryId, brandId, auditId, imageUrl, position]);
    });

}

function cleanMPDTable(db, product, fn) {
     db.transaction(function(tx){
            var storeId = product.storeId;
            var categoryId = product.categoryId;
            var brandId = product.brandId;
            var normId = product.normId;

            tx.executeSql('DELETE FROM mxpg_mpd WHERE store_id=? AND category_id=? AND norm_id=? AND brand_id=?;', [storeId, categoryId, normId, brandId], function(){
                fn();
            });
     });
}
function cleanCatImageTable(db, product, fn) {
    db.transaction(function(tx){
           var storeId = product.storeId;
           var categoryId = product.categoryId;
           
           var auditId = product.auditId;

           tx.executeSql('DELETE FROM mxpg_cat_mpd WHERE store_id=? AND audit_id=?  AND category_id=?;', [storeId, auditId,categoryId], function(){
               fn();
           });
    });
}


function selectMPDAuditPhotos(db, normId, categoryId, storeId,brandId, pos, fn ) {

    var query = "select DISTINCT image_uri, position from mxpg_mpd where norm_id='" + normId + "' AND category_id='" + categoryId + "' AND store_id='" + storeId +"' AND brand_id='"+brandId+"'";

    db.transaction(function(tx){
        tx.executeSql(query , [], function(tx, response) {
            var results = [];
            var len = response.rows.length;

            for(var i = 0; i < len; i++){
                var obj = response.rows.item(i);
                results.push(obj);
            }

            fn(pos, results);
        });
    });
}
function selectCatImagePhotos(db,categoryId, auditId, storeId, fn ) {

    var query = "select DISTINCT image_uri, position from mxpg_cat_mpd where category_id='" + categoryId + "' AND audit_id='" + auditId + "' AND store_id='" + storeId +"'";

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

function removeMPDImageURI(db, image_uri) {
    db.transaction(function(tx){
        tx.executeSql('DELETE FROM mxpg_mpd WHERE image_uri=?;', [image_uri]);
    });
}

function selectMPDDetails(db, fn){

    var query = "select * from mxpg_mpd";


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
function selectCatImageDetails(db, fn){

    var query = "select * from mxpg_cat_mpd";


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


function selectCompMPDDetails(db, storeId, fn) {
    var query = "select * from mxpg_mpd where store_id='" + storeId +"'";


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
function selectCompCatMPDDetails(db, storeId, fn) {
    var query = "select * from mxpg_cat_mpd where store_id='" + storeId +"'";


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


function removeMPDPhoto(db, storeId, brandId, normId, imageId) {
}


/**
 * This method Select store image for store id where audit is partial in SQLite DB.
 * @param  {object} db
 * @param  {json} storeId
 * @param  {callback} fn
 */


function getMPDImage(db, storeId, fn) {
    var query = "select image_uri from mxpg_mpd where store_id=?"
    db.transaction(function(tx){
        tx.executeSql(query , [storeId], function(tx, response) {
            var length = response.rows.length;
            if(length > 0) {
                var obj = response.rows.item(0);
                fn(obj);
            }
        });
    });
}