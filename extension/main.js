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
      var returnObject = obj.services
    }
    else {
      console.log("Getting ShareService: " + id);
      var key = details.extensionId + " " + (details.id || details.extensionId);
      if (obj.services[key] == undefined) {
        console.warn("ShareService not found: " + id);
      };
      var returnObject = obj.services[id];
    };

    callback(returnObject);
  });
};

/*
Function:  addShareServiceToStorage
Params:    - service - ShareService object to be added to storage.
           - callback - optional function to be called when the storing is done.
Returns:   Nothing.
Operation: Adds the details of a ShareService object to storage.
*/
function addShareServiceToStorage(service, callback) {
  console.log("Storing ShareService", service);
  getShareServiceFromStorage(null, function(services) {
    var key = service.extensionId + " " + service.id
    services[key] = service;
    chrome.storage.sync.set({"services": services}, callback);
  });
};

/*
Function:  removeShareServiceFromStorage
Params:    - service
Returns:   Nothing.
Operation: Removes a ShareService object from the set of ShareService objects in
           storage.
*/
function removeShareServiceFromStorage(service) {
  console.log("Removing ShareService", service);
  getShareServiceFromStorage(null, function(services) {
    var key = service.extensionId + " " + service.id;
    delete services[key];
    chrome.storage.sync.set({"services": services})
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
  var ShareService = {
    id: request.id || sender.id,
    name: request.name || DEFAULT_NAME, // TODO: add DEFAULT_NAME constant
    icon: request.icon || DEFAULT_ICON, // TODO: add DEFAULT_ICON constant
    extensionId: sender.id
  };

  var rc = 1;
  var message;

  if (typeof(ShareService.id) != "string") {
    rc = 0;
    message = REQUEST_MESSAGES.ID_TYPE_ERROR // TODO: add REQUEST_MESSAGES object
  }
  else if (typeof(ShareService.name) != "string") {
    rc = 0;
    message = REQUEST_MESSAGES.NAME_TYPE_ERROR
  }
  else if (typeof(ShareService.icon) != "string") {
    rc = 0;
    message = REQUEST_MESSAGES.ICON_TYPE_ERROR
  }
  // TODO: add verification of icon url and that id is not duplicate
  // (requires async)

  if (rc == 1) {
    addShareServiceToStorage(ShareService);
    message = REQUEST_MESSAGES.SUCCESS;
  };
  sendResponse({status: rc, message: message});
};

/*
Function:  sendShareMessage
Params:    - service - the ShareService object used for this message.
Returns:   Nothing.
Operation: Gets the active tab and sends a message to the extension of the given
           share service. The message contains the following fields:
           - type - the message type, which is "share-request",
           - id - the ShareService id,
           - url - the URL of the page,
           - title - the title of the page,
           - favicon - the favicon of the page.
TODO: Send the tab's content too.
TODO: Add response message from the external extension which allows a response to
      be displayed in the popup (with a success or failure message).
*/
function sendShareMessage(service) {
  chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
    var tab = tabs[0];
    var message = {
      type: MESSAGE_TYPES.SHARE_REQUEST, // TODO: Add a MESSAGE_TYPE constant
      id: service.id,
      url: tab.url,
      title: tab.title,
      favIconUrl: tab.favIconUrl
    };

    console.log("Sending share message", message, service);
    chrome.runtime.sendMessage(service.extensionId, message);
  });
};

/*
Function:  sendPingMessage
Params:    - service - the ShareService object to be pinged.
Returns:   Nothing.
Operation: Sends a ping to the service to check it is still active. The message
           contains the following fields:
           - type - the message type, which is "ping",
           - id - the ShareService id.
*/
function sendPingMessage(service) {
  var message = {
    type: MESSAGE_TYPES.PING, // TODO: Add a MESSAGE_TYPE constant
    id: service.id,
  };

  console.log("Pinging", message, service);
  chrome.runtime.sendMessage(service.extensionId, message, function(response) {
    pingMessageResponse(service, response);
  });
};

/*
Function:  pingMessageResponse
Params:    - service - the ShareService object that was pinged.
           - response - the response received from the external extension.
Returns:   Nothing.
Operation: Checks that the extension pinged is still there and removes it if it is
           not or if its response indicates that it should be removed.
*/
function pingMessageResponse(service, response) {
  var removeService = false;
  if (chrome.runtime.lastError) {
    if (chrome.runtime.lastError.message == EXT_NOT_FOUND_ERROR) {
      // TODO: Add EXT_NOT_FOUND_ERROR constant
      removeService = true;
    };
  };
  if (response) {
    if (response.remove) {
      removeService = true;
    };
  };

  if (removeService) {
    removeShareServiceFromStorage(service);
  };
};
