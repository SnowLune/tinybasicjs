class Terminal {
   constructor() {
      this.cols = 80;
      this.lines = 24;
      this.cursor = { x: 0, y: 0 };
      this.inputBuffer = "";
      // VT220 style cursors, 0 for block; 1 for underline
      this.cursorStrings = ["█", "_"];
      this.cursorType = 0;
      this.createNewBuffer();
      this.memory;
      this.program = new Program(this);
   }

   createNewBuffer() {
      this.display = [];

      for (let i = 0; i < this.lines; i++) {
         this.display.push("");
      }
      this.setCursor(0, 0);
   }

   lineFeed() {
      // If at the last line, scroll text and reset cursor column to 0
      if (this.cursor.y === this.lines - 1) {
         this.display = this.display.slice(1);
         this.display.push("");
         this.setCursor(0, this.cursor.y);
      }
      // Set cursor to the left and down
      else this.setCursor(0, this.cursor.y + 1);
   }

   backspace() {
      if (this.cursor.x === 0 && this.cursor.y === 0) return false;
      else if (this.inputBuffer.lengt === 0) {
         console.warn("Input buffer is empty.");
         return false;
      }

      // The string contents of the line we're modifying
      let lineBuffer;
      // The index of the line being modified
      let line;
      // The index of the char being deleting
      let column;

      if (this.cursor.x === 0) {
         line = this.cursor.y - 1;
         column =
            this.display[line].length === 0 ? 0 : this.display[line].length - 1;
      } else {
         line = this.cursor.y;
         column = this.cursor.x - 1;
      }

      console.log({ column, line });

      lineBuffer = this.display[line];

      if (column === 0) {
         this.display[line] = lineBuffer.slice(column + 1);
      } else {
         this.display[line] =
            lineBuffer.slice(0, column) + lineBuffer.slice(column + 1);
      }

      this.inputBuffer = this.inputBuffer.slice(0, this.inputBuffer.length - 1);
      this.setCursor(column, line);
   }

   del(line, cursor = this.cursor) {
      let splitLine = line.split("");
      splitLine[cursor.x] = null;
      splitLine = splitLine.filter((c) => c !== null);
      splitLine.push(" ");
   }

   clearScreen() {
      this.createNewBuffer();
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
      x = Math.min(this.cols - 1, x);
      y = Math.min(this.lines - 1, y);
      this.cursor.x = x;
      this.cursor.y = y;
   }

   writeCursor() {
      this.insertChar(
         this.cursorStrings[this.cursorType],
         this.cursor.x,
         this.cursor.y
      );
   }

   insertChar(char, column, line) {
      // Split line string
      let splitLine = this.display[line].split("");

      // Set char at cursor index
      splitLine[column] = char;

      // Rejoin and save string to buffer
      this.display[line] = splitLine.join("");
   }

   insertCharAtCursor(char, column = this.cursor.x, line = this.cursor.y) {
      this.insertChar(char, column, line);

      if (this.cursor.x === this.cols - 1) this.lineFeed();
      else this.setCursor(this.cursor.x + 1, this.cursor.y);
   }

   input(char) {
      this.inputBuffer += char;
      this.insertCharAtCursor(char);
   }

   readInputBuffer(input = this.inputBuffer) {
      input = input.trim();
      switch (input) {
         case "CLEAR":
            this.clearScreen();
            break;
         case "LIST":
            let program = this.program.LIST;
            program.forEach((s, i) => {
               this.print(`${i} ${s}`);
               this.lineFeed();
            });
            break;
         case "RUN":
            console.log("Running program...");
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
         this.insertCharAtCursor(stream[i].toUpperCase());
      }
   }
}
