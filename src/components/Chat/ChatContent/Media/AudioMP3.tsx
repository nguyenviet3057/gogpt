import React, { useEffect, useRef } from 'react'
import ReactAudioPlayer from 'react-audio-player';

function AudioMP3(props: any) {

    const { src, autoPlay, index, handleMediaNum } = props;

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        console.log(autoPlay);
        if (audioRef.current && !autoPlay) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        } 
    }, [autoPlay]);

    const handleEnded = () => {
        // console.log(index);
        handleMediaNum(index + 1);
    }

    const handlePlay = () => {
        // console.log(index);
        handleMediaNum(index);
    }

    return (
        <>
            {/* <ReactAudioPlayer
                src={src}
                autoPlay={autoPlay}
                preload={autoPlay ? 'metadata' : 'none'}
                controls
                onEnded={handleEnded}
            /> */}
            <audio ref={audioRef} autoPlay={autoPlay} controls preload={autoPlay ? 'metadata' : 'none'} onEnded={handleEnded} onPlay={handlePlay}>
                <source src={"http://localhost:8000/api/audio/?url=" + encodeURIComponent(src)} type="audio/ogg" />
                <source src={"http://localhost:8000/api/audio/?url=" + encodeURIComponent(src)} type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>
        </>
    )
}

export default AudioMP3