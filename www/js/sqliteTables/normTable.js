/*************************** Create All Enterprise Table in DB if not exist*****************************************/

function createNorm(tx, success, error) {
    var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_norm(norm_id TEXT, norm_name TEXT, option_id TEXT, remark_id TEXT, field_type TEXT, multiple_photo BOOLEAN, photo_required BOOLEAN)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX allNormIndex ON mxpg_norm(norm_id, option_id, remark_id)";
    tx.executeSql(createIndex);
    
}

function createOption(tx, success, error) {
    var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_option(option_id TEXT, option_name TEXT)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX allOptionIndex ON mxpg_option(option_id)";
    tx.executeSql(createIndex);
}

function createRemark(tx, success, error) {
    var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_remark(remark_id TEXT, remark_name TEXT)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX allRemarkIndex ON mxpg_remark(remark_id)";
    tx.executeSql(createIndex);
}

/**
 * This method Insert or Replace the record in the All Store table in SQLite DB.
 * @param  {object} db
 * @param  {json} store
 * @param  {function} callback function
 */

function populateNormTable(db, norms, success, error) {
    db.transaction(function(tx){
        for(var i = 0; i < norms.length; i++){
            var norm = norms[i];
            tx.executeSql('INSERT OR replace INTO mxpg_norm(norm_id, norm_name, option_id, remark_id, field_type, multiple_photo, photo_required) VALUES (?,?,?,?,?,?,?);',
                [norm.normId, norm.normName, norm.optionId, norm.remarkId, norm.normType, norm.multiplePhoto, norm.photoRequired]
            , success, error);
        }
    });
}

/**
 * This method Insert or Replace the record in the All Store table in SQLite DB.
 * @param  {object} db
 * @param  {json} store
 * @param  {function} callback function
 */

function populateOptionTable(db, options, success, error) {
    db.transaction(function(tx){
        for(var i = 0; i < options.length; i++){
            var option = options[i];
            tx.executeSql('INSERT OR replace INTO mxpg_option(option_id, option_name) VALUES (?,?);',
                [option.id, option.name]
            , success, error);
        }
    });
}

/**
 * This method Insert or Replace the record in the All Store table in SQLite DB.
 * @param  {object} db
 * @param  {json} store
 * @param  {function} callback function
 */

function populateRemarkTable(db, remarks, success, error) {
    db.transaction(function(tx){
        for(var i = 0; i < remarks.length; i++){
            var remark = remarks[i];
            tx.executeSql('INSERT OR replace INTO mxpg_remark(remark_id, remark_name) VALUES (?,?);',
                [remark.id, remark.name]
            , success, error);
        }
       
    });
}

/**
 * This method Select the record from the All Store table in SQLite DB.
 * @param  {object} db
 * @param  {json} store
 */

