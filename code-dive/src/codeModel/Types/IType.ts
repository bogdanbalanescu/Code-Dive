export interface IType {
    /* Contains a the uri path to the source file path */
    sourceFilePath: string;

    namespaceDependecies: string[];
    namespace: string;
    name: string;
    modifiers: string[];
    parentInheritances: string[];

    isUpToDate: boolean;
}