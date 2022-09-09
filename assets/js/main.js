const displayHz = 1 / 60;

var displayRefreshInterval;
var term = new Terminal();

// Global Element Vars
var display = document.querySelector(".display");
var blank = document.querySelector(".blank");
var clearButtonEl = document.getElementById("clear");

function displayRefresh(interval, terminal) {
   let buffer = [];
   let lastBuffer = [];
   return (interval = setInterval(() => {
      buffer = [...terminal.display].join("");

      if (buffer !== lastBuffer) {
         writeDisplay(terminal);
      }

      lastBuffer = buffer;
   }, displayHz));
}

function writeDisplay(terminal) {
   display.textContent = "";
   terminal.display.forEach((line) => {
      display.textContent += line + "\n";
   });
}

// HANDLERS
function keyHandler(event) {
   const printable =
      " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`" +
      "abcdefghijklmnopqrstuvwxyz{|}~";
   if (printable.includes(event.key)) {
      term.input(event.key.toUpperCase());
   } else if (event.key === "Enter") {
      term.lineFeed();
      term.readInputBuffer();
   }
}

clearButtonEl.addEventListener("click", () => {
   term.clearScreen();
   writeDisplay(term);
});

document.addEventListener("keydown", keyHandler);
document.addEventListener("DOMContentLoaded", () => {
   displayRefresh(displayRefreshInterval, term);
});
