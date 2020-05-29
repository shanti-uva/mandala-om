import _ from "lodash";
import React, {useRef, useState} from "react";
import Card from "react-bootstrap/Card";

function TermAudioPlayer(props) {
    const audioRefs = _.filter(props.kmapchild._childDocuments_, (x) => {
        return x.block_child_type === "terms_recording"
    });

    const player = useRef();
    const defRecordingUrl = audioRefs[0]?.recording_url;

    const [audioUrl, setAudioUrl] = useState(defRecordingUrl);

    const option_list = _.map(audioRefs, (x) => <option
        value={x.recording_url}>{x.recording_dialect_s}</option>);
    const handleSelect = (e) => {
        setAudioUrl(e.target.value)
    }

    const playButton = (audioUrl) ? <>
            <button onClick={() => {
                player.current.play();
            }}><span>{'\ue60a'}</span>
            </button>
            <select onChange={e => handleSelect(e)}>{option_list}></select></>
        : "No Audio Available";

    return <Card>
        <div className={"sui-audioPlayer"}>
            <audio src={audioUrl} ref={ref => player.current = ref}/>
            <form onSubmit={(event) => {
                event.preventDefault();
                return false;
            }}>
                <Card.Body>
                    <Card.Title>Audio</Card.Title>
                    {playButton}
                </Card.Body>
            </form>
        </div>
    </Card>
}

export default TermAudioPlayer;