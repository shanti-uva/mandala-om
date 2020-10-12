/* 	AUDIO VIDEO PAGES ****************************************************************************************************************************

	This module puts up the audio video pages based on a kmap from SOLR. It uses the Kaltura media 
	player to actually play the video and has a transcript section that tracks the video.

	The SHANTI-styled Kaltura player is loaded into an iFrame using their kwidget API. Once loaded, 
	events are bound to trap whenever the video is played or paused. On play, PlayAV() is called to 
	start a ~10fps time that calls a function to update the transcript code (see section below) to 
	track the video. On pause, that timer is canceled.

	Some metadata is displyed under the video along with the summary. A MORE link will reveal and 
	additonal summary information about the clip. A tabbed menu appears below that
	to reduce coginitive load, with sections showing video DETAILS, PEOPLE, involved and TECHNICAL data.

	CSS:		searchui.css										// All styles are prefixed with 'sui-'
	JS:			ECMA-6												// Uses lambda (arrow) functions
	Requires: 	jQuery 												// Almost any version should work
	Kaltura: 	https://cfvod.kaltura.com,	//cdnapi.kaltura.com,	// Kaltura API
	JSON:		From Drupal site
	Dependents:	pages.js, searchui.js								// JS modules called
	Globals:	Looks for sui and sui.pages

*************************************************************************************************************************************************/
/* eslint-disable */
import $ from 'jquery';
export default class AudioVideo {
    constructor(
        sui // CONSTRUCTOR
    ) {
        if (!sui) {
            throw new Error('SearchUI must be passed to constructor');
        }
        this.sui = sui;
        this.div = sui.pages.div; // Div to hold page (same as Pages class)
        this.content = ['...loading', '...loading', '...loading']; // Content pages
        this.inPlay = false; // If AV is in play
        this.curTransSeg = -1; // Currently active transceipt segment
        this.transRes = null; // Holds transcript resources
        this.scrollStart = 0; // Initial transcript scroll distance when starting play
        this.handScroll = false; // Set when transcript is scrolled by hand
        this.mouseDown = false; // When mouse is down
        this.playEnd = 0; // End of clip
        this.kmap = null; // Current kmap of clip
    }

    // Added by Ndg8f: Separated out from Draw in order to make player into its own component
    DrawPlayer(o, d) {
        const sui = this.sui;
        let i,
            f,
            wid = 100;
        let elid = 'sui-av';
        const _this = $('#' + elid); // Context
        var partnerId = '381832'; // Kaltura partner id
        var uiConfId = '31832371'; // Kaltura confidential code
        var entryId = ''; // Media id
        this.inPlay = false; // Not playying yet
        let w = $(this.div).width(); // Width of area
        //    _this.css('background-color', '#eee'); // BG color
        //$(this.div).html("<div id='sui-av'></div>"); // Clear screen
        //sui.pages.DrawRelatedAssets(o); // Draw related assets menu if active
        this.kmap = o; // Save kmap
        if (typeof window.kWidget != 'undefined')
            window.kWidget.destroy('sui-kplayer'); // If Kaltura player already initted yet, kill it

        //sui.LoadingIcon(true, 64); // Show loading icon
        // Get details from JSON
        var str = `<div id="av-player-row" class="row avplayer"><div id='sui-viewerSide' class="av col">`; // Left side
        if (d.field_video && d.field_video.und)
            // If video
            entryId = d.field_video.und[0].entryid;
        // Get id
        else if (d.field_video && d.field_video.en)
            // If video (english)
            entryId = d.field_video.en[0].entryid;
        // Get id
        else if (d.field_audio && d.field_audio.und) {
            // Audio
            entryId = d.field_audio.und[0].entryid; // Id
            wid = 50; // Make smaller
        } else if (d.field_audio && d.field_audio.en) {
            // Audio (english)
            entryId = d.field_audio.en[0].entryid; // Id
            wid = 50; // Make smaller
        }
        str += `<div class='sui-vPlayer' id='sui-kplayer'>
        <img src="https://cfvod.kaltura.com/p/${partnerId}/sp/${partnerId}00/thumbnail/entry_id/${entryId}/version/100301/width/560/height/0" fill-height"></div>`;
        str += `<div style='display:inline-block;width:300px;margin-left:16px'>
                <div title='Published'>&#xe60c&nbsp;&nbsp;&nbsp;`;
        if (d.field_year_published && d.field_year_published.en) {
            str += sui.pages.FormatDate(d.field_year_published.en[0].value);
        } else if (o.node_created) {
            str += sui.pages.FormatDate(o.node_created, 'short');
        }
        str += '</div>';
        str += `<div title='Duration'>&#xe61c&nbsp;&nbsp;&nbsp;${o.duration_s}</div>`;
        str += `<div title='Uploader'>&#xe673&nbsp;&nbsp;&nbsp;${o.node_user_full_s}</div>`;
        // End of left side list of metadata items under video
        str += `</div><div style='display:inline-block;vertical-align:top;width:calc(100% - 320px)'>`;
        try {
            if (o.collection_title) {
                const collpath =
                    sui.pages.GetPublicUrlPath('audio-video') +
                    'audio-video-collection/' +
                    o.id;
                str += `&#xe633&nbsp;&nbsp;&nbsp;
                <a title='Collection' id='sui-avCol' href='${collpath}'>${o.collection_title}</a>`;
            }
        } catch (e) {}
        try {
            let creator_short_list = [];
            const main_roles = ['Creator', 'Director', 'Producer'];
            for (var crn = 0; crn < o.creator.length; crn++) {
                let crrole =
                    o.creator_role_ss && o.creator_role_ss.length > crn
                        ? o.creator_role_ss[crn]
                        : 'none';
                if (main_roles.includes(crrole)) {
                    creator_short_list.push(
                        sui.pages.WrapInLangSpan(o.creator[crn], true) +
                            ' (' +
                            crrole +
                            ')'
                    );
                }
            }
            if (creator_short_list.length === 0) {
                creator_short_list = o.creator;
            }
            str +=
                "<div title='Creators'>&#xe600&nbsp;&nbsp;&nbsp;" +
                creator_short_list.join(', ') +
                '</div>';
        } catch (e) {
            //console.error("in audiovideo.js: " + e.toString());
        }
        str += "<div title='Visibility'>&#xe67c&nbsp;&nbsp;&nbsp;Public</div>"; // TODO: sniff out actual visibility when available in solr index. For now all indexed nodes are public.
        let desc_text = o.summary ? o.summary : o.caption ? o.caption : '';
        let langclass = sui.pages.GetLangCode(desc_text);
        if (langclass.length > 0) {
            langclass = ' u-' + langclass;
        }
        str += `</div><hr>
        <p class='sui-sourceText${langclass}'>${desc_text}</p>`;
        if (
            d.field_pbcore_description &&
            d.field_pbcore_description.und &&
            d.field_pbcore_description.und.length
        ) {
            str += `<div class='sui-avMore1'><a class='sui-avMore2'>
            SHOW MORE</a></div>`;
            str += "<div id='sui-avlang' style='display:none'>";
            let morecnt = '';
            for (i = 0; i < d.field_pbcore_description.und.length; ++i) {
                // For each new description
                try {
                    f = d.field_pbcore_description.und[i]; // Point at it
                    if (f.field_description.und[0].value.length > 0) {
                        const moretext = sui.pages.WrapInLangSpan(
                            f.field_description.und[0].value
                        );
                        morecnt += `<strong>${f.field_language.und[0].value.toUpperCase()}</strong>
                            ${moretext}`;
                    }
                } catch (e) {}
            }
            str += morecnt + '</div>';
            if (morecnt.length == 0) {
                str = str.replace(
                    "class='sui-avMore2'",
                    "class='sui-avMore2 hidden'"
                );
            }
        }
        str += '</div>';

        $('#sui-av').html(str.replace(/\t|\n|\r/g, '')); // Add player
        $('#sui-av').addClass('processed');

        this.DrawTranscript(o, '#sui-trans'); // Draw transcript in div
        str = `//cdnapi.kaltura.com/p/${partnerId}/sp/${partnerId}00/embedIframeJs/uiconf_id/${uiConfId}/partner_id/${partnerId}`;
        $.ajax({ url: str, dataType: 'script' }).done((e) => {
            window.kWidget.embed({
                targetId: 'sui-kplayer',
                wid: '_' + partnerId,
                uiconf_id: uiConfId,
                entry_id: entryId,
                flashvars: { autoPlay: false },
                params: { wmode: 'transparent' },
            });
            window.kWidget.addReadyCallback(() => {
                // When ready, add icon callback
                let kdp = document.getElementById('sui-kplayer'); // Get div
                if (typeof kdp !== 'object' || typeof kdp.kBind !== 'function')
                    return; // Quit if no player ready yet
                kdp.kBind('doPlay.__tests__', () => {
                    $('#sui-transTab1').html('&#xe681');
                    this.inPlay = true;
                    this.PlayAV();
                }); // Pause icon
                kdp.kBind('doPause.__tests__', () => {
                    $('#sui-transTab1').html('&#xe641');
                    this.inPlay = false;
                    this.playEnd = 0;
                    clearInterval(this.transTimer);
                }); // Play
            });
        });
        sui.LoadingIcon(false); // Hide loading icon
        if (typeof window.kWidget != 'undefined')
            window.kWidget.embed({ entry_id: entryId }); // If Kaltura player already inittted yet
    }

