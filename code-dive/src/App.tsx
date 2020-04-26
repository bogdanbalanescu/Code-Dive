import * as React from 'react';
import './App.css';

import { RootState } from './redux';
import { connect } from 'react-redux';
import { IType } from './codeModel/Types/IType';
import { postTypes } from './redux/modules/types';
import ExampleGraph from './components/codeRepresentation/ExampleGraph';
import { CodeDiagram } from './components/CodeDiagram/CodeDiagram';

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
          var codeDiveAnalysisResults: IType[] = message.codeDiveAnalysisResults;
          
          // TODO: show the visual representation of the code.
          // For now, we only show the result of the code dive analysis as text.
          this.props.postTypes(codeDiveAnalysisResults);
          break;
    }
  }

  public render() {
    return (
      <div>
        <header><h1>Welcome to Code Dive!</h1></header>
        <p>Hang on while we test a few things.</p>
        <p>{JSON.stringify(this.props.types)}</p>
        <CodeDiagram types={this.props.types}></CodeDiagram>
      </div>
    );
  }
}

export default connector(App);
