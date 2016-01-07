'use strict';

const should = require('should');

const parser = require('../../src/parser.js');
const estree = require('../../src/estree.js');

describe('parser', function() {
    describe('parse a numeric statement', function() {
        it('should return proper ESTree AST', function() {
            const input = "0.1;";
            const ast = parser.parse(input);

            ast.type.should.be.eql('Program');
            should.exist(ast.body);
            ast.body.length.should.be.eql(1);
            ast.body[0].type.should.be.eql('ExpressionStatement');
            ast.body[0].expression.type.should.be.eql('Literal');
            ast.body[0].expression.value.should.be.eql('0.1');
        });
    });

    describe('parse multiple numeric statements', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                0.1;
                13.1912;
            `;
            const ast = parser.parse(input);

            ast.type.should.be.eql('Program');
            should.exist(ast.body);
            ast.body.length.should.be.eql(2);

            ast.body[0].type.should.be.eql('ExpressionStatement');
            ast.body[0].expression.type.should.be.eql('Literal');
            ast.body[0].expression.value.should.be.eql('0.1');

            ast.body[1].type.should.be.eql('ExpressionStatement');
            ast.body[1].expression.type.should.be.eql('Literal');
            ast.body[1].expression.value.should.be.eql('13.1912');
        });
    });

    describe('parse multiple numeric values in a single statement', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                0.1, 0.2, 0.3;
            `;
            const ast = parser.parse(input);

            ast.type.should.be.eql('Program');
            should.exist(ast.body);
            ast.body.length.should.be.eql(1);

            ast.body[0].type.should.be.eql('ExpressionStatement');
            ast.body[0].expression.type.should.be.eql('SequenceExpression');

            const expressions = ast.body[0].expression.expressions;
            expressions.length.should.be.eql(3);
            expressions[0].type.should.be.eql('Literal');
            expressions[0].value.should.be.eql('0.1');
            expressions[1].type.should.be.eql('Literal');
            expressions[1].value.should.be.eql('0.2');
            expressions[2].type.should.be.eql('Literal');
            expressions[2].value.should.be.eql('0.3');
        });
    });
});
