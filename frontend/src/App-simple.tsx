import React from 'react';

function App(): JSX.Element {
  return (
    <div className="App">
      <header className="App-header">
        <h1>FixYourPrompts</h1>
        <p>Bundle Analysis Demo</p>
      </header>
      
      <main>
        <section>
          <h2>Bundle Analysis Tools</h2>
          <p>This build demonstrates the bundle analysis and optimization tools.</p>
          
          <div>
            <h3>Available Scripts:</h3>
            <ul>
              <li>npm run bundle:stats - Detailed bundle statistics</li>
              <li>npm run bundle:size - Size validation</li>
              <li>npm run bundle:monitor - Track changes over time</li>
              <li>npm run performance:budget - Performance validation</li>
              <li>npm run bundle:visualize - Visual analysis</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;