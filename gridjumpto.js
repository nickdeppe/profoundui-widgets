/* ****************************************************************
**	widget: Grid Jumpto
**
**		Provides functionality to quickly jump to positions in a 
**		grid object based on the first character of
**		the specified field.
**
**		Written by: Nick Deppe (nick.deppe@victaulic.com)
**		Date:       07/03/2015
**		
**		
**		Modifications:
**		
**		
**		
**		
**		
**
**************************************************************** */


/*-----------------------------------------------------------------
**
**	Usage: 
**	
**	1)	Set the list of characters in the value field.  By default,
**		this field is set to ABCDEFGHIJKLMNOPQRSTUVWXYZ.  You can
**		add numbers or special characters.
**		
**	2)	Set the DescriptionText property.  This will set the text
**		that appears at the beginning of the object.  By default,
**		this is set to "Jump To: ".
**		
**	3)	Set the FieldName property.  This is the name of the RPG 
**		field within the grid that will used to jump to.  If this 
**		property is not specified, then the widget will not work.
**		
**	4)	Set the GridName property.  This is the object ID of the 
**		grid that will be controlled.  By default, this is set to
**		Grid1.  If this is not set properly, the widget will not
**		work.
**		
**	5)	Set the css class property.  By default, this is set to
**		"jumpto", but can be changed.  Child HTML elements within
**		the widget will be assigned class names as follows:
**		* The DescriptionText will be named the parent class
**		  + "-text", ie "jumpto-text".
**		* The links will be named the parent class + "-link", 
**		  ie "jumpto-link".
**		
**	LIMITATIONS:
**		
**	1)	This will not work with page-at-a-time subfiles.  The 
**		entire subfile must be loaded for this to work properly.
**		
**	2)	Whatever field is set in the FieldName property must be
**		sorted in ascending order for this to work.  If user 
**		sorting is enabled for the grid, this will not work.
**		See below in the "To Do" list.
**		
-----------------------------------------------------------------*/



/*-----------------------------------------------------------------
**
**	To Do:
**
**	* If this is used on a grid that allows for user sorting, it's
**	  not going to work so well.  The subfile grid needs to be
**	  sorted by the field that is being used in the instance of the
**	  widget.  It would be nice to have some functionality that 
**	  allowed the widget to control the sorting in the grid in 
**	  order to eliminate this problem, but no such functionality 
**	  exists in the API at this time.  I put in a request with
**	  Profound Logic to add this function to the API.  If an when
**	  that is implemented, I will add that functionality to this
**	  widget.
**
**	* Perhaps add functionality to post back to an RPG field to 
**	  handle custom positioning in the RPG program?
**
**---------------------------------------------------------------*/




/*
**	function: VicWidgetJumptoAddLinks - Function adds all hyperlinks to a parent Grid Jumpto element.
**		Function used to build the widget dom elements
**		This should be called whenever the element needs to be rebuilt (style change, value change, etc.)
*/
function VicWidgetJumptoAddLinks( parms, parentNode ){
	
	// If no value on the widget, then we can't add any links, so quit.
	if ( !parms.properties.value ){
		console.log("GridJumpto: Empty value property.  Cannot add hyperlinks to element.");
		return;
	}
	
	// Variables that will hold the current elements in the loop.
	var anchorElement;
	var spanElement;
	var textElement;
	
	// Remove white space from value
	var CharArray = parms.properties.value.replace(/\s+/g, '');
	// Remove duplicate characters in value
	CharArray.split("").filter(function(x, n, s) { return s.indexOf(x) == n }).join("");
	// Get the total characters after removing whitespace and duplicates.
	var TotalChars = CharArray.length;
	
	// Create the description text element, if set
	if (parms.properties.DescriptionText) {
		var spanElement = document.createElement("SPAN");
		textElement = document.createTextNode( parms.properties.DescriptionText );
		spanElement.appendChild(textElement);
		if (!parms.properties['css class'])
			spanElement.className = "jumpto-text";
		else {
			// loop through all properties, in case there are multiple classes
			spanElement.className = '';
			for (var prop in parms.properties) {
				if (prop.substring(0,9) == 'css class')
					spanElement.className += ' ' + parms.properties[prop] + "-text";
			}
		}
		parentNode.appendChild(spanElement);
	}
	
	// Loop through each character in the array and add a hyperlink for each.
	for ( var i = 0; i < TotalChars; i++ ) {
		
		var thisCharValue = CharArray[i];
		
		anchorElement = document.createElement("A");
		textElement = document.createTextNode( thisCharValue );
		anchorElement.appendChild(textElement);
		anchorElement.href="javascript:void(0)";

		// Set class name
		if (!parms.properties['css class'])
			anchorElement.className = "jumpto-link";
		else {
			// loop through all properties, in case there are multiple classes
			anchorElement.className = '';
			for (var prop in parms.properties) {
				if (prop.substring(0,9) == 'css class')
					anchorElement.className += ' ' + parms.properties[prop] + "-link";
			}
		}
		
		if ( !parms.design ) {
			
			anchorElement.onclick = function() {
				
				// This happens when one of the letters are clicked
				if ( parms.properties.GridName ) {
					
					// Make sure the correct parms are available
					if ( !parms.properties.GridName ) {
						console.log("GridJumpTo: Grid name not set.");
						return;
					}
					if ( !parms.properties.FieldName ) {
						console.log("GridJumpTo: Field name not set.");
						return;
					}
					
					var fieldName = parms.properties.FieldName;        // FieldName property of widget
					var thisFieldValue = '';                           // Will store the value of the current field while looping
					var checkChar = this.innerText.charAt(0).toUpperCase();       // The letter for the current element
					var thisChar = '';                                 // Will store the first character of the field while looping
					var thisGrid = getObj(parms.properties.GridName);  // Reference to the PUI grid object
					
					// Loop until the field is undefined.
					var LoopControl = true;
					var currRow = 0;
					var prevRow = 1;
					while ( LoopControl ) {
						++currRow;
						thisFieldValue = thisGrid.grid.getDataValue( currRow, fieldName );
						if (!thisFieldValue) {
							thisGrid.grid.scrollToRow(prevRow);
							break;
						}
						thisChar = thisFieldValue.charAt(0).toUpperCase();
						if ( thisChar == checkChar || thisChar.charCodeAt(0) > checkChar.charCodeAt(0) ) {
							thisGrid.grid.scrollToRow( currRow );
							break;
						}
						prevRow = currRow;
					}
					
				}

				return false;

			};

		}

		parentNode.appendChild(anchorElement);

	}

}






