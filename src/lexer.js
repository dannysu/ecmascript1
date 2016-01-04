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
    comment:         'comment',
    stringLiteral:   'stringLiteral',
    numericLiteral:  'numericLiteral',
    punctuator:      'punctuator',
    keyword:         'keyword',
    identifier:      'identifier',
    eof:             'eof'
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

function backup() {
    pos--;
}

function accept(validator) {
    const c = peek();
    if (c !== null && validator(c)) {
        pos++;
        return true;
    }

    return false;
}

function acceptRun(validator) {
    let c;
    let startedAt = pos;
    do {
        c = peek();
        if (c === null) {
            break;
        }
    } while(validator(c) && ++pos);

    return (pos > startedAt);
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

function isPunctuatorChar(c) {
    const chars = [
        '=', '.', '-', '%', '}', '>', ',', '*', '[', '<', '!', '/',
        ']', '~', '&', '(', ';', '?', '|', ')', ':', '+', '^', '{'
    ];

    return (chars.indexOf(c) >= 0);
}

function isPunctuator(word) {
    switch (word.length) {
        case 1:
            return [
                '=', '.', '-', '%', '}', '>', ',', '*', '[', '<', '!', '/',
                ']', '~', '&', '(', ';', '?', '|', ')', ':', '+', '^', '{'
            ].indexOf(word) >= 0;

        case 2:
            return [
                '!=', '*=', '&&', '<<', '/=', '||', '>>', '&=', '==', '++',
                '|=', '<=', '--', '+=', '^=', '>=', '-=', '%='
            ].indexOf(word) >= 0;

        case 3:
            return [
                '>>=', '>>>', '<<='
            ].indexOf(word) >= 0;

        case 4:
            return word === '>>>=';

        default:
            return false;
    }
}

function isAlphaChar(c) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}

function isDecimalDigit(c) {
    return c >= '0' && c <= '9';
}

function isOctalDigit(c) {
    return c >= '0' && c <= '7';
}

function isHexDigit(c) {
    return (c >= '0' && c <= '9') ||
        (c >= 'a' && c <= 'f') ||
        (c >= 'A' && c <= 'F');
}

function isIdentifierChar(c) {
    return isAlphaChar(c) || c === '$' || c === '_' || isDecimalDigit(c);
}

function isKeyword(word) {
    switch (word.length) {
        case 2:
            switch (word) {
                case 'if':
                case 'in':
                case 'do':
                    return true;
            }
            return false;

        case 3:
            switch (word) {
                case 'for':
                case 'new':
                case 'var':
                case 'try':
                    return true;
            }
            return false;

        case 4:
            switch (word) {
                case 'else':
                case 'this':
                case 'void':
                case 'with':
                case 'case':
                case 'enum':
                    return true;
            }
            return false;

        case 5:
            switch (word) {
                case 'break':
                case 'while':
                case 'catch':
                case 'class':
                case 'const':
                case 'super':
                case 'throw':
                    return true;
            }
            return false;

        case 6:
            switch (word) {
                case 'delete':
                case 'return':
                case 'typeof':
                case 'import':
                case 'switch':
                case 'export':
                    return true;
            }
            return false;

        case 7:
            switch (word) {
                case 'default':
                case 'extends':
                case 'finally':
                    return true;
            }
            return false;

        case 8:
            switch (word) {
                case 'continue':
                case 'function':
                case 'debugger':
                    return true;
            }
            return false;

        default:
            return false;
    }
}

/*
 * Various State Functions
 */
function lexIdentifier() {
    // Keywords and reserved keywords will be a subset of the words that
    // can be formed by identifier chars.
    // Keep accumulating chars and check for keyword later.
    acceptRun(isIdentifierChar);

    // Make sure identifier didn't start with a decimal digit
    const firstChar = source[start];
    if (isDecimalDigit(firstChar)) {
        throw new SyntaxError("Invalid identifier: " + source.substring(start, pos));
    }

    const c = peek();
    if (isQuoteChar(c)) {
        throw new SyntaxError("Invalid identifier: " + source.substring(start, pos + 1));
    }

    const word = source.substring(start, pos);
    if (isKeyword(word)) {
        addToken(tokenTypes.keyword);
    }
    else {
        addToken(tokenTypes.identifier);
    }
    return lexText;
}

