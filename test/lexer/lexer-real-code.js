'use strict';

const should = require('should');

const Lexer = require('../../src/lexer.js');
const codemirror = require('../codemirror-string.js');
const jquery = require('../jquery-string.js');

describe('lexer', function() {
    describe('parse CodeMirror code', function() {
        it('should succeed', function() {
            const lexer = new Lexer(codemirror.codemirror30);
        });
    });

    describe('parse jQuery code', function() {
        it('should succeed', function() {
            const lexer = new Lexer(jquery.jquery111);
        });
    });
});
