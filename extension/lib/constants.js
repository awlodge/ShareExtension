// Types of messages sent to external extensions.
const MESSAGE_TYPES = {
	SHARE_REQUEST: "share-request",
	PING: "ping"
};

// Name used for ShareService when no name is given.
const DEFAULT_NAME = "Unnamed ShareService";

// Icon used for ShareService when no icon is given.
const DEFAULT_ICON = "/icons/icon.png";

// Error message given by Chrome when sending a message to an extension that does
// not exist.
const EXT_NOT_FOUND_ERROR = "Could not establish connection. " +
	"Receiving end does not exist.";

// Messages sent back to external extension in response to a request to add a new
// ShareService.
const REQUEST_MESSAGES = {
	SUCCESS: "The ShareService was added successfully.",
	ID_TYPE_ERROR: "The 'id' field is not a string.",
	NAME_TYPE_ERROR: "The 'name' field is not a string.",
	ICON_TYPE_ERROR: "The 'icon' field is not a string.",
	ID_NOT_UNIQUE: "The 'id' is not unique.",
	ICON_NOT_FOUND: "The given icon could not be found."
};

// Name and period parameters for the alarm the pings the services periodically.
const PING_ALARM_NAME = "ping-alarm";
const PING_ALARM_PERIOD = 30;

// Time in milliseconds to display response to a share request.
const RESPONSE_MESSAGE_TIMEOUT = 2000;

// Colors for popup
const DEFAULT_COLOR = "#33b5e5";
const DEFAULT_COLOR_TRANSLUCENT = "rgba(51, 181, 229, 0.6)";
const BACKGROUND_COLOR = "white";
