/*
Function:  addLabel
Params:    - service - the ShareService object to create the checkbox for.
Returns:   Nothing.
Operation: Creates the checkbox to use to select a built-in ShareService object,
           checks whether or not it should be checked, and adds it to the form.
*/
function addLabel(service) {
  var label = document.createElement("label");

  var input = document.createElement("input");
  input.setAttribute("type", "checkbox");
  input.setAttribute("id", service.id)

  var text = document.createTextNode("   " + service.name);

  label.appendChild(input);
  label.appendChild(text);

  label.onmouseover = function() {
    label.style.borderColor = DEFAULT_COLOR;
  };
  label.onmouseout = function() {
    label.style.borderColor = BACKGROUND_COLOR;
  };

  document.getElementById("built-in-form").appendChild(label);

  getShareServiceFromStorage(service, function(returnObj) {
    if (returnObj) {
      label.style.backgroundColor = DEFAULT_COLOR_TRANSLUCENT;
      label.childNodes[0].checked = true;
      label.childNodes[0].onclick = function() {
        removeService(service);
      };
    }
    else {
      label.style.backgroundColor = BACKGROUND_COLOR;
      label.childNodes[0].checked = false;
      label.childNodes[0].onclick = function() {
        addService(service);
      };
    };
  });
};

/*
Function:  addService
Params:    - service - The ShareService object to add.
Returns:   Nothing.
Operation: Changes the service's label background color and adds the service to
           storage.
*/
function addService(service) {
  console.log("Adding service", service);
  var input = document.getElementById(service.id);
  input.parentNode.style.backgroundColor = DEFAULT_COLOR_TRANSLUCENT;
  input.onclick = function() {
    removeService(service);
  };

  service.addToStorage();
};

/*
Function:  removeService
Params:    - service - The ShareService object to remove.
Returns:   Nothing.
Operation: Changes the service's label background color and removes the service
           from storage.
*/
function removeService(service) {
  console.log("Removing service", service);
  var input = document.getElementById(service.id);
  input.parentNode.style.backgroundColor = BACKGROUND_COLOR;
  input.onclick = function() {
    addService(service);
  };

  service.removeFromStorage();
};

document.addEventListener("DOMContentLoaded", function() {
  // Add the version number
  var version = chrome.runtime.getManifest().version
  document.getElementById("version").innerText = version;

  // Add labels for the built-in pages
  chrome.runtime.getBackgroundPage(function(background) {
    for (var key in background.builtInServices) {
      addLabel(background.builtInServices[key]);
    };
  });
});
