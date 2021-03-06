/* description: Parses a C# class. */

/* lexical grammar */
%lex
%options flex

%{
/* 1. Namespace dependency */
var namespaceDependecies = []; // current conventions says it is RECOMMENDED to declare namespace dependencies at file level and to apply them to all classes in the source file.
if (!('addNamespace' in yy)) {
	yy.addNamespace = function addNamespace(name) {
		namespaceDependecies.push(name);
	};
}
/* 2. Namespace declaration */
var currentNamespaceDeclaration = ''; // current convention says it is RECOMMENDED to have only one namespace declaration per source file.
if (!('setCurrentNamespaceDeclaration' in yy)) {
	yy.setCurrentNamespaceDeclaration = function setCurrentNamespaceDeclaration(name) {
		currentNamespaceDeclaration = name;
	};
}
if (!('removeCurrentNamespaceDeclaration' in yy)) {
	yy.removeCurrentNamespaceDeclaration = function removeCurrentNamespaceDeclaration() {
		currentNamespaceDeclaration = '';
	};
}
/* Misc: modifiers */
var modifiers = [];
if (!('addModifier' in yy)) {
	yy.addModifier = function addModifier(name) {
		modifiers.push(name);
	};
}
/* 3. Class declaration */
var classes = [];
var structs = [];
var interfaces = [];
var enums = [];
var currentTypeName = '';
var currentTypeModifiers = [];
var parentInheritances = [];
var fields = [];
var properties = [];
var propertyAccessors = [];
var constructors = [];
var methods = [];
var currentInvocableMemberType = "";
var currentInvocableMemberName = "";
var currentInvocableMemberModifiers = [];
var currentInvocableMemberFixedParameters = [];
var declaredVariables = [];
var statements = [];
var currentEnumValues = [];
if (!('addParentInheritance' in yy)) {
	yy.addParentInheritance = function addParentInheritance(name) {
		parentInheritances.push(name);
	};
}
if (!('beginCurrentClassDeclaration' in yy)) {
	yy.beginCurrentClassDeclaration = function beginCurrentClassDeclaration(name) {
		currentTypeName = name;
		currentTypeModifiers = modifiers;
		// Cleanup modifiers
		modifiers = [];
	};
}
if (!('endCurrentClassDeclaration' in yy)) {
	yy.endCurrentClassDeclaration = function endCurrentClassDeclaration() {
		classes.push({
			namespaceDependecies : namespaceDependecies,
			namespace : currentNamespaceDeclaration,
			name : currentTypeName,
			modifiers : currentTypeModifiers,
			parentInheritances : parentInheritances,
			fields : fields,
			properties: properties,
			constructors: constructors,
			methods: methods
		});
		// Cleanup after class declaration
		currentTypeName = '';
		currentTypeModifiers = [];
		parentInheritances = [];
		fields = [];
		properties = [];
		constructors = [];
		methods = [];
	};
}
if (!('beginCurrentStructDeclaration' in yy)) {
	yy.beginCurrentStructDeclaration = function beginCurrentStructDeclaration(name) {
		currentTypeName = name;
		currentTypeModifiers = modifiers;
		// Cleanup modifiers
		modifiers = [];
	};
}
if (!('endCurrentStructDeclaration' in yy)) {
	yy.endCurrentStructDeclaration = function endCurrentStructDeclaration() {
		structs.push({
			namespaceDependecies : namespaceDependecies,
			namespace : currentNamespaceDeclaration,
			name : currentTypeName,
			modifiers : currentTypeModifiers,
			parentInheritances : parentInheritances,
			fields : fields,
			properties: properties,
			constructors: constructors,
			methods: methods
		});
		// Cleanup after struct declaration
		currentTypeName = '';
		currentTypeModifiers = [];
		parentInheritances = [];
		fields = [];
		properties = [];
		constructors = [];
		methods = [];
	};
}
if (!('beginCurrentInterfaceDeclaration' in yy)) {
	yy.beginCurrentInterfaceDeclaration = function beginCurrentInterfaceDeclaration(name) {
		currentTypeName = name;
		currentTypeModifiers = modifiers;
		// Cleanup modifiers
		modifiers = [];
	};
}
if (!('endCurrentInterfaceDeclaration' in yy)) {
	yy.endCurrentInterfaceDeclaration = function endCurrentInterfaceDeclaration() {
		interfaces.push({
			namespaceDependecies : namespaceDependecies,
			namespace : currentNamespaceDeclaration,
			name : currentTypeName,
			modifiers : currentTypeModifiers,
			parentInheritances : parentInheritances,
			properties: properties,
			methods: methods
		});
		// Cleanup after interface declaration
		currentTypeName = '';
		currentTypeModifiers = [];
		parentInheritances = [];
		properties = [];
		methods = [];
	}
}
if (!('beginCurrentEnumDeclaration' in yy)) {
	yy.beginCurrentEnumDeclaration = function beginCurrentEnumDeclaration(name) {
		currentTypeName = name;
		currentTypeModifiers = modifiers;
		// Cleanup modifiers
		modifiers = [];
	};
}
if (!('endCurrentEnumDeclaration' in yy)) {
	yy.endCurrentEnumDeclaration = function endCurrentEnumDeclaration() {
		enums.push({
			namespaceDependecies : namespaceDependecies,
			namespace : currentNamespaceDeclaration,
			name : currentTypeName,
			modifiers : currentTypeModifiers,
			parentInheritances : parentInheritances,
			values: currentEnumValues
		});
		// Cleanup after enum declaration
		currentTypeName = '';
		currentTypeModifiers = [];
		parentInheritances = [];
		currentEnumValues = [];
	}
}
/* 3.1 Field declaration */
if (!('addField' in yy)) {
	yy.addField = function addField(type, name) {
		fields.push({
			index: fields.length,
			type: type,
			name: name,
			modifiers : modifiers
		});
		// Cleanup modifiers
		modifiers = [];
	};
}
if (!('addAssignmentExpressionForPreviousField' in yy)) {
	yy.addAssignmentExpressionForPreviousField = function addAssignmentExpressionForPreviousField(assignmentStatement) {
		yy.addStatement(assignmentStatement);
		var lastField = fields.pop();
		lastField.assignmentStatement = statements.pop();
		fields.push(lastField);
	}
}
/* 3.2 Property declaration */
if (!('addPropertyAccessor' in yy)) {
	yy.addPropertyAccessor = function addPropertyAccessor(type) {
		propertyAccessors.push({
			index: propertyAccessors.length,
			name: type,
			declaredVariables: declaredVariables,
			body: statements.length > 0 ? statements : [] // functionality not yet supported
		});
		// Cleanup
		declaredVariables = [];
		statements = [];
	};
}
if (!('addProperty' in yy)) {
	yy.addProperty = function addProperty(type, name) {
		properties.push({
			index: properties.length,
			type: type,
			name: name,
			modifiers : currentInvocableMemberModifiers.concat(modifiers),
			parameters: currentInvocableMemberFixedParameters,
			accessors : propertyAccessors
		});
		// Cleanup after property
		modifiers = [];
		currentInvocableMemberModifiers = [];
		currentInvocableMemberFixedParameters = [];
		propertyAccessors = [];
	};
}
if (!('saveCurrentPropertyIndexerModifiers' in yy)) {
	yy.saveCurrentPropertyIndexerModifiers = function saveCurrentPropertyIndexerModifiers() {
		currentInvocableMemberModifiers = modifiers;
		// Cleanup
		modifiers = [];
	};
}
if (!('addAssignmentExpressionForPreviousProperty' in yy)) {
	yy.addAssignmentExpressionForPreviousProperty = function addAssignmentExpressionForPreviousProperty(assignmentStatement) {
		yy.addStatement(assignmentStatement);
		var lastProperty = properties.pop();
		lastProperty.assignmentStatement = statements.pop();
		properties.push(lastProperty);
	}
}
/* 3.3 Constructor declaration */
if (!('beginCurrentConstructorDeclaration' in yy)) {
	yy.beginCurrentConstructorDeclaration = function beginCurrentConstructorDeclaration(name) {
		currentInvocableMemberName = name;
		currentInvocableMemberModifiers = modifiers;
		// Cleanup modifiers
		modifiers = [];
	}
}
if (!('addFixedParameter' in yy)) {
	yy.addFixedParameter = function addFixedParameter(type, name, modifier = "") {
		currentInvocableMemberFixedParameters.push({
			index: currentInvocableMemberFixedParameters.length,
			type: type,
			name: name,
			modifier: modifier,
			assignmentStatement: undefined
		});
		// Cleanup modifiers
		modifiers = [];
	}
}
if (!('addAssignmentExpressionForPreviousFixedParameter' in yy)) {
	yy.addAssignmentExpressionForPreviousFixedParameter = function addAssignmentExpressionForPreviousFixedParameter(assignmentStatement) {
		yy.addStatement(assignmentStatement);
		var lastAddedFixedParameter = currentInvocableMemberFixedParameters.pop();
		lastAddedFixedParameter.assignmentStatement = statements.pop();
		currentInvocableMemberFixedParameters.push(lastAddedFixedParameter);
	}
}
if (!('endCurrentConstructorDeclaration' in yy)) {
	yy.endCurrentConstructorDeclaration = function endCurrentConstructorDeclaration() {
		constructors.push({
			index: constructors.length,
			name: currentInvocableMemberName,
			modifiers: currentInvocableMemberModifiers,
			parameters: currentInvocableMemberFixedParameters,
			declaredVariables: declaredVariables,
			statements: statements
		});
		// Cleanup after constructor declaration
		currentInvocableMemberName = "";
		currentInvocableMemberModifiers = [];
		currentInvocableMemberFixedParameters = [];
		declaredVariables = [];
		statements = [];
	}
}
/* 3.4 Method declaration */
if (!('beginCurrentMethodDeclaration' in yy)) {
	yy.beginCurrentMethodDeclaration = function beginCurrentMethodDeclaration(type, name) {
		currentInvocableMemberType = type;
		currentInvocableMemberName = name;
		currentInvocableMemberModifiers = modifiers;
		// Cleanup modifiers
		modifiers = [];
	}
}
if (!('endCurrentMethodDeclaration' in yy)) {
	yy.endCurrentMethodDeclaration = function endCurrentMethodDeclaration() {
		methods.push({
			index: methods.length,
			type: currentInvocableMemberType,
			name: currentInvocableMemberName,
			modifiers: currentInvocableMemberModifiers,
			parameters: currentInvocableMemberFixedParameters,
			declaredVariables: declaredVariables,
			statements: statements
		});
		// Cleanup after method declaration
		currentInvocableMemberType = "";
		currentInvocableMemberName = "";
		currentInvocableMemberModifiers = [];
		currentInvocableMemberFixedParameters = [];
		declaredVariables = [];
		statements = [];
	}
}
/* Statements */
var currentStatementBlockCount = 0;
var currentStatementUsedFieldsAndProperties = [];
var currentStatementUsedConstructors = [];
var currentStatementUsedMethods = [];
var currentStatementUsedTypes = [];
if (!('addVariableDeclaration' in yy)) {
	yy.addVariableDeclaration = function addVariableDeclaration(type, name) {
		declaredVariables.push({
			type: type,
			name: name
		});
		currentStatementUsedTypes.push(type);
	};
}
if (!('addStatement' in yy)) {
	yy.addStatement = function addStatement(text) {
		statements.push({
			index: statements.length,
			statementText: text,
			blockCount: currentStatementBlockCount,
			usedFieldsAndProperties: currentStatementUsedFieldsAndProperties,
			usedConstructors: currentStatementUsedConstructors,
			usedMethods: currentStatementUsedMethods,
			usedTypes: currentStatementUsedTypes
		});
		// Cleanup
		currentStatementUsedFieldsAndProperties = [];
		currentStatementUsedConstructors = [];
		currentStatementUsedMethods = [];
		currentStatementUsedTypes = [];
	};
}
if (!('addOpenCurlyBracketAsStatement' in yy)) {
	yy.addOpenCurlyBracketAsStatement = function addOpenCurlyBracketAsStatement() {
		yy.addStatement('{');
		currentStatementBlockCount += 1;
	}
}
if (!('addClosedCurlyBracketAsStatement' in yy)) {
	yy.addClosedCurlyBracketAsStatement = function addClosedCurlyBracketAsStatement() {
		currentStatementBlockCount -= 1;
		yy.addStatement('}');
	}
}
if (!('addUsedMethod' in yy)) {
	yy.addUsedMethod = function addUsedMethod(methodName) {
		currentStatementUsedMethods.push(methodName);
	};
}
if (!('addUsedFieldOrProperty' in yy)) {
	yy.addUsedFieldOrProperty = function addUsedFieldOrProperty(fieldOrPropertyName) {
		currentStatementUsedFieldsAndProperties.push(fieldOrPropertyName);
	};
}
if (!('addUsedConstructor' in yy)) {
	yy.addUsedConstructor = function addUsedConstructor(constructorName) {
		currentStatementUsedConstructors.push(constructorName);
	};
}
if (!('addEnumValue' in yy)) {
	yy.addEnumValue = function addEnumValue(name) {
		currentEnumValues.push({
			index: currentEnumValues.length,
			name: name
		});
	}
}
/* Parse complete output */
if (!('getParsedSourceFile' in yy)) {
	yy.getParsedSourceFile = function getParsedSourceFile() {
		return {
			classes : classes,
			structs : structs,
			interfaces : interfaces,
			enums : enums
		};
	};
}
%}

