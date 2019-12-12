/****************************************************************************************************************
 * 
 * indeterminateccheckbox.js
 * 
 * Author: Nick Deppe
 * Date: 12/3/2019
 * 
 * Custom widget that creates a checkbox that allows 
 * an indeterminate state
 * 
 * Please refer to article "Profound Pro Tip: Painlessly Passing Custom Widget Input Data to the Server"
 * on how this custom widget sets a return value back to the RPG program
 * Article is found at https://blog.profoundlogic.com/passing-custom-widget-input-data-to-server
 * For this widget to work, file custom-widget-autobind.js will need to be in the custom js directory
 * 
 * 
 * Modifications:
 * 
 * 
 * 
 * 
 * 
 ***************************************************************************************************************/


puicustom.indeterminatecheckbox = function(parms) {

    var StateValue = {
        "UNCHECKED": "0", 
        "INDETERMINATE": "1",
        "CHECKED": "2"
    };

    switch( parms.propertyName ) {

        case "field type":
            if (parms.design) {

                // This is required to allow for custom widget auto bind functionality
                // The code for puicustom.initWidget should be in the user custom js directory on the server
                puicustom.initWidget(parms);

                var thisID = parms.evalProperty("id");

                // design mode content creation code goes here
                var wrapper = document.createElement("span");
                var checkbox = document.createElement("input");

                checkbox.type = "checkbox";
                checkbox.id = thisID + '_checkbox';
                wrapper.appendChild(checkbox);

                if ( parms.properties['label'] ) {
                    var label = document.createElement("label");
                    label.id = thisID + '_label';
                    label.htmlFor = checkbox.id;
                    label.appendChild(document.createTextNode("Checkbox"));
                    wrapper.appendChild(label);
                }

                parms.dom.appendChild(wrapper);
                parms.dom.style.overflow = "hidden";

            } else {

                puicustom.initWidget( parms, ["value"]);

                // runtime content creation code goes here
                // clear
                parms.dom.innerHTML = "";

                var handleIndeterminateCheckboxClick = function(obj, id, event) {
                    var state = obj.getAttribute('data-checkstate');
                    if ( state == null ) {
                        if ( obj.checked == false && obj.indeterminate == false ) {
                            state = StateValue.UNCHECKED;
                        } else if ( obj.checked == false && obj.indeterminate == true ) {
                            state = StateValue.INDETERMINATE;
                        } else {
                            state = StateValue.CHECKED;
                        }
                    } else {
                        var checkedValue       = parms.properties['checked value'];
                        var indeterminateValue = parms.properties['indeterminate value'];
                        var uncheckedValue     = parms.properties['unchecked value'];
                        switch(state) {
                            case StateValue.UNCHECKED:
                                // Current state = unchecked
                                // Only set the state to indeterminate if the property has been set
                                // Otherwise, set the state to checked
                                var allowIndeterminate = parms.properties['allow indeterminate state'];
                                if ( indeterminateValue != null && ( allowIndeterminate == true || allowIndeterminate == "true" ) ) {
                                    state = StateValue.INDETERMINATE;
                                    obj.checked = false;
                                    obj.indeterminate = true;
                                    obj.setAttribute("value", indeterminateValue);
                                    applyProperty(id, "value", indeterminateValue)
                                } else {
                                    state = StateValue.CHECKED;
                                    obj.checked = true;
                                    obj.indeterminate = false;
                                    obj.setAttribute("value", checkedValue);
                                    applyProperty(id, "value", checkedValue)
                                }
                                break;
                            case StateValue.INDETERMINATE:
                                // Current state = indeterminate
                                // Set the state to checked
                                state = StateValue.CHECKED;
                                obj.checked = true;
                                obj.indeterminate = false;
                                obj.setAttribute("value", checkedValue);
                                applyProperty(id, "value", checkedValue)
                                break;
                            case StateValue.CHECKED:
                                // Current state = checked
                                // Set the state to unchecked
                                state = StateValue.UNCHECKED;
                                obj.checked = false;
                                obj.indeterminate = false;
                                obj.setAttribute("value", uncheckedValue);
                                applyProperty(id, "value", uncheckedValue)
                                break;
                            default:
                                state = StateValue.UNCHECKED;
                                break;
                        }
                        obj.setAttribute("data-checkstate", state);
                    }
                }

                var wrapper = document.createElement("span");
                var checkbox = document.createElement("input");

                var thisID = parms.evalProperty("id");

                checkbox.type = "checkbox";
                checkbox.id = thisID + '_checkbox';
                checkbox.setAttribute("data-checkstate", 0);
                checkbox.checked = false;
                checkbox.addEventListener("click", function(e){ handleIndeterminateCheckboxClick( this, thisID, e ) }, false);

                wrapper.appendChild(checkbox);

                var labelText = parms.properties['label'];
                if ( labelText ) {
                    var label = document.createElement("label");
                    label.id = thisID + '_label';
                    label.htmlFor = checkbox.id;
                    label.appendChild(document.createTextNode(parms.properties['label']));
                    wrapper.appendChild(label);
                }

                parms.dom.appendChild(wrapper);
                parms.dom.style.overflow = "hidden";

                // initialize the state of the checkbox
                checkbox.value         = parms.evalProperty("value");
                var checkValue         = parms.evalProperty("value");
                var valueChecked       = parms.properties['checked value'];
                var valueIndeterminate = parms.properties['indeterminate value'];
                var valueUnchecked     = parms.properties['unchecked value'];
                switch (checkValue) {
                    case valueChecked:
                        checkbox.checked = true;
                        checkbox.indeterminate = false;
                        checkbox.setAttribute("data-checkstate", StateValue.CHECKED);
                    break;
                    case valueIndeterminate:
                        checkbox.checked = false;
                        checkbox.indeterminate = true;
                        checkbox.setAttribute("data-checkstate", StateValue.INDETERMINATE);
                    break;
                    case valueUnchecked:
                    default:
                        checkbox.checked = false;
                        checkbox.indeterminate = false;
                        checkbox.setAttribute("data-checkstate", StateValue.UNCHECKED);
                    break;
                }

                parms.dom.pui.getCustomPropValue = puicustom.indeterminatecheckbox.getPropValue.bind(parms.dom);

            }
        break;

        case "width":
            parms.dom.firstChild.style.width = parms.value;
        break;

        case "height":
            parms.dom.firstChild.style.height = parms.value;
        break;

        case "value":
            var element = document.getElementById(parms.properties["id"] + "_checkbox");
            if ( element ) {
                var checkedValue = parms.evalProperty("checked value");
                var uncheckedValue = parms.evalProperty("unchecked value");
                var indeterminateValue = parms.evalProperty("indeterminate value");
                switch (parms.value) {
                    case checkedValue:
                        element.checked = true;
                        element.indeterminate = false;
                        break;
                    case uncheckedValue:
                        element.checked = false;
                        element.indeterminate = false;                        
                        break;
                    case indeterminateValue:
                        element.checked = false;
                        element.indeterminate = true;
                        break;
                    default:
                        element.checked = true;
                        element.indeterminate = false;
                        break;    
                }
            }    
        break;

        case "label":
            var label = document.getElementById(parms.properties["id"] + "_label");
            if ( label == null ) {
                var label = document.createElement("label");
                label.id = parms.properties['id'] + '_label';
                label.htmlFor = parms.properties['id'] + '_checkbox';
                parms.dom.appendChild(label);
            }
            label.innerText = parms.value;
        break;

        case "disabled":
            var checkbox = document.getElementById(parms.properties["id"] + "_checkbox");
            if ( checkbox ) {
                if ( String(parms.value) == "true" || String(parms.value) == "disabled" ) {
                    checkbox.disabled = true;
                } else {
                    checkbox.disabled = false;
                }
            }
        break;

    }

};



