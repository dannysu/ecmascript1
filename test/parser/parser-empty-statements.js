'use strict';

const should = require('should');

const parser = require('../../src/parser.js');
const estree = require('../../src/estree.js');

const u = require('../utils.js');

describe('parser', function() {
    describe('parse a single empty statement', function() {
        it('should return proper ESTree AST', function() {
            const input = ";";
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectEmptyStatementFn
            ]);
        });
    });

    describe('parse multiple empty statements', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                ; // <- empty statement
                ; // <- empty statement
                ; // <- empty statement
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectEmptyStatementFn,
                u.expectEmptyStatementFn,
                u.expectEmptyStatementFn
            ]);
        });
    });
});
