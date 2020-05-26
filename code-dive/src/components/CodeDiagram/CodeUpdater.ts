import { CodeLocatorType } from "./CodeLocatorType";
import { Class } from "../../codeModel/Types/Class";
import { Struct } from "../../codeModel/Types/Struct";
import { Interface } from "../../codeModel/Types/Interface";

import { Constructor } from "../../codeModel/Misc/Constructor";
import { Method } from "../../codeModel/Misc/Method";
import { Property } from "../../codeModel/Misc/Property";
import { PropertyAccessor } from "../../codeModel/Misc/PropertyAccessor";
import { Statement } from "../../codeModel/Misc/Statement";

export class CodeUpdater {
    
    updateCode(relevantTypeCopy: import("../../codeModel/Types/IType").IType, codeLocator: any, code: string) {
        switch(codeLocator.type) {
            case (CodeLocatorType.ConstructorStatement):
                var relevantConstructor = (relevantTypeCopy as Class | Struct).constructors.find(callable => callable.index === codeLocator.callableIndex) as Constructor;
                var relevantStatement = relevantConstructor.statements.find(statement => statement.index === codeLocator.statementIndex) as Statement;
                relevantStatement.statementText = code;
                break;
            case (CodeLocatorType.MethodStatement):
                var relevantMethod = (relevantTypeCopy as Class | Struct | Interface).methods.find(callable => callable.index === codeLocator.callableIndex) as Method;
                var relevantStatement = relevantMethod.statements.find(statement => statement.index === codeLocator.statementIndex) as Statement;
                relevantStatement.statementText = code;
                break;
            case (CodeLocatorType.PropertyAccessorStatement):
                var relevantProperty = (relevantTypeCopy as Class | Struct | Interface).properties.find(property => property.index === codeLocator.propertyIndex) as Property;
                var relevantAccessor = relevantProperty.accessors.find(accessor => accessor.index === codeLocator.accessorIndex) as PropertyAccessor;
                var relevantStatement = relevantAccessor.body.find(statement => statement.index === codeLocator.statementIndex) as Statement;
                relevantStatement.statementText = code;
        }
    }
}