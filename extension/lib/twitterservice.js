var twitterService = {};

// Name, id and URL path for the Twitter service.
twitterService.NAME = "Twitter";
twitterService.ID = "twitter";
twitterService.ICON = "/icons/twitter.png";

// ShareService object for the Twitter service.
twitterService.SERVICE = new ShareService({
  id: twitterService.ID,
  name: twitterService.NAME,
  icon: twitterService.ICON,
  extensionId: chrome.runtime.id
});

// URL of the Twitter Share Dialog
twitterService.SHARE_DIALOG_URL = "https://twitter.com/share?url=";

/*
Function:  receiveShareRequest
Params:    - message - the message received from an external extension.
           - sender - details of the sender of the message.
Returns:   Nothing
Operation: Called when a message from an external extension is received. Verifies
           that the extension is the Share Extension and that it is a share
           request, then handles the share request.
*/
twitterService.receiveShareRequest = function(message)
{
	if ((message.type == "share-request") && (message.id == twitterService.ID)) {
		twitterService.handleShareRequest(message);
	};
};

/*
Function:  handleShareRequest
Params:    - message - the message of the share request received.
           - callback - function to call when the handling is complete. The
           function should take a string parameter as its argument, which is the
           message, if any, to send back to the share extension.
Returns:   Nothing.
Operation: Opens the Twitter Share Dialog in a popup, with the received page as
           the page to be shared.
*/
twitterService.handleShareRequest = function(message, callback) {
	var url = twitterService.SHARE_DIALOG_URL + message.url;
  chrome.windows.create({type: "detached_panel", url: url});
};

document.addEventListener("DOMContentLoaded", function() {
  builtInServices[twitterService.ID] = twitterService.SERVICE;
  chrome.runtime.onMessage.addListener(twitterService.receiveShareRequest);
});
