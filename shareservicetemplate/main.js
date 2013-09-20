// String id of the Share Extension extension.
const SHARE_EXTENSION_ID = "";

var shareService = {};

// Enter the name and path of the icon for the service here.
shareService.SHARE_SERVICE_NAME = "";
shareService.SHARE_SERVICE_ICON = "";

/*
Function:  setUp
Params:    - details - object containing the properties of the new ShareService.
Returns:   Nothing.
Operation: Sends a request for a new ShareService to the Share Extension.
*/
shareService.setUp = function(details) {
  chrome.runtime.sendMessage(SHARE_EXTENSION_ID, details, function(response) {
  	console.log(response.status, response.message);
  });
};

/*
Function:  receiveShareRequest
Params:    - message - the message received from an external extension.
           - sender - details of the sender of the message.
           - sendResponse - function to call to respond to the message.
Returns:   Nothing
Operation: Called when a message from an external extension is received. Verifies
           that the extension is the Share Extension and that it is a share
           request, then handles the share request.
*/
shareService.receiveShareRequest = function(message, sender, sendResponse) {
  if (sender.id == SHARE_EXTENSION_ID) {
  	if (message.type == "share-request") {
      console.log("Received share resquest", message, sender);
  		shareService.handleShareRequest(message, function(responseMessage) {
  			if (responseMessage) {
  				sendResponse({message: responseMessage});
  			};
  		});

      return true;
  	};
  };
};

/*
Function:  handleShareRequest
Params:    - message - the message of the share request received.
           - callback - function to call when the handling is complete. The
           function should take a string parameter as its argument, which is the
           message, if any, to send back to the share extension.
Returns:   Nothing.
Operation: Use this function to handle a share request that is received and send a
           message back to the share extension if required.
*/
shareService.handleShareRequest = function(message, callback) {
	// Enter handling code here.
	// If required, call the callback with a response message when complete.
	return;
};

chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason = "install") {
		var serviceDetails = {
			name: shareService.SHARE_SERVICE_NAME,
			icon: chrome.runtime.getURL(shareService.SHARE_SERVICE_ICON)
		};
		shareService.setUp(serviceDetails);
	};
})

chrome.runtime.onMessageExternal.addListener(shareService.receiveShareRequest);
