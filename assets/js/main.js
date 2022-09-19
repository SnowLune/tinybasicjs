// Global Element Vars
const displayEl = document.querySelector( ".display" );
const clearButtonEl = document.getElementById( "clear" );
const inputEl = document.getElementById( "input" );
const colorSelectEl = document.getElementById( "color-select" );

// Terminal
var term;

// Program Running?
var started = false;

// Resets input value to a specific string
// to prevent auto-caps wonkiness on mobile
function clearInput ( input = inputEl )
{
   input.value = "> ";
   return input.value;
}

function start ( terminal )
{
   if ( !started )
   {
      started = true;
      terminal.program.main();
   }
   else
      return;
}

// HANDLERS
function keyHandler ( event )
{
   if ( !started )
   {
      event.preventDefault();
      start( term );
      return;
   }

   if ( event.repeat )
   {
      event.preventDefault();
      return;
   }

   else
      inputEl.readonly = true;

   switch ( event.key.toUpperCase() )
   {
      case "ENTER":
         event.preventDefault();
         term.getChar( CR );

         // Clear input element
         clearInput();
         break;

      case "BACKSPACE":
         event.preventDefault();
         term.getChar( BS );
         break;

      case "C":
         if ( event.ctrlKey )
         {
            term.program.stop();
         }
         break;

      case "L":
         if ( event.ctrlKey )
         {
            event.preventDefault();
            term.clearScreen();
         }
         break;

      case "G":
         if ( event.ctrlKey )
         {
            event.preventDefault();
            term.bell();
         }
         break;

      default:
         break;
   }
}

function keyUpHandler ()
{
   inputEl.readonly = false;
}

function inputHandler ( event )
{
   if ( !started )
   {
      start( term );
      return;
   }

   // Input element value as an array of characters
   const inputChars = event.target.value.split( "" );

   // Filler text is "> ", so input char is on 2
   const cIndex = 2;

   // Input char
   const c = inputChars[ cIndex ]?.toUpperCase()?.charCodeAt();

   // Reset input element value
   clearInput();

   if ( c >= printableAsciiStart && c <= printableAsciiEnd )
   {
      term.getChar( c );
   }
   else
      return false;
}

document.addEventListener( "DOMContentLoaded", () =>
{
   // Set up terminal
   term = new Terminal( displayEl );

   inputEl.focus();
   clearInput();

   // Handle certain key events
   document.addEventListener( "keydown", keyHandler );
   document.addEventListener( "keyup", keyUpHandler );

   // Start Tiny BASIC upon interacting with the page
   document.addEventListener( "scroll", () => start( term ) );
   document.addEventListener( "click", () => start( term ) );

   inputEl.addEventListener( "input", inputHandler );
   inputEl.addEventListener( "submit", ( event ) => event.preventDefault() );
   inputEl.addEventListener( "blur", () => inputEl.focus() );

   clearButtonEl.addEventListener( "click", () => { term.clearScreen(); } );
   colorSelectEl.addEventListener( "change", ( event ) =>
   {
      switch ( event.target.value )
      {
         case "amber":
            displayEl.classList.remove( "white" );
            displayEl.classList.add( "amber" );
            break;
         case "white":
            displayEl.classList.remove( "amber" );
            displayEl.classList.add( "white" );
            break;
         default:
            displayEl.classList.remove( "amber", "white" );
            break;
      }
   } );
} );
