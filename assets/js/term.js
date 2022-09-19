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

/********************************************************************
 * Terminal, modest IO that creates and holds the Tiny BASIC program
 * @param displayEl : The variable that refers to a <pre> element
 *    to use as the terminal display.
 ********************************************************************/
class Terminal
{
   constructor ( displayEl )
   {
      this.lines = 24;
      this.cols = 80;

      this.cursor = { y: 0, x: 0 };
      // The current input line
      this.inputBuffer = [];
      // Contains all characters to be rendered
      this.outputBuffer = [];

      // Audible bell
      this.bellAudio = new Audio( "./assets/sound/750hzbeep.ogg" );
      this.bellAudio.fadeTimeout = 0;

      this.program = new Program( this );
      this.output = new Output( this, displayEl );

      this.output.init();
   }

   // Convert a string to an array of ASCII code integers
   stringToChar ( s )
   {
      return s.split( "" ).map( c => c.charCodeAt() );
   }
   charToString ( c )
   {
      console.log( c );
      let s = c.map( c => String.fromCharCode( c ) ).join( "" );
      return s;
   }

   scrollByLines ( lines = 1 )
   {
      this.outputBuffer = this.outputBuffer.slice( this.cols * lines );

   }

   // Ring the audible bell
   bell ()
   {
      if ( this.bellAudio.readyState === 4 )
         if ( this.bellAudio.paused === false
            && this.bellAudio.fadeTimeout === 0 )
         {
            this.bellAudio.fadeTimeout = setTimeout( () =>
            {
               this.bellAudio.pause();
               this.bellAudio.currentTime = 0;
               this.bellAudio.play();
               this.bellAudio.fadeTimeout = 0;
            }, 50 );
         }
         else
            this.bellAudio.play();
   }

   carriageReturn ()
   {
      this.cursor.x = 0;
      this.lineFeed();
   }

   lineFeed ()
   {
      // If at the last line, scroll text
      if ( this.cursor.y === this.lines - 1 )
      {
         this.scrollByLines( 1 );
      }

      // Move cursor down one line and to the left
      this.cursorPosition( this.cursor.y + 1, 0 );
   }

   backspace ()
   {
      if ( this.cursor.x === 0 && this.cursor.y === 0 )
      {
         this.bell();
         return false;
      }
      else if ( this.inputBuffer.length === 0 )
      {
         this.bell();
         console.warn( "Input buffer is empty." );
         return false;
      }

      this.inputBuffer.splice( this.inputBuffer.length - 1, 1 );
      this.outputBuffer.splice( this.outputBuffer.length - 1, 1 );
      this.cursorBack();
   }

   // Clear the output buffer and reset the cursor
   clearScreen ()
   {
      this.inputBuffer = [];
      this.outputBuffer = [];
      this.cursor.x = 0;
      this.cursor.y = 0;
   }

   // Set the position of the cursor Absolutely
   cursorPosition ( y = 0, x = 0 )
   {
      y = Math.min( this.output.lines - 1, y );
      x = Math.min( this.output.cols - 1, x );
      this.cursor.y = y;
      this.cursor.x = x;
   }

   cursorBack ()
   {
      if ( this.cursor.x === 0 && this.cursor.y > 0 )
         this.cursorPosition( this.cursor.y - 1, this.cols - 1 );
      else
         this.cursorPosition( this.cursor.y, this.cursor.x - 1 );
   }

   cursorForward ()
   {
      if ( this.cursor.x === this.cols - 1 && this.cursor.y < this.lines - 1 )
         this.cursorPosition( this.cursor.y + 1, 0 );
      else
         this.cursorPosition( this.cursor.y, this.cursor.x + 1 );
   }

   // Convert a line/column position to the corresponding zero-based index
   getIndexFromPosition ( line, column )
   {
      let index = line * ( this.output.cols - 1 ) + column + line;
      return index;
   }

   getPositionFromIndex ( index )
   {
      if ( index > this.lines * this.cols - 1 )
      {
         console.error( "Index out of bounds." );
         return false;
      }
      else
      {
         let line = ( index + 1 ) / this.cols;
         let column = index % this.cols;
         return { line, column };
      }
   }

   // Output a character at an absolute position in the framebuffer
   putCharAtPosition ( char, line, column )
   {
      let bufferIndex = this.getIndexFromPosition( line, column );
      this.outputBuffer[ bufferIndex ] = char;
   }

   // Output a character at the cursor and move the cursor forward
   putCharAtCursor ( char )
   {
      this.putCharAtPosition( char, this.cursor.y, this.cursor.x );

      if ( char === CR || this.cursor.x === this.cols - 1 )
         this.lineFeed();
      else
         this.cursorPosition( this.cursor.y, this.cursor.x + 1 );
   }

