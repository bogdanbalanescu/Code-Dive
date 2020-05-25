import { Interactor } from './Interactor';
import { IType } from '../codeModel/Types/IType';

export class BrowserInteractor implements Interactor {
    alert(message: string): void {
        alert(message);
    }
    loadConfiguration(): void {
        alert('configuration load requested');
    }
    startCodeDiveAnalysis(): void {
        alert('code dive analysis requested');
    }
    updateCode(typesToUpdate: IType[], path: string): void {
        // alert(`update code requested`);
    }
}