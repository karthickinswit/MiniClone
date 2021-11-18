function createErrorLogTable(tx, success, error){
    var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_error_log(store_id TEXT, audit_id TEXT, error TEXT)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX mxpgErrorLogIndex ON mxpg_error_log(audit_id, store_id)";
    tx.executeSql(createIndex);
}

function populateErrorLogTable(db, auditId, storeId, error, success, errCallback) {
    db.transaction(function(tx){
            tx.executeSql('INSERT OR replace INTO mxpg_error_log(audit_id, store_id, error) VALUES (?,?,?);',
            [auditId, storeId, error], success, errCallback);
    });
}

function removeErrorLog(db, auditId, storeId) {
    db.transaction(function(tx){
        tx.executeSql('DELETE FROM mxpg_error_log WHERE store_id=? AND audit_id=?;', [storeId, auditId]);
    });
}

function getErrorLog(db, fn) {
    var query = "select * from mxpg_error_log";
    db.transaction(function(tx){
        tx.executeSql(query, [], function(tx,response) {
            fn(response.rows);
        }, function(tx,error){
            console.log(error);
        });
    });
}