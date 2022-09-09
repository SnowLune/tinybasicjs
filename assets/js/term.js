class terminal {
   constructor() {
      this.newLineBuffer()
   }

   newLineBuffer() {
      this.screenLines = [];
      for (let i = 0; i < 24; i++) {
         this.screenLines.push("");
      }
      this.cursorPosition = [0, 0];
   }

   lineFeed(n = 1) {
      this.screenLines.forEach((line, lineIndex) => {
         line = this.screenLines[lineIndex + 1];
      });
   }

   clearScreen() {
      this.newLineBuffer();
   };
}
