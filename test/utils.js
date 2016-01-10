'use strict';

const should = require('should');

const parser = require('../src/parser.js');

const e = exports;

e.expectFail = function(input) {
    try {
        const ast = parser.parse(input);
        throw new Error('Expecting error from bad syntax');
    }
    catch (ex) {
        (ex instanceof SyntaxError).should.be.eql(true);
    }
};

e.expectProgram = function(ast, validators) {
    ast.type.should.be.eql('Program');
    should.exist(ast.body);
    ast.body.length.should.be.eql(validators.length);
    for (let stmt of ast.body) {
        const validator = validators.shift();
        validator(stmt);
    }
};

e.expectBlockFn = function(validators) {
    return function(ast) {
        ast.type.should.be.eql('BlockStatement');
        should.exist(ast.body);
        ast.body.length.should.be.eql(validators.length);
        for (let stmt of ast.body) {
            const validator = validators.shift();
            validator(stmt);
        }
    };
};

e.expectVariableDeclarationFn = function(validators) {
    return function(ast) {
        ast.type.should.be.eql('VariableDeclaration');
        ast.kind.should.be.eql('var');
        ast.declarations.length.should.be.eql(validators.length);
        for (let declaration of ast.declarations) {
            const validator = validators.shift();
            validator(declaration);
        }
    };
};

e.expectEmptyStatementFn = function(ast) {
    ast.type.should.be.eql('EmptyStatement');
};

e.expectExpressionStatementFn = function(validator) {
    return function(ast) {
        ast.type.should.be.eql('ExpressionStatement');
        validator(ast.expression);
    };
};

e.expectIfStatementFn = function(testValidator, consequentValidator, alternateValidator) {
    return function(ast) {
        ast.type.should.be.eql('IfStatement');

        testValidator(ast.test);
        consequentValidator(ast.consequent);
        alternateValidator(ast.alternate);
    };
};

e.expectWhileStatementFn = function(testValidator, bodyValidator) {
    return function(ast) {
        ast.type.should.be.eql('WhileStatement');

        testValidator(ast.test);
        bodyValidator(ast.body);
    };
};

e.expectForStatementFn = function(initValidator, testValidator, updateValidator, bodyValidator) {
    return function(ast) {
        ast.type.should.be.eql('ForStatement');

        initValidator(ast.init);
        testValidator(ast.test);
        updateValidator(ast.update);
        bodyValidator(ast.body);
    };
};

e.expectForInStatementFn = function(leftValidator, rightValidator, bodyValidator) {
    return function(ast) {
        ast.type.should.be.eql('ForInStatement');

        leftValidator(ast.left);
        rightValidator(ast.right);
        bodyValidator(ast.body);
    };
};

e.expectWithStatementFn = function(testValidator, bodyValidator) {
    return function(ast) {
        ast.type.should.be.eql('WithStatement');

        testValidator(ast.test);
        bodyValidator(ast.body);
    };
};

e.expectContinueStatementFn = function() {
    return function(ast) {
        ast.type.should.be.eql('ContinueStatement');
    };
};

e.expectBreakStatementFn = function() {
    return function(ast) {
        ast.type.should.be.eql('BreakStatement');
    };
};

e.expectSequenceExpressionFn = function(validators) {
    return function(ast) {
        ast.type.should.be.eql('SequenceExpression');

        const expressions = ast.expressions;
        expressions.length.should.be.eql(validators.length);
        for (let expression of expressions) {
            const validator = validators.shift();
            validator(expression);
        }
    };
};

e.expectThisExpressionFn = function() {
    return function(ast) {
        ast.type.should.be.eql('ThisExpression');
    };
};

e.expectIdentifierFn = function(identifier) {
    return function(ast) {
        ast.type.should.be.eql('Identifier');
        ast.value.should.be.eql(identifier);
    };
};

e.expectBinaryExpressionFn = function(operator, leftValidator, rightValidator) {
    return function(ast) {
        ast.type.should.be.eql('BinaryExpression');
        ast.operator.should.be.eql(operator);
        leftValidator(ast.left);
        rightValidator(ast.right);
    };
};

e.expectUnaryExpressionFn = function(operator, argumentValidator, prefix) {
    return function(ast) {
        ast.type.should.be.eql('UnaryExpression');
        ast.operator.should.be.eql(operator);
        ast.prefix.should.be.eql(prefix);
        argumentValidator(ast.argument);
    };
};

e.expectUpdateExpressionFn = function(operator, argumentValidator, prefix) {
    return function(ast) {
        ast.type.should.be.eql('UpdateExpression');
        ast.operator.should.be.eql(operator);
        ast.prefix.should.be.eql(prefix);
        argumentValidator(ast.argument);
    };
};

e.expectConditionalExpressionFn = function(testValidator, consequentValidator, alternateValidator) {
    return function(ast) {
        ast.type.should.be.eql('ConditionalExpression');
        testValidator(ast.test);
        consequentValidator(ast.consequent);
        alternateValidator(ast.alternate);
    };
};

e.expectLiteralFn = function(expectedValue) {
    return function(ast) {
        ast.type.should.be.eql('Literal');
        ast.value.should.be.eql(expectedValue);
    };
};

e.expectVariableDeclaratorFn = function(idValidator, initValidator) {
    return function(ast) {
        ast.type.should.be.eql('VariableDeclarator');
        idValidator(ast.id);
        initValidator(ast.init);
    };
};

e.expectMemberExpressionFn = function(objectValidator, propertyValidator) {
    return function(ast) {
        ast.type.should.be.eql('MemberExpression');

        objectValidator(ast.object);
        propertyValidator(ast.property, ast.computed);
    };
};

function validateNewOrCallExpression(type, calleeValidator, argsValidators) {
    return function(ast) {
        ast.type.should.be.eql(type);

        calleeValidator(ast.callee);

        const args = ast.arguments;
        args.length.should.be.eql(argsValidators.length);
        for (let argument of args) {
            const validator = argsValidators.shift();
            validator(argument);
        }
    };
}

e.expectNewExpressionFn = function(calleeValidator, argsValidators) {
    return validateNewOrCallExpression('NewExpression', calleeValidator, argsValidators);
};

e.expectCallExpressionFn = function(calleeValidator, argsValidators) {
    return validateNewOrCallExpression('CallExpression', calleeValidator, argsValidators);
};
