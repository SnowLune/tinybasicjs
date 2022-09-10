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
   let cursor = {};
   let lastCursor = {};

   return (interval = setInterval(() => {
      buffer = [...terminal.display].join(",");
      cursor = `${terminal.cursor.x},${terminal.cursor.y}`;

      if (buffer !== lastBuffer || cursor !== lastCursor) {
         writeDisplay(terminal);
      }
      lastBuffer = buffer;
      lastCursor = cursor;
   }, displayHz * 1000));
}

function writeDisplay(terminal) {
   display.textContent = "";
   terminal.display.forEach((line, lineNumber) => {
      let lineBuffer = "";

      for (let j = 0; j <= line.length; j++) {
         if (lineNumber === terminal.cursor.y && j === terminal.cursor.x) {
            lineBuffer += terminal.cursorStrings[terminal.cursorType];
         } else {
            lineBuffer += line[j] || "";
         }
      }
      display.textContent += lineBuffer.padEnd(terminal.cols, " ") + "\n";
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
   } else if (event.key === "Backspace") {
      term.backspace();
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
