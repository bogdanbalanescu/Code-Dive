export interface Interactor {
    alert(message: string): void;
    startCodeDiveAnalysis(): void;
    // getWorkspaceName(callback: Function): string;
    // getSourceFilePaths(callback: Function): string[];
};