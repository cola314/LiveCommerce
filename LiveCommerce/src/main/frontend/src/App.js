import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [enter, setEnter] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8080/api/enter')
        .then(resp => setEnter(resp.data))
  }, []);

  return (
    <div>{enter}</div>
  );
}

export default App;