    // Added by ndg8f copied from Draw and DrawMetaData to separate metadata into its own React component
    DrawMetaNew(o, d) {
        const sui = this.sui;
        let i,
            f,
            t,
            v,
            wid = 100;
        let elid = 'meta-details';
        // Detail Tab
        let str = '';
        try {
            if (o.title)
                str +=
                    "<p title='Title'><strong>TITLE</strong>&nbsp;&nbsp;" +
                    o.title +
                    '</p>';
        } catch (e) {}
        try {
            if (o.collection_title)
                str +=
                    "<p title='Collection'><strong>COLLECTION</strong>&nbsp;&nbsp;" +
                    o.collection_title +
                    '</p>';
        } catch (e) {}
        try {
            if (d.field_subcollection_new.und.length > 0) {
                str += '<p><strong>SUBCOLLECTION</strong>&nbsp;&nbsp;';
                for (i = 0; i < d.field_subcollection_new.und.length; ++i) {
                    str +=
                        d.field_subcollection_new.und[i].header +
                        sui.pages.AddPop(
                            d.field_subcollection_new.und[i].domain +
                                '-' +
                                d.field_subcollection_new.und[i].id
                        ) +
                        '&nbsp;&nbsp; ';
                }
                str += '</p>';
            }
        } catch (e) {}

        try {
            if (d.field_subject.und.length > 0) {
                str += '<p><strong>SUBJECT</strong>&nbsp;&nbsp;';
                for (i = 0; i < d.field_subject.und.length; ++i) {
                    str +=
                        d.field_subject.und[i].header +
                        sui.pages.AddPop(
                            d.field_subject.und[i].domain +
                                '-' +
                                d.field_subject.und[i].id
                        ) +
                        '&nbsp;&nbsp; ';
                }
                str += '</p>';
            }
        } catch (e) {}
        try {
            if (d.field_location.und.length > 0) {
                str += '<p><strong>REFERENCED PLACES</strong>&nbsp;&nbsp;';
                for (i = 0; i < d.field_location.und.length; ++i) {
                    str +=
                        d.field_location.und[i].header +
                        sui.pages.AddPop(
                            d.field_location.und[i].domain +
                                '-' +
                                d.field_location.und[i].id
                        ) +
                        '&nbsp;&nbsp; ';
                }
                str += '</p>';
            }
        } catch (e) {}
        try {
            str +=
                '<p><strong>RECORDING LOCATION</strong>&nbsp;&nbsp;' +
                d.field_recording_location_new.und[0].header +
                sui.pages.AddPop(
                    d.field_recording_location_new.und[0].domain +
                        '-' +
                        d.field_recording_location_new.und[0].id
                ) +
                '</p>';
        } catch (e) {}
        try {
            str +=
                '<p><strong>LANGUAGE</strong>&nbsp;&nbsp;' +
                d.field_language_kmap.und[0].header +
                sui.pages.AddPop(
                    d.field_language_kmap.und[0].domain +
                        '-' +
                        d.field_language_kmap.und[0].id
                ) +
                '</p>';
        } catch (e) {}
        try {
            if (d.field_kmap_terms.und.length > 0) {
                str += '<p><strong>TERMS</strong>&nbsp;&nbsp;';
                for (i = 0; i < d.field_kmap_terms.und.length; ++i) {
                    str +=
                        d.field_kmap_terms.und[i].header +
                        sui.pages.AddPop(
                            d.field_kmap_terms.und[i].domain +
                                '-' +
                                d.field_kmap_terms.und[i].id
                        ) +
                        '&nbsp;&nbsp; ';
                }
                str += '</p>';
            }
        } catch (e) {}
        try {
            str +=
                '<p><strong>COPYRIGHT OWNER</strong>&nbsp;&nbsp;' +
                d.field_copyright_owner.en[0].value +
                '</p>';
        } catch (e) {}
        try {
            str +=
                '<p><strong>YEAR PUBLISHED</strong>&nbsp;&nbsp;' +
                d.field_year_published.en[0].value +
                '</p>';
        } catch (e) {}
        try {
            str +=
                '<p><strong>RIGHTS SUMMARY</strong>&nbsp;&nbsp;' +
                d.field_pbcore_rights_summary.en[0].value +
                '</p>';
        } catch (e) {}
        try {
            str +=
                '<p><strong>UPLOADED</strong>&nbsp;&nbsp;' +
                o.timestamp.substr(0, 10) +
                ' by ' +
                o.node_user_full_s +
                '</p>';
        } catch (e) {}

        if (
            d.field_pbcore_creator &&
            d.field_pbcore_creator.und &&
            d.field_pbcore_creator.und.length
        ) {
            // If creators spec'd
            // TODO: combine people with same role labels into a single entry
            /*
            for (i = 0; i < d.field_pbcore_creator.und.length; ++i) {
                // For each creator
                f = d.field_pbcore_creator.und[i]; // Point at it
                try {
                    str += `<p><strong>${f.field_creator_role.und[0].value.toUpperCase()}</strong>&nbsp;&nbsp;${sui.pages.WrapInLangSpan(
                        f.field_creator.und[0].value
                    )}</p>`;
                } catch (e) {}
            }

             */
            try {
                let agents = {};
                let agrole,
                    agname = '';
                for (i = 0; i < d.field_pbcore_creator.und.length; ++i) {
                    f = d.field_pbcore_creator.und[i]; // Point at it
                    // For each creator
                    agrole = f.field_creator_role.und[0].value.toLowerCase();
                    agname = sui.pages.WrapInLangSpan(
                        f.field_creator.und[0].value
                    );
                    if (agrole in agents) {
                        agents[agrole].push(agname);
                    } else {
                        agents[agrole] = [agname];
                    }
                }
                for (agrole in agents) {
                    let agrolelabel =
                        agents[agrole].length > 1 ? agrole + 's' : agrole;
                    str += `<p><strong>${agrolelabel.toUpperCase()}</strong>&nbsp;&nbsp;${agents[
                        agrole
                    ].join(', ')}</p>`;
                }
            } catch (e) {
                console.error(e);
            }
        }
        if (
            d.field_pbcore_contributor &&
            d.field_pbcore_contributor.und &&
            d.field_pbcore_contributor.und.length
        ) {
            /* Old code
            // If creators spec'd
            for (i = 0; i < d.field_pbcore_contributor.und.length; ++i) {
                // For each item
                f = d.field_pbcore_contributor.und[i]; // Point at it
                try {
                    str += `<p><strong>CONTRIBUTING ${f.field_contributor_role.und[0].value.toUpperCase()}</strong>&nbsp;&nbsp;${sui.pages.WrapInLangSpan(
                        f.field_contributor.und[0].value
                    )}</p>`;
                } catch (e) {}
            }

             */

            try {
                let agents = {};
                let agrole,
                    agroleprefix,
                    agname = '';
                for (i = 0; i < d.field_pbcore_contributor.und.length; ++i) {
                    f = d.field_pbcore_contributor.und[i]; // Point at it
                    // For each creator
                    agrole = f.field_contributor_role.und[0].value.toLowerCase();
                    agroleprefix =
                        agrole.indexOf('assistant') > -1 ? '' : 'CONTRIBUTING';
                    agname = sui.pages.WrapInLangSpan(
                        f.field_contributor.und[0].value
                    );
                    if (agrole in agents) {
                        agents[agrole].push(agname);
                    } else {
                        agents[agrole] = [agname];
                    }
                }
                for (agrole in agents) {
                    let agrolelabel =
                        agents[agrole].length > 1 ? agrole + 's' : agrole;
                    str += `<p><strong>${agroleprefix} ${agrolelabel.toUpperCase()}</strong>&nbsp;&nbsp;${agents[
                        agrole
                    ].join(', ')}</p>`;
                }
            } catch (e) {
                // console.error(e);
            }
        }
        try {
            str +=
                '<p><strong>PUBLISHER</strong>&nbsp;&nbsp;' +
                d.field_pbcore_publisher.und[0].field_publisher.und[0].value +
                '</p>';
        } catch (e) {}
        try {
            str +=
                '<p><strong>DATA ENTRY</strong>&nbsp;&nbsp;' +
                o.node_user_full_s +
                '</p>';
        } catch (e) {}

        if (
            d.field_pbcore_instantiation &&
            d.field_pbcore_instantiation.und &&
            d.field_pbcore_instantiation.und.length
        ) {
            // If instantiation spec'd
            for (i in d.field_pbcore_instantiation.und[0]) {
                // For each item
                v = d.field_pbcore_instantiation.und[0][i]; // Point at it
                t = i.replace(/field_/, '').replace(/_/g, ' '); // Remove header and spaces
                try {
                    str += `<p><strong>${t.toUpperCase()}</strong>&nbsp;&nbsp;<span>${v.und[0].value.replace(
                        /(<([^>]+)>)/gi,
                        ''
                    )}</span></p>`;
                } catch (e) {}
            }
        }
        try {
            str +=
                '<p><strong>FORMAT ID</strong>&nbsp;&nbsp;' +
                d.field_video.und[0].entryid +
                '</p>';
        } catch (e) {}
        str +=
            '<p><strong>FORMAT ID SOURCE</strong>&nbsp;&nbsp;(Kaltura.com)</p>';
        return '<div>' + str + '</div>';
    }

