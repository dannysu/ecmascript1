'use strict';

const should = require('should');

const parser = require('../../src/parser.js');
const estree = require('../../src/estree.js');

const u = require('../utils.js');

describe('parser', function() {
    describe('parse return statement outside of a function', function() {
        it('should fail', function() {
            const input = `
                return 1;
            `;
            u.expectFail(input);
        });
    });

    describe('parse an empty function without any params', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                function test(){}
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectFunctionDeclarationFn(
                    u.expectIdentifierFn('test'),
                    [],
                    u.expectBlockFn([])
                )
            ]);
        });
    });

    describe('parse an empty function with 1 parameter', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                function test(arg1){}
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectFunctionDeclarationFn(
                    u.expectIdentifierFn('test'),
                    [
                        u.expectIdentifierFn('arg1'),
                    ],
                    u.expectBlockFn([])
                )
            ]);
        });
    });

    describe('parse an empty function with multiple parameters', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                function test(arg1, arg2, arg3){}
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectFunctionDeclarationFn(
                    u.expectIdentifierFn('test'),
                    [
                        u.expectIdentifierFn('arg1'),
                        u.expectIdentifierFn('arg2'),
                        u.expectIdentifierFn('arg3')
                    ],
                    u.expectBlockFn([])
                )
            ]);
        });
    });

    describe('parse a function with return statement', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                function not() {
                    if (true) {
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectFunctionDeclarationFn(
                    u.expectIdentifierFn('not'),
                    [],
                    u.expectBlockFn([
                        u.expectIfStatementFn(
                            u.expectLiteralFn('true'),
                            u.expectBlockFn([
                                u.expectReturnStatementFn(
                                    u.expectLiteralFn('false')
                                )
                            ]),
                            u.expectBlockFn([
                                u.expectReturnStatementFn(
                                    u.expectLiteralFn('true')
                                )
                            ])
                        )
                    ])
                )
            ]);
        });
    });
});