   getChar ( char )
   {
      this.inputBuffer.push( char );

      this.program.getLine( char );
   }

   readInputBuffer ( input = this.inputBuffer )
   {
      input = this.charToString( input );

      switch ( input )
      {
         case "CLEAR\r":
            this.clearScreen();
            break;
         default:
            // Pass to program for further parsing
            this.program.getLine( input );
            break;
      }

      // Clear input buffer
      this.inputBuffer = [];
   }

   print ( string )
   {
      if ( typeof string !== "string" )
      {
         console.error( "Invalid stream type, expected string." );
         return;
      }

      let chars = this.stringToChar( string );

      for ( let i = 0; i < chars.length; i++ )
      {
         this.putCharAtCursor( chars[ i ] );
      }
   }
}

class Output
{
   constructor ( terminal, displayEl )
   {
      this.lines = terminal.lines;
      this.cols = terminal.cols;
      this.display = displayEl;
      this.terminal = terminal;

      this.framebuffer = new Array( this.lines );
      this.refreshInterval = 0;
      this.hz = 1 / 60;
      this.initialized = false;

      this.cursorType = markerFullBlock;
   }

   init ()
   {
      // Clear display element
      this.display.textContent = "";

      for ( let line = 0; line < this.lines; line++ )
      {
         // New line is x characters long
         this.framebuffer[ line ] = new Array( this.cols );

         for ( let column = 0; column < this.cols; column++ )
         {
            // Initialize each cell with NUL
            this.framebuffer[ line ][ column ] = NUL;
         }
      }

      if ( this.framebuffer.length === this.lines )
      {
         this.initialized = true;
         this.run();
         return true;
      } else return false;
   }

   render ()
   {
      if ( this.initialized === false )
      {
         console.error( "Terminal display not initialized." );
         return false;
      }

      // Render start time for debug
      let startTime = Date.now();

      // Purge the display
      this.display.innerHTML = "";

      // index of the outputBuffer that increments with each column loop
      let outputBufferIndex = 0;

      for ( let line = 0; line < this.lines; line++ )
      {
         for ( let column = 0; column < this.cols; column++ )
         {
            // Current outputBuffer character
            let bufferChar = this.terminal.outputBuffer[ outputBufferIndex ];

            if ( bufferChar === undefined )
            {
               this.framebuffer[ line ][ column ] = NUL;
            }
            else if ( bufferChar === CR || bufferChar === LF )
            {
               this.framebuffer[ line ].fill( NUL, column, this.cols );
            }
            else if ( bufferChar === HT )
            {
               // TODO: insert 8 spaces for tab
            }
            else
            {
               // Put printable character
               this.framebuffer[ line ][ column ] = bufferChar;
            }

            // Inc index for output buffer
            outputBufferIndex++;

            // Paint fb char to display
            let char;

            if ( this.framebuffer[ line ][ column ] === NUL )
               char = String.fromCharCode( SP );
            else
               char = String.fromCharCode( this.framebuffer[ line ][ column ] );

            // Append char to display element
            this.display.textContent += char;
         }
         // Append newline to display element
         this.display.textContent += String.fromCharCode( LF );
      }

      // Insert cursor
      let cursorIndex = this.terminal.getIndexFromPosition(
         this.terminal.cursor.y,
         this.terminal.cursor.x
      ) + this.terminal.cursor.y;

      let cursor;

      if ( this.cursorType === markerUnderline )
         cursor = `<span class="cursor underline-cursor">`;
      else
         cursor = `<span class="cursor fullblock-cursor">`;
      cursor += `${ String.fromCharCode( this.cursorType ) }</span>`;

      let displayTemp = this.display.textContent;
      // Split for splice
      displayTemp = displayTemp.split( "" )
         // Sanitize lt/gt to entity
         .map( c => c.replace( "<", "&lt;" ).replace( ">", "&gt;" ) );
      displayTemp.splice( cursorIndex, 1, cursor );
      this.display.innerHTML = displayTemp.join( "" );

      console.debug( `Rendered frame in ${ Date.now() - startTime } ms.` );
   }

   run ()
   {
      let buffer;
      let lastBuffer;
      let cursor;
      let lastCursor;

      this.refreshInterval = setInterval( () =>
      {
         buffer = this.terminal.outputBuffer.join( "," );
         cursor = `${ this.terminal.cursor.x },${ this.terminal.cursor.y }`;

         if ( buffer !== lastBuffer || cursor !== lastCursor )
         {
            this.render();
         }

         lastBuffer = buffer;
         lastCursor = cursor;
      }, this.hz * 1000 );
   }

   stop ()
   {
      clearInterval( this.refreshInterval );
   }
}
