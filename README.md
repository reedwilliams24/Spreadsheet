## Spreadsheet

This program parses a spreadsheet-like CSV file and evaluates each cell by these rules:
  1. Each cell is an expression in postfix notation.
  2. Each token in the expression is separated by one or more spaces.
  3. One cell can refer to another cell with the {LETTER}{NUMBER} notation (e.g. "A2", "B4" - letters refer to columns, numbers to rows).
  4. Expressions may include the basic arithmetic operators +, -, *, /.

Ex1.csv
<img src="https://raw.githubusercontent.com/reedwilliams24/Spreadsheet/master/docs/Ex1.png" width='962.2' height='195.5'>
Ex1-RESULT.csv
<img src="https://raw.githubusercontent.com/reedwilliams24/Spreadsheet/master/docs/Ex1-RESULT.png" width='962.2' height='195.5'>
