'use strict';

const should = require('should');

const parser = require('../../src/parser.js');
const estree = require('../../src/estree.js');

describe('parser', function() {
    describe('parse a single empty statement', function() {
        it('should return proper ESTree AST', function() {
            const input = ";";
            const ast = parser.parse(input);

            ast.type.should.be.eql('Program');
            should.exist(ast.body);
            ast.body.length.should.be.eql(1);
            ast.body[0].type.should.be.eql('EmptyStatement');
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

            ast.type.should.be.eql('Program');
            should.exist(ast.body);
            ast.body.length.should.be.eql(3);

            for (let node of ast.body) {
                node.type.should.be.eql('EmptyStatement');
            }
        });
    });
});
