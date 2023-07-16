import React from 'react'
import ReactAudioPlayer from 'react-audio-player';

function AudioMP3(props: any) {

    const { src, autoPlay } = props; 

    return (
        <>
            <ReactAudioPlayer
                src={src}
                autoPlay={autoPlay}
                controls
            />
        </>
    )
}

export default AudioMP3