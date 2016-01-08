'use strict';

const should = require('should');

const parser = require('../../src/parser.js');
const estree = require('../../src/estree.js');

const u = require('../utils.js');

describe('parser', function() {
    describe('parse a block statement with missing ending }', function() {
        it('should fail', function() {
            const input = `
                {
                    1;
            `;
            u.expectFail(input);
        });
    });

    describe('parse a block statement', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                {
                    1;
                    2;
                    3;
                }
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectBlockFn([
                    u.expectExpressionStatementFn(
                        u.expectLiteralFn('1')
                    ),
                    u.expectExpressionStatementFn(
                        u.expectLiteralFn('2')
                    ),
                    u.expectExpressionStatementFn(
                        u.expectLiteralFn('3')
                    )
                ])
            ]);
        });
    });
});
