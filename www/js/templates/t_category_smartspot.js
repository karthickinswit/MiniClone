define([],function(){
    var template = {};

    template.smartSpot =  '<div class="smartSpot smartspotbrand_{{productId}}">\
                        {{#norms}}\
                            {{#iscategorySmartSpot}}\
                                {{#product_name}}\
                                    <div class="smartspot_header product_header"><h2 class="font_16" id={{productId}}>{{product_name}}</h2></div>\
                                {{/product_name}}\
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
                                            <select id="frontage_applicable" {{#disableSelect}}disabled{{/disableSelect}} class="option" style="margin-bottom:10px" type="select">\
                                                <option>select</option>\
                                                {{#options}}\
                                                    <option id={{optionId}} {{selected}}>{{optionName}}</option>\
                                                {{/options}}\
                                            </select>\
                                        <div class="remarks_1" style="display:{{show1}}">\
                                            <select class="audit_yes" type="select" {{#disableSelect}}disabled{{/disableSelect}}>\
                                                <option>select</option>\
                                                {{#yes}}\
                                                    <option value={{remarkId}} id={{remarkId}} {{selected}}>{{remarkName}}</option>\
                                                {{/yes}}\
                                            </select>\
                                        </div>\
                                        <div class="remarks_2" style="display:{{show2}}" >\
                                            <select class="audit_no" type="select" {{#disableSelect}}disabled{{/disableSelect}}>\
                                                <option>select</option>\
                                                {{#no}}\
                                                    <option value={{remarkId}} id={{remarkId}} {{selected}}>{{remarkName}}</option>\
                                                {{/no}}\
                                            </select>\
                                        </div>\
                                        {{#multiplePhoto}}\
                                            {{>multiplePhotoRows}}\
                                        {{/multiplePhoto}}\
                                    </div>\
                                {{/textBox}}\
                                {{#camera}}\
                                    {{#takePhoto}}\
                                    <div class="photo_block {{^multiplePhoto}}single_photo{{/multiplePhoto}}">\
                                        <button class="btn take_product_photo {{productId}}" id={{productId}}>\
                                            <img class="ico_16" src="images/matrix_icons/take_photo_48.png">\
                                            <i class="icon_photo"></i> Take Brand Photo\
                                        </button>\
                                    </div>\
                                    {{/takePhoto}}\
                                    <div class="photo_block {{productId}} {{^multiplePhoto}}single_photo{{/multiplePhoto}}" id="{{productId}}">\
                                        {{#imageURI}}\
                                            <img src="{{imageURI}}" width="95%" height="200px" style="margin-left:2.5%">\
                                            <a class="retake_photo {{element}}">Retake</a>\
                                        {{/imageURI}}\
                                    </div>\
                                {{/camera}}\
                                {{#camera}}\
                                    {{#qrFlag}}\
                                        <div class="qr_scan_block">\
                                            <input type="text" id="{{previousQRcode}}" class="qrcode_text" value="{{qrCode}}" disabled ></input>\
                                            <button class="btn btn-small scan_qr">Scan QR</button>\
                                        </div>\
                                    {{/qrFlag}}\
                                {{/camera}}\
                            {{/iscategorySmartSpot}}\
                        {{/norms}}\
                        <!--<button href={{mId}} class="product_done btn btn-success">Done</button>-->\
                       </div>';

     template.multiplePhotoRows = '<table class="table gillette_table hide" id="{{normId}}-{{productId}}" >\
                                       <tbody class="gillette_table_body">\
                                           {{#photoRequired}}\
                                              {{#auditImages}}\
                                                   <tr class="gillette_table_row">\
                                                      <td>\
                                                           {{#multiplePhoto}}\
                                                               <div class="pull-right">\
                                                                       <button class="btn-mini btn-warning hide remove_item">\
                                                                       X</button>\
                                                               </div>\
                                                           {{/multiplePhoto}}\
                                                            {{#photoRequired}}\
                                                                 <!--<span class="photo_block_container  {{#multiplePhoto}}multiple_photo{{/multiplePhoto}} {{^multiplePhoto}}single_photo{{/multiplePhoto}} ">\
                                                                      <button class="pull-left btn take_product_photo {{#multiplePhoto}} gillette_store_photo {{/multiplePhoto}}\">\
                                                                           <img class="ico_16" src="images/matrix_icons/take_photo_48.png">\
                                                                           Take Brand Photo\
                                                                      </button>\
                                                                 </span>-->\
                                                                <div class="photo_block_container {{#multiplePhoto}}multiple_photo{{/multiplePhoto}} {{^multiplePhoto}}single_photo{{/multiplePhoto}}" >\
                                                                   <img src="{{image_uri}}"  {{#multiplePhoto}} width="95%"  {{/multiplePhoto}} {{^multiplePhoto}} width="95%" {{/multiplePhoto}} height="200px" style="margin-left:2.5%">\
                                                                   <a class="retake_photo {{element}}">Retake</a>\
                                                                </div>\
                                                            {{/photoRequired}}\
                                                      </td>\
                                                    </tr>\
                                              {{/auditImages}}\
                                           {{/photoRequired}}\
                                           {{^auditImages}}\
                                               <tr class="gillette_table_row hide">\
                                                   <td>\
                                                       {{#multiplePhoto}}\
                                                            <div class="pull-right">\
                                                                  <button class="btn-mini btn-warning hide remove_item">\
                                                                   X</button>\
                                                             </div>\
                                                       {{/multiplePhoto}}\
                                                       {{#photoRequired}}\
                                                         <div class="photo_block_container  {{#multiplePhoto}}multiple_photo{{/multiplePhoto}} {{^multiplePhoto}}single_photo{{/multiplePhoto}} ">\
                                                              <button class="pull-left btn take_product_photo {{#multiplePhoto}} gillette_store_photo {{/multiplePhoto}}\">\
                                                                   <img class="ico_16" src="images/matrix_icons/take_photo_48.png">\
                                                                   Take Brand Photo\
                                                              </button>\
                                                         </div>\
                                                       {{/photoRequired}}\
                                                   </td>\
                                               </tr>\
                                           {{/auditImages}}\
                                       </tbody>\
                                   </table>\
                                   {{#multiplePhoto}}\
                                    {{^hideMultiplePhotos}}\
                                         <span class="add_product_photo hide">\
                                            <button class="btn-mini btn-success add_item">\
                                            +</button>\
                                         </span>\
                                    {{/hideMultiplePhotos}}\
                                  {{/multiplePhoto}}';


    return template;
});