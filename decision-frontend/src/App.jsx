import "./App.css";

function App() {
  return (
    <div className="container">
      <h1>DecisionOS 🧠</h1>

      <input
        className="input"
        placeholder="Ask your question..."
      />

      <button className="btn">Analyze</button>

      <div className="result">
        <h2>Recommendation: YES</h2>
        <p>Confidence: 82%</p>
      </div>
    </div>
  );
}

export default App;