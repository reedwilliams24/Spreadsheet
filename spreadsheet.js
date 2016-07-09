var fs = require('fs');
// var $ = require('jquery');
// var $csv = require('jquery-csv');

var csv = require("fast-csv");

var input = [];
var result = [];

var OPERATORS = {
  '+':'+',
  '-':'-',
  '/':'/',
  '*':'*'
};

csv
 .fromPath("ex1.csv")
 .on("data", function(data){
     var line = data[0].split('\t');
    //  console.log(line);
     input.push(line);
 })
 .on("end", function(){
  //  console.log("done");
   printOutput();
 });

var printOutput = function(){
  var lineNumber = 1;
  input.forEach(function(line){
    var lineResult = [];
    line.forEach(function(cell){
      // console.log('1->', cell, typeof cell, isNum(cell));
      if (isNum(cell)) cell = parseInt(cell);
      if (cell === '') cell = 0;
      // console.log('2->', cell, typeof cell, isNum(cell));
      lineResult.push(cell);
    });
    lineNumber += 1;
    result.push(lineResult);
  });

  console.log(result);
  var row = 0;
  var col = 0;
  var rowLength = result.length;
  var colLength = result[0].length;
  console.log('res', rowLength, colLength);

  while (row < rowLength){
    col = 0;
    while (col < colLength){
      console.log('- 1 -', col, row, rowLength, colLength);
      console.log('col-row', col, row, rowLength, colLength);
      console.log('- 1.5 -', result);
      console.log('- 1.8 -', result[row]);
      console.log('- 2 -', result[row][col]);
      if (computeCellValue(result[row][col]) === undefined) {
        console.log('ERROR', result[row][col]);
      }
      result[row][col] = computeCellValue(result[row][col]);
      col += 1;
    }
    row += 1;
  }

  // var rows = result[0];
  // for (var row = 0; row < rows.length; row++) {
  //   var columns = rows[row];
  //   for (var column = 0; column < columns.length; column++) {
  //
  //   }
  // }

  // var lineNum = 0;
  // input.forEach(function(line){
  //   var colNum = 0;
  //   line.forEach(function(cell){
  //     colNum+=1;
  //     if (computeCellValue(cell) === undefined) console.log('ERROR', cell);
  //     result[lineNum][colNum] = computeCellValue(cell);
  //   });
  //   lineNum+=1;
  // });
  console.log(result);
};

var computeCellValue = function(cell){
  if (typeof cell === 'number') return cell;
  if (cell.length === 1){
    if (isNum(cell[0])){
      return parseInt(cell[0]);
    } else if (cell[0] === '#ERR') {
      return '#ERR';
    } else if (Object.keys(OPERATORS).indexOf(cell[0]) !== -1){
      return '#ERR';
    }
  }

  var stack = [];
  var commands = cell.split(' ');

  if (commands.length === 2) return '#ERR';

  // if (commands.length <= 2){
  //   // both are numbers
  //   if (isNum(commands[0]) && isNum(commands[1])){
  //     return '#ERR';
  //   // number first, operator or other second
  //   } else if (isNum(commands[0])){
  //     return operate(commands[0], commands[0], commands[1]);
  //   // operator or other first, number second
  //   } else if (isNum(commands[1])) {
  //     // 0 / 0 and 0 <other> 0 are errors
  //     if (OPERATORS[commands[0]]===undefined || OPERATORS[commands[0]]==='/'){
  //       return '#ERR';
  //     // value of second
  //     } else {
  //       return parseInt(commands[1]);
  //     }
  //   } else {
  //
  //   }
  // }

  commands.forEach(function(command){
    // console.log('c', command);
    if (Object.keys(OPERATORS).indexOf(command) !== -1){
      if (stack.length < 2){
        return '#ERR';
      } else {
        // console.log('s', stack);
        var cell2 = stack.pop();
        var cell1 = stack.pop();
        if (cell1 === '#ERR' || cell2 === '#ERR') return '#ERR';
        stack.push(operate(cell1, cell2, command));
      }
    } else if (valueIsNaN(parseInt(command))){
      if (command === '#ERR') return '#ERR';
      stack.push(cellValue(command));
    } else {
      stack.push(parseInt(command));
    }
  });
  return stack[0];
};

var operate = function(cell1, cell2, operator){
  // console.log(cell1, cell2, operator);
  if (valueIsNaN(parseInt(cell1))){
    cell1 = cellValue(cell1);
  } else {
    cell1 = parseInt(cell1);
  }

  if (valueIsNaN(parseInt(cell2))){
    cell2 = cellValue(cell2);
  } else {
    cell2 = parseInt(cell2);
  }

  switch (operator) {
    case OPERATORS['+']:
      return cell1 + cell2;
    case OPERATORS['-']:
      return cell1 - cell2;
    case OPERATORS['/']:
      return cell1 / cell2;
    case OPERATORS['*']:
      return cell1 * cell2;
    default:
      return '#ERR';
  }
};

var cellValue = function(cell){
  // console.log(cell);
  if (cell.length < 2) return 0;

  var idx = 0;
  var cellChars = cell.split('');

  for (var i = 0; i < cellChars.length; i++) {
    if (!valueIsNaN(parseInt(cellChars[i]))){
      idx = i;
      break;
    }
  }

  var location = [cell.slice(0,idx), parseInt(cell.slice(idx))];

  var cellResult =
    result[location[1] - 1][location[0].toLowerCase().charCodeAt(0) - 97];

  var sol;

  if (typeof cellResult === 'number'){
    return cellResult;
  } else if (cellResult.split(' ').length === 1){
    if (valueIsNaN(parseInt(cellResult.split(' ')[0][0]))){
      // console.log('111', cellResult);
      sol =  computeCellValue(cellResult);
      // console.log(1, cellResult, sol);
    } else {
      sol = parseInt(cellResult);
      // console.log(2, cellResult, sol);
    }
  } else {
    sol = computeCellValue(cellResult);
    // console.log(3, cellResult, sol);
  }
  return sol;
  // if (valueIsNaN(parseInt(cellResult))){
  //   sol = computeCellValue(cellResult);
  //   console.log(1, cellResult, sol);
  // } else {
  //   sol = parseInt(cellResult);
  //   console.log(2, cellResult, sol);
  // }
  // return sol;
};

var valueIsNaN = function(val) {
  return val !== val;
};

var isNum = function(val) {
  if (val !== val) return false; // NaN
  if (typeof val === 'number') return true;
  if (typeof val === 'object') return false;

  if (val.length === 0) return false; // empty string
  if (val.split(' ').length > 1) return false; // multiple commands

  var digits = val.split('');
  for (var i = 0; i < digits.length; i++) {
    // contains a letter
    if (parseInt(digits[i]) !== parseInt(digits[i])) return false;
  }

  return true;
};

var isNumTest1 = '235';
if (isNum(isNumTest1) === false) console.log('ERROR - isNumTest 1');
var isNumTest2 = '2x5';
if (isNum(isNumTest2) === true) console.log('ERROR - isNumTest 2');
var isNumTest3 = '2 a2 +';
if (isNum(isNumTest3) === true) console.log('ERROR - isNumTest 3');
var isNumTest4 = '2 2';
if (isNum(isNumTest4) === true) console.log('ERROR - isNumTest 4');
var isNumTest5 = 'a2';
if (isNum(isNumTest5) === true) console.log('ERROR - isNumTest 5');
var isNumTest6 = '';
if (isNum(isNumTest6) === true) console.log('ERROR - isNumTest 6');