    Draw(
        o // DRAW AUDIO/VIDEO PAGE
    ) {
        return;
        // NDG8F (Aug 14, 2020): Overriding for AV in order to separate player/transcript from metadata
        // into different components
        const sui = this.sui;
        let i,
            f,
            wid = 100;
        const _this = this; // Context
        var partnerId = '381832'; // Kaltura partner id
        var uiConfId = '31832371'; // Kaltura confidential code
        var entryId = ''; // Media id
        this.inPlay = false; // Not playying yet
        let w = $(this.div).width(); // Width of area
        $(this.div).css('background-color', '#eee'); // BG color
        $(this.div).html("<div id='sui-av'></div>"); // Clear screen
        sui.pages.DrawRelatedAssets(o); // Draw related assets menu if active
        this.kmap = o; // Save kmap
        if (typeof window.kWidget != 'undefined')
            window.kWidget.destroy('sui-kplayer'); // If Kaltura player already initted yet, kill it

        sui.LoadingIcon(true, 64); // Show loading icon
        sui.GetJSONFromKmap(o, (d) => {
            // Get details from JSON
            var str = `<div id="av-player-row" class="row avplayer"><div id='sui-viewerSide' class="av col">`; // Left side
            if (d.field_video && d.field_video.und)
                // If video
                entryId = d.field_video.und[0].entryid;
            // Get id
            else if (d.field_video && d.field_video.en)
                // If video (english)
                entryId = d.field_video.en[0].entryid;
            // Get id
            else if (d.field_audio && d.field_audio.und) {
                // Audio
                entryId = d.field_audio.und[0].entryid; // Id
                wid = 50; // Make smaller
            } else if (d.field_audio && d.field_audio.en) {
                // Audio (english)
                entryId = d.field_audio.en[0].entryid; // Id
                wid = 50; // Make smaller
            }
            str += `<div class='sui-vPlayer' id='sui-kplayer'>
			<img src="https://cfvod.kaltura.com/p/${partnerId}/sp/${partnerId}00/thumbnail/entry_id/${entryId}/version/100301/width/560/height/0" fill-height"></div>`;
            str += `<br><br><div style='display:inline-block;width:300px;margin-left:16px'>
			<div title='Duration'>&#xe61c&nbsp;&nbsp;&nbsp;${o.duration_s}</div>
			<div title='Published'>&#xe60c&nbsp;&nbsp;&nbsp;Published `;
            if (d.field_year_published && d.field_year_published.en)
                str += +d.field_year_published.en[0].value;
            else if (o.node_created)
                str += sui.pages.FormatDate(o.node_created);
            str += '</div>';
            try {
                if (o.collection_title)
                    str += `<a title='Collection' id='sui-avCol'
					href='#c=${o.asset_type}-${o.id}=${o.collection_idfacet[0]}'>
					&#xe633&nbsp;&nbsp;&nbsp;
					<a title='Collection' id='sui-avCol'	href='#p=${o.collection_uid_s}'>${o.collection_title}</a>`;
            } catch (e) {}
            str += `</div><div style='display:inline-block;vertical-align:top;width:calc(100% - 320px)'>`;
            try {
                str +=
                    "<div title='Creators'>&#xe600&nbsp;&nbsp;&nbsp;" +
                    o.creator.join(', ') +
                    '</div>';
            } catch (e) {}
            str += `</div><hr>
			<p class='sui-sourceText'>${
                o.summary ? o.summary : o.caption ? o.caption : ''
            }</p>`;
            if (
                d.field_pbcore_description &&
                d.field_pbcore_description.und &&
                d.field_pbcore_description.und.length
            ) {
                str += `<div class='sui-avMore1'><a class='sui-avMore2'>
				SHOW MORE</a></div><br>`;
                str += "<div id='sui-avlang' style='display:none'>";
                let morecnt = '';
                for (i = 0; i < d.field_pbcore_description.und.length; ++i) {
                    // For each new description
                    try {
                        f = d.field_pbcore_description.und[i]; // Point at it
                        if (f.field_description.und[0].value.length > 0) {
                            morecnt += `<strong>${f.field_language.und[0].value.toUpperCase()}</strong><br>${
                                f.field_description.und[0].value
                            }<br>`;
                        }
                    } catch (e) {}
                }
                str += morecnt + '</div>';
                if (morecnt.length == 0) {
                    str = str.replace(
                        "class='sui-avMore2'",
                        "class='sui-avMore2 hidden'"
                    );
                }
            }
            str += '</div>';

            $('#sui-av').html(str.replace(/\t|\n|\r/g, '')); // Add player

            let info_tabs = sui.pages.DrawTabMenu([
                'DETAILS',
                'PEOPLE',
                'TECHNICAL',
            ]); // Add tab menu
            info_tabs = $(
                '<div id="av-info-tabs" class="row">' + info_tabs + '</div>'
            );
            $('#sui-av').append(info_tabs);
            $('#sui-avCol').on('click', () => {
                // ON COLLECTION CLICK
                sui.GetKmapFromID(o.collection_uid_s, (kmap) => {
                    sui.SendMessage('', kmap);
                }); // Get kmap and show page
                return false; // Stop propagation
            });

            this.DrawTranscript(o, '#sui-trans'); // Draw transcript in div
            str = `//cdnapi.kaltura.com/p/${partnerId}/sp/${partnerId}00/embedIframeJs/uiconf_id/${uiConfId}/partner_id/${partnerId}`;
            $.ajax({ url: str, dataType: 'script' }).done((e) => {
                window.kWidget.embed({
                    targetId: 'sui-kplayer',
                    wid: '_' + partnerId,
                    uiconf_id: uiConfId,
                    entry_id: entryId,
                    flashvars: { autoPlay: false },
                    params: { wmode: 'transparent' },
                });
                window.kWidget.addReadyCallback(() => {
                    // When ready, add icon callback
                    let kdp = document.getElementById('sui-kplayer'); // Get div
                    if (
                        typeof kdp !== 'object' ||
                        typeof kdp.kBind !== 'function'
                    )
                        return; // Quit if no player ready yet
                    kdp.kBind('doPlay.__tests__', () => {
                        $('#sui-transTab1').html('&#xe681');
                        this.inPlay = true;
                        this.PlayAV();
                    }); // Pause icon
                    kdp.kBind('doPause.__tests__', () => {
                        $('#sui-transTab1').html('&#xe641');
                        this.inPlay = false;
                        this.playEnd = 0;
                        clearInterval(this.transTimer);
                    }); // Play
                });
            });
            sui.LoadingIcon(false); // Hide loading icon
            if (typeof window.kWidget != 'undefined')
                window.kWidget.embed({ entry_id: entryId }); // If Kaltura player already inittted yet
            this.DrawMetaData(o, d); // Draw metadata content
            $('.sui-tabTab').eq(0).addClass('active');
            showTab(0); // Open details

            $('[id^=sui-tabTab]').on('click', (e) => {
                // ON TAB CLICK
                $('.sui-tabTab.active').removeClass('active');
                $(e.currentTarget).addClass('active');
                var id = e.currentTarget.id.substring(10); // Get index of tab
                showTab(id); // Draw it
            });

            function showTab(which) {
                $('#sui-tabContent').html(_this.content[which]); // Set content
            }
        });
    }

