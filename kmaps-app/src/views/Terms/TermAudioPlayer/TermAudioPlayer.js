import _ from 'lodash';
import React, { useRef, useState } from 'react';
import './TermAudioPlayer.css';

function TermAudioPlayer(props) {
    const audioRefs = _.filter(props.kmap._childDocuments_, (x) => {
        return x.block_child_type === 'terms_recording';
    });

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

    const playButton = audioUrl ? (
        <>
            <button
                className="sui-audioPlayer__button"
                onClick={() => {
                    player.current.play();
                }}
            >
                <span className="sui-audioPlayer__icon">{'\ue60a'}</span>
            </button>
            <select
                className="sui-audioPlayer__select"
                onChange={(e) => handleSelect(e)}
            >
                {option_list}
            </select>
        </>
    ) : (
        'No Audio Available'
    );

    return (
        <div className="sui-audioPlayer">
            <audio src={audioUrl} ref={(ref) => (player.current = ref)} />
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    return false;
                }}
            >
                <div className="sui-audioPlayer__title">Audio</div>
                {playButton}
            </form>
        </div>
    );
}

export default TermAudioPlayer;
