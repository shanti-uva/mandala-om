import React, { useState, useEffect } from 'react';
import { ADVANCED_LABEL, BASIC_LABEL } from '../../App';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { BsMap, BsSearch, ImTree } from 'react-icons/all';
import './MainSearchToggle.scss';

export function AdvancedToggle(props) {
    const [mode, setMode] = useState(props.viewMode || 'off'); // "search" | "tree" | "off"

    const chooseViewMode =
        props.chooseViewMode ||
        (() => {
            alert('No chooseViewMode handler:  mode = ' + mode);
        });

    useEffect(() => {
        chooseViewMode(mode);
    }, [mode]);

    return (
        <ToggleButtonGroup
            name="Georgie"
            value={mode}
            type={'radio'}
            className={'c-MainSearchToggle--group'}
        >
            <ToggleButton
                name={'viewMode'}
                value={'tree'}
                type={'radio'}
                className={'c-MainSearchToggle--button'}
                onClick={(evt) => {
                    if (evt.target.value === 'tree') {
                        if (mode === 'tree') {
                            setMode('off');
                        } else {
                            setMode('tree');
                        }
                        evt.stopPropagation();
                        return false;
                    }
                }}
            >
                <ImTree></ImTree>
            </ToggleButton>
            <ToggleButton
                name={'viewMode'}
                value={'advanced'}
                type={'radio'}
                className={'c-MainSearchToggle--button'}
                onClick={(evt) => {
                    if (evt.target.value === 'advanced') {
                        if (mode === 'advanced') {
                            setMode('off');
                        } else {
                            setMode('advanced');
                        }
                        evt.stopPropagation();
                        return false;
                    }
                }}
            >
                <BsSearch></BsSearch>
            </ToggleButton>
        </ToggleButtonGroup>
    );
}
