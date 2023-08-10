import React, { useEffect, useRef, useState } from 'react';

import useInitialiseNewChat from '@hooks/useInitialiseNewChat';

import ChatIcon from '@icon/ChatIcon';
import CrossIcon from '@icon/CrossIcon';
import DeleteIcon from '@icon/DeleteIcon';
import EditIcon from '@icon/EditIcon';
import TickIcon from '@icon/TickIcon';
import useStore from '@store/store';
import { AppConfig } from '@constants/config';
import { load } from 'react-cookies';
import { ChatInterface } from '@type/chat';

const ChatHistoryClass = {
  normal:
    'flex py-2 px-2 items-center gap-3 relative rounded-md bg-gray-900 hover:bg-gray-850 break-all hover:pr-4 group transition-opacity',
  active:
    'flex py-2 px-2 items-center gap-3 relative rounded-md break-all pr-14 bg-gray-800 hover:bg-gray-800 group transition-opacity',
  normalGradient:
    'absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-gray-900 group-hover:from-gray-850',
  activeGradient:
    'absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-gray-800',
};

const ChatHistory = React.memo(
  ({ title, chatIndex }: { title: string; chatIndex: number }) => {
    const initialiseNewChat = useInitialiseNewChat();
    const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);
    const setChats = useStore((state) => state.setChats);
    const active = useStore((state) => state.currentChatIndex === chatIndex);
    const generating = useStore((state) => state.generating);

    const [isDelete, setIsDelete] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [_title, _setTitle] = useState<string>(title);
    const inputRef = useRef<HTMLInputElement>(null);

    const editTitle = () => {
      const updatedChats: Array<ChatInterface> = JSON.parse(
        JSON.stringify(useStore.getState().chats)
      );
      updatedChats[chatIndex].title = _title;
      updatedChats[chatIndex].titleSet = true;

      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

      var urlencoded = new URLSearchParams();
      urlencoded.append("Authorization", `Bearer ${load("access_token")}`);
      urlencoded.append("id", updatedChats[chatIndex].id);
      urlencoded.append("config", JSON.stringify(updatedChats[chatIndex].config));
      urlencoded.append("title", updatedChats[chatIndex].title);
      urlencoded.append("titleSet", updatedChats[chatIndex].titleSet ? "1" : "0");
      if (updatedChats[chatIndex].folder) urlencoded.append("folder_id", updatedChats[chatIndex].folder!);

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded
      };

      fetch(AppConfig.BASE_URL + AppConfig.CHAT_UPDATE, requestOptions)
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
      setIsEdit(false);
    };

    const deleteChat = () => {
      const updatedChats: Array<ChatInterface> = JSON.parse(
        JSON.stringify(useStore.getState().chats)
      );

      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

      var urlencoded = new URLSearchParams();
      urlencoded.append("Authorization", `Bearer ${load("access_token")}`);
      urlencoded.append("id", updatedChats[chatIndex].id);

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded
      };

      fetch(AppConfig.BASE_URL + AppConfig.CHAT_DELETE, requestOptions)
        .then(response => {
          // console.log(response);
          return response.json()
        })
        .then(result => {
          // console.log(result);
          updatedChats.splice(chatIndex, 1);
          if (updatedChats.length > 0) {
            setCurrentChatIndex(0);
            setChats(updatedChats);
          } else {
            initialiseNewChat();
          }
          setIsDelete(false);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        editTitle();
      }
    };

    const handleTick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      if (isEdit) editTitle();
      else if (isDelete) deleteChat();
    };

    const handleCross = () => {
      setIsDelete(false);
      setIsEdit(false);
    };

    const handleDragStart = (e: React.DragEvent<HTMLAnchorElement>) => {
      if (e.dataTransfer) {
        e.dataTransfer.setData('chatIndex', String(chatIndex));
      }
    };

    useEffect(() => {
      if (inputRef && inputRef.current) inputRef.current.focus();
    }, [isEdit]);

    const updateCurrentChatIndex = (chatIndex: number) => {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

      var urlencoded = new URLSearchParams();
      urlencoded.append("Authorization", `Bearer ${load("access_token")}`);
      urlencoded.append("chat_index", String(chatIndex));

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
        })
        .catch(error => {
          console.error('Error:', error);
        });
      setCurrentChatIndex(chatIndex);
    }

    return (
      <a
        className={`${active ? ChatHistoryClass.active : ChatHistoryClass.normal
          } ${generating
            ? 'cursor-not-allowed opacity-40'
            : 'cursor-pointer opacity-100'
          }`}
        onClick={() => {
          if (!generating) updateCurrentChatIndex(chatIndex)
        }}
        draggable
        onDragStart={handleDragStart}
      >
        <ChatIcon />
        <div className='flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative'>
          {isEdit ? (
            <input
              type='text'
              className='focus:outline-blue-600 text-sm border-none bg-transparent p-0 m-0 w-full'
              value={_title}
              onChange={(e) => {
                _setTitle(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              ref={inputRef}
            />
          ) : (
            _title
          )}

          {isEdit || (
            <div
              className={
                active
                  ? ChatHistoryClass.activeGradient
                  : ChatHistoryClass.normalGradient
              }
            />
          )}
        </div>
        {active && (
          <div className='absolute flex right-1 z-10 text-gray-300 visible'>
            {isDelete || isEdit ? (
              <>
                <button className='p-1 hover:text-white' onClick={handleTick}>
                  <TickIcon />
                </button>
                <button className='p-1 hover:text-white' onClick={handleCross}>
                  <CrossIcon />
                </button>
              </>
            ) : (
              <>
                <button
                  className='p-1 hover:text-white'
                  onClick={() => setIsEdit(true)}
                >
                  <EditIcon />
                </button>
                <button
                  className='p-1 hover:text-white'
                  onClick={() => setIsDelete(true)}
                >
                  <DeleteIcon />
                </button>
              </>
            )}
          </div>
        )}
      </a>
    );
  }
);

export default ChatHistory;
