
/*
  File: custom-widget-autobind.js
  Created: June 19, 2019
  By: Matthew Denninghoff
  Description:
  Global methods that can be used with custom widgets so that bound input properties 
  are automatically submitted in responses to the server.
  
  Widgets are drag-and-drop capable in Visual Designer and their fields can be
  bound without needing to code the "onsubmit" event on any record formats.
  
  Limitations:
    Profound UI Grids do not support custom widgets with bound fields.
    Profound UI API methods do not support custom widgets.
 
  License: MIT License

  Copyright (c) 2019 Profound Logic Software, Inc.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

// To avoid interfering with other global properties, keep our custom code in a uniquely named object.
if (typeof puicustom != "object" || puicustom === null) puicustom = {};

/**
 * This function is called before any response is sent from any screen. It can be used to add values
 * from custom widgets to the response. (pui.beforeRespond has been available since V5 FP9.1)
 * This function avoids the necessity of coding "onsubmit" for each record format.
 * Expect custom widgets to implement a pui.addResponse method on their main DIV.
 * @param {Object} response      (Output) Response values that will be submitted.
 * @returns {undefined}  No return value is required, in which case "response" is submitted in the calling
 *                       function. If the function were to return an object, that object would be what is submitted.
 */
pui.beforeRespond = function(response){
  // Find all Custom Widget elements with the attribute, puicustom, set. Add their bound values to the response.
  var widgets = document.querySelectorAll("div[puicustom]");
  widgets.forEach(function(el){
    
    // A custom value getter must be defined, and input properties must be listed on the element.
    if ( typeof el.pui.getCustomPropValue == "function" && el.pui.inputPropNames instanceof Array ){
    
      el.pui.inputPropNames.forEach( function(propName){

        var propConfig = el.pui.boundProps[ propName ];
        if (propConfig != null){
          try {
            var propVal = el.pui.getCustomPropValue( propName );
            puicustom.setBoundValue(response, el, propConfig, propVal);
          }
          catch (exc) {
            console.log("Failed to get bound value for property, %s, in a custom widget.", propName );
          }
        }
      });
    }
  });
};


/**
 * This function will determine if a given pui element object is an element on a grid
 * This is essential to determine how a response field name should be formatted
 * @param {Object} element     Profound UI element object
 * @returns {Boolean}   true if the element is part of a grid, false otherwise
 */
puicustom.isElementOnGrid = function( element ) {
  if ( element.pui != null && element.pui.formatName != null ) {
    var formatName = element.pui.formatName;
    // Start at the top layer and work down
    for (let i = pui.layers.length - 1; i >= 0; i-- ) {
      var layer = pui.layers[i];
      if (layer != null && layer.formats instanceof Array ) {
        // Look at each record format, top to bottom
        for (let j = layer.formats.length - 1; j >= 0; j--) {
          var format = layer.formats[j];
          if (format != null && format.subfiles != null && format.subfiles[formatName] != null ) {
            return true;
          }
        }
      }
    }
  }
  return false;
};


/**
 * Add an attribute to a custom widget's DOM element and add bound property info
 * that is needed for automatically building the response to the server.
 * This should only be called when the "field type" property is being set.
 * @param {Object} parms      Property-setter parameters.
 * @param {Array|undefined|Null} inputPropNames    A list of strings with property names that support bound input.
 */
puicustom.initWidget = function(parms, inputPropNames){
  parms.dom.setAttribute("puicustom", "true");

  if (!parms.design){
    parms.dom.pui.boundProps = puicustom.getBoundProperties( parms );
    parms.dom.pui.inputPropNames = inputPropNames;
  }
};

/**
 * Get any bound field properties for a specified widget. Profound UI doesn't pass bound field
 * information to property setters, and Profound's render code doesn't detect bindings on custom 
 * widgets. Thus, the binding info must be manually extracted so that responses can use them.
 * @param {Object} parms   Profound UI Property-setter parameters.
 * @returns {Object}    Returns an empty object or an object with property-value pairs for
 *                      the matching widget that has bound properties.
 */
