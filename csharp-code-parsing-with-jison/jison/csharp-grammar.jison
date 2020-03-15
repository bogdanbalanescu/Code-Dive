/* description: Parses a C# class. */

/* lexical grammar */
%lex
%options flex

%{
var namespaceDependecies = []; // current conventions says that these dependencies are declared at file level and apply to all classes in the source file.
if (!('addNamespace' in yy)) {
	yy.addNamespace = function addNamespace(name) {
		namespaceDependecies.push({
			name: name
		});
	};
}
var namespaceDeclarations = []; // current convention says it is RECOMMENDED to have only one namespace declaration per source file.
if (!('addNamespaceDeclaration' in yy)) {
	yy.addNamespaceDeclaration = function addNamespaceDeclaration(name, body) {
		namespaceDeclarations.push({
			name: name,
			body: body
		});
	};
}
if (!('getParsedSourceFile' in yy)) {
	yy.getParsedSourceFile = function getParsedSourceFile() {
		return {
			namespaceDependecies: namespaceDependecies,
			namespaceDeclarations: namespaceDeclarations
		};
	};
}
%}

%%
\s+                   	/* skip whitespace */
"using"				  	return 'USING';
"namespace"				return 'NAMESPACE';
"class"					return 'CLASS';
"new"					return 'NEW';
"public"				return 'PUBLIC';
"protected"				return 'PROTECTED';
"internal"				return 'INTERNAL';
"private"				return 'PRIVATE';
"static"				return 'STATIC';
"readonly"				return 'READONLY';
"volatile"				return 'VOLATILE';
[_a-zA-Z]+[_a-zA-Z0-9]*	return 'IDENTIFIER';
<<EOF>>               	return 'EOF';
.						return yytext; /*returns the matched text*/
/lex

%start source_file

%% /* language grammar */
/* 0. Source file */
source_file
	: source_file_parts EOF
        {return yy.getParsedSourceFile();}
    ;
source_file_parts
	: source_file_parts source_file_part
	| source_file_part
	;
source_file_part
	: using_statement
	| namespace_declaration
	;
/* 1. Namespace dependency */
using_statement
	: USING qualified_identifier ';'
		{yy.addNamespace($2);}
	;
/* 2. Namespace declaration */
namespace_declaration
	: NAMESPACE qualified_identifier '{' namespace_body '}'
		{yy.addNamespaceDeclaration($2, $4);}
	;
namespace_body
	: /* It may be empty */
	| namespace_members
	;
namespace_members
	: namespace_members namespace_member
	| namespace_member
	;
namespace_member
	: class_declaration
	/* TODO: add interface, struct, enum, delegate */
	;
/* 3. Class declaration */
class_declaration
	: CLASS IDENTIFIER '{' class_body '}'
		{$$ = $4}
	;
class_body
	: /* It may be empty */
	| class_members
	;
class_members
	: class_members class_member
	| class_member
	;
class_member
	: field_declaration
	/* TODO: add method, property and constructor members (+ others when time is right) */
	;
field_declaration
	: field_modifiers IDENTIFIER variable_declarations semicolon
	| IDENTIFIER variable_declarations semicolon
	;
field_modifiers
	: field_modifiers field_modifier
	| field_modifier
	;
field_modifier
	: NEW | PUBLIC | PROTECTED | INTERNAL | PRIVATE | STATIC | READONLY | VOLATILE
	;
variable_declarations
	: variable_declarations ',' variable_declaration
	| variable_declaration
	;
variable_declaration
	: IDENTIFIER
	;


qualified_identifier
	: qualified_identifier '.' IDENTIFIER 
		{$$ = $1 + $2 + $3;}
	| IDENTIFIER
	;
/* Misc */
semicolon
	: ";"
	;
%%