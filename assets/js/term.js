// CHARACTER CODES
const NUL = 0;
const BS = 8;
const HT = 9;
const LF = 10;
const CR = 13;
// SPACE
const SP = 32;
// ASCII START: SPACE
const printableAsciiStart = 32;
// ASCII END: TILDE
const printableAsciiEnd = 126;
// CURSORS / MARKERS
const markerFullBlock = 32;
const markerUnderline = 95;

class Terminal
{
   constructor(displayEl)
   {
      this.lines = 24;
      this.cols = 80;

      this.cursor = { x: 0, y: 0 };
      // The current input line
      this.inputBuffer = [];
      // Contains all characters to be rendered
      this.outputBuffer = [];

      this.program = new Program(this);
      this.output = new Output(this, displayEl);

      this.output.init();
   }

   scrollByLines(lines = 1)
   {
      this.outputBuffer = this.outputBuffer.slice(this.cols * lines);
   }

   carriageReturn()
   {
      this.cursor.x = 0;
      this.lineFeed();
   }

   lineFeed()
   {
      // If at the last line, scroll text
      if (this.cursor.y === this.lines - 1) {
         this.scrollByLines(1);
      }

      // Move cursor down one line and to the left
      this.cursorPosition(0, this.cursor.y + 1);
   }

   backspace()
   {
      if (this.cursor.x === 0 && this.cursor.y === 0) return false;
      else if (this.inputBuffer.length === 0) {
         console.warn("Input buffer is empty.");
         return false;
      }

      let i = this.getIndexFromPosition(this.cursor.y, this.cursor.x);
      this.outputBuffer = this.outputBuffer
         .slice(0, i)
         .concat(this.outputBuffer.slice(i + 1));
   }

   clearScreen()
   {
      this.outputBuffer = [];
      this.cursor.x = 0;
      this.cursor.y = 0;
   }

   // Set the position of the cursor Absolutely
   cursorPosition(x = 0, y = 0)
   {
      x = Math.min(this.output.cols - 1, x);
      y = Math.min(this.output.lines - 1, y);
      this.cursor.x = x;
      this.cursor.y = y;
   }

   // Convert a line/column position to the corresponding zero-based index
   getIndexFromPosition(line, column)
   {
      let index = line * (this.output.cols - 1) + column + line;
      return index;
   }

   getPositionFromIndex(index) {
      if (index > this.lines * this.cols - 1) {
         console.error("Index out of bounds.")
         return false;
      }
      else {
         let line = (index + 1) / this.cols;
         let column = index % this.cols;
         return { line, column }
      }
   }

   // Output a character at an absolute position in the framebuffer
   putCharAtPosition(char, line, column)
   {
      let bufferIndex = this.getIndexFromPosition(line, column);
      this.outputBuffer[bufferIndex] = char;
   }

   // Output a character at the cursor and move the cursor forward
   putCharAtCursor(char)
   {
      this.putCharAtPosition(char, this.cursor.y, this.cursor.x);

      if (char === CR || this.cursor.x === this.cols - 1)
         this.lineFeed();
      else
         this.cursorPosition(this.cursor.x + 1, this.cursor.y);
   }

   putChar(c)
   {
      this.outputBuffer += c;
   }

   getChar(char)
   {
      this.inputBuffer.push(char);

      // if (char === "\r") this.readInputBuffer();

      // echo input
      this.putCharAtCursor(char);
   }

   readInputBuffer(input = this.inputBuffer)
   {
      input = input.trim();
      switch (input) {
         case "CLEAR":
            this.clearScreen();
            break;
         default:
            // Pass to program for further parsing
            this.program.parse([input]);
            break;
      }

      // Clear input buffer
      this.inputBuffer = [];
   }

   print(stream)
   {
      if (typeof stream !== "string") {
         console.error("Invalid stream type, expected string.");
         return;
      }
      for (let i = 0; i < stream.length; i++) {
         if (stream[i] === "\n" || stream[i] === "\r") this.lineFeed();
         else this.putCharAtCursor(stream[i].toUpperCase());
      }
   }
}

class Output 
{
   constructor(terminal, displayEl)
   {
      this.lines = terminal.lines;
      this.cols = terminal.cols;
      this.display = displayEl;
      this.terminal = terminal;

      this.framebuffer = new Array(this.lines);
      this.refreshInterval = 0;
      this.hz = 1 / 60;
      this.initialized = false;

      this.cursorType = markerFullBlock;
   }

   init()
   {
      // Clear display element
      this.display.textContent = "";

      for (let line = 0; line < this.lines; line++) {
         // New line is x characters long
         this.framebuffer[line] = new Array(this.cols)

         for (let column = 0; column < this.cols; column++) {
            // Initialize each cell with NUL
            this.framebuffer[line][column] = NUL
         }
      }

      if (this.framebuffer.length === this.lines) {
         this.initialized = true;
         this.run();
         return true;
      } else return false;
   }

   render() 
   {
      if (this.initialized === false) {
         console.error("Terminal display not initialized.");
         return false;
      }

      // Render start time for debug
      let startTime = Date.now();

      let outputBufferIndex = 0;

      for (let line = 0; line < this.lines; line++) {
         for (let column = 0; column < this.cols; column++) {
            // Current outputBuffer character
            let bufferChar = this.terminal.outputBuffer[outputBufferIndex];

            if (bufferChar === undefined) {
               this.framebuffer[line][column] = NUL;
            }
            else if (bufferChar === CR || bufferChar === LF) {
               this.framebuffer[line].fill(NUL, column, this.cols);
            }
            else if (bufferChar === HT) {
               // TODO: insert 8 spaces for tab
            }
            else {
               // Put printable character
               this.framebuffer[line][column] = bufferChar;
            }
            outputBufferIndex++;
         }
      }

      // Purge the display
      this.display.innerHTML = "";

      // Paint the framebuffer to the display
      for (let line = 0; line < this.lines; line++) {
         for (let column = 0; column < this.cols; column++) {
            let char;

            if (this.framebuffer[line][column] === NUL)
               char = String.fromCharCode(SP);
            else
               char = String.fromCharCode(this.framebuffer[line][column]);

            // Append to display element
            this.display.textContent += char;
         }
         this.display.textContent += String.fromCharCode(LF);
      }

      // Insert cursor
      let cursorIndex = this.terminal.getIndexFromPosition(
         this.terminal.cursor.y, 
         this.terminal.cursor.x
      ) + this.terminal.cursor.y;

      let cursor;
      
      if (this.cursorType === markerUnderline)
         cursor = `<span class="cursor underline-cursor">`
      else 
         cursor = `<span class="cursor fullblock-cursor">`
      cursor += `${String.fromCharCode(this.cursorType)}</span>`;
      
      let displayTemp = this.display.textContent.split("");
      displayTemp.splice(cursorIndex, 1, cursor);
      this.display.innerHTML = displayTemp.join("");

      console.debug(`Rendered frame in ${Date.now() - startTime} ms.`);
   }

   run()
   {
      let buffer;
      let lastBuffer;
      let cursor;
      let lastCursor;

      this.refreshInterval = setInterval(() => {
         buffer = this.terminal.outputBuffer.join(",");
         cursor = `${this.terminal.cursor.x},${this.terminal.cursor.y}`;

         if (buffer !== lastBuffer || cursor !== lastCursor) {
            this.render();
         }

         lastBuffer = buffer;
         lastCursor = cursor;
      }, this.hz * 1000);
   }

   stop()
   {
      clearInterval(this.refreshInterval);
   }
}
