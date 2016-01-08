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

e.expectEmptyStatementFn = function(ast) {
    ast.type.should.be.eql('EmptyStatement');
};

e.expectExpressionStatementFn = function(validator) {
    return function(ast) {
        ast.type.should.be.eql('ExpressionStatement');
        validator(ast.expression);
    };
};

e.expectIfStatementFn = function(testValidator, consequenceValidator, alternateValidator) {
    return function(ast) {
        ast.type.should.be.eql('IfStatement');

        testValidator(ast.test);
        consequenceValidator(ast.consequence);
        alternateValidator(ast.alternate);
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

e.expectLiteralFn = function(expectedValue) {
    return function(ast) {
        ast.type.should.be.eql('Literal');
        ast.value.should.be.eql(expectedValue);
    };
};
