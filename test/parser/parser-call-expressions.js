'use strict';

const should = require('should');

const parser = require('../../src/parser.js');
const estree = require('../../src/estree.js');

const u = require('../utils.js');

describe('parser', function() {
    describe('parse a simple function call', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                1();
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectExpressionStatementFn(
                    u.expectCallExpressionFn(
                        u.expectLiteralFn('1'),
                        []
                    )
                )
            ]);
        });
    });

    // MemberExpression   Arguments
    // new 1().a          ()
    describe("parse expression that can't be NewExpression", function() {
        it('should return proper ESTree AST', function() {
            const input = `
                new 1().a();
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectExpressionStatementFn(
                    u.expectCallExpressionFn(
                        u.expectMemberExpressionFn(
                            u.expectNewExpressionFn(
                                u.expectLiteralFn('1'),
                                []
                            ),
                            u.expectIdentifierFn('a')
                        ),
                        []
                    )
                )
            ]);
        });
    });
});
