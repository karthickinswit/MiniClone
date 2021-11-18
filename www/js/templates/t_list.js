define([],function(){
    var templates = {};

    templates.category =  '<div class="audit_header">\
                       <!-- <div class="back">\
                            <img src="images/matrix_icons/back_arrow_red_72.png" class="ico_36">\
                        </div>-->\
                        <div class="left_content">\
                            <div class="center_content bold font_18 ellipsis width_80p">{{name}}</div>\
                        </div>\
                    </div>\
                    <div id="wrapper_products" class="scroll_parent products_list">\
                        <div class="scroll_ele">\
                            <ul class="products list-group">\
                                {{#categories}}\
                                    <a class="list-group-item product" href=\
                                    {{#defaultSpot}}"#audits/{{mId}}/category/{{category_id}}"{{/defaultSpot}}\
                                     rel={{category_name}} id={{category_id}}>\
                                        <span id={{category_id}}>\
                                           {{#done}}\
                                                <img src="images/matrix_icons/audit_completed_48.png" style="display:inline-block" class="ico_24">\
                                            {{/done}}\
                                            {{^done}}\
                                                <img src="images/matrix_icons/audit_completed_48.png" style="display:none" class="ico_24">\
                                            {{/done}}\
                                        {{category_name}} </span>\
                                        <img src="images/matrix_icons/small_arrow_blue_48.png" class="ico_16 arrow_left">\
                                    </a>\
                                {{/categories}}\
                            </ul>\
                           <!-- <button class="audit-btn go_next btn btn-success" disabled="disabled" href={{mId}}>Complete Audit</button> -->\
                            <button href="{{mId}}" class="audit-btn btn btn-success go_next proceed_holistic_screen" disabled="disabled" >Proceed</button>\
                        </div>\
                    </div>';

     templates.brand =  '<div class="audit_header">\
                        <div class="back">\
                            <img src="images/matrix_icons/back_arrow_red_72.png" class="ico_36">\
                        </div>\
                       <div class="left_content">\
                            <div class="center_content bold font_18  ellipsis width_80p">{{name}}</div>\
                            <div class="sub_header_name">{{categoryName}}</div>\
                        </div>\
                    </div>\
                    <div id="wrapper_products" class="scroll_parent products_list">\
                        <div class="scroll_ele">\
                            <ul class="products list-group">\
                                {{#brands}}\
                                    <a class="list-group-item product" href=\
                                    {{^sgf}}"#audits/{{mId}}/products/{{product_id}}/category/{{category_id}}/brandNorms/true/cId/{{cId}}"{{/sgf}}\
                                    {{#sgf}}"#audits/{{mId}}/category/{{category_id}}/brand/{{brand_id}}/sgfNorms"{{/sgf}}\
                                     rel={{product_name}} id={{product_id}}>\
                                        <span id={{product_id}}>\
                                        {{#done}}\
                                            <img src="images/matrix_icons/audit_completed_48.png" style="display:inline-block" class="ico_24">\
                                        {{/done}}\
                                        {{^done}}\
                                            <img src="images/matrix_icons/audit_completed_48.png" style="display:none" class="ico_24">\
                                        {{/done}}\
                                        {{product_name}} </span>\
                                        <img src="images/matrix_icons/small_arrow_blue_48.png" class="ico_16 arrow_left">\
                                    </a>\
                                {{/brands}}\
                            </ul>\
                        </div>\
                    </div>'

    templates.categoryOption =  '<div class="audit_header">\
                        <div class="back">\
                            <img src="images/matrix_icons/back_arrow_red_72.png" class="ico_36">\
                        </div>\
                        <div class="left_content">\
                            <div class="center_content bold font_18 ellipsis width_80p">{{name}}</div>\
                        </div>\
                    </div>\
                    <div id="wrapper_products" class="scroll_parent products_list">\
                        <div class="scroll_ele">\
                            <div class="product_header"><h2 class="font_16" >Category</h2></div>\
                            <div class="question">\
                                <select class="category_option" type="select">\
                                    <option>select</option>\
                                    {{#categories}}\
                                        <option value={{category_id}} id={{category_id}} {{selected}}>{{category_name}}</option>\
                                    {{/categories}}\
                                </select>\
                            </div>\
                            <div class="product_header brand_header"><h2 class="font_16" >Brand</h2></div>\
                            <div class="brand_option"></div>\
                            <div class="product_header SOD_header"><h2 class="font_16" >SOD</h2></div>\
                            <div class="SOD"></div>\
                              <a class="save_sod_audit btn btn-danger"  style="display:none;">Save Audit</a></td>\
                        </div>\
                    </div>';

    templates.brandOption = '<div class="question">\
                                <select class="brand_select" type="select">\
                                    <option>select</option>\
                                    {{#brands}}\
                                        <option value={{product_name}} id={{product_id}} {{selected}}>{{product_name}}</option>\
                                    {{/brands}}\
                                </select>\
                            </div>'

    templates.SOD = '<table class="table table-striped table-hover table-users">\
                <thead>\
                    <tr>\
                        <th class="hidden-phone">Type of SOD</th>\
                        <th>Item Count</th>\
                    </tr>\
                </thead>\
                <tbody>\
                    <tr>\
                    {{#tos}}\
                        <tr class="sod_row">\
                            <td id={{id}} class="sod_name">{{name}}</td>\
                            <td class="item_count">{{value}}</td>\
                            <td><button class="btn-mini btn-success add_item">\
                            +</button></td>\
                            <td><button class="btn-mini btn-warning remove_item">\
                            -</button></td>\
                        </tr>\
                    {{/tos}}\
                    </tr>\
                   </tbody>\
            </table>'

    return templates;
});