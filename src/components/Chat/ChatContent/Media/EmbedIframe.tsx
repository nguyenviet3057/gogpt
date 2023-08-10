import React, { useEffect, useState } from 'react'
import { getSong, searchByKeyword } from 'nhaccuatui-api-full'
import { isEmpty } from 'lodash';
import AudioMP3 from './AudioMP3';

function EmbedIframe(props: any) {
    const { name, autoPlay, index, handleMediaNum } = props;
    const [url, setUrl] = useState("");
    const [hide, setHide] = useState(true);

    useEffect(() => {
        if (autoPlay) {
            searchByKeyword(name).then(result => {
                console.log(result);
                if (!isEmpty(result.recommend.song)) {
                    // console.log(result.recommend.song[0].key)
                    getSong(result.recommend.song[0].key).then(data => {
                        console.log(data)
                        if (!isEmpty(data.song.streamUrls)) {
                            console.log(data.song.streamUrls[0].streamUrl)
                            setUrl("http://localhost:8000/api/audio/?url=" + encodeURIComponent(data.song.streamUrls[0].streamUrl));
                            setHide(false);
                        }
                    });
                    // setUrl("https://www.nhaccuatui.com/mh/normal/" + result.recommend.song[0].key);
                    // setHide(false);
                } else if (!isEmpty(result.search.song.song)) {
                    result.search.song.song.forEach(function (song: any) {
                        if (song.title.toLowerCase() == name.toLowerCase() && song.dateCreate != 0 && song.dateRelease != 0) {
                            // console.log(song.key)
                            getSong(song.key).then(data => {
                                console.log(data)
                                if (!isEmpty(data.song.streamUrls)) {
                                    console.log(data.song.streamUrls[0].streamUrl)
                                    setUrl(data.song.streamUrls[0].streamUrl);
                                    setHide(false);
                                }
                            });
                            // setUrl("https://www.nhaccuatui.com/mh/normal/" + song.key);
                            // setHide(false);
                            return;
                        }
                    });
                }
                // setTimeout(() => handleMediaNum(index + 1), 5000);
            })
        }
    }, [autoPlay]);

    return (
        // <iframe src={url} style={hide ? { display: "none" } : { width: "316px", height: "381px", borderRadius: "9px" }} frameBorder={"none"}></iframe>
        <>
            {hide ?
            <></>
            :
            <AudioMP3 style={hide ? { display: "none" } : {} } handleMediaNum={handleMediaNum} key={index} index={index} src={url} autoPlay={autoPlay} />
            }
        </>
    )
}

export default EmbedIframe