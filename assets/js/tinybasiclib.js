function tbPrint(statement, terminal) {
   terminal.print(statement);
}

function tbRemark(remark) {
   return;
}

function tbInput(input) {}

class Program {
   constructor(terminal) {
      this.VAR = {
         A: undefined,
         B: undefined,
         C: undefined,
         D: undefined,
         E: undefined,
         F: undefined,
         G: undefined,
         H: undefined,
         I: undefined,
         J: undefined,
         K: undefined,
         L: undefined,
         M: undefined,
         N: undefined,
         O: undefined,
         P: undefined,
         Q: undefined,
         R: undefined,
         S: undefined,
         T: undefined,
         U: undefined,
         V: undefined,
         W: undefined,
         X: undefined,
         Y: undefined,
         Z: undefined
      };

      // Single Array used by the program as @(I)
      this.ARRAY = [];
      this.LIST = [];
      this.MEMORY = "";
      this.MEMSIZE = 2 ** 15;
      this.MAXINT = this.MEMSIZE;

      this.terminal = terminal;
   }

   // Gives the absolute value of X.
   ABS(X) {
      X = Math.trunc(X);
      return Math.abs(X);
   }

   // Give a random number between 1 and X (inclusive).
   RND(X) {
      X = Math.trunc(X);
      return Math.trunc(1 + Math.random() * X);
   }

   // Gives the number of bytes left unused by the program.
   SIZE() {}

   PRINT(string, terminal = this.terminal) {
      if (typeof string !== "string") {
         console.error(`PRINT: Expected string, got ${typeof string}`);
         return false;
      }
      terminal.print(string.trim());
      terminal.lineFeed();
   }

   REMARK(remarkString) {}

   addStatement(statementString, statementNumber) {
      this.LIST[statementNumber] = statementString;

      if (this.MEMORY.length + statementString.length < this.MEMSIZE)
         this.MEMORY = this.LIST.join("");
      else this.ERROR(3);
   }

   ERROR(errorType, statementString, errorIndex) {
      let errorString;
      const errorMessage = [null, "WHAT?", "HOW?", "SORRY"];

      this.PRINT(errorMessage[errorType]);

      switch (errorType) {
         case 1:
            errorString =
               statementString.slice(0, errorIndex) +
               "?" +
               statementString.slice(errorIndex);
            this.PRINT(errorString);
            break;
         case 2:
            break;
         default:
            break;
      }

      return errorType;
   }

   parse(statement) {
      // Separate concatenated commands
      if (statement.includes(";")) {
         statement = statement.split(";");
         statement = statement.map((c) => c.trim());
      }

      console.log(statement);

      statement.forEach((command) => {
         command = command.trim();
         command = command.split(" ");

         console.log(command);
         switch (command[0]) {
            case "PRINT":
               let parameters = command.slice(1).join(" ");

               let string;
               let match;

               if (parameters.includes('"')) {
                  match = parameters.match(/\".*\"/);
                  if (match) {
                     string = match[0].replaceAll('"', "");
                  }
               } else if (parameters.includes("'")) {
                  match = parameters.match(/\'.*\'/);
                  if (match) {
                     string = match[0].replaceAll("'", "");
                  }
               } else {
                  this.ERROR(1, command.join(" "), command.join(" ").length);
                  break;
               }
               this.PRINT(string, this.terminal);
               break;
            case "REM":
               break;
            case "REMARK":
               break;
            case "LIST":
               this.LIST.forEach((s, i) => {
                  this.PRINT(`${i} ${s}`);
               });
               break;
            case "RUN":
               console.log("Running program...");
               break;
            default:
               if (command[0] % 1 === 0) {
                  if (command.length === 1) {
                     this.LIST[command[0]] = undefined;
                  } else
                     this.addStatement(command.splice(1).join(" "), command[0]);
               } else {
                  this.ERROR(3, command.join(" "));
               }
               break;
         }
      });
   }
}
