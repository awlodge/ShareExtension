var emailService = {};

// Name, id and URL path for the Facebook service.
emailService.NAME = "Send email";
emailService.ID = "email";
emailService.ICON = "/icons/email.png";

// ShareService object for the Facebook service.
emailService.SERVICE = new ShareService({
  id: emailService.ID,
  name: emailService.NAME,
  icon: emailService.ICON,
  extensionId: chrome.runtime.id
});

// Mailto URL
emailService.MAILTO = "mailto:?subject=Check this out!&body=";

/*
Function:  receiveShareRequest
Params:    - message - the message received from an external extension.
           - sender - details of the sender of the message.
Returns:   Nothing
Operation: Called when a message from an external extension is received. Verifies
           that the extension is the Share Extension and that it is a share
           request, then handles the share request.
*/
emailService.receiveShareRequest = function(message)
{
	if ((message.type == "share-request") && (message.id == emailService.ID)) {
		emailService.handleShareRequest(message);
	};
};

/*
Function:  handleShareRequest
Params:    - message - the message of the share request received.
Returns:   Nothing.
Operation: Opens a new email message in a popup, with the link to be shared in the
           body.
*/
emailService.handleShareRequest = function(message) {
	var url = emailService.MAILTO + message.url;
  chrome.windows.create({type: "popup", url: url, height: 600, width: 600});
};

document.addEventListener("DOMContentLoaded", function() {
  builtInServices[emailService.ID] = emailService.SERVICE;
  chrome.runtime.onMessage.addListener(emailService.receiveShareRequest);
});
