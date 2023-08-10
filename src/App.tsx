import React, { useEffect, useState } from 'react';
import useStore from '@store/store';
import i18n from './i18n';

import Chat from '@components/Chat';
import Menu from '@components/Menu';

import useInitialiseNewChat from '@hooks/useInitialiseNewChat';
import { ChatInterface, Folder, FolderCollection } from '@type/chat';
import { Theme } from '@type/theme';
import ApiPopup from '@components/ApiPopup';
import Toast from '@components/Toast';

import { load, save } from 'react-cookies';

import { default as Auth } from '@components/Auth/login';
import { AppConfig } from '@constants/config';
import PuffLoader from "react-spinners/PuffLoader";
import { TypeAnimation } from 'react-type-animation';

function App() {
  const initialiseNewChat = useInitialiseNewChat();
  const setChats = useStore((state) => state.setChats);
  const setTheme = useStore((state) => state.setTheme);
  const setApiKey = useStore((state) => state.setApiKey);
  const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);
  const setFolders = useStore((state) => state.setFolders);
  const setLastToken = useStore((state) => state.setLastToken);

  const [isLogged, setIsLogged] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [hasCode, setHasCode] = useState(false);
  const queryParams = new URLSearchParams(window.location.search);
  const [isLoading, setIsLoading] = useState(true);

  const verifyEmail = async () => {
    if (hasCode) {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

      var urlencoded = new URLSearchParams();
      urlencoded.append("code", queryParams.get('code') ?? "");

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded
      };

      await fetch(AppConfig.BASE_URL + AppConfig.VERIFY_EMAIL, requestOptions)
        .then(response => {
          // console.log(response);
          return response.json()
        })
        .then(result => {
          // console.log('Response:', result);
          save("access_token", result.token, {});
          window.location.href = window.location.origin + window.location.pathname;
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    i18n.on('languageChanged', (lng) => {
      document.documentElement.lang = lng;
    });
    if (queryParams.has('code')) {
      console.log(hasCode);
      setHasCode(true);
      verifyEmail();
    } else {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

      var urlencoded = new URLSearchParams();
      urlencoded.append("Authorization", `Bearer ${load("access_token")}`);

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded
      };

      fetch(AppConfig.BASE_URL + AppConfig.CHECK_AUTH, requestOptions)
        .then(response => {
          // console.log(response);
          return response.status
        })
        .then(result => {
          // console.log('Response:', result);
          if (result == 200) setIsLogged(true);
          setCheckedAuth(true);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }, [hasCode]);

  useEffect(() => {
    const getChats = async () => {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

      var urlencoded = new URLSearchParams();
      urlencoded.append("Authorization", `Bearer ${load("access_token")}`);

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded
      };

      await fetch(AppConfig.BASE_URL + AppConfig.CHAT_INFO, requestOptions)
        .then(response => {
          return response.json()
        })
        .then(result => {
          let folders: Array<Folder> = result.folders;
          const arrayToObject = (arr: Array<Folder>): FolderCollection => {
            return arr.reduce((obj: FolderCollection, value: Folder) => {
              value.expanded = Boolean(value.expanded);
              obj[value.id] = value;
              return obj;
            }, {});
          }
          setFolders(arrayToObject(folders));

          setLastToken(result.last_token ?? false);

          oldChats = result.chats;
          if (oldChats) {
            try {
              const chats: ChatInterface[] = oldChats;
              if (chats.length > 0) {
                setChats(chats);
                setCurrentChatIndex(result.chat_index);
              } else {
                initialiseNewChat();
              }
            } catch (e: unknown) {
              console.log(e);
              // initialiseNewChat();
            }
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }


    // legacy local storage
    // const oldChats = localStorage.getItem('chats');
    let oldChats: any;
    if (isLogged) {
      getChats().then(() => {
        setIsLoading(false);
      });
    }
    // const oldChats = JSON.stringify({});
    const apiKey = localStorage.getItem('apiKey');
    const theme = localStorage.getItem('theme');

    if (apiKey) {
      setApiKey(apiKey);
      localStorage.removeItem('apiKey');
    }

    if (theme) {
      setTheme(theme as Theme);
      localStorage.removeItem('theme');
    }
  }, [isLogged]);

  if (isLoading && isLogged) return (
    <div className='loading-process flex flex-column w-full h-full align-items-center justify-content-center' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#444654', color: 'white' }}>
      <TypeAnimation
        sequence={[
          // Same substring at the start will only be typed out once, initially
          'Loading',
          800, // wait 1s before replacing "Mice" with "Hamsters"
          'Loading.',
          800,
          'Loading..',
          800,
          'Loading...',
          800
        ]}
        wrapper="span"
        speed={20}
        style={{ marginBottom: '20px' }}
        repeat={Infinity}
        cursor={false}
        deletionSpeed={{ type: 'keyStrokeDelayInMs', value: 0 }}
        preRenderFirstString={true}
      />
      <PuffLoader color='teal' size={120} />
    </div>
  )

  return (
    <div className='overflow-hidden w-full h-full relative'>
      {hasCode ?
        <div className='confirm-process flex flex-column w-full h-full align-items-center justify-content-center' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#444654', color: 'white' }}>
          <TypeAnimation
            sequence={[
              // Same substring at the start will only be typed out once, initially
              'Verifying Email',
              800, // wait 1s before replacing "Mice" with "Hamsters"
              'Verifying Email.',
              800,
              'Verifying Email..',
              800,
              'Verifying Email...',
              800
            ]}
            wrapper="span"
            speed={20}
            style={{ marginBottom: '20px' }}
            repeat={Infinity}
            cursor={false}
            deletionSpeed={{ type: 'keyStrokeDelayInMs', value: 0 }}
            preRenderFirstString={true}
          />
          <PuffLoader color='teal' size={120} />
        </div>
        :
        isLogged ?
          <>
            <Menu setIsLogged={setIsLogged} />
            <Chat />
            {/* <ApiPopup /> */}
            <Toast />
          </>
          :
          <Auth checkedAuth={checkedAuth} setIsLogged={setIsLogged} />
      }

    </div>
  );
}

export default App;
