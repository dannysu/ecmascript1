'use strict';

const e = exports;

class Node {
    constructor(type) {
        this.type = type;
        this.loc = null; // TODO: For now avoid dealing with location information. Fix it later.
    }
}

class Program extends Node {
    constructor(body) {
        super('Program');
        this.body = body;
    }
}

class Statement extends Node {
    constructor(type) {
        super(type);
    }
}

class EmptyStatement extends Statement {
    constructor() {
        super('EmptyStatement');
    }
}

e.Program = Program;
e.EmptyStatement = EmptyStatement;
