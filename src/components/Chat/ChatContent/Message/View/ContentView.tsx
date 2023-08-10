import React, {
  DetailedHTMLProps,
  HTMLAttributes,
  memo,
  useEffect,
  useState,
} from 'react';

import './ContentView.css';

import ReactMarkdown from 'react-markdown';
import { CodeProps, ReactMarkdownProps } from 'react-markdown/lib/ast-to-react';
import { RModalImages } from "react-modal-images";

import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import useStore from '@store/store';

import TickIcon from '@icon/TickIcon';
import CrossIcon from '@icon/CrossIcon';

import useSubmit from '@hooks/useSubmit';

import { ChatInterface } from '@type/chat';

import { codeLanguageSubset } from '@constants/chat';

import RefreshButton from './Button/RefreshButton';
import UpButton from './Button/UpButton';
import DownButton from './Button/DownButton';
import CopyButton from './Button/CopyButton';
import EditButton from './Button/EditButton';
import DeleteButton from './Button/DeleteButton';
import MarkdownModeButton from './Button/MarkdownModeButton';
import DownArrow from '@icon/DownArrow';

import CodeBlock from '../CodeBlock';
import AudioMP3 from '../../Media/AudioMP3';
import { AppConfig } from '@constants/config';
import { load } from 'react-cookies';
import EmbedIframe from '../../Media/EmbedIframe';
import { getSong, searchByKeyword } from 'nhaccuatui-api-full'
import { isEmpty, uniqueId } from 'lodash';
import PopupModal from '@components/PopupModal/PopupModal';
import { t } from 'i18next';
import BaseButton from './Button/BaseButton';

