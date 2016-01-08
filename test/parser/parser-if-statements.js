'use strict';

const should = require('should');

const parser = require('../../src/parser.js');
const estree = require('../../src/estree.js');

describe('parser', function() {
    describe('parse if-statement missing brackets', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                if 1;
            `;
            try {
                const ast = parser.parse(input);
                throw new Error('Expecting error from bad syntax');
            }
            catch (ex) {
                (ex instanceof SyntaxError).should.be.eql(true);
            }
        });
    });

    describe('parse an invalid if-statement', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                if (1)
            `;
            try {
                const ast = parser.parse(input);
                throw new Error('Expecting error from bad syntax');
            }
            catch (ex) {
                (ex instanceof SyntaxError).should.be.eql(true);
            }
        });
    });

    describe('parse if-statement missing else statement', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                if (1) 2;
                else
            `;
            try {
                const ast = parser.parse(input);
                throw new Error('Expecting error from bad syntax');
            }
            catch (ex) {
                (ex instanceof SyntaxError).should.be.eql(true);
            }
        });
    });

    describe('parse an if-statement without else', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                if (1) 2;
            `;
            const ast = parser.parse(input);

            ast.type.should.be.eql('Program');
            should.exist(ast.body);
            ast.body.length.should.be.eql(1);

            ast.body[0].type.should.be.eql('IfStatement');
            ast.body[0].test.type.should.be.eql('Literal');
            ast.body[0].test.value.should.be.eql('1');
            ast.body[0].consequence.type.should.be.eql('ExpressionStatement');
            ast.body[0].consequence.expression.type.should.be.eql('Literal');
            ast.body[0].consequence.expression.value.should.be.eql('2');
            should.not.exist(ast.body[0].alternate);
        });
    });

    describe('parse an if-statement with else', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                if (1) 2;
                else 3;
            `;
            const ast = parser.parse(input);

            ast.type.should.be.eql('Program');
            should.exist(ast.body);
            ast.body.length.should.be.eql(1);

            ast.body[0].type.should.be.eql('IfStatement');
            ast.body[0].test.type.should.be.eql('Literal');
            ast.body[0].test.value.should.be.eql('1');
            ast.body[0].consequence.type.should.be.eql('ExpressionStatement');
            ast.body[0].consequence.expression.type.should.be.eql('Literal');
            ast.body[0].consequence.expression.value.should.be.eql('2');
            ast.body[0].alternate.type.should.be.eql('ExpressionStatement');
            ast.body[0].alternate.expression.type.should.be.eql('Literal');
            ast.body[0].alternate.expression.value.should.be.eql('3');
        });
    });

    describe('parse a nested if-statement', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                if (1)
                    if (2)
                        3;
                    else
                        4;
                else 5;
            `;
            const ast = parser.parse(input);

            ast.type.should.be.eql('Program');
            should.exist(ast.body);
            ast.body.length.should.be.eql(1);

            ast.body[0].type.should.be.eql('IfStatement');
            ast.body[0].test.type.should.be.eql('Literal');
            ast.body[0].test.value.should.be.eql('1');
            ast.body[0].alternate.type.should.be.eql('ExpressionStatement');
            ast.body[0].alternate.expression.type.should.be.eql('Literal');
            ast.body[0].alternate.expression.value.should.be.eql('5');

            const innerIf = ast.body[0].consequence;
            innerIf.type.should.be.eql('IfStatement');
            innerIf.test.type.should.be.eql('Literal');
            innerIf.test.value.should.be.eql('2');
            innerIf.consequence.type.should.be.eql('ExpressionStatement');
            innerIf.consequence.expression.type.should.be.eql('Literal');
            innerIf.consequence.expression.value.should.be.eql('3');
            innerIf.alternate.type.should.be.eql('ExpressionStatement');
            innerIf.alternate.expression.type.should.be.eql('Literal');
            innerIf.alternate.expression.value.should.be.eql('4');
        });
    });
});