    DrawMetaData(
        o,
        d // DRAW TABBED METADATA
    ) {
        const sui = this.sui;
        let i, t, v, f;
        let str = ''; // Start fresh on tab 0
        try {
            if (o.title)
                str +=
                    "<p title='Title'><strong>TITLE</strong>&nbsp;&nbsp;" +
                    o.title +
                    '</p>';
        } catch (e) {}
        try {
            if (o.collection_title)
                str +=
                    "<p title='Collection'><strong>COLLECTION</strong>&nbsp;&nbsp;" +
                    o.collection_title +
                    '</p>';
        } catch (e) {}

        try {
            if (d.field_subcollection_new.und.length > 0) {
                str += '<p><strong>SUBCOLLECTION</strong>&nbsp;&nbsp;';
                for (i = 0; i < d.field_subcollection_new.und.length; ++i) {
                    str +=
                        d.field_subcollection_new.und[i].header +
                        sui.pages.AddPop(
                            d.field_subcollection_new.und[i].domain +
                                '-' +
                                d.field_subcollection_new.und[i].id
                        ) +
                        '&nbsp;&nbsp; ';
                }
                str += '</p>';
            }
        } catch (e) {}
        try {
            str += '<p><strong>SUBJECT</strong>&nbsp;&nbsp;';
            for (i = 0; i < d.field_subject.und.length; ++i) {
                str +=
                    d.field_subject.und[i].header +
                    sui.pages.AddPop(
                        d.field_subject.und[i].domain +
                            '-' +
                            d.field_subject.und[i].id
                    ) +
                    '&nbsp;&nbsp; ';
            }
            str += '</p>';
        } catch (e) {}
        try {
            str +=
                '<p><strong>RECORDING LOCATION</strong>&nbsp;&nbsp;' +
                d.field_recording_location_new.und[0].header +
                sui.pages.AddPop(
                    d.field_recording_location_new.und[0].domain +
                        '-' +
                        d.field_recording_location_new.und[0].id
                ) +
                '</p>';
        } catch (e) {}
        try {
            str +=
                "<p'><strong>LANGUAGE</strong>&nbsp;&nbsp;" +
                d.field_language_kmap.und[0].header +
                sui.pages.AddPop(
                    d.field_language_kmap.und[0].domain +
                        '-' +
                        d.field_language_kmap.und[0].id
                ) +
                '</p>';
        } catch (e) {}
        try {
            str +=
                '<p><strong>TERMS</strong>&nbsp;&nbsp;' +
                d.field_terms.und[0].header +
                '</p>';
        } catch (e) {}
        try {
            str +=
                '<p><strong>COPYRIGHT OWNER</strong>&nbsp;&nbsp;' +
                d.field_copyright_owner.en[0].value +
                '</p>';
        } catch (e) {}
        try {
            str +=
                '<p><strong>YEAR PUBLISHED</strong>&nbsp;&nbsp;' +
                d.field_year_published.en[0].value +
                '</p>';
        } catch (e) {}
        try {
            str +=
                '<p><strong>RIGHTS SUMMARY</strong>&nbsp;&nbsp;' +
                d.field_pbcore_rights_summary.en[0].value +
                '</p>';
        } catch (e) {}
        try {
            str +=
                '<p><strong>UPLOADED</strong>&nbsp;&nbsp;' +
                o.timestamp.substr(0, 10) +
                ' by ' +
                o.node_user_full_s +
                '</p>';
        } catch (e) {}
        this.content[0] = "<div style='height:2px'/>" + str + '<br>'; // Add to tab

        str = ''; // Start fresh on tab 1
        if (
            d.field_pbcore_creator &&
            d.field_pbcore_creator.und &&
            d.field_pbcore_creator.und.length
        ) {
            // If creators spec'd
            for (i = 0; i < d.field_pbcore_creator.und.length; ++i) {
                // For each creator
                f = d.field_pbcore_creator.und[i]; // Point at it
                try {
                    str += `<p><strong>${f.field_creator_role.und[0].value.toUpperCase()}</strong>&nbsp;&nbsp;${sui.pages.WrapInLangSpan(
                        f.field_creator.und[0].value
                    )}</p>`;
                } catch (e) {}
            }
        }
        if (
            d.field_pbcore_contributor &&
            d.field_pbcore_contributor.und &&
            d.field_pbcore_contributor.und.length
        ) {
            // If creators spec'd
            for (i = 0; i < d.field_pbcore_contributor.und.length; ++i) {
                // For each item
                f = d.field_pbcore_contributor.und[i]; // Point at it
                try {
                    str += `<p><strong>CONTRIBUTING ${f.field_contributor_role.und[0].value.toUpperCase()}</strong>&nbsp;&nbsp;${
                        f.field_contributor.und[0].value
                    }</p>`;
                } catch (e) {}
            }
        }
        try {
            str +=
                '<p><strong>PUBLISHER</strong>&nbsp;&nbsp;' +
                d.field_pbcore_publisher.und[0].field_publisher.und[0].value +
                '</p>';
        } catch (e) {}
        try {
            str +=
                '<p><strong>DATA ENTRY</strong>&nbsp;&nbsp;' +
                o.node_user_full_s +
                '</p>';
        } catch (e) {}
        this.content[1] = "<div style='height:2px'/>" + str + '<br>'; // Add to tab

        str = ''; // Start fresh on tab 2
        if (
            d.field_pbcore_instantiation &&
            d.field_pbcore_instantiation.und &&
            d.field_pbcore_instantiation.und.length
        ) {
            // If instantiation spec'd
            for (i in d.field_pbcore_instantiation.und[0]) {
                // For each item
                v = d.field_pbcore_instantiation.und[0][i]; // Point at it
                t = i.replace(/field_/, '').replace(/_/g, ' '); // Remove header and spaces
                try {
                    str += `<p><strong>${t.toUpperCase()}</strong>&nbsp;&nbsp;${
                        v.und[0].value
                    }</p>`;
                } catch (e) {}
            }
        }
        try {
            str +=
                '<p><strong>FORMAT ID</strong>&nbsp;&nbsp;' +
                d.field_video.und[0].entryid +
                '</p>';
        } catch (e) {}
        str +=
            '<p><strong>FORMAT ID SOURCE</strong>&nbsp;&nbsp;(Kaltura.com)</p>';
        this.content[2] = "<div style='height:2px'/>" + str + '<br>'; // Add to tab
    } //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /* TRANSCRIPT //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	This section draws the transcript which follows a video, if available.

*/ DrawTranscript(
        kmap,
        div // DRAW TRANSCRIPT FROM SOLR
    ) {
        var i, o, seg;
        var l = {}; // Holds filed:language pairs
        if (!kmap.trid_i) return; // Quit if no transcript
        this.curTransSeg = -1; // Start at top

        l.ts_content_rus = 'Russian';
        l.content_bod = 'Tibetan';
        l.dzo_bod = 'Dzongkha';
        l.ts_content_sgt = 'Brokpake';
        l.ts_content_kjz = 'Bumthangkha';
        l.ts_content_tgf = 'Chalikha';
        l.ts_content_cgk = 'Chocangacakha';
        l.ts_content_dka = 'Dakpakha';
        l.ts_content_dzl = 'Dzalakha';
        l.ts_content_goe = 'Gongduk';
        l.ts_content_xkz = 'Kurtop';
        l.ts_content_kru = 'Kuruz';
        l.ts_content_lkh = 'Lakha';
        l.ts_content_lya = 'Layakha';
        l.ts_content_lep = 'Lepcha';
        l.ts_content_lhp = 'Lhokpu';
        l.ts_content_luk = 'Lunanakha';
        l.ts_content_npb = 'Nupbikha';
        l.ts_content_neh = 'Mangdekha';
        l.ts_content_ole = 'Olekha';
        l.ts_content_tsj = 'Tshangla';
        l.ts_content_xkf = 'Khengkha';
        l.ts_content_wylie = 'Wylie';
        l.ts_content_gyal = 'Gyalsumdo';
        l.ts_content_gvr = 'Gurung';
        l.ts_content_npa = 'Nar Phu';
        l.ts_content_nmm = 'Manange';
        l.ts_content_kte = 'Nubri';
        l.ts_content_tsum = 'Tsum';
        l.ts_content_nep = 'Nepali';
        l.ts_content_eng = 'English';
        l.ts_content_zho = 'Chinese';
        l.ts_content_und = 'Unknown';
        l.ts_content_gloss = 'Morpheme glossing';

        var res = {
            languages: {},
            speakers: {},
            segs: [],
            layout: 'Normal',
            rev: 0,
            speaker: '',
        }; // Final data
        var url =
            'https://ss251856-us-east-1-aws.measuredsearch.com/solr/av_test/select?indent=on&q=is_trid:' +
            kmap.trid_i +
            '&wt=json&start=0&rows=1000';
        $.ajax({ url: url, dataType: 'jsonp', jsonp: 'json.wrf' }).done(
            (data) => {
                // Get transcript data
                data.response.docs.sort(function (a, b) {
                    return a.fts_start > b.fts_start ? 1 : -1;
                }); // Sort
                for (i = 0; i < data.response.docs.length; ++i) {
                    // For each seg in doc
                    o = data.response.docs[i]; // Point at it
                    seg = {
                        start: o.fts_start,
                        end: o.fts_end,
                        dur: o.fts_duration,
                    }; // Make seg with timings
                    if (o.ss_speaker_bod) {
                        res.speakers[o.ss_speaker_bod] = 1;
                        seg.speaker = o.ss_speaker_bod;
                    } // Set speaker?
                    seg.lang = o.ss_language ? o.ss_language : ''; // Set seg language
                    for (var lang in l) {
                        // For each seg
                        if (o[lang]) {
                            // If a language match
                            seg[l[lang]] = o[lang]; // Add to transcript under language
                            res.languages[l[lang]] = 1; // Add to languages list
                        }
                    }
                    res.segs.push(seg); // Add seg to list
                }
                if (!res.segs.length) return; // Quit if no segs
                this.transRes = res; // Set segs
                if ($(this.div).width() > 700)
                    // If mobile
                    $('#sui-viewerSide').width($(this.div).width() * 0.5); // Halve viewer width
                //$("#sui-kplayer").height($(this.div).width()*0.5*0.5625);							// Set height based on aspect ratio
                if ($('#av-trscrpt-wrapper').length === 0) {
                    this.DrawTranscriptMenu(); // Draw transcripts header
                }
                this.DrawTransContent(); // Draw the transcipt content
            }
        ); // AJAX closure
    }

