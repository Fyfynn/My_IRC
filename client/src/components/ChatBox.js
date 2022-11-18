import React from 'react';
import './ChatBox.css';
import {Avatar, Image} from 'antd';


export default function ChatBoxReceiver({ user, avatar, message, receiver=null }) {

    return (
        receiver ?
            <div className='boxMessageReceiver'>
                <p className='bubbleMessageReceiver'>

                    <strong>
                        { user } vous a chuchoté :
                    </strong> <br></br>
                    { message }
                </p>
            </div>
        :
            <div className='boxMessageReceiver'>
                <p className='bubbleMessageReceiver'>
                    <strong>
                        { user } 
                    </strong> <br></br>
                    { message }
                </p>
            </div>
    )
}

export function ChatBoxSender({ user, avatar, message, receiver=null }) {
    return (
        receiver ?

            <div className='boxMessageSender'>
                <p className='bubbleMessageSender'>
                    <strong>
                        { user } vous avez chuchoté à { receiver }
                    </strong> <br></br>
                    { message }
                </p>
            </div>
        :
            <div className='boxMessageSender'>
                <p className='bubbleMessageSender'>
                    <strong>
                        { user }
                    </strong> <br></br>
                    { message }
                </p>
            </div>
    )
}