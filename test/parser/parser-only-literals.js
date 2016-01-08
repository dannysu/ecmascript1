'use strict';

const should = require('should');

const parser = require('../../src/parser.js');
const estree = require('../../src/estree.js');

const u = require('../utils.js');

describe('parser', function() {
    describe('parse a numeric statement', function() {
        it('should return proper ESTree AST', function() {
            const input = "0.1;";
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectExpressionStatementFn(
                    u.expectLiteralFn('0.1')
                )
            ]);
        });
    });

    describe('parse multiple numeric statements', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                0.1;
                13.1912;
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectExpressionStatementFn(
                    u.expectLiteralFn('0.1')
                ),
                u.expectExpressionStatementFn(
                    u.expectLiteralFn('13.1912')
                )
            ]);
        });
    });

    describe('parse multiple numeric values in a single statement', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                0.1, 0.2, 0.3;
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectExpressionStatementFn(
                    u.expectSequenceExpressionFn([
                        u.expectLiteralFn('0.1'),
                        u.expectLiteralFn('0.2'),
                        u.expectLiteralFn('0.3')
                    ])
                )
            ]);
        });
    });
});
