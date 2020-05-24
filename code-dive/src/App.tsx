import * as React from 'react';
import './App.css';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { RootState } from './redux';
import { postConfiguration } from './redux/modules/configuration'
import { postTypes, updateTypesForFilePath } from './redux/modules/types';
import { ExtensionInteractor } from './interactors/ExtensionInteractor';
import { CodeDiagram } from './components/CodeDiagram/CodeDiagram';
import { ParsedTypes } from './codeModel/ParsedTypes';

import { types } from './components/CodeDiagram/typesExample';
import { CodeDiagramConfiguration } from './components/CodeDiagram/CodeDiagramConfiguration';
import CircularProgress from '@material-ui/core/CircularProgress';

const mapStateToProps = (state: RootState) => ({
  configuration: state.configuration,
  types: state.types,
  interactor: state.interactor
});
const mapDispatchToProps = { 
  postConfiguration: postConfiguration, postTypes, updateTypesForFilePath 
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

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
      case 'webview:alert':
        var text: string = message.message;
        this.props.interactor.alert(text);
        break;
      // extension configuration/settings
      case 'webview:loadConfiguration':
        this.props.interactor.loadConfiguration();
        break;
      case 'webview:configurationResults':
        var configuration: CodeDiagramConfiguration = message.configuration;
        this.props.postConfiguration(configuration);
        break;
      // code dive analysis
      case 'webview:startCodeDiveAnalysis':
        this.props.interactor.startCodeDiveAnalysis();
        break;
      case 'webview:codeDiveAnalysisResults':
        var codeDiveAnalysisResults: ParsedTypes = message.codeDiveAnalysisResults;
        this.props.postTypes(codeDiveAnalysisResults);
        break;
      case 'webview:updateDiveAnalysisResultsForFilePath':
        var codeDiveAnalysisResults: ParsedTypes = message.codeDiveAnalysisResults;
        var filePath = message.filePath;
        this.props.updateTypesForFilePath(codeDiveAnalysisResults, filePath);
        break;
    }
  }

  public render() {
    return (
      <div>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Code Dive, a visual programming tool for textual based programming languages.</title>
        </Helmet>
        {
          this.props.interactor instanceof ExtensionInteractor ?
          (
            this.props.configuration.isLoaded 
            ? <CodeDiagram types={this.props.types} configuration={this.props.configuration} />
            : <CircularProgress />
          )
          : <CodeDiagram types={types} configuration={new CodeDiagramConfiguration(true)} />
        }
      </div>
    );
  }
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(App);
