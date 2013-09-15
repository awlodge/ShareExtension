// Types of messages sent to external extensions.
const MESSAGE_TYPE = {
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

const REQUEST_MESSAGES = {
	SUCCESS: "The ShareService was added successfully.",
	ID_TYPE_ERROR: "The 'id' field is not a string.",
	NAME_TYPE_ERROR: "The 'name' field is not a string.",
	ICON_TYPE_ERROR: "The 'icon' field is not a string.",
	ID_NOT_UNIQUE: "The 'id' is not unique.",
	ICON_NOT_FOUND: "The given icon could not be found."
};
