import React, { useEffect, useState } from "react";
import './App.css';
import ChatContainer from "./components/ChatContainer";



function App() {

//   // Before Login

//   // const [password, setPassword] = useState("");

//   // After login

//   // // Functions 

//   const connectToRoom = () => {
//     setLoggedIn(true);
//     socket.emit('join_room', room)
//   }

  return (
    <div className="App">
      <ChatContainer />
    </div>    
  );
}

export default App;
