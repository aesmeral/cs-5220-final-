import logo from './logo.svg';
import './App.css';
import axios from 'axios';

const App = () => {
  const click = async () => {
    console.log('click');
    window.location.href = 'http://localhost:8080/login';
  }

  return (
    <div>
      <button onClick={click}>Simple Google Button</button>
    </div>
  )
};

export default App;
