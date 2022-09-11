class Terminal {
   constructor(displayEl) {
      this.lines = 24;
      this.cols = 80;

      this.cursor = { x: 0, y: 0 };
      //
      this.inputBuffer = [];
      // Contains all characters to be rendered
      this.outputBuffer = [];

      this.program = new Program(this);
      this.output = new Output(this, displayEl);

      this.output.init();
   }

   createNewBuffer() {
      if (this.output.initialized) this.setCursor(0, 0);
   }

   lineFeed() {
      // If at the last line, scroll text and reset cursor column to 0
      if (this.cursor.y === this.lines - 1) {
         this.output.framebuffer = this.output.framebuffer.slice(1);
         this.output.framebuffer.push([]);
         this.setCursor(0, this.cursor.y);
      }
      // Set cursor to the left and down
      else this.setCursor(0, this.cursor.y + 1);
   }

   backspace() {
      if (this.cursor.x === 0 && this.cursor.y === 0) return false;
      else if (this.inputBuffer.length === 0) {
         console.warn("Input buffer is empty.");
         return false;
      }

      // // The string contents of the line we're modifying
      // let lineBuffer;
      // // The index of the line being modified
      // let line;
      // // The index of the char being deleting
      // let column;

      // if (this.cursor.x === 0) {
      //    line = this.cursor.y - 1;
      //    column =
      //       this.display[line].length === 0 ? 0 : this.display[line].length - 1;
      // } else {
      //    line = this.cursor.y;
      //    column = this.cursor.x - 1;
      // }

      // console.log({ column, line });

      // lineBuffer = this.display[line];

      // if (column === 0) {
      //    this.display[line] = lineBuffer.slice(column + 1);
      // } else {
      //    this.display[line] =
      //       lineBuffer.slice(0, column) + lineBuffer.slice(column + 1);
      // }

      // this.inputBuffer = this.inputBuffer.slice(0, this.inputBuffer.length - 1);
      let i = this.getIndexFromPosition(this.cursor.y, this.cursor.x);
      this.outputBuffer = this.outputBuffer
         .slice(0, i)
         .concat(this.outputBuffer.slice(i + 1));
      // this.setCursor(column, line);
   }

   del(line, cursor = this.cursor) {
      let splitLine = line.split("");
      splitLine[cursor.x] = null;
      splitLine = splitLine.filter((c) => c !== null);
      splitLine.push(" ");
   }

   clearScreen() {
      this.outputBuffer = [];
      this.cursor.x = 0;
      this.cursor.y = 0;
   }

   // Move the cursor forwards or backwards from it's current position
   moveCursor(x) {
      let currentX = this.cursor.x;
      let currentY = this.cursor.y;

      // if ()
      // this.setCursor
   }

   // Set the position of the cursor Absolutely
   setCursor(x = 0, y = 0) {
      x = Math.min(this.output.cols - 1, x);
      y = Math.min(this.output.lines - 1, y);
      this.cursor.x = x;
      this.cursor.y = y;
   }

   // Convert a line/column position to the corresponding zero-based index
   getIndexFromPosition(line, column) {
      let index = line * (this.output.cols - 1) + column + line;
      return index;
   }

   // Output a character at an absolute position in the framebuffer
   putCharAtPosition(char, line, column) {
      let bufferIndex = this.getIndexFromPosition(line, column);
      this.outputBuffer[bufferIndex] = char;
   }

   // Output a character at the cursor and move the cursor forward
   putChar(char, line = this.cursor.y, column = this.cursor.x) {
      this.putCharAtPosition(char, line, column);

      if (this.cursor.x === this.cols - 1) this.lineFeed();
      else this.setCursor(this.cursor.x + 1, this.cursor.y);
   }

   getChar(char) {
      this.inputBuffer += char;
      this.putChar(char);
   }

   getLine(line) {
      this.inputBuffer = line;
      this.print(this.inputBuffer);
   }

   readInputBuffer(input = this.inputBuffer) {
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
      this.inputBuffer = "";
   }

   print(stream) {
      if (typeof stream !== "string") {
         console.error("Invalid stream type, expected string.");
         return;
      }
      for (let i = 0; i < stream.length; i++) {
         if (stream[i] === "\n" || stream[i] === "\r") this.lineFeed();
         else this.putChar(stream[i].toUpperCase());
      }
   }
}

class Output {
   constructor(terminal, displayEl) {
      this.lines = terminal.lines;
      this.cols = terminal.cols;
      this.display = displayEl;
      this.terminal = terminal;
      // Stores a complete screen render, 80x24 characters
      this.framebuffer = [];

      this.refreshInterval = 0;
      this.hz = 1 / 60;
      this.initialized = false;

      // VT220 style cursors, 0 for block; 1 for underline
      this.cursorStrings = ["█", "_"];
      this.cursorType = 0;
   }

   init() {
      // Clear display element
      this.display.textContent = "";

      // Initialize framebuffer with null chars
      for (let line = 0; line < this.lines; line++) {
         this.framebuffer[line] = [];
         for (let column = 0; column < this.cols; column++) {
            this.framebuffer[line][column] = "\0";
         }
      }
      if (this.framebuffer.length === 24) {
         this.initialized = true;
         this.run();
         return true;
      } else return false;
   }

   render() {
      if (this.initialized == false) {
         console.error("Terminal display not initialized.");
         return false;
      }

      let outputBufferIndex = 0;

      for (let line = 0; line < this.lines; line++) {
         for (let column = 0; column < this.cols; column++) {
            let bufferChar = this.terminal.outputBuffer[outputBufferIndex];
            if (bufferChar !== undefined) {
               switch (bufferChar) {
                  case "\n":
                     line++;
                     break;
                  case "\r":
                     line++;
                     break;
                  case "\t":
                     for (let t = 0; t < 8; t++) {
                        this.framebuffer[line][column];
                     }
                     break;
                  default:
                     this.framebuffer[line][column] = bufferChar;
                     break;
               }
            }
            // If not null char, put null char
            else if (this.framebuffer[line][column] !== "\0") {
               this.framebuffer[line][column] = "\0";
            }

            // if (outputBufferIndex === this.terminal.outputBuffer.length - 1)
            //    console.log(); // return;
            // else
            outputBufferIndex++;
         }
      }

      this.display.textContent = "";

      this.framebuffer.forEach((line, lineN) => {
         if (lineN === this.terminal.cursor.y) {
            line[this.terminal.cursor.x] = this.cursorStrings[this.cursorType];
         }
         this.display.textContent += line.join("").replaceAll("\0", " ");
         this.display.textContent += "\n";
      });
   }

   run() {
      let buffer;
      let lastBuffer;
      let cursor;
      let lastCursor;

      this.refreshInterval = setInterval(() => {
         buffer = this.terminal.outputBuffer.join(",");
         cursor = `${this.terminal.cursor.x},${this.terminal.cursor.y}`;

         if (buffer !== lastBuffer || cursor !== lastCursor) {
            this.render();
            console.log("rendered", Date.now());
         }

         lastBuffer = buffer;
         lastCursor = cursor;
      }, this.hz * 1000);
   }
}
