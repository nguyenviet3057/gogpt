import React, { memo, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';

import useSubmit from '@hooks/useSubmit';

import { ChatInterface } from '@type/chat';

import PopupModal from '@components/PopupModal';
import TokenCount from '@components/TokenCount';
import CommandPrompt from '../CommandPrompt';
import { load } from 'react-cookies';
import { AppConfig } from '@constants/config';

import './EditView.css';

const EditView = ({
  content,
  setIsEdit,
  messageIndex,
  sticky,
}: {
  content: string;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  messageIndex: number;
  sticky?: boolean;
}) => {
  const inputRole = useStore((state) => state.inputRole);
  const setChats = useStore((state) => state.setChats);
  const currentChatIndex = useStore((state) => state.currentChatIndex);
  const typeAI = useStore((state) => state.typeAI);
  const lastToken = useStore((state) => state.lastToken);
  const setLastToken = useStore((state) => state.setLastToken);

  const [_content, _setContent] = useState<string>(content);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const textareaRef = React.createRef<HTMLTextAreaElement>();
  const textContainerRef = useRef<any>(null);
  const [ratioX, setRatioX] = useState<number>(3);
  const [ratioY, setRatioY] = useState<number>(2);
  const [previewWidth, setPreviewWidth] = useState<number>(0);

  const { t } = useTranslation();

  const resetTextAreaHeight = () => {
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|playbook|silk/i.test(
        navigator.userAgent
      );

    if (e.key === 'Enter' && !isMobile && !e.nativeEvent.isComposing) {
      const enterToSubmit = useStore.getState().enterToSubmit;
      if (sticky) {
        if (
          (enterToSubmit && !e.shiftKey) ||
          (!enterToSubmit && (e.ctrlKey || e.shiftKey))
        ) {
          e.preventDefault();
          handleSaveAndSubmit();
          resetTextAreaHeight();
        }
      } else {
        if (e.ctrlKey && e.shiftKey) {
          e.preventDefault();
          handleSaveAndSubmit();
          resetTextAreaHeight();
        } else if (e.ctrlKey || e.shiftKey) handleSave();
      }
    }
  };

  const handleSave = () => {
    if (sticky && (_content === '' || useStore.getState().generating)) return;
    const updatedChats: ChatInterface[] = JSON.parse(
      JSON.stringify(useStore.getState().chats)
    );
    const updatedMessages = updatedChats[currentChatIndex].messages;
    if (sticky) {
      updatedMessages.push({ role: inputRole, content: _content });
      _setContent('');
      resetTextAreaHeight();
    } else {
      updatedMessages[messageIndex].content = _content;
      setIsEdit(false);
    }
    setChats(updatedChats);
  };

  const { handleSubmit } = useSubmit();
  const handleSaveAndSubmit = () => {
    if (useStore.getState().generating) return;
    const updatedChats: ChatInterface[] = JSON.parse(
      JSON.stringify(useStore.getState().chats)
    );
    const updatedMessages = updatedChats[currentChatIndex].messages;
    if (sticky) {
      if (_content !== '') {
        updatedMessages.push({ role: inputRole, content: _content });
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        let currentChat: ChatInterface = updatedChats[currentChatIndex];

        var urlencoded = new URLSearchParams();
        urlencoded.append("Authorization", `Bearer ${load("access_token")}`);
        urlencoded.append("chat_id", currentChat.id);
        urlencoded.append("role", inputRole);
        urlencoded.append("content", _content);
        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: urlencoded
        };
        fetch(AppConfig.BASE_URL + AppConfig.CHAT_MESSAGE_CREATE, requestOptions)
          .then(response => {
            return response.json();
          })
          .then(result => {
            if (result.status != 1) {
              updatedMessages.pop();
              setLastToken(true);
              setIsModalOpen(true);
            } else {
              handleSubmit(typeAI, [ratioX, ratioY]);
            }
          })
          .catch(error => {
            console.error('Error:', error);
          })
      }
      _setContent('');
      resetTextAreaHeight();
    } else {
      updatedMessages[messageIndex].content = _content;
      updatedChats[currentChatIndex].messages = updatedMessages.slice(
        0,
        messageIndex + 1
      );
      setIsEdit(false);
    }
    setChats(updatedChats);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [_content]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    if (typeAI == 1 && textContainerRef.current) setPreviewWidth(textContainerRef.current.offsetWidth);
  }, [typeAI, textContainerRef.current]);

  const handleRatio = (x: number, y: number) => {
    setRatioX(x);
    setRatioY(y);
  }

  return (
    <>
      <div
        ref={textContainerRef}
        className={`w-full ${sticky
          ? 'py-2 md:py-3 px-2 md:px-4 border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]'
          : ''
          }`}
      >
        <textarea
          ref={textareaRef}
          className='m-0 resize-none rounded-lg bg-transparent overflow-y-hidden focus:ring-0 focus-visible:ring-0 leading-7 w-full placeholder:text-gray-500/40'
          onChange={(e) => {
            _setContent(e.target.value);
          }}
          value={_content}
          placeholder={t('submitPlaceholder') as string}
          onKeyDown={handleKeyDown}
          rows={1}
        ></textarea>
      </div>
      {typeAI == 1 ?
        <div className='image-ai-overlay'>
          <div className='ratio-choice'>
            <span>{ t("ratioChoice") }:</span>
            <div>
              <input name='ratio' type="radio" id="3x2" onClick={() => handleRatio(3, 2)} defaultChecked={ratioX == 3 && ratioY == 2} />
              <label htmlFor="3x2"> 3:2</label>
            </div>
            <div>
              <input name='ratio' type="radio" id="2x3" onClick={() => handleRatio(2, 3)} defaultChecked={ratioX == 2 && ratioY == 3} />
              <label htmlFor="2x3"> 2:3</label>
            </div>
            <div>
              <input name='ratio' type="radio" id="4x3" onClick={() => handleRatio(4, 3)} defaultChecked={ratioX == 4 && ratioY == 3} />
              <label htmlFor="4x3"> 4:3</label>
            </div>
            <div>
              <input name='ratio' type="radio" id="3x4" onClick={() => handleRatio(3, 4)} defaultChecked={ratioX == 3 && ratioY == 4} />
              <label htmlFor="3x4"> 3:4</label>
            </div>
            <div>
              <input name='ratio' type="radio" id="16x9" onClick={() => handleRatio(16, 9)} defaultChecked={ratioX == 16 && ratioY == 9} />
              <label htmlFor="16x9"> 16:9</label>
            </div>
            <div>
              <input name='ratio' type="radio" id="9x16" onClick={() => handleRatio(9, 16)} defaultChecked={ratioX == 9 && ratioY == 16} />
              <label htmlFor="9x16"> 9:16</label>
            </div>
            {/* <div>
              <input name='ratio' type="radio" id="16x10" onClick={() => handleRatio(16, 10)} defaultChecked={ratioX == 16 && ratioY == 10} />
              <label htmlFor="16x10"> 16:10</label>
            </div>
            <div>
              <input name='ratio' type="radio" id="10x16" onClick={() => handleRatio(10, 16)} defaultChecked={ratioX == 10 && ratioY == 16} />
              <label htmlFor="10x16"> 10:16</label>
            </div> */}
          </div>
          <div className='image-preview'>
            {/* <img src="/logo_planx.jpg" alt="" style={{width: (ratioX>ratioY)? previewWidth+"px" : ratioX/ratioY*previewWidth+"px", height: (ratioX>ratioY)? ratioY/ratioX*previewWidth+"px" : previewWidth+"px" }}  /> */}
            <div className='striped-div' style={{width: (ratioX>ratioY)? previewWidth+"px" : ratioX/ratioY*previewWidth+"px", height: (ratioX>ratioY)? ratioY/ratioX*previewWidth+"px" : previewWidth+"px" }}></div>
          </div>
        </div>
        :
        <></>
      }
      <EditViewButtons
        sticky={sticky}
        handleSaveAndSubmit={handleSaveAndSubmit}
        handleSave={handleSave}
        setIsModalOpen={setIsModalOpen}
        setIsEdit={setIsEdit}
        _setContent={_setContent}
      />
      {isModalOpen && (
        <PopupModal
          setIsModalOpen={setIsModalOpen}
          title={t('alert') as string}
          message={t('outOfTokens') as string}
        // handleConfirm={handleSaveAndSubmit}
        />
      )}
    </>
  );
};

