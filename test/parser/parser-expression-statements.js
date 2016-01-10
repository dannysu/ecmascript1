'use strict';

const should = require('should');

const parser = require('../../src/parser.js');
const estree = require('../../src/estree.js');

const u = require('../utils.js');

describe('parser', function() {
    describe('parse "this"', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                this;
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectExpressionStatementFn(
                    u.expectThisExpressionFn()
                )
            ]);
        });
    });

    describe('parse addition', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                1 + 2 + 3;
            `;
            const ast = parser.parse(input);

            // Expecting the addition to have left-associativity.
            // i.e. (1 + 2) + 3
            u.expectProgram(ast, [
                u.expectExpressionStatementFn(
                    u.expectBinaryExpressionFn(
                        '+',
                        u.expectBinaryExpressionFn(
                            '+',
                            u.expectLiteralFn('1'),
                            u.expectLiteralFn('2')
                        ),
                        u.expectLiteralFn('3')
                    )
                )
            ]);
        });
    });

    describe('parse multiplication and addition', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                1 + 2 * 3;
            `;
            const ast = parser.parse(input);

            // Expecting the multiplication to have higher precedence
            // i.e. 1 + (2 * 3)
            u.expectProgram(ast, [
                u.expectExpressionStatementFn(
                    u.expectBinaryExpressionFn(
                        '+',
                        u.expectLiteralFn('1'),
                        u.expectBinaryExpressionFn(
                            '*',
                            u.expectLiteralFn('2'),
                            u.expectLiteralFn('3')
                        )
                    )
                )
            ]);
        });
    });

    describe('parse mixed unary and binary expression', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                1 - !2;
            `;
            const ast = parser.parse(input);

            // Expecting the unary expression to have higher precedence
            // i.e. 1 - (!2)
            u.expectProgram(ast, [
                u.expectExpressionStatementFn(
                    u.expectBinaryExpressionFn(
                        '-',
                        u.expectLiteralFn('1'),
                        u.expectUnaryExpressionFn(
                            '!',
                            u.expectLiteralFn('2'),
                            true
                        )
                    )
                )
            ]);
        });
    });

    describe('parse prefix and postfix update expression', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                a++;
                ++a;
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectExpressionStatementFn(
                    u.expectUpdateExpressionFn(
                        '++',
                        u.expectIdentifierFn('a'),
                        false
                    )
                ),
                u.expectExpressionStatementFn(
                    u.expectUpdateExpressionFn(
                        '++',
                        u.expectIdentifierFn('a'),
                        true
                    )
                )
            ]);
        });
    });

    describe('parse conditional expression', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                a ? true : false;
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectExpressionStatementFn(
                    u.expectConditionalExpressionFn(
                        u.expectIdentifierFn('a'),
                        u.expectLiteralFn('true'),
                        u.expectLiteralFn('false')
                    )
                )
            ]);
        });
    });
});
