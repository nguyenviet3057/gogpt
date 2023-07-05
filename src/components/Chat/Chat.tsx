import React, { useState } from 'react';
import useStore from '@store/store';

import ChatContent from './ChatContent';
import MobileBar from '../MobileBar';
import StopGeneratingButton from '@components/StopGeneratingButton/StopGeneratingButton';

import { TbTextSize } from 'react-icons/tb';
import { BsImage } from 'react-icons/bs'

import './chat.css';

const Chat = () => {
  const hideSideMenu = useStore((state) => state.hideSideMenu);

  const [isText, setIsText] = useState(true);

  const useTextBot = (bool: boolean) => {
    setIsText(bool);
  }

  return (
    <div
      className={`flex h-full flex-1 flex-col ${
        hideSideMenu ? 'md:pl-0' : 'md:pl-[260px]'
      }`}
    >
      <MobileBar />
      <main className='relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1'>
        <ChatContent isText={isText} />
        <StopGeneratingButton />
      </main>
      <div className='ai-type-overlay'>
        <div className={isText ? 'active' : ''} onClick={() => useTextBot(true)}>
          <TbTextSize />
        </div>
        <div className={isText ? '' : 'active'} onClick={() => useTextBot(false)}>
          <BsImage />
        </div>
      </div>
    </div>
  );
};

export default Chat;
