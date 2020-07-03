/* 	MANDALA SEARCH UI ****************************************************************************************************************************

	USE CASE 1:
	When allocated, attaches a <div> framework containing a search button in the top white bar of the Mandala app.
	When clicked, it will expand to cover the entire screen. 
	An sui=open message is sent to host.
	When a SOLR query is needed, a JSON formatted version of the search object is sent to host uoing a sui=query message.
	The host responds with a SOLR query.
	When an item has been selected, a sui=page message is sent to host and the host navigates there.
	The UI retreats to only the search button.
	A sui=close message is sent to host.

	USE CASE 2:

	Requires: 	jQuery 												// Almost any version should work
	Calls:		kmapsSolrUtil.js, [places.js, pages.js, texts.js,	// Other JS modules that are dynamically loaded (not used in plain search)
				audiovideo.js, visuals.js, sources.js, subjects.js]				
	CSS:		searchui.css										// All styles are prefixed with 'sui-'
	JS:			ECMA-6												// Uses lambda (arrow) functions
	Images:		loading.gif, gradient.jpg, treebuts.png
	Globals:	sui													// Needs to be declared globally!
	Usage: 		var sui=new SearchUI();								// Allocs SearchUI class (fully encapsulated)
	Messages: 	sui=page|url ->										// Hides search and send url to direct Drupal to display
				sui=open|searchState ->								// Tells Drupal search page is open w/ current search state (ss object)
				sui=query|searchState ->							// Asks Drupul to turn search state (JSON) into SOLR query string
				sui=close ->										// Tells Drupal search page is closed
				-> sui=open|[searchState] 							// Open search page is to search state
				-> sui=close										// Close search page

**********************************************************************************************************************************************/
/* eslint-disable */

import $ from 'jquery';
import KmapsSolrUtil from './kmapsSolrUtil';

export default class SearchUI {
    constructor(
        site,
        useProdIndex // CONSTRUCTOR
    ) {
        this.sui = this;
        this.curResults = ''; // Returns results
        this.numItems = 0; // Number of items
        this.AND = 'AND';
        this.OR = 'OR';
        this.NOT = 'NOT'; // Boolean display names
        this.ss = {}; // Holds search state
        this.site = site; // Site to use
        this.facets = {};
        this.facets.assets = {
            type: 'list',
            icon: '&#xe60b',
            mode: null,
            data: [],
        }; // Assets
        this.facets.places = {
            type: 'tree',
            icon: '&#xe62b',
            mode: null,
            data: [],
        }; // Places
        this.facets.features = {
            type: 'tree',
            icon: '&#xe638',
            mode: null,
            data: [],
        }; // Features
        this.facets.subjects = {
            type: 'tree',
            icon: '&#xe634',
            mode: null,
            data: [],
        }; // Subjects
        this.facets.terms = {
            type: 'tree',
            icon: '&#xe635',
            mode: null,
            data: [],
        }; // Terms
        this.facets.collections = {
            type: 'list',
            icon: '&#xe633',
            mode: null,
            data: [],
        }; // Collections
        this.facets.languages = {
            type: 'tree',
            icon: '&#xe670',
            mode: null,
            data: [],
        }; // Languages
        this.facets.users = {
            type: 'input',
            icon: '&#xe600',
            mode: null,
            data: [],
        }; // Terms

        this.assets = {};
        this.assets.all = { c: '#5b66cb', g: '&#xe60b' }; // All assets
        this.assets.places = { c: '#6faaf1', g: '&#xe62b' }; // Places
        this.assets['audio-video'] = { c: '#58aab4', g: '&#xe648' }; // AV
        this.assets.images = { c: '#b49c59', g: '&#xe62a' }; // Images
        this.assets.sources = { c: '#5a57ad', g: '&#xe631' }; // Sources
        this.assets.texts = { c: '#8b5aa1', g: '&#xe636' }; // Texts
        this.assets.visuals = { c: '#6e9456', g: '&#xe63b' }; // Visuals
        this.assets.subjects = { c: '#cc4c39', g: '&#xe634' }; // Subjects
        this.assets.terms = { c: '#a2733f', g: '&#xe635' }; // Terms
        this.assets.collections = { c: '#5b66cb', g: '&#xe633' }; // Collections
        this.searches = []; // Saves recent searches
        this.showBool = false; // Where to show Boolean in advanced
        this.showSearch = false; // Click to search or add facet

        this.noTop = site == 'CU' ? true : false; // Has a top
        $('<link/>', {
            rel: 'stylesheet',
            type: 'text/css',
            href: 'searchui.css',
        }).appendTo('head'); // Load CSS

        this.solrId = useProdIndex ? '_prod' : '_dev'; // Set solrId
        this.solrBase =
            'https://' +
            (useProdIndex ? 'ss395824' : 'ss251856') +
            '-us-east-1-aws.measuredsearch.com/solr/'; // Solr base
        this.ss.solrUrl =
            this.solrBase +
            'kmassets' +
            (useProdIndex ? '' : '_dev') +
            '/select'; // Full url
        this.ss.mode = 'input'; // Current mode - can be input, simple, or advanced
        this.ss.view = 'Card'; // Dispay mode - can be List, Grid, or Card
        this.ss.sort = 'Alpha'; // Sort mode - can be Alpha, Date, or Author
        this.ss.page = 0; // Current page being shown
        this.ss.pageSize = 100; // Results per page
        this.ss.site = 'Mandala'; // Site
        this.ss.numResults = 0; // Number of resulrts found
        this.solrUtil = new KmapsSolrUtil({ solrUrl: this.ss.solrUrl }); // Alloc Yuji's search class and pass defaultState
        this.ClearQuery(); // Cleae our all search elements in query
        // this.AddFrame();																			// Add div framework

        // if (!window.location.hash)	{																	// Normal startup
        // 	this.Draw(); 																			// Draw
        // }
        // window.onresize=()=> { 																		// ON RESIZE
        // 	if (this.ss.mode == "advanced") 														// Advanced search
        // 		$("#sui-content").css({ width:$("#sui-main").width()-$("#sui-adv").width() });			// Size results area
        // };

        // window.addEventListener("popstate", (h)=> { 												// ON PAGE STATE CHANGE
        // 	let state=h.state;																		// Get state
        // 	if (!state)	state=window.location.hash;														// If no state, get directly from hash
        // 	this.PageRouter(state); 																// Route on state
        // 	});
    }

    // AddFrame()																					// ADD DIV FRAMEWORK FOR APP
    // {
    // 	alert("addFrame()");
    // 	console.error("AddFrame() called!");
    // 	return;
    //
    // 	let key;
    // 	this.showBool=this.GetCookie("showBool") == "true";
    // 	var str="";
    // 	if (this.site != "CU") str+=`<div class='sui-topBar'><img src='img/bhutanleft.gif' style='cursor:pointer' onclick='alert("draw landing page")' title='Home page'></div>
    // 		<div id='sui-top' class='sui-top'>
    // 		<div style='display:inline-block'>
    // 		<div class='sui-search1'>
    // 				<input type='text' id='sui-search' class='sui-search2' placeholder='Enter Search'>
    // 				<div id='sui-clear' class='sui-search3'>&#xe610</div>
    // 			</div>
    // 			<div id='sui-searchgo' class='sui-search4'>&#xe623</div>
    // 			<div id='sui-mode' class='sui-search5' title='Advanced search'>ADVANCED<br>SEARCH</div>
    // 			<div id='sui-hamBut' class='sui-hamBut' title='Help + options'>&#xe627</div>
    // 			</div>
    // 		</div>
    // 	<div>`;
    // 	str+=`<div id='sui-content' class='sui-content'>
    // 		<div id='sui-header' class='sui-header'>
    // 			<div id='sui-contentHead' class='sui-contentHead'></div>
    // 		</div>
    // 		<div id='sui-legacy' class='sui-legacy scrollbar' style='color:#000'></div>
    // 	</div>
    // 	<div id='sui-adv' class='sui-adv'>`;
    // 	for (key in this.facets) {
    // 			str+=`<div class='sui-advBox' id='sui-advBox-${key}'>
    // 			<div class='sui-advHeader' id='sui-advHeader-${key}'>
    // 				${this.facets[key].icon}&nbsp;&nbsp;${key.toUpperCase()}
    // 				<span id='sui-advPlus-${key}' style='float:right'>&#xe669 </span></div>
    // 				<div class='sui-advTerm' id='sui-advTerm-${key}'></div>
    // 			<div class='sui-advEdit' style='display:none' id='sui-advEdit-${key}'></div></div>`;
    // 			if ((key == "terms") || (key == "users")) str+="<hr style='border-top:8px solid #ddd;margin:16px 0 16px 12px'>";
    // 			}
    // 	str+=`<div class='sui-advBox' id='sui-advBox-recent'>
    // 		<div class='sui-advHeader' id='sui-advHeader-recent'>&#xe62e&nbsp;&nbsp;RECENT SEARCHES
    // 		<span id='sui-advPlus-recent' style='float:right'>&#xe669</span></div>
    // 		<div class='sui-advTerm'></div>
    // 		<div class='sui-advEdit' style='display:none' id='sui-advEdit-recent'></div></div>
    // 		<div style='margin-top:4px;float:right;font-size:13px'>
    // 			<div>Show Boolean controls? &nbsp;<input type='checkbox' id='sui-showBool' ${this.showBool ? "checked" : ""}></div>
    // 			<!-- div class='sui-geoLocate' id='sui-geoLocate'>Geo-Locate</div-->
    // 		</div>
    // 	</div>
    // 	<div id='sui-footer' class='sui-footer'></div></div>
    // 	<div class='sui-hamburger' id='sui-hamburger'></div>`;
    //
    // 	$("#sui-main").html(str.replace(/\t|\n|\r/g,""));											// Remove formatting and add framework to main div
    // 	// $("#sui-advHeader-assets").html($("#sui-advHeader-assets").html().replace(/Assets/i,"ITEM TYPE"));  // Rename assets
    // 	$("#sui-clear, sui-clear2").on("mouseover",function() { $(this).html("&#xe60d"); });		// Highlight
    // 	$("#sui-clear, sui-clear2").on("mouseout", function() { $(this).html("&#xe610"); });		// Normal
    // 	$("#sui-clear, sui-clear2").on("click",()=> { 												// ON ERASE
    // 		$("#sui-search").val("");	this.ClearQuery(); 											// Clear input and query
    // 		this.Query(); 																			// Load and redraw
    // 		});
    //
    // 	$("#sui-search").on("change", (e)=> { 														// ON SEARCH CHANGE
    // 		this.ss.query.text=$("#"+e.currentTarget.id).val(); 									// Get query
    // 		$("#sui-search").val(this.ss.query.text);												// Set top search
    // 		if ((this.ss.mode == "input") || (this.ss.mode == "related")) this.ss.mode="simple";	// Toggle simple mode
    // 		if (this.ActiveSearch(false)) this.ss.mode="advanced";									// Some advanced search items set, open advanced search
    // 		this.ss.page=0;																			// Start at beginning
    // 		this.Query(); 																			// Load and redraw
    // 		});
    //
    // 	$("#sui-searchgo, #sui-searchgo2").on("click", (e)=> { 										// ON SEARCH BUTTON CLCK
    // 		if ((this.ss.mode == "input") || (this.ss.mode == "related") ) this.ss.mode="simple";	// Toggle simple mode
    // 		if (this.ActiveSearch(false)) this.ss.mode="advanced";									// Some advanced search items set, open advanced search
    // 		this.ss.page=0;																			// Start at beginning
    // 		this.Query(); 																			// Load and redraw
    // 		});
    //
    // 	$("#sui-mode").on("click",()=> { 															// ON CHANGE MODE
    // 		this.ShowAdvanced((this.ss.mode == "advanced") ? false : true);							// Toggle advanced menu
    // 		});
    //
    // 	$("#sui-showBool").on("click",()=> { 														// ON CHANGE BOOLEAN
    // 		this.showBool=!this.showBool;															// Toggle flag
    // 		this.SetCookie("showBool", this.showBool);												// Set cookie
    // 		this.DrawAdvanced();																	// Draw search UI
    // 		});
    // 	$("#sui-geoLocate").on("click",()=> { 														// ON GEO LOCATE
    // 		this.GeoLocate();																		// Show geolocation
    // 		});
    //
    // 	$("[id^=sui-advHeader-]").on("click",(e)=> {												// ON FACET HEADER CLICK
    // 		var id=e.currentTarget.id.substring(14);												// Get facet name
    // 		$(".sui-advEdit").slideUp(400, ()=> {													// Close any open tree or lists
    // 			$("[id^=sui-advHeaderBox-]").css("border","solid")									// Reset them all to closed
    // 		$("[id^=sui-advPlus-]").html("&#xe669");												// Reset them all to closed
    // 		if ($("#sui-advEdit-"+id).css("display") != "none")	{									// If open
    // 			$("#sui-advPlus-"+id).html("&#xe66a");												// Show open
    // 			$("#sui-advHeaderBox-"+id).css("border-top-style","hidden")							// Hide border
    // 			}
    // 		});
    // 		$("#sui-advPlus-"+id).html("&#xe66a");													// Show open
    //
    // 		for (var key in this.facets)															// For each facet
    // 			if (this.facets[key] == "list")														// If a list
    // 				$("#sui-advEdit-"+key).html("");												// Erase contents
    // 		this.DrawFacetItems(id);																// Draw appropriate tree, list, or input
    // 		});
    //
    // 	$("#sui-main").on("click",(e)=>{															// ON CLICK OF RESULTS PAGE
    // 		this.pages.ClearPopover();																// Clear popover
    // 		if (e.target.id != "sui-hamBut") $("#sui-hamburger").slideUp();							// Hide hanburderv menu if open
    // 		});
    // 	$("#sui-hamBut").on("click",()=>{ this.ShowHamburger() });									// SHOW HAMBURGER MENU
    // 	if (this.noTop)	$("#sui-content").css({ top:0, height:"calc(100% - 30px)" });
    // }

