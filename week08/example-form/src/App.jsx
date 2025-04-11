import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function MyForm (props) {

  const [name, setName] = useState('');

  const handleSubmit = (event) => {
	  console.log('Name submitted: '+ name);
	  event.preventDefault();
  }

  const handleChange = (event) => {
    let val = event.target.value.toUpperCase();
	  setName(val) ;
  };

  return (
   <form onSubmit={handleSubmit}>
    <label> Name:
      <input type="text" value={name} onChange={handleChange} />
    </label>
    <input type="submit" value="Submit" />
  </form>
  );
}


function App() {

  return (
    <MyForm />
  )
}

export default App
