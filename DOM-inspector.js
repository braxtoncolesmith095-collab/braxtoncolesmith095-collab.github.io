(function(){

/* ============================
   INJECT CSS
============================ */
var style=document.createElement("style");
style.textContent=`
#hackmenu-container {
  position: fixed;
  left: 5px;
  top: 5px;
  width: 276px;
  height: 300px;
  background-color: gray;
  padding-left: 4px;
  z-index: 999999 !important;
  color: black;
  user-select: none;
}

#hackmenu-title {
  cursor: grab;
}

#hackmenu-elementslist {
  position: absolute;
  left: 0px;
  top: 40px;
  width: 140px;
  height: 260px;
  background-color: rgb(230,230,230);
  overflow-y: auto;
  color: black;
}

#hackmenu-elementslist p.center {
  position: sticky;
  top: 0;
  background-color: rgb(230,230,230);
  z-index: 2;
}

#hackmenu-elementproperties {
  position: absolute;
  left: 140px;
  top: 40px;
  width: 140px;
  height: 260px;
  background-color: rgb(210,210,210);
  overflow-y: auto;
  color: black;
}

#hackmenu-elementproperties p.center {
  position: sticky;
  top: 0;
  background-color: rgb(210,210,210);
  z-index: 2;
}

.center {
  position: relative;
  text-align: center;
  bottom: 12px;
  font-size: 1.3em;
  font-family: sans-serif;
  color: black;
}

.font {
  position: relative;
  bottom: 12px;
  font-size: 1.3em;
  font-family: sans-serif;
  color: black;
}

.font-small {
  position: relative;
  left: 2px;
  bottom: 5px;
  font-size: 0.95em;
  font-family: sans-serif;
  color: black;
}

#hackmenu-goback {
  position: absolute;
  right: 5px;
  top: 5px;
  color: black;
}

.hackmenu-elbutton {
  position: relative;
  width: 100%;
  border-color: black;
  border-radius: 5px;
  font-size: 0.8em;
  background-color: rgb(240,240,240);
  color: black;
}

.hackmenu-elbutton:hover {
  background-color: rgb(225,225,225);
  cursor: pointer;
}

.hackmenu-elbutton:disabled {
  cursor: not-allowed;
}
`;
document.head.appendChild(style);

/* ============================
   INJECT HTML UI
============================ */
var ui=document.createElement("div");
ui.id="hackmenu-container";
ui.innerHTML=`
<p id="hackmenu-title" class="font">Bhack 0.15.0</p>
<button id="hackmenu-goback">Go back</button>
<button id="hackmenu-refresh" style="width:70px;position:absolute;right:75px;top:5px;">Refresh</button>

<div id="hackmenu-elementslist">
  <p class="center">Elements</p>
</div>

<div id="hackmenu-elementproperties">
  <p class="center">Properties</p>
  <p id="hackmenu-elementattributes" class="font-small">Element: null</p>

  <button id="edit-innerhtml" class="hackmenu-elbutton">Edit innerHTML</button>
  <button id="edit-class" class="hackmenu-elbutton">Edit class</button>
  <button id="create-element" class="hackmenu-elbutton">Create child</button>
  <button id="delete-element" class="hackmenu-elbutton">Delete element</button>
</div>
`;
document.body.appendChild(ui);

/* ============================
   LOGIC
============================ */

var elementsList = [];
var elementProperties = [];
var currentElement = null;
var previousElement = document.body;

updateList(document.body);

/* ============================
   UPDATE LIST
============================ */
function updateList(el) {
  if (!el || el.nodeType !== 1) return;

  const properties = document.getElementById("hackmenu-elementattributes");

  previousElement = el.parentElement || document.body;
  currentElement = el;

  elementsList = [];
  elementProperties = [];
  getProperties(el);

  properties.innerHTML =
    "Element:<br>" + el.nodeName +
    ", ID: " + (el.id || "") +
    "<br><br>Attributes:<br>" + (elementProperties.join(", ") || "none");

  el.childNodes.forEach(function(node) {
    if (node.nodeType === 1) {
      elementsList.push(node);
    }
  });

  createBtns();
  createAttributeBtns();

  document.getElementById("edit-class").disabled = !el.hasAttribute("class");

  if (
    el.nodeName == "BODY" ||
    el.id == "hackmenu-container" ||
    el.id == "hackmenu-elementslist" ||
    el.id == "hackmenu-elementproperties"
  ) {
    document.getElementById("edit-innerhtml").disabled = true;
    document.getElementById("delete-element").disabled = true;
  } else {
    document.getElementById("edit-innerhtml").disabled = false;
    document.getElementById("delete-element").disabled = false;
  }
}

/* ============================
   GET PROPERTIES
============================ */
function getProperties(el) {
  elementProperties = [];
  if (!el || !el.attributes) return;

  for (let i = 0; i < el.attributes.length; i++) {
    elementProperties.push(el.attributes[i].nodeName + ": " + el.attributes[i].nodeValue);
  }
}

/* ============================
   CREATE ELEMENT BUTTONS
============================ */
function createBtns() {
  const elementlist = document.getElementById('hackmenu-elementslist');
  elementlist.innerHTML = '<p class="center">Elements</p>';

  for (var i = 0; i < elementsList.length; i++) {
    var node = elementsList[i];
    var newBtn = document.createElement('button');

    newBtn.className = "hackmenu-elbutton";
    newBtn.innerText =
      "<" + node.nodeName.toLowerCase() +
      (node.id ? " id=\"" + node.id + "\"" : "") +
      ">";

    (function(target){
      newBtn.onclick = function() {
        if (target && target.nodeType === 1) updateList(target);
      };
    })(node);

    elementlist.appendChild(newBtn);
  }

  if (elementsList.length === 0) {
    elementlist.innerHTML += "<p>This element doesn't have any childNodes.</p>";
  }
}

/* ============================
   CREATE ATTRIBUTE EDIT BUTTONS
============================ */
function createAttributeBtns() {
  const propsPanel = document.getElementById("hackmenu-elementproperties");

  const oldButtons = propsPanel.querySelectorAll(".attr-edit-btn");
  oldButtons.forEach(btn => btn.remove());

  if (!currentElement || !currentElement.attributes) return;

  for (let i = 0; i < currentElement.attributes.length; i++) {
    const attr = currentElement.attributes[i];
    const name = attr.name;
    const value = attr.value;

    const btn = document.createElement("button");
    btn.className = "hackmenu-elbutton attr-edit-btn";
    btn.innerText = `Edit ${name}="${value}"`;

    btn.onclick = function() {
      const newValue = prompt(`Set attribute "${name}" to:`, value);
      if (newValue !== null) {
        currentElement.setAttribute(name, newValue);
        updateList(currentElement);
      }
    };

    propsPanel.appendChild(btn);
  }
}

/* ============================
   EDIT ELEMENT
============================ */
function editElement(type) {
  var response = prompt("Set " + type + " to:");
  if (response === null) return;

  try {
    currentElement[type] = response;
  } catch {
    currentElement.setAttribute(type, response);
  }
}

/* ============================
   CREATE NEW ELEMENT
============================ */
document.getElementById("create-element").onclick = function() {
  let tag = prompt("Enter tag name (e.g., div, span, p):");
  if (!tag) return;

  try {
    let newEl = document.createElement(tag);
    currentElement.appendChild(newEl);
    updateList(currentElement);
  } catch {
    alert("Invalid tag name.");
  }
};

/* ============================
   DELETE ELEMENT
============================ */
document.getElementById("delete-element").onclick = function() {
  if (!currentElement || currentElement === document.body) return;

  let parent = currentElement.parentElement;
  parent.removeChild(currentElement);
  updateList(parent);
};

/* ============================
   BUTTON HOOKS
============================ */
document.getElementById("hackmenu-goback").onclick = function() {
  updateList(previousElement);
};

document.getElementById("hackmenu-refresh").onclick = function() {
  updateList(currentElement);
};

document.getElementById("edit-innerhtml").onclick = function() {
  editElement("innerHTML");
};

document.getElementById("edit-class").onclick = function() {
  editElement("className");
};

/* ============================
   DRAGGING
============================ */
(function enableDragging(){
  const box = document.getElementById("hackmenu-container");
  const dragHandle = document.getElementById("hackmenu-title");

  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;

  dragHandle.addEventListener("mousedown", function(e){
    dragging = true;
    offsetX = e.clientX - box.offsetLeft;
    offsetY = e.clientY - box.offsetTop;
    dragHandle.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", function(e){
    if (!dragging) return;
    box.style.left = (e.clientX - offsetX) + "px";
    box.style.top = (e.clientY - offsetY) + "px";
  });

  document.addEventListener("mouseup", function(){
    dragging = false;
    dragHandle.style.cursor = "grab";
  });
})();
})();
