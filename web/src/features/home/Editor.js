import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import cls from 'classnames';
import * as actions from './redux/actions';

import * as monaco from 'monaco-editor'

import 'antd/dist/antd.css';
import { Modal, Button, Form, Switch } from 'antd';
import BeatsPanel from './BeatsPanel';

import * as beat from './beat/utils';

export class Editor extends Component {
  static propTypes = {
    home: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  };

  containerRef = React.createRef();
  editor = null;

  state = {
    fontSize: 12,
    shake: true,
    game: false,
    gameStart: false,
    setting: false,

    characterStatus: {
      showWelcome: true,
      showGreeting: false,
      showMusic: false,
      showSyntaxError: false,
      showTestFail: false,
      showFinish: false,
      showPlayGame: false,
    },
    iconClassName: "goodDayIcon",
  }

  componentDidMount() {
    // need to delay a bit, otherwise the editor's height will be 0
    setTimeout(() => this._initEditor(), 0);
  }

  componentDidUpdate() {
    this.editor && this.editor.updateOptions(this.state);
  }

  async handleUploadMusic(event) {
    beat.handleFileUpload(event, (timestamps) => {
      console.log('handleUploadMusic got response', JSON.stringify(timestamps));
    });
  }

  clickFightingButton(flag) {
    if (this.state.characterStatus.showGreeting) {
      this.setState({
        characterStatus: {
          ...this.state.characterStatus,
          showGreeting: false,
        }
      });

      if (flag) {

      }
    }
    else if (this.state.characterStatus.showPlayGame) {
      this.setState({
        characterStatus: {
          ...this.state.characterStatus,
          showPlayGame: false,
        }
      });

      if (flag) {

      }
    }
  }

  get gameClassNames() {
    let classes = {
      'home-beats-panel': true,
      'visible': this.state.game
    }
    return classes;
  }

  showGame(show=true) {
    this.setState({ ...this.state, game:show });
  }

  toggleGame() {
    this.showGame(!this.state.game);
  }

  startGame() {
    this.setState({ ...this.state, gameStart:true });
  }

