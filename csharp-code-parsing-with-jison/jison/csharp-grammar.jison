/* description: Parses a C# class. */

/* lexical grammar */
%lex
%options flex

%{
var namespaces = [];
if (!('namespaces' in yy)) {
	yy.namespaces = namespaces;
}
%}

%%
\s+                   /* skip whitespace */
"using"				  return 'USING';
[_a-zA-Z]+[_a-zA-Z0-9.]*    return 'identifier';
";"					  return ';';
<<EOF>>               return 'EOF';
/lex

%start source_file

%% /* language grammar */

source_file
    : using_statements EOF
        {return yy.namespaces;}
    ;
using_statements
	: using_statements using_statement
	| using_statement
	;
using_statement
	: USING identifier ';'
		{yy.namespaces.push($2);}
	;

%%