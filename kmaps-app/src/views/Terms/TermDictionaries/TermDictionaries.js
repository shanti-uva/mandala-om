import React from 'react';
import ReactHtmlParser from 'react-html-parser';
import './TermDictionaries.css';

const TermDictionaries = ({ definitions }) => {
    return (
        <div className="sui-termDicts__wrapper">
            <div className="sui-termDicts__title">Other Dictionaries</div>
            <div className="sui-termDicts__content">
                {Object.keys(definitions).map((key, i) => (
                    <React.Fragment key={key}>
                        <div className="sui-termDicts__dict-name">
                            {i + 1}. {key}
                        </div>
                        <ul className="sui-termDicts__dict-wrapper">
                            {definitions[key].map((dict) => (
                                <li
                                    className="sui-termDicts__dict"
                                    key={dict.id}
                                >
                                    {ReactHtmlParser(
                                        dict.related_definitions_content_s.replace(
                                            /(<p[^>]+?>|<p>|<\/p>)/gim,
                                            ''
                                        )
                                    )}
                                    {dict.related_definitions_language_s && (
                                        <div className="sui-termDicts__dict-extra">
                                            <span className="sui-termDicts__dict-extra-lang">
                                                Language:
                                            </span>{' '}
                                            <span className="sui-termDicts__dict-extra-lang-text">
                                                {
                                                    dict.related_definitions_language_s
                                                }
                                            </span>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default TermDictionaries;
