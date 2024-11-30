import React, { useRef } from 'react';
import MonacoEditor, { EditorDidMount } from 'react-monaco-editor';
import { connectToLs, setupLanguageClient } from '../ls-client/ws-client';
import { HELLO_LANG_ID, MONACO_OPTIONS } from './constants';
import { createModel, registerLanguage } from './util';
import * as monaco from 'monaco-editor';

// Move editorRef outside the component
const editorRef = { current: null as monaco.editor.IStandaloneCodeEditor | null };

export function Editor() {
  const editorDidMount: EditorDidMount = async (editor, monaco) => {
    // Store the editor instance in the shared ref
    editorRef.current = editor;

    registerLanguage();
    const model = createModel();
    editor.setModel(model);

    // Setup language client
    await setupLanguageClient();
    editor.focus();
  };

  return (
    <div>
      <div>
        <h3>Web Editor</h3>
      </div>
      <div>
        <MonacoEditor
          width="100%"
          height="90vh"
          language={HELLO_LANG_ID}
          theme="vs-dark"
          options={MONACO_OPTIONS}
          editorDidMount={editorDidMount}
        />
      </div>
    </div>
  );
}

// Function to access the current editor
export function getCurrentEditor() {
  return editorRef.current;
}