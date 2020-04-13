import { Statement } from "../Misc/Statement";

export class PropertyAccessor {
    type: string;
    body: Statement[];

    public constructor(type: string, body: Statement[]) {
        this.type = type;
        this.body = body;
    }
}
