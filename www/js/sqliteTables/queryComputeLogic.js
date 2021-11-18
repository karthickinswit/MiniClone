function selectComputeLogic(db, storeId, callback) {
	var query = "select t2.product_id,t2.category_id, t2.norm_id, t2.percentage, t3.product_name, t2.option_id\
	  from mxpg_pn_map t1 join mxpg_comp_products t2 join mxpg_product t3 where t2.store_id = '" + storeId + "'\
	   and t1.company = 'P&G' and t2.norm_id in (126, 127, 114, 122) and t1.product_id not in (102, 113) and t1.category_id = t2.category_id\
	     and t2.product_id = t1.product_id and t3.product_id = t1.product_id group by t2.product_id,\
	     t2.norm_id order by t3.product_name";

	var results = [];

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


function selectBrandToDisplay(db, callback) {
    var query = "select t1.category_id, t1.product_id from mxpg_csb_map t1 join mxpg_category t2 where t2.category_id = t1.category_id and t2.category_type in (0, 2)"

    var results = [];

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


function selectCategory(db, callback) {
    var query = "select category_id from mxpg_category where category_type = 0 order by category_id"

    var results = [];

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
