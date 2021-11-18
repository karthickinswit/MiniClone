function createCategoryChannelMap (tx, success, error) {
	var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_cc_map(channel_id TEXT, category_id TEXT)";
    tx.executeSql(createStatement, [], success, error);
/*    var createIndex = "CREATE UNIQUE INDEX ccMapIndex ON mxpg_cc_map(category_id)";
    tx.executeSql(createIndex);
*/}

function populateCategoryChannel(db, ccMap, callback, error) {
	db.transaction(function(tx){
		for(var i = 0; i < ccMap.length; i++){
			var channelCategory = ccMap[i];
		    tx.executeSql('INSERT OR replace INTO mxpg_cc_map(channel_id, category_id) VALUES (?,?);',
		        [channelCategory.channelId, channelCategory.categoryId]
		    , callback, error);
		}
	});
}