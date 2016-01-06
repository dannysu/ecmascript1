'use strict';

const util = require('util');

const Lexer = require('./lexer.js');
const tokenTypes = require('./token.js').tokenTypes;
const estree = require('./estree.js');

const e = exports;

function Parser(sourceText) {
    this.tokens = [];
    this.lexer = new Lexer(sourceText);
}

const pp = Parser.prototype;

/*
 * Lexer Interactions
 */
// Returns the next token
pp.next = function() {
    if (this.tokens.length > 0) {
        return this.tokens[0];
    }
    else {
        const token = this.lexer.nextToken();
        this.tokens.push(token);
        return token;
    }
};

pp.consume = function() {
    if (this.tokens.length === 0) {
        this.next();
    }
    const token = this.tokens.shift();
    return token;
};

/*
 * Helper Functions
 */
pp.expectPunctuator = function(punctuator) {
    return this.expectPunctuators([punctuator]);
};

pp.expectPunctuators = function(punctuators) {
    const token = this.consume();
    if (token.type !== tokenTypes.punctuator) {
        throw new SyntaxError('TODO');
    }

    if (punctuators.indexOf(token.value) < 0) {
        throw new SyntaxError('TODO');
    }

    // TODO: Add to AST
};

pp.matchPunctuator = function(punctuator) {
    return this.matchPunctuators([punctuator]);
};

pp.matchPunctuators = function(punctuators) {
    const token = this.next();
    if (token.type !== tokenTypes.punctuator) {
        return false;
    }

    return punctuators.indexOf(token.value) >= 0;
};

pp.matchStatement = function() {
    return this.matchPunctuator(";");
};

/*
 * Actual recursive descent part of things
 */
pp.parseStatement = function() {
    // Parse EmptyStatement
    if (this.matchPunctuator(";")) {
        this.expectPunctuator(";");
        return new estree.EmptyStatement();
    }

    // TODO: Need to parse other types of statements
};

pp.parseSourceElement = function() {
    // TODO: Need to parse function declaration at some point
    return this.parseStatement();
}

pp.parseProgram = function() {
    const body = [];

    body.push(this.parseSourceElement());

    // Check to see if there are more SourceElement
    while (this.matchStatement()) {
        body.push(this.parseSourceElement());
    }

    if (this.tokens.length !== 1 && this.tokens[0].type !== tokenTypes.eof) {
        throw new SyntaxError("Didn't consume all tokens: " + util.inspect(this.tokens[0]));
    }

    return new estree.Program(body);
};

function parse(sourceText) {
    const parser = new Parser(sourceText);
    return parser.parseProgram();
}

e.parse = parse;
