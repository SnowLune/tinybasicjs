class Terminal {
   constructor() {
      this.cols = 80;
      this.lines = 24;
      this.cursor = { x: 0, y: 0 };
      this.inputBuffer = "";
      this.blankLine = "";
      for (let j = 0; j < this.cols; j++) {
         this.blankLine += " ";
      }
      this.newLineBuffer();
   }

   newLineBuffer() {
      this.display = [];

      for (let i = 0; i < this.lines; i++) {
         this.display.push(this.blankLine);
      }
      this.setCursor(0, 0);
   }

   lineFeed() {
      // If at the last line, reset cursor column to 0 and scroll text
      if (this.cursor.y === this.lines - 1) {
         this.setCursor(0, this.cursor.y);
         this.display = this.display.slice(1);
         this.display.push(this.blankLine);

      }
      // Set cursor to the left and down 
      else this.setCursor(0, this.cursor.y + 1);
   }

   returnChar() {

   }

   del(line, cursor = this.cursor) {
      let splitLine = line.split("");
      splitLine[cursor.x] = null;
      splitLine = splitLine.filter((c) => c !== null);
      splitLine.push(" ");
   }

   clearScreen() {
      this.newLineBuffer();
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
      this.writeCursor();
   }

   writeCursor() {
      const cursorType = "█";
      this.insertChar(cursorType, this.cursor.x, this.cursor.y);
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
      this.writeCursor();
   }

   input(char) {
      this.inputBuffer += char;
      this.insertCharAtCursor(char);
   }

   readInputBuffer() {
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