    Draw(
        mode // DRAW SEARCH COMPONENTS
    ) {
        //console.log("Draw called!");
        //console.log("searchui.Draw called with " + JSON.stringify(arguments));
        if (mode) this.ss.mode = mode; // If mode spec'd, use it
        this.DrawResults(); // Draw results page if active
        // this.DrawAdvanced();																		// Draw search UI if active
    }

    ShowAdvanced(
        mode // HIDE/SHOW ADVANCED MENU
    ) {
        throw new Error('ShowAdvanced');
        this.ss.mode = mode ? 'advanced' : 'simple'; // Set mode
        $('#sui-adv').css({ display: mode ? 'block' : 'none' }); // Hide/show adv ui
        if (mode)
            $('#sui-content').css({
                width: $('#sui-main').width() - $('#sui-adv').width() + 'px',
            });
        // Size results area to fit advanced
        else $('#sui-content').css({ width: $('#sui-main').width() + 'px' }); // 100%
        this.DrawAdvanced(); // Draw search UI if active
    }

    ShowHamburger() { // SHOW HAMBURGER MENU
        let str = `<span id='sui-help' class='sui-hamItem'>&#xe67e&nbsp;&nbsp;HELP GUIDE</span>
		<span id='sui-home' class='sui-hamItem'>&#xe60b&nbsp;&nbsp;HOME</span>`;
        $('#sui-hamburger').html(str.replace(/\t|\n|\r/g, '')); // Remove formatting and add to menu
        $('#sui-hamburger').slideToggle(); // Open or close
        $('#sui-home').on('click', () => {
            alert('DrawLandingPage()');
        }); // Go home
        $('#sui-help').on('click', () => {
            window.open(
                '//confluence.its.virginia.edu/display/KB/Mandala+Suite+of+Tools',
                '_blank'
            );
        }); // Show help
        $('#sui-hamburger').on('click', () => {
            $('#sui-hamburger').slideUp();
        }); // Close
    }

    /*	PAGE STATE  ////////////////////////////////////////////////////////////////////////////////////
	
	Controls the forward/back buttons  and the bookmarking for the standlone version.
	It uses the HTML5 History API. When page is navigated to programatically, SetState() is called.
	It's state parameter contains information identifying the page via it's kmapId
	This is added as a hash value to the browser's search bar for bookmarking.
	It is added to the browser history for the browser's forward/back buttons.

	A listener to the 'hashchanged' event calls PageRouter() with that kmpaId, and
	thsat page is drawn on the screen.
	
	OPTIONS:
	#p=kmapId		// Shows page that has kmapid

///////////////////////////////////////////////////////////////////////////////////////////////// */

    SetState(
        state // SET PAGE STATE
    ) {
        const here = window.location.href.split('#')[0]; // Remove any hashes
        window.history.pushState(
            '#' + state,
            'Mandala',
            here + (state ? '#' + state : '')
        ); // Show current state search bar
    }

