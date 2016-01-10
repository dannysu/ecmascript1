'use strict';

const should = require('should');

const parser = require('../../src/parser.js');
const estree = require('../../src/estree.js');

const u = require('../utils.js');

describe('parser', function() {
    describe('parse for-in loop missing brackets', function() {
        it('should fail', function() {
            const input = `
                for var a in 2 {
                    3;
                };
            `;
            u.expectFail(input);
        });
    });

    describe('parse for-in loop missing body', function() {
        it('should fail', function() {
            const input = `
                for (var a in 2)
            `;
            u.expectFail(input);
        });
    });

    describe('parse for loop without semicolon nor "in" keyword', function() {
        it('should fail', function() {
            const input = `
                for (1) {
                }
            `;
            u.expectFail(input);
        });
    });

    describe('parse for-in loop with multiple variable declarations', function() {
        it('should fail', function() {
            const input = `
                for (var a, b in 1) {
                }
            `;
            u.expectFail(input);
        });
    });

    describe('parse a valid, basic for-in loop', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                for (var a in 1) {
                    2;
                }
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectForInStatementFn(
                    u.expectVariableDeclarationFn([
                        u.expectVariableDeclaratorFn(
                            u.expectIdentifierFn('a'),
                            should.not.exist
                        )
                    ]),
                    u.expectLiteralFn('1'),
                    u.expectBlockFn([
                        u.expectExpressionStatementFn(
                            u.expectLiteralFn('2')
                        )
                    ])
                )
            ]);
        });
    });

    describe('parse a basic for-in loop with initializer', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                for (var a = 0 in 1) {
                    2;
                }
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectForInStatementFn(
                    u.expectVariableDeclarationFn([
                        u.expectVariableDeclaratorFn(
                            u.expectIdentifierFn('a'),
                            u.expectLiteralFn('0')
                        )
                    ]),
                    u.expectLiteralFn('1'),
                    u.expectBlockFn([
                        u.expectExpressionStatementFn(
                            u.expectLiteralFn('2')
                        )
                    ])
                )
            ]);
        });
    });
});
