'use strict';

const should = require('should');

const parser = require('../../src/parser.js');
const estree = require('../../src/estree.js');

const u = require('../utils.js');

describe('parser', function() {
    describe('parse while loop missing brackets', function() {
        it('should fail', function() {
            const input = `
                while 1 {
                    2;
                };
            `;
            u.expectFail(input);
        });
    });

    describe('parse while loop missing body', function() {
        it('should fail', function() {
            const input = `
                while (1)
            `;
            u.expectFail(input);
        });
    });

    describe('parse a valid, basic while loop', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                while (1) {
                    2;
                }
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectWhileStatementFn(
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

    describe('parse a valid while loop with multiple expressions', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                while (1, 2, 3) {
                    4;
                }
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectWhileStatementFn(
                    u.expectSequenceExpressionFn([
                        u.expectLiteralFn('1'),
                        u.expectLiteralFn('2'),
                        u.expectLiteralFn('3'),
                    ]),
                    u.expectBlockFn([
                        u.expectExpressionStatementFn(
                            u.expectLiteralFn('4')
                        )
                    ])
                )
            ]);
        });
    });

    describe('parse a nested while loop', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                while (1) {
                    while (2)
                        while (3)
                            4;
                }
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectWhileStatementFn(
                    u.expectLiteralFn('1'),
                    u.expectBlockFn([
                        u.expectWhileStatementFn(
                            u.expectLiteralFn('2'),
                            u.expectWhileStatementFn(
                                u.expectLiteralFn('3'),
                                u.expectExpressionStatementFn(
                                    u.expectLiteralFn('4')
                                )
                            )
                        )
                    ])
                )
            ]);
        });
    });
});