function selectNorms(db, channelId, productId, priority, isFrontage, fn, isCategoryNorm, brandwiseNorm, categoryId, alreadyAudited, sgf, storeId) {
    
    if(brandwiseNorm) {

         var query = "select t1.norm_id, t1.store_score, t1.norm_order,\
                t1.product_id, t1.qr_flag, t2.norm_name, t2.field_type, t2.multiple_photo, t2.photo_required, t3.option_id,\
                t3.option_name, t4.remark_id, t4.remark_name, t5.product_name, t7.category_type\
                from mxpg_pn_map t1\
                JOIN mxpg_norm t2\
                JOIN mxpg_option t3\
                JOIN mxpg_remark t4\
                JOIN mxpg_product t5\
                JOIN mxpg_category t7\
                where t1.category_id=" + categoryId + 
                " and t1.product_id = " + productId + 
                " and t1.channel_id = " + channelId +
                " and t1.norm_id = t2.norm_id and t2.option_id = t3.option_id\
                and t2.remark_id = t4.remark_id and t1.product_id = t5.product_id\
                and  t1.norm_id = t2.norm_id and  t7.category_id = t1.category_id\
                group by t1.product_id, t1.norm_id, t2.option_id, t2.remark_id order by t1.product_id, t1.norm_order ASC";
    
    }else if(isCategoryNorm && !alreadyAudited) {

        // First time category norm fetch

        var query = "select t1.norm_id, t1.store_score, t1.norm_order,\
                t1.product_id, t1.qr_flag, t2.norm_name, t2.field_type, t3.option_id,\
                t3.option_name, t4.remark_id, t4.remark_name, t5.product_name\
                from mxpg_pn_map t1\
                JOIN mxpg_norm t2\
                JOIN mxpg_option t3\
                JOIN mxpg_remark t4\
                JOIN mxpg_product t5\
                where t1.category_id=" + categoryId + 
                " and t5.category_id = " + categoryId + 
                " and t1.channel_id = " + channelId +
                " and t1.norm_id = t2.norm_id and t2.option_id = t3.option_id\
                and t2.remark_id = t4.remark_id and t1.product_id = t5.product_id\
                and  t1.norm_id = t2.norm_id\
                group by t1.product_id, t1.norm_id, t2.option_id, t2.remark_id order by t5.brand_order, t1.norm_order ASC";

    }else if(!isCategoryNorm && !alreadyAudited) {

        // First time norm fetch without category

        query = "select t1.norm_id,  t1.norm_order, t1.category_id,\
                    t2.norm_name, t2.field_type,\
                    t3.option_id, t3.option_name,\
                    t4.remark_id, t4.remark_name,\
                    t5.category_name from mxpg_cn_map t1\
                    JOIN mxpg_norm t2 JOIN mxpg_option t3\
                    JOIN mxpg_remark t4 JOIN mxpg_category t5\
                    where t1.category_id= " + categoryId +
                    " and t1.channel_id = " + channelId +
                    " and t1.norm_id = t2.norm_id and\
                    t2.option_id = t3.option_id and\
                    t2.remark_id = t4.remark_id and\
                    t1.category_id = t5.category_id and\
                    t1.norm_id = t2.norm_id\
                    order by t1.norm_order ASC"
    
    }else if(isCategoryNorm && alreadyAudited) {

        // Fetching already audited norm with category

        query = "select t1.norm_id,  t1.norm_order, t1.category_id,\
                t2.norm_name, t2.field_type,\
                t3.option_id, t3.option_name,\
                t4.remark_id, t4.remark_name,\
                t5.category_name, t6.option_name as givenValue,\
                t6.remark_id as givenRemark, t6.percentage  from mxpg_cn_map t1\
                JOIN mxpg_norm t2 JOIN mxpg_option t3\
                JOIN mxpg_remark t4 JOIN mxpg_category t5\
                JOIN mxpg_comp_products t6\
                where t1.category_id= " + categoryId +
                " and t1.channel_id = " + channelId +
                " and t6.product_id = 0 and\
                t1.norm_id = t2.norm_id and\
                t2.option_id = t3.option_id and\
                t2.remark_id = t4.remark_id and\
                t1.category_id = t5.category_id and\
                t1.norm_id = t2.norm_id and\
                t1.category_id = t6.category_id and\
                t6.norm_id = t1.norm_id\
                and t6.store_id = " + storeId + "\
                order by t1.norm_order ASC"
    
    }else if(!isCategoryNorm && alreadyAudited) {

        // Fetching already audited norm without category

        query = "select t1.category_id, t1.norm_id, t1.store_score, t1.norm_order,\
            t1.product_id, t1.qr_flag,  t2.norm_name, t2.field_type, t3.option_id,\
            t3.option_name, t4.remark_id, t4.remark_name, t5.product_name ,\
            t6.option_name as givenValue, t6.percentage from mxpg_pn_map t1\
            JOIN mxpg_norm t2\
            JOIN mxpg_option t3\
            JOIN mxpg_remark t4\
            JOIN mxpg_product t5\
            JOIN mxpg_comp_products t6\
            where t1.category_id=" + categoryId + "   and t5.category_id = " + categoryId + "\
            and t6.category_id  =" + categoryId +
            " and t1.channel_id = " + channelId +
            " and t1.norm_id = t2.norm_id\
            and t2.option_id = t3.option_id and t2.remark_id = t4.remark_id\
            and t1.product_id = t5.product_id\
            and t1.norm_id = t2.norm_id\
            and t6.product_id = t1.product_id\
            and t6.norm_id = t1.norm_id\
            and t6.store_id = " + storeId + "\
            group by t1.category_id, t1.product_id, t1.norm_id,\
            t2.option_id, t2.remark_id, t6.option_name\
            order by t5.brand_order, t1.norm_order ASC "

    }else if(sgf) {

       query = "select t1.norm_id,  t1.norm_order, t1.category_id,\
            t2.norm_name, t2.field_type,\
            t3.option_id, t3.option_name,\
            t4.remark_id, t4.remark_name,\
            t5.category_name, t6.option_name as givenValue,\
            t6.remark_id as givenRemark, t6.percentage  from mxpg_cn_map t1\
            JOIN mxpg_norm t2 JOIN mxpg_option t3\
            JOIN mxpg_remark t4 JOIN mxpg_category t5\
            JOIN mxpg_comp_products t6\
            where t1.category_id= " + categoryId +
            " and t1.channel_id = " + channelId +
            " and t6.product_id = 0 and\
            t1.norm_id = t2.norm_id and\
            t2.option_id = t3.option_id and\
            t2.remark_id = t4.remark_id and\
            t1.category_id = t5.category_id and\
            t1.norm_id = t2.norm_id and\
            t1.category_id = t6.category_id and\
            t6.norm_id = t1.norm_id\
            and t6.store_id = " + storeId + "\
            order by t1.norm_order ASC"
    }
    

    processNormMap(db, query, channelId, productId, priority, isFrontage, fn, -1, storeId);
   
}

