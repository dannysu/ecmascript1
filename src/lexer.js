'use strict';

const Token = require('./token.js').Token;
const tokenTypes = require('./token.js').tokenTypes;

function Lexer(sourceText) {
    this.setInput(sourceText);
}

/*
 * Lexer States and Helper Functions
 */
Lexer.prototype.reset = function(sourceText) {
    this.tokens = [];
    this.stateFn = this.lexText;
    this.source = sourceText;
    this.start = 0;
    this.pos = 0;
    this.tokenIndex = 0;
};

// Skips over the pending input before this point
Lexer.prototype.ignore = function() {
    this.start = this.pos;
};

// Returns the next character in the source code
Lexer.prototype.peek = function() {
    if (this.pos >= this.source.length) {
        // null represents EOF
        return null;
    }

    const c = this.source[this.pos];
    return c;
};

// Returns the next character in the source code and advance position
Lexer.prototype.next = function() {
    const c = this.peek();
    if (c !== null) {
        this.pos++;
    }
    return c;
};

Lexer.prototype.backup = function() {
    this.pos--;
};

Lexer.prototype.accept = function(validator) {
    const c = this.peek();
    if (c !== null && validator(c)) {
        this.pos++;
        return true;
    }

    return false;
};

Lexer.prototype.acceptRun = function(validator) {
    let c;
    let startedAt = this.pos;
    do {
        c = this.peek();
        if (c === null) {
            break;
        }
    } while(validator(c) && ++this.pos);

    return (this.pos > startedAt);
};

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

Lexer.prototype.addToken = function(type) {
    const token = new Token(type, this.source.substring(this.start, this.pos), this.start, this.pos);
    this.tokens.push(token);
    this.ignore();
};

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
Lexer.prototype.lexIdentifier = function() {
    // Keywords and reserved keywords will be a subset of the words that
    // can be formed by identifier chars.
    // Keep accumulating chars and check for keyword later.
    this.acceptRun(isIdentifierChar);

    // Make sure identifier didn't start with a decimal digit
    const firstChar = this.source[this.start];
    if (isDecimalDigit(firstChar)) {
        throw new SyntaxError("Invalid identifier: " + this.source.substring(this.start, this.pos));
    }

    const c = this.peek();
    if (isQuoteChar(c)) {
        throw new SyntaxError("Invalid identifier: " + this.source.substring(this.start, this.pos + 1));
    }

    const word = this.source.substring(this.start, this.pos);
    if (isKeyword(word)) {
        this.addToken(tokenTypes.keyword);
    }
    else {
        this.addToken(tokenTypes.identifier);
    }
    return this.lexText;
};

Lexer.prototype.lexNumber = function() {
    let validator = isDecimalDigit;

    // If the first digit is 0, then need to first determine whether it's an
    // octal number, or a hex number, or a decimal number.
    if (this.accept(oneOf("0"))) {
        // If number started with 0x or 0X, then it's a hex number.
        if (this.accept(oneOf("xX"))) {
            validator = isHexDigit;

            // The hex number needs to at least be followed by some digit.
            if (!this.accept(validator)) {
                throw new SyntaxError("Invalid number: " + this.source.substring(this.start, this.pos + 1));
            }
        }
        // If number starts with 0 followed by an octal digit, then it's an
        // octal number.
        else if (this.accept(isOctalDigit)) {
            validator = isOctalDigit;
        }
        // If a 0 isn't a hex nor an octal number, then it's invalid.
        else if (this.accept(isDecimalDigit)) {
            throw new SyntaxError("Invalid number: " + this.source.substring(this.start, this.pos));
        }
    }

    // Keep on consuming valid digits until it runs out
    this.acceptRun(validator);

    if (validator == isDecimalDigit) {
        // A number could have a decimal in it, followed by a sequence of valid
        // digits again.
        if (this.accept(oneOf("."))) {
            this.acceptRun(validator);
        }

        if (this.accept(oneOf("eE"))) {
            this.accept(oneOf("+-"));
            if (!this.accept(validator)) {
                throw new SyntaxError("Invalid number: " + this.source.substring(this.start, this.pos + 1));
            }
            this.acceptRun(validator);
        }
    }

    // A number cannot be immediately followed by characters that could be used
    // for identifiers or keywords. It also cannot be immediately followed by
    // a string.
    const c = this.peek();
    if (isIdentifierChar(c) || isQuoteChar(c) || oneOf(".eE")(c)) {
        throw new SyntaxError("Invalid number: " + this.source.substring(this.start, this.pos + 1));
    }

    this.addToken(tokenTypes.numericLiteral);

    return this.lexText;
};

