/*
Function:  getShareServiceFromStorage
Params:    - id - id of the ShareService to retrieve from storage. Set to null to
           retrieve all ShareServices
           - callback - function to call on retrieved ShareService object.
Returns:   Nothing.
Operation: Retrieves a specified ShareService object from storage and calls a
           callback function on the retrieved object. If the requested object is
           not found, the callback will be called with a null argument.
*/
function getShareServiceFromStorage(id, callback)
{
  chrome.storage.sync.get("services", function(obj) {
    if (id == null) {
      var returnObject = obj.services
    }
    else {
      console.log("Getting ShareService: " + id);
      if (obj.services[id] == undefined) {
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
function addShareServiceToStorage(service, callback)
{
  console.log("Storing ShareService", service);
  getShareServiceFromStorage(null, function(services) {
    services[service.id] = service;
    chrome.storage.local.set({"services": services}, callback);
  });
};

/*
Function:  receiveShareServiceRequest
Params:    - request - details of ShareService requested
           - sender - object containing the id of the ShareService which sent the
           request
Returns:   Nothing.
Operation: Called when a ShareService request message is received. Verifies the
           request and adds it to storage.
           TODO: add success/failure response to original service.
*/
function receiveShareServiceRequest(request, sender)
{
  console.log("Received ShareService request from extension", sender.id, request);
  var ShareService = {
    id = request.id || sender.id,
    name = request.name || DEFAULT_NAME, // TODO: add DEFAULT_NAME constant
    icon = request.icon || DEFAULT_ICON, // TODO: add DEFAULT_ICON constant
    extensionId = sender.id
  };
  addShareServiceToStorage(ShareService);
};