  render() {
    const {characterStatus, iconClassName} = this.state;

    let textBoxClassName = null;
    let textTitle = null;
    let textContent = null;
    let shouldShowIcon = true;
    let shouldShowButtons = false;
    if (!!characterStatus.showWelcome) {
      textBoxClassName = 'Good';
      textTitle = "MOMO SAYS…";
      textContent = "Dear master, what a wonderful day! 😊";
    }
    else if (!!characterStatus.showGreeting) {
      textBoxClassName = 'Good';
      textTitle = "MOMO SAYS…";
      textContent = "I'm always readily available to serve. How are you doing today? 🤔️";
    }
    else if (!!characterStatus.showTestFail) {
      textBoxClassName = 'Bad';
      textTitle = "TANTAN SAYS…";
      textContent = "For the last time, do not repeat such foolish mistake. 👿";
    }
    else if (!!characterStatus.showSyntaxError) {
      textBoxClassName = 'Bad';
      textTitle = "TANTAN SAYS…";
      textContent = "Are you kidding me? You this piece of rubbish! You can't even complete something so simple. 👿";
    }
    else if (!!characterStatus.showMusic) {
      textBoxClassName = 'Good';
      textTitle = "MOMO SAYS…";
      textContent = "This is my recommended song, hope it cheers you up ❤️";
    }
    else if (!!characterStatus.showFinish) {
      textBoxClassName = 'Good';
      textTitle = "MOMO SAYS…";
      textContent = "You are so fabulous, I like you so much 😘";
    }
    else if (!!characterStatus.showPlayGame) {
      textBoxClassName = 'Good';
      textTitle = "TANTAN SAYS…";
      textContent = "You are a genius, dear master. Can you play game with me? Pls Pls 🙏";
      shouldShowButtons = true;
    } else {
      shouldShowIcon = false;
    }

    return (
      <div className="home-editor fill vbox">

        <div className="controls hbox">
          {/* <input type="file" onChange={this.handleUploadMusic} /> */}
          <div className="fat"></div>
          <Button onClick={() => this.toggleGame()}>Game</Button>
          <Button onClick={() => this.run()}>Run</Button>
          <Button onClick={() => this.openSettingPanel(true)}>Settings</Button>
        </div>

        <div ref={this.containerRef} className="editor fat"/>

        <BeatsPanel
          className={this.gameClassNames}
          start={this.state.game}
        />

        <div>
          <div className={`textBox ${shouldShowIcon ? `textBox${textBoxClassName} textVisible` : ''}`}>
            <div className={`${shouldShowIcon ? `textTitle${textBoxClassName}` : ''}`}>
            {textTitle}
            </div>
            <div className={'textContent'}>
            {textContent}
            </div>
            {shouldShowButtons && (
              <div className="buttons">
                <div className='btnYes' onClick={() => this.clickFightingButton(true)}>Yes Please</div>
                <div className='btnNo' onClick={() => this.clickFightingButton(false)}>No Thanks</div>
              </div>
            )}
          </div>
          <div className={`icon ${iconClassName} ${shouldShowIcon ? 'iconVisible' : ''}`} />
        </div>

        {/* setting panel */}
        <Modal
          title="Setting"
          visible={this.state.setting}
          onOk={() => this._onSettingOk()}
          onCancel={() => this._onSettingCancel()}
        >
          <Form>
            <Form.Item label="Shake">
              <Switch checked={this.state.shake} onChange={checked => this.enableShaking(checked)}/>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }

  openSettingPanel(open=true) {
    this.setState({ ...this.state, setting:open });
  }

  enableShaking(enable=true) {
    this.setState({ ...this.state, shake:enable });
  }

  changeFontSize({value=0, delta=0}={}) {
    if(delta) {
      this.setState({
        ...this.state,
        fontSize: this.state.fontSize + delta
      })
    }
    else if(value) {
      this.setState({
        ...this.state,
        fontSize: value
      })
    }
  }

  shake() {
    const el = this.containerRef.current;
    if(el) {
      el.classList.add('shake');
      setTimeout(() => el.classList.remove('shake'), 200);
    }
  }

  run() {
    const script = this.editor.getValue().trim();
    if(!script) {
      Modal.warning({
        title: '-__-',
        content: 'Hey there is nothing in your code'
      })

      this.setState({
        characterStatus: {
          ...this.state.characterStatus,
          showWelcome: false,
          showGreeting: false,
          showMusic: false,
          showSyntaxError: false,
          showTestFail: true,
          showFinish: false,
          showPlayGame: false,
        },
        iconClassName: "errorIcon",
      })
    }
    else {
      try {
        eval(script);
        Modal.success({
          title: 'Congratulations!',
          content: 'Your code run successfully!!'
        })

        this.setState({
          characterStatus: {
            ...this.state.characterStatus,
            showWelcome: false,
            showGreeting: false,
            showMusic: false,
            showSyntaxError: false,
            showTestFail: false,
            showFinish: false,
            showPlayGame: true,
          },
          iconClassName: "successIcon",
        })
      }
      catch(e) {
        Modal.error({
          title: '-__-',
          content: e.toString()
        })
      }
    }
  }

  _initEditor() {
    const el = this.containerRef.current;

    // validation settings
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false
    });

