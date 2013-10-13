/*
Function:  buttonPress
Params:    - onclick - Function to call when button is clicked.
Returns:   Nothing.
Operation: Adds consistent onmouse* events to a button.
*/
Element.prototype.buttonPress = function(onclick) {

  this.onmouseover = function() {
    this.style.borderColor = DEFAULT_COLOR;
  };
  this.onmouseout = function() {
    this.style.borderColor = BACKGROUND_COLOR;
  };

  this.onmousedown = function() {
    this.style.backgroundColor = DEFAULT_COLOR_TRANSLUCENT;
  };
  this.onmouseup = function() {
    this.style.backgroundColor = BACKGROUND_COLOR;
  };

  this.onclick = onclick;
};

/*
Function:  createShareButton
Params:    - service - ShareService object to create the button for.
Returns:   HTML "td" element for the button for the service.
Operation: Creates a button cell for the specified service. The cell contains the
           service's title and icon and, when clicked, sends a share message to the
           service's extension.
*/
function createShareButton(service) {
  var cell = document.createElement("td");
  cell.setAttribute("class", "service-button");
  cell.setAttribute("id", service.extensionId + " " + service.id);

  var image = document.createElement("img");
  image.setAttribute("class", "service-icon");
  image.setAttribute("src", service.icon);
  image.setAttribute("alt", service.name);

  var text = document.createElement("div");
  text.setAttribute("class", "service-name");
  text.innerText = service.name;

  cell.appendChild(image);
  cell.appendChild(document.createElement("br"));
  cell.appendChild(text);

  cell.buttonPress(function() {
    service.sendShareMessageFromTab(displayResponseMessage);
  });

  return cell;
};

/*
Function:  addCell
Params:    - cell - the cell to be added.
Returns:   Nothing.
Operation: Adds a new cell to the table of buttons. Buttons are added in rows of
           four, so this function creates new rows in the table to maintain rows of
           four buttons.
*/
function addCell(cell) {
  var table = document.getElementById("button-table")
  var row;

  if (table.rows.length == 0) {
    row = table.insertRow();
  }
  else if (table.rows[table.rows.length - 1].cells.length == 4) {
    row = table.insertRow(-1);
  }
  else {
    row = table.rows[table.rows.length - 1];
  };

  row.appendChild(cell);
};

/*
Function:  refreshButtons
Params:    None.
Returns:   Nothing.
Operation: Clears any present buttons, then gets the active ShareServices from
           storage and displays buttons for them all.
*/
function refreshButtons() {
  var table = document.getElementById("button-table");
  while (table.rows.length > 0) {
    table.deleteRow(0);
  };

  getShareServiceFromStorage(null, function(services) {
    for (var key in services) {
      var button = createShareButton(services[key]);
      addCell(button);
    };
  });
};

/*
Function:  displayResponseMessage
Params:    - response - object containing the response.
Returns:   Nothing.
Operation: Takes a response from the ShareService extension and displays it in a
           temporary box in the popup.
*/
function displayResponseMessage(response) {
  if (response) {
    console.log("Displaying response message", response);
    var message_display = document.createElement("div");
    message_display.setAttribute("id", "message");
    message_display.innerText = response.message;
    document.body.appendChild(message_display);
    setTimeout(function() {
      message_display.parentNode.removeChild(message_display)},
      RESPONSE_MESSAGE_TIMEOUT);
  };
};

document.addEventListener("DOMContentLoaded", function() {
  // Add listeners for refresh and options buttons
  document.getElementById("refresh").buttonPress(function() {
    console.log("Refresh button clicked");
    pingAllServices();
  });
  document.getElementById("options").buttonPress(function() {
    console.log("Options button clicked");
    chrome.tabs.create(
      {url: "/options/options.html"},
      function(tab) {chrome.windows.update(tab.windowId,{"focused": true});}
    );
  });

  // Add listener to update buttons if services in storage changes.
  chrome.storage.onChanged.addListener(function(changes) {
    if (changes.services) {
      refreshButtons();
    };
  });

  refreshButtons();
});
