export interface Interactor {
    alert(message: string): void;
    loadConfiguration(): void;
    startCodeDiveAnalysis(): void;
};