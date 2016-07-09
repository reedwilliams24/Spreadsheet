var fs = require('fs');
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
     input.push(line);
 })
 .on("end", function(){
   printOutput();
 });

var printOutput = function(){
  var lineNumber = 1;
  input.forEach(function(line){
    var lineResult = [];
    line.forEach(function(cell){
      if (isNum(cell)) cell = parseInt(cell);
      if (cell === '') cell = 0;
      lineResult.push(cell);
    });
    lineNumber += 1;
    result.push(lineResult);
  });

  var row = 0;
  var col = 0;
  var rowLength = result.length;
  var colLength = result[0].length;

  while (row < rowLength){
    col = 0;
    while (col < colLength){
      if (computeCellValue(result[row][col]) === undefined) {
        console.log('ERROR', result[row][col]);
      }
      result[row][col] = computeCellValue(result[row][col]);
      col += 1;
    }
    row += 1;
  }

  //TODO OUTPUT TO NEW CSV FILE
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

  commands.forEach(function(command){
    if (Object.keys(OPERATORS).indexOf(command) !== -1){
      if (stack.length < 2){
        return '#ERR';
      } else {
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

  if (typeof cellResult === 'number'){
    return cellResult;
  } else if (cellResult.split(' ').length === 1){
    if (valueIsNaN(parseInt(cellResult.split(' ')[0][0]))){
      return computeCellValue(cellResult);
    } else {
      return parseInt(cellResult);
    }
  } else {
    return computeCellValue(cellResult);
  }
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
