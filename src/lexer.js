'use strict';

/*
 * Token Definitions
 */
class Token {
    constructor(type, value, from, to) {
        this.type = type;
        this.value = value;
        this.from = from;
        this.to = to;
    }
}

const tokenTypes = {
    comment:        'comment',
    stringLiteral:  'stringLiteral',
    eof:            'eof'
};

/*
 * Lexer States and Helper Functions
 */
let tokens = [];
let stateFn = null;
let source = '';
let start = 0;
let pos = 0;
let tokenIndex = 0;

function reset(sourceText) {
    tokens = [];
    stateFn = lexText;
    source = sourceText;
    start = 0;
    pos = 0;
    tokenIndex = 0;
}

// Skips over the pending input before this point
function ignore() {
    start = pos;
}

// Returns the next character in the source code
function peek() {
    if (pos >= source.length) {
        // null represents EOF
        return null;
    }

    const c = source[pos];
    return c
}

// Returns the next character in the source code and advance position
function next() {
    const c = peek();
    if (c !== null) {
        pos++;
    }
    return c;
}

function acceptRun(validator) {
    let c;
    do {
        c = peek();
        if (c === null) {
            break;
        }
    } while(validator(c) && ++pos);
}

function not(fn) {
    return function(c) {
        const result = fn(c);
        return !result;
    };
}

function or(fn1, fn2) {
    return function(c) {
        return fn1(c) || fn2(c);
    };
}

function oneOf(str) {
    return function(c) {
        return str.indexOf(c) >= 0;
    };
}

function addToken(type) {
    const token = new Token(type, source.substring(start, pos), start, pos);
    tokens.push(token);
    ignore();
}

// Whitespace characters as specified by ES1
function isWhitespace(c) {
    if (c === '\u0009' || c === '\u000B' ||
        c === '\u000C' || c === '\u0020') {

        return true;
    }
    return false;
}

function isLineTerminator(c) {
    if (c === '\n' || c === '\r') {
        return true;
    }
    return false;
}

function isQuoteChar(c) {
    return c === '"' || c === "'";
}

/*
 * Various State Functions
 */
function lexQuote(quoteChar) {
    return function() {
        do {
            // Keep consuming characters unless we encounter line
            // terminator, \, or the quote char.
            acceptRun(not(or(isLineTerminator, oneOf("\\" + quoteChar))));

            const c = next();
            if (isLineTerminator(c) || c === null) {
                // If we somehow reached EOL or EOF without encountering
                // corresponding quote char then this string is incomplete.
                throw new SyntaxError('Illegal token: ' + source.substring(start, pos));
            }
            else if (c === quoteChar) {
                addToken(tokenTypes.stringLiteral);
                return lexText;
            }
            else if (c === "\\" && peek() === quoteChar) {
                pos += 2;
            }
        } while(true);
    };
}

function lexSingleLineComment() {
    // Single line comment is only terminated by a line terminator
    // character and nothing else
    acceptRun(not(isLineTerminator));
    ignore();
    return lexText;
}

function lexMultiLineComment() {
    do {
        // Multi-line comment is terminated if we see * followed by /
        const nextTwo = source.substr(pos, 2);
        if (nextTwo === '*/') {
            pos += 2;
            ignore();
            return lexText;
        }

        next();
    } while(true);
}

function lexText() {
    do {
        // Examine the next 2 characters to see if we're encountering code comments
        const nextTwo = source.substr(pos, 2);
        if (nextTwo === '//') {
            pos += 2;
            return lexSingleLineComment;
        }
        else if (nextTwo === '/*') {
            pos += 2;
            return lexMultiLineComment;
        }

        // Consume the next character and decide what to do
        const c = next();
        if (c === null) {
            // EOF
            return null;
        }
        else if (isQuoteChar(c)) {
            return lexQuote(c);
        }
        else if (isWhitespace(c)) {
            ignore();
        }
        else {
            // TODO: For now, also ignore everything else until they're implemented.
            ignore();
        }
    } while(true);
}

function nextToken() {
    if (tokenIndex >= tokens.length) {
        return new Token(tokenTypes.eof, null, source.length, source.length);
    }

    const token = tokens[tokenIndex];
    tokenIndex++;
    return token;
}

function setInput(sourceText) {
    reset(sourceText);

    do {
        stateFn = stateFn();
    } while (stateFn !== null);
}

exports.nextToken = nextToken;
exports.setInput = setInput;
exports.tokenTypes = tokenTypes;
