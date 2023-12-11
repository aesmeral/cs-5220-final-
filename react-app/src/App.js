import logo from './logo.svg';
import './App.css';
import axios from 'axios';

const App = () => {
  const click = async () => {
    window.location.href = 'http://localhost:8080/login';
  }

  const logout = async () => {
    await axios.post('http://localhost:8080/logout', {}, { withCredentials: true });
  }

  const checkLogin = async () => {
    await axios.get('http://localhost:8080/ensured', { withCredentials: true });
  }

  return (
    <div>
      <button onClick={click}>Simple Google Button</button>
      <button onClick={logout}>Log Out</button>
      <button onClick={checkLogin}>Check Login</button>
    </div>
  )
};

export default App;
