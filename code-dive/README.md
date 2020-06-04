# Code Diagram, a Visual Programming tool for Textual Based Programming Languages (Proof of Concept)
Currently only covering a subset of C#, this tool is not ready for production use.

# Features
The following is a short list describing the features provided by Code Diagram:
* Visual representation of the code under the form of a UML-like diagram capable of delivering the full capabilities of source code as well.
* Real-time code synchronization between the source files and between the visual representation of the code.
* Links shown between statements, parameters, type members and types.
* Configurations available to show/hide certain link types and real-time updates to the diagram.
* Highlighted selections for the selected code components, their links and the components those links point to.
* Configurations available to increase the number of layers of dependency taken into consideration for the highlighted selections.
* Ability to add new types, type members, statements and parameters from the visual representation of the code.
* Ability to change the source files of types from the visual representation of the code.

# The covered subset of the C# language
The following is a short description of what Code Diagram understand of the C# language.

If something is not covered in this list, then it most probably is not supported - again, this tool is only a Proof of Concept at the present moment.

Note: for brevity, the dots ```...``` shall replace the content of the body of methods, constructors, etc. and shall not be taken as part of the syntax.
* **using** directives: preferably placed at the top of the file and applying to all types in the same source file.
  * Example: ```using System;```
* **namespace** declaration
  * Example: ```namespace CodeDiagramNamespace { ... }```
* **class**, **struct**, **interface** or **enum** declaration:
  * Example: ```class ClassExample { ... }```
  * Example: ```struct StructExample { ... }```
  * Example: ```interface InterfaceExample { ... }```
  * Example: ```enum EnumExample { ... }```
* **field** declaration:
  * Example: ```public int x = 42;```
* **property** declaration:
  * Example: ```protected sealed MagicNumber { get; set; }```
  * Example: ```public PropertyWithAccessModifiers { get { return backedField; } set { backedField = value; } }```
* **constructor** or **method** declaration:
  * Example: ```public ClassExample() { ... }```
  * Example: ```public int Add(int x, int y) { return x + y; }```
* **statements**
  * Variable declarations: ```int x = 42;```
  * Invocation: ```object.CallMethod()```
  * Assignment: ```x = 43;```
  * If and else: ```if (IsThisTrue()) { ... } else { ... }```
  * While: ```While (condition) { ... }```
  * Do: ```do { ... } while (Possible());```
  * For: ```for (x = 1; x < 2; x=x+1) { ... }```
  * Foreach: ```foreach(int x in numbers) { ... }```
  * Return: ```return expression;```
  * Throw: ```throw exception;```
  * Try, catch and finally: ``` try { ... } catch (Exception ex) { ... } finally { ... }```

