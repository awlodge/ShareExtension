/*
Function:  onInit
Params:    - details - object containing details of why function was called.
Returns:   Nothing.
Operation: Called when the extension is installed, updated or Chrome is updated.
           When the extension is installed, adds the alarm to ping the services
           periodically. Adds the bulit-in services to the services in storage.
*/
function onInit(details) {
  if (details.reason == "install") {
  	console.log("Extension installed.");
    chrome.alarms.create(PING_ALARM_NAME, {periodInMinutes: PING_ALARM_PERIOD});
    for (var key in builtInServices) {
      builtInServices[key].addToStorage();
    };
  };
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

document.addEventListener("DOMContentLoaded", function() {
  chrome.runtime.onInstalled.addListener(onInit);
  chrome.runtime.onMessageExternal.addListener(receiveShareServiceRequest);
  chrome.alarms.onAlarm.addListener(onAlarm);
});