const ContentView = memo(
  ({
    role,
    content,
    setIsEdit,
    messageIndex,
  }: {
    role: string;
    content: string;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    messageIndex: number;
  }) => {
    const { handleSubmit } = useSubmit();

    const [isDelete, setIsDelete] = useState<boolean>(false);

    const [numFunction, setNumFunction] = useState(0);
    const [imageSrc, setImageSrc] = useState("");
    const [mediaSrc, setMediaSrc] = useState([]);
    const [mediaNum, setMediaNum] = useState(0);
    const lastToken = useStore((state) => state.lastToken);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [displayContent, setDisplayContent] = useState<string>("");
    const [contentStatus, setContentStatus] = useState<number>(1);
    const [ratioX, setRatioX] = useState<number>(1);
    const [ratioY, setRatioY] = useState<number>(1);
    const currentChatIndex = useStore((state) => state.currentChatIndex);

    useEffect(() => {
      // const isURL = (str: string) => {
      //   const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
      //   return urlPattern.test(str);
      // }

      let media_links: any = [];
      try {
        let data = JSON.parse(content);
        // const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
        // if (base64Regex.test(data)) {
        //   setNumFunction(1);
        //   setImageSrc(data.base64);
        // }
        if (data.type == "image") {
          setNumFunction(1);
          if (data.status == 1) {
            setImageSrc(data.content);
            setContentStatus(1);
          }
          else {
            setDisplayContent(data.content);
            setContentStatus(0);
          };
          setRatioX(data.ratio_x);
          setRatioY(data.ratio_y);
        }
        if (data.type == "media") {
          // setNumFunction(2);
          // data.songs.forEach(function (name: string) {
          //   if (!isURL(name)) {
          //     searchByKeyword(name).then(result => {
          //       console.log(result);
          //       if (!isEmpty(result.recommend.song)) {
          //         // console.log(result.recommend.song[0].key)
          //         getSong(result.recommend.song[0].key).then(data => {
          //           console.log(data)
          //           if (!isEmpty(data.song.streamUrls)) {
          //             console.log(data.song.streamUrls[0].streamUrl)
          //             media_links.push(data.song.streamUrls[0].streamUrl);
          //           }
          //         });
          //       } else if (!isEmpty(result.search.song.song)) {
          //         result.search.song.song.forEach(function (song: any) {
          //           if (song.title.toLowerCase() == name.toLowerCase() && song.dateCreate != 0 && song.dateRelease != 0) {
          //             // console.log(song.key)
          //             getSong(song.key).then(data => {
          //               console.log(data)
          //               if (!isEmpty(data.song.streamUrls)) {
          //                 console.log(data.song.streamUrls[0].streamUrl)
          //                 media_links.push(data.song.streamUrls[0].streamUrl);
          //               }
          //             });
          //             return;
          //           }
          //         });
          //       }
          //     })
          //   }
          // });
          // setMediaSrc(media_links)
          // console.log(data.media_links);
        }
        // console.log(numFunction);
      } catch (e: any) {
        setDisplayContent(content);
        setNumFunction(0);
      }
      // console.log(mediaNum);
      // console.log(content, numFunction, contentStatus)
    }, [mediaNum, content, numFunction, contentStatus]);

    const setChats = useStore((state) => state.setChats);
    const lastMessageIndex = useStore((state) =>
      state.chats ? state.chats[state.currentChatIndex].messages.length - 1 : 0
    );
    const inlineLatex = useStore((state) => state.inlineLatex);
    const markdownMode = useStore((state) => state.markdownMode);

    const handleDelete = () => {
      const updatedChats: ChatInterface[] = JSON.parse(
        JSON.stringify(useStore.getState().chats)
      );

      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

      var urlencoded = new URLSearchParams();
      urlencoded.append("Authorization", `Bearer ${load("access_token")}`);
      urlencoded.append("chat_id", updatedChats[currentChatIndex].id);
      urlencoded.append("index", String(messageIndex));
      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded
      };
      fetch(AppConfig.BASE_URL + AppConfig.CHAT_MESSAGE_DELETE, requestOptions)
        .then(response => {
          return response.status;
        })
        .catch(error => {
          console.error('Error:', error);
        })

      updatedChats[currentChatIndex].messages.splice(messageIndex, 1);
      setChats(updatedChats);
    };

    const handleMove = (direction: 'up' | 'down') => {
      const updatedChats: ChatInterface[] = JSON.parse(
        JSON.stringify(useStore.getState().chats)
      );
      const updatedMessages = updatedChats[currentChatIndex].messages;
      const temp = updatedMessages[messageIndex];
      if (direction === 'up') {
        updatedMessages[messageIndex] = updatedMessages[messageIndex - 1];
        updatedMessages[messageIndex - 1] = temp;
      } else {
        updatedMessages[messageIndex] = updatedMessages[messageIndex + 1];
        updatedMessages[messageIndex + 1] = temp;
      }
      setChats(updatedChats);
    };

    const handleMoveUp = () => {
      handleMove('up');
    };

    const handleMoveDown = () => {
      handleMove('down');
    };

    const handleRefresh = (numFunction: number) => {
      if (!lastToken) {
        const updatedChats: ChatInterface[] = JSON.parse(
          JSON.stringify(useStore.getState().chats)
        );
        const updatedMessages = updatedChats[currentChatIndex].messages;

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        var urlencoded = new URLSearchParams();
        urlencoded.append("Authorization", `Bearer ${load("access_token")}`);
        urlencoded.append("chat_id", updatedChats[currentChatIndex].id);
        urlencoded.append("index", String(messageIndex));
        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: urlencoded
        };
        fetch(AppConfig.BASE_URL + AppConfig.CHAT_MESSAGE_DELETE, requestOptions)
          .then(response => {
            return response.status;
          })
          .catch(error => {
            console.error('Error:', error);
          })

        updatedMessages.splice(updatedMessages.length - 1, 1);
        setChats(updatedChats);
        handleSubmit(numFunction, numFunction == 1 ? [ratioX, ratioY] : undefined);
      } else {
        setIsModalOpen(true);
      }
    };

    const handleCopy = () => {
      navigator.clipboard.writeText(content);
    };

    const handleMediaNum = (num: any) => {
      console.log(num);
      setMediaNum(num);
    }

    const handleDownloadImage = () => {
      if (imageSrc) {
        fetch(imageSrc)
          .then(response => response.blob())
          .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = uniqueId("planx_image_") + '.png'; // Tên tệp tải về
            link.click();
          })
          .catch(error => {
            console.error('Error downloading image:', error);
          });
      }
    };

    if (markdownMode) {
      switch (numFunction) {
        case 0:
          return (
            <>
              <div className='markdown prose w-full md:max-w-full break-words dark:prose-invert dark share-gpt-message'>
                <ReactMarkdown
                  remarkPlugins={[
                    remarkGfm,
                    [remarkMath, { singleDollarTextMath: inlineLatex }],
                  ]}
                  rehypePlugins={[
                    rehypeKatex,
                    [
                      rehypeHighlight,
                      {
                        detect: true,
                        ignoreMissing: true,
                        subset: codeLanguageSubset,
                      },
                    ],
                  ]}
                  linkTarget='_new'
                  components={{
                    code,
                    p,
                  }}
                >
                  {displayContent}
                </ReactMarkdown>
              </div>
              <div className='flex justify-end gap-2 w-full mt-2'>
                {isDelete || (
                  <>
                    {!useStore.getState().generating &&
                      role === 'assistant' &&
                      messageIndex === lastMessageIndex && (
                        <RefreshButton onClick={() => handleRefresh(numFunction)} />
                      )}
                    {!useStore.getState().generating ? <DeleteButton setIsDelete={setIsDelete} /> : <div style={{ height: "24px" }}></div>}
                  </>
                )}
                {isDelete && (
                  <>
                    <button
                      className='p-1 hover:text-white'
                      onClick={() => setIsDelete(false)}
                    >
                      <CrossIcon />
                    </button>
                    <button className='p-1 hover:text-white' onClick={handleDelete}>
                      <TickIcon />
                    </button>
                  </>
                )}
              </div>
              {isModalOpen && (
                <PopupModal
                  setIsModalOpen={setIsModalOpen}
                  title={t('alert') as string}
                  message={t('outOfTokens') as string}
                />
              )}
            </>
          )

        case 1:
          if (contentStatus == 1) return (
            <>
              <div className='markdown prose w-full md:max-w-full break-words dark:prose-invert dark share-gpt-message image-result'>
                <div>
                  {/* <img src={imageSrc} style={{ margin: "0px" }} /> */}
                  <RModalImages
                    small={imageSrc}
                    large={imageSrc}
                    hideZoomButton={true}
                    hideDownloadButton={true}
                  />
                </div>
              </div>
              <div className='flex justify-end gap-2 w-full mt-2'>
                {isDelete || (
                  <>
                    {!useStore.getState().generating && numFunction == 1 && <BaseButton icon={<DownArrow />} onClick={handleDownloadImage} />}
                    {!useStore.getState().generating &&
                      role === 'assistant' &&
                      messageIndex === lastMessageIndex && (
                        <RefreshButton onClick={() => handleRefresh(numFunction)} />
                      )}
                    {!useStore.getState().generating ? <DeleteButton setIsDelete={setIsDelete} /> : <div style={{ height: "24px" }}></div>}
                  </>
                )}
                {isDelete && (
                  <>
                    <button
                      className='p-1 hover:text-white'
                      onClick={() => setIsDelete(false)}
                    >
                      <CrossIcon />
                    </button>
                    <button className='p-1 hover:text-white' onClick={handleDelete}>
                      <TickIcon />
                    </button>
                  </>
                )}
              </div>
              {isModalOpen && (
                <PopupModal
                  setIsModalOpen={setIsModalOpen}
                  title={t('alert') as string}
                  message={t('outOfTokens') as string}
                />
              )}
            </>
          )
          else return (
            <>
              <div className='markdown prose w-full md:max-w-full break-words dark:prose-invert dark share-gpt-message'>
                <div>
                  <span className={useStore.getState().generating ? 'whitespace-pre-wrap image-generating' : 'whitespace-pre-wrap'}>{displayContent}</span>
                </div>
              </div>
              <div className='flex justify-end gap-2 w-full mt-2'>
                {isDelete || (
                  <>
                    {!useStore.getState().generating &&
                      role === 'assistant' &&
                      messageIndex === lastMessageIndex && (
                        <RefreshButton onClick={() => handleRefresh(numFunction)} />
                      )}
                    {!useStore.getState().generating ? <DeleteButton setIsDelete={setIsDelete} /> : <div style={{ height: "24px" }}></div>}
                  </>
                )}
                {isDelete && (
                  <>
                    <button
                      className='p-1 hover:text-white'
                      onClick={() => setIsDelete(false)}
                    >
                      <CrossIcon />
                    </button>
                    <button className='p-1 hover:text-white' onClick={handleDelete}>
                      <TickIcon />
                    </button>
                  </>
                )}
              </div>
              {isModalOpen && (
                <PopupModal
                  setIsModalOpen={setIsModalOpen}
                  title={t('alert') as string}
                  message={t('outOfTokens') as string}
                />
              )}
            </>
          )
      }
    } else {
      switch (numFunction) {
        case 0:
          return (
            <>
              <div className='markdown prose w-full md:max-w-full break-words dark:prose-invert dark share-gpt-message'>
                <ReactMarkdown
                  remarkPlugins={[
                    remarkGfm,
                    [remarkMath, { singleDollarTextMath: inlineLatex }],
                  ]}
                  rehypePlugins={[
                    rehypeKatex,
                    [
                      rehypeHighlight,
                      {
                        detect: true,
                        ignoreMissing: true,
                        subset: codeLanguageSubset,
                      },
                    ],
                  ]}
                  linkTarget='_new'
                  components={{
                    code,
                    p,
                  }}
                >
                  {displayContent}
                </ReactMarkdown>
              </div>
              <div className='flex justify-end gap-2 w-full mt-2'>
                {isDelete || (
                  <>
                    {!useStore.getState().generating &&
                      role === 'assistant' &&
                      messageIndex === lastMessageIndex && (
                        <RefreshButton onClick={() => handleRefresh(numFunction)} />
                      )}
                    {!useStore.getState().generating ? <DeleteButton setIsDelete={setIsDelete} /> : <div style={{ height: "24px" }}></div>}
                  </>
                )}
                {isDelete && (
                  <>
                    <button
                      className='p-1 hover:text-white'
                      onClick={() => setIsDelete(false)}
                    >
                      <CrossIcon />
                    </button>
                    <button className='p-1 hover:text-white' onClick={handleDelete}>
                      <TickIcon />
                    </button>
                  </>
                )}
              </div>
              {isModalOpen && (
                <PopupModal
                  setIsModalOpen={setIsModalOpen}
                  title={t('alert') as string}
                  message={t('outOfTokens') as string}
                />
              )}
            </>
          )
        case 1:
          if (contentStatus == 1) return (
            <>
              <div className='markdown prose w-full md:max-w-full break-words dark:prose-invert dark share-gpt-message image-result'>
                <div>
                  {/* <img src={imageSrc} style={{ margin: "0px" }} /> */}
                  <RModalImages
                    small={imageSrc}
                    large={imageSrc}
                    hideZoomButton
                  />
                </div>
              </div>
              <div className='flex justify-end gap-2 w-full mt-2'>
                {isDelete || (
                  <>
                    {!useStore.getState().generating && numFunction == 1 && <BaseButton icon={<DownArrow />} onClick={handleDownloadImage} />}
                    {!useStore.getState().generating &&
                      role === 'assistant' &&
                      messageIndex === lastMessageIndex && (
                        <RefreshButton onClick={() => handleRefresh(numFunction)} />
                      )}
                    {!useStore.getState().generating ? <DeleteButton setIsDelete={setIsDelete} /> : <div style={{ height: "24px" }}></div>}
                  </>
                )}
                {isDelete && (
                  <>
                    <button
                      className='p-1 hover:text-white'
                      onClick={() => setIsDelete(false)}
                    >
                      <CrossIcon />
                    </button>
                    <button className='p-1 hover:text-white' onClick={handleDelete}>
                      <TickIcon />
                    </button>
                  </>
                )}
              </div>
              {isModalOpen && (
                <PopupModal
                  setIsModalOpen={setIsModalOpen}
                  title={t('alert') as string}
                  message={t('outOfTokens') as string}
                />
              )}
            </>
          )
          else return (
            <>
              <div className='markdown prose w-full md:max-w-full break-words dark:prose-invert dark share-gpt-message'>
                <div>
                  <span className={useStore.getState().generating ? 'whitespace-pre-wrap image-generating' : 'whitespace-pre-wrap'}>{displayContent}</span>
                </div>
              </div>
              <div className='flex justify-end gap-2 w-full mt-2'>
                {isDelete || (
                  <>
                    {!useStore.getState().generating &&
                      role === 'assistant' &&
                      messageIndex === lastMessageIndex && (
                        <RefreshButton onClick={() => handleRefresh(numFunction)} />
                      )}
                    {!useStore.getState().generating ? <DeleteButton setIsDelete={setIsDelete} /> : <div style={{ height: "24px" }}></div>}
                  </>
                )}
                {isDelete && (
                  <>
                    <button
                      className='p-1 hover:text-white'
                      onClick={() => setIsDelete(false)}
                    >
                      <CrossIcon />
                    </button>
                    <button className='p-1 hover:text-white' onClick={handleDelete}>
                      <TickIcon />
                    </button>
                  </>
                )}
              </div>
              {isModalOpen && (
                <PopupModal
                  setIsModalOpen={setIsModalOpen}
                  title={t('alert') as string}
                  message={t('outOfTokens') as string}
                />
              )}
            </>
          )
      }
    }

    return <></>

    // return (
    //   <>
    //     <div className='markdown prose w-full md:max-w-full break-words dark:prose-invert dark share-gpt-message'>
    //       {markdownMode ?
    //         numFunction == 0 ?
    //           <ReactMarkdown
    //             remarkPlugins={[
    //               remarkGfm,
    //               [remarkMath, { singleDollarTextMath: inlineLatex }],
    //             ]}
    //             rehypePlugins={[
    //               rehypeKatex,
    //               [
    //                 rehypeHighlight,
    //                 {
    //                   detect: true,
    //                   ignoreMissing: true,
    //                   subset: codeLanguageSubset,
    //                 },
    //               ],
    //             ]}
    //             linkTarget='_new'
    //             components={{
    //               code,
    //               p,
    //             }}
    //           >
    //             {displayContent}
    //           </ReactMarkdown>
    //           :
    //           numFunction == 1 ?
    //             <div>
    //               <img src={imageSrc} style={{ margin: "0px" }} />
    //             </div>
    //             :
    //             <div>
    //               {
    //                 mediaSrc.map((src, index) => (
    //                   <>
    //                     <AudioMP3 handleMediaNum={handleMediaNum} key={index} index={index} src={src} autoPlay={index == mediaNum && messageIndex === lastMessageIndex} />
    //                     {/* <EmbedIframe handleMediaNum={handleMediaNum} key={index} index={index} name={name} autoPlay={index == mediaNum && messageIndex === lastMessageIndex} /> */}
    //                   </>
    //                 ))
    //               }
    //             </div>
    //         :
    //         numFunction == 0 ?
    //           <span className='whitespace-pre-wrap'>{displayContent}</span>
    //           :
    //           numFunction == 1 ?
    //             <div>
    //               <img src={imageSrc} style={{ margin: "0px" }} />
    //             </div>
    //             :
    //             <>
    //               {
    //                 mediaSrc.map((src, index) => {
    //                   <AudioMP3 handleMediaNum={handleMediaNum} key={index} index={index} src={src} autoPlay={index == mediaNum && messageIndex === lastMessageIndex} />
    //                   // <EmbedIframe handleMediaNum={handleMediaNum} key={index} index={index} name={name} autoPlay={index == mediaNum && messageIndex === lastMessageIndex} />
    //                 })
    //               }
    //             </>
    //       }
    //     </div>
    //     <div className='flex justify-end gap-2 w-full mt-2'>
    //       {isDelete || (
    //         <>
    //           {!useStore.getState().generating &&
    //             role === 'assistant' &&
    //             messageIndex === lastMessageIndex && (
    //               <RefreshButton onClick={() => handleRefresh(numFunction)} />
    //             )}
    //           {/* {messageIndex !== 0 && <UpButton onClick={handleMoveUp} />}
    //           {messageIndex !== lastMessageIndex && (
    //             <DownButton onClick={handleMoveDown} />
    //           )} */}

    //           {/* <MarkdownModeButton /> */}
    //           {/* <CopyButton onClick={handleCopy} /> */}
    //           {/* <EditButton setIsEdit={setIsEdit} /> */}
    //           {!useStore.getState().generating ? <DeleteButton setIsDelete={setIsDelete} /> : <div style={{ height: "24px" }}></div>}
    //         </>
    //       )}
    //       {isDelete && (
    //         <>
    //           <button
    //             className='p-1 hover:text-white'
    //             onClick={() => setIsDelete(false)}
    //           >
    //             <CrossIcon />
    //           </button>
    //           <button className='p-1 hover:text-white' onClick={handleDelete}>
    //             <TickIcon />
    //           </button>
    //         </>
    //       )}
    //     </div>
    //     {isModalOpen && (
    //       <PopupModal
    //         setIsModalOpen={setIsModalOpen}
    //         title={t('alert') as string}
    //         message={t('outOfTokens') as string}
    //       // handleConfirm={handleSaveAndSubmit}
    //       />
    //     )}
    //   </>
    // );
  }
);

const code = memo((props: CodeProps) => {
  const { inline, className, children } = props;
  const match = /language-(\w+)/.exec(className || '');
  const lang = match && match[1];

  if (inline) {
    return <code className={className}>{children}</code>;
  } else {
    return <CodeBlock lang={lang || 'text'} codeChildren={children} />;
  }
});

const p = memo(
  (
    props?: Omit<
      DetailedHTMLProps<
        HTMLAttributes<HTMLParagraphElement>,
        HTMLParagraphElement
      >,
      'ref'
    > &
      ReactMarkdownProps
  ) => {
    return <p className='whitespace-pre-wrap'>{props?.children}</p>;
  }
);

export default ContentView;
