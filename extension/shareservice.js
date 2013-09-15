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

  /*
  Function:  getKey
  Params:    None.
  Returns:   key - string.
  Operation: Returns the key used when the ShareService object is stored in
             Chrome's storage.
  */
  this.prototype.getKey = function() {
    return this.extensionId + " " + this.id;
  };

  /*
  Function:  addToStorage
  Params:    - callback - optional function to be called when the storing is done.
  Returns:   Nothing.
  Operation: Adds the details of a ShareService object to storage.
  */
  this.prototype.addToStorage = function(callback) {
    console.log("Storing ShareService", this);
    getShareServiceFromStorage(null, function(services) {
      var key = this.getKey();
      services[key] = this;
      chrome.storage.sync.set({"services": services}, callback);
    });
  };

  /*
  Function:  removeFromStorage
  Params:    None.
  Returns:   Nothing.
  Operation: Removes the ShareService object from the set of ShareService objects
             in storage.
  */
  this.prototype.removeFromStorage = function() {
    console.log("Removing ShareService", this);
    getShareServiceFromStorage(null, function(services) {
      var key = this.getKey;
      delete services[key];
      chrome.storage.sync.set({"services": services})
    });
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
  this.prototype.sendShareMessage = function(responseCallback) {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
      var tab = tabs[0];
      var message = {
        type: MESSAGE_TYPES.SHARE_REQUEST,
        id: this.id,
        url: tab.url,
        title: tab.title,
        favIconUrl: tab.favIconUrl
      };

      console.log("Sending share message", message, this);
      chrome.runtime.sendMessage(this.extensionId, message, responseCallback);
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
  this.prototype.sendPingMessage = function() {
    var message = {
      type: MESSAGE_TYPES.PING,
      id: this.id,
    };

    console.log("Pinging", message, this);
    chrome.runtime.sendMessage(this.extensionId, message, function(response) {
      this.pingMessageResponse(response);
    });
  };

  /*
  Function:  pingMessageResponse
  Params:    - response - the response received from the external extension.
  Returns:   Nothing.
  Operation: Checks that the extension pinged is still there and removes it if
             it is not or if its response indicates that it should be removed.
  */
  this.pingMessageResponse = function(response) {
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
  chrome.storage.sync.get("services", function(obj) {
    if (details == null) {
      var returnObject = {};
      for (var key in obj.services) {
        returnObject[key] = new ShareService(obj.services[key]);
      };
    }
    else {
      console.log("Getting ShareService: " + id);
      var key = details.extensionId + " " + (details.id || details.extensionId);
      if (obj.services[key] == undefined) {
        console.warn("ShareService not found: " + id);
        var returnObject = undefined;
      }
      else {
        var returnObject = new ShareService(obj.services[key]);
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
    message = REQUEST_MESSAGES.ID_TYPE_ERROR
  }
  else if (typeof(details.name) != "string") {
    rc = 0;
    message = REQUEST_MESSAGES.NAME_TYPE_ERROR
  }
  else if (typeof(details.icon) != "string") {
    rc = 0;
    message = REQUEST_MESSAGES.ICON_TYPE_ERROR
  }
  // TODO: add verification of icon url and that id is not duplicate
  // (requires async)

  if (rc == 1) {
    var service = new ShareService(details);
    service.addToStorage();
    message = REQUEST_MESSAGES.SUCCESS;
  };
  sendResponse({status: rc, message: message});
};
