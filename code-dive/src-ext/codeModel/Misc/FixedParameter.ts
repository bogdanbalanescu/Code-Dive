import { Statement } from "./Statement";

export class FixedParameter {
    index: number;
    type: string;
    name: string;
    modifier: string;
    assignmentStatement: Statement | undefined;

    public constructor(otherFixedParameter: FixedParameter) {
        this.index = otherFixedParameter.index;
        this.type = otherFixedParameter.type;
        this.name = otherFixedParameter.name;
        this.modifier = otherFixedParameter.modifier;
        this.assignmentStatement = otherFixedParameter.assignmentStatement ? new Statement(otherFixedParameter.assignmentStatement): undefined;
    }
}