function selectSmarsportNorms(db, channelId, productId, priority, isFrontage, fn, isCategoryNorm, brandwiseNorm, categoryId, alreadyAudited, sgf, storeId) {

     var smartSpotCategory= 27;

     var categorySmartSpotbrand = "select product_id from mxpg_csb_map where category_id =  " + categoryId +" order by product_id ASC ";


       db.transaction(function(tx){
             tx.executeSql(categorySmartSpotbrand , [], function(tx, response) {
                   var results = [];

                   var len = response.rows.length;
                   for(var i = 0; i < len; i++) {
                      var row = response.rows.item(i);

                      var productId = row.product_id;


                      var query = "select t1.norm_id, t1.store_score, t1.norm_order, t1.isConsider,\
                                          t1.product_id, t1.qr_flag, t2.norm_name, t2.field_type, t2.multiple_photo, t2.photo_required, t3.option_id,\
                                          t3.option_name, t4.remark_id, t4.remark_name, t5.product_name, t7.category_type \
                                          from mxpg_pn_map t1\
                                          JOIN mxpg_norm t2\
                                          JOIN mxpg_option t3\
                                          JOIN mxpg_remark t4\
                                          JOIN mxpg_product t5\
                                          JOIN mxpg_category t7\
                                          where t1.category_id= 27 and\
                                          t1.channel_id = " + channelId + "\
                                          and t1.norm_id = t2.norm_id and t2.option_id = t3.option_id\
                                          and t2.remark_id = t4.remark_id and t1.product_id = t5.product_id\
                                          and  t1.norm_id = t2.norm_id and  t7.category_id = t1.category_id\
                                          and t1.product_id = " + productId + "\
                                          group by t1.product_id, t1.norm_id, t2.option_id, t2.remark_id order by t1.product_id, t1.norm_order ASC";

                      processNormMap(db, query, channelId, productId, priority, isFrontage, fn, smartSpotCategory, storeId);

                   }
             });
       });
}

function completedSmartSpotNorms(db, channelId, productId, priority, isFrontage, fn, isCategoryNorm, brandwiseNorm, categoryId, alreadyAudited, sgf, storeId) {

    var smartSpotCategory= 27;
    var productId = "-1";

    var categorySmartSpotbrand = "select product_id from mxpg_csb_map where category_id =  " + categoryId + " order by product_id ASC ";


    db.transaction(function(tx){
         tx.executeSql(categorySmartSpotbrand , [], function(tx, response) {
               var results = [];
               var len = response.rows.length;
               for(var i = 0; i < len; i++) {
                  var row = response.rows.item(i);

                  var productId = row.product_id;


                   var query = "select t1.norm_id, t1.store_score, t1.norm_order, t1.product_id, t1.qr_flag, t1.isConsider, t2.norm_name, t2.field_type, t3.option_id, t3.option_name,\
                                t4.remark_id, t4.remark_name, t5.product_name, t7.category_type, t2.multiple_photo, t2.photo_required \
                                from mxpg_pn_map t1\
                                JOIN mxpg_norm t2\
                                JOIN mxpg_option t3\
                                JOIN mxpg_remark t4\
                                JOIN mxpg_product t5\
                                JOIN mxpg_comp_products t6\
                                JOIN mxpg_category t7\
                                where t1.category_id= 27 and t5.category_id = 27 and t6.category_id = 27 and t1.channel_id =  " + channelId + " and\
                                t1.norm_id = t2.norm_id and\
                                t2.option_id = t3.option_id and\
                                t2.remark_id = t4.remark_id and\
                                t1.product_id = t5.product_id and\
                                t1.norm_id = t2.norm_id and\
                                t6.store_id = " + storeId + " and\
                                t7.category_id = t1.category_id and t1.product_id in ("+ productId +") group by t1.product_id,\
                                t1.norm_id, t2.option_id, t2.remark_id order by t1.product_id, t1.norm_order ASC";

                   processNormMap(db, query, channelId, productId, priority, isFrontage, fn, smartSpotCategory, storeId);

               }

         });
    });
}


