var facebookService = {};

// Name, id and URL path for the Facebook service.
facebookService.NAME = "Facebook";
facebookService.ID = "facebook";
facebookService.ICON = "/icons/facebook.png";

// ShareService object for the Facebook service.
facebookService.SERVICE = new ShareService({
  id: facebookService.ID,
  name: facebookService.NAME,
  icon: facebookService.ICON,
  extensionId: chrome.runtime.id
});

// URL of the Facebook Share Dialog
facebookService.SHARE_DIALOG_URL = "https://facebook.com/sharer/sharer.php?u=";

/*
Function:  receiveShareRequest
Params:    - message - the message received from an external extension.
           - sender - details of the sender of the message.
Returns:   Nothing
Operation: Called when a message from an external extension is received. Verifies
           that the extension is the Share Extension and that it is a share
           request, then handles the share request.
*/
facebookService.receiveShareRequest = function(message)
{
	if ((message.type == "share-request") && (message.id == facebookService.ID)) {
		facebookService.handleShareRequest(message);
	};
};

/*
Function:  handleShareRequest
Params:    - message - the message of the share request received.
           - callback - function to call when the handling is complete. The
           function should take a string parameter as its argument, which is the
           message, if any, to send back to the share extension.
Returns:   Nothing.
Operation: Opens the Facebook Share Dialog in a popup, with the received page as
           the page to be shared.
*/
facebookService.handleShareRequest = function(message, callback) {
	var url = facebookService.SHARE_DIALOG_URL + message.url;
  chrome.windows.create({type: "detached_panel", url: url});
};

document.addEventListener("DOMContentLoaded", function() {
  builtInServices[facebookService.ID] = facebookService.SERVICE;
  chrome.runtime.onMessage.addListener(facebookService.receiveShareRequest);
});
