import './App.css';
import BlogPage from './components/BlogPage';
import Header from './components/Header';
import HomePage from './components/HomePage';
import EthDApp from './components/EthDApp';
import EthNft from './components/EthNft';
import EthNftGame from './components/EthNftGame';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/ethdapp" element={<EthDApp />} />
          <Route path="/ethnft" element={<EthNft />} />
          <Route path="/ethnftgame" element={<EthNftGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
