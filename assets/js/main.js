const displayHz = 1 / 60;

var displayLoopInterval;

// Global Element Vars
var display = document.querySelector(".terminal");

// function displayLoop(interval) {
//    let buffer, lastBuffer;
//    return (interval = setInterval(() => {
//       buffer = display.value.split("\n").pop().toUpperCase();

//       if (buffer !== lastBuffer) {
//          console.log(buffer);
//          display.value = display.value.toUpperCase();
//          if (buffer === "CLEAR") display.value = "";
//       }

//       lastBuffer = buffer;
//    }, displayHz));
// }

// HANDLERS
function keyHandler(event) {
   const printable =
      " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`" +
      "abcdefghijklmnopqrstuvwxyz{|}~";
   if (printable.includes(event.key)) {
      display.children[0].textContent = event.key.toUpperCase();
   }
}

display.addEventListener("change", () => {
   console.log(display.value);
   display.focus();
});

display.addEventListener("blur", () => {
   display.focus();
});

document.addEventListener("keydown", keyHandler);

document.addEventListener("DOMContentLoaded", () => {
   [...display.children].forEach((line) => {
      for (let i = 0; i < 80; i++) {
         line.textContent += "x";
      }
   });
});