    PageRouter(
        hash // ROUTE PAGE BASED ON QUERY HASH OR BACK BUTTON
    ) {
        //console.log ("PageRouter called.");
        const sui = this.sui;
        const here = window.location.href.split('#')[0]; // Remove any hashes
        let id;
        if ((id = hash.match(/#p=(.+)/))) {
            // If a page
            id = id[1].toLowerCase(); // Isolate kmap id
            setupPage(); // Prepare page's <div> environment
            this.alert(
                '======== PAGEROUTER: ' + hash + ' Handling p: Drawing ' + id
            );
            this.log('	PAGEROUTER: calling pages.Draw() with id=' + id);
            this.GetKmapFromID(id, (kmap) => {
                this.log(
                    '	PAGEROUTER: calling pages.Draw() with kmap=' + kmap.uid
                );
                this.pages.Draw(kmap, true);
            }); // Get kmap and show page
        } else if ((id = hash.match(/#r=(.+)/))) {
            // If showing related results
            setupPage(); // Prepare page's <div> environment
            let v = id[1].replace(/\%20/g, ' ').split('='); // Get ids
            this.pages.relatedId = v[0];
            this.pages.relatedType = v[2]; // Set factors
            this.alert(
                '======== PAGEROUTER: ' +
                    hash +
                    ' Handling r: calling getKmapFromID with id = ' +
                    v[3] +
                    ' this.pages.relatedId=' +
                    this.pages.relatedId +
                    ' this.pages.relatedType=' +
                    this.pages.relatedType
            );
            this.GetKmapFromID(v[3], (kmap) => {
                this.pages.relatedBase = kmap;
                //console.log("	PAGEROUTER handling callback.  calling pages.DrawRelatedResults with kmap uid = " + kmap.uid);
                this.pages.DrawRelatedResults(kmap, true);
            }); // Get kmap and show page
        } else if ((id = hash.match(/#s=(.+)/))) {
            // If showing search results
            setupPage(); // Prepare page's <div> environment
            id = id[1].replace(/\%20/g, ' '); // Get ids
            this.ParseQuerystring(id); // Get query
            this.alert(
                '======== PAGEROUTER: ' +
                    hash +
                    ' Handling s: Parsing querystring: ' +
                    id +
                    ' set ss.query.text to ' +
                    ss.query.text
            );
            $('#sui-search').val(this.ss.query.text); // Set top search
            this.Query(true); // Run query
        }

        function setupPage() {
            // PREPARES <DIV> TO DRAW NEW PAGE
            sui.ss.mode = 'simple'; // Simple display mode
            sui.ss.page = 0; // Start at beginning
            $('#sui-legacy').scrollTop(0); // Scroll to top
            $('#sui-content').scrollTop(0); // Scroll to top
            $('#plc-infoDiv').remove(); // Remove map buttons
            $('#sui-content').css({ width: '100%', display: 'inline-block' }); // Size and show results area
            $('#sui-adv').css({ display: 'none' }); // Hide search ui
            $('#sui-legacy').css({ display: 'block' }); // Show page
            sui.DrawHeader(true);
            sui.DrawFooter(); // Redraw header and footer
        }
    }

    SerializeQuery(
        q // SERIALZE QUERY INTO STRING
    ) {
        let i,
            f,
            str = '';
        this.ss.query.assets = [this.ss.query.assets[0]]; // Keep only 1st asset *************************** ASSETS1
        for (f in q.query) {
            // For each facet type
            if (f == 'text' && q.query[f])
                // If text spec'd
                str += `${f}:${q.query[f]}=`;
            // Add it
            // All other facets
            else
                for (
                    i = 0;
                    i < q.query[f].length;
                    ++i // For each item
                )
                    str += `${f}:${q.query[f][i].title}:${q.query[f][i].id}:${q.query[f][i].bool}=`; // Add it
        }
        return str.slice(0, -1); // Remove last '+'
    }

    ParseQuerystring(
        qString // PARSE QUERY FROM STRING
    ) {
        let i, v, o;
        let fs = qString.split('='); // Split parts
        this.ClearQuery(); // Clear search query
        this.ss.query.assets = []; // Clear assets ********************************** ASSETS1
        for (i = 0; i < fs.length; ++i) {
            // For each term
            if (fs[i].match(/^text/)) {
                this.ss.query.text = fs[i].substr(5);
            } // Get text
            else {
                // Get all other facets
                v = fs[i].split(':'); // Get parts
                o = { title: v[1], id: v[2], bool: v[3] }; // Make search item
                this.ss.query[v[0]].push(o); // Add
            }
        }
        this.ss.query.assets = [this.ss.query.assets[0]]; // Keep only 1st asset *************************** ASSETS1
    }

    /*	QUERY TOOLS //////////////////////////////////////////////////////////////////////////////////

	A series of functions that manage the search process. The state of the current search is
	saved in the ss object. It is initialized using InitSearchState(). The UI modifies the ss 
	object to the search parameters desired and Query() uses Yuji's query builder to get a query
	URL for SOLR. The results come in, they are displayed. The lists in the advsnced UI are also 
	filtered to reflect the current possible options based on that search.

	There are 3 modes of the search. A general qwery, as described above. The standalone version
	adds search of assets related to a kmapId, and a query to get the kmaps in a given collection.

//////////////////////////////////////////////////////////////////////////////////////////////  */

    ClearQuery() { // CLEAR SEARCH QUERY STATE TO START
        $('#sui-search').val(''); // Clear input field
        if (this.pages) this.pages.relatedBase = this.pages.relatedId = ''; // Clear relateds
        this.ss.page = 0; // Start of page 0
        this.ss.query = {
            // Current query
            text: '', // Search word
            places: [], // Places
            collections: [], // Collections
            languages: [], // Languages
            features: [], // Feature types
            subjects: [], // Subjects
            terms: [], // Terms
            relationships: [], // Relationships
            users: [], // Users
            assets: [{ title: 'All', id: 'all', bool: 'AND' }], // Assets
            termPerspective: '',
            subjectPerspective: '',
            placePerspective: '', // Perspectives
            view: '', // View
        };
    }

    //

    //
    Query(
        fromHistory,
        collectionId // QUERY AND UPDATE RESULTS
    ) {
        //console.log("Query() called with fromHistory = " + fromHistory + " collectionId =  " + collectionId);
        let url;
        this.LoadingIcon(true, 64); // Show loading icon

        if (collectionId) {
            // If getting collection members
            //console.log("	SearchUI.Query: collection mode");
            let ts = JSON.parse(JSON.stringify(this.ss)); // Clone search
            ts.query = {
                text: '',
                places: [],
                assets: [{ id: this.pages.relatedType, bool: 'AND' }],
                languages: [],
                features: [],
                subjects: [],
                terms: [],
                relationships: [],
                users: [],
                perspectives: [],
                collections: [{ title: 'all', id: collectionId, bool: 'AND' }],
            }; // Set new search
            url = this.solrUtil.buildAssetQuery(ts); // Set url
        } else if (this.ss.mode == 'related') {
            //console.log("	SearchUI.Query: related mode");
            url = this.solrUtil.createKmapQuery(
                this.pages.relatedId.toLowerCase(),
                this.pages.relatedType.toLowerCase(),
                this.ss.page,
                this.ss.pageSize
            );
        } // Get assets related to relatedId
        else {
            //console.log("	SearchUI.Query: asset mode");
            url = this.solrUtil.buildAssetQuery(this.ss);
        } // Get assets that match query
        if (this.ss.mode != 'related' && !fromHistory) {
            // These set their own states and not from history API
            //console.log("	SearchUI.Query: default mode");
            this.SetState('s=' + this.SerializeQuery(this.ss)); // Save search state
        }
        $('#sui-relatedAssets').remove(); // Remove related assets panel
        if (this.ActiveSearch()) {
            // If an active search
            this.searches.filter((s, i) => {
                // Check to see if it already exists in list
                if (JSON.stringify(s.query) === JSON.stringify(this.ss.query))
                    // It does
                    this.searches.splice(i, 1); // Remove old one
            });
            this.searches.push(JSON.parse(JSON.stringify(this.ss))); // Add to recent searches
        }
        $.ajax({ url: url, dataType: 'jsonp', jsonp: 'json.wrf' })
            .done((data) => {
                // Get data from SOLR
                //console.log ("	SearchUI.Query: got data back from SOLR query: " + url);
                //console.dir(data);
                this.curResults = this.MassageKmapData(data.response.docs); // Normalize for display
                this.ParseFacetData(data); // Get facet data counts
                this.LoadingIcon(false); // Hide loading icon
                this.DrawResults(); // Draw results page if active
                // this.DrawAdvanced();																	// Draw advanced search if active
            })
            .fail((msg) => {
                //console.log(msg);
                this.LoadingIcon(false);
                this.Popup('Query error');
            }); // Failure message
    }

    GetKmapFromID(
        id,
        callback // GET KMAP FROM ID
    ) {
        //console.log("GetKmapFromID() called with id=" + id);
        var url = this.ss.solrUrl + '?q=uid:' + id.toLowerCase() + '&wt=json';
        //console.log("SOLR QUERY GetKmapFromID() = " + url);// Set query url
        $.ajax({ url: url, dataType: 'jsonp', jsonp: 'json.wrf' })
            .done((data) => {
                // Get kmap

                try {
                    data = this.MassageKmapData(data.response.docs[0]); // Normalize kmap
                } catch (error) {
                    data.error = error;
                }
                callback(data); // Return kmap
            })
            .fail((msg) => {
                console.log(msg);
            }); // Failure message
    }

    GetDefinitionAssets(
        id,
        callback // GET TAGGED ASSETS TO TERM
    ) {
        let url =
            this.ss.solrUrl + '?q=kmapid:' + id.toLowerCase() + '&wt=json'; // Set query url
        $.ajax({ url: url, dataType: 'jsonp', jsonp: 'json.wrf' })
            .done((data) => {
                // Get kmap
                data = this.MassageKmapData(data.response.docs); // Normalize kmap
                callback(data); // Return kmaps
            })
            .fail((msg) => {
                console.log(msg);
            }); // Failure message
    }

    GetRelatedFromID(
        id,
        callback // GET RELATED THINGS FROM ID
    ) {
        this.log('GetRelatedFromID() called with arguments');
        //console.log(JSON.stringify(arguments));
        let url = `${this.solrBase}kmterms${this.solrId}/query`; // Base url
        url +=
            '?child_count.fq=related_kmaps_node_type:child&child_count.fl=uid&fq=!related_kmaps_node_type:parent';
        url +=
            "&child_count.rows=0&fl=child_count:[subquery],*&child_count.q={!child%20of='block_type:parent'}";
        url +=
            '{!term%20f=uid%20v=$row.related_subjects_id_s}&rows=2000&q=id:' +
            id +
            '%20OR%20{!child%20of=block_type:parent}id:' +
            id +
            '%20&sort=block_type%20DESC,%20related_subjects_header_s%20ASC';
        this.log('SOLR QUERY GetRelatedFromID():  query = ' + url);
        $.ajax({ url: url, dataType: 'jsonp', jsonp: 'json.wrf' })
            .done((data) => {
                // Get kmap
                this.log('GetRelatedFromID() returns ' + data);
                //console.dir(data);
                callback(data.response.docs); // Return data
            })
            .fail((msg) => {
                console.log(msg);
            }); // Failure message
    }

    GetRelatedPlaces(
        id,
        callback // GET RELATED THINGS FROM ID
    ) {
        this.LoadingIcon(true, 64); // Show loading icon
        var url = this.solrUtil.createKmapQuery(id, 'places', 0, 10000); // Make query url
        $.ajax({ url: url, dataType: 'jsonp', jsonp: 'json.wrf' })
            .done((data) => {
                // Get data from SOLR
                data = this.MassageKmapData(data.response.docs); // Normalize for display
                this.LoadingIcon(false); // Hide loading icon
                callback(data); // Return data
            })
            .fail((msg) => {
                console.log(msg);
                this.LoadingIcon(false);
                this.Popup('Related query error');
            }); // Failure message
    }

    GetChildNamesFromID(
        facet,
        id,
        callback // GET NAMES/ETYMOLGY DATA FROM ID
    ) {
        let url = `${this.solrBase}kmterms${this.solrId}/select?fl=uid%2C%5Bchild%20childFilter%3Did%3A${facet}-${id}_names-*%20parentFilter%3Dblock_type%3Aparent%5D&q=uid%3A${facet}-${id}&wt=json&rows=300`;
        $.ajax({ url: url, dataType: 'jsonp', jsonp: 'json.wrf' })
            .done((data) => {
                // Get kmap
                callback(data.response.docs); // Return data
            })
            .fail((msg) => {
                console.log(msg);
            }); // Failure message
    }

    GetChildDataFromID(
        uid,
        callback // GET CHILD DATA FROM ID
    ) {
        let url = `${this.solrBase}kmterms${this.solrId}/query?q=uid:${uid}&wt=json&fl=*,[child%20parentFilter=block_type:parent%20limit=300]`;
        //console.log("SOLR QUERY GetChildDataFromID = " + url);
        $.ajax({ url: url, dataType: 'jsonp', jsonp: 'json.wrf' })
            .done((data) => {
                // Get kmap
                callback(data.response.docs[0]); // Return data
            })
            .fail((msg) => {
                console.log(msg);
            }); // Failure message
    }

    GetTreeChildren(
        facet,
        path,
        callback // GET CHILDREN OF TREE LIMB
    ) {
        const sui = this.sui;
        let base = `${this.solrBase}kmterms${this.solrId}`; // Base url
        let lvla = Math.max(path.split('/').length + 1, 2); // Set level
        if (facet == 'features' || facet == 'languages') facet = 'subjects'; // Features and languages are in subjects
        var url = sui.solrUtil.buildQuery(base, facet, path, lvla, lvla); // Build query using Yuji's builder
        $.ajax({ url: url, dataType: 'jsonp' })
            .done((res) => {
                // Get children
                callback(res); // Return dats
            })
            .fail((msg) => {
                console.log(msg);
            }); // Failure message
    }

    GetAudioFromID(
        id,
        callback // GET AUDIO FILE FROM ID
    ) {
        $.getJSON(
            '//terms.kmaps.virginia.edu/slices/' + id + '/recordings',
            (d) => {
                // Get info
                let i,
                    r = [];
                try {
                    for (
                        i = 0;
                        i < d.recordings.length;
                        ++i // For each recording
                    )
                        r.push(d.recordings[i].audio_file); // Add to array
                    callback(r);
                } catch (e) {} // Return audio file urls as array
            }
        ).fail((msg) => {
            console.log(msg);
        }); // Failure message
    }

    GetJSONFromKmap(
        kmap,
        callback // GET JSON FROM KMAP
    ) {
        var url = kmap.url_json; // Get json
        if (!url) return; // No asset type
        url = url.replace(
            /images.shanti.virginia.edu/i,
            'images-dev.shanti.virginia.edu'
        ); // Look in dev
        url = url.replace(/https:|http:/i, ''); // Strip off http
        url += '?callback=myfunc'; // Add callback
        if (kmap.asset_type == 'audio-video' || kmap.subcollection_uid_ss)
            // AV or collection
            url = url.replace(/.json/i, '.jsonp'); // Json to jsonp
        $.ajax({
            url: url,
            dataType: 'jsonp',
            error: (xhr) => {
                this.Popup('JSON access error');
            },
        }).done((data) => {
            callback(data);
        }); // Get JSON and send to callback
    }

    MassageKmapData(
        data // MASSAGE KMAP RESPONSE FOR DISPLAY
    ) {
        var i, o;
        for (i = 0; i < data.length; ++i) {
            // For each result, massage data
            o = data[i]; // Point at item
            if (o.asset_subtype)
                o.asset_subtype =
                    o.asset_subtype.charAt(0).toUpperCase() +
                    o.asset_subtype.slice(1);
            if (o.url_thumb)
                o.url_thumb = o.url_thumb.replace(/images-test/i, 'images'); // Force to prod
            if (o.asset_type == 'places') {
                // If places
                if (o.ancestors_txt && o.ancestors_txt.length)
                    o.ancestors_txt.splice(0, 1); // Remove "Earth" from trail
                if (o.ancestor_ids_is && o.ancestor_ids_is.length)
                    o.ancestor_ids_is.splice(0, 1); // And it's id
            }
            if (o.asset_type == 'texts') o.url_thumb = 'gradient.jpg';
            // Use gradient for texts
            else if (!o.url_thumb) o.url_thumb = 'gradient.jpg'; // Use gradient for generic
            if (o.display_label) o.title = o.display_label; // Get title form display
        }
        return data;
    }

    ParseFacetData(
        data // GET FACET COUNTS
    ) {
        let i,
            f,
            val,
            buckets,
            n = 0;
        for (f in this.assets) this.assets[f].n = 0; // Zero them out
        if (
            data &&
            data.facets &&
            data.facets.asset_counts &&
            data.facets.asset_counts.buckets
        ) {
            // If valid
            buckets = data.facets.asset_counts.buckets; // Point at buckets
            for (i = 0; i < buckets.length; ++i) {
                // For each bucket
                val = buckets[i].val; // Get name
                if (this.assets[val]) this.assets[val].n = buckets[i].count; // Set count
                n += buckets[i].count; // Add to count
            }
            this.ss.numResults = this.assets.all.n = n; // Set total count
        }
    }

    QueryFacets(
        facet,
        filter // QUERY AND UPDATE FACET OPTIONS
    ) {
        if (facet == 'users' || facet == 'relationships') return; // No facets for these
        this.LoadingIcon(true, 64); // Show loading icon
        let url = this.solrUtil.createBasicQuery(this.ss, [
            facet == 'assets' ? 'languages' : facet,
        ]); // Get query url (avoid assets)
        $.ajax({ url: url, dataType: 'jsonp', jsonp: 'json.wrf' }).done(
            (data) => {
                // Get facets
                let i, o, v;
                this.LoadingIcon(false); // Hide loading icon
                if (data.facets[facet]) {
                    // If something there
                    o = data.facets[facet].buckets; // Point at data
                    this.facets[facet].data = []; // Start fresh
                    for (i = 0; i < Math.min(300, o.length); ++i) {
                        // Get items
                        v = o[i].val.split('|'); // Split into parts
                        this.facets[facet].data.push({
                            title: v[0],
                            id: v[1],
                            n: o[i].count,
                        }); // Add to assets data
                    }
                }
                this.ResetFacetList(facet); // Reset list UI elements
            }
        );
    }

    /*	RESULTS ///////////////////////////////////////////////////////////////////////////////////////

	Show results based on the state of the search state object ss. When a Query() is run, 100
	results are paged at a time and shown in one of 3 display modes. A list mode, a full card mode,
	and a grid image mode.

///////////////////////////////////////////////////////////////////////////////////////////////  */

    DrawResults(
        noRefresh // DRAW RESULTS SECTION
    ) {
        this.log('DrawResults() called', arguments);

        $('#sui-content').scrollTop(0);
        $('#sui-legacy').scrollTop(0); // Scroll to top
        $('#sui-legacy').css({ 'background-image': '' }); // Remove any backgeound image
        $('#sui-legacy').css({ display: 'block' }); // Show results page
        $('#plc-infoDiv').remove(); // Remove map buttons

        if (this.ss.mode == 'related')
            this.numItems = this.assets[this.pages.relatedType].n;
        // Set number of items based on related type
        else this.numItems = this.assets[this.ss.query.assets[0].id].n; // Set number of items based on current asset being shown  ***ASSETS1
        if (this.ss.mode == 'input') {
            // Just the search box
            $('#sui-header').css({ display: 'none' }); // Show header
            $('#sui-header').css({
                display: 'inline-block',
                'background-color': '#4d59ca',
            }); // Show header
            $('#sui-content').css({ display: 'block', width: '100%' }); // Size and show left side

            $('#sui-adv').css({ display: 'none' }); // Hide search ui
            $('#sui-legacy').css({ display: 'none' }); // Hide results page
            return; // Quit
        } else if (this.ss.mode == 'simple') {
            // Simple search
            $('#sui-content').css({ width: '100%' }); // Size and show results area
            $('#sui-adv').css({ display: 'none' }); // Hide search ui
            $('#sui-content').slideDown(); // Slide down
            $('#sui-content').css({ width: $('#sui-main').width() }); // Size and results area 100%
        } else if (this.ss.mode == 'advanced') {
            // Advanced search
            $('#sui-adv').css({ display: 'block' }); // Show search ui
            $('#sui-content').css({
                width: $('#sui-main').width() - $('#sui-adv').width(),
            }); // Size results area to fit advanced
        }
        $('#sui-mode').prop({
            title:
                this.ss.mode == 'advanced' ? 'Basic search' : 'Advanced search',
        }); // Set tooltip
        $('#sui-mode').html(
            this.ss.mode == 'advanced'
                ? 'BASIC<br>SEARCH'
                : 'ADVANCED<br>SEARCH'
        ); // Set mode icon
        $('#sui-header').css({ display: 'block' }); // Show header
        if (noRefresh) return; // Don't refresh page
        this.DrawHeader(); // Draw header
        this.DrawItems(); // Draw items
        this.DrawFooter(); // Draw footer
    }

    DrawHeader() { // DRAW RESULTS HEADER
        // alert("pages.DrawHeader called()");
        //console.log("pages.Drawheader called!");
        if (this.ss.mode == 'related') return; // Quit for special search modes
        var lastPage = Math.floor(this.numItems / this.ss.pageSize); // Calc last page
        var s = this.ss.page * this.ss.pageSize + 1; // Starting item number
        var e = Math.min(s + this.ss.pageSize, this.numItems); // Ending number
        var str = `<span style='vertical-align:-10px'>${this.ss.query.assets[0].title.toUpperCase()} search results &nbsp; <span style='font-size:12px'> (${s}-${e}) of ${
            this.numItems
        }	
		<div style='float:right;font-size:11px;margin:12px -48px 0 0'>
			<div id='sui-page1T' class='sui-resDisplay' title='Go to first page'>&#xe63c</div>
			<div id='sui-pagePT' class='sui-resDisplay' title='Go to previous page'>&#xe63f</div>
			<div class='sui-resDisplay'> PAGE <input type='text' id='sui-typePageT' 
			style='border:0;border-radius:4px;width:30px;text-align:center;vertical-align:1px;font-size:10px;padding:2px'
			title='Enter page, then press Return'> OF ${lastPage + 1}</div>
			<div id='sui-pageNT' class='sui-resDisplay' title='Go to next page'>&#xe63e</div>
			<div id='sui-pageLT' class='sui-resDisplay' title='Go to last page'>&#xe63d</div>
			</div>`;

        $('#sui-contentHead').html(str.replace(/\t|\n|\r/g, '')); // Remove format and add to div
        $('#sui-header').css('background-color', '#888'); // Set b/g color

        $('#sui-typePageT').val(this.ss.page + 1); // Set page number
        $('[id^=sui-page]').css('color', '#fff'); // Reset pagers
        if (this.ss.page == 0) {
            $('#sui-page1T').css('color', '#ddd');
            $('#sui-pagePT').css('color', '#ddd');
        } // No back
        if (this.ss.page == lastPage) {
            $('#sui-pageNT').css('color', '#ddd');
            $('#sui-pageLT').css('color', '#ddd');
        } // No forward
        $('#sui-page1T').on('click', () => {
            this.ss.page = 0;
            this.Query();
        }); // ON FIRST CLICK
        $('#sui-pagePT').on('click', () => {
            this.ss.page = Math.max(this.ss.page - 1, 0);
            this.Query();
        }); // ON PREVIOUS CLICK
        $('#sui-pageNT').on('click', () => {
            this.ss.page = Math.min(this.ss.page + 1, lastPage);
            this.Query();
        }); // ON NEXT CLICK
        $('#sui-pageLT').on('click', () => {
            this.ss.page = lastPage;
            this.Query();
        }); // ON LAST CLICK
        $('#sui-typePageT').on('change', () => {
            // ON TYPE PAGE
            var p = $('#sui-typePageT').val(); // Get value
            if (!isNaN(p))
                this.ss.page = Math.max(Math.min(p - 1, lastPage), 0); // If a number, cap 0-last
            this.Query(); // Get new results
        });
    }

    DrawFooter() { // DRAW RESULTS FOOTER
        var lastPage = Math.floor(this.numItems / this.ss.pageSize); // Calc last page
        if (this.ss.mode != 'related')
            $('#sui-footer').css('background-color', '#888'); // Set b/g color
        var str = `
		<div style='float:left;font-size:18px'>
			<div id='sui-viewModeList' class='sui-resDisplay' title='List view'>&#xe61f</div>
			<div id='sui-viewModeGrid' class='sui-resDisplay' title='Grid view'>&#xe61b</div>
			<div id='sui-viewModeCard' class='sui-resDisplay' title='Card view'>&#xe673</div>
		</div>	
		<div style='display:inline-block;font-size:11px'>
			<div id='sui-page1' class='sui-resDisplay' title='Go to first page'>&#xe63c</div>
			<div id='sui-pageP' class='sui-resDisplay' title='Go to previous page'>&#xe63f</div>
			<div class='sui-resDisplay'> PAGE <input type='text' id='sui-typePage' 
			style='border:0;border-radius:4px;width:30px;text-align:center;vertical-align:1px;font-size:10px;padding:2px'
			title='Enter page, then press Return'> OF ${lastPage + 1}</div>
			<div id='sui-pageN' class='sui-resDisplay' title='Go to next page'>&#xe63e</div>
			<div id='sui-pageL' class='sui-resDisplay' title='Go to last page'>&#xe63d</div>
			</div>	
		<div style='float:right;font-size:16px;'>
			<div id='sui-viewSortAlpha' class='sui-resDisplay' title='Sort alphabetically'>&#xe652</div>
			<div id='sui-viewSortDate'  class='sui-resDisplay' title='Sort by date'>&#xe60c</div>
			<div id='sui-viewSortAuthor' class='sui-resDisplay' title='Sort by author'>&#xe600</div>
			</div>`;
        $('#sui-footer').html(str.replace(/\t|\n|\r/g, '')); // Remove format and add to div

        $('#sui-typePage').val(this.ss.page + 1); // Set page number
        $('[id^=sui-viewMode]').css('color', '#ddd'); // Reset modes
        $('#sui-viewMode' + this.ss.view).css('color', '#fff'); // Highlight current mode
        $('[id^=sui-viewMode]').on('click', (e) => {
            // ON MODE CLICK
            this.ss.view = e.currentTarget.id.substring(12); // Get/set mode name
            this.DrawResults(); // Redraw
        });

        $('[id^=sui-viewSort]').css('color', '#ddd'); // Reset modes
        $('#sui-viewSort' + this.ss.sort).css('color', '#fff'); // Highlight current mode
        $('[id^=sui-viewSort]').on('click', (e) => {
            // ON SORT CLICK
            this.ss.sort = e.currentTarget.id.substring(12); // Get/set mode name
            if (this.ss.sort == 'Alpha')
                // Alpha sort
                this.curResults.sort(function (a, b) {
                    // Sort by title
                    if (a.title[0] > b.title[0]) return 1;
                    // Higher
                    else if (a.title[0] < b.title[0]) return -1;
                    // Lower
                    else return 0; // The same
                });
            else if (this.ss.sort == 'Date')
                // Date sort
                this.curResults.sort(function (a, b) {
                    // Sort by date
                    if (a.timestamp > b.timestamp) return 1;
                    // Higher
                    else if (a.timestamp < b.timestamp) return -1;
                    // Lower
                    else return 0; // The same
                });
            else if (this.ss.sort == 'Author')
                // User sort
                this.curResults.sort(function (a, b) {
                    // Sort by user
                    if (a.node_user > b.node_user) return 1;
                    // Higher
                    else if (a.node_user < b.node_user) return -1;
                    // Lower
                    else return 0; // The same
                });
            this.DrawResults(); // Redraw
        });

        $('[id^=sui-page]').css('color', '#fff'); // Reset pagers
        if (this.ss.page == 0) {
            $('#sui-page1').css('color', '#ddd');
            $('#sui-pageP').css('color', '#ddd');
        } // No back
        if (this.ss.page == lastPage) {
            $('#sui-pageN').css('color', '#ddd');
            $('#sui-pageL').css('color', '#ddd');
        } // No forward
        $('#sui-page1').on('click', () => {
            this.ss.page = 0;
            this.Query();
        }); // ON FIRST CLICK
        $('#sui-pageP').on('click', () => {
            this.ss.page = Math.max(this.ss.page - 1, 0);
            this.Query();
        }); // ON PREVIOUS CLICK
        $('#sui-pageN').on('click', () => {
            this.ss.page = Math.min(this.ss.page + 1, lastPage);
            this.Query();
        }); // ON NEXT CLICK
        $('#sui-pageL').on('click', () => {
            this.ss.page = lastPage;
            this.Query();
        }); // ON LAST CLICK
        $('#sui-typePage').on('change', () => {
            // ON TYPE PAGE
            var p = $('#sui-typePage').val(); // Get value
            if (!isNaN(p))
                this.ss.page = Math.max(Math.min(p - 1, lastPage), 0); // If a number, cap 0-last
            this.Query(); // Get new results
        });
    }

    // CALLS DrawCardItem(), DrawGridItem() or DrawListItem()
    // CALLS this.pages.DrawRelatedAssets()

    DrawItems() { // DRAW RESULT ITEMS
        //console.log("SearchUI.DrawItems()");
        var i,
            str = '';
        $('#sui-legacy').css({
            'background-color': this.ss.view == 'List' ? '#fff' : '#ddd',
        }); // White b/g for list only
        if (this.ss.mode == 'related')
            $('#sui-legacy').css({
                'padding-left': '204px',
                width: 'calc(100% - 216px',
            });
        // Shrink page
        else
            $('#sui-legacy').css({
                'padding-left': '12px',
                width: 'calc(100% - 24px',
            }); // Reset to normal size

        for (i = 0; i < this.curResults.length; ++i) {
            // For each result
            if (this.ss.view == 'Card') str += this.DrawCardItem(i);
            // Draw if shoing as cards
            else if (this.ss.view == 'Grid') str += this.DrawGridItem(i);
            // Grid
            else str += this.DrawListItem(i); // List
        }
        if (!this.curResults.length)
            // No results
            str =
                "<br><br><br><div style='text-align:center;color:#666'>Sorry, there were no items found<br>Try broadening your search</div>";

        // OUTPUT
        $('#sui-legacy').html(str.replace(/\t|\n|\r/g, '')); // Remove format and add to div

        // CALL
        if (this.ss.mode == 'related') this.pages.DrawRelatedAssets(); // Draw related assets menu

        // HANDLERS
        $('.sui-itemIcon').on('click', (e) => {
            // ON ICON BUTTON CLICK
            var num = e.currentTarget.id.substring(13); // Get index of result
            if (e.originalEvent.metaKey)
                window.open('#p=' + this.curResults[num].uid, '_blank');
            // Open in new window
            else
                this.SendMessage(
                    'page=' + this.curResults[num].url_html,
                    this.curResults[num]
                ); // Send message
            return false; // Stop propagation
        });
        $('[id^=sui-itemPic-]').on('click', (e) => {
            // ON ITEM CLICK
            var num = e.currentTarget.id.substring(12); // Get index of result
            if (e.originalEvent.metaKey)
                window.open('#p=' + this.curResults[num].uid, '_blank');
            // Open in new window
            else
                this.SendMessage(
                    'page=' + this.curResults[num].url_html,
                    this.curResults[num]
                ); // Send message
            return false; // Stop propagation
        });
        $('.sui-gridInfo').on('mouseover', (e) => {
            // ON INFO BUTTON HOVER
            var num = e.currentTarget.id.substring(13); // Get index of result
            var o = this.curResults[num]; // Point at item
            var str = '';
            if (o.title) str += '<b>' + o.title + '</b><br><br>'; // Add title
            str +=
                this.assets[o.asset_type].g +
                '&nbsp;&nbsp;' +
                o.asset_type.toUpperCase(); // Add type
            if (o.asset_subtype) str += ' / ' + o.asset_subtype; // Add subtype
            str += '<br>';
            if (o.creator)
                str += '<p>&#xe600&nbsp;&nbsp;' + o.creator.join(', ') + '</p>'; // Add creator
            if (o.summary || o.caption) {
                // If a summary or caption
                var s1 = o.summary || o.caption; // Use either summary or caption
                if (s1.length > 80) s1 = s1.substr(0, 80) + '...'; // Limit size
                str +=
                    "<p><div style='display:inline-block;background-color:#ccc;width:4px;height:18px;margin:2px 10px 0 5px;vertical-align:-4px'></div>&nbsp;<i>" +
                    s1 +
                    '</i></p>'; // Add summary
            }
            if (o.summary)
                str += "<p style='font-family:serif;'>" + o.summary + '</p>'; // Add summary
            var p = $('#' + e.currentTarget.id).offset(); // Get position
            this.Popup(str, 20, Math.max(8, p.left - 220), p.top + 24); // Show popup
        });
        $('.sui-gridInfo').on('mouseout', (e) => {
            $('#sui-popupDiv').remove();
        }); // ON INFO BUTTON OUT
        $('[id^=sui-itemTitle-]').on('click', (e) => {
            // ON TITLE CLICK
            var num = e.currentTarget.id.substring(14); // Get index of result
            if (e.originalEvent.metaKey)
                window.open('#p=' + this.curResults[num].uid, '_blank');
            // Open in new window
            else
                this.SendMessage(
                    'page=' + this.curResults[num].url_html,
                    this.curResults[num]
                ); // Send message
            return false; // Stop propagation
        });
        $('.sui-itemPlus').on('click', (e) => {
            // ON MORE BUTTON CLICK
            this.ShowItemMore(e.currentTarget.id.substring(13)); // Show more info below
        });
    }

    // NO SIDE EFFECTS
    // PASSED FROM CONTEXT:  this.curResults
    DrawListItem(
        num // DRAW A LIST ITEM
    ) {
        var i;
        var o = this.curResults[num]; // Point at list item
        var str = "<div class='sui-item'>";
        str +=
            "<div class='sui-itemPlus' id='sui-itemPlus-" +
            num +
            "'>&#xe669</div>";
        str +=
            "<div class='sui-itemIcon' id='sui-itemIcon-" +
            num +
            "' style='background-color:" +
            this.assets[o.asset_type].c +
            "'>";
        str +=
            "<a class='sui-noA' href='#p=" +
            o.uid +
            "'><span style='color:#fff'>" +
            this.assets[o.asset_type].g +
            '</span></a></div>'; // Add href for right click
        str += "<div class='sui-itemTitle' id='sui-itemTitle-" + num + "'>"; // Add
        str +=
            "<a class='sui-noA' href='#p=" +
            o.uid +
            "'>" +
            o.title +
            '</a></div>'; // Add href for right click
        if (o.feature_types_ss) {
            // If a feature
            str +=
                "<span style='color:" +
                this.assets[o.asset_type].c +
                "'>&nbsp;&bull;&nbsp;</span>"; // Add dot
            str +=
                "<div class='sui-itemFeature'>&nbsp;" +
                o.feature_types_ss.join(', ') +
                '</div>'; // Add feature(s)
        }
        str += "<div class='sui-itemId'>" + o.uid;
        if (o.collection_title)
            // If a collection
            str +=
                "<div style='text-align:right;margin-top:2px;'>&#xe633&nbsp;" +
                o.collection_title +
                '</div>'; // Add title
        str += '</div>'; // Close title div
        if (o.ancestors_txt && o.ancestors_txt.length > 1) {
            // If has an ancestors trail
            str += "<div class='sui-itemTrail'>"; // Holds trail
            for (i = 0; i < o.ancestors_txt.length; ++i) {
                // For each trail member
                str +=
                    "<span class='sui-itemAncestor' onclick='sui.SendMessage(\"page="; // Add ancestor
                str +=
                    'https://mandala.shanti.virginia.edu/' + o.asset_type + '/'; // URL stem
                str +=
                    o.ancestor_ids_is[i + 1] +
                    '/overview/nojs#search,' +
                    this.curResults[num] +
                    ")'>"; // URL end
                str +=
                    "<a href='#p=" +
                    o.uid +
                    "'>" +
                    o.ancestors_txt[i] +
                    '</a></span>'; // Add href for right click
                if (i < o.ancestors_txt.length - 1) str += ' > '; // Add separator
            }
            str += '</div>'; // Close trail div
        }
        str += "<div class='sui-itemMore' id='sui-itemMore-" + num + "'></div>"; // More area
        return str + '</div>'; // Return items markup
    }

    // MORE EXPANDER
    ShowItemMore(
        num // SHOW MORE INFO
    ) {
        var j,
            o,
            s1,
            str = '';
        if ($('#sui-itemMore-' + num).html()) {
            // If open
            $('#sui-itemMore-' + num).slideUp(400, () => {
                $('#sui-itemMore-' + num).html('');
            }); // Close it and clear
            return; // Quit
        }

        o = this.curResults[num]; // Point at item
        if (!o.url_thumb.match(/gradient.jpg/))
            // If not a generic
            str +=
                "<img src='" +
                o.url_thumb +
                "' class='sui-itemPic' id='sui-itemPic-" +
                num +
                "'>"; // Add pic
        str += "<div class='sui-itemInfo'>"; // Info holder
        str +=
            this.assets[o.asset_type].g +
            '&nbsp;&nbsp;' +
            o.asset_type.toUpperCase(); // Add type
        if (o.asset_subtype) str += ' / ' + o.asset_subtype; // Add subtype
        if (o.creator) str += '<br>&#xe600&nbsp;&nbsp;' + o.creator.join(', '); // Add creator
        if (o.summary || o.caption) {
            // If a summary or caption
            s1 = o.summary || o.caption; // Use either summary or caption
            if (s1.length > 137) s1 = s1.substr(0, 137) + '...'; // Limit size
            str +=
                "<br><div style='display:inline-block;background-color:#ccc;width:4px;height:18px;margin:2px 10px 0 5px;vertical-align:-4px'></div>&nbsp;<i>" +
                s1 +
                '</i>'; // Add summary
        }
        str += '</div>'; // Close info div
        if (o.summary)
            str += "<br><div style='font-family:serif'>" + o.summary + '</div>'; // Add summary
        if (o.kmapid_strict && o.kmapid_strict.length) {
            // Add related places/subjects
            var places = [],
                subjects = [];
            str += "<div style='margin-bottom:12px'>"; // Related places and subjects container
            for (j = 0; j < o.kmapid_strict.length; ++j) {
                // For each item
                if (o.kmapid_strict[j].match(/subjects/i)) subjects.push(j);
                // Add to subjects
                else if (o.kmapid_strict[j].match(/places/i)) places.push(j); // Add to places
            }
            str +=
                "<div style='float:left;min-width:200px;'><span style='color:" +
                this.assets.places.c +
                "'>";
            str +=
                '<br><b>' +
                this.assets.places.g +
                '</b></span>&nbsp;RELATED PLACES'; // Add header
            if (places.length) {
                // If any places
                for (j = 0; j < places.length; ++j) {
                    // For each place
                    str += '<br>';
                    if (o.kmapid_strict_ss)
                        // If has names
                        str +=
                            "<span class='sui-itemRelated'>" +
                            o.kmapid_strict_ss[places[j]] +
                            '</span>'; // Add place name
                    str +=
                        "&nbsp;<span style='font-size:10px;margin-right:40px'>(" +
                        o.kmapid_strict[places[j]] +
                        ')</span>'; // Add place id
                }
            }
            str += '</div>'; // End places div

            str +=
                "<div><span style='display:inline-block;color:" +
                this.assets.subjects.c +
                "'>";
            str +=
                '<br><b>' +
                this.assets.subjects.g +
                '</b></span>&nbsp;RELATED SUBJECTS'; // Add header
            if (subjects.length) {
                // If any subjects
                for (j = 0; j < subjects.length; ++j) {
                    // For each subject
                    str += '<br>';
                    if (o.kmapid_strict_ss)
                        // If has names
                        str +=
                            "<span class='sui-itemRelated'>" +
                            o.kmapid_strict_ss[subjects[j]] +
                            '</span>'; // Add place name
                    str +=
                        "&nbsp;<span style='font-size:10px'>(" +
                        o.kmapid_strict[subjects[j]] +
                        ')</span>'; // Add place id
                }
            }
            str += '</div></div>'; // End subjects and relateds div
        }
        $('#sui-itemMore-' + num).html(str); // Add to div

        $('#sui-itemMore-' + num).slideDown(); // Slide it down
        $('[id^=sui-itemPic]').on('click', (e) => {
            // ON PIC CLICK
            var num = e.currentTarget.id.substring(12); // Get index of result
            this.SendMessage(
                'page=' + this.curResults[num].url_html,
                this.curResults[num]
            ); // Send message
        });
    }

    // NO SIDE EFFECTS
    // PASSED FROM CONTEXT this.curResults
    DrawGridItem(
        num // DRAW GRID ITEM
    ) {
        var str = "<div class='sui-grid'>";
        var o = this.curResults[num]; // Point at item
        str += "<a href='#p=" + o.uid + "'>"; // Add href for right click
        str +=
            "<img src='" +
            o.url_thumb +
            "' class='sui-gridPic' id='sui-itemPic-" +
            num +
            "'></a>"; // Add pic
        if (o.url_thumb.match(/gradient.jpg/)) {
            // If a generic
            str += `<div class='sui-gridGlyph' style='color:${
                this.assets[o.asset_type].c
            }'>
			 ${this.assets[o.asset_type].g}
			 <p style='font-size:12px;margin-top:0'>${o.title}</p>
			 </div>`;
        }
        str +=
            "<div id='sui-gridInfo-" +
            num +
            "' class='sui-gridInfo'>&#xe67f</div>"; // Add info button
        return str + '</div>'; // Return grid markup
    }

    // NO SIDE EFFECTS
    // PASSED FROM CONTEXT:   this.curResults
    DrawCardItem(
        num // DRAW CARD ITEM
    ) {
        let i,
            o = this.curResults[num]; // Point at item
        let g = '&#xe633'; // Collections glyph
        let c = '#9e894d'; // Color
        let label = o.collection_title; // Set label
        let str = "<div class='sui-card'>"; // Overall container
        str +=
            "<div style='width:100%;height:100px;overflow:hidden;display:inline-block;margin:0;padding:0'>"; // Div container
        str += "<a href='#p=" + o.uid + "'>"; // Add href for right click
        str +=
            "<img src='" +
            o.url_thumb +
            "' class='sui-cardPic' id='sui-itemPic-" +
            num +
            "'></a></div>"; // Add pic
        var gg = this.assets[o.asset_type].g; // Assume generic icon
        if (o.asset_subtype == 'Audio') gg = '&#xe60a';
        // Audio
        else if (o.asset_subtype == 'Video') gg = '&#xe62d'; // Video
        str += "<div class='sui-cardType'>" + gg + '</div>'; // Show icon
        if (o.url_thumb.match(/gradient.jpg/))
            // If a generic
            str += `<div class='sui-cardGlyph' style='color:${
                this.assets[o.asset_type].c
            }'>${this.assets[o.asset_type].g}</div>`;
        str +=
            "<div class='sui-cardInfo'><div class='sui-cardTitle' id='sui-itemTitle-" +
            num +
            "'";
        if (o.ancestors_txt && o.ancestors_txt.length > 2)
            str += "title='" + o.ancestors_txt.join('/') + "'"; // Add tooltip showing path
        str += '><b>' + o.title + '</b><br></div>'; // Add title
        str +=
            "<div style='border-top:.5px solid " +
            c +
            ";height:1px;width:100%;margin:6px 0 6px 0'></div>"; // Dividing line
        if (o.ancestors_txt && o.ancestors_txt.length > 1) {
            // If has an ancestors trail
            str += '&#xe638&nbsp;&nbsp;' + o.ancestors_txt[0] + '/...<br>'; // Add start
            str +=
                '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.../' +
                o.ancestors_txt[o.ancestors_txt.length - 2] +
                '<br>'; // Add antecedant
        }
        if (o.feature_types_ss)
            str +=
                '&#xe62b&nbsp;&nbsp;' + o.feature_types_ss.join(', ') + '<br>'; // Add feature, if a place
        if (o.data_phoneme_ss)
            str +=
                '&#xe635&nbsp;&nbsp;' + o.data_phoneme_ss.join(', ') + '<br>'; // Add phoneme if a term
        if (o.creator) str += '&#xe600&nbsp;&nbsp;' + o.creator[0] + '<br>'; // Add creator
        if (o.duration_s) str += '&#xe61c&nbsp;&nbsp;' + o.duration_s + '<br>'; // Add duration
        if (o.timestamp)
            str += '&#xe60c&nbsp;&nbsp;' + o.timestamp.substr(0, 10) + '<br>'; // Add timestamp
        if (o.name_tibt) str += '=&nbsp;&nbsp;' + o.name_tibt + '<br>'; // Add Tibettan name
        str += '</div>'; // End info div
        if (!label) {
            label = o.asset_type;
            g = this.assets[o.asset_type].g;
        } // Generic label if no collection
        str +=
            "<div class='sui-cardFooter' style='background-color:" +
            c +
            "'>" +
            g +
            '&nbsp;&nbsp;'; // Card footer
        str +=
            "<span style='font-size:11px;vertical-align:2px'>" +
            label +
            '<span></div>'; // Add label
        return str + '</div>'; // Return items markup
    }

    /*	ADVANCED SEARCH //////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////  */

    DrawAdvanced() { // DRAW SEARCH UI SECTION
        this.log('searchui.DrawAdvanced() short circuit');
        return; // short circuit

        let i, o, str;
        let _this = this;
        if (this.noTop)
            $('#sui-adv').css({ top: 0, height: 'calc(100% - 50px)' }); // Scale to fit
        for (let key in this.facets) {
            // For each facet
            if ($('#sui-advEdit-' + key).css('display') == 'block') {
                // Refresh list results if open
                this.DrawFacetItems(key, true); // Draw proper facets menu
                this.QueryFacets(key); // Fill facet data
            }
            $('#sui-advTerm-' + key).empty(); // Clear list
            for (i = 0; i < this.ss.query[key].length; ++i) {
                // For each term in facet
                o = sui.ss.query[key][i]; // Point at facet to add to div
                str = `<div><div class='sui-advTermRem' id='sui-advKill-${key}-${i}'>&#xe60f</div>`;
                if (this.showBool)
                    str += `<div class='sui-advEditBool' id='sui-advBool-${key}-${i}' title='Change boolean method'>${
                        this[o.bool]
                    }&#xe642</div>`;
                str += `<i> &nbsp;${o.title}</i></div>`;
                if (key == 'assets')
                    $('#sui-advTerm-' + key).html(
                        `<span style='color:${this.assets[o.id].c}'>${
                            this.assets[o.id].g
                        } </span><i> &nbsp;${o.title}</i>`
                    );
                else $('#sui-advTerm-' + key).append(str); // Add term
            }
        }

        $('[id^=sui-advBool-]').on('mouseenter', function (e) {
            // ON BOOLEAN HOVER
            let v = e.currentTarget.id.split('-'); // Get ids
            let str = `<div class='sui-boolItem' id='sui-boolItem-${v[2]}-${v[3]}-AND'>AND</div>|			
				<div class='sui-boolItem' id='sui-boolItem-${v[2]}-${v[3]}-OR'>OR</div>|					
				<div class='sui-boolItem' id='sui-boolItem-${v[2]}-${v[3]}-NOT'>NOT</div>&nbsp;`; // Add options
            $(this).html(str.replace(/\t|\n|\r/g, '')); // Set new value

            $('.sui-boolItem').on('click', (e) => {
                // ON CLICK
                let v = e.currentTarget.id.split('-'); // Get ids
                $('#' + e.currentTarget.id).html(_this[v[4]] + '&#xe642'); // Set new value
                _this.ss.query[v[2]][v[3]].bool = v[4]; // Set state
                $(this).html(_this[v[4]] + '&#xe642'); // Set new value
                _this.Query(); // Run query and show results
            });
        });

        $('[id^=sui-advBool-]').on('mouseleave', function (e) {
            // ON BOOLEAN OUT
            let v = e.currentTarget.id.split('-'); // Get ids
            let b = _this.ss.query[v[2]][v[3]].bool; // Get current boolean state
            $(this).html(_this[b] + '&#xe642'); // Set new value
        });

        $('[id^=sui-advKill-]').on('click', (e) => {
            // REMOVE ITEM FROM QUERY
            let v = e.currentTarget.id.split('-'); // Get ids
            this.ss.query[v[2]].splice(v[3], 1); // Remove
            this.DrawAdvanced(); // Redraw
            this.Query(); // Run query and show results
        });
    }

    DrawFacetItems(
        facet,
        open // DRAW FACETS ITEMS
    ) {
        if (facet == 'assets' && !this.curResults) this.Query(); // If no results, run query
        if (facet == 'recent') this.RecentSearches();
        // Show recent searches
        else if (this.facets[facet].type == 'input')
            this.DrawInput(facet, open);
        // Draw input editor
        else if (this.facets[facet].type == 'tree') {
            // If base type is a tree
            if (this.ActiveSearch()) this.DrawFacetList(facet, open);
            // If an active search, draw tree as a list
            else this.DrawFacetTree(facet, open); // Draw tree as a tree
        } else this.DrawFacetList(facet, open); // Draw list editor
    }

    ActiveSearch(
        ignoreText // IS THERE AN ACTIVE SEARCH?
    ) {
        let key,
            activeSearch = false; // Assume no active search happening
        if (this.ss.query.text.length && !ignoreText) activeSearch = true; // Flag if something set in text
        for (key in this.facets) // For each facet
            if (this.ss.query[key].length && key != 'assets')
                activeSearch = true; // Flag if something set
        return activeSearch;
    }

    // SIDE EFFECTS
    DrawInput(
        facet // DRAW INPUT FACET PICKER
    ) {
        if ($('#sui-advEdit-' + facet).css('display') != 'none') {
            // If open
            $('#sui-advEdit-' + facet).slideUp(); // Close it
            return;
        }
        var tot = 934;
        this.facets[facet].mode = 'input'; // Input mode active
        var str = `<input id='sui-advInput-${facet}' placeholder='Type here'  
		style='width:90px;border:1px solid #999;border-radius:12px;font-size:11px;padding-left:6px'>
		<div class='sui-advEditNums'> <span id='sui-advListNum'>${tot}</span> ${facet}</div>`;
        $('#sui-advEdit-' + facet).html(
            str + '</div>'.replace(/\t|\n|\r/g, '')
        ); // Add to div
        $('#sui-advEdit-' + facet).slideDown(); // Show it

        $('#sui-advInput-' + facet).on('change', (e) => {
            // ON CHANGE
            var v = e.target.id.split('-'); // Get ids
            this.AddNewFilter(
                $('#sui-advInput-' + facet).val(),
                facet + '-0',
                'AND',
                facet
            ); // Add term to search state
        });
    }

    // SELF-CONTAINED
    RecentSearches() { // SHOW RECENT SEARCHES
        if ($('#sui-advEdit-recent').css('display') != 'none') {
            // If open
            $('#sui-advEdit-recent').slideUp(); // Close it
            return; // Quit
        }
        let i,
            j,
            f,
            str =
                "<i>Click below to recall a previous search</i><hr><div class='sui-advEditList'>"; // Enclosing div
        for (i = this.searches.length - 1; i >= 0; i--) {
            // For each search, last first
            str += `<div class='sui-advEditLine' style='width:100%' id='sui-recSrc-${i}' `; // Add text item, if any
            str +=
                "title='" +
                this.searches[i].query.assets[0].title.toUpperCase(); // Add tooltip to show entire search
            str += ' ' + this.searches[i].query.text; // Add text
            for (f in this.facets) {
                // For each facet
                if (this.searches[i].query[f].length && f != 'assets')
                    // If something there
                    for (
                        j = 0;
                        j < this.searches[i].query[f].length;
                        ++j // For each one of them
                    )
                        str +=
                            ' ' +
                            this[this.searches[i].query[f][j].bool] +
                            ' ' +
                            this.searches[i].query[f][j].title; // Add to tooltip
            }
            f = this.searches[i].query.assets[0].id; // Point at asset id
            str += `'><span style='color:${this.assets[f].c}'>${this.assets[f].g} </span>`; // Add asset type
            str += this.searches[i].query.text; // End title and add text item
            for (f in this.facets)
                if (this.searches[i].query[f].length && f != 'assets')
                    str += ' + ' + this.facets[f].icon; // Add facets icons, except assets
            str += '</div>';
        }
        $('#sui-advEdit-recent').html(str + '</div>'.replace(/\t|\n|\r/g, '')); // Add to div
        $('[id^=sui-recSrc-]').off('click'); // KILL OLD HANDLERS
        $('[id^=sui-recSrc-]').on('click', (e) => {
            // ON ITEM CLICK
            let id = e.target.id.substr(11); // Get which
            this.ss.query = JSON.parse(JSON.stringify(this.searches[id].query)); // Restore search query only
            $('#sui-search').val(this.ss.query.text); // Set top search
            this.DrawAdvanced(); // Draw advanced
            this.Query(); // Rerun search
        });
        $('#sui-advEdit-recent').slideDown(); // Show it
    }

    //
    ResetFacetList(
        facet // RESET FACET LIST UI
    ) {
        var i,
            k,
            str = '';
        if (facet == 'assets') {
            // If assets
            let o = (this.facets.assets.data = []); // Point at data
            for (k in this.assets) // For each asset type
                o.push({
                    title: k.charAt(0).toUpperCase() + k.slice(1),
                    id: k,
                    n: this.assets[k].n,
                }); // Add data
        }
        let n = Math.min(300, this.facets[facet].data.length); // Cap at 300
        $('[id^=sui-advEditLine-]').remove(); // Remove old members, in all facets
        for (i = 0; i < n; ++i) {
            // Add items
            k = this.facets[facet].data[i].n; // Number of assets
            if (k == undefined) k = ''; // Hide if undefined
            if (k > 1000) k = Math.floor(k / 1000) + 'K'; // Shorten
            str += `<div class='sui-advEditLine' id='sui-advEditLine-${i}'>`;
            if (facet == 'assets')
                str += `<span style='color:${
                    this.assets[this.facets[facet].data[i].id].c
                }'>${
                    this.assets[this.facets[facet].data[i].id].g
                }</span> &nbsp;`;
            str += `${this.facets[facet].data[i].title} (${k})`; // Add item to list
            if (facet != 'assets')
                str += this.pages.AddPop(this.facets[facet].data[i].id, true); // Add popover
            str += '</div>';
        }
        $('#sui-advEditList-' + facet).html(
            '</div>' + str.replace(/\t|\n|\r/g, '')
        ); // Add to div
        $('[id^=sui-advEditLine-]').off('click'); // KILL OLD HANDLERS
        $('[id^=sui-advEditLine-]').on('click', (e) => {
            // ON ITEM CLICK
            let v = e.target.id.split('-'); // Get ids
            let items = this.facets[facet].data; // Point at items
            if (this.showSearch && facet != 'assets')
                // Show page
                this.GetKmapFromID(items[v[2]].id, (kmap) => {
                    this.SendMessage('page=' + items[v[2]].url, kmap);
                });
            // Get kmap and show page
            else
                this.AddNewFilter(
                    items[v[2]].title,
                    items[v[2]].id,
                    'AND',
                    facet
                ); // Add to search state
        });
        $('#sui-advListNum').html(n < 300 ? n : '300+'); // Set number
    }

    // NEEDS ANALYSIS
    DrawFacetList(
        facet,
        open,
        searchItem // DRAW LIST FACET PICKER
    ) {
        let i,
            sorted = 0;
        if (!open && $('#sui-advEdit-' + facet).css('display') != 'none') {
            // If open
            $('#sui-advEdit-' + facet).slideUp(); // Close it
            return;
        }
        this.QueryFacets(facet); // Get initial list
        this.facets[facet].mode = 'list'; // List mode active
        var str = `<input id='sui-advEditFilter-${facet}' placeholder='Filter this list' value='${
            searchItem ? searchItem : ''
        }' 
		style='width:90px;border:1px solid #999;border-radius:12px;font-size:11px;padding-left:6px'> &nbsp; `;
        if (this.facets[facet].type == 'tree') {
            str += `<div class='sui-advEditBut' id='sui-advListMap-${facet}' title='Tree view'>&#xe638</div> | 
			<div class='sui-advEditBut' id='sui-advTreeMap-${facet}' title='List view'>&#xe61f</div>
			&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
        }
        if (facet != 'assets')
            str += `<div class='sui-advEditBut' id='sui-advEditSort-${facet}' title='Sort'>&#xe652</div>`;
        str += `<div class='sui-advEditNums'> <span id='sui-advListNum'></span> ${facet}`;
        str += `</div><hr style='border: .5px solid #a4baec'>
		<div class='sui-advEditList' id='sui-advEditList-${facet}'></div>`;
        $('#sui-advEdit-' + facet).html(str.replace(/\t|\n|\r/g, '')); // Add to div
        $('#sui-advEdit-' + facet).slideDown(); // Show it
        $('#sui-advTreeMap-' + facet).css({ color: '#668eec' }); // Highlight list

        $('[id^=sui-advEditFilter-]').off('click'); // KILL OLD HANDLER
        $('#sui-advEditFilter-' + facet).on('keydown', (e) => {
            // ON FILTER CHANGE
            let line;
            var n = Math.min(300, this.facets[facet].data.length); // Cap at 300
            let r = $('#sui-advEditFilter-' + facet).val(); // Get filter text
            if (e.keyCode > 31 && e.keyCode < 91) r += e.key; // Add current key if a-Z
            if (e.keyCode == 8 && r.length) r = r.slice(0, -1); // Remove last char on backspace
            r = RegExp(r, 'i'); // Turn into regex
            for (i = 0; i < n; ++i) {
                // For each item
                line = $('#sui-advEditLine-' + i); // Point at line
                if (line.text().match(r)) line.css('display', 'block');
                // Show item if it matches
                else line.css('display', 'none'); // Hide
            }
        });

        $('[id^=sui-advEditSort-]').off('click'); // KILL OLD HANDLER
        $('#sui-advEditSort-' + facet).on('click', () => {
            // ON SORT BUTTON CLICK
            str = '';
            let items = this.facets[facet].data; // Point at items
            let i,
                k,
                n = Math.min(300, items.length); // Cap at 300
            sorted = 1 - sorted; // Toggle flag
            if (!sorted) {
                // If not sorted
                $('#sui-advEditList-' + facet).empty(); // Remove items from list
                for (i = 0; i < n; ++i) {
                    // For each one
                    k = this.facets[facet].data[i].n; // Number of assets
                    if (k > 1000) k = Math.floor(k / 1000) + 'K'; // Shorten
                    str += `<div class='sui-advEditLine' id='sui-advEditLine-${i}'>`;
                    str += `${items[i].title} (${k})${this.pages.AddPop(
                        items[i].id,
                        true
                    )}</div>`; // Add item to list
                }
                $('#sui-advEditList-' + facet).html(str); // Add back
                $('#sui-advEditSort-' + facet).css('color', '#666'); // Off
                return; // Quit
            }
            let itms = $('.sui-advEditLine'); // Items to sort
            itms.sort(function (a, b) {
                // Sort
                var an = $(a).text(); // A name
                var bn = $(b).text(); // B
                if (an > bn) return 1;
                // Higher
                else if (an < bn) return -1;
                // Lower
                else return 0; // The same
            });
            $('#sui-advEditList-' + facet).html(itms);
            $('#sui-advEditSort-' + facet).css('color', '#668eec'); // On
        });

        $('[id^=sui-advListMap-]').off('click'); // KILL OLD HANDLER
        $('#sui-advListMap-' + facet).on('click', () => {
            // ON CLICK TREE BUTTON
            this.DrawFacetTree(
                facet,
                1,
                $('#sui-advEditFilter-' + facet).val()
            ); // Close it and open as tree
        });
        $('#sui-advEditList-' + facet).css(
            'max-height',
            $('#sui-main').height() -
                $('#sui-advTerm-' + facet).offset().top -
                $('#sui-advTerm-' + facet).height() -
                102 +
                'px'
        ); // Fill space
    }

    // SIDE EFFECTS!
    AddNewFilter(
        title,
        id,
        bool,
        facet // ADD NEW TERM TO SEARCH STATE
    ) {
        let o = this.ss.query[facet]; // Point at facet
        if (o.filter((o) => o.title == title).length) return; // Don't add if already there
        if (id) id = id.replace(/languages-|features-/i, 'subjects-'); // Languages and feature
        let num = o.length; // Facet index to add to
        o.push({}); // Add obj
        o[num].title = title; // Get title
        o[num].id = id ? id.replace(/collections-/, '') : ''; // Id (remove collections- prefix)
        o[num].bool = bool; // Bool
        if (facet == 'assets')
            this.ss.query.assets = [{ title: title, id: id, bool: bool }]; // Only one
        this.ss.page = 0; // Start at 1st page in results
        this.DrawAdvanced(); // Redraw
        this.Query(); // Run query and show results
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TREE
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // ANALYZE
    DrawFacetTree(
        facet,
        open,
        searchItem // DRAW FACET TREE
    ) {
        var _this = this; // Save context
        if (!open && $('#sui-advEdit-' + facet).css('display') != 'none') {
            // If open
            $('#sui-advEdit-' + facet).slideUp(); // Close it
            return;
        }
        this.facets[facet].mode = 'tree'; // Tree mode active
        this.curTree = facet;
        var div = '#sui-tree' + facet; // Tree div

        var str = `<input id='sui-advTreeFilter' placeholder='Filter this list' value='${
            searchItem ? searchItem : ''
        }' 
		style='width:90px;border:1px solid #999;border-radius:12px;font-size:11px;padding-left:6px'> &nbsp; 
		<div class='sui-advEditBut' id='sui-advListMap-${facet}' title='Tree view'>&#xe638</div> | 
		<div class='sui-advEditBut' id='sui-advTreeMap-${facet}' title='List view'>&#xe61f</div>`;
        str += `<hr style='border: .5px solid #a4baec'>
		<div id='sui-tree${facet}' class='sui-tree'></div>`;
        $('#sui-advEdit-' + facet).html(str.replace(/\t|\n|\r/g, '')); // Add tree frame to div

        if (facet == 'places') this.LazyLoad(div, null, facet, 13735);
        // Embedded top layer for places
        else if (facet == 'features') this.LazyLoad(div, null, facet, 20);
        // Features
        else if (facet == 'languages') this.LazyLoad(div, null, facet, 301);
        // Languages
        else this.GetTopRow(div, facet); // Constructed top layers

        $('#sui-advListMap-' + facet).css({ color: '#668eec' }); // Highlight tree

        $('[id^=sui-advTreeMap-]').off('click'); // KILL OLD HANDLER
        $('#sui-advTreeMap-' + facet).on('click', () => {
            // ON CLICK LIST BUTTON
            this.DrawFacetList(facet, 1, $('#sui-advTreeFilter').val()); // Close it and open as list
        });

        $('[id^=sui-advTreeFilter-]').off('click'); // KILL OLD HANDLER
        $('#sui-advTreeFilter').on('keydown', (e) => {
            // ON TYPING IN TEXT BOX
            this.DrawFacetList(facet, 1, $('#sui-advTreeFilter').val()); // Close it and open as list
            $('#sui-advEditFilter-' + facet).focus(); // Focus on input in list
        });

        $('.sui-advViewTreePage').off('click'); // Kill old handlers
        $('.sui-advViewTreePage').on('click', (e) => {
            // ON CLICK VIEW BUTTON
            var v = e.target.id.split('-'); // Get id
            this.GetKmapFromID(v[1] + '-' + v[2], (kmap) => {
                sui.SendMessage('', kmap);
            }); // Get kmap and show page
            e.stopPropagation(); // Stop propagation
        });

        $(div).css(
            'max-height',
            $('#sui-main').height() -
                $('#sui-advTerm-' + facet).offset().top -
                $('#sui-advTerm-' + facet).height() -
                102 +
                'px'
        ); // Fill space
        $('#sui-advEdit-' + facet).slideDown(); // Show it
    }

    // SIDE EFFECTS?
    GetTopRow(
        div,
        facet // GET TOP-MOST TREE LEVEL
    ) {
        var _this = this; // Save context
        let prefix = div.match(/sui-btree-/) ? 'b' : ''; // Id prefix to prevent confusion between trees
        var id,
            k,
            tops = [],
            str = '<ul>';
        if (facet == 'terms') {
            tops.ka = 1;
            tops.kha = 14263;
            tops.ga = 24465;
            tops.nga = 45101;
            tops.ca = 51638;
            tops.cha = 55178;
            tops.ja = 62496;
            tops.nya = 66477;
            tops.ta = 73101;
            tops.tha = 80697;
            tops.da = 87969;
            tops.na = 105631;
            tops.pa = 114065;
            tops.pha = 120048;
            tops.ba = 127869;
            tops.ma = 142667;
            tops.tsa = 154251;
            tops.tsha = 158451;
            tops.dza = 164453;
            tops.wa = 166888;
            tops.zha = 167094;
            tops.za = 172249;
            tops["'a"] = 177092;
            tops.ya = 178454;
            tops.ra = 185531;
            tops.la = 193509;
            tops.sha = 199252;
            tops.sa = 204036;
            tops.ha = 215681;
            tops.a = 219022;
        } else if (facet == 'subjects') {
            tops['Administration'] = 5550;
            tops['Architecture'] = 6669;
            tops['Collections'] = 2823;
            tops['Community Services Project Types'] = 5553;
            tops['Contemplation'] = 5806;
            tops['Cultural Landscapes'] = 8868;
            tops['Cultural Regions'] = 305;
            tops['Event'] = 2743;
            tops['General'] = 6793;
            tops['Geographical Features'] = 20;
            tops['Grammars'] = 5812;
            tops['Higher Education Digital Tools'] = 6404;
            tops['Historical Periods'] = 5807;
            tops['Human Relationships'] = 306;
            tops['Language Tree'] = 301;
            tops['Literary Genres'] = 5809;
            tops['Material Objects'] = 2693;
            tops['Mesoamerican Studies'] = 6664;
            tops['Oral Genres'] = 5808;
            tops['Organizations and Organizational Units'] = 2688;
            tops['Politics'] = 7174;
            tops['Profession'] = 6670;
            tops['Religious Sects'] = 302;
            tops['Religious Systems'] = 5810;
            tops['Ritual'] = 5805;
            tops['Scripts'] = 192;
            tops['Teaching Resources'] = 6844;
            tops['Text Typologies'] = 4833;
            tops['Tibet and Himalayas'] = 6403;
            tops['Zoologies (Biological and Spiritual)'] = 5813;
        }
        for (k in tops) {
            // For each top row
            id = facet + '-' + tops[k]; // id
            str += "<li class='parent'><a id='" + prefix + id + "'"; // Start row
            str += "' data-path='" + tops[k] + "'>" + k; // Add path/header
            str += this.pages.AddPop(id, true); // Add popover
            str += '</a></li>'; // Add label
        }
        $(div).html(str + '</ul>'); // If initing 1st level
        $('.sui-tree li > a').off(); // Clear handlers
        $('.sui-tree li > a').on('click', function (e) {
            handleClick($(this), e);
        }); // Restore handler

        function handleClick(row, e) {
            // HANDLE NODE CLICK
            let off = $(row.parent()).hasClass('parent') ? 20 : 0; // Adjust for icon
            if (e.offsetX < off) {
                // In icon
                if (row.parent().children().length == 1)
                    // If no children
                    _this.LazyLoad(div, row, _this.curTree);
                // Lazy load from SOLR
                else {
                    // Open or close
                    row.parent().toggleClass('active'); // Toggle active class on or off
                    row.parent().children('ul').slideToggle('fast'); // Slide into place
                }
            } else {
                if (e.clientX < 200 || _this.showSearch) {
                    // If browsing
                    _this.pages.relatedBase = _this.pages.relatedId = ''; // No related
                    if (_this.ss.mode == 'related')
                        _this.ss.mode = _this.ss.lastMode; // Get back to search mode
                    sui.GetKmapFromID(
                        _this.curTree + '-' + e.target.id.split('-')[1],
                        (kmap) => {
                            sui.SendMessage('', kmap);
                        }
                    ); // Get kmap and show page
                } else {
                    // Adding facet to query
                    let s = $('#' + e.target.id).text(); // Get term
                    sui.AddNewFilter(
                        s,
                        _this.curTree + '-' + e.target.id.split('-')[1],
                        'AND',
                        _this.curTree
                    ); // Add term to search state and refresh
                }
            }
        }
    }

    // SIDE EFFECTS?
    LazyLoad(
        div,
        row,
        facet,
        init // ADD NEW NODES TO TREE
    ) {
        const sui = this.sui;
        var path;
        var _this = this; // Save context
        if (init || row.parent().children().length == 1) {
            // If no children, lazy load
            let prefix = div.match(/sui-btree-/) ? 'b' : ''; // Id prefix to prevent confustion between trees
            if (init) path = '' + init;
            // Force path as string
            else path = '' + row.data().path; // Get path	as string
            this.GetTreeChildren(facet, path, (res) => {
                // Get children
                var o,
                    i,
                    re,
                    f = '';
                var str = '<ul>'; // Wrapper, show if not initting
                if (facet == 'terms') {
                    if (
                        res.facet_counts &&
                        res.facet_counts.facet_fields &&
                        res.facet_counts.facet_fields[
                            'ancestor_id_tib.alpha_path'
                        ]
                    )
                        // If valid
                        f = res.facet_counts.facet_fields[
                            'ancestor_id_tib.alpha_path'
                        ].join(); // Get list of facets
                } else {
                    if (
                        res.facet_counts &&
                        res.facet_counts.facet_fields &&
                        res.facet_counts.facet_fields.ancestor_id_path
                    )
                        // If valid
                        f = res.facet_counts.facet_fields.ancestor_id_path.join(); // Get list of facets
                }
                for (i = 0; i < res.response.docs.length; ++i) {
                    // For each child
                    o = res.response.docs[i]; // Point at child
                    re = new RegExp('/' + o.id.split('-')[1]); // Id
                    str += '<li'; // Start row
                    if ((f && f.match(re)) || init) str += " class='parent'"; // If has children or is top, add parent class
                    str += "><a id='" + prefix + o.id; // Add id
                    if (facet == 'terms')
                        // If terms
                        str +=
                            "' data-path='" +
                            o['ancestor_id_tib.alpha_path'] +
                            "'>";
                    // Add path
                    // All others
                    else str += "' data-path='" + o.ancestor_id_path + "'>"; // Add path
                    str += o.header; // Add label
                    str += this.pages.AddPop(o.id, true); // Add popover
                    str += '</a></li>'; // Add label
                }
                if (res.response.docs.length) {
                    if (init) $(div).html(str + '</ul>');
                    // If initing 1st level
                    else {
                        // Adding a level to a branch
                        row.after(str + '</ul>'); // Add children to tree
                        row.parent().toggleClass('active'); // Toggle active class on or off
                        row.parent().children('ul').slideToggle('fast'); // Slide into place
                    }
                    $('.sui-tree li > a').off(); // Clear handlers
                    $('.sui-tree li > a').on('click', function (e) {
                        handleClick($(this), e);
                    }); // Restore handler
                }
                $('.sui-advViewTreePage').off('click'); // Kill old handlers
                $('.sui-advViewTreePage').on('click', (e) => {
                    // ON CLICK VIEW BUTTON
                    var v = e.target.id.split('-'); // Get id
                    this.GetKmapFromID(v[1] + '-' + v[2], (kmap) => {
                        sui.SendMessage('', kmap);
                    }); // Get kmap and show page
                    e.stopPropagation(); // Stop propagation
                });
            });
        }

        function handleClick(row, e) {
            // HANDLE NODE CLICK
            let off = $(row.parent()).hasClass('parent') ? 20 : 0; // Adjust for icon
            if (e.offsetX < off) {
                // In icon
                if (row.parent().children().length == 1)
                    // If no children
                    _this.LazyLoad(div, row, _this.curTree);
                // Lazy load from SOLR
                else {
                    // Open or close
                    row.parent().toggleClass('active'); // Toggle active class on or off
                    row.parent().children('ul').slideToggle('fast'); // Slide into place
                }
            } else {
                if (e.clientX < 200 || _this.showSearch) {
                    // If browsing
                    _this.pages.relatedBase = _this.pages.relatedId = ''; // No related
                    if (_this.ss.mode == 'related')
                        _this.ss.mode = _this.ss.lastMode; // Get back to search mode
                    sui.GetKmapFromID(
                        _this.curTree + '-' + e.target.id.split('-')[1],
                        (kmap) => {
                            sui.SendMessage('', kmap);
                        }
                    ); // Get kmap and show page
                } else {
                    // Adding facet to query
                    let s = $('#' + e.target.id).text(); // Get term
                    sui.AddNewFilter(
                        s,
                        _this.curTree + '-' + e.target.id.split('-')[1],
                        'AND',
                        _this.curTree
                    ); // Add term to search state and refresh
                }
            }
        }
    }

    GeoLocate() { // SHOW GEOLOCATED ASSESTS
        let d = [
            { lat: 36.6251, lon: -118.085, lab: 'Lhasa', ui: 'subjects-6061' },
            { lat: 37.6251, lon: -119.085, lab: 'Lhasa2', ui: 'subjects-6060' },
        ];
        //move lat by .0001 to stack
        sui.plc.Draw('', '', d);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // HELPERS
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    LoadingIcon(
        mode,
        size // SHOW/HIDE LOADING ICON
    ) {
        if (!mode) {
            // If hiding
            $('[id^=sui-loadingIcon]').remove(); // Remove it
            return; // Quit
        }
        var str = "<img src='loading.gif' width='" + size + "' "; // Img
        str +=
            "id='sui-loadingIcon' style='position:absolute;top:calc(50% - " +
            size / 2 +
            'px);left:calc(50% - ' +
            size / 2 +
            "px);z-index:5000'>";
        $('#sui-main').append(str); // Add icon to results
    }

    SendMessage(
        msg,
        kmap // SEND MESSAGE TO HOST
    ) {
        this.pages.Draw(kmap); // Route to page
    }

    Popup(
        msg,
        time,
        x,
        y // POPUP
    ) {
        var str = '';
        $('#sui-popupDiv').remove(); // Kill old one, if any
        str +=
            "<div id='sui-popupDiv' class='sui-gridPopup' style='left:" +
            x +
            'px;top:' +
            y +
            "px'>"; // Add div
        str += msg + '</div>'; // Add content
        $('#sui-main').append(str); // Add to div
        $('#sui-popupDiv')
            .fadeIn(500)
            .delay(time ? time * 1000 : 3000)
            .fadeOut(500); // Animate in and out
    }

    ShortenString(
        str,
        len,
        middle // SHORTEN A STRING TO LENGTH
    ) {
        if (typeof str == 'object') str = str[0]; // Get 1st member if an array
        if (str && str.length > len) {
            // Too long
            if (middle)
                str =
                    str.substr(0, (len - 3) / 2) +
                    '...' +
                    str.slice((len - 3) / -2);
            // Shorten middle
            else str = str.substr(0, len - 3) + '...'; // Shorten end
        }
        return str; // Return string
    }

    GetCookie(
        cname // GET COOKIE
    ) {
        let i,
            c,
            name = cname + '=';
        let ca = decodeURIComponent(document.cookie).split(';'); // Get cookie array
        for (i = 0; i < ca.length; i++) {
            // For each cookie
            c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return '';
    }

    SetCookie(
        cname,
        value // SET COOKIE
    ) {
        let d = new Date();
        d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
        d = d.toUTCString(); // Cookie expires after a year
        document.cookie = `${cname}=${value}; expires=${d};`; // Set cookie
    }

    log(message, debugObject, showAlert) {
        //console.log(message);x
        if (debugObject) {
            console.dir(debugObject);
        }
        if (showAlert) {
            alert(message, debugObject);
        }
    }

    alert(message, debugObject) {
        this.log(message, debugObject, false);
    }
} // SearchUI class closure
