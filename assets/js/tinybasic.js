class Program
{
   constructor ( terminal )
   {
      // Addresses 0x0000 - 0xFFFF
      this.memory = new Array( 2 ** 16 ).fill( 0 );
      this.inputBuffer = [];
      this.terminal = terminal;
   }

   main ()
   {
      /***************
       * Memory Usage
       ***************/
      this.botScr = 0x00080;
      this.topScr = 0x00200;
      this.botRAM = 0x02000;
      this.defaultLimit = 0x04000;
      this.botROM = 0x0F000;

      /********************************************
       * Define variables, buffer, and stack in RAM
       ********************************************/
      this.keyword = 0x00;
      this.textLimit;
      this.varBegin;
      this.current = 0x00;
      this.stackGosub;
      this.varNext;
      this.stackInput;
      this.loopVar;
      this.loopIncrement;
      this.loopLimit;
      this.loopLine;
      this.loopPointer;
      this.randPointer;
      this.buffer;
      this.stackLimit;
      this.stack;
      this.textUnf = 0x00;
      this.text;

      /*******************
       * String Constants
       *******************/
      this.message = "TINY BASIC V3.0\r";
      this.OK = "OK\r";
      this.WHAT = "WHAT?\r";
      this.HOW = "HOW?\r";
      this.SORRY = "SORRY\r";

      // Var object
      this.var = {};
      // Initialize variables A-Z
      for ( let l = 0; l < 26; l++ )
      {
         this.var[ `${ String.fromCharCode( 65 + l ) }` ] = 0x0000;
      }

      this.init();
   }

   /**************************************************
    * Routines
    **************************************************/

   // analog: RSTART
   start ()
   {
      this.current = 0;

      this.start1();

   }

   // analog: ST1
   start1 ()
   {
      this.loopVar = 0;
      this.stackGosub = 0;

      this.printString( this.OK );

      this.start2();
   }

   // analog: ST2
   start2 ()
   {
      // Prompt ">"
      let prompt = 62;
      this.outChar( prompt );

      // Execution stops here
      // ... Waiting for term to call getLine with the input buffer
   }

   // analog: PRTSTG
   printString ( string )
   {
      this.terminal.stringToChar( string ).forEach( c =>
      {
         this.outChar( c );

         if ( c === CR )
            return;
      } );
   }

   // analog: GETLN
   getLine ( buffer )
   {
      // echo input
      this.outChar( buffer );

      if ( buffer === BS )
      {
         if ( this.inputBuffer.length > 0 )
         {
            this.inputBuffer.splice( this.inputBuffer.length - 1, 1 );
            this.terminal.backspace();
         }
      }
      else if ( buffer === CR )
      {

      }
   }

   // analog: CRLF
   crlf ()
   {
      this.terminal.carriageReturn();
   }

   // analog: OUTCH
   outChar ( c )
   {
      // was it CR?
      // if (c === "\r")
      //    // yes, use LF
      // c = "\n";

      this.terminal.putCharAtCursor( c );
   }

   // analog: TSTNUM
   testNum ( text )
   {
      // Ignore leading blanks
      text = this.ignoreBlanks( text );
   }

   testNum1 ()
   {
      if ( true )
      {
      }
      else
      {
      }
   }

   // analog: IGNBLK
   ignoreBlanks ( text )
   {
      if ( text !== SP && text !== HT )
         return text;
   }

   // analog: INIT
   init ()
   {
      /**************************************************************
       * Initialize
       **************************************************************/

      this.terminal.bell();
      this.crlf();

      // At power on keyword is probably not 0xc3, but if it is
      if ( this.keyword === 0xc3 )
         this.tell();
      else
      {
         // Set keyword
         this.keyword = 0xc3;
         // Set default value in text limit
         this.textLimit = this.defaultLimit;

         this.purge();
      }
   }

   purge ()
   {
      // Purge text area
      this.terminal.clearScreen();
      this.tell();
   }

   tell ()
   {
      // tell user
      this.printString( this.message );

      this.start();
   }

   stop ()
   {
      // Stop execution of the program
      this.main();
   }

   // Gives the absolute value of X.
   ABS ( X )
   {
      X = Math.trunc( X );
      return Math.abs( X );
   }

   // Give a random number between 1 and X (inclusive).
   RND ( X )
   {
      X = Math.trunc( X );
      return Math.trunc( 1 + Math.random() * X );
   }

   // Gives the number of bytes left unused by the program.
   SIZE ( memory = this.MEMORY, memorySize = this.MEMSIZE )
   {
      let size = memorySize - memory.length;
      return size;
   }



   LIST ( start, count, statementString )
   {
      if ( this.PROGRAMLIST.length < start + count )
      {
         let errorIndex = 0;
         this.error( 2, statementString, errorIndex );
      }
      for ( let i = start; i < start + count; i++ )
      {
         this.printString( `${ i } ${ this.PROGRAMLIST[ i ] }` );
      }
   }

   REMARK ( remarkString ) { }

   addStatement ( statementString, statementNumber )
   {
      this.PROGRAMLIST[ statementNumber ] = statementString;

      if ( this.MEMORY.length + statementString.length < this.MEMSIZE )
         this.MEMORY = this.PROGRAMLIST.join( "" );
      else this.error( 3 );
   }

   error ( errorType, statementString, errorIndex )
   {
      let errorString;
      const errorMessage = [ null, "WHAT?", "HOW?", "SORRY" ];

      this.printString( errorMessage[ errorType ] );
      this.terminal.bell();

      switch ( errorType )
      {
         case 1:
            errorIndex = statementString.length;
            errorString = statementString.split( "" );
            errorString.splice( errorIndex, 1, "?" );
            this.printString( errorString.join( "" ) );
            break;
         case 2:
            break;
         default:
            break;
      }

      return errorType;
   }
}

// class Instructions
// {
//    constructor(program)
//    {
//       this.program = program;
//    }

//    lxi()
// }
