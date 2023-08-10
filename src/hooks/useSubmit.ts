import React, { useContext } from 'react';
import useStore from '@store/store';
import { useTranslation } from 'react-i18next';
import { ChatInterface, MessageInterface } from '@type/chat';
import { getChatCompletion, getChatCompletionStream } from '@api/api';
import { parseEventSource } from '@api/helper';
import { limitMessageTokens, updateTotalTokenUsed } from '@utils/messageUtils';
import { _defaultChatConfig } from '@constants/chat';
import { officialAPIEndpoint } from '@constants/auth';
import { AppConfig } from '@constants/config';
import { load } from 'react-cookies';

class ObjectMessageContent {
  type: string;
  status: number
  content?: string;
  task_id?: string;
  ratio_x?: number;
  ratio_y?: number

  constructor() {
    this.type = "message";
    this.status = 1;
  }
}

const useSubmit = () => {
  // const { t, i18n } = useTranslation('api');
  const { i18n } = useTranslation('api');
  const { t } = useTranslation();
  const error = useStore((state) => state.error);
  const setError = useStore((state) => state.setError);
  const apiEndpoint = useStore((state) => state.apiEndpoint);
  const apiKey = AppConfig.CHATGPT_API_KEY;
  const setGenerating = useStore((state) => state.setGenerating);
  const generating = useStore((state) => state.generating);
  const currentChatIndex = useStore((state) => state.currentChatIndex);
  const setChats = useStore((state) => state.setChats);
  const setLastToken = useStore((state) => state.setLastToken);

  const generateTitle = async (
    message: MessageInterface[]
  ): Promise<string> => {
    let data;
    if (!apiKey || apiKey.length === 0) {
      // official endpoint
      // if (apiEndpoint === officialAPIEndpoint) {
      //   throw new Error(t('noApiKeyWarning') as string);
      // }

      // other endpoints
      data = await getChatCompletion(
        useStore.getState().apiEndpoint,
        message,
        _defaultChatConfig
      );
    } else if (apiKey) {
      // own apikey
      data = await getChatCompletion(
        // useStore.getState().apiEndpoint,
        AppConfig.CHATGPT_API_ENDPOINT,
        message,
        _defaultChatConfig,
        AppConfig.CHATGPT_API_KEY
      );
    }
    return data.choices[0].message.content;
  };

  const handleSubmit = async (typeAI: Number, ratioXY?: Array<number>) => {
    const chats = useStore.getState().chats;
    if (generating || !chats) return;

    const updatedChats: ChatInterface[] = JSON.parse(JSON.stringify(chats));

    updatedChats[currentChatIndex].messages.push({
      role: 'assistant',
      content: '',
    });

    setChats(updatedChats);
    setGenerating(true);

    let waitForUpload: NodeJS.Timeout;

    switch (typeAI) {
      case 0:
        try {
          let stream;
          if (chats[currentChatIndex].messages.length === 0)
            throw new Error('No messages submitted!');

          const messages = limitMessageTokens(
            chats[currentChatIndex].messages,
            chats[currentChatIndex].config.max_tokens,
            chats[currentChatIndex].config.model
          );
          if (messages.length === 0) throw new Error('Message exceed max token!');

          // no api key (free)
          if (!apiKey || apiKey.length === 0) {
            // official endpoint
            // if (apiEndpoint === officialAPIEndpoint) {
            //   throw new Error(t('noApiKeyWarning') as string);
            // }

            // other endpoints
            stream = await getChatCompletionStream(
              AppConfig.CHATGPT_API_ENDPOINT,
              messages,
              chats[currentChatIndex].config
            );
          } else if (apiKey) {
            // own apikey
            stream = await getChatCompletionStream(
              AppConfig.CHATGPT_API_ENDPOINT,
              messages,
              chats[currentChatIndex].config,
              AppConfig.CHATGPT_API_KEY
            );
          }

          if (stream) {
            if (stream.locked)
              throw new Error(
                'Oops, the stream is locked right now. Please try again'
              );
            const reader = stream.getReader();
            let reading = true;
            let partial = '';
            while (reading && useStore.getState().generating) {
              const { done, value } = await reader.read();
              const result = parseEventSource(
                partial + new TextDecoder().decode(value)
              );
              partial = '';

              if (result === '[DONE]' || done) {
                reading = false;
              } else {
                const resultString = result.reduce((output: string, curr) => {
                  if (typeof curr === 'string') {
                    partial += curr;
                  } else {
                    const content = curr.choices[0].delta.content;
                    if (content) output += content;
                  }
                  return output;
                }, '');

                const updatedChats: ChatInterface[] = JSON.parse(
                  JSON.stringify(useStore.getState().chats)
                );
                const updatedMessages = updatedChats[currentChatIndex].messages;
                updatedMessages[updatedMessages.length - 1].content += resultString;
                setChats(updatedChats);
              }
            }
            if (useStore.getState().generating) {
              reader.cancel('Cancelled by user');
            } else {
              reader.cancel('Generation completed');
            }
            reader.releaseLock();
            stream.cancel();
          }

          createMessage();

          // update tokens used in chatting
          const currChats = useStore.getState().chats;
          const countTotalTokens = useStore.getState().countTotalTokens;

          if (currChats && countTotalTokens) {
            const model = currChats[currentChatIndex].config.model;
            const messages = currChats[currentChatIndex].messages;
            updateTotalTokenUsed(
              model,
              messages.slice(0, -1),
              messages[messages.length - 1]
            );
          }

          // generate title for new chats
          if (
            useStore.getState().autoTitle &&
            currChats &&
            !currChats[currentChatIndex]?.titleSet
          ) {
            const messages_length = currChats[currentChatIndex].messages.length;
            const assistant_message =
              currChats[currentChatIndex].messages[messages_length - 1].content;
            const user_message =
              currChats[currentChatIndex].messages[messages_length - 2].content;

            const message: MessageInterface = {
              role: 'user',
              content: `Generate a title in less than 6 words for the following message (language: ${i18n.language}):\n"""\nUser: ${user_message}\nAssistant: ${assistant_message}\n"""`,
            };

            let title = (await generateTitle([message])).trim();
            if (title.startsWith('"') && title.endsWith('"')) {
              title = title.slice(1, -1);
            }
            const updatedChats: ChatInterface[] = JSON.parse(
              JSON.stringify(useStore.getState().chats)
            );
            updatedChats[currentChatIndex].title = title;
            updatedChats[currentChatIndex].titleSet = true;

            updateMessage(updatedChats);

            setChats(updatedChats);

            // update tokens used for generating title
            if (countTotalTokens) {
              const model = currChats[currentChatIndex].config.model;
              updateTotalTokenUsed(model, [message], {
                role: 'assistant',
                content: title,
              });
            }
          }

          setGenerating(false);
        } catch (e: unknown) {
          const err = (e as Error).message;
          console.log(err);
          setError(err);
        }
        break;
      case 1:
        try {
          let currentChat: ChatInterface = JSON.parse(
            JSON.stringify(useStore.getState().chats)
          )[currentChatIndex];

          var myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

          var urlencoded = new URLSearchParams();
          urlencoded.append("Authorization", `Bearer ${load("access_token")}`);
          urlencoded.append("chat_id", currentChat.id);
          urlencoded.append("role", currentChat.messages.at(-2) ? currentChat.messages.at(-2)!.role : "");
          urlencoded.append("content", currentChat.messages.at(-2) ? currentChat.messages.at(-2)!.content : "");
          urlencoded.append("ratio_x", ratioXY ? String(ratioXY[0]) : "1");
          urlencoded.append("ratio_y", ratioXY ? String(ratioXY[1]) : "1");

          var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded
          };

          await fetch(AppConfig.BASE_URL + AppConfig.TXT2IMG, requestOptions)
            .then(response => {
              // console.log(response);
              return response.json()
            })
            .then(result => {
              const updatedChats: ChatInterface[] = JSON.parse(
                JSON.stringify(useStore.getState().chats)
              );
              // console.log(result);
              const updatedMessages = updatedChats[currentChatIndex].messages;

              let status = result.status;
              const task_id = result.task_id;
              if (status == 1) {
                let objectContent = new ObjectMessageContent();
                objectContent.type = "image";
                objectContent.status = 0;
                objectContent.content = t("imageRunning") as string;
                objectContent.task_id = task_id;
                objectContent.ratio_x = ratioXY ? ratioXY[0] : undefined;
                objectContent.ratio_y = ratioXY ? ratioXY[1] : undefined;
                updatedMessages[updatedMessages.length - 1].content = JSON.stringify(objectContent);
                setChats(updatedChats);

                const checkQueue = setInterval(() => {
                  if (!useStore.getState().generating) {
                    if (waitForUpload) clearTimeout(waitForUpload);
                    clearInterval(checkQueue);
                    createMessage();
                    return;
                  }

                  var myHeaders = new Headers();
                  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                  var urlencoded = new URLSearchParams();
                  urlencoded.append("Authorization", `Bearer ${load("access_token")}`);
                  urlencoded.append("task_id", task_id);

                  var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: urlencoded
                  };

                  fetch(AppConfig.BASE_URL + AppConfig.QUEUE_STATUS, requestOptions)
                    .then(response => {
                      // console.log(response);
                      return response.json()
                    })
                    .then(result => {
                      if (result.status == -1) {
                        let objectContent = new ObjectMessageContent();
                        objectContent.type = "image";
                        updatedMessages[updatedMessages.length - 1].content = t("finishing") as string;
                        setChats(updatedChats);
                        objectContent.status = 1;
                        objectContent.content = AppConfig.BASE_URL + AppConfig.GET_IMAGE + task_id;
                        objectContent.task_id = task_id;
                        objectContent.ratio_x = ratioXY ? ratioXY[0] : undefined;
                        objectContent.ratio_y = ratioXY ? ratioXY[1] : undefined;
                        waitForUpload = setTimeout(() => {
                          // if (!useStore.getState().generating) {
                          //   return;
                          // }
                          updatedMessages[updatedMessages.length - 1].content = JSON.stringify(objectContent);
                          setChats(updatedChats);
                          createMessage();
                          setGenerating(false);
                        }, 3000);
                        clearInterval(checkQueue);
                      }
                    })
                }, 2000);
              }
              if (status == 2) {
                let objectContent = new ObjectMessageContent();
                objectContent.type = "image";
                objectContent.status = 0;
                objectContent.content = t("imagePending") + result.priority + "/" + result.total + " " + t("queueTotal");
                objectContent.task_id = task_id;
                objectContent.ratio_x = ratioXY ? ratioXY[0] : undefined;
                objectContent.ratio_y = ratioXY ? ratioXY[1] : undefined;
                updatedMessages[updatedMessages.length - 1].content = JSON.stringify(objectContent);
                setChats(updatedChats);

                const checkQueue = setInterval(() => {
                  if (!useStore.getState().generating) {
                    if (waitForUpload) clearTimeout(waitForUpload);
                    clearInterval(checkQueue);
                    createMessage();
                    return;
                  }

                  var myHeaders = new Headers();
                  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                  var urlencoded = new URLSearchParams();
                  urlencoded.append("Authorization", `Bearer ${load("access_token")}`);
                  urlencoded.append("task_id", task_id);

                  var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: urlencoded
                  };

                  fetch(AppConfig.BASE_URL + AppConfig.QUEUE_STATUS, requestOptions)
                    .then(response => {
                      // console.log(response);
                      return response.json()
                    })
                    .then(result => {
                      switch (result.status) {
                        case -1:
                          objectContent = new ObjectMessageContent();
                          objectContent.type = "image";
                          updatedMessages[updatedMessages.length - 1].content = t("finishing") as string;
                          setChats(updatedChats);
                          objectContent.status = 1;
                          objectContent.content = AppConfig.BASE_URL + AppConfig.GET_IMAGE + task_id;
                          objectContent.task_id = task_id;
                          objectContent.ratio_x = ratioXY ? ratioXY[0] : undefined;
                          objectContent.ratio_y = ratioXY ? ratioXY[1] : undefined;
                          waitForUpload = setTimeout(() => {
                            // if (!useStore.getState().generating) {
                            //   return;
                            // }
                            updatedMessages[updatedMessages.length - 1].content = JSON.stringify(objectContent);
                            setChats(updatedChats);
                            createMessage();
                            setGenerating(false);
                          }, 3000);
                          clearInterval(checkQueue);
                          break;
                        case 1:
                          objectContent.content = t("imageRunning") as string;
                          updatedMessages[updatedMessages.length - 1].content = JSON.stringify(objectContent);
                          setChats(updatedChats);
                          break;
                        case 2:
                          objectContent.content = t("imagePending") + result.priority + "/" + result.total + " " + t("queueTotal");
                          updatedMessages[updatedMessages.length - 1].content = JSON.stringify(objectContent);
                          setChats(updatedChats);
                          break;
                      }
                    })
                }, 2000);
              }

              // setChats(updatedChats);
              // setGenerating(false);
              // console.log("abc");
              // let currentChat: ChatInterface = JSON.parse(
              //   JSON.stringify(useStore.getState().chats)
              // )[currentChatIndex];
              // var myHeaders = new Headers();
              // myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

              // var urlencoded = new URLSearchParams();
              // urlencoded.append("Authorization", `Bearer ${load("access_token")}`);
              // urlencoded.append("id", currentChat.id);
              // urlencoded.append("config", JSON.stringify(currentChat.config));
              // urlencoded.append("title", currentChat.title);
              // urlencoded.append("titleSet", currentChat.titleSet ? "1" : "0");
              // urlencoded.append("chat_id", currentChat.id);
              // urlencoded.append("role", currentChat.messages.at(-1) ? currentChat.messages.at(-1)!.role : "");
              // urlencoded.append("content", currentChat.messages.at(-1) ? currentChat.messages.at(-1)!.content : "");
              // var requestOptions = {
              //   method: 'POST',
              //   headers: myHeaders,
              //   body: urlencoded
              // };
              // fetch(AppConfig.BASE_URL + AppConfig.CHAT_MESSAGE_CREATE, requestOptions)
              //   .then(response => {
              //     return response.status;
              //   })
              //   .catch(error => {
              //     console.error('Error:', error);
              //   })
            })
            .catch(error => {
              console.error('Error:', error);

              setGenerating(false);
            });

          const currChats = useStore.getState().chats;
          if (
            useStore.getState().autoTitle &&
            currChats &&
            !currChats[currentChatIndex]?.titleSet
          ) {
            const messages_length = currChats[currentChatIndex].messages.length;
            const assistant_message =
              currChats[currentChatIndex].messages[messages_length - 1].content;
            const user_message =
              currChats[currentChatIndex].messages[messages_length - 2].content;

            const message: MessageInterface = {
              role: 'user',
              content: `Generate a title in less than 6 words for the following message (language: ${i18n.language}):\n"""\nUser: ${user_message}\nAssistant: ${assistant_message}\n"""`,
            };

            let title = (await generateTitle([message])).trim();
            if (title.startsWith('"') && title.endsWith('"')) {
              title = title.slice(1, -1);
            }
            const updatedChats: ChatInterface[] = JSON.parse(
              JSON.stringify(useStore.getState().chats)
            );
            updatedChats[currentChatIndex].title = title;
            updatedChats[currentChatIndex].titleSet = true;

            updateMessage(updatedChats);

            setChats(updatedChats);
          }
        } catch (e: unknown) {
          const err = (e as Error).message;
          console.log(err);
          setError(err);
        }
        break;
      case 2:
        try {
          let messages = chats[currentChatIndex].messages;
          let prompt = messages[messages.length - 1].content

          var myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

          var urlencoded = new URLSearchParams();
          urlencoded.append("Authorization", `Bearer ${load("access_token")}`);
          urlencoded.append("prompt", prompt);

          var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded
          };

          fetch(AppConfig.BASE_URL + AppConfig.MEDIA_PLAYER, requestOptions)
            .then(response => {
              // console.log(response);
              return response.json()
            })
            .then(result => {
              const updatedChats: ChatInterface[] = JSON.parse(
                JSON.stringify(useStore.getState().chats)
              );
              // console.log(result);
              const updatedMessages = updatedChats[currentChatIndex].messages;
              updatedMessages[updatedMessages.length - 1].content = JSON.stringify(result);
              // console.log(updatedMessages[updatedMessages.length - 1].content);
              setChats(updatedChats);

              setGenerating(false);
              let currentChat: ChatInterface = JSON.parse(
                JSON.stringify(useStore.getState().chats)
              )[currentChatIndex];
              var myHeaders = new Headers();
              myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

              var urlencoded = new URLSearchParams();
              urlencoded.append("Authorization", `Bearer ${load("access_token")}`);
              urlencoded.append("id", currentChat.id);
              urlencoded.append("config", JSON.stringify(currentChat.config));
              urlencoded.append("title", currentChat.title);
              urlencoded.append("titleSet", currentChat.titleSet ? "1" : "0");
              urlencoded.append("chat_id", currentChat.id);
              urlencoded.append("role", currentChat.messages.at(-1) ? currentChat.messages.at(-1)!.role : "");
              urlencoded.append("content", currentChat.messages.at(-1) ? currentChat.messages.at(-1)!.content : "");
              var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: urlencoded
              };
              fetch(AppConfig.BASE_URL + AppConfig.CHAT_CREATE, requestOptions)
                .then(response => {
                  return response.status;
                })
                .catch(error => {
                  console.error('Error:', error);
                })
            })
            .catch(error => {
              console.error('Error:', error);

              setGenerating(false);
            });

          const currChats = useStore.getState().chats;
          if (
            useStore.getState().autoTitle &&
            currChats &&
            !currChats[currentChatIndex]?.titleSet
          ) {
            const messages_length = currChats[currentChatIndex].messages.length;
            const assistant_message =
              currChats[currentChatIndex].messages[messages_length - 1].content;
            const user_message =
              currChats[currentChatIndex].messages[messages_length - 2].content;

            const message: MessageInterface = {
              role: 'user',
              content: `Generate a title in less than 6 words for the following message (language: ${i18n.language}):\n"""\nUser: ${user_message}\nAssistant: ${assistant_message}\n"""`,
            };

            let title = (await generateTitle([message])).trim();
            if (title.startsWith('"') && title.endsWith('"')) {
              title = title.slice(1, -1);
            }
            const updatedChats: ChatInterface[] = JSON.parse(
              JSON.stringify(useStore.getState().chats)
            );
            updatedChats[currentChatIndex].title = title;
            updatedChats[currentChatIndex].titleSet = true;
            setChats(updatedChats);
          }
        } catch (e: unknown) {
          const err = (e as Error).message;
          console.log(err);
          setError(err);
        }
        break;
    }
  };

  const createMessage = async() => {
    let currentChat: ChatInterface = JSON.parse(
      JSON.stringify(useStore.getState().chats)
    )[currentChatIndex];
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("Authorization", `Bearer ${load("access_token")}`);
    urlencoded.append("chat_id", currentChat.id);
    urlencoded.append("role", currentChat.messages.at(-1) ? currentChat.messages.at(-1)!.role : "");
    urlencoded.append("content", currentChat.messages.at(-1) ? currentChat.messages.at(-1)!.content : "");
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded
    };
    fetch(AppConfig.BASE_URL + AppConfig.CHAT_MESSAGE_CREATE, requestOptions)
      .then(response => {
        return response.status;
      })
      .catch(error => {
        console.error('Error:', error);
      })
  }

  const updateMessage = async(updatedChats: ChatInterface[]) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("Authorization", `Bearer ${load("access_token")}`);
    urlencoded.append("id", updatedChats[currentChatIndex].id);
    urlencoded.append("config", JSON.stringify(updatedChats[currentChatIndex].config));
    urlencoded.append("title", updatedChats[currentChatIndex].title);
    urlencoded.append("titleSet", "1");
    if (updatedChats[currentChatIndex].folder) urlencoded.append("folder_id", updatedChats[currentChatIndex].folder!);

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
  }

  return { handleSubmit, error };
};

export default useSubmit;