pui.widgets.add({
	// widget name - this is placed into the standard "field type" property
	name: "grid jumpto",

	// the default id prefix - used to assign id's when the element is first created
	newId: "GridJumpto",

	// pull-down menu name
	menuName: "Grid Jumpto",

	// default properties for the widget
	defaults: {
	"z index": "25"
	},

	canBelongToGrid: false,

	// property setter functions
	propertySetters: {

		// this will fire when the field type property is set to "google maps" 
		// initialization code for the element should go here
		"field type": function(parms) {
			var newElement = document.createElement("DIV");
			VicWidgetJumptoAddLinks( parms, newElement );
			parms.dom.appendChild(newElement);
			parms.dom.style.overflow = "hidden";
		},
		"visibility": function(parms) {
		  
			if (!parms.design) {
		  
				var divElem = parms.dom.getElementsByTagName("div");
				if (divElem && divElem.length == 1) {

					divElem = divElem[0];
					if (parms.value == "hidden") {

						divElem.style.visibility = "hidden";
						divElem.style.display = "none";

					}
					else {

						divElem.style.visibility = "";
						divElem.style.display = "";

					}

				}
			}
		  
		},
		
		
		"css class": function(parms) {

			var textClassNames = '';
			var linkClassNames = '';
		
			if (!parms.properties['css class']) {
				textClassNames = "jumpto-text";
				linkClassNames = "jumpto-link";
			} else {
				// loop through all properties, in case there are multiple classes
				textClassNames = '';
				linkClassNames = '';
				for (var prop in parms.properties) {
					if (prop.substring(0,9) == 'css class') {
						textClassNames += ' ' + parms.properties[prop] + "-text";
						linkClassNames += ' ' + parms.properties[prop] + "-link";
					}
				}
			}
			
			parms.dom.className = parms.properties['css class'];
			childElements = parms.dom.getElementsByTagName('A');
			for( var i = 0; i < childElements.length; i++) {
				childElements[i].className = parms.properties['css class'] + '-link';
			}
		},
		"value":function(parms) {
			// Recreate the object
			// First, remove all child nodes from the dom object
			var myNode = parms.dom.firstChild;
			while ( myNode.firstChild ) {
				myNode.removeChild(myNode.firstChild);
			}
			VicWidgetJumptoAddLinks(parms, myNode);
		},
		"DescriptionText": function(parms) {
			if (!parms.properties.DescriptionText)
			{
				// remove the elements
				var mySpan = parms.dom.firstChild.getElementsByTagName("SPAN");
				console.log(mySpan.length);
				if (mySpan.length > 0){
					for( var i = 0; i < mySpan.length; i++){
						mySpan[0].parentNode.removeChild(mySpan[0]);
					}
				}
				return;
			}
			
			var classNames = '';
			if (!parms.properties['css class'])
				classNames = "jumpto-text";
			else {
				// loop through all properties, in case there are multiple classes
				classNames = '';
				for (var prop in parms.properties) {
					if (prop.substring(0,9) == 'css class')
						classNames += ' ' + parms.properties[prop] + "-text";
				}
			}

			
			var myNode = parms.dom;
			var mySpan = parms.dom.firstChild.getElementsByTagName("SPAN");
			if (mySpan.length > 0) {
				for (var i = 0; i < mySpan.length; i++ ) {
					mySpan[i].textContent = parms.properties.DescriptionText;
				}
			} else {
				mySpan = document.createElement("SPAN");
				if (parms.properties['css class'])
					mySpan.className = classNames;
				mySpan.textContent = parms.properties.DescriptionText;
				parms.dom.firstChild.insertBefore( mySpan, parms.dom.firstChild.childNodes[0] );
			}
		}
	}
  
});


