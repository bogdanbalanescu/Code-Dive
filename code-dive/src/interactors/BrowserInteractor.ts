import { Interactor } from './Interactor';

export class BrowserInteractor implements Interactor {
    alert(message: string): void {
        this.alert(message);
    }
    loadConfiguration(): void {
        this.alert('configuration load requested');
    }
    startCodeDiveAnalysis(): void {
        this.alert('code dive analysis requested');
    }
}