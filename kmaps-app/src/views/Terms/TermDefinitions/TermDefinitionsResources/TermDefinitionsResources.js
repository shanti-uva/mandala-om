import React from 'react';
import Button from 'react-bootstrap/Button';
import './TermDefinitionsResources.css';

const TermDefinitionsResources = ({ defID, resCounts }) => {
    const resources = resCounts[defID];
    if (!resources) {
        return (
            <div className="sui-termDefResource__wrapper">
                No resources are currently tagged with this definition.
            </div>
        );
    }

    return (
        <div className="sui-termDefResource__wrapper">
            <div className="sui-termDefResource__header">
                Resources tagged with this definition:
            </div>
            <div className="sui-termDefResource__content">
                {Object.keys(resources)
                    .filter((key) => key !== 'all')
                    .map((key) => (
                        <Button key={key} variant="outline-dark" size="lg">
                            <span
                                className={`sui-color-${key} shanticon-${key} icon`}
                            ></span>
                            <span className="btn-text">
                                {key.toUpperCase()}
                            </span>{' '}
                            <span className="badge badge-light">
                                {resources[key]}
                            </span>
                        </Button>
                    ))}
            </div>
        </div>
    );
};

export default TermDefinitionsResources;
