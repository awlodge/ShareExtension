/*
Function:  createShareButton
Params:    - service - ShareService object to create the button for.
Returns:   HTML "td" element for the button for the service.
Operation: Creates a button cell for the specified service. The cell contains the
           service's title and icon and, when clicked, sends a share message to the
           service's extension.
TODO: Add onclick functionality.
*/
function createShareButton(service) {
  var cell = document.createElement("td");
  cell.setAttribute("class", "service-button");
  cell.setAttribute("id", service.extensionId + " " + service.id);

  var image = document.createElement("img");
  image.setAttribute("class", "service-icon");
  image.setAttribute("src", service.icon);
  image.setAttribute("alt", service.name);

  var text = document.createElement("div");
  text.setAttribute("class", "service-name");
  text.innerText = service.name;

  cell.appendChild(image);
  cell.appendChild(document.createElement("br"));
  cell.appendChild(text);

  return cell;
};

/*
Function:  addCell
Params:    - cell - the cell to be added.
Returns:   Nothing.
Operation: Adds a new cell to the table of buttons. Buttons are added in rows of
           four, so this function creates new rows in the table to maintain rows of
           four buttons.
*/
function addCell(cell) {
  var table = document.getElementById("button-table")
  var row;

  if (table.rows.length == 0) {
    row = table.insertRow();
  }
  else if (table.rows[table.rows.length - 1].cells.length == 4) {
    row = table.insertRow(-1);
  }
  else {
    row = table.rows[table.rows.length - 1];
  };

  row.appendChild(cell);
};
