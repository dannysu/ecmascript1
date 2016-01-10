'use strict';

const should = require('should');

const parser = require('../../src/parser.js');
const estree = require('../../src/estree.js');

const u = require('../utils.js');

describe('parser', function() {
    describe('parse for loop missing brackets', function() {
        it('should fail', function() {
            const input = `
                for 1; 2; 3 {
                    4;
                };
            `;
            u.expectFail(input);
        });
    });

    describe('parse for loop missing body', function() {
        it('should fail', function() {
            const input = `
                for (1; 2; 3)
            `;
            u.expectFail(input);
        });
    });

    describe('parse for loop missing semicolon', function() {
        it('should fail', function() {
            const input = `
                for (1; 2) {
                }
            `;
            u.expectFail(input);
        });
    });

    describe('parse a valid, basic for loop', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                for (1; 2; 3) {
                    2;
                }
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectForStatementFn(
                    u.expectLiteralFn('1'),
                    u.expectLiteralFn('2'),
                    u.expectLiteralFn('3'),
                    u.expectBlockFn([
                        u.expectExpressionStatementFn(
                            u.expectLiteralFn('2')
                        )
                    ])
                )
            ]);
        });
    });

    describe('parse for loop without any expressions', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                for (;;) {
                    1;
                }
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectForStatementFn(
                    should.not.exist,
                    should.not.exist,
                    should.not.exist,
                    u.expectBlockFn([
                        u.expectExpressionStatementFn(
                            u.expectLiteralFn('1')
                        )
                    ])
                )
            ]);
        });
    });

    describe('parse a valid for loop with multiple expressions', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                for (1, 2; 3, 4; 5, 6) {
                    7;
                }
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectForStatementFn(
                    u.expectSequenceExpressionFn([
                        u.expectLiteralFn('1'),
                        u.expectLiteralFn('2')
                    ]),
                    u.expectSequenceExpressionFn([
                        u.expectLiteralFn('3'),
                        u.expectLiteralFn('4')
                    ]),
                    u.expectSequenceExpressionFn([
                        u.expectLiteralFn('5'),
                        u.expectLiteralFn('6')
                    ]),
                    u.expectBlockFn([
                        u.expectExpressionStatementFn(
                            u.expectLiteralFn('7')
                        )
                    ])
                )
            ]);
        });
    });

    describe('parse a valid, basic for loop with a variable declaration', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                for (var a = 1; 2; 3) {
                    4;
                }
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectForStatementFn(
                    u.expectVariableDeclarationFn([
                        u.expectVariableDeclaratorFn(
                            u.expectIdentifierFn('a'),
                            u.expectLiteralFn('1')
                        )
                    ]),
                    u.expectLiteralFn('2'),
                    u.expectLiteralFn('3'),
                    u.expectBlockFn([
                        u.expectExpressionStatementFn(
                            u.expectLiteralFn('4')
                        )
                    ])
                )
            ]);
        });
    });

    describe('parse for loop with multiple variable declarations', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                for (var a = 1, b = 2; 3; 4) {
                    5;
                }
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectForStatementFn(
                    u.expectVariableDeclarationFn([
                        u.expectVariableDeclaratorFn(
                            u.expectIdentifierFn('a'),
                            u.expectLiteralFn('1')
                        ),
                        u.expectVariableDeclaratorFn(
                            u.expectIdentifierFn('b'),
                            u.expectLiteralFn('2')
                        )
                    ]),
                    u.expectLiteralFn('3'),
                    u.expectLiteralFn('4'),
                    u.expectBlockFn([
                        u.expectExpressionStatementFn(
                            u.expectLiteralFn('5')
                        )
                    ])
                )
            ]);
        });
    });

    describe('parse nested for-loops', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                for (;;) {
                    for (;;) {
                        for (;;)
                            1;
                    }
                }
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectForStatementFn(
                    should.not.exist,
                    should.not.exist,
                    should.not.exist,
                    u.expectBlockFn([
                        u.expectForStatementFn(
                            should.not.exist,
                            should.not.exist,
                            should.not.exist,
                            u.expectBlockFn([
                                u.expectForStatementFn(
                                    should.not.exist,
                                    should.not.exist,
                                    should.not.exist,
                                    u.expectExpressionStatementFn(
                                        u.expectLiteralFn('1')
                                    )
                                )
                            ])
                        )
                    ])
                )
            ]);
        });
    });
});
