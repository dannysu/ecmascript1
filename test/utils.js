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

e.expectWithStatementFn = function(testValidator, statementValidator) {
    return function(ast) {
        ast.type.should.be.eql('WithStatement');

        testValidator(ast.test);
        statementValidator(ast.statement);
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

e.expectVariableDeclaratorFn = function(identifier, validator) {
    return function(ast) {
        ast.type.should.be.eql('VariableDeclarator');
        ast.id.should.be.eql(identifier);
        validator(ast.init);
    };
};
