import { IType } from "../codeModel/Types/IType";

export interface Interactor {
    alert(message: string): void;
    loadConfiguration(): void;
    startCodeDiveAnalysis(): void;
    updateCode(typesToUpdate: IType[], path: string): void;
};