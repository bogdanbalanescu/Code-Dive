import * as React from 'react';
import './App.css';

import { RootState } from './redux';
import { connect } from 'react-redux';
import { postTypes } from './redux/modules/types';
import { CodeDiagram } from './components/CodeDiagram/CodeDiagram';
import { ParsedTypes } from './codeModel/ParsedTypes';
import { ExtensionInteractor } from './interactors/ExtensionInteractor';

import { types } from './components/CodeDiagram/typesExample';

const mapStateToProps = (state: RootState) => ({
  types: state.types,
  interactor: state.interactor
});

const mapDispatchToProps = { postTypes }

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const connector = connect(mapStateToProps, mapDispatchToProps);

class App extends React.Component<Props> {
  componentDidMount() {
    window.addEventListener('message', this.windowEventListener as EventListener);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.windowEventListener as EventListener);
  }

  // For debugging purposes
  // TODO: remove this once its not needed
  private parsedTypes: ParsedTypes = new ParsedTypes([], [], [], []);

  windowEventListener = (event: MessageEvent) => {
    const message = event.data; // The JSON data our extension sent
    switch (message.command) {
      case 'sayHello':
        this.props.interactor.alert('Just here to say hello! 👋')
        break;
      case 'startCodeDiveAnalysis':
        this.props.interactor.startCodeDiveAnalysis();
        break;
      case 'codeDiveAnalysisResults':
        var codeDiveAnalysisResults: ParsedTypes = message.codeDiveAnalysisResults;
        
        // For debugging purposes
        this.parsedTypes = codeDiveAnalysisResults;
        this.props.postTypes(codeDiveAnalysisResults);
        break;
    }
  }

  public render() {
    return (
      <div>
        <header><h1>Welcome to Code Dive!</h1></header>
        <p>Hang on while we test a few things.</p>
        <p>{JSON.stringify(this.parsedTypes)}</p>
        <CodeDiagram types={this.props.interactor instanceof ExtensionInteractor? this.props.types: types}></CodeDiagram>
      </div>
    );
  }
}

export default connector(App);
