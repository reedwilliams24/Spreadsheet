var fs = require('fs');
var csv = require("fast-csv");

var OPERATORS = {
  '+':'+',
  '-':'-',
  '/':'/',
  '*':'*'
};

var validCSVFile = function(filename) {
  if (filename.slice(filename.length - 4) !== '.csv') return false;
  if (filename.length < 'RESULT.csv'.length) return true;
  if (filename.slice(filename.length - 'RESULT.csv'.length) === 'RESULT.csv'){
    return false;
  }
  return true;
};

var csvFiles = fs.readdirSync('./csv_files/input/').filter(function(filename){
  return validCSVFile(filename);
});

console.log('Files to be evaluated: ', csvFiles);

var input = [];
var result = [];
var callstack = 0;

csvFiles.forEach(function(filename){
  var fileInput = [];

  csv
  .fromPath('./csv_files/input/' + filename)
  .on("data", function(data){
    var line = data;
    fileInput.push(line);
  })
  .on("end", function(){
    parseData(filename, fileInput);
  });
});


var parseData = function(filename, newInput){
  input = newInput;
  result = [];

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
      callstack = 0;
      result[row][col] = computeCellValue(result[row][col]);
      col += 1;
    }
    row += 1;
  }

  var fname = './csv_files/output/' + filename.split('.')[0] + '-RESULT.csv';
  csv.writeToStream(fs.createWriteStream(fname), result, {headers: false});
  console.log('Finished evaluating: \''+filename+'\' | Saved as \''+fname+'\'');
};

var computeCellValue = function(cell){
  // circular reference error
  callstack += 1;
  if (callstack > 250) return '#ERR';

  if (typeof cell === 'number') return cell;
  if (cell === '#ERR') return '#ERR';

  if (cell.length === 1){
    if (isNum(cell[0])){
      return parseInt(cell[0]);
    } else if (cell[0] === '#ERR') {
      return '#ERR';
    } else if (Object.keys(OPERATORS).indexOf(cell[0]) !== -1){
      return '#ERR';
    }
  }

  var commands = cell.split(' ');
  if (commands.length === 2) return '#ERR';

  var stack = [];

  commands.forEach(function(command){
    if (Object.keys(OPERATORS).indexOf(command) !== -1){
      if (stack.length < 2){
        return '#ERR';
      } else {
        var cell2 = stack.pop();
        var cell1 = stack.pop();
        if (cell1 === '#ERR' || cell2 === '#ERR') {
          stack.push('#ERR');
        } else {
          stack.push(operate(cell1, cell2, command));
        }
      }
    } else if (isNum(command)){
      stack.push(parseInt(command));
    } else {
      if (command === '#ERR') {
        stack.push('#ERR');
      } else {
        stack.push(cellValue(command));
      }
    }
  });
  return stack[0];
};

var operate = function(cell1, cell2, operator){
  if (isNum(cell1) && typeof cell1 !== 'number'){
    cell1 = parseInt(cell1);
  } else if (!isNum(cell1)){
    cell1 = cellValue(cell1);
  }

  if (isNum(cell2) && typeof cell2 !== 'number'){
    cell2 = parseInt(cell2);
  } else if (!isNum(cell2)) {
    cell2 = cellValue(cell2);
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

  // find first digit
  for (var i = 0; i < cellChars.length; i++) {
    if (isNum(cellChars[i])) { idx = i; break; }
  }

  // [{LETTER}, {NUMBER}]
  var location = [cell.slice(0,idx), parseInt(cell.slice(idx))];

  // [{ROW_NUMBER}, {COLUMN_NUMBER}]
  var cellResult =
    result[location[1] - 1][location[0].toLowerCase().charCodeAt(0) - 97];

  // cell references itself
  if (cell === cellResult) return '#ERR';

  return computeCellValue(cellResult);
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

// isNum Tests
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
var isNumTest7 = '#ERR';
if (isNum(isNumTest7) === true) console.log('ERROR - isNumTest 7');
