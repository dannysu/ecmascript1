'use strict';

const should = require('should');

const parser = require('../../src/parser.js');
const estree = require('../../src/estree.js');

const u = require('../utils.js');

describe('parser', function() {
    describe('parse continue statement outside iteration', function() {
        it('should return proper ESTree AST', function() {
            const input = "continue;";
            u.expectFail(input);
        });
    });

    describe('parse break statement outside iteration', function() {
        it('should return proper ESTree AST', function() {
            const input = "break;";
            u.expectFail(input);
        });
    });

    describe('parse continue & break statement inside iteration', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                while (true) {
                    continue;
                    if (false) {
                        break;
                    }
                }
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectWhileStatementFn(
                    u.expectLiteralFn('true'),
                    u.expectBlockFn([
                        u.expectContinueStatementFn(),
                        u.expectIfStatementFn(
                            u.expectLiteralFn('false'),
                            u.expectBlockFn([
                                u.expectBreakStatementFn()
                            ]),
                            should.not.exist
                        )
                    ])
                )
            ]);
        });
    });
});
