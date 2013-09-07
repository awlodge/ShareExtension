/*
Function:  getShareExtFromStorage
Params:    - id - id of the ShareExtension to retrieve from storage. Set to null to
           retrieve all ShareExtensions
           - callback - function to call on retrieved ShareExtension object.
Returns:   Nothing.
Operation: Retrieves a specified ShareExtension object from storage and calls a
           callback function on the retrieved object. If the requested object is
           not found, the callback will be called with a null argument.
*/
function getShareExtFromStorage(id, callback)
{
  chrome.storage.sync.get("extensions", function(obj) {
    if (id == null) {
      var returnObject = obj.extensions;
    }
    else {
      console.log("Getting extension: " + id);
      if (obj.extensions[id] == undefined) {
        console.warn("Extension not found: " + id);
      };
      var returnObject = obj.extensions[id];
    };

    callback(returnObject);
  });
};

/*
Function:  addShareExtToStorage
Params:    - extension - ShareExtension object to be added to storage.
           - callback - optional function to be called when the storing is done.
Returns:   Nothing.
Operation: Adds the details of a ShareExtension object to storage.
*/
function addShareExtToStorage(extension, callback)
{
  console.log("Storing extension", extension);
  getShareExtFromStorage(null, function(extensions) {
    extensions[extension.id] = extension;
    chrome.storage.local.set({"extensions": extensions}, callback);
  });
}
