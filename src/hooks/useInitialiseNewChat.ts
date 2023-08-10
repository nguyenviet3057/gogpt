import React from 'react';
import useStore from '@store/store';
import { MessageInterface } from '@type/chat';
import { generateDefaultChat } from '@constants/chat';
import { load } from 'react-cookies';
import { AppConfig } from '@constants/config';

const useInitialiseNewChat = () => {
  const setChats = useStore((state) => state.setChats);
  const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);

  const initialiseNewChat = () => {
    let newChat = generateDefaultChat();
    setCurrentChatIndex(0);

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("Authorization", `Bearer ${load("access_token")}`);
    urlencoded.append("id", newChat.id);
    urlencoded.append("config", JSON.stringify(newChat.config));
    urlencoded.append("title", newChat.title);
    urlencoded.append("titleSet", newChat.titleSet ? "1" : "0");

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded
    };

    fetch(AppConfig.BASE_URL + AppConfig.CHAT_CREATE, requestOptions)
      .then(response => {
        // console.log(response);
        return response.json()
      })
      .then(result => {
        // console.log(result);
        setChats([newChat]);
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        var urlencoded = new URLSearchParams();
        urlencoded.append("Authorization", `Bearer ${load("access_token")}`);
        urlencoded.append("chat_index", "0");

        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: urlencoded
        };

        fetch(AppConfig.BASE_URL + AppConfig.CHAT_INDEX, requestOptions)
          .then(response => {
            // console.log(response);
            return response.json()
          })
          .then(result => {
            // console.log(result);
            setCurrentChatIndex(0);
          })
          .catch(error => {
            console.error('Error:', error);
          });
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return initialiseNewChat;
};

export default useInitialiseNewChat;
