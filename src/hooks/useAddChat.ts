import React from 'react';
import useStore from '@store/store';
import { generateDefaultChat } from '@constants/chat';
import { ChatInterface } from '@type/chat';
import { AppConfig } from '@constants/config';
import { load } from 'react-cookies';

const useAddChat = () => {
  const setChats = useStore((state) => state.setChats);
  const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);

  const addChat = (folder?: string) => {
    const chats = useStore.getState().chats;
    if (chats) {
      const updatedChats: ChatInterface[] = JSON.parse(JSON.stringify(chats));
      let titleIndex = 1;
      let title = `New Chat ${titleIndex}`;

      while (chats.some((chat) => chat.title === title)) {
        titleIndex += 1;
        title = `New Chat ${titleIndex}`;
      }
      let newChat = generateDefaultChat(title, folder);
      updatedChats.unshift(newChat);

      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

      var urlencoded = new URLSearchParams();
      urlencoded.append("Authorization", `Bearer ${load("access_token")}`);
      urlencoded.append("id", newChat.id);
      urlencoded.append("config", JSON.stringify(newChat.config));
      urlencoded.append("title", newChat.title);
      urlencoded.append("titleSet", newChat.titleSet ? "1" : "0");
      if (newChat.folder) urlencoded.append("folder_id", newChat.folder);

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
        })
        .catch(error => {
          console.error('Error:', error);
        });
      setChats(updatedChats);
      setCurrentChatIndex(0);
    }
  };

  return addChat;
};

export default useAddChat;
