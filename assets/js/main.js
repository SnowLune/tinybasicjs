// Global Element Vars
var display = document.querySelector(".display");
var clearButtonEl = document.getElementById("clear");
var inputEl = document.getElementById("input");

// Terminal
var term;

// Resets input value to a specific string 
// to prevent auto-caps wonkiness on mobile
function clearInput(input = inputEl)
{
   input.value = "> ";
   return input.value;
}

// HANDLERS
function keyHandler(event)
{
   if (event.key === "Enter") {
      event.preventDefault();
      term.getChar(CR)
      // Clear input element
      clearInput();
   } else if (event.key === "Backspace") {
      event.preventDefault();

      term.backspace();
   }
}

function inputHandler(event)
{
   const c = event.target.value.split("").pop().toUpperCase().charCodeAt();
   clearInput();

   if (c >= printableAsciiStart && c <= printableAsciiEnd) {
      term.getChar(c);
   }
   else 
      return false;
}

clearButtonEl.addEventListener("click", () => { term.clearScreen(); });

// Handle certain key events
document.addEventListener("keydown", keyHandler);

inputEl.addEventListener("blur", () => inputEl.focus());
inputEl.addEventListener("input", inputHandler);

document.addEventListener("DOMContentLoaded", () => {
   // Set up terminal
   term = new Terminal(display);

   inputEl.focus();
   clearInput();
});
