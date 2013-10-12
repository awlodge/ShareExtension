// Object containing the set of built-in ShareServices. It is added to by separate
// JavaScript files for each service.
var builtInServices = {};

/*
Function:  onInit
Params:    - details - object containing details of why function was called.
Returns:   Nothing.
Operation: Called when the extension is installed, updated or Chrome is updated.
           When the extension is installed, adds the alarm to ping the services
           periodically. Adds menu to context menu. Adds the bulit-in services to
           the services in storage.
*/
function onInit(details) {
  if (details.reason == "install") {
  	console.log("Extension installed.");

    chrome.alarms.create(PING_ALARM_NAME, {periodInMinutes: PING_ALARM_PERIOD});

    for (var key in builtInServices) {
      builtInServices[key].add();
    };
  };

  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Share...",
    contexts: ["link"]
  });
  getShareServiceFromStorage(null, function(services) {
    for (var key in services) {
      services[key].addContextMenu();
    };
  });
};

/*
Function:  onAlarm
Params:    - alarm - Alarm object that has called the function.
Returns:   Nothing.
Operation: Called when an alarm is sounded. If it is the alarm to ping all the
           services (and this is the only alarm), then it pings all the services.
*/
function onAlarm(alarm) {
  if (alarm.name = PING_ALARM_NAME) {
  	console.log("Alarm sounded. Pinging all services.");
  	pingAllServices();
  };
};

/*
Function:  onContextMenuClicked
Params:    - info - inforrmation about the item clicked and the context where the
           click happened.
Returns:   Nothing
Operation: Called when one of the extension's context menu buttons is clicked.
           Determines which ShareService was clicked and sends a share request
           message to that service.
*/
function onContextMenuClicked(info) {
  console.log("Context menu button clicked.", info);
  getShareServiceFromStorage({fullKey: info.menuItemId}, function(service) {
    service.sendShareMessage({url: info.linkUrl});
  });
};

document.addEventListener("DOMContentLoaded", function() {
  chrome.runtime.onInstalled.addListener(onInit);
  chrome.runtime.onMessageExternal.addListener(receiveShareServiceRequest);
  chrome.runtime.onMessage.addListener(function(s) {console.log(s);})
  chrome.alarms.onAlarm.addListener(onAlarm);
  chrome.contextMenus.onClicked.addListener(onContextMenuClicked);
});