function lexNumber() {
    let validator = isDecimalDigit;

    // If the first digit is 0, then need to first determine whether it's an
    // octal number, or a hex number, or a decimal number.
    if (accept(oneOf("0"))) {
        // If number started with 0x or 0X, then it's a hex number.
        if (accept(oneOf("xX"))) {
            validator = isHexDigit;

            // The hex number needs to at least be followed by some digit.
            if (!accept(validator)) {
                throw new SyntaxError("Invalid number: " + source.substring(start, pos + 1));
            }
        }
        // If number starts with 0 followed by an octal digit, then it's an
        // octal number.
        else if (accept(isOctalDigit)) {
            validator = isOctalDigit;
        }
        // If a 0 isn't a hex nor an octal number, then it's invalid.
        else if (accept(isDecimalDigit)) {
            throw new SyntaxError("Invalid number: " + source.substring(start, pos));
        }
    }

    // Keep on consuming valid digits until it runs out
    acceptRun(validator);

    if (validator == isDecimalDigit) {
        // A number could have a decimal in it, followed by a sequence of valid
        // digits again.
        if (accept(oneOf("."))) {
            acceptRun(validator);
        }

        if (accept(oneOf("eE"))) {
            accept(oneOf("+-"));
            if (!accept(validator)) {
                throw new SyntaxError("Invalid number: " + source.substring(start, pos + 1));
            }
            acceptRun(validator);
        }
    }

    // A number cannot be immediately followed by characters that could be used
    // for identifiers or keywords. It also cannot be immediately followed by
    // a string.
    const c = peek();
    if (isIdentifierChar(c) || isQuoteChar(c) || oneOf(".eE")(c)) {
        throw new SyntaxError("Invalid number: " + source.substring(start, pos + 1));
    }

    addToken(tokenTypes.numericLiteral);

    return lexText();
}

function lexPunctuator() {
    // This loop will handle the situation when valid punctuators are next
    // to each other. E.g. ![x];
    while (accept(isPunctuatorChar)) {
        let word = source.substring(start, pos);

        // Keep accumulating punctuator chars, and as soon as the accumulated
        // word isn't a valid punctuator, we stop and backup to take the
        // longest valid punctuator before continuing.
        if (!isPunctuator(word)) {
            backup();
            addToken(tokenTypes.punctuator);
            return lexText;
        }
    }

    // Handle the case when punctuator is by itself and not next to
    // other punctuators.
    const word = source.substring(start, pos);
    if (isPunctuator(word)) {
        addToken(tokenTypes.punctuator);
        return lexText;
    }
    else {
        // This shouldn't ever happen, but throw an exception to make sure we
        // catch it if it does.
        throw new SyntaxError('Invalid punctuator: ' + word);
    }
}

function lexQuote(quoteChar) {
    return function() {
        let escapeEncountered = false;
        do {
            // Keep consuming characters unless we encounter line
            // terminator, \, or the quote char.
            if (acceptRun(not(or(isLineTerminator, oneOf("\\" + quoteChar))))) {
                escapeEncountered = false;
            }

            const c = next();
            if (c === null) {
                // If we reached EOF without the closing quote char, then this string is incomplete.
                throw new SyntaxError('Illegal token: ' + source.substring(start, pos));
            }
            else if (!escapeEncountered) {
                if (isLineTerminator(c)) {
                    // If we somehow reached EOL without encountering the
                    // ending quote char then this string is incomplete.
                    throw new SyntaxError('Illegal token: ' + source.substring(start, pos));
                }
                else if (c === quoteChar) {
                    addToken(tokenTypes.stringLiteral);
                    return lexText;
                }
                else if (c === "\\") {
                    escapeEncountered = true;
                }
            }
            else {
                escapeEncountered = false;
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
        else if (isDecimalDigit(c) || (c === '.' && isDecimalDigit(peek()))) {
            backup();
            return lexNumber;
        }
        else if (isWhitespace(c)) {
            ignore();
        }
        else if (isPunctuatorChar(c)) {
            backup();
            return lexPunctuator;
        }
        else if (isIdentifierChar(c)) {
            backup();
            return lexIdentifier;
        }
        else if (isLineTerminator(c)) {
            ignore();
        }
        else {
            throw new SyntaxError('Unexpected character: ' + c);
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
