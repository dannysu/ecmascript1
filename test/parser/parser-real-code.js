'use strict';

const should = require('should');

const parser = require('../../src/parser.js');
const estree = require('../../src/estree.js');

const u = require('../utils.js');

describe('parser', function() {
    describe('parse Fibonacci function demo program', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                var num = 333;

                function fibonacci(num) {
                    if (num <= 1) {
                        return num;
                    }
                    else {
                        return fibonacci(num - 1) + fibonacci(num - 2);
                    }
                }

                console.log(num);
                console.log(fibonacci(3));
                console.log(fibonacci(5));
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectVariableDeclarationFn([
                    u.expectVariableDeclaratorFn(
                        u.expectIdentifierFn('num'),
                        u.expectLiteralFn('333')
                    )
                ]),
                u.expectFunctionDeclarationFn(
                    u.expectIdentifierFn('fibonacci'),
                    [
                        u.expectIdentifierFn('num')
                    ],
                    u.expectBlockFn([
                        u.expectIfStatementFn(
                            u.expectBinaryExpressionFn(
                                '<=',
                                u.expectIdentifierFn('num'),
                                u.expectLiteralFn('1')
                            ),
                            u.expectBlockFn([
                                u.expectReturnStatementFn(
                                    u.expectIdentifierFn('num')
                                )
                            ]),
                            u.expectBlockFn([
                                u.expectReturnStatementFn(
                                    u.expectBinaryExpressionFn(
                                        '+',
                                        u.expectCallExpressionFn(
                                            u.expectIdentifierFn('fibonacci'),
                                            [
                                                u.expectBinaryExpressionFn(
                                                    '-',
                                                    u.expectIdentifierFn('num'),
                                                    u.expectLiteralFn('1')
                                                )
                                            ]
                                        ),
                                        u.expectCallExpressionFn(
                                            u.expectIdentifierFn('fibonacci'),
                                            [
                                                u.expectBinaryExpressionFn(
                                                    '-',
                                                    u.expectIdentifierFn('num'),
                                                    u.expectLiteralFn('2')
                                                )
                                            ]
                                        )
                                    )
                                )
                            ])
                        )
                    ])
                ),
                u.expectExpressionStatementFn(
                    u.expectCallExpressionFn(
                        u.expectMemberExpressionFn(
                            u.expectIdentifierFn('console'),
                            u.expectIdentifierFn('log')
                        ),
                        [
                            u.expectIdentifierFn('num')
                        ]
                    )
                ),
                u.expectExpressionStatementFn(
                    u.expectCallExpressionFn(
                        u.expectMemberExpressionFn(
                            u.expectIdentifierFn('console'),
                            u.expectIdentifierFn('log')
                        ),
                        [
                            u.expectCallExpressionFn(
                                u.expectIdentifierFn('fibonacci'),
                                [
                                    u.expectLiteralFn('3')
                                ]
                            )
                        ]
                    )
                ),
                u.expectExpressionStatementFn(
                    u.expectCallExpressionFn(
                        u.expectMemberExpressionFn(
                            u.expectIdentifierFn('console'),
                            u.expectIdentifierFn('log')
                        ),
                        [
                            u.expectCallExpressionFn(
                                u.expectIdentifierFn('fibonacci'),
                                [
                                    u.expectLiteralFn('5')
                                ]
                            )
                        ]
                    )
                )
            ]);
        });
    });
});
