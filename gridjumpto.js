/* **********************************************************************************************
**	widget: Grid Jumpto v2.0
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
**			07/06/2015 - Fixed bug in Firefox (was using innerText instead of textContent).
**		    09/14/2015 - Modified the search algorithm for an anchor element to use the actual
**			             grid row count
**			09/15/2015 - Added functionality for Search text box.  This includes a new property
**			             UseSearchBox.  If this property is set to "true", then a text box will
**			             appear below the list of links that will allow the user to type in a 
**			             value to search in the grid.
**
********************************************************************************************* */


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
**	6)  (Optional) Set UseSearchBox to "true" to add a text box
**	    to allow the user to search for values in the grid.
**	    Additionally, set SearchBoxText to define the text that
**	    should appear next to the search box.
**	
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




function VicWidgetJumptoRecreate ( parms ) {
	// Recreate the object
	// First, remove all child nodes from the dom object
	var myNode = parms.dom.firstChild;
	while ( myNode.firstChild ) {
		myNode.removeChild(myNode.firstChild);
	}
	VicWidgetJumptoAddLinks(parms, myNode);
}



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
	var div1Element;
	var div2Element;
	var anchorElement;
	var spanElement;
	var inputElement;
	var textElement;

	// create the first div element
	div1Element = document.createElement("DIV");
	
	// Remove white space from value
	var CharArray = parms.properties.value.replace(/\s+/g, '');
	// Remove duplicate characters in value
	CharArray.split("").filter(function(x, n, s) { return s.indexOf(x) == n }).join("");
	// Get the total characters after removing whitespace and duplicates.
	var TotalChars = CharArray.length;
	
	// Create the description text element, if set
	if (parms.properties.DescriptionText) {
		spanElement = document.createElement('SPAN');
		textElement = document.createTextNode( parms.properties.DescriptionText );
		if (!parms.properties['css class'])
			spanElement.className = "jumpto-text";
		else {
			// loop through all properties, in case there are multiple classes
			spanElement.className = '';
			for (var prop in parms.properties) {
				if (prop.substring(0,9) == 'css class')
					spanElement.className += ' ' + parms.properties[prop] + "-text";
			}
			console.log(spanElement.className);
		}
		spanElement.appendChild(textElement);
		div1Element.appendChild(spanElement);
	}
	
	
	// Loop through each character in the array and add a hyperlink for each.
	for ( var i = 0; i < TotalChars; i++ ) {
		
		var thisCharValue = CharArray[i];
		
		anchorElement = document.createElement("A");
		textElement = document.createTextNode( thisCharValue );
		anchorElement.appendChild(textElement);
		anchorElement.href="javascript:void(0)";

		// Set class name
		if (!parms.properties['css class']) {
			anchorElement.className = "jumpto-link";
			div1Element.className = "jumpto-link-wrapper";
		} else {
			// loop through all properties, in case there are multiple classes
			anchorElement.className = '';
			div1Element.className = '';
			for (var prop in parms.properties) {
				if (prop.substring(0,9) == 'css class') {
					anchorElement.className += ' ' + parms.properties[prop] + "-link";
					div1Element.className += ' ' + parms.properties[prop] + "-link-wrapper";
				}
			}
		}
		
		if ( !parms.design ) {
			
			// Set functionality when one of the buttons is pressed
			anchorElement.onclick = function() {
				
				// Make sure the correct parms are available
				if ( !parms.properties.GridName ) {
					console.log("GridJumpTo: Grid name not set.");
					return;
				}
				if ( !parms.properties.FieldName ) {
					console.log("GridJumpTo: Field name not set.");
					return;
				}
				
				// This happens when one of the letters are clicked
				if ( parms.properties.GridName ) {
					
					var fieldName = parms.properties.FieldName;        // FieldName property of widget
					var thisFieldValue = '';                           // Will store the value of the current field while looping
					var checkChar;
					var thisChar = '';                                 // Will store the first character of the field while looping
					var thisGrid = getObj(parms.properties.GridName);  // Reference to the PUI grid object
					
					if (this.textContent)
						checkChar = this.textContent.charAt(0).toUpperCase();       // The letter for the current element
					else if (this.innerText)
						checkChar = this.innerText.charAt(0).toUpperCase();
					else
						checkChar = this.innerHTML.charAt(0).toUpperCase();
					
					// Loop until the field is undefined.
					var prevRow = 1;
					var totalRows = thisGrid.grid.getRecordCount();
					for (var currRow = 1; currRow <= totalRows; currRow++ ) {
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

		div1Element.appendChild(anchorElement);

	}
	
	parentNode.appendChild(div1Element);
	
	
	
	// Create the search text box if specified
	if(parms.properties.UseSearchBox == 'true') {
		div2Element = document.createElement("DIV");
		if (parms.properties.SearchBoxText) {
			textElement = document.createTextNode( parms.properties.SearchBoxText );
		} else {
			textElement = document.createTextNode( "Search: " );
		}
		var labelElement = document.createElement('LABEL');
		labelElement.appendChild(textElement);
		var inputElement = document.createElement('INPUT');
		inputElement.type = 'text';
		if ( !parms.design ) {
			inputElement.onkeyup = function() {
				// Function to compare for equals (take substring of length of shortest value)
				var searchCompareEqual = function(value1, value2) {
					var minLength = value1.length;
					if (value1.substring(0, minLength).toUpperCase() == value2.substring(0, minLength).toUpperCase())
						return true;
					else
						return false;
				};
				// Function to compare for greater than
				var searchCompareGreater = function(value1, value2) {
					// converts ASCII character to EBCDIC decimal code (ugh)
					var convTable = {0:0, 1:1, 2:2, 3:3, 4:55, 5:45, 6:46, 7:47, 8:22, 9:5, 10:37, 11:11, 12:12, 13:13, 14:14, 15:15, 16:16, 17:17, 18:18, 19:19, 20:60, 21:61, 22:50, 23:38, 24:24, 25:25, 26:63, 27:39, 28:28, 29:29, 30:30, 31:31, 32:64, 33:79, 34:127, 35:123, 36:91, 37:108, 38:80, 39:125, 40:77, 41:93, 42:92, 43:78, 44:107, 45:96, 46:75, 47:97, 48:240, 49:241, 50:242, 51:243, 52:244, 53:245, 54:246, 55:247, 56:248, 57:249, 58:122, 59:94, 60:76, 61:126, 62:110, 63:111, 64:124, 65:193, 66:194, 67:195, 68:196, 69:197, 70:198, 71:199, 72:200, 73:201, 74:209, 75:210, 76:211, 77:212, 78:213, 79:214, 80:215, 81:216, 82:217, 83:226, 84:227, 85:228, 86:229, 87:230, 88:231, 89:232, 90:233, 91:74, 92:224, 93:90, 94:95, 95:109, 96:121, 97:129, 98:130, 99:131, 100:132, 101:133, 102:134, 103:135, 104:136, 105:137, 106:145, 107:146, 108:147, 109:148, 110:149, 111:150, 112:151, 113:152, 114:153, 115:162, 116:163, 117:164, 118:165, 119:166, 120:167, 121:168, 122:169, 123:192, 124:106, 125:208, 126:161, 127:7, 128:32, 129:33, 130:34, 131:35, 132:36, 133:21, 134:6, 135:23, 136:40, 137:41, 138:42, 139:43, 140:44, 141:9, 142:10, 143:27, 144:48, 145:49, 146:26, 147:51, 148:52, 149:53, 150:54, 151:8, 152:56, 153:57, 154:58, 155:59, 156:4, 157:20, 158:62, 159:225, 160:65, 161:66, 162:67, 163:68, 164:69, 165:70, 166:71, 167:72, 168:73, 169:81, 170:82, 171:83, 172:84, 173:85, 174:86, 175:87, 176:88, 177:89, 178:98, 179:99, 180:100, 181:101, 182:102, 183:103, 184:104, 185:105, 186:112, 187:113, 188:114, 189:115, 190:116, 191:117, 192:118, 193:119, 194:120, 195:128, 196:138, 197:139, 198:140, 199:141, 200:142, 201:143, 202:144, 203:154, 204:155, 205:156, 206:157, 207:158, 208:159, 209:160, 210:170, 211:171, 212:172, 213:173, 214:174, 215:175, 216:176, 217:177, 218:178, 219:179, 220:180, 221:181, 222:182, 223:183, 224:184, 225:185, 226:186, 227:187, 228:188, 229:189, 230:190, 231:191, 232:202, 233:203, 234:204, 235:205, 236:206, 237:207, 238:218, 239:219, 240:220, 241:221, 242:222, 243:223, 244:234, 245:235, 246:236, 247:237, 248:238, 249:239, 250:250, 251:251, 252:252, 253:253, 254:254, 255:255};
					var AsciiToEbcdic = function(inChar) {
						// The conversion table is an object that links the ascii decimal code to ebcdic decimal code
						var currChar = inChar.charCodeAt(0);
						var EbcdicVal = convTable[currChar];
						return parseInt(EbcdicVal);
					}
					var minLength = (value1.length < value2.length) ? value1.length : value2.length;
					var val1Ebcdic;
					var val2Ebcdic;
					// Loop through each character and compare the EBCDIC value
					// If the EBCDIC value is less than, then return false
					for ( var i = 0; i < minLength; i++ ) {
						val1Ebcdic = AsciiToEbcdic(value1.substring(i, i+1));
						val2Ebcdic = AsciiToEbcdic(value2.substring(i, i+1));
						if (val1Ebcdic < val2Ebcdic)
							return false;
						else if ( val1Ebcdic == val2Ebcdic )
							continue;
						else if ( val1Ebcdic > val2Ebcdic )
							return true;
					}
				}
				// While the user types, move to the spot in the grid
				// Make sure the correct parms are available
				if ( !parms.properties.GridName ) {
					console.log("GridJumpTo: Grid name not set.");
					return;
				}
				if ( !parms.properties.FieldName ) {
					console.log("GridJumpTo: Field name not set.");
					return;
				}
				if ( parms.properties.GridName && parms.properties.FieldName ) {
					var thisGrid = getObj(parms.properties.GridName);  // Reference to the PUI grid object					
					var fieldName = parms.properties.FieldName;        // FieldName property of widget
					// Loop until the field is undefined.
					var prevRow = 1;
					var totalRows = thisGrid.grid.getRecordCount();
					var fieldSubstring;
					var fieldValue;
					var searchValue = inputElement.value.toUpperCase();
					for (var currRow = 1; currRow <= totalRows; currRow++ ) {
						fieldValue = thisGrid.grid.getDataValue( currRow, fieldName );
						if ( fieldValue.length ) {
							fieldSubstring = fieldValue.substring(0, searchValue.length).toUpperCase();
							if ( searchCompareEqual(searchValue, fieldSubstring) ) {
								thisGrid.grid.scrollToRow( currRow );
								break;
							} else if ( searchCompareGreater( fieldSubstring, searchValue) ) {
								thisGrid.grid.scrollToRow( currRow );
								break;
							}
						}
					}
				}
				return false;
			}
		}
		if(!parms.properties['css class']) {
			labelElement.className = 'jumpto-search-label';
			inputElement.className = 'jumpto-search-input';
			div2Element.className = 'jumpto-search-wrapper';
		} else {
			// loop through all properties, in case there are multiple classes
			labelElement.className = '';
			inputElement.className = '';
			div2Element.className = '';
			for (var prop in parms.properties) {
				if (prop.substring(0,9) == 'css class') {
					labelElement.className += ' ' + parms.properties[prop] + '-search-label';
					inputElement.className += ' ' + parms.properties[prop] + '-search-input';
					div2Element.className += ' ' + parms.properties[prop] + '-search-wrapper';
				}
			}
		}
		labelElement.appendChild(inputElement);
		div2Element.appendChild(labelElement);
		parentNode.appendChild(div2Element);
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
			VicWidgetJumptoRecreate(parms);
		},
		"value":function(parms) {
			VicWidgetJumptoRecreate(parms);
		},
		"DescriptionText": function(parms) {
			VicWidgetJumptoRecreate(parms);
		},
		"UseSearchBox" : function(parms) {
			VicWidgetJumptoRecreate(parms);
		},
		"SearchBoxText" : function(parms) {
			VicWidgetJumptoRecreate(parms);
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
	help: "If this is set, text will appear at the left of the links.",
	controls: ["grid jumpto"],
	category: "Field Settings"
});


pui.addCustomProperty({
	name: "UseSearchBox",
	type: "boolean",
	help: "If set to true, displays a search box that will allow users to type a value to jump to in the grid.",
	controls: ["grid jumpto"],
	category: "Field Settings"
});

pui.addCustomProperty({
	name: "SearchBoxText",
	type: "long",
	help: "If this is set, text will appear at the left of the search text box.",
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
	proxyHeight: 41,
	proxyWidth: 290,
	proxyHTML: '<div><div class=" jumpto-link-wrapper"><span class=" jumpto-text">Jump To: </span><a href="javascript:void(0)" class=" jumpto-link">A</a><a href="javascript:void(0)" class=" jumpto-link">B</a><a href="javascript:void(0)" class=" jumpto-link">C</a><a href="javascript:void(0)" class=" jumpto-link">D</a><a href="javascript:void(0)" class=" jumpto-link">E</a><a href="javascript:void(0)" class=" jumpto-link">F</a><a href="javascript:void(0)" class=" jumpto-link">G</a><a href="javascript:void(0)" class=" jumpto-link">H</a><a href="javascript:void(0)" class=" jumpto-link">I</a><a href="javascript:void(0)" class=" jumpto-link">J</a><a href="javascript:void(0)" class=" jumpto-link">K</a><a href="javascript:void(0)" class=" jumpto-link">L</a><a href="javascript:void(0)" class=" jumpto-link">M</a><a href="javascript:void(0)" class=" jumpto-link">N</a><a href="javascript:void(0)" class=" jumpto-link">O</a><a href="javascript:void(0)" class=" jumpto-link">P</a><a href="javascript:void(0)" class=" jumpto-link">Q</a><a href="javascript:void(0)" class=" jumpto-link">R</a><a href="javascript:void(0)" class=" jumpto-link">S</a><a href="javascript:void(0)" class=" jumpto-link">T</a><a href="javascript:void(0)" class=" jumpto-link">U</a><a href="javascript:void(0)" class=" jumpto-link">V</a><a href="javascript:void(0)" class=" jumpto-link">W</a><a href="javascript:void(0)" class=" jumpto-link">X</a><a href="javascript:void(0)" class=" jumpto-link">Y</a><a href="javascript:void(0)" class=" jumpto-link">Z</a></div><div class=" jumpto-search-wrapper"><label class=" jumpto-search-label">Search: <input type="text" class=" jumpto-search-input"></label></div></div>',

	// additional default property values can be specified here
	defaults: {
		"DescriptionText": "Jump To: ",
		"GridName": "Grid1",
		"value": "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		"css class": "jumpto",
		"UseSearchBox" : "true",
		"SearchBoxText" : "Search: "
	}  
  
});


