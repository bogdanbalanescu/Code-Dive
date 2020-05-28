import { CodeComponentType } from "./CodeComponentType";
import { IType } from "../../codeModel/Types/IType";
import { Class } from "../../codeModel/Types/Class";
import { Struct } from "../../codeModel/Types/Struct";
import { Interface } from "../../codeModel/Types/Interface";

import { Constructor } from "../../codeModel/Misc/Constructor";
import { Method } from "../../codeModel/Misc/Method";
import { Property } from "../../codeModel/Misc/Property";
import { PropertyAccessor } from "../../codeModel/Misc/PropertyAccessor";
import { Statement } from "../../codeModel/Misc/Statement";

export class CodeUpdater {
    public updateCode(relevantTypeCopy: IType, nodeData: any) {
        var codeComponentLocation = nodeData.codeComponentLocation;
        switch(codeComponentLocation.type) {
            case (CodeComponentType.ConstructorStatement):
                var relevantConstructor = (relevantTypeCopy as Class | Struct).constructors.find(callable => callable.index === codeComponentLocation.callableIndex) as Constructor;
                var relevantStatement = relevantConstructor.statements.find(statement => statement.index === codeComponentLocation.statementIndex) as Statement;
                relevantStatement.statementText = nodeData.statementText;
                break;
            case (CodeComponentType.MethodStatement):
                var relevantMethod = (relevantTypeCopy as Class | Struct | Interface).methods.find(callable => callable.index === codeComponentLocation.callableIndex) as Method;
                var relevantStatement = relevantMethod.statements.find(statement => statement.index === codeComponentLocation.statementIndex) as Statement;
                relevantStatement.statementText = nodeData.statementText;
                break;
            case (CodeComponentType.PropertyAccessorStatement):
                var relevantProperty = (relevantTypeCopy as Class | Struct | Interface).properties.find(property => property.index === codeComponentLocation.propertyIndex) as Property;
                var relevantAccessor = relevantProperty.accessors.find(accessor => accessor.index === codeComponentLocation.accessorIndex) as PropertyAccessor;
                var relevantStatement = relevantAccessor.body.find(statement => statement.index === codeComponentLocation.statementIndex) as Statement;
                relevantStatement.statementText = nodeData.statementText;
        }
    }
}