    DrawTranscriptMenu() {
        // DRAW TRANSCRIPT MENU
        var res = this.transRes; // Point at res
        var browser = navigator.userAgent.includes('Chrome')
            ? 'chrome'
            : navigator.userAgent.includes('Firefox')
            ? 'firefox'
            : 'safari';

        var str = `<div id='av-trscrpt-wrapper' class='col'>
            <div class='av-trscrpt-ctrls row'>
                <div id='sui-transTab0' class='sui-transTab col' title='Options'>&#xe66f&#xe609</div>
                <div id='sui-transTab1' class='sui-transTab col' title='Play/Pause'>&#xe641</div>
                <div id='sui-transTab2' class='sui-transTab col' title='Previous line'>&#xe602</div>
                <div id='sui-transTab3' class='sui-transTab col' title='Same line'>&#xe632</div>
                <div id='sui-transTab4' class='sui-transTab col' title='Next line'>&#xe604</div>
                <div id='sui-transTab5' class='sui-transTab col' style='border:none' title='Search transcript'>&#xe623</div>
                <div id='sui-transSrc' class='sui-transSrc'>
                    <div class="transSrcWrap ${browser}">
                        <div class="navigator">
                            <div class="navwrapper" style="display: none;">
                                <div id='sui-transSrcB' style='display:inline-block;color:#fff;font-size:20px;cursor:pointer' title='Previous result'>&#xe640</div>
                                <div id='sui-transSrcN' style='display:inline-block;color:#fff;margin:0 16px;font-size:12px;cursor:pointer;vertical-align:4px'>0 of 0</div>
                                <div id='sui-transSrcF' style='display:inline-block;color:#fff;font-size:20px;cursor:pointer' title='Previous result'>&#xe641</div>
                            </div>
                        </div>
                        <div id='sui-transSrcGo' class='sui-search4'>
                            <input type='text' id='sui-transSrcInp' class='sui-search2' size='40' placeholder='Search this transcript'/>
                            <span class="icon shanticon-magnify search"></span>
                            <span class="icon shanticon-cancel clear" style="display: none;"></span>
                            <button class="search"><span class="icon shanticon-angle-right"></span></button>
                        </div>
                        <!--
                        <div id='sui-transSrcGo' class='sui-search4'>&#xe623</div> &lt;!&ndash; style='float:right;margin:12px 16px 0 0' &ndash;&gt;
                            <div class='sui-search1'> &lt;!&ndash; style='float:right;margin-top:12px' &ndash;&gt;
                                <input type='text' id='sui-transSrcInp' class='sui-search2' placeholder='Search this transcript'>
                                <div id='sui-clear' class='sui-search3'>&#xe610</div>
                            </div>
                        </div>-->
                    </div>
                <div id='sui-transOps' class='sui-transOps'></div>
            </div>
            <div id='sui-trans' class='sui-trans row'></div>
		</div>`;
        $('#av-player-row').append(str.replace(/\t|\n|\r/g, ''));

        var curHit = 0,
            hits = []; // Holds search hits

        $('#sui-transSrcGo button.search').on('click', () => {
            // ON SEARCH
            let i, r, lang;
            hits = [];
            curHit = 0; // Reset hits

            if ($('#sui-transSrcInp').val()) {
                //console.log("Trans Search val: " + $('#sui-transSrcInp').val());
                // If a valid term
                r = RegExp($('#sui-transSrcInp').val(), 'i'); // Turn into regex
                for (
                    i = 0;
                    i < res.segs.length;
                    ++i // For each seg
                )
                    for (lang in res.languages) // For each language
                        if (res.segs[i][lang] && res.segs[i][lang].match(r))
                            hits.push(i); // If something there
                window.sui.av.transhits = hits;
            }
            show(hits); // Show status
            $('#sui-transSrcGo .icon.clear').show();
        });

        $('#sui-transSrcInp').on('change', () => {
            $('#sui-transSrcGo button.search').trigger('click');
        }); // ON TEXT CHANGED

        $('#sui-transSrcB').on('click', () => {
            console.log('Prev: ' + curHit, hits.length);
            curHit = curHit > 0 ? Math.max(0, curHit - 1) : hits.length - 1;
            show();
        }); // ON PREVIOUS
        $('#sui-transSrcF').on('click', () => {
            console.log('Next: ' + curHit, hits.length);
            curHit =
                curHit < hits.length - 1
                    ? Math.min(hits.length - 1, curHit + 1)
                    : 0;
            show();
        }); // ON NEXT

        $('div#sui-transSrcGo .icon.clear').on('click', () => {
            $('.srchit').each(function () {
                var mytxt = $(this).text();
                $(this).replaceWith(mytxt);
            });
            $('#sui-transSrcInp').val('');
            $(
                'div#sui-transSrcGo .icon.clear, .transSrcWrap .navwrapper'
            ).hide();
        });

        function show(hits) {
            // SHOW STATUS
            const sui = window.sui;
            if (typeof hits == 'undefined') {
                hits = sui.av.transhits;
            }
            // Remove previous highlights
            $('.srchit').each(function () {
                var mytxt = $(this).text();
                $(this).replaceWith(mytxt);
            });
            // Highlight all hits
            hits.map(function (hid) {
                var segtxt = $('#sui-transBox-' + hid + ' span').html();
                var srchval = $('#sui-transSrcInp').val();
                segtxt = segtxt.replace(
                    new RegExp(srchval, 'g'),
                    `<span class="srchit">${srchval}</span>`
                );
                $('#sui-transBox-' + hid + ' span').html(segtxt);
            });
            var t = hits.length ? curHit + 1 : 0; // Current number
            if (hits.length > 0) {
                $('.transSrcWrap .navwrapper').show();
            }
            $('#sui-transSrcN').html(t + ' of ' + hits.length); // Set number found
            if (hits.length) {
                // If somthing
                sui.av.curTransSeg = hits[curHit]; // Set cur seg
                sui.av.HighlightSeg(sui.av.curTransSeg, undefined); // Highlight seg
            }
        }

        str = `<div class='sui-transRow'>Transcript options<span class='sui-transCheck trans-opts-close'>&#xe60f</span></div>
		<div class='sui-transLab'>LANGUAGES</div>`;
        for (var lang in res.languages) // Add each language found in transcript
            str +=
                "<div class='sui-transRow' id='sui-transLan-" +
                lang +
                "'>- " +
                lang +
                "<span id='sui-transLang-" +
                lang +
                "' class='sui-transCheck' style='color:#58aab4'>&#xe60e</span></div>";
        str += `<div class='sui-transLab'>SPEAKERS</div>
		<div class='sui-transRow'>- Tibetan<span id='sui-transS1' class='sui-transCheck' style='color:#58aab4'>&#xe60e</span></div>	
		<div class='sui-transLab'>LAYOUTS</div>
		<div class='sui-transRow' id='sui-transMinR'>- Minimal<span id='sui-transMin' class='sui-transCheck'>&#xe60e</span></div>
		<div class='sui-transRow' id='sui-transRevR'>- Reversed<span id='sui-transRev' class='sui-transCheck'>&#xe60e</span></div>
		<div class='sui-transLab'>DOWNLOADS</div>
		<div class='sui-transRow' id='sui-transStr'->- SRT file<span class='sui-transCheck' style='color:#58aab4'>&#xe616</span></div>`;
        $('#sui-transOps').html(str.replace(/\t|\n|\r/g, ''));

        $('#sui-transStr').on('click', () => {
            this.SaveStrFile();
        }); // ON SAVE SRT FILE

        $('[id^=sui-transLan-]').on('click', (e) => {
            // ON LANGUAGE CLICK
            var res = this.transRes;
            var lang = e.currentTarget.id.substring(13); // Get language
            res.languages[lang] = 1 - res.languages[lang]; // Toggle value
            $('#sui-transLang-' + lang).css(
                'color',
                res.languages[lang] ? '#58aab4' : '#ccc'
            ); // Set check color
            this.transRes = res;
            this.DrawTransContent(); // Redraw
        });

        $('#sui-transMinR').on('click', () => {
            // ON CLICK MINIMAL/NORMAL
            var res = this.transRes;
            res.layout = res.layout == 'Minimal' ? 'Normal' : 'Minimal'; // Toggle state
            $('#sui-transMin').css(
                'color',
                res.layout == 'Minimal' ? '#58aab4' : '#ccc'
            ); // Set check color
            this.transRes = res;
            this.DrawTransContent(); // Redraw
        });

        $('#sui-transRevR').on('click', () => {
            // ON CLICK REVERSE
            var res = this.transRes;
            res.rev = res.rev ? 0 : 1; // Toggle state
            $('#sui-transRev').css('color', res.rev ? '#58aab4' : '#ccc'); // Set check color
            this.transRes = res;
            this.DrawTransContent(); // Redraw
        });

        $('#sui-transTab0').on('click', () => {
            $('#sui-transOps').slideToggle('fast');
        }); // ON OPTIONS MENU CLICK

        $('.sui-transCheck.trans-opts-close').on('click', () => {
            $('#sui-transOps').slideToggle('fast');
        });

        $('#sui-transTab5').on('click', () => {
            $('#sui-transSrc').slideToggle('fast');

            if ($('#av-trscrpt-wrapper #sui-trans').hasClass('searchshown')) {
                $('#av-trscrpt-wrapper #sui-trans').removeClass('searchshown');
            } else {
                $('#av-trscrpt-wrapper #sui-trans').addClass('searchshown');
            }
        }); // ON SEARCH MENU CLICK

        $('#sui-transTab1').on('click', (e) => {
            // ON PLAY CLICK
            e.preventDefault();
            clearInterval(this.transTimer); // Kill timer
            if (this.inPlay) $('#sui-kplayer')[0].sendNotification('doPause');
            // Pause
            else {
                this.PlayAV();
                $('#sui-kplayer')[0].sendNotification('doPlay'); // Play
            }
        });

        $('#sui-transTab2').on('click', (e) => {
            // ON PLAY PREVIOUS SEG CLICK
            e.preventDefault();
            var res = this.transRes;
            this.curTransSeg = Math.max(this.curTransSeg - 1, 0); // Go back one
            this.PlayAV(
                res.segs[this.curTransSeg].start,
                res.segs[this.curTransSeg].end
            ); // Play it
            $('#sui-kplayer')[0].sendNotification('doPlay'); // Start playing
        });

        $('#sui-transTab3').on('click', (e) => {
            // ON PLAY THIS SEG CLICK
            e.preventDefault();
            this.PlayAV(
                res.segs[this.curTransSeg].start,
                res.segs[this.curTransSeg].end
            ); // Play it
            $('#sui-kplayer')[0].sendNotification('doPlay'); // Start playing
        });

        $('#sui-transTab4').on('click', (e) => {
            // ON PLAY NEXT SEG CLICK
            e.preventDefault();
            this.curTransSeg = Math.min(
                this.curTransSeg + 1,
                res.segs.length - 1
            ); // Go to next one
            this.PlayAV(
                res.segs[this.curTransSeg].start,
                res.segs[this.curTransSeg].end
            ); // Play it
            $('#sui-kplayer')[0].sendNotification('doPlay'); // Start playing
        });
    }

