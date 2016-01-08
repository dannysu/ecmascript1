'use strict';

const should = require('should');

const parser = require('../../src/parser.js');
const estree = require('../../src/estree.js');

const u = require('../utils.js');

describe('parser', function() {
    describe('parse if-statement missing brackets', function() {
        it('should fail', function() {
            const input = `
                if 1;
            `;
            u.expectFail(input);
        });
    });

    describe('parse an invalid if-statement', function() {
        it('should fail', function() {
            const input = `
                if (1)
            `;
            u.expectFail(input);
        });
    });

    describe('parse if-statement missing else statement', function() {
        it('should fail', function() {
            const input = `
                if (1) 2;
                else
            `;
            u.expectFail(input);
        });
    });

    describe('parse an if-statement without else', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                if (1) 2;
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectIfStatementFn(
                    u.expectLiteralFn('1'),
                    u.expectExpressionStatementFn(
                        u.expectLiteralFn('2')
                    ),
                    should.not.exist
                )
            ]);
        });
    });

    describe('parse an if-statement with else', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                if (1) 2;
                else 3;
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectIfStatementFn(
                    u.expectLiteralFn('1'),
                    u.expectExpressionStatementFn(
                        u.expectLiteralFn('2')
                    ),
                    u.expectExpressionStatementFn(
                        u.expectLiteralFn('3')
                    )
                )
            ]);
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

            u.expectProgram(ast, [
                u.expectIfStatementFn(
                    u.expectLiteralFn('1'),
                    u.expectIfStatementFn(
                        u.expectLiteralFn('2'),
                        u.expectExpressionStatementFn(
                            u.expectLiteralFn('3')
                        ),
                        u.expectExpressionStatementFn(
                            u.expectLiteralFn('4')
                        )
                    ),
                    u.expectExpressionStatementFn(
                        u.expectLiteralFn('5')
                    )
                )
            ]);
        });
    });

    describe('parse a nested if-statement with block statements', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                if (1) {
                    if (2) {
                        3;
                    }
                    else {
                        4;
                    }
                }
                else {
                    5;
                }
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectIfStatementFn(
                    u.expectLiteralFn('1'),
                    u.expectBlockFn([
                        u.expectIfStatementFn(
                            u.expectLiteralFn('2'),
                            u.expectBlockFn([
                                u.expectExpressionStatementFn(
                                    u.expectLiteralFn('3')
                                )
                            ]),
                            u.expectBlockFn([
                                u.expectExpressionStatementFn(
                                    u.expectLiteralFn('4')
                                )
                            ])
                        ),
                    ]),
                    u.expectBlockFn([
                        u.expectExpressionStatementFn(
                            u.expectLiteralFn('5')
                        )
                    ])
                )
            ]);
        });
    });
});
