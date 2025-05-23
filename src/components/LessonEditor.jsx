import React, { useRef } from 'react';
import { createReactEditorJS } from 'react-editor-js';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Image from '@editorjs/image';

const EDITOR_JS_TOOLS = {
  header: Header,
  list: List,
  // Add more tools as needed
};

// Create the ReactEditorJS component using the factory function
const ReactEditorJS = createReactEditorJS();

export default function LessonEditor({ data, onChange }) {
  const editorCore = useRef(null);
  return (
    <ReactEditorJS
      instanceRef={(instance) => (editorCore.current = instance)}
      tools={EDITOR_JS_TOOLS}
      data={data}
      onChange={async () => {
        const savedData = await editorCore.current.save();
        onChange(savedData);
      }}
    />
  );
}