    SaveStrFile() {
        // SAVE AS SRT FILE
        var res = this.transRes; // Point at res
        let lang,
            i,
            o,
            str = '';
        for (i = 0; i < res.segs.length; ++i) {
            // For each seg
            o = res.segs[i]; // Point at it
            str += `${i + 1}\n${o.start},000 --> ${o.end},000\n${
                o.speaker ? '>> ' + o.speaker + '\n' : ''
            }`;
            for (lang in res.languages) {
                // For each language
                if (res.segs[i][lang] && res.languages[lang])
                    // If something there and checked
                    str += res.segs[i][lang] + '\n'; // Add transcription
            }
            str += '\n';
        }
        var element = document.createElement('a');
        element.setAttribute(
            'href',
            'data:text/plain;charset=utf-8,' + encodeURIComponent(str)
        );
        element.setAttribute('download', 'transcript-' + this.kmap.id + '.str');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    DrawTransContent() {
        // DRAW TRANSCRIPT CONTENT IN WINDOW
        var i,
            lang,
            str = '';
        const _this = this; // Context
        var res = this.transRes; // Point at res
        if (res.layout == 'Minimal') {
            // Drawing minimal layput
            for (i = 0; i < res.segs.length; ++i) {
                // For each seg
                str += `<div class='sui-transMinSeg' id='sui-transMinSeg-${i}'>										
				<div style='float:${res.rev ? 'right' : 'left'};font-size:18px;'>
				${res.segs[i].speaker ? res.segs[i].speaker + '<br>' : ''}
				<div class='sui-transMinPlay' id='sui-transPlay-${i}' title='Play line ${this.SecondsToTimecode(
                    res.segs[i].start
                )}'>&#xe680</div> 
				</div>
				<div class='sui-transMinBox' id='sui-transMinBox-${i}'
				style='margin:${res.rev ? '0 150px 0 0' : '0  0 0 150px'}'>`;
                for (lang in res.languages) // For each language
                    if (res.segs[i][lang] && res.languages[lang])
                        // If something there and checked
                        str +=
                            res.segs[i][lang] +
                            "<hr style='margin:0;border-top:1px dashed #eee'>"; // Add transcription and dividing line
                str += '</div></div>'; // Close box and seg
            }
        } else {
            // Normal
            for (i = 0; i < res.segs.length; ++i) {
                // For each seg
                str += `<div class='sui-transSeg' id='sui-transSeg-${i}'>
				<div style='float:${res.rev ? 'right' : 'left'};font-size:18px;'>
				${res.segs[i].speaker ? res.segs[i].speaker + '<br>' : ''}
				<div class='sui-transPlay' id='sui-transPlay-${i}' 
				title='Play line'>&#xe680
				<span style='margin-left:24px;font-size:12px;vertical-align:4px'>
				${this.SecondsToTimecode(res.segs[i].start)}</span></div></div> 
				<div class='sui-transBox' id='sui-transBox-${i}'
				style='margin:${res.rev ? '0 150px 0 0' : '0  0 0 150px'}'>`;
                for (lang in res.languages) // For each language
                    if (res.segs[i][lang] && res.languages[lang])
                        // If something there and checked
                        str +=
                            sui.pages.WrapInLangSpan(res.segs[i][lang]) +
                            "<hr style='margin:0;border-top:1px dashed #eee'>"; // Add transcription and dividing line
                str += '</div></div>'; // Close box and seg
            }
        }
        $('#sui-trans').html(str.replace(/\t|\n|\r/g, '')); // Add transcript to div

        $('#sui-trans').on('mousedown', () => {
            this.mouseDown = true;
        }); // Set scrolling flag
        $('#sui-trans').on('mouseup', () => {
            this.mouseDown = false;
        }); // Unset flag
        $('#sui-trans').on('scroll', function () {
            // On scroll event
            _this.handScroll = true; // Inhibit auto scrolling
            if (_this.mouseDown) return; // Quit if mouse is still down
            clearTimeout($.data(this, 'scrollTimer'));
            $.data(
                this,
                'scrollTimer',
                setTimeout(function () {
                    _this.handScroll = false;
                }, 250)
            );
        });

        $('[id^=sui-transPlay-]').on('click', (e) => {
            // ON PLAY CLICK
            this.curTransSeg = e.currentTarget.id.substring(14); // Get index of seg
            this.PlayAV(
                res.segs[this.curTransSeg].start,
                res.segs[this.curTransSeg].end
            ); // Play seg
            $('#sui-kplayer')[0].sendNotification('doPlay'); // Start playing
        });
    }

    PlayAV(
        start,
        end // PLAY TRANSCRIPT SEGMENT
    ) {
        var i;
        var res = this.transRes; // Point at res

        clearInterval(this.transTimer); // Kill timer
        this.scrollStart = $('#sui-trans').scrollTop(); // Scroll
        if (start != undefined)
            $('#sui-kplayer')[0].sendNotification('doSeek', start); // Seek to start
        if (end) this.playEnd = end; // Set ending point
        this.transTimer = setInterval((e) => {
            if (typeof $('#sui-kplayer')[0].evaluate !== 'function') {
                return;
            }
            // Set interval and handler
            var now = $('#sui-kplayer')[0].evaluate(
                '{video.player.currentTime}'
            ); // Get current player time
            if (this.playEnd && now >= this.playEnd) {
                // An end set and past it
                clearInterval(this.transTimer); // Kill timer
                $('#sui-kplayer')[0].sendNotification('doPause'); // Pause video
                this.playEnd = 0; // Clear end
                return; // Quit
            }
            for (i = 0; i < res.segs.length; ++i) {
                // For each seg
                if (now >= res.segs[i].start && now < res.segs[i].end) {
                    // In this one
                    this.curTransSeg = i; // Set as current
                    break; // Quit looking
                }
            }
            if (this.curTransSeg > 0)
                this.HighlightSeg(this.curTransSeg, start); // Highlight seg if note prelude
        }, 100); // Time ~10fps
    }

    HighlightSeg(
        num,
        start // HIGHLIGHT A SEGMENT
    ) {
        let t =
            $(
                `#sui-trans${
                    this.transRes.layout == 'Minimal' ? 'Min' : ''
                }Seg-${num}`
            ).position().top -
            $(
                `#sui-trans${
                    this.transRes.layout == 'Minimal' ? 'Min' : ''
                }Seg-0`
            ).position().top; // Get offset to top seg
        //if (this.handScroll) start = 1; // Inhibit transcript autoscrolling while manually scrolling
        if (start == undefined) $('#sui-trans').scrollTop(t); // Scroll to position if not playing a particular seg
        $('[id^=sui-transSeg-]').css('background-color', '#ddd'); // All backgrounds off
        $('[id^=sui-transMinSeg-]').css('border-color', '#fff'); // All borders off
        $('[id^=sui-transMinSeg-]').css('background-color', '#fff'); // All backgrounds off
        $('#sui-transMinSeg-' + num).css('border-color', '#999'); // Hilite active one
        $('#sui-transMinSeg-' + num).css('background-color', '#eee'); // Hilite active one
        $('#sui-transSeg-' + num).css('background-color', '#aaa'); // Hilite active one
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // HELPER FUNCTIONS
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    TimecodeToSeconds(
        timecode // CONVERT TIMECODE TO SECONDS
    ) {
        var h = 0,
            m = 0;
        var v = ('' + timecode).split(':'); // Split by colons
        var s = v[0]; // Add them
        if (v.length == 2) {
            // Just minutes, seconds
            s = v[1];
            m = v[0];
        } // Add them
        else if (v.length == 3) {
            // Hours, minutes, seconds
            s = v[2];
            m = v[1];
            h = v[0];
            // Add them
        }
        return Number(h * 3600) + Number(m * 60) + Number(s); // Convert
    }

    SecondsToTimecode(
        secs // CONVERT SECONDS TO TIMECODE
    ) {
        var str = '',
            n;
        n = Math.floor(secs / 3600); // Get hours
        if (n) str += n + ':'; // Add to tc
        n = Math.floor(secs / 60); // Get mins
        if (n < 10) str += '0'; // Add leading 0
        str += n + ':'; // Add to tc
        n = Math.floor(secs % 60); // Get secs
        if (n < 10) str += '0'; // Add leading 0
        str += n; // Add to tc
        //	str+="."+Math.round((secs-Math.floor(secs))*10);										// Add fractional
        return str; // Return timecode
    }
} // AudioVideo class closure
