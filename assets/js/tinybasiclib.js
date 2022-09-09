function tbPrint(statement, terminal) {
   terminal.print(statement);
}

function tbRemark(remark) {
   return;
}

function tbInput(input) {}

function tbParse(statementString) {
   let statement = statementString.split(" ");
}

class Program {
   constructor() {
      this.var = {
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
      this.array = [];
      this.list = [];
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
}