function processNormMap(db, query, channelId, productId, priority, isFrontage, fn, smartSpotCategory, storeId) {

     db.transaction(function(tx){
        tx.executeSql(query , [], function(tx, response) {

            if(!productId) {
               productId = -1;
            }

            var qrCodeQuery = "select qr_code from mxpg_qr_map where store_id =  " + storeId +" and product_id = " + productId;

            tx.executeSql(qrCodeQuery , [], function(tx, qrResponse) {
                var qrCode = "";
                if(qrResponse.rows.length != 0) {
                    qrCode = qrResponse.rows.item(0).qr_code || "";
                }

                var results = [];
                var isCSmartSpot = false;
                var isConsider;
                var isConsider;
                var prevProdName;
                var len = response.rows.length;
                var iscategorySmartSpot;

                var index = 1;

                var firstItem = 0;
                if(len > 0)
                    var firstProductId = response.rows.item(firstItem).product_id || null;

                var lastItem = len-1;
                if(len > 0)
                    var lastProductId =  response.rows.item(lastItem).product_id || null;
                if(smartSpotCategory == 27) {
                    isCSmartSpot = true;
                }

                var tempProd = "-1";

                for(var i = 0; i < len; i++){
                    var row = response.rows.item(i);
                    var resLen = results.length;

                    var temp = {};


                    if(isCSmartSpot) {

                        if(i == 0) {
                            tempProd = row.product_id;
                        }else  if(tempProd != row.product_id ) {
                            results[resLen-1].camera = true;
                            tempProd = row.product_id;
                        }
                    }


                    //temp.question = index + ". " + row.norm_name;
                    temp.question = row.norm_name;
                    temp.normName = row.norm_name;
                    temp.normId = row.norm_id;
                    temp.iscategorySmartSpot = isCSmartSpot;
                    temp.isCategoryNorm = true;
                    temp.multiplePhoto = (row.multiple_photo == "true") ? true:false;
                    temp.photoRequired = (row.photo_required == "true") ? true:false;
                    if(row.product_id) {
                        temp.productId = row.product_id;
                        temp.isCategoryNorm = false;
                    }
                    temp.qrFlag = row.qr_flag == "true" ? true:false;
                    temp.previousQRcode = qrCode;

                    temp.percentage = row.percentage;

                   /* if(isCSmartSpot) {
                        var tempProdId = row.product_id;
                        if(row.product_id == tempProdId){

                        }
                    }*/

                     temp.isConsider = row.isConsider == "true" ? true:false;
                     isConsider = row.isConsider == "true" ? true:false;
                    temp.show1 = "block";
                    temp.show2 = "none";
                    temp.options = [];
                    temp.yes = [];
                    temp.no = [];
                    if(row.field_type == inswit.FIELD_TYPES.INT) {
                        temp.textBox = true;
                        temp.typeINT = true;
                        temp.options.push({"optionName":row.givenValue, "optionId":row.option_id});
                    }else if(row.field_type == inswit.FIELD_TYPES.TEXT) {
                        temp.textBox = true;
                        temp.typeTEXT = true;
                        temp.options.push({"optionName":row.givenValue, "optionId":row.option_id});
                    }else if(row.field_type == inswit.FIELD_TYPES.OPTION) {
                        temp.optionType = true;
                    }

                    if(!prevProdName) {
                        prevProdName = row.product_name || row.channel_name || row.category_name;
                        temp.product_name = row.product_name || row.channel_name || row.category_name;
                    }else if(prevProdName != (row.product_name || row.channel_name || row.category_name)){
                        prevProdName = row.product_name;
                        temp.product_name = row.product_name;
                    }

                    if(lastProductId && lastProductId == row.product_id && row.category_type != 2 && row.category_type != 4){
                        temp.others = true;
                        temp.normQType = getNormQuestionType(temp.normId);
                    }else {
                        temp.normQType = getNormQuestionType(temp.normId);
                    }

                    if(firstProductId && firstProductId == row.product_id && row.category_type != 2 && row.category_type != 4){
                        temp.total = true;
                        temp.normQType = getNormQuestionType(temp.normId);
                    }

                    var optionName = row.option_name.toLowerCase().trim();
                    if(optionName == "yes"){
                        temp.options.push({"optionName":row.option_name, "optionId":row.option_id});
                        temp.yes.push({"remarkName":row.remark_name, "remarkId":row.remark_id});
                    }else if(optionName == "no"){
                        temp.options.push({"optionName":row.option_name, "optionId":row.option_id});
                        if(row.remark_id == 44){
                            if(priority == 8 || priority == 10){
                                temp.no.push({"remarkName":row.remark_name, "remarkId":row.remark_id});
                            }
                        }else if(row.remark_id == 50){
                            if(priority == 6 && isFrontage == "false"){
                                temp.no.push({"remarkName":row.remark_name, "remarkId":row.remark_id});
                            }
                        }else{
                           temp.no.push({"remarkName":row.remark_name, "remarkId":row.remark_id});
                        }
                    }


                    if(i == len - 1){
                        results.push(temp);
                        break;
                    }

                    for(var j = i+1; j < len; j++){

                        var nextRow = response.rows.item(j);
                        if(row.norm_id == nextRow.norm_id){
                            var nextOptionName = nextRow.option_name.toLowerCase().trim();

                            if(nextOptionName == "yes"){
                                for(var k = 0; k < temp.options.length; k++){
                                    if(temp.options[k].optionName && temp.options[k].optionName.toLowerCase().trim() == "yes"){
                                        break;
                                    }

                                    if(k == temp.options.length - 1){
                                        temp.options.push({"optionName":nextRow.option_name, "optionId":nextRow.option_id});
                                        break;
                                    }
                                }

                                temp.yes.push({"remarkName":nextRow.remark_name, "remarkId":nextRow.remark_id});
                            }else if(nextOptionName == "no"){
                                for(var k = 0; k < temp.options.length; k++){
                                    if(temp.options[k].optionName && temp.options[k].optionName.toLowerCase().trim() == "no"){
                                        break;
                                    }

                                    if(k == temp.options.length - 1){
                                        temp.options.push({"optionName":nextRow.option_name, "optionId":nextRow.option_id});
                                        break;
                                    }
                                }

                                if(nextRow.remark_id == 44){
                                    if(priority == 8 || priority == 10){
                                        temp.no.push({"remarkName":nextRow.remark_name, "remarkId":nextRow.remark_id});
                                    }
                                }else if(nextRow.remark_id == 50){
                                    if(priority == 6 && isFrontage == "false"){
                                        temp.no.push({"remarkName":nextRow.remark_name, "remarkId":nextRow.remark_id});
                                    }
                                }else{
                                   temp.no.push({"remarkName":nextRow.remark_name, "remarkId":nextRow.remark_id});
                                }
                            }
                        }else{
                            results.push(temp);
                            i = j-1;
                            break;
                        }

                        if(j == len-1){
                            results.push(temp);
                            i = j;
                            break;
                        }
                    }

                    index++;
                }
                if(isCSmartSpot && i == len ){
                    results[results.length-1].camera = true;
                  /*  var prod = temp.productId;
                    var tempJson = {};
                    tempJson[prod] = results;*/
                   // results = {temp.productId: results};
                }

                 if(isConsider && i == len){
                    results[results.length-1].disableSelect = true;
                 }

                if(results.length) {
                    results[results.length-1].showImage = true;
                }
                fn(results);
            });
        });
    });
}

function getNormQuestionType(normId) {
    switch(normId){
        case "126":
            return "sos"
        break;
        case "127":
            return "sku"
        break;
    }
}