const EditViewButtons = memo(
  ({
    sticky = false,
    handleSaveAndSubmit,
    handleSave,
    setIsModalOpen,
    setIsEdit,
    _setContent,
  }: {
    sticky?: boolean;
    handleSaveAndSubmit: () => void;
    handleSave: () => void;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    _setContent: React.Dispatch<React.SetStateAction<string>>;
  }) => {
    const { t } = useTranslation();
    const generating = useStore.getState().generating;
    const advancedMode = useStore((state) => state.advancedMode);

    return (
      <div className='flex'>
        <div className='flex-1 text-center mt-2 flex justify-center'>
          {sticky && (
            <button
              className={`btn relative mr-2 btn-primary ${generating ? 'cursor-not-allowed opacity-40' : ''
                }`}
              onClick={handleSaveAndSubmit}
            >
              <div className='flex items-center justify-center gap-2'>
                {t('saveAndSubmit')}
              </div>
            </button>
          )}

          {/* <button
            className={`btn relative mr-2 ${
              sticky
                ? `btn-neutral ${
                    generating ? 'cursor-not-allowed opacity-40' : ''
                  }`
                : 'btn-primary'
            }`}
            onClick={handleSave}
          >
            <div className='flex items-center justify-center gap-2'>
              {t('save')}
            </div>
          </button> */}

          {sticky || (
            <button
              className='btn relative mr-2 btn-neutral'
              onClick={() => {
                !generating && setIsModalOpen(true);
              }}
            >
              <div className='flex items-center justify-center gap-2'>
                {t('saveAndSubmit')}
              </div>
            </button>
          )}

          {sticky || (
            <button
              className='btn relative btn-neutral'
              onClick={() => setIsEdit(false)}
            >
              <div className='flex items-center justify-center gap-2'>
                {t('cancel')}
              </div>
            </button>
          )}
        </div>
        {/* {sticky && advancedMode && <TokenCount />} */}
        {/* <CommandPrompt _setContent={_setContent} /> */}
      </div>
    );
  }
);

export default EditView;
