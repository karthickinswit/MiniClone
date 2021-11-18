function createSODTable(tx, success, error) {
    var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_sod(sod_id TEXT, sod_name TEXT)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX cnSodIndex ON mxpg_sod(sod_id)";
    tx.executeSql(createIndex);
}

function populateSODTable(db, sodOptions, success, error) {
    db.transaction(function(tx){
        for(var i = 0; i < sodOptions.length; i++){
            var option = sodOptions[i];

            tx.executeSql('INSERT OR replace INTO mxpg_sod(sod_id, sod_name) VALUES (?,?);',
            [option.sodId, option.sodName], success, error);
        }
    });
}

function createSODProductTable(tx, success, error) {
	var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_comp_sod(audit_id TEXT, store_id TEXT, category_id TEXT, brand_id TEXT, sod_id TEXT, count TEXT)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX cnCompSodIndex ON mxpg_comp_sod(audit_id, store_id, category_id, brand_id, sod_id )";
    tx.executeSql(createIndex);
}

function populateCompSodTable(db, data, success, error){

	 db.transaction(function(tx){
	 	for(var i = 0; i < data.length; i++){

            var option = data[i];
	        tx.executeSql('INSERT OR replace INTO mxpg_comp_sod(audit_id, store_id, category_id, brand_id, sod_id, count) VALUES (?,?,?,?,?,?);',
	        [option.audit_id, option.store_id, option.category_id, option.brand_id, option.sod_id, option.count], success, error);
    	}
    });
}

function selectCompSodTable(db, categoryId, brandId, auditId, storeId, callback) {
	var query = "select t1.sod_id, t1.count, t2.sod_name from mxpg_comp_sod t1  join mxpg_sod  t2 where t1.audit_id='" + auditId + "' AND t1.store_id='" + storeId +
					"' AND t1.brand_id='"+ brandId + "' AND t1.category_id='"+ categoryId + "'" + " AND t2.sod_id = t1.sod_id" ;
    
    db.transaction(function(tx){
        tx.executeSql(query , [], function(tx, response) {
            var results = [];
            var len = response.rows.length;
            if(len == 0){
            	selectSOD(callback);
            }

            for(var i = 0; i < len; i++){
                var obj = response.rows.item(i);
                results.push(obj);
            }
            
            callback(results);
        });
    });
}

function selectSOD(callback) {
	var query = "select * from mxpg_sod";

	db.transaction(function(tx){
        tx.executeSql(query , [], function(tx, response) {
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

