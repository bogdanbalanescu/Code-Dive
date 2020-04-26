export const parsedTypes = 
    JSON.parse("[{\"constructors\":[{\"declaredVariables\":[],\"modifiers\":[],\"name\":\"Math\",\"parameters\":[{\"modifier\":\"\",\"name\":\"lastSum\",\"type\":\"int\"}],\"statements\":[{\"statementText\":\"this.lastSum = lastSum;\",\"usedConstructors\":[],\"usedFieldsAndProperties\":[\"this.lastSum\",\"lastSum\"],\"usedMethods\":[]}]}],\"fields\":[{\"modifiers\":[\"public\"],\"name\":\"lastSum\",\"type\":\"int\"}],\"methods\":[{\"declaredVariables\":[{\"name\":\"sum\",\"type\":\"int\"}],\"modifiers\":[\"public\"],\"name\":\"Add\",\"parameters\":[{\"modifier\":\"\",\"name\":\"x\",\"type\":\"int\"},{\"modifier\":\"\",\"name\":\"y\",\"type\":\"int\"}],\"statements\":[{\"statementText\":\"int sum;\",\"usedConstructors\":[],\"usedFieldsAndProperties\":[],\"usedMethods\":[]},{\"statementText\":\"sum = x + y;\",\"usedConstructors\":[],\"usedFieldsAndProperties\":[\"sum\",\"x\",\"y\"],\"usedMethods\":[]},{\"statementText\":\"return sum;\",\"usedConstructors\":[],\"usedFieldsAndProperties\":[\"sum\"],\"usedMethods\":[]}],\"type\":\"int\"},{\"declaredVariables\":[],\"modifiers\":[\"public\"],\"name\":\"Multiply\",\"parameters\":[{\"modifier\":\"\",\"name\":\"x\",\"type\":\"int\"},{\"modifier\":\"\",\"name\":\"y\",\"type\":\"int\"}],\"statements\":[{\"statementText\":\"return x * y;\",\"usedConstructors\":[],\"usedFieldsAndProperties\":[\"x\",\"y\"],\"usedMethods\":[]}],\"type\":\"int\"}],\"modifiers\":[\"public\"],\"name\":\"Math\",\"namespace\":\"FruitDelivery\",\"namespaceDependecies\":[{\"name\":\"System\"},{\"name\":\"System.Collections.Generic\"},{\"name\":\"System.Linq\"},{\"name\":\"System.Text\"},{\"name\":\"System.Threading.Tasks\"}],\"parentInheritances\":[],\"properties\":[{\"accessors\":[{\"body\":[{\"statementText\":\"return lastSum;\",\"usedConstructors\":[],\"usedFieldsAndProperties\":[\"lastSum\"],\"usedMethods\":[]}],\"type\":\"get\"},{\"body\":[{\"statementText\":\"lastSum = value;\",\"usedConstructors\":[],\"usedFieldsAndProperties\":[\"lastSum\",\"value\"],\"usedMethods\":[]}],\"type\":\"set\"}],\"modifiers\":[\"public\"],\"name\":\"LastSum\",\"type\":\"int\"}]}]"
    );