// the widget will already have prebuilt standard properties relating to css attributes, js events, etc.
// here, we can add additional custom properties
pui.addCustomProperty({
	// property name
	name: "GridName",

	// optional type of input
	// "long" specifies that the text can be long, and an exta text area prompt box is added
	// other types include: "color", "boolean", "image", "list", "js", "file", and "field"
	type: "long", 

	// help text appears at the bottom of the properties window
	help: "Specifies the name of the grid that this Grid Jumpto element controls.", 

	// array of widget elements that this property is applicable to
	controls: ["grid jumpto"],

	// properties are categorized in the properties window
	// if the specified category doesn't already exist, it will be created
	category: "Field Settings"
});


pui.addCustomProperty({
	name: "FieldName",
	type: "long",
	help: "Specifies the field within the grid object that will be compared.",
	controls: ["grid jumpto"],
	category: "Field Settings"
});


pui.addCustomProperty({
	name: "DescriptionText",
	type: "long",
	help: "If this is set, text will appear at the beginning of the element.",
	controls: ["grid jumpto"],
	category: "Field Settings"
});



// Now, we add an entry to the left-hand side Widgets Toolbox
// More than one entry can be added for the same base widget - this would makes sense if we vary default properties
pui.toolbox.add({
	// specifies category - this can be an existing category or a new one
	// if the category does not exist, it is created on the fly
	category: "Custom Widgets",

	widget: "grid jumpto",
	text: "Grid Jumpto",
	icon: "/profoundui/proddata/images/icons/window.png",

	// this determines the look of the drag/drop proxy as we drag the widget element off the toolbox
	proxyHeight: 20,
	proxyWidth: 290,
	proxyHTML: '<div style="width: 290px; height: 20px;"><span class=" vic_jumpto-text">Jump To:</span><a href="javascript:void(0)" class=" vic_jumpto-link">A</a><a href="javascript:void(0)" class=" vic_jumpto-link">B</a><a href="javascript:void(0)" class=" vic_jumpto-link">C</a><a href="javascript:void(0)" class=" vic_jumpto-link">D</a><a href="javascript:void(0)" class=" vic_jumpto-link">E</a><a href="javascript:void(0)" class=" vic_jumpto-link">F</a><a href="javascript:void(0)" class=" vic_jumpto-link">G</a><a href="javascript:void(0)" class=" vic_jumpto-link">H</a><a href="javascript:void(0)" class=" vic_jumpto-link">I</a><a href="javascript:void(0)" class=" vic_jumpto-link">J</a><a href="javascript:void(0)" class=" vic_jumpto-link">K</a><a href="javascript:void(0)" class=" vic_jumpto-link">L</a><a href="javascript:void(0)" class=" vic_jumpto-link">M</a><a href="javascript:void(0)" class=" vic_jumpto-link">N</a><a href="javascript:void(0)" class=" vic_jumpto-link">O</a><a href="javascript:void(0)" class=" vic_jumpto-link">P</a><a href="javascript:void(0)" class=" vic_jumpto-link">Q</a><a href="javascript:void(0)" class=" vic_jumpto-link">R</a><a href="javascript:void(0)" class=" vic_jumpto-link">S</a><a href="javascript:void(0)" class=" vic_jumpto-link">T</a><a href="javascript:void(0)" class=" vic_jumpto-link">U</a><a href="javascript:void(0)" class=" vic_jumpto-link">V</a><a href="javascript:void(0)" class=" vic_jumpto-link">W</a><a href="javascript:void(0)" class=" vic_jumpto-link">X</a><a href="javascript:void(0)" class=" vic_jumpto-link">Y</a><a href="javascript:void(0)" class=" vic_jumpto-link">Z</a></div>',


	// additional default property values can be specified here
	defaults: {
		"DescriptionText": "Jump To: ",
		"GridName": "Grid1",
		"value": "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		"css class": "jumpto"
	}  
  
});


