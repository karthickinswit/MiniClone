function createQrCodePnMap(tx) {
    var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_qr_map(store_id TEXT, product_id TEXT, qr_code TEXT)";
    tx.executeSql(createStatement);
    try {
         var createIndex = "CREATE UNIQUE INDEX qrMapIndex ON mxpg_qr_map(store_id, product_id)";
         tx.executeSql(createIndex);
    }catch(err) {
        console.log(err);
    }

}

function populateQrCodePnMap(db, audits) {
    db.transaction(function(tx){
        for(var i = 0; i < audits.length; i++){
            var audit = audits[i];

            tx.executeSql('INSERT OR replace INTO mxpg_qr_map(store_id, product_id, qr_code) VALUES (?,?,?);',
                [audit.storeId, audit.brandId, audit.qrcode]
            );
         }
    });
}

function findQrCodeAvailable(db, storeId, productId, fn) {
    var query = "select qr_code from mxpg_qr_map where product_id='" + productId + "' AND store_id= '" + storeId +"';"
    db.transaction(function(tx){
            tx.executeSql(query , [], function(tx, response) {
                  if(response.rows && response.rows.length > 0){
                        var obj = response.rows.item(0);
                        fn(obj);
                  }
            });
        });
}

//INSERT INTO mxpg_qr_map VALUES ("215099", 91, "https://www.youtube.com")