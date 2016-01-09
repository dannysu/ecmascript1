'use strict';

const should = require('should');

const parser = require('../../src/parser.js');
const estree = require('../../src/estree.js');

const u = require('../utils.js');

describe('parser', function() {
    describe('parse with-statement missing brackets', function() {
        it('should fail', function() {
            const input = `
                with 1;
            `;
            u.expectFail(input);
        });
    });

    describe('parse an invalid with-statement', function() {
        it('should fail', function() {
            const input = `
                with (1)
            `;
            u.expectFail(input);
        });
    });

    describe('parse an with-statement missing test expression', function() {
        it('should fail', function() {
            const input = `
                with () 1;
            `;
            u.expectFail(input);
        });
    });

    describe('parse an with-statement', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                with (1) 2;
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectWithStatementFn(
                    u.expectLiteralFn('1'),
                    u.expectExpressionStatementFn(
                        u.expectLiteralFn('2')
                    )
                )
            ]);
        });
    });

    describe('parse a nested with-statement', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                with (1)
                    with (2)
                        3;
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectWithStatementFn(
                    u.expectLiteralFn('1'),
                    u.expectWithStatementFn(
                        u.expectLiteralFn('2'),
                        u.expectExpressionStatementFn(
                            u.expectLiteralFn('3')
                        )
                    )
                )
            ]);
        });
    });

    describe('parse a nested with-statement with block statements', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                with (1) {
                    with (2) {
                        3;
                    }
                }
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectWithStatementFn(
                    u.expectLiteralFn('1'),
                    u.expectBlockFn([
                        u.expectWithStatementFn(
                            u.expectLiteralFn('2'),
                            u.expectBlockFn([
                                u.expectExpressionStatementFn(
                                    u.expectLiteralFn('3')
                                )
                            ])
                        )
                    ])
                )
            ]);
        });
    });
});
