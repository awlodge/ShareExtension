/*
Function:  ShareService
Params:    - details - object containing the details of the ShareService. It
           contains properties "id", "name", "icon" and "extensionId".
Returns:   ShareService object.
Operation: Constructor function for the ShareService object. This function should
           not be called directly; it is invoked in the functions
           getShareServiceFromStorage and receiveShareServiceRequest.
           Properties:
           - id - string. This is a unique identifier that the extension defining
           the ShareService can use to identify the service.
           - name - string. This is the text by which the user identifies the
           service, appearing in the popup to be clicked.
           - icon - string. This is the URL of the icon that should be used to
           identify the servive.
           - extensionId - string. The id of the extension defining the service.
           Methods:
           - getKey - returns the key used to store the object.
           - addToStorage - stores the ShareService object in Chrome's storage.
           - removeFromStorage - removes the copy of the object from
           Chrome's storage.
           - sendShareMessage - sends a message with a share request to the
           service's extension.
           - sendPingMessage - checks the service's extension is still with us.
           - pingMessageResponse - called when a response from a ping message is
           received.
*/
function ShareService(details) {
  this.id = details.id;
  this.name = details.name;
  this.icon = details.icon;
  this.extensionId = details.extensionId;

  // Needed to identify the service in storage.
  this.isShareService = true;

  /*
  Function:  getKey
  Params:    None.
  Returns:   key - string.
  Operation: Returns the key used when the ShareService object is stored in
             Chrome's storage.
  */
  ShareService.prototype.getKey = function() {
    return this.extensionId + " " + this.id;
  };

  /*
  Function:  addToStorage
  Params:    - callback - optional function to be called when the storing is done.
  Returns:   Nothing.
  Operation: Adds the details of a ShareService object to storage.
  */
  ShareService.prototype.addToStorage = function(callback) {
    console.log("Storing ShareService", this);
    var obj = {};
    obj[this.getKey()] = this;
    chrome.storage.sync.set(obj, callback);
  };

  /*
  Function:  removeFromStorage
  Params:    - callback - optional function to be called when the removal is done.
  Returns:   Nothing.
  Operation: Removes the ShareService object from the set of ShareService objects
             in storage.
  */
  ShareService.prototype.removeFromStorage = function(callback) {
    console.log("Removing ShareService", this);
    chrome.storage.sync.remove(this.getKey(), callback);
  };

  /*
  Function:  sendShareMessage
  Params:    - responseCallback - optional function to be called on a response to
             the message. The function should take a response object as its
             parameter. The response will have two properties, a boolean "success"
             indicating whether or not the message was successfully dealt with,
             and a string "message" which is a response to display to the user.
  Returns:   Nothing.
  Operation: Gets the active tab and sends a message to the extension of the
             given share service. The message contains the following fields:
             - type - the message type, which is "share-request",
             - id - the ShareService id,
             - url - the URL of the page,
             - title - the title of the page,
             - favicon - the favicon of the page.
  TODO: [Future Dev] Send the tab's content too.
  */
  ShareService.prototype.sendShareMessage = function(responseCallback) {
    var thisservice = this;
    chrome.tabs.getSelected(null, function(tab) {
      var message = {
        type: MESSAGE_TYPES.SHARE_REQUEST,
        id: thisservice.id,
        url: tab.url,
        title: tab.title,
        favIconUrl: tab.favIconUrl
      };

      console.log("Sending share message", message, thisservice);
      chrome.runtime.sendMessage(
        thisservice.extensionId, message, responseCallback);
    });
  };

  /*
  Function:  sendPingMessage
  Params:    None.
  Returns:   Nothing.
  Operation: Sends a ping to the service to check it is still active. The
             message contains the following fields:
             - type - the message type, which is "ping",
             - id - the ShareService id.
  */
  ShareService.prototype.sendPingMessage = function() {
    var message = {
      type: MESSAGE_TYPES.PING,
      id: this.id
    };

    console.log("Pinging", message, this);
    var thisservice = this;
    chrome.runtime.sendMessage(this.extensionId, message, function(response) {
      thisservice.pingMessageResponse(response);
    });
  };

  /*
  Function:  pingMessageResponse
  Params:    - response - the response received from the external extension.
  Returns:   Nothing.
  Operation: Checks that the extension pinged is still there and removes it if
             it is not or if its response indicates that it should be removed.
  */
  ShareService.prototype.pingMessageResponse = function(response) {
    var removeService = false;
    if (chrome.runtime.lastError) {
      if (chrome.runtime.lastError.message == EXT_NOT_FOUND_ERROR) {
        removeService = true;
      };
    };
    if (response) {
      if (response.remove) {
        removeService = true;
      };
    };

    if (removeService) {
      this.removeFromStorage();
    };
  };
};

