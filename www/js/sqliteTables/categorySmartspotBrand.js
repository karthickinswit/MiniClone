function createCategorySmartSpotBrandMap(tx, success, error) {
    var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_csb_map(category_id TEXT, product_id TEXT)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX csbMapIndex ON mxpg_csb_map(category_id, product_id)";
    tx.executeSql(createIndex);
}

function populateCsbMap(db, results, success, error) {
    db.transaction(function(tx){
        for(var i = 0; i < results.length; i++){
            var data = results[i];
            tx.executeSql('INSERT OR replace INTO mxpg_csb_map(category_id, product_id) VALUES (?,?);',
                [data.categoryId, data.productId]
            , success, error);
        }
    });
}

/*
select t1.norm_id, t1.store_score, t1.norm_order,
                t1.product_id,  t2.norm_name, t2.field_type, t3.option_id,
                                t3.option_name, t4.remark_id, t4.remark_name, t5.product_name, t7.category_type
                                               from mxpg_pn_map t1
                                                               JOIN mxpg_norm t2
                                                                              JOIN mxpg_option t3
                                                                                            JOIN mxpg_remark t4
                                                                                                          JOIN mxpg_product t5
                                                                                                                       JOIN mxpg_category t7
                                                                                                                                  where t1.category_id=27 and t1.channel_id = 18 and t1.norm_id = t2.norm_id and t2.option_id = t3.option_id                and t2.remark_id = t4.remark_id and t1.product_id = t5.product_id                and  t1.norm_id = t2.norm_id and  t7.category_id = t1.category_id  and t1.product_id in (select product_id from mxpg_csb_map where category_id = 17)             group by t1.product_id, t1.norm_id, t2.option_id, t2.remark_id order by t1.product_id, t1.norm_order ASC
*/

