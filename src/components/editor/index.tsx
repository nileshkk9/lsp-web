import './style.css';
import MonacoEditor, { EditorDidMount } from 'react-monaco-editor';
import { connectToLs, setupLanguageClient } from '../ls-client/ws-client';
import { HELLO_LANG_ID, MONACO_OPTIONS } from './constants';
import { createModel, fetchWorkflow, registerLanguage } from './util';
import * as monaco from 'monaco-editor';
import { useEffect, useState } from 'react';

// Move editorRef outside the component
const editorRef = {
  current: null as monaco.editor.IStandaloneCodeEditor | null
};

export function Editor() {
  const [code, setCode] = useState({});
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
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const wfId = query.get('wfId');
    fetchWorkflow(wfId)
      .then((data) => {
        console.log('Workflow fetched', data);
        setCode(data);
      })
      .catch((error) => {
        console.error('Failed to fetch workflow:', error);
      });
  }, []);

  return (
    <div>
      <div>
        <MonacoEditor
          width="100%"
          height="100vh"
          language={HELLO_LANG_ID}
          theme="vs-dark"
          value={JSON.stringify(code, null, 2)}
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
