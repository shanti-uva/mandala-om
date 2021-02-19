import React from 'react';
import { useQuery } from '../../hooks/utils';
const TextsViewer = React.lazy(() => import('../../views/Texts/TextsViewer'));
const AudioVideoViewer = React.lazy(() =>
    import('../../views/AudioVideo/AudioVideoViewer')
);
const ImagesViewer = React.lazy(() =>
    import('../../views/Images/ImagesViewer')
);
const SourcesViewer = React.lazy(() =>
    import('../../views/Sources/SourcesViewer')
);
const VisualsViewer = React.lazy(() =>
    import('../../views/Visuals/VisualsViewer')
);

export default function TermsRelatedNodes() {
    const query = useQuery();

    let viewer = null;
    switch (query.get('asset_type')) {
        case `texts`:
            viewer = <TextsViewer inline={true} />;
            break;
        case `audio-video`:
            viewer = <AudioVideoViewer sui={window.sui} />;
            break;
        case `images`:
            viewer = <ImagesViewer inline={true} />;
            break;
        case `sources`:
            viewer = <SourcesViewer inline={true} />;
            break;
        case `visuals`:
            viewer = <VisualsViewer inline={true} />;
            break;
        default:
            break;
    }

    return <>{viewer}</>;
}