puicustom.getBoundProperties = function(parms){
  var id = parms.evalProperty("id");
  var formatName = parms.dom.pui.formatName;
  var fieldType = parms.value;
  
  var props = {};
  // Look from the top layer to the bottom layer.
  for (var i=pui.layers.length - 1; i >= 0 ; i--){
    var layer = pui.layers[i];
    if (layer != null && layer.formats instanceof Array){
      
      // Look at each record format, top to bottom.
      for (var j=layer.formats.length - 1; j >= 0 ; j--){
        var format = layer.formats[j];

        // Look in this format if its name matches the argument (and it's a valid object).
        if ( format != null && format.metaData != null && format.metaData.items instanceof Array ) {
          var continueCheck = false;
          var idCheck = id;
          if ( format.name == formatName ) {
            // Standard format
            continueCheck = true;
          } else if ( format.subfiles != null && format.subfiles[formatName] != null ) {
            // Grid format
            continueCheck = true;
            var idArray = id.split(".");
            idCheck = idArray[0];
          }
          if ( continueCheck ) {
            // Look for an item matching the arguments.
            for (var k=0; k < format.metaData.items.length; k++){
              var item = format.metaData.items[k];
              if ( item != null && item["field type"] == fieldType && item.id == idCheck){
                // Collect any the bound properties on the matching widget.
                for (var propName in item){
                  if (item[propName] != null && typeof item[propName].fieldName == "string"){
                    props[propName] = item[propName];
                  }
                }
                return props;
              }
            }
          }
        }
      }
    }
  }
  return props;
};


/**
 * Set a value on the response object with the form, "FORMATNAME.FIELDNAME": "value".
 * CAUTION: Formatting is basic and has not been thoroughly tested.
 * @param {Object} response       (Output) Key-value pairs to be submitted to the server.
 * @param {Object} element        The Profound UI element object
 * @param {Object} propConfig     The Profound UI field binding information.
 * @param {Number|String|Null|undefined} value   Value to be formatted and submitted.
 */
puicustom.setBoundValue = function(response, element, propConfig, value){

  var formatName = element.pui.formatName;

  // Format the field name based on the format
  // If the field is on a grid, the name must be formatted differently
  var field = "";
  if ( puicustom.isElementOnGrid(element) ) {
    var elementID = element.pui.properties.id;
    var elementIDArray = elementID.split(".");
    var elementRow = elementIDArray[elementIDArray.length - 1];
    field = formatName.toUpperCase() + "." + propConfig.fieldName.toUpperCase() + "." + elementRow;
  } else {
    field = formatName.toUpperCase() + "." + propConfig.fieldName.toUpperCase();
  }
  
  // Values should be formatted according to their binding to avoid server-side errors.
  switch (propConfig.dataType){
    case "zoned":
      value = parseInt(value,10);
      if (isNaN(value)){
        value = 0;
      }
      break;
      
    case "char":
      // Hard-coded formatting. This should be improved.
      if (value instanceof Date){
        value = value.format("Y-m-d");
      }
      else if (typeof value != "string" && typeof value != "number"){
        value = "";
      }
      break;
      
    case "date":
      if (typeof propConfig.dateFormat == "string"){
        if (typeof value == "undefined"){
          value = "";
        }
        else if (! (value instanceof Date)){
          value = new Date(value);
        }
        
        if (value instanceof Date){
          if (isNaN(value.getYear())){
            value = "";
          }
          else {
            value = value.format(propConfig.dateFormat);
          }
        }
      }
      else {
        console.log("Date dataType had no format and was not included in the response." );
        return;
      }
      break;
      
    //
    // Add support for other data types here...
    //
    
    default:
      // If support for a type is not defined, then ommit it from the response.
      console.log("Binding custom widgets and %s dataType is not implemented yet. Omitted from response.", propConfig.dataType);
      return;
  }
  value = String(value);

  if (value != propConfig.value){   //Only set the response if the value changed.
    response[field] = value;
  }
};


