import React from 'react';
import ReactDOM from 'react-dom';

function TestApp() {
  console.log("TestApp rendering");
  return <h1>Test Successful</h1>;
}

// Direct render without any context providers
ReactDOM.render(
  <TestApp />,
  document.getElementById('root')
);
