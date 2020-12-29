import _ from 'lodash';
import React, { useRef, useState } from 'react';
import './TermAudioPlayer.css';

const TermAudioPlayer = React.memo(function (props) {
    const audioRefs = _.filter(props.kmap?._childDocuments_, (x) => {
        return x.block_child_type === 'terms_recording';
    });
    console.log('GerardKetumaAudio', audioRefs);

    const player = useRef();
    const defRecordingUrl = audioRefs[0]?.recording_url;

    const [audioUrl, setAudioUrl] = useState(defRecordingUrl);

    const option_list = _.map(audioRefs, (x, i) => (
        <option key={i} value={x.recording_url}>
            {x.recording_dialect_s}
        </option>
    ));
    const handleSelect = (e) => {
        setAudioUrl(e.target.value);
    };

    const playButton = !_.isEmpty(audioUrl) ? (
        <>
            <button
                className="c-audioPlayer__button"
                onClick={() => {
                    player.current.play();
                }}
            >
                <span className="icon u-icon__audio"></span>
            </button>
            <div class={'c-audioPlayer__select--wrapper'}>
                <select
                    className="c-audioPlayer__select"
                    onChange={(e) => handleSelect(e)}
                >
                    {option_list}
                </select>
            </div>
        </>
    ) : null;

    return (
        <div className="c-audioPlayer">
            <audio
                preload="none"
                src={audioUrl}
                ref={(ref) => (player.current = ref)}
            />
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    return false;
                }}
            >
                {playButton}
            </form>
        </div>
    );
});

export default TermAudioPlayer;
