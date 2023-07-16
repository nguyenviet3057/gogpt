import React from 'react'
import ReactAudioPlayer from 'react-audio-player';

function AudioMP3(props: any) {

    const { src, autoPlay, index, handleMediaNum } = props;

    const handleEnded = () => {
        // console.log(index);
        handleMediaNum(index + 1);
    }

    return (
        <>
            <ReactAudioPlayer
                src={src}
                autoPlay={autoPlay}
                preload={autoPlay ? 'metadata' : 'none'}
                controls
                onEnded={handleEnded}
            />
            {/* <audio autoPlay={autoPlay} controls preload={autoPlay ? 'metadata' : 'none'}>
                <source src={src} type="audio/ogg" />
                <source src={src} type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio> */}
        </>
    )
}

export default AudioMP3