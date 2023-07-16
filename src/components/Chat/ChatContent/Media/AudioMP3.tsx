import React from 'react'
import ReactAudioPlayer from 'react-audio-player';

function AudioMP3(props: any) {

    const { src, autoPlay } = props;

    return (
        <>
            {/* <audio
                src={src}
                autoPlay={autoPlay}
                controls
            /> */}
            <audio autoPlay={autoPlay} controls>
                <source src={src} type="audio/ogg" />
                <source src={src} type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>
        </>
    )
}

export default AudioMP3