let optionDefaults = {
  /* Human readable name for the operation. */
  name: 'Unnamed',

  /* A regularexpression that finds a meaningful target string for this operation.
      Example: /\d*d\d+/ - finds strings like 'd6' or '1d6' for the dice roller
  */
  search: /RegExp/g,

  /* Alternatively, search can be a function that returns the expression */
  search: function (equation) {
    throw 'No search function provided for operation ' + name;
  },

  /* Accepts the results of the search and splits them up into an operand array.
      Example: would accept '1+2' and return an [1, 2] for an addition operation.    
      Default: Returns all numbers of one or more digits including negatives and decimals
  */
  parse: function (expression) {
    // -?  optional minus sign for negative numbers 
    // (\d*\.)? optional 0 or more numbers followed by a . for decimals
    // \d+  required at least one number of one or more digits
    let number = /-?(\d*\.)?\d+/g;
    let get = null,
        operands = [];

    while (get = number.exec(expression)) {
      operands.push(get[0]);
    }

    return operands;
  },

  /* Accepts the operands from parse and returns a single string value
      Example: if the operands are [1, 2] and it is an addition operation, this would return "3"
  */
  resolve: function (operands) {}
};
let DiceOperation = function (options = {}) {
  let op = this;

  for (let k in options) {
    op[k] = options[k];
  }

  op.name = options.name || optionDefaults.name;
  let search = options.search;

  if (search instanceof RegExp) {
    search = function (input) {
      return (new RegExp(options.search).exec(input) || [null])[0];
    };
  }

  op.onSearch = function (equation) {};

  op.onSearched = function (equation, expression) {};

  op.search = function (equation) {
    op.onSearch(equation);
    let expression = search(equation);
    op.onSearched(equation, expression);
    return expression;
  };

  let parse = options.parse || optionDefaults.parse;

  op.onParse = function (expression) {};

  op.onParsed = function (expression, operands) {};

  op.parse = function (expression) {
    op.onParse(expression);
    let operands = parse(expression);
    op.onParsed(expression, operands);
    return operands;
  };

  let resolve = options.resolve;

  op.onResolve = function (operands) {};

  op.onResolved = function (operands, result) {};

  op.resolve = function (operands) {
    op.onResolve(operands);
    let result = resolve.apply(op, operands);
    op.onResolved(operands, result);
    return result;
  };

  op.onEvaluate = function (equation) {};

  op.onEvaluated = function (equation, expression) {};

  op.evaluate = function (equation) {
    op.onEvaluate(equation);
    let input = equation;
    let expression;

    while ((expression = op.search(equation)) !== null) {
      let operands = op.parse(expression);
      let result = op.resolve(operands);
      equation = equation.replace(expression, result);
    }

    op.onEvaluated(input, equation);
    return equation;
  };
};

let BaseModule = function () {
  this.apply = function (roller) {
    roller.operations.unshift(this.operations[0]);
  };

  this.operations = [new DiceOperation({
    name: 'dice',
    search: /\d*d\d+/,
    parse: function (expression) {
      return expression.split(/\D+/);
    },
    roll: function (facets) {
      return Math.floor(Math.random() * facets + 1);
    },
    resolve: function (rolls, facets) {
      let value = 0;

      for (let i = 0; i < (rolls || 1); i++) {
        value += this.roll(facets);
      }

      return value;
    }
  })];
};

/* 
    options = {
        modules : [modules]
    }
*/

let DiceRoller = function (options) {
  let roller = this;
  roller.operations = [];

  roller.onSolve = function (equation) {};

  roller.onSolved = function (equation, solution) {};

  roller.solve = function (equation) {
    let input = equation;
    roller.onSolve(equation);
    roller.operations.forEach(op => {
      equation = op.evaluate(equation);
    });
    roller.onSolved(input, equation);
    return equation;
  };

  roller.applyModules = function (modules) {
    if (!Array.isArray(modules)) {
      modules = [modules];
    }

    modules.forEach(module => {
      new module().apply(roller);
    });
  }; // Seed with dice roll operation


  roller.applyModules(BaseModule);

  if (options && options.modules) {
    roller.applyModules(options.modules);
  }
};

