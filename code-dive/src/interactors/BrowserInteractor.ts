import { Interactor } from './Interactor';

export class BrowserInteractor implements Interactor {
    alert(message: string): void {
        this.alert(message);
    }
    startCodeDiveAnalysis(): void {
        this.alert('code dive analysis requested');
    }
}