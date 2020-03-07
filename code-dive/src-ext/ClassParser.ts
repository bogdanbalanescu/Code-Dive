var Parser = require('jison').Parser;
var grammar = {
    "lex": {
        "rules": [
           ["\\s+", "/* skip whitespace */"],
           ["[a-f0-9]+", "return 'HEX';"]
        ]
    },

    "bnf": {
        "hex_strings" :[ "hex_strings HEX",
                         "HEX" ]
    }
};
var parser = new Parser(grammar);

export function parseClass(sourceCode: string) {
    return parser.parse(sourceCode);
}
