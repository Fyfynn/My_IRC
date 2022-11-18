import React, { useEffect, useState } from 'react'
import io from "socket.io-client";
import ChatBoxReceiver, { ChatBoxSender } from './ChatBox';
import _ from 'lodash';
import './ChatContainer.css';
import { ListRooms } from './ListRooms';

let socket;
const CONNECTION_PORT = 'localhost:3002/';

function ChatContainer() {
    
    const [loggedIn, setLoggedIn] = useState(false);
    const [userName, setUsername] = useState(localStorage.getItem("user"));

    const [room, setRoom] = useState(localStorage.getItem("room"));
    
    const [message, setMessage] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [oldMessageList, setOldMessageList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [whisperMsgList, setWhisperMsgList] = useState([]);
    
    // EVENTS

    useEffect( () => {
        socket = io(CONNECTION_PORT, { transports : ['websocket'] });
    }, [CONNECTION_PORT]);


    useEffect( () => {
        socket.on('receiveMessage', (data) => {
            setMessageList([...messageList, data]);
            // ActivitiesUser('newMessageAll', data);
        });
    })

    useEffect( () => {
        socket.on('writting', (pseudo) => {
            document.getElementById('isWritting').textContent = pseudo + ' est en train d\'écrire';
        })

        socket.on('notWritting', () => {
            document.getElementById('isWritting').textContent = '';
        })

        socket.on('oldMessages', (messages) => {
            setOldMessageList([...messages]);
            // console.log(oldMessageList);
            // ActivitiesUser('oldMessagesMe', message)
        })

        socket.on('userList', (users) => {
            // console.log(users)
            setUserList([...users]);
        })

        socket.on('whisper', (content) => {
            setWhisperMsgList([content]);
            console.log(content);
        })
    })

    var input = document.getElementById("inputLogin");
    var btn = document.getElementById("btnLogin")

    if(input){

        input.addEventListener("keypress", function(event) {
            if(event.key === "Enter") {
                event.preventDefault();

                btn.click(connectToRoom);
            }
        });
    }

    // FUNCTIONS 

    const writting = () => {
        socket.emit('writting', userName);
    }

    const notWritting = () => {
        socket.emit('notWritting');

    }

    const connectToRoom = () => {
        if(!userName) {
            return (alert("Enter a name please"))
        } else {
            setUsername(userName)
            console.log(userName)
            socket.emit('pseudo', userName)

            socket.on('newUser', (pseudo) => {
                // console.log("test")
                ActivitiesUser('newUser', pseudo)
            });

            socket.on('quitUser', (pseudo) => {
                // console.log(pseudo);
                ActivitiesUser('quitUser', pseudo);
            });

            setLoggedIn(true);

            // socket.emit('join_room', room)
            // localStorage.setItem("user" , userName)
            // localStorage.setItem("room" , room)
            // setRoom(room)
        }
    }

    const sendMessage = async () => {
        
        const receiver = document.getElementById('receiverInput').value;

        let messageContent = {
                author: userName,
                message: message
            }
        
        let messageContentWhisper = {
            sender: userName,
            message: message,
            receiver: receiver
        }
    
        await socket.emit("sendMessage", messageContent, receiver);
        if(receiver === 'all') {
            setMessageList([...messageList, messageContent]);
            setMessage("");
        } else {
            setWhisperMsgList([...whisperMsgList, messageContentWhisper]);
        }
        // console.log(messageContent)   
        // ActivitiesUser('newMessageMe', message);
    }

    function ActivitiesUser(element, content) {

        var newElement = document.createElement("div");

        switch (element) {
            case 'newUser':
                // console.log("newUser");
                newElement.classList.add(element, 'message');
                newElement.textContent = content + ' a rejoint le chat';
                document.getElementById('msgContainer').appendChild(newElement);
                break;

            case 'quitUser':
                // console.log("quitUser");
                newElement.classList.add(element, 'message');
                newElement.textContent = content + ' a quitté le chat';
                document.getElementById('msgContainer').appendChild(newElement);
                break;
            
            case 'oldMessages':
                newElement.classList.add(element, 'message');
                newElement.textContent = content + ' a quitté le chat';
                document.getElementById('msgContainer').appendChild(newElement);
                break;
            
            case 'oldMessagesMe':
                newElement.classList.add(element, 'message');
                newElement.textContent = content + ' a quitté le chat';
                document.getElementById('msgContainer').appendChild(newElement);
                break;
        }
    }

    return ( 

        loggedIn ?

        <div className="app">
            <h1 className="chatTitle">Bienvenue sur le chat { userName } !</h1>
                <div className="container">
                    <div className="channelList">
                        <h1>Liste des channels</h1>
                        <ul id="roomList">
                            <li className="elementList" id=""></li>
                            <li className="elementList" id="createNewRoom">Creer une nouvelle room</li>
                        </ul>
                    </div>

                    <div className="msgContainer" id="msgContainer">

                        {oldMessageList.map((val, key) => {
                            if(val.sender === userName) return <ChatBoxSender key={key} user={val.sender} message={val.content} />
                                return (
                                    <ChatBoxReceiver key={key} user={val.sender} message={val.content} />
                                )
                        })}

                        {whisperMsgList.map((val, key) => {
                            console.log("testwhisper");
                            console.log(userName);
                            if(val.sender === userName) return <ChatBoxSender key={key} user={val.sender} message={val.message} receiver={val.receiver} />
                                return (
                                    <ChatBoxReceiver key={key} user={val.sender} message={val.message} receiver={val.receiver} />
                                )
                        })}

                        {messageList.map((val, key) => {
                            if(val.author === userName) return <ChatBoxSender key={key} user={val.author} message={val.message} />
                                return (
                                    <ChatBoxReceiver key={key} user={val.author} message={val.message} />
                            )
                        })}


                    </div>
                    
                    <div id="isWritting"></div>
                    <div id="chatForm">
                        <input type="text" id="msgInput" placeholder="Type in..." onChange={(e) => {setMessage(e.target.value)}} autoFocus onKeyPress={writting} onBlur={notWritting} />
                        <select name="receiver" id="receiverInput">
                            <option value="all">A tous</option>

                            {/* LIST USERS */}

                            { userList.map((val, key) => {
                                // console.log(val)
                                return (
                                    <option key={ key } value={ val.pseudo }>{ val.pseudo }</option>
                                )
                            })}
                        </select> 
                        <button onClick={sendMessage} id="btnSend">Send</button>
                    </div>
                </div>
            </div>
        :

            <div className="login">
                <div className="input">
                    <input id='inputLogin' type="text" placeholder="Username" onChange={(e) => {setUsername(e.target.value)}}/>
                    {/* <input type="text" placeholder="Password" onChange={(e) => {setPassword(e.target.value)}}/> */}
                    {/* <input type="text" placeholder="Room" onChange={(e) => {setRoom(e.target.value)}}/> */}
                </div>
                <button id='btnLogin' onClick={connectToRoom}>Enter Chat </button>
            </div>
    )
}

export default ChatContainer;