/*
Function:  getShareServiceFromStorage
Params:    - details - object containing the id and extensionId of the
           ShareService object to retrieve from storage. The extensionId field is
           required, if the id field is omitted it defaults to the extensionId.
           Set to null to retrieve all ShareService objectss.
           - callback - function to call on retrieved ShareService object or
           object of ShareService objects if all are retireved.
Returns:   Nothing.
Operation: Retrieves a specified ShareService object from storage and calls a
           callback function on the retrieved object. If the requested object is
           not found, the callback will be called with no argument.
*/
function getShareServiceFromStorage(details, callback) {
  if (details != null) {
    var key = details.extensionId + " " + (details.id || details.extensionId);
  }
  else {
    var key = null;
  };

  chrome.storage.sync.get(key, function(obj) {
    if (details == null) {
      var returnObject = {};
      for (var serviceKey in obj) {
        if ((obj[serviceKey] != undefined) && (obj[serviceKey].isShareService)) {
          returnObject[serviceKey] = new ShareService(obj[serviceKey]);
        };
      };
    }
    else {
      console.log("Getting ShareService: " + details.id);

      if ((obj[key] == undefined) || (!obj[key].isShareService)) {
        console.warn("ShareService not found: " + details.id);
        var returnObject = undefined;
      }
      else {
        var returnObject = new ShareService(obj[key]);
      };
    };

    callback(returnObject);
  });
};

/*
Function:  receiveShareServiceRequest
Params:    - request - details of ShareService requested
           - sender - object containing the id of the ShareService which sent the
           request
           - sendResponse - function to call to send response back to message
           sender.
Returns:   Nothing.
Operation: Called when a ShareService request message is received. Verifies the
           request and adds it to storage.
*/
function receiveShareServiceRequest(request, sender, sendResponse) {
  console.log("Received ShareService request from extension", sender.id, request);
  var details = {
    id: request.id || sender.id,
    name: request.name || DEFAULT_NAME,
    icon: request.icon || DEFAULT_ICON,
    extensionId: sender.id
  };

  var rc = 1;
  var message;

  if (typeof(details.id) != "string") {
    rc = 0;
    message = REQUEST_MESSAGES.ID_TYPE_ERROR;
  }
  else if (typeof(details.name) != "string") {
    rc = 0;
    message = REQUEST_MESSAGES.NAME_TYPE_ERROR;
  }
  else if (typeof(details.icon) != "string") {
    rc = 0;
    message = REQUEST_MESSAGES.ICON_TYPE_ERROR;
  }
  else {
    var icon_request = new XMLHttpRequest();
    icon_request.open("GET", details.icon, false);
    try {
      icon_request.send();
    }
    catch(err) {
      if (err.name != "NetworkError") {
        throw err;
      };
    };

    if (icon_request.status != 200) {
      rc = 0;
      message = REQUEST_MESSAGES.ICON_NOT_FOUND;
    };
  };

  getShareServiceFromStorage(details, function(service) {
    if (service) {
      rc = 0;
      message = REQUEST_MESSAGES.ID_NOT_UNIQUE;
    };

    if (rc == 1) {
      var service = new ShareService(details);
      service.addToStorage();
      message = REQUEST_MESSAGES.SUCCESS;
    };
    sendResponse({status: rc, message: message});
  });

  return true;
};

/*
Function:  pingAllServices
Params:    None.
Returns:   Nothing.
Operation: Sends a ping message to all stored ShareService objects in order to
           remove any that are no longer active.
*/
function pingAllServices() {
  getShareServiceFromStorage(null, function(services) {
    for (var key in services) {
      services[key].sendPingMessage();
    };
  });
};