    // compiler options
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES6,
      allowNonTsExtensions: true
    });

    // create the editor
    this.editor = monaco.editor.create(el, {
      value: '',
      language: 'javascript',
      theme: 'vs-dark',
      fontSize: this.state.fontSize
    });
    window.editor = this.editor;

    this._widgets = [];

    // get error/warning/... markers
    const setModelMarkers = monaco.editor.setModelMarkers;
    monaco.editor.setModelMarkers = (model, owner, markers) => {
      setModelMarkers.call(monaco.editor, model, owner, markers);
      if (markers && markers.length > 0) {
        // create new widget
        this.setState({
          characterStatus: {
            showWelcome: false,
            showGreeting: false,
            showMusic: false,
            showSyntaxError: true,
            showTestFail: false,
            showFinish: false,
            showPlayGame: false,
          },
          iconClassName: "errorIcon",
        });
        // // clear all widgets
        // this._widgets.forEach(widget => {
        //   this.editor.removeContentWidget(widget);
        // });
        //
        // // get position of last error of each line
        // const positions = markers.reduce(([lastLine, ...rest], marker) => {
        //   if(!lastLine) {
        //     return [ {line:marker.endLineNumber, column:marker.endColumn}, ...rest ];
        //   }
        //   else if(lastLine.line !== marker.endLineNumber) {
        //     return [ {line:marker.endLineNumber, column:marker.endColumn}, lastLine, ...rest ];
        //   }
        //   else if(lastLine.column < marker.endColumn) {
        //     return [ {line:marker.endLineNumber, column:marker.endColumn}, ...rest ];
        //   }
        //   else {
        //     return [ lastLine, ...rest ]
        //   }
        // }, []).reverse();
        //
        // // create new widget
        // this._widgets = positions.map(({line, column}) => {
        //   const widget = {
        //     domNode: null,
        //     getId: () => `widget-${line}-${column}`,
        //     getDomNode: function() {
        //       if (!this.domNode) {
        //         this.domNode = document.createElement('div');
        //         this.domNode.className = 'errorWidget';
        //         this.domNode.innerHTML = '<img width=444 height=444 src="images/evil.png" />';
        //       }
        //       return this.domNode;
        //     },
        //     getPosition: () => ({
        //       position: {
        //         lineNumber: line,
        //         column: column
        //       },
        //       preference: [
        //         monaco.editor.ContentWidgetPositionPreference.BELOW
        //       ]
        //     })
        //   }
        //
        //   this.editor.addContentWidget(widget);
        //   return widget;
        // })
      }
      else
      {
        this.setState({
          characterStatus: {
            ...this.state.characterStatus,
            showSyntaxError: false,
          }
        });
      }
    }

    el.addEventListener('keydown', this._onKeyDown.bind(this));
  }

  _onKeyDown(e) {
    if(this.state.shake) {
      this.shake();
    }

    if (this.state.characterStatus.showWelcome) {
      this.setState({
        characterStatus: {
          ...this.state.characterStatus,
          showWelcome: false,
        }
      })
      setTimeout(() => {
        this.setState({
          characterStatus: {
            ...this.state.characterStatus,
            showGreeting: true,
          },
          iconClassName: "fightingIcon",
        })
      }, 1000);
    }

    // Cmd + P
    if(e.keyCode === 80 && e.metaKey) {
      e.preventDefault();
      this.editor.trigger('anyString', 'editor.action.quickCommand')
    }
    else if(e.keyCode === 187 && e.metaKey) {
      e.preventDefault();
      this.changeFontSize({delta:+2});
    }
    else if(e.keyCode === 189 && e.metaKey) {
      e.preventDefault();
      this.changeFontSize({delta:-2});
    }
    else if(e.keyCode === 48 && e.metaKey) {
      e.preventDefault();
      this.changeFontSize({value:12});
    }
    else if (e.keyCode === 83 && e.metaKey) {
      e.preventDefault();
      if (!this.state.characterStatus.showSyntaxError) {
        this.setState({
          characterStatus: {
            showFinish: true,
          },
          iconClassName: "successIcon"
        })
      }
    }
  }

  _onSettingOk() {
    this.openSettingPanel(false);
  }

  _onSettingCancel() {
    this.openSettingPanel(false);
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    home: state.home,
  };
}

/* istanbul ignore next */
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...actions }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Editor);
