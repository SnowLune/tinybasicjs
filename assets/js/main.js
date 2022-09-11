// Global Element Vars
var display = document.querySelector(".display");
var clearButtonEl = document.getElementById("clear");
var inputEl = document.getElementById("input-fallback");

// Terminal
var term;

// HANDLERS
function keyHandler(event) {
   const printable =
      " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`" +
      "abcdefghijklmnopqrstuvwxyz{|}~";
   if (printable.includes(event.key)) {
      // term.getChar(event.key.toUpperCase());
   } else if (event.key === "Enter") {
      term.readInputBuffer();

      // Clear input element
      inputEl.value = "";
      term.print("\n");
   } else if (event.key === "Backspace") {
      term.backspace();
   }
}

clearButtonEl.addEventListener("click", () => {
   term.clearScreen();
   writeDisplay(term);
});

// Handle certain key events
document.addEventListener("keydown", keyHandler);

inputEl.addEventListener("blur", () => inputEl.focus());
inputEl.addEventListener("input", () => {
   term.getLine(inputEl.value);
});

document.addEventListener("DOMContentLoaded", () => {
   // Set up terminal
   term = new Terminal(display);

   inputEl.focus();
});