puicustom.indeterminatecheckbox.getPropValue = function(propName) {
    var inputE1 = this.querySelector("input");
    if (inputE1) {
        if (propName == "value"){
            return inputE1.value;
        }
    }
}



// Add the base widget
pui.widgets.add({
    // widget name - this is placed into the standard "field type" property
    name: "indeterminate checkbox",
   
    // the default id prefix - used to assign id's when the element is first created
    newId: "IndeterminateCheckbox",
   
    // pull-down menu name
    menuName: "Indeterminate Checkbox",
   
    // default properties for the widget
    defaults: {
    },
   
    // property setter functions
    propertySetters: {
        "field type": puicustom.indeterminatecheckbox,
        "width": puicustom.indeterminatecheckbox,
        "height": puicustom.indeterminatecheckbox,
        "value": puicustom.indeterminatecheckbox,
        "label": puicustom.indeterminatecheckbox,
        "disabled": puicustom.indeterminatecheckbox
    }
   
  });
   
    // here, we can add additional custom properties
    pui.addCustomProperty({
        // property name
        name: "allow indeterminate state",
    
        // optional type of input
        // "long" specifies that the text can be long, and an exta text area prompt box is added
        // other types include: "color", "boolean", "image", "list", "js", "file", and "field"
        type: "list",

        choices: [true, false],
    
        // help text appears at the bottom of the properties window
        help: "If set to true, the checkbox will cycle through unchecked, to indeterminate, to checked",
    
        // array of widget elements that this property is applicable to
        controls: ["indeterminate checkbox"],
    
        // properties are categorized in the properties window
        // if the specified category doesn't already exist, it will be created
        category: "Field Settings"
    });


    pui.addCustomProperty({
        // property name
        name: "checked value",
    
        // optional type of input
        // "long" specifies that the text can be long, and an exta text area prompt box is added
        // other types include: "color", "boolean", "image", "list", "js", "file", and "field"
        type: "long",
    
        // help text appears at the bottom of the properties window
        help: "Specifies the value to return if the checkbox is checked",
    
        // array of widget elements that this property is applicable to
        controls: ["indeterminate checkbox"],
    
        // properties are categorized in the properties window
        // if the specified category doesn't already exist, it will be created
        category: "Field Settings"
    });

    pui.addCustomProperty({
        // property name
        name: "unchecked value",
    
        // optional type of input
        // "long" specifies that the text can be long, and an exta text area prompt box is added
        // other types include: "color", "boolean", "image", "list", "js", "file", and "field"
        type: "long",
    
        // help text appears at the bottom of the properties window
        help: "Specifies the value to return if the checkbox is unchecked",
    
        // array of widget elements that this property is applicable to
        controls: ["indeterminate checkbox"],
    
        // properties are categorized in the properties window
        // if the specified category doesn't already exist, it will be created
        category: "Field Settings"
    });


    pui.addCustomProperty({
        // property name
        name: "indeterminate value",
    
        // optional type of input
        // "long" specifies that the text can be long, and an exta text area prompt box is added
        // other types include: "color", "boolean", "image", "list", "js", "file", and "field"
        type: "long",
    
        // help text appears at the bottom of the properties window
        help: "Specifies the value to return if the checkbox is in an indeterminate state",
    
        // array of widget elements that this property is applicable to
        controls: ["indeterminate checkbox"],
    
        // properties are categorized in the properties window
        // if the specified category doesn't already exist, it will be created
        category: "Field Settings"
    });


    pui.addCustomProperty({
        // property name
        name: "label",
    
        // optional type of input
        // "long" specifies that the text can be long, and an exta text area prompt box is added
        // other types include: "color", "boolean", "image", "list", "js", "file", and "field"
        type: "long",
    
        // help text appears at the bottom of the properties window
        help: "Specifies the label for the checkbox",
    
        // array of widget elements that this property is applicable to
        controls: ["indeterminate checkbox"],
    
        // properties are categorized in the properties window
        // if the specified category doesn't already exist, it will be created
        category: "Field Settings"
    });



    // Now, we add an entry to the left-hand side Widgets Toolbox
    // More than one entry can be added for the same base widget - this would makes sense if we vary default properties
    pui.toolbox.add({
        // specifies category - this can be an existing category or a new one
        // if the category does not exist, it is created on the fly
        category: "Custom Widgets",
    
        widget: "indeterminate checkbox",
        text: "Indeterminate Checkbox",
        icon: "/profoundui/proddata/images/icons/checkbox.png",
    
        // this determines the look of the drag/drop proxy as we drag the widget element off the toolbox
        proxyHeight: 25,
        proxyWidth: 25,
        proxyHTML: '<div><input type="checkbox" checked="checked"><label>Checkbox</label></div>',
    
    
        // additional default property values can be specified here
        defaults: {
            "label": "Checkbox",
            "allow indeterminate state": true
        }
    
    });
    