let DnDModule = function () {
  this.apply = function (roller) {
    let advantage = this.operations[0];
    advantage.parent = roller;
    roller.operations.unshift(advantage);
  };

  this.operations = [
  /* The game frequently asks the player to roll a twenty-sided die twice and pick the higher 
  	or lower of the two rolls. 
  	using the syntax 2xd20 it will roll the die twice and separate the results into an array. 
  */
  new DiceOperation({
    name: 'Advantage',
    search: /\d+xd\d+/,
    resolve: function (repetitions, facets) {
      let operation = this; // 2xd20 becomes [d20, d20]. We then let the roller solve each d20 

      let results = Array(+repetitions).fill('d' + facets).map(x => +operation.parent.solve(x)); // high-to-low sorting

      results.sort((x, y) => +x < +y);
      return JSON.stringify(results);
    },
    parse: match => match.split(/\D+/)
  })];
};

/*  Explanation of this pattern: 
    -?(\d*\.)?\d+
        -? : optional - sign for negative numbers 
        (\d*\.)? : optional set of 0 or more numbers and one . for decimals 
        \d+ : one or more digits.  

    Matches 
        1
        1.1
        .1
        -1
        -1.1
        -.1
*/

let MathModule = function () {
  this.apply = function (roller) {
    this.operations.forEach(op => {
      // Parentheses needs a reference to the roller for recursion 
      op.parent = roller;
      roller.operations.push(op);
    });
  };

  this.operations = [new DiceOperation({
    name: 'Parentheses',
    search: /\([^()]+\)/,
    parse: match => [match.replace(/[()]/g, '')],
    resolve: function (x) {
      return this.parent.solve(x);
    }
  }), new DiceOperation({
    name: 'Exponents',
    search: /-?(\d*\.)?\d+\^-?(\d*\.)?\d+/,
    resolve: (x, y) => Math.pow(x, y)
  })
  /* Needs to happen simultaneously, so a single function */
  , new DiceOperation({
    name: 'MultiplyAndDivide',
    search: /-?(\d*\.)?\d+[*\/]-?(\d*\.)?\d+/,
    parse: function (expression) {
      let firstOperand = /^-?(\d*\.)?\d+/.exec(expression)[0];
      let secondOperand = /-?(\d*\.)?\d+$/.exec(expression)[0];
      let operator = /[\*\/]/.exec(expression)[0];
      return [firstOperand, secondOperand, operator];
    },
    resolve: (x, y, op) => op == '*' ? x * y : x / y
  }), new DiceOperation({
    name: 'Add',
    search: /-?(\d*\.)?\d+[+]-?(\d*\.)?\d+/,
    resolve: (x, y) => +x + +y
  }), new DiceOperation({
    name: 'Subtract',
    search: /-?(\d*\.)?\d+[\-]-?(\d*\.)?\d+/,
    parse: function (expression) {
      let firstOperand = /^-?(\d*\.)?\d+/.exec(expression)[0];
      let secondOperand = /(--)?(\d*\.)?\d+$/.exec(expression)[0];

      if (secondOperand.substr(0, 2) == '--') {
        secondOperand = secondOperand.substr(1);
      }

      return [firstOperand, secondOperand];
    },
    resolve: (x, y) => +x - +y
  })];
};

/*  Log structure :
    roller.log : [
        {
            equation : '',
            solution : '',
            operations : [
                { 
                    name : '',
                    expression : '',
                    search : [ { equation : '', expression : '' } ],
                    parse : [ { expression : '', operands : [] } ],
                    resolve : [ { operands : [], result : '' } ],
                    evaluate : { input : '', equation : ''  }
                }
            ]
        }
    ];
*/
let getCurrentOp = function (roller) {
  return roller.log.slice(-1)[0].operations.slice(-1)[0];
};

