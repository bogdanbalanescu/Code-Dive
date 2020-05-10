export enum LinkType {
    // Inheritance
    Realization = "Realization",
    Generalization = "Generalization",
    // Used Types
    CallableReturnType = "CallableReturnType",
    ParameterType = "ParameterType",
    StatementUsesType = "StatementUsesType",
    // Used Fields, Properties, Constructors and Methods
    StatementUsesConstructorOrMethod = "StatementUsesConstructorOrMethod",
    StatementUsesFieldOrProperty = "StatementUsesFieldOrProperty",
    StatementUsesEnumValue = "StatementUsesEnumValue"
}