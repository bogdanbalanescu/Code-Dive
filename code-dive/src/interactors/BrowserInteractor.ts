import { Interactor } from './Interactor';
import { IType } from '../codeModel/Types/IType';

export class BrowserInteractor implements Interactor {
    alert(message: string): void {
        console.log(message);
    }
    loadConfiguration(): void {
        console.log('configuration load requested');
    }
    startCodeDiveAnalysis(): void {
        console.log('code dive analysis requested');
    }
    updateCode(typesToUpdate: IType[], path: string): void {
        console.log(`update code requested`);
    }
}