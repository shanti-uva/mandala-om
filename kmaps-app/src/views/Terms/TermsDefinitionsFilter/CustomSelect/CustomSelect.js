import React, { useState } from 'react';
import { generatePath } from 'react-router';
import { useHistory, useParams } from 'react-router-dom';
import _ from 'lodash';
import ReactHtmlParser from 'react-html-parser';
import './CustomSelect.css';

const CustomSelect = (props) => {
    const [show, setShow] = useState(false);
    const [selectedID, setSelectedID] = useState(props.defID ?? 'any');
    const history = useHistory();
    let params = useParams();

    const options = props.definitions;

    // Find the object that matches the selectedOption.
    const selectedOption = _.find(options, ['id', selectedID]) ?? {
        id: 'any',
        text: `-- Any --`,
    };

    const changeSelected = (event) => {
        const clickedSelID = event.target.getAttribute('data-value');
        setSelectedID(clickedSelID);
        const newParams = { ...params, definitionID: clickedSelID };
        const path = generatePath(
            `/:viewerType/:id/related-:relatedType/:definitionID/:viewMode`,
            newParams
        );
        history.push(path);
    };

    return (
        <div className="custSelect__component">
            <div className="custSelect__header">
                <div className="custSelect__header-title">
                    Filter by Definition:
                </div>
                <div className="custSelect__header-link">
                    <a href="#">&gt; View all Definitions</a>
                </div>
            </div>
            <div className="custSelect__wrapper">
                <div
                    className={`custSelect__main ${
                        show ? 'cs_open' : 'cs_close'
                    }`}
                    onClick={() => setShow(!show)}
                >
                    <div className="custSelect__trigger">
                        <span className="custSelect__selected_item">
                            {ReactHtmlParser(selectedOption.text)}
                        </span>
                        <div className="custSelect__arrow" />
                    </div>
                    <div className="custSelect__options">
                        <span
                            className={`custSelect__option${
                                selectedID === 'any' ? ' cs_selected' : ''
                            }`}
                            data-value="any"
                            onClick={changeSelected}
                        >
                            -- Any --
                        </span>
                        {options.map((option) => (
                            <span
                                key={option.id}
                                className={`custSelect__option${
                                    option.id.includes(selectedID)
                                        ? ' cs_selected'
                                        : ''
                                }`}
                                data-value={option.id}
                                onClick={changeSelected}
                            >
                                {ReactHtmlParser(option.text)}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomSelect;