%%
\s+                   	/* skip whitespace */
(\/\*(.|(\r\n|\r|\n))*\*\/) /* skip multiline comments */
(\/\/(.)*(\r\n|\r|\n)?) /* skip one line comments */
(\'(\\)?.\') return 'CHARACTER_LITERAL';
(\".*(\\.)*.*\") return 'STRING_LITERAL';
([0-9]+(UL|Ul|uL|ul|LU|Lu|lU|lu|U|u|L|l)?) return 'DECIMAL_INTEGER';
((0x|0X)[0-9A-Fa-f]+(UL|Ul|uL|ul|LU|Lu|lU|lu|U|u|L|l)?) return 'HEXADECIMAL_INTEGER';
(([0-9]+)?(\.)?[0-9]+((e|E)(\+|\-)?[0-9]+)?(F|f|D|d|M|m)?) return 'REAL_NUMBER';
"using"				  	return 'USING';
"namespace"				return 'NAMESPACE';
"class"					return 'CLASS';
"new"					return 'NEW';
"public"				return 'PUBLIC';
"protected"				return 'PROTECTED';
"internal"				return 'INTERNAL';
"private"				return 'PRIVATE';
"static"				return 'STATIC';
'virtual'				return 'VIRTUAL';
'sealed'				return 'SEALED';
'override'				return 'OVERRIDE';
'abstract'				return 'ABSTRACT';
'extern'				return 'EXTERN';
"readonly"				return 'READONLY';
"volatile"				return 'VOLATILE';
"get"					return 'GET';
"set"					return 'SET';
"ref"					return 'REF';
"out"					return 'OUT';
"this"					return 'THIS';
"base"					return 'BASE';
"true"					return 'TRUE';
"false" 				return 'FALSE';
"null"					return 'NULL';
"is"					return 'IS';
"as"					return 'AS';
"if"					return 'IF';
"else"					return 'ELSE';
"while"					return 'WHILE';
"do"					return 'DO';
"for"					return 'FOR';
"foreach"				return 'FOREACH';
"in"					return 'IN';
"try"					return 'TRY';
"catch"					return 'CATCH';
"finally"				return 'FINALLY';
"throw"					return 'THROW';
"return"				return 'RETURN';
"struct"				return 'STRUCT';
"interface"				return 'INTERFACE';
"enum"					return 'ENUM';
((\+|\-|\*|\/|\%|\&|\||\^|\<\<|\>\>)?\=) return 'ASSIGNMENT_OPERATOR';
(\<\<|\>\>)				return 'SHIFT_OPERATOR';
(\<\=|\>\=|\<|\>)		return 'COMPARISON_OPERATOR';
(\!\=|\=\=)				return 'EQUALITY_OPERATOR'
(bool|byte|char|decimal|double|float|int|long|object|sbyte|short|string|uint|ulong|ushort) return 'IDENTIFIER';
"void" 					return 'IDENTIFIER';
[_a-zA-Z]+[_a-zA-Z0-9]*	return 'IDENTIFIER';
<<EOF>>               	return 'EOF';
.						return yytext; /*returns the matched text*/
/lex

%start source_file

%% /* language grammar */
/* 0. Source file */
source_file
	: EOF /* in case the file is empty */
        {return yy.getParsedSourceFile();}
	| source_file_parts EOF
        {return yy.getParsedSourceFile();}
    ;
source_file_parts
	: source_file_parts source_file_part
	| source_file_part
	;
source_file_part
	: using_statement
	| namespace_declaration
	| class_declaration
	;
/* 1. Namespace dependency */
using_statement
	: USING qualified_identifier semicolon
		{yy.addNamespace($2);}
	;
/* 2. Namespace declaration */
namespace_declaration
	: NAMESPACE qualified_identifier _subroutine_add_current_namespace '{' namespace_body '}'
		{yy.removeCurrentNamespaceDeclaration();}
	;
_subroutine_add_current_namespace
	: /* empty */
		{yy.setCurrentNamespaceDeclaration($1);}
	;
namespace_body
	: /* empty */
	| namespace_members
	;
namespace_members
	: namespace_members namespace_member
	| namespace_member
	;
namespace_member
	: class_declaration
	| struct_declaration
	| interface_declaration
	| enum_declaration
	/* TODO: consider adding delegates */
	;
/* Parents and inheritances */
parents_and_inheritances
	: /* empty */
	| ':' parents_list
	;
parents_list
	: parents_list ',' parent
	| parent
	;
parent
	: IDENTIFIER
		{yy.addParentInheritance($1);}
	;
/* 3. Class declaration */
class_declaration
	: modifiers CLASS IDENTIFIER _subroutine_add_current_class parents_and_inheritances '{' class_body '}'
		{yy.endCurrentClassDeclaration();}
	| CLASS IDENTIFIER _subroutine_add_current_class parents_and_inheritances '{' class_body '}'
		{yy.endCurrentClassDeclaration();}
	;
_subroutine_add_current_class
	: /* empty */
		{yy.beginCurrentClassDeclaration($1);}
	;
class_body
	: /* empty */
	| class_members
	;
class_members
	: class_members class_member
	| class_member
	;
class_member
	: field_declaration
	| property_declaration
	| constructor_declaration
	| method_declaration
	;
/* 4. Struct declaration */
struct_declaration
	: modifiers STRUCT IDENTIFIER _subroutine_add_current_struct parents_and_inheritances '{' struct_body '}'
		{yy.endCurrentStructDeclaration();}
	| STRUCT IDENTIFIER _subroutine_add_current_struct parents_and_inheritances '{' struct_body '}'
		{yy.endCurrentStructDeclaration();}
	;
_subroutine_add_current_struct
	: /* empty */
		{yy.beginCurrentStructDeclaration($1);}
	;
struct_body
	: /* empty */
	| struct_members
	;
struct_members
	: struct_members struct_member
	| struct_member
	;
struct_member
	: field_declaration
	| property_declaration
	| constructor_declaration
	| method_declaration
	;
/* 5. Interface declaration */
interface_declaration
	: modifiers INTERFACE IDENTIFIER _subroutine_add_current_interface parents_and_inheritances '{' interface_body '}'
		{yy.endCurrentInterfaceDeclaration();}
	| INTERFACE IDENTIFIER _subroutine_add_current_interface parents_and_inheritances '{' interface_body '}'
		{yy.endCurrentInterfaceDeclaration();}
	;
_subroutine_add_current_interface
	: /* empty */
		{yy.beginCurrentInterfaceDeclaration($1);}
	;
interface_body
	: /* empty */
	| interface_members
	;
interface_members
	: interface_members interface_member
	| interface_member
	;
interface_member
	: property_declaration
	| method_header semicolon
		{yy.endCurrentMethodDeclaration();}
	;
/* 6. Enum declaration */
enum_declaration
	: modifiers ENUM IDENTIFIER _subroutine_add_current_enum parents_and_inheritances '{' enum_body '}'
		{yy.endCurrentEnumDeclaration($1);}
	| ENUM IDENTIFIER _subroutine_add_current_enum parents_and_inheritances '{' enum_body '}'
		{yy.endCurrentEnumDeclaration($1);}
	;
_subroutine_add_current_enum
	: /* empty */
		{yy.beginCurrentEnumDeclaration($1);}
	;
enum_body
	: /* empty */
    | enum_member_declarations
    ;
enum_member_declarations
	: enum_member_declarations ',' enum_member_declaration
	| enum_member_declaration
	;
enum_member_declaration
	: IDENTIFIER
		{yy.addEnumValue($1);}
	/*TODO: consider enum value initialization*/
	;
/*
 *
 *
 *
 *
 *
 * The following is consisted of type members: fields, properties, constructors and methods.
 * 3.1 Field declaration
 * 3.2 Property declaration 
 * 3.3 Constructor declaration 
 * 3.4 Method declaration 
*/
/* 3.1 Field declaration */
field_declaration
	: field_declaration_default semicolon
	| field_declaration_with_initialization semicolon
	;
field_declaration_with_initialization
	: field_declaration_default assignment_expression
		{yy.addAssignmentExpressionForPreviousField($2);}
	;
field_declaration_default
	: modifiers IDENTIFIER variable_declaration
		{yy.addField($2, $3);}
	| modifiers array_type variable_declaration
		{yy.addField($2, $3);}
	| IDENTIFIER variable_declaration
		{yy.addField($1, $2);}
	| array_type variable_declaration
		{yy.addField($1, $2);}
	;
variable_declaration
	: IDENTIFIER
	;
/* 3.2 Property declaration */
property_declaration
	: property_declaration_default
	| property_declaration_with_initialization
	;
property_declaration_with_initialization
	: property_declaration_default assignment_expression semicolon
		{yy.addAssignmentExpressionForPreviousProperty($2 + $3);}
	;
property_declaration_default
	: modifiers IDENTIFIER IDENTIFIER property_body
		{yy.addProperty($2, $3);}
	| modifiers array_type IDENTIFIER property_body
		{yy.addProperty($2, $3);}
	| modifiers IDENTIFIER THIS _subroutine_save_current_property_indexer_modifiers '[' formal_parameter_list ']' property_body
		{yy.addProperty($2, $3);}
	| IDENTIFIER IDENTIFIER property_body
		{yy.addProperty($1, $2);}
	| array_type IDENTIFIER property_body
		{yy.addProperty($1, $2);}
	| IDENTIFIER THIS '[' formal_parameter_list ']' property_body
		{yy.addProperty($1, $2);}
	;
_subroutine_save_current_property_indexer_modifiers
	: /* empty */
		{yy.saveCurrentPropertyIndexerModifiers($1);}
	;
property_body
	: '{' accessor_declarations '}'
	;
accessor_declarations
	: get_accessor_declaration set_accessor_declaration
	| set_accessor_declaration get_accessor_declaration
	| get_accessor_declaration
	| set_accessor_declaration
	;
get_accessor_declaration
	: modifier GET accessor_body
		{yy.addPropertyAccessor($2);}
	| GET accessor_body
		{yy.addPropertyAccessor($1);}
	;
set_accessor_declaration
	: modifier SET accessor_body
		{yy.addPropertyAccessor($2);}
	| SET accessor_body
		{yy.addPropertyAccessor($1);}
	;
accessor_body
	: semicolon
	| block
	;
/* 3.3 Constructor declaration */
constructor_declaration
	: modifiers constructor_declarator constructor_body
		{yy.endCurrentConstructorDeclaration();}
	| constructor_declarator constructor_body
		{yy.endCurrentConstructorDeclaration();}
	;
/* 3.3.1 Constructor declarator*/
constructor_declarator
	: IDENTIFIER _subroutine_add_current_constructor '(' formal_parameter_list ')'
	| IDENTIFIER _subroutine_add_current_constructor '(' ')'
	/*TODO: see about constructor initializer: base(...), this(...) */
	;
_subroutine_add_current_constructor
	: /* empty */
		{yy.beginCurrentConstructorDeclaration($1);}
	;
/* 3.3.2 Constructor body*/
constructor_body
	: block
	| semicolon
	;
/* 3.4 Method declaration */
method_declaration
	: modifiers method_header method_body
		{yy.endCurrentMethodDeclaration();}
	| method_header method_body
		{yy.endCurrentMethodDeclaration();}
	;
/* 3.4.1 Method header */
method_header
	: IDENTIFIER IDENTIFIER _subroutine_add_current_method '(' formal_parameter_list ')'
	| IDENTIFIER IDENTIFIER _subroutine_add_current_method '(' ')'
	;
_subroutine_add_current_method
	: /* empty */
		{yy.beginCurrentMethodDeclaration($0, $1);}
	;
/* 3.4.2 Method body */
method_body
	: block
	| semicolon
	/*Consider expression body: => expression ;*/
	;
/*3.3.2.0 Block */
block
	: '{' _subroutine_add_open_curly_brackets_as_statement statement_list '}' _subroutine_add_closed_curly_brackets_as_statement
	| '{' _subroutine_add_open_curly_brackets_as_statement '}' _subroutine_add_closed_curly_brackets_as_statement
	;
_subroutine_add_open_curly_brackets_as_statement
	: /* empty */
		{yy.addOpenCurlyBracketAsStatement();}
	;
_subroutine_add_closed_curly_brackets_as_statement
	: /* empty */
		{yy.addClosedCurlyBracketAsStatement();}
	;
statement_list
	: statement_list statement
	| statement
	;
statement
	: variable_declaration_statement
		{yy.addStatement($$);}
	| embedded_statement
		{yy.addStatement($$);}
	| return_statement
		{yy.addStatement($$);}
	| selection_statement
	| iteration_statement
	| try_statement
	;
/* 3.3.2.1 Variable declaration statement */
variable_declaration_statement
	: IDENTIFIER IDENTIFIER semicolon
		{$$ = $1 + ' ' + $2 + $3;
		 yy.addVariableDeclaration($1, $2)}
	| array_type IDENTIFIER semicolon
		{$$ = $1 + ' ' + $2 + $3;
		 yy.addVariableDeclaration($1, $2)}
	| IDENTIFIER IDENTIFIER assignment_expression semicolon
		{$$ = $1 + ' ' + $2 + ' ' + $3 + $4;
		 yy.addVariableDeclaration($1, $2)}
	| array_type IDENTIFIER assignment_expression semicolon
		{$$ = $1 + ' ' + $2 + ' ' + $3 + $4;
		 yy.addVariableDeclaration($1, $2)}
	;
/* 3.3.2.2 Embedded statements */
embedded_statement
	: empty_statement
	| invocation_statement
	| assignment_statement
	| throw_statement
	;
/* 3.3.2.2.1 Empty statement */
empty_statement
	: semicolon
	;
/* 3.3.2.2.2 Invocation statement */
invocation_statement
	: invocation_expression semicolon
		{$$ = $1 + $2;}
	;
invocation_expression
	: expression_literal '(' argument_list ')'
		{$$ = $1 + $2 + $3 + $4;
		 yy.addUsedMethod($1);}
	| expression_literal '(' ')'
		{$$ = $1 + $2 + $3;
		 yy.addUsedMethod($1);}
	;
expression_literal
    : IDENTIFIER
    | member_access
    | this_access
    | base_access
    ;
/* 3.3.2.2.3 Assignment statement (expression, invocation expression, object creation expression) */
assignment_statement
	: unary_expression assignment_expression semicolon
		{$$ = $1 + ' ' + $2 + $3;}
	;
assignment_expression
    : assignment_operator expression
		{$$ = $1 + ' ' + $2;}
    | assignment_operator object_creation_expression
		{$$ = $1 + ' ' + $2;}
	| assignment_operator array_creation_expression
		{$$ = $1 + ' ' + $2;}
	;
object_creation_expression
    : NEW IDENTIFIER '(' argument_list ')'
		{$$ = $1 + ' ' + $2 + $3 + $4 + $5;
		 yy.addUsedConstructor($2);}
    | NEW IDENTIFIER '(' ')'
		{$$ = $1 + ' ' + $2 + $3 + $4;
		 yy.addUsedConstructor($2);}
	;
array_creation_expression
    : NEW IDENTIFIER '[' expression_list ']'
		{$$ = $1 + ' ' + $2 + $3 + $4 + $5;
		 yy.addUsedConstructor($2);}
    ;
/* 3.3.2.2.4 Throw statement */
throw_statement
	: THROW semicolon
		{$$ = $1 + $2;}
	| THROW IDENTIFIER semicolon
		{$$ = $1 + ' ' + $2 + $3;
		 yy.addUsedFieldOrProperty($2);}
	| THROW object_creation_expression semicolon
		{$$ = $1 + ' ' + $2 + $3;}
	;
/* 3.3.2.2.5 Return statement */
return_statement
	: RETURN expression semicolon
		{$$ = $1 + ' ' + $2 + $3;}
	| RETURN object_creation_expression semicolon
		{$$ = $1 + ' ' + $2 + $3;}
	| RETURN array_creation_expression semicolon
		{$$ = $1 + ' ' + $2 + $3;}
	;
/* 3.3.2.3 Selection statement */
selection_statement
    : if_statement
    /*| switch_statement*/ /*Cannot support this right now*/
    ;
if_statement
    : IF '(' boolean_expression ')' _subroutine_add_if_statement block
    | IF '(' boolean_expression ')' _subroutine_add_if_statement block ELSE _subroutine_add_else_statement block
    ;
_subroutine_add_if_statement
	: /* empty */
		{yy.addStatement($-2 + $-1 + $0 + $1);}
	;
__subroutine_add_else_statement
	: /* empty */
		{yy.addStatement($1);}
	;
boolean_expression
	: expression
	;
/* 3.3.2.4 Iteration statement */
iteration_statement
    : while_statement
    | do_statement
    | for_statement
    | foreach_statement
    ;
while_statement
    : WHILE '(' boolean_expression ')' _subroutine_add_while_statement block
    ;
_subroutine_add_while_statement
	: /* empty */
		{yy.addStatement($-2 + $-1 + $0 + $1);}
	;
do_statement
    : DO _subroutine_add_do_statement block WHILE '(' boolean_expression ')' semicolon
		{yy.addStatement($4 + $5 + $6 + $7 + $8);}
    ;
_subroutine_add_do_statement
	: /* empty */
		{yy.addStatement($1);}
	;
for_statement
	: FOR '(' for_initializer semicolon for_condition semicolon for_iterator ')' _subroutine_add_for_statement block
	;
_subroutine_add_for_statement
	: /* empty */
		{yy.addStatement($-6 + ' ' + $-5 + $-4 + $-3 + ' ' + $-2 + $-1 + ' ' + $0 + $1);}
	;
for_initializer
	: unary_expression assignment_expression
		{$$ = $1 + ' ' + $2;}
	| IDENTIFIER unary_expression assignment_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;
		 yy.addVariableDeclaration($1, $2);}
	;
for_condition
	: boolean_expression
	;
for_iterator
	: unary_expression assignment_expression
		{$$ = $1 + ' ' + $2;}
	;
foreach_statement
    : FOREACH '(' IDENTIFIER IDENTIFIER IN expression ')' _subroutine_add_foreach_statement block
    ;
_subroutine_add_foreach_statement
	: /* empty */
		{yy.addStatement($-5 + ' ' + $-4 + $-3 + ' ' + $-2 + ' ' + $-1 + ' ' + $0 + $1);
		 yy.addVariableDeclaration($-3, $-2);}
	;
/* 3.3.2.5 Try statement (try, catch, finally) */
try_statement
    : try_clause catch_clauses finally_clause
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    | try_clause catch_clauses
		{$$ = $1 + ' ' + $2;}
    ;
try_clause
	: TRY _subroutine_add_try_statement block
	;
_subroutine_add_try_statement
	: /* empty */
		{yy.addStatement($1);}
	;
catch_clauses
	: catch_clauses catch_clause
		{$$ = $1 + ' ' + $2;}
	| catch_clause
	;
catch_clause
    : CATCH '(' IDENTIFIER IDENTIFIER ')' _subroutine_add_catch_statement block
    ;
_subroutine_add_catch_statement
	: /* empty */
		{yy.addStatement($-3 + ' ' + $-2 + $-1 + ' ' + $0 + $1);
		 yy.addVariableDeclaration($-1, $0);}
	;
finally_clause
    : FINALLY _subroutine_add_finally_statement block
    ;
_subroutine_add_finally_statement
	: /* empty */
		{yy.addStatement($1);}
	;
/*
 *
 *
 *
 *
 *
 * The following is consisted of misc. items that help with other constructions:
 *
 * Misc. I: qualified identifier, modifiers, semicolon.
 * Misc. II: formal parameter list (for defining methods and constructors)
 * Misc. III: arguments list (for calling methods and constructors)
 * Misc. IV: expression list, expression
 * Misc. V: literals
*/
/* Misc. I: qualified identifier, modifiers, semicolon. */
qualified_identifier
	: qualified_identifier '.' IDENTIFIER 
		{$$ = $1 + $2 + $3;}
	| IDENTIFIER
	;
array_type
	: IDENTIFIER '[' ']'
		{$$ = $1 + $2 + $3;}
	;
modifiers
	: modifiers modifier
		{yy.addModifier($2)}
	| modifier
		{yy.addModifier($1)}
	;
modifier
	/* modifiers for classes, fields, methods, constructors and properties */
	: NEW | PUBLIC | PROTECTED | INTERNAL | PRIVATE | STATIC | VIRTUAL | SEALED | OVERRIDE | ABSTRACT | EXTERN | READONLY | VOLATILE
	/* modifiers for parameters */
	| REF | OUT | THIS
	;
semicolon
	: ";"
	;
/* Misc. II: formal parameter list (for defining methods and constructors) */
formal_parameter_list
	: parameters
	/*TODO: see about params array*/
	;
parameters
	: parameters ',' parameter
	| parameter
	;
parameter
	: fixed_parameter
	| optional_parameter
	;
optional_parameter
	: fixed_parameter assignment_expression
		{yy.addAssignmentExpressionForPreviousFixedParameter($2);}
	;
fixed_parameter
	: modifier IDENTIFIER IDENTIFIER
		{yy.addFixedParameter($2, $3, $1);}
	| modifier array_type IDENTIFIER
		{yy.addFixedParameter($2, $3, $1);}
	| IDENTIFIER IDENTIFIER
		{yy.addFixedParameter($1, $2);}
	| array_type IDENTIFIER
		{yy.addFixedParameter($1, $2);}
	/*TODO: see about default argument = expression*/
	;
/* Misc. III: arguments list (for calling methods and constructors) */
argument_list
	: arguments
	;
arguments
	: arguments ',' argument
		{$$ = $1 + $2 + ' ' + $3;}
	| argument
	;
argument
	: IDENTIFIER ':' argument_value
		{$$ = $1 + $2 + ' ' + $3;}
	| argument_value
	;
argument_value
	: expression
	| REF expression
		{$$ = $1 + ' ' + $2}
	| OUT expression
		{$$ = $1 + ' ' + $2}
	;
/* Misc. IV: expression list, expression */
expression_list
	: expression_list ',' expression
		{$$ = $1 + $2 + ' ' + $3;}
    | expression
    ;
expression
    : non_assignment_expression
    | assignment_expression
    ;
non_assignment_expression
    : conditional_expression
    /*| lambda_expression*/
    /*| query_expression*/
    ;
conditional_expression
    : null_coalescing_expression
    | null_coalescing_expression '?' expression ':' expression
		{$$ = $1 + $2 + ' ' + $3 + $4 + ' ' + $5;}
    ;
null_coalescing_expression
    : conditional_or_expression
    | conditional_or_expression '??' null_coalescing_expression
		{$$ = $1 + $2 + ' ' + $3;}
    ;
conditional_or_expression
    : conditional_and_expression
    | conditional_or_expression '||' conditional_and_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
conditional_and_expression
    : inclusive_or_expression
    | conditional_and_expression '&&' inclusive_or_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
inclusive_or_expression
    : exclusive_or_expression
    | inclusive_or_expression '|' exclusive_or_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
exclusive_or_expression
    : and_expression
    | exclusive_or_expression '^' and_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
and_expression
    : equality_expression
    | and_expression '&' equality_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
equality_expression
    : relational_expression
    | equality_expression EQUALITY_OPERATOR relational_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
relational_expression
    : shift_expression
    | relational_expression COMPARISON_OPERATOR shift_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    | relational_expression IS IDENTIFIER
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    | relational_expression AS IDENTIFIER
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
shift_expression
    : additive_expression
    | shift_expression SHIFT_OPERATOR additive_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
additive_expression
    : multiplicative_expression
    | additive_expression '+' multiplicative_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    | additive_expression '-' multiplicative_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
multiplicative_expression
    : unary_expression
    | multiplicative_expression '*' unary_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    | multiplicative_expression '/' unary_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    | multiplicative_expression '%' unary_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
unary_expression
    : expression_literal
		{yy.addUsedFieldOrProperty($1);}
	| literal
	| element_access
	| invocation_expression
    /*| null_conditional_expression*/
    | '+' unary_expression
		{$$ = $1 + $2;}
    | '-' unary_expression
		{$$ = $1 + $2;}
    | '!' unary_expression
		{$$ = $1 + $2;}
    | '~' unary_expression
		{$$ = $1 + $2;}
    /*| pre_increment_expression*/
    /*| pre_decrement_expression*/
    /*| cast_expression*/
    /*| await_expression*/
    /*| unary_expression_unsafe*/
    ;
assignment_operator
    : ASSIGNMENT_OPERATOR
    ;
/* Misc. V: literals */
literal
    : boolean_literal
    | integer_literal
    | real_literal
    | character_literal
    | string_literal
    | null_literal
    ;
boolean_literal
    : TRUE
    | FALSE
    ;
integer_literal
    : decimal_integer_literal
    | hexadecimal_integer_literal
    ;
decimal_integer_literal
	: DECIMAL_INTEGER
    ;
hexadecimal_integer_literal
	: HEXADECIMAL_INTEGER
	;
real_literal
    : REAL_NUMBER
	;
character_literal
    : CHARACTER_LITERAL
    ;
string_literal
	: STRING_LITERAL
	;
null_literal
	: NULL
	;
/* Misc. V: primary expressions - parenthesized expression */
parenthesized_expression
    : '(' expression ')'
		{$$ = $1 + $2 + $3;}
    ;
/* Misc. V: primary expressions - member access, element access, this access, base access */
member_access
    : IDENTIFIER '.' IDENTIFIER
		{$$ = $1 + $2 + $3;}
	| literal '.' IDENTIFIER
		{$$ = $1 + $2 + $3;}
    /*| primary_expression '.' IDENTIFIER type_argument_list?*/
    /*| predefined_type '.' IDENTIFIER*/ /*covered by primary_expression fow now*/
    /*| predefined_type '.' identifier type_argument_list?*/
    /*| qualified_alias_member '.' IDENTIFIER*/
    ;
element_access
    : IDENTIFIER '[' expression_list ']'
		{$$ = $1 + $2 + $3 + $4;
		 yy.addUsedFieldOrProperty($1);}
	| member_access '[' expression_list ']'
		{$$ = $1 + $2 + $3 + $4;
		 yy.addUsedFieldOrProperty($1);}
    ;
this_access
	: THIS
	| THIS '.' IDENTIFIER
		{$$ = $1 + $2 + $3;}
    ;
base_access
	: BASE
    | BASE '.' IDENTIFIER
		{$$ = $1 + $2 + $3;}
    ;
%%