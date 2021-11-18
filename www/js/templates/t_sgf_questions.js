define([],function(){
    var template =  '<div class="norm_header audit_header">\
                        <div class="back">\
                            <img src="images/matrix_icons/back_arrow_red_72.png" class="ico_36">\
                        </div>\
                        <div class="left_content">\
                            <div class="center_content bold font_18  ellipsis width_80p">{{name}}</div>\
                            <div class="sub_header_name">{{categoryName}}</div>\
                        </div>\
                    </div>\
                    <div class="scroll_parent question_list" id="wrapper_norms">\
                        <div class="norms scroll_ele" href={{priority}} rel={{takePhoto}}>\
                            <div class="sgf sgf_{{brandName}}">\
                                {{#brandName}}\
                                    <div class="category_header product_header"><h2 class="font_16" id={{productId}}>{{brandName}}</h2></div>\
                                {{/brandName}}\
                                {{#brands}}\
                                    <div class="brands">\
                                        <span class="product_name field_type" id="000-{{productId}}-{{product_name}}">Select Brand</span>\
                                        <select class="brand_select" type="select">\
                                            <option>select</option>\
                                            {{#brands}}\
                                                <option value="{{name}}" id="{{id}}" {{selected}}>{{name}}</option>\
                                            {{/brands}}\
                                        </select>\
                                    </div>\
                                {{/brands}}\
                                {{#norms}}\
                                    {{#isCategoryNorm}}\
                                        {{#textBox}}\
                                            <div class="question" rel={{isConsider}}>\
                                                <span class="product_name width_60p field_type " id="{{normId}}-0-0" rel="{{normName}}">{{question}}</span>\
                                                <div class="field_intent">\
                                                    <input min="0" id={{#options}}{{optionId}}{{/options}} value="{{#options}}{{optionName}}{{/options}}" class="field_value float-left"  type="{{#typeINT}}number{{/typeINT}}{{#typeTEXT}}text{{/typeTEXT}}" name="lname">\
                                                    </br>\
                                                </div>\
                                                <div class="error_message">*Field is required</div>\
                                            </div>\
                                        {{/textBox}}\
                                        {{^textBox}}\
                                            <div class="question" rel={{isConsider}} >\
                                                    <span class="product_name field_type" id="{{normId}}-{{productId}}-{{product_name}}" rel="{{normName}}">{{question}}</span>\
                                                        <select  {{#isFrontage}} id="frontage_applicable"  {{/isFrontage}}  class="option" style="margin-bottom:10px" type="select">\
                                                            <option>select</option>\
                                                            {{#options}}\
                                                                <option id={{optionId}} {{selected}}>{{optionName}}</option>\
                                                            {{/options}}\
                                                        </select>\
                                                    <div class="remarks_1" style="display:{{show1}}">\
                                                        <select class="audit_yes" type="select">\
                                                            <option>select</option>\
                                                            {{#yes}}\
                                                                <option value={{remarkId}} id={{remarkId}} {{selected}}>{{remarkName}}</option>\
                                                            {{/yes}}\
                                                        </select>\
                                                    </div>\
                                                    <div class="remarks_2" style="display:{{show2}}">\
                                                        <select class="audit_no" type="select">\
                                                            <option>select</option>\
                                                            {{#no}}\
                                                                <option value={{remarkId}} id={{remarkId}} {{selected}}>{{remarkName}}</option>\
                                                            {{/no}}\
                                                        </select>\
                                                    </div>\
                                                </div>\
                                        {{/textBox}}\
                                    {{/isCategoryNorm}}\
                                {{/norms}}\
                                <div class="photos">\
                                    {{#takePhoto}}\
                                        <button class="btn take_product_photo">\
                                            <img class="ico_16" src="images/matrix_icons/take_photo_48.png">\
                                            <i class="icon_photo"></i> Take Brand Photo\
                                        </button>\
                                    {{/takePhoto}}\
                                    <div class="photo_block">\
                                        {{#imageURI}}\
                                            <img src="{{imageURI}}" width="95%" height="200px" style="margin-left:2.5%">\
                                            <a class="retake_photo {{element}}">Retake</a>\
                                        {{/imageURI}}\
                                    </div>\
                                </div>\
                            </div>\
                            <button href={{mId}} class="product_done btn btn-success">Done</button>\
                        </div>\
                    </div>';

    return template;
});