let LoggingModule = function () {
  this.apply = function (roller) {
    roller.log = [];
    this.onSolve(roller);
    this.onSolved(roller);
    this.onEvaluate(roller);
    this.onEvaluated(roller);
    this.onSearched(roller);
    this.onParsed(roller);
    this.onResolved(roller);
    this.onDiceResolve(roller);
    this.onDiceRoll(roller);
    this.onDiceResolved(roller);
  };

  this.onSolve = function (roller) {
    let onSolve = roller.onSolve;

    roller.onSolve = function (equation) {
      roller.log.push({
        equation: equation,
        solution: '',
        operations: []
      });
      return onSolve(equation);
    };
  };

  this.onSolved = function (roller) {
    let onSolved = roller.onSolved;

    roller.onSolved = function (equation, solution) {
      roller.log.slice(-1)[0].solution = solution;
      return onSolved(equation, solution);
    };
  };

  this.onEvaluate = function (roller) {
    roller.operations.forEach(op => {
      let onEvaluate = op.onEvaluate;

      op.onEvaluate = function (equation) {
        roller.log.slice(-1)[0].operations.push({
          name: op.name,
          search: [],
          parse: [],
          resolve: []
        });
        return onEvaluate(equation);
      };
    });
  };

  this.onEvaluated = function (roller) {
    roller.operations.forEach(op => {
      let onEvaluated = op.onEvaluated;

      op.onEvaluated = function (input, equation) {
        getCurrentOp(roller).evaluate = {
          input: input,
          equation: equation
        };
        return onEvaluated(input, equation);
      };
    });
  };

  this.onSearched = function (roller) {
    roller.operations.forEach(op => {
      let onSearched = op.onSearched;

      op.onSearched = function (equation, expression) {
        getCurrentOp(roller).search.push({
          equation: equation,
          expression: expression
        });
        return onSearched(equation, expression);
      };
    });
  };

  this.onParsed = function (roller) {
    roller.operations.forEach(op => {
      let onParsed = op.onParsed;

      op.onParsed = function (expression, operands) {
        getCurrentOp(roller).parse.push({
          expression: expression,
          operands: operands
        });
        return onParsed(expression, operands);
      };
    });
  };

  this.onResolved = function (roller) {
    roller.operations.forEach(op => {
      let onResolved = op.onResolved;

      op.onResolved = function (operands, result) {
        getCurrentOp(roller).resolve.push({
          operands: operands,
          result: result
        });
        return onResolved(operands, result);
      };
    });
  };
  /* Before rolling, add empty operation.rolls array */


  this.onDiceResolve = function (roller) {
    let diceOp = roller.operations.find(op => op.name === 'dice');
    let onResolve = diceOp.onResolve;

    diceOp.onResolve = function (operands) {
      getCurrentOp(roller).rolls = [];
      return onResolve(operands);
    };
  };
  /* For each roll, add roll result to operation.rolls array */


  this.onDiceRoll = function (roller) {
    let diceOp = roller.operations.find(op => op.name === 'dice');
    let roll = diceOp.roll;

    diceOp.roll = function (facets) {
      let rollResult = roll(facets);
      getCurrentOp(roller).rolls.push(rollResult);
      return rollResult;
    };
  };
  /* After rolling, move operation.rolls to operation.resolve.rolls */


  this.onDiceResolved = function (roller) {
    let diceOp = roller.operations.find(op => op.name === 'dice');
    let onResolved = diceOp.onResolved;

    diceOp.onResolved = function (operands, result) {
      let resolved = onResolved(operands, result);
      let diceLog = getCurrentOp(roller);
      diceLog.resolve.slice(-1)[0].rolls = diceLog.rolls;
      delete diceLog.rolls;
      return resolved;
    };
  };
};

export { DiceRoller, DnDModule, LoggingModule, MathModule };
