import { BrowserRouter } from 'react-router-dom';
import WordTable from './components/WordTable';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-pastel-green via-pastel-blue to-pastel-pink p-4">
        <WordTable />
      </div>
    </BrowserRouter>
  );
}

export default App;