Lexer.prototype.lexPunctuator = function() {
    // This loop will handle the situation when valid punctuators are next
    // to each other. E.g. ![x];
    while (this.accept(isPunctuatorChar)) {
        let word = this.source.substring(this.start, this.pos);

        // Keep accumulating punctuator chars, and as soon as the accumulated
        // word isn't a valid punctuator, we stop and backup to take the
        // longest valid punctuator before continuing.
        if (!isPunctuator(word)) {
            this.backup();
            this.addToken(tokenTypes.punctuator);
            return this.lexText;
        }
    }

    // Handle the case when punctuator is by itself and not next to
    // other punctuators.
    const word = this.source.substring(this.start, this.pos);
    if (isPunctuator(word)) {
        this.addToken(tokenTypes.punctuator);
        return this.lexText;
    }
    else {
        // This shouldn't ever happen, but throw an exception to make sure we
        // catch it if it does.
        throw new SyntaxError('Invalid punctuator: ' + word);
    }
};

Lexer.prototype.lexQuote = function(quoteChar) {
    return function() {
        let escapeEncountered = false;
        do {
            // Keep consuming characters unless we encounter line
            // terminator, \, or the quote char.
            if (this.acceptRun(not(or(isLineTerminator, oneOf("\\" + quoteChar))))) {
                escapeEncountered = false;
            }

            const c = this.next();
            if (c === null) {
                // If we reached EOF without the closing quote char, then this string is incomplete.
                throw new SyntaxError('Illegal token: ' + this.source.substring(this.start, this.pos));
            }
            else if (!escapeEncountered) {
                if (isLineTerminator(c)) {
                    // If we somehow reached EOL without encountering the
                    // ending quote char then this string is incomplete.
                    throw new SyntaxError('Illegal token: ' + this.source.substring(this.start, this.pos));
                }
                else if (c === quoteChar) {
                    this.addToken(tokenTypes.stringLiteral);
                    return this.lexText;
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
};

Lexer.prototype.lexSingleLineComment = function() {
    // Single line comment is only terminated by a line terminator
    // character and nothing else
    this.acceptRun(not(isLineTerminator));
    this.ignore();
    return this.lexText;
};

Lexer.prototype.lexMultiLineComment = function() {
    do {
        // Multi-line comment is terminated if we see * followed by /
        const nextTwo = this.source.substr(this.pos, 2);
        if (nextTwo === '*/') {
            this.pos += 2;
            this.ignore();
            return this.lexText;
        }

        this.next();
    } while(true);
};

Lexer.prototype.lexText = function() {
    do {
        // Examine the next 2 characters to see if we're encountering code comments
        const nextTwo = this.source.substr(this.pos, 2);
        if (nextTwo === '//') {
            this.pos += 2;
            return this.lexSingleLineComment;
        }
        else if (nextTwo === '/*') {
            this.pos += 2;
            return this.lexMultiLineComment;
        }

        // Consume the next character and decide what to do
        const c = this.next();
        if (c === null) {
            // EOF
            return null;
        }
        else if (isQuoteChar(c)) {
            return this.lexQuote(c);
        }
        else if (isDecimalDigit(c) || (c === '.' && isDecimalDigit(this.peek()))) {
            this.backup();
            return this.lexNumber;
        }
        else if (isWhitespace(c)) {
            this.ignore();
        }
        else if (isPunctuatorChar(c)) {
            this.backup();
            return this.lexPunctuator;
        }
        else if (isIdentifierChar(c)) {
            this.backup();
            return this.lexIdentifier;
        }
        else if (isLineTerminator(c)) {
            this.ignore();
        }
        else {
            throw new SyntaxError('Unexpected character: ' + c);
        }
    } while(true);
};

Lexer.prototype.nextToken = function() {
    if (this.tokenIndex >= this.tokens.length) {
        return new Token(tokenTypes.eof, null, this.source.length, this.source.length);
    }

    const token = this.tokens[this.tokenIndex];
    this.tokenIndex++;
    return token;
};

Lexer.prototype.setInput = function(sourceText) {
    this.reset(sourceText);

    do {
        this.stateFn = this.stateFn();
    } while (this.stateFn !== null);
};

module.exports = Lexer;
