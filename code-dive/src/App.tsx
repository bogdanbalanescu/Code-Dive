import * as React from 'react';
import './App.css';

// import logo from './logo.svg';

import createEngine, { DiagramModel, DefaultNodeModel, DefaultLinkModel } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DemoCanvasWidget } from './helpers/DemoCanvasWidget';
import { InteractorFactory } from './interactors/InteractorFactory';
import { RootState } from './redux';
import { connect } from 'react-redux';
import { IType } from './codeModel/Types/IType';
import { postTypes } from './redux/modules/types';

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
    // Send a message to the extension
    // setInterval(() => {
    //   this.state.vsCodeInteractor.alert('🐛 on line 999');
    // }, 10000);

    // //1) setup the diagram engine
    // var engine = createEngine();

    // //2) setup the diagram model
    // var model = new DiagramModel();

    // //3-A) create a default node
    // var node1 = new DefaultNodeModel({
    //   name: 'Node 1',
    //   color: 'rgb(0,192,255)'
    // });
    // node1.setPosition(100, 100);
    // let port1 = node1.addOutPort('Out');

    // //3-B) create another default node
    // var node2 = new DefaultNodeModel('Node 2', 'rgb(192,255,0)');
    // let port2 = node2.addInPort('In');
    // node2.setPosition(400, 100);

    // // link the ports
    // let link1 = port1.link<DefaultLinkModel>(port2);
    // link1.getOptions().testName = 'Test';
    // link1.addLabel('Hello World!');

    // //4) add the models to the root graph
    // model.addAll(node1, node2, link1);

    // //5) load model into engine
    // engine.setModel(model);
    
    // //6) render the diagram!
    // return (
    //   <DemoCanvasWidget>
    //     <CanvasWidget engine={engine} />
    //   </DemoCanvasWidget>
    // );
    // return (
    //   <div className="App">
    //     <header className="App-header">
    //       <img src={logo} className="App-logo" alt="logo" />
    //       <h1 className="App-title">Welcome to React</h1>
    //     </header>
    //     <p className="App-intro">
    //       To get started, edit <code>src/App.tsx</code> and save to reload.
    //     </p>
    //   </div>
    // );
    return (
      <div>
        <h1>Welcome to Code Dive!</h1>
        <p>Hang on while we test a few things.</p>
        <p>{JSON.stringify(this.props.types)}</p>
      </div>
    );
  }
}

export default connector(App);
