/* 	PAGES ****************************************************************************************************************************

	This module provide the backbone to draw individual asset pages, and control the somewhat complex flow
	when browsing collections and related resources. It routes to the specific modules that draw a page based on a kmap,
	and it contains helper functions to  that all pages use to draw (.e. headers, footers, related assets, popovers)

	It allocates the indivisual page classes and puts pointer to them in the global app variable (sui)

	
	Requires: 	jQuery 												// Almost any version should work
	Calls:		seachui.js, audiovideo.js, places.js,				// Other JS modules that are dynamically loaded (not ued in plain search)
				texts.js, images.js, subjects.js, sources.js,
				terms.js, places.js, visuals.js
	CSS:		searchui.css										// All styles are prefixed with 'sui-'
	JS:			ECMA-6												// Uses lambda (arrow) functions
	Images:		popover.png
	Globals:	sui													// Declared globally

********************************************************************************************************************************************/
/* eslint-disable */
import $ from 'jquery';

import Places from './places';
import AudioVideo from './audiovideo';
import Subjects from './subjects';
import Images from './images';
import Texts from './texts';
import Sources from './sources';
import Visuals from './visuals';
import Terms from './terms';
import Collections from './collections';

export default class Pages  {

	constructor(sui)   																		// CONSTRUCTOR
	{
		if (!sui) {
			throw new Error("sui must be defined in constructor");
		}
		this.sui = sui;
		sui.pages=this;// Save context
		
		// OUTPUT DIVS
		this.div=$("<div></div>"); //"#sui-legacy";														// Div to hold page
		this.reldiv=$("<div></div>"); // '#sui-legacy-related';
		
		this.relatedBase=null;																// Holds based kmap for related
		this.relatedType="Home";																// Holds current related category
		this.relatedId="";																		// Holds current related id
		this.lastMode=sui.ss.mode;															// Previous search mode
		this.curKmap=null;																		// Currently active page kmap
		this.carouselTimer=null;																// Timer to advance carousel
		sui.plc=new Places(sui);																	// Alloc places module (standalone)
		sui.av=new AudioVideo(sui);																// Alloc AV (standalone)
		sui.sub=new Subjects(sui);																	// Alloc Subjects (standalone)
		sui.img=new Images(sui);																	// Alloc Images (standalone)
		sui.txt=new Texts(sui);																	// Alloc Texts (standalone)
		sui.src=new Sources(sui);																	// Alloc Sources (standalone)
		sui.vis=new Visuals(sui);																	// Alloc Visuals (standalone)
		sui.trm=new Terms(sui);																	// Alloc Terms (standalone)
		sui.col=new Collections(sui);																// Alloc Collections (standalone)
		this.recentPages=[];																	// Hold recent pages (title|id)
		this.editing=false;																		// Show editing interface?
		if (window.location.hash) sui.PageRouter(window.location.hash);										// Go to particular page
	}

	Draw(kmap, fromHistory)																	// DRAW KMAP PAGE
	{
		console.error("pages.Draw() called! with args: ");
		console.dir(arguments);
		const sui = this.sui;
		clearInterval(this.carouselTimer);														// Kill carousel timer
		if (!kmap)	return;																		// Quit if no kmap
		if (!fromHistory)	sui.SetState(`p=${kmap.uid}`);										// This is the active page
		this.curKmap=kmap;																		// Set active page's map
		this.recentPages.push(kmap.uid+"|"+kmap.title+"|"+kmap.asset_type);						// Add to recents list
		let i,n=this.recentPages.length-1;														// Length of recents	
		for (i=n-1;i>=0;--i)																	// Work backwards
			if (this.recentPages[i] == this.recentPages[n]) {									// Ff already saved 
				this.recentPages.splice(i,1);													// Remove it 
				break;																			// Quit looking
				}
		if (sui.ss.mode != "related") {
			this.DrawHeader(kmap);							// Draw header if not showing relateds
		}

		// Style sui-legacy
		$(this.div).css({ "background-image":""});										// Remove any backgeound image
		$(this.div).css({ "padding-left":"12px", width:"calc(100% - 24px"});				// Reset to normal size and hide
		$(this.div).css({ display:"block",color:"#000"});										// Show page
		if (sui.ss.mode == "related") {															// If browsing related pages
			if (!kmap.asset_type.match(/places|subjects|terms/))								// Need to add space for these types
				$(this.div).css({ "padding-left": "192px", width:"calc(100% - 216px"});			// Shrink page
			}

		// Draw Content
		if (kmap.asset_type == "places")			sui.plc.Draw(kmap);							// Show place
		else if (kmap.asset_type == "sources") 		sui.src.Draw(kmap);							// Source
		else if (kmap.asset_type == "terms") 		sui.trm.Draw(kmap);							// Term
		else if (kmap.asset_type == "subjects") 	sui.sub.Draw(kmap);							// Subject
		else if (kmap.asset_type == "images") 		sui.img.Draw(kmap);							// Image
		else if (kmap.asset_type == "audio-video") 	sui.av.Draw(kmap);							// AV
		else if (kmap.asset_type == "texts") 		sui.txt.Draw(kmap);							// Text
		else if (kmap.asset_type == "visuals") 		sui.vis.Draw(kmap);							// Visual
		else if (kmap.asset_type == "collections") 	sui.col.Draw(kmap);							// Collections
	}

	ShowPopover(id, event)																	// DISPLAY KMAP DROP DOWN FROM EVENT
	{
		const sui = this.sui;
		if (id && id.match(/collections-/))								return;					// No maps for collections yet
		if (this.PopoverTimer && (event.type == "mousemove")) 			return;					// Already timeing one
		if ((event.type == "mousemove") && (id == this.lastPopover)) 	return;					// Already in this one
		if (event.type == "mousedown") {														// Click on popover
			if (sui.ss.mode == "related")  sui.ss.mode=this.lastMode;							// Get out of related and collections
			this.relatedBase=null;																// No base and set to home
			sui.GetKmapFromID(id,(kmap)=>{ this.Draw(kmap); });									// Get kmap and show page
			this.ClearPopover();																// Clear popover	
			return;																				// Quit
			}
		this.PopoverTimer=setTimeout(()=>{ this.DisplayPopover(id,event)},500);					// Draw it
	}

	ClearPopover()																			// CLEAR KMAP DROP DOWN
	{
		clearTimeout(this.PopoverTimer);														// Kill timer
		this.PopoverTimer=null;																	// Kill flag
		$("[id^=sui-popover-]").remove();														// Remove old one
		this.lastPopover="";																	// Clear last
	}

	// CALLS sui.GetKmapFromID();
	// MAKES AJAX CALLS

	// Todo:  Refactor popup closing:(ClearPopovers)
	DisplayPopover(id, event)																// ACTUALLY DISPLAY KMAP DROP DOWN
	{
		const sui = this.sui;
		let i,pos;

		clearTimeout(this.PopoverTimer);														// Kill timer
		this.PopoverTimer=null;																	// Kill flag

		if (event.target) {
			pos=$(event.target).offset();
		}																						// Get position of icon
		else {
			pos=$("#plc-main").offset();
			pos.top+=event.y;
			pos.left+=event.x;
		}																						// If coming from a map
		let x=Math.max(160,Math.min(pos.left,$("#sui-main").width()-200));						// Cap sides
		let offset=pos.left-x+150;	// Offset for triangle
		let offsetString = String(offset) + 'px';
		if (!pos.top) {
			return;
		} // Race condition
		this.lastPopover=id;

		// DRAW POPOVER DATA
		sui.GetKmapFromID(id,(o)=>{ 															// GET KMAP DATA
			let v;
			if (!o)  return; 																	// Quit if nothing
			$("[id^=sui-popover-]").remove();													// Remove old one
			let str=`<div id='sui-popover-${id}' class='sui-popover' 
			style='top:${pos.top+24+$(this.div).scrollTop()}px;left:${x-150}px'>
			<div style='position:absolute;width:0;height:0;border-left:8px solid transparent;
			border-right:8px solid transparent;border-bottom:10px solid #999;top:-10px;
			left:${offsetString}'</div>
			<div style='position:absolute;width:0;height:0;border-left:8px solid transparent;
			border-right:8px solid transparent;border-bottom:10px solid white;left:-8px;top:2px;'</div>
			</div>`;
			$("#sui-main").append(str.replace(/\t|\n|\r/g,""));									// Remove format and add to div

			// one-time trap to clear popover
			$("#sui-main").one('mousemove', () => {
				console.log("clearing popover on mousemove " + event.target);
				this.ClearPopover();
			});

			str=`<div style='float:right;margin-top:-8px;font-size:10px'>${o.id}</div>
			<b>${o.title[0]}</b><hr style='border-top:1px solid #ccc'>
			<span style='font-size:12px;text-transform:capitalize'>
			For more information about this ${o.asset_type.slice(0,-1)}, see Full Entry below.<p>`;
			if (o.feature_types_idfacet && (o.asset_type == "places")) {						// Show Feature types in places
				str+="<b>Feature types: </b>";													// Add title
				for (i=0;i<o.feature_types_idfacet.length;++i) {								// For each feature
					v=o.feature_types_idfacet[i].split("|");									// Split title and id
					str+=`<a class='sui-crumb' style='color:#000;text-transform:none' id='sui-crumb-${v[1]}'
					href='#p=${v[1]}'>${v[0]}</a>`;											
					if (i < o.feature_types_idfacet.length-1)	str+=", ";						// Add separator
					else str+="<br>"
					}
				}
			if (o.ancestors_txt && o.ancestors_txt.length > 1)	str+=`<b>${o.asset_type}: </b>`; // Show header if any breadcrumbs
			if (o.ancestors_txt)																// If breadcrumbs
				for (i=0;i<o.ancestors_txt.length-1;++i) {										// For each trail member
					str+=`<a class='sui-crumb' style='color:#000;text-transform:none' id='sui-crumb-${o.asset_type}-${o.ancestor_ids_is[i]}'
					href='#p=${o.asset_type}-${o.ancestor_ids_is[i]}'>${o.ancestors_txt[i]}</a>`;											
					if (i < o.ancestors_txt.length-2)	str+=" / ";								// Add separator
					}
			str+=`</p></span><br>
			<div id='sui-popbot' style='width:100%;padding:1px 12px;background-color:#333;font-size:14px;
			border-radius:0 0 6px 6px;color:#ddd;margin:-12px;cursor:pointer'>
			<a class='sui-popItem' href='#p=${o.uid}'>
			<p id='sui-full-${o.uid}'>&#xe629&nbsp;&nbsp;FULL ENTRY</p></a>
			</div>`;
			$("#sui-popover-"+id).append(str.replace(/\t|\n|\r/g,""));							// Remove format and add to div

			// MOUSELEAVE LISTENER
			$("#sui-popover-"+id).on('mouseleave', () => { this.ClearPopover(); } );

			$("#sui-full-"+id).on("click",(e)=> {												// ON FULL ENTRY CLICK
				this.ClearPopover();															// Clear popover	
				if (sui.ss.mode == "related")  sui.ss.mode=this.lastMode;						// Get out of related and collections
				this.relatedBase=null;															// No base and set to home
				var id=e.currentTarget.id.substring(9).toLowerCase();							// Get id
				sui.GetKmapFromID(id,(kmap)=>{ sui.SendMessage("",kmap); });					// Get kmap and show page
				return false;																	// Don't propagate
				});
			
			$("[id^=sui-crumb-]").on("click",(e)=> {											// ON BREAD CRUMB CLICK
				this.ClearPopover();															// Clear popover	
				if (sui.ss.mode == "related")	 sui.ss.mode=this.lastMode;						// Get out of related and collections
				this.relatedBase=null;															// No base and set to home
				var id=e.currentTarget.id.substring(10).toLowerCase();							// Get id
				sui.GetKmapFromID(id,(kmap)=>{ sui.SendMessage("",kmap); });					// Get kmap and show page
				return false;																	// Don't propagate
				});
			});

		// DRAW MORE POPOVER DATA
		var url=sui.solrUtil.createKmapQuery(id,null,null,300);									// Get query url
		$.ajax( { url: url,  dataType: 'jsonp', jsonp: 'json.wrf' }).done((data)=> {			// Get related places
			let i,n,str="";
			if ($("[id^=sui-pop-]")[0])	return; 												// Quit if already loaded
			if (data.facets.asset_counts.buckets && data.facets.asset_counts.buckets.length){	// If valid data
				let d=data.facets.asset_counts.buckets;											// Point at bucket array
				for (i=0;i<d.length;++i) {														// For each bucket
					n=d[i].count;																// Get count													
					if (d[i].val == "texts:pages") continue;									// Ignore pages of texts
					if (n > 1000)	n=Math.floor(n/1000)+"K";									// Shorten
					str+=`<a class='sui-popItem' href='#v=${id}=${d[i].val}'>
					<p id='sui-pop-${id}-${d[i].val}' style='cursor:pointer;text-transform:capitalize'>
					<span style='color:${sui.assets[d[i].val].c}'>${sui.assets[d[i].val].g}</span>
					&nbsp;&nbsp;Related ${d[i].val} (${n})</p></a>`;
					}
				$("#sui-popbot").append(str.replace(/\t|\n|\r/g,""));							// Remove format and add to div
				
				$("[id^=sui-pop-]").on("click",(e)=> {											// ON ITEM CLICK
					this.ClearPopover();																// Clear popover	
					let v=e.currentTarget.id.toLowerCase().split("-");							// Get id
					if (v[4] == "audio") v[4]="audio-video";									// Rejoin AV
					let url=sui.solrUtil.createKmapQuery(v[2]+"-"+v[3],v[4],0,1000);			// Get query url
					$.ajax( { url: url,  dataType: 'jsonp', jsonp: 'json.wrf' }).done((data)=>{ // Get related places
						sui.curResults=sui.MassageKmapData(data.response.docs);					// Normalize for display
						sui.DrawItems();														// Draw items																
						sui.DrawFooter();														// Draw footer															
						sui.ss.page=0;															// Start at beginning
					});
					sui.GetKmapFromID(id,(o)=>{													// Get kmap
						 this.relatedBase=o;													// Set new base
							this.relatedId=o.asset_type+"-"+o.id;								// Set id
							this.DrawHeader(o);													// Set header
							});
					return false;																// Don't propagate
					});
				}
			});
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RELATED SIDEBAR
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// ARGUMENT o: kmassets solr entry
	// ARGUMENT fromHistory: boolean that determines whether a new history item is pushed
	// CALLS sui.GetKmapFromID()
	// MAKES AJAX CALLS
	// ATTACHES HANDLERS WHICH CALL this.DrawRelatedResults(o), sui.plc.Draw(), sui.sub.Draw();
	DrawRelatedAssets(o, fromHistory)														// DRAW RELATED ASSETS MENU
	{
		console.error("pages.DrawRelatedAssets() called with arguments");
		console.dir(arguments);
		const sui = this.sui;
		let i, v, k, sk, str = "", browse = true;
		let p = (this.relatedBase || o);															// Pointer to base kmap
		if (p) {
			browse = p.asset_type.match(/places|subjects|terms|collections/);
		}																						// Add browsing to this menu?

		if (sui.ss.mode == "related") {
			o = this.relatedBase;
		}																						// If special, use base
		else {
			this.lastMode = sui.ss.mode;
		}																						// Save last search mode

		// SHORT CIRCUIT
		if (!o) {
			return;
		}																						// No related to show

		// SHORT CIRCUIT
		if (!browse && (sui.ss.mode != "related")) {
			return;
		}																						// Quit if not related or a sub/term/place/collection

		// SIDE QUERY FOR COLLECTIONS
		if (p.asset_type != "collections") {
			var url = sui.solrUtil.createKmapQuery(o.uid);										// Get query url
			$.ajax({url: url, dataType: 'jsonp', jsonp: 'json.wrf'}).done((data) => {		// Get related assets
				var i, n, tot = 0;
				if (data.facets.asset_counts.buckets && data.facets.asset_counts.buckets.length) { // If valid data
					let d = data.facets.asset_counts.buckets;										// Point at bucket array
					for (i = 0; i < d.length; ++i) {													// For each bucket
						if (d[i].val == "texts:pages") continue;								// Skip it
						if ((o.asset_type == "terms") && (d[i].val == "terms")) continue;		// Skip
						n = d[i].count;															// Get count
						tot += n;																	// Add to total
						if (n > 1000) n = Math.floor(n / 1000) + "K";								// Shorten
						$("#sui-rln-" + d[i].val).html(n);										// Set number
						$("#sui-rl-" + d[i].val).css({display: "block"});							// Show it
					}
					if (tot > 1000) tot = Math.floor(tot / 1000) + "K";								// Shorten
					$("#sui-rln-all").html(tot);												// Set total number
					$("#sui-rl-all").css({display: "block"});									// Show total
				}
				let div = "#sui-btree-" + o.asset_type;												// Point at tree

				// COSMETICS
				if ($("#sui-footer").offset() && $(div).offset()) {
					$(div).css("max-height", $("#sui-footer").offset().top - $(div).offset().top - 40 + "px");	// Fill space
				} else {
					console.error("no footer or no sui-btree");
				}
				;
			});
		} else {																					// Collections
			browse = false;																		// No browsing
			sk = o.asset_subtype.toLowerCase();													// Get asset sub-type
		}

		$("#sui-content").scrollTop(0);
		$(this.div).scrollTop(0);							// Scroll to top
		k = o.asset_type;																			// Get this asset type
		str += `<div class='sui-related' style='border-color:${sui.ss.mode == "related" ? sui.assets[k].c : "transparent"};
			height:${$(this.div).height() + 6}px'>`;
		if (sui.ss.mode != "related") str += "RELATED RESOURCES<hr>";
		str += "<div class='sui-relatedList'>";
		str += "<div class='sui-relatedItem' id='sui-rl-Home'><span style='font-size:18px; vertical-align:-3px; color:" + sui.assets[k].c + "'>" + sui.assets[k].g + " </span> <b style='color:" + sui.assets[k].c + "'>Home</b></div>";
		if (p.asset_type == "collections")
			str += "<div class='sui-relatedItem' id='sui-rl-" + sk + "'><span style='font-size:18px; vertical-align:-3px; color:" + sui.assets[sk].c + "'>" + sui.assets[sk].g + " </span> " + o.asset_subtype + "</div>";
		for (k in sui.assets) {																	// For each asset type														
			str += "<a class='sui-relatedItem' style='display:none' id='sui-rl-" + k.toLowerCase();
			str += "' href='#r=" + this.relatedId + "=" + this.relatedId + "=" + k + "=" + o.uid + "'>";
			str += "<span style='font-size:18px; vertical-align:-3px; color:" + sui.assets[k].c + "'>" + sui.assets[k].g + "</span> ";
			str += k.charAt(0).toUpperCase() + k.substr(1) + " (<span id='sui-rln-" + k.toLowerCase() + "'>0</span>)</a>";
		}
		if (browse && p) {																		// If browsing
			str += "<img id='sui-relatedImg'></div>";												// Image, if available
			str += "RECENTLY VIEWED<hr style='margin:8px 0 12px 0'>";								// Add label
			str += "<div class='sui-relatedRecent' id='sui-relatedRecent'>";						// Div to recent entries
			for (i = this.recentPages.length - 1; i >= 0; --i) {										// For each recent (backwards)
				v = this.recentPages[i].split("|");												// Split title from id
				v[1] = sui.ShortenString(v[1], 18);												// Cap
				str += `<a class='sui-noA' id='sui-rcItem-${v[0]}' href='#p=${v[0]}'>
				<div class='sui-relatedRecentItem' id='sui-rr-${v[0]}'>&nbsp;&nbsp;
				<span style='color:${sui.assets[v[2]].c}'>${sui.assets[v[2]].g}
				</span>&nbsp;&nbsp;${v[1]}</div></a>`;											// Add entry
			}
			str += "</div><br>BROWSE " + p.asset_type.toUpperCase() + "<hr style='margin:8px 0 16px 0'>";	// Add label
			str += "<div class='sui-tree' style='padding-left:0;margin-right:12px;' id='sui-btree-" + p.asset_type + "'></div>";	// Add browsing tree div
		}

		// OUTPUT append to div
		$(this.reldiv).html(str.replace(/\t|\n|\r/g, ""));										// Remove format and add to div

		if (browse) {
			this.DrawTree("#sui-btree-" + o.asset_type, o.asset_type);
		}																						// If browsing, add tree

		if (!this.relatedType) {
			$("#sui-rl-Home").css({"background-color": "#f7f7f7"});
		}		// Hilite Home
		else {
			$("#sui-rl-" + this.relatedType).css({"background-color": "#f7f7f7"});
		} // Hilite current


		// HANDLERS
		$("[id^=sui-rcItem-]").off("click");													// KILL RECENTS HANDLER
		$("[id^=sui-rcItem-]").on("click", (e) => {												// ON RECENTS CLICK
			let id = e.currentTarget.id.substring(11);											// Get id
			if (sui.ss.mode == "related") sui.ss.mode = this.lastMode;							// Get out of related
			this.relatedBase = null;																// Remove umbrella
			sui.GetKmapFromID(id, (kmap) => {
				sui.SendMessage("", kmap);
			});						// Get kmap and show page
			return false;																		// Stop propagation
		});

		$("[id^=sui-rl-]").on("click", (e) => {													// ON CLICK ON ASSET


			alert("CLICKED RELATED LINK " + e.target);
			this.relatedType = e.currentTarget.id.substring(7);									// Get asset type
			if (this.relatedType == "Home") {													// Home asset
				if (sui.ss.mode == "related") sui.ss.mode = this.lastMode;						// Get out of related

				this.Draw(this.relatedBase ? this.relatedBase : o);								// Show
				this.relatedBase = null;															// No base and set to home
			} else if ((p.asset_type == "places") && (this.relatedType == "places"))
				sui.plc.Draw(o, 4);		// If place in places, show places
			else if ((p.asset_type == "places") && (this.relatedType == "subjects"))
				sui.plc.Draw(o, 3);		// If subject in places, show subjects
			else if ((p.asset_type == "subjects") && (this.relatedType == "subjects"))
				sui.sub.Draw(o, 1);		// If subject in subjects
			else if ((p.asset_type == "subjects") && (this.relatedType == "places"))
				sui.sub.Draw(o, 2);		// If places in subjects
			else {																				// Regular results
				if (!this.relatedBase) {
					this.relatedBase = o;									// If starting fresh
				}

				this.DrawRelatedResults(o);														// Related asset browsing

				if (!fromHistory) {																// If not from history API
					sui.SetState("r=" + this.relatedId + "=" + this.relatedBase.uid + "=" + this.relatedType + "=" + o.uid);	// Set state
				}
			}
			return false;																		// Don't propagate
		});
	}

	DrawRelatedResults(o)																	// SHOW RELATED ASSETS
	{

		let x = (o.uid)? o.uid:o;
		const message = "pages.DrawRelatedResults() called with " + x;
		console.error(message);
		// alert(message);
		console.dir(o);
		const sui = this.sui;
		sui.ss.mode="related";																	// Go to related mode
		if (!this.relatedBase)	 this.relatedBase=o;											// If starting fresh
		this.relatedId=this.relatedBase.asset_type+"-"+this.relatedBase.id;						// Set id
		sui.Query(false, o.asset_type == "collections" ? o.uid : "");							// Query and show results add id if a collection to trigger collection search
		sui.DrawFooter();																		// Draw footer
		sui.ss.page=0;																			// Start at beginning
	}

	DrawHeader(o)																			// DRAW HEADER
	{
		// alert("pages.DrawHeader called()");
		console.error("STUBBED pages.Drawheader called with arguments");
		console.dir(o);
		return;

		const sui = this.sui;
		var i;
		if (!o) return;																			// Return if not kmap defines
		var str=`${sui.assets[o.asset_type].g}&nbsp;&nbsp`;
		str+=o.title[0];																		// Add title
		if (o.ancestors_txt && o.ancestors_txt.length) {										// If has an ancestors trail
			str+="<br><div class='sui-breadCrumbs'>"+o.asset_type.toUpperCase()+":&nbsp; ";		// Header
			for (i=0;i<o.ancestors_txt.length;++i) {											// For each trail member
				str+=`<a class='sui-crumb' style='color:#fff' id='sui-crumb-${o.uid.split("-")[0]}-${o.ancestor_ids_is[i]}'
				 href='#p=${o.uid.split("-")[0]}-${o.ancestor_ids_is[i]}'>				
				${o.ancestors_txt[i]}</a>`;
				if (i < o.ancestors_txt.length-1)	str+=" > ";									// Add separator
				}
			str+="</div>";																		// Cloase breadcrumbs div
			}
		if (this.editing)	str+="<div id='sui-editBut' class='sui-editBut' title='Edit this item'>&#xe688</div>";		// Add editing button

		console.error("EXAMINE sui");
		console.dir(sui);

		$("#sui-contentHead").html(str.replace(/\t|\n|\r/g,""));								// Remove format and add to div
		$("#sui-footer").html(`<div style='float:right;font-size:14px;margin-right:16px'>${o.asset_type.toUpperCase()} ID: ${o.id}</div>`);	// Set footer
		$("#sui-header").css("background-color",sui.assets[o.asset_type].c);					// Color header
		$("#sui-footer").css("background-color",sui.assets[o.asset_type].c);					// Color footer
	
		$("[id^=sui-crumb-]").on("click",(e)=> {												// ON BREAD CRUMB CLICK
			var id=e.currentTarget.id.substring(10).toLowerCase();								// Get id
			if (sui.ss.mode == "related") sui.ss.mode=sui.ss.lastMode;							// Get back to regular search mode
			sui.GetKmapFromID(id,(kmap)=>{ sui.SendMessage("",kmap); });						// Get kmap and show page
			return false;																		// Don't propagate
			});
		
		$("#sui-editBut").on("click",()=> {														// ON EDIT BUTTON CLICK
			let str="http://"+o.asset_type+".";													// URL head
			sui.Popup("Editing this item in Rails now!");										// Show we're editing
			if (o.asset_type.match(/subjects|places|terms/i))	str+="kmaps.virginia.edu/admin/slices/"+o.id;
			else												str+="shanti.virginia.edu/node/"+o.id+"/edit";
			window.open(str,"_blank");															// Open in new window
			});
			
		}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RELATED TREE TOOLS
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	AddRelTreeLine(lab, id, marker, path) 													// ADD LINE TO TREE
	{
		const sui = this.sui;
		let s=`<li style='margin:2px 0 2px ${-24}px'>`;											// Header
		if (marker)	s+=`<div class='sui-spDot' id='sui-spDot-${path}'>${marker}</div>`;			// If a dot, add it
		else		s+="<div class='sui-spLoner'><b>&bull;&nbsp;&nbsp;</b></div>";				// If a loner
		s+=`<a class='sui-noA' href='#p=${id}' id='sui-spLab-${id}'>${lab}</b>${sui.pages.AddPop(id)}</a>`;		
		return s;																				// Return line
	}

	AddRelBranch(facet, path, dot) 															// LAZY LOAD BRANCH
	{
		const sui = this.sui;
		let _this=this;																			// Save context
		sui.GetTreeChildren(facet,path,(res)=>{													// Get children
			let str="";
			let i,j,re,m,path;
			let counts=[];
			try { counts=res.facets.child_counts.buckets; } catch(e) {}							// Get child counts
			res=res.response.docs;																// Point at docs
			for (i=0;i<res.length;++i) {														// For each child
				path="";	m=null;																// Assume a loner												
				re=new RegExp(res[i].id.split("-")[1]);											// Get id to search on
				for (j=0;j<counts.length;++j) {													// For each count
					if (counts[j].val.match(re)) {												// In this one
						m="+";																	// Got kids
						path=counts[j].val;														// Add path
						}
					}												
				str+="<ul style='list-style-type:none'>";										// Header
				str+=this.AddRelTreeLine(res[i].header,res[i].id,m,path)+"</li></ul>"; 			// Add it
				}
			$(dot).prop("id","sui-spDot-null");													// Inhibit reloading
			dot.parent().append(str);															// Append branch

			$("[id^=sui-spDot-]").off("click");													// Kill handler
			$("[id^=sui-spDot-]").on("click", function(e) {										// ON RELATIONSHIP TREE DOT CLICK
				let firstChild=$(this).parent().find("ul")[0];									// Get first child
				let path=e.currentTarget.id.substring(10);										// Get id
				if (path != "null") {															// Not loaded yet
					$(this).html("&ndash;");													// Show it's open
					_this.AddRelBranch(facet,path,$(this));										// Lazy load branch
					}
				else $(this).html($(firstChild).css("display") == "none" ? "&ndash;" : "+"); 	// Change label
				$(this).parent().find('ul').slideToggle();            							// Slide into place
				});
			});
		}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// NO SIDE EFFECTS
	DrawTabMenu(tabs)																		// DRAW TAB MENU
	{
		let i, str="";														
		for (i=0;i<tabs.length;++i) 															// For each tab	
			str+=`<div class='sui-tabTab' id='sui-tabTab${i}' style='width:calc(${100/tabs.length}% - 2px)'>${tabs[i]}&nbsp;&#xe609</div>`;
		str+="<div class='sui-tabContent' id='sui-tabContent'></div>";							// Tab contents
		return str.replace(/\t|\n|\r|/g,"");													// Return tab markup
	}

	// OUTPUT: WRITES TO DOM
	DrawCarousel(content)																	// DRAW RESOURCE CAROUSEL
	{
		const sui = this.sui;
		let i,curCon=0;
		content=[
			{ title:"The Shinjé Yapyum Cham is performed", 
			text:"One of the most common sacred masked dances performed during religious festivals in Bhutan is the Shinjé Yapyum Cham. The dance is often performed early during a festival’s program as it is believed to subdue negative spirits and harmful influences. Although known as the Shinjé Yapyum Cham, or the Dance of the Male and Female Lords of Death, it represents the male and female Yamāntaka is the Destroyer of Death...",
		  	pic:"https://cicada.shanti.virginia.edu/images/mandala/shanti-image-550401/full/!600,/0/default.jpg", id:"images-stage_shanti_virginia_edu-1187696"},
			{ title:"A Song Called Ja legmo Tsering", 
			text:"Unlike today, meeting a person was extremely difficult in the past. The lyrics of this song say that meeting someone was considered as an act of fate. People would meet even if they had never thought of meeting that person. The composer wishes for two people who have met through fate, to stay together for their entire life...",
			pic:"https://cfvod.kaltura.com/p/381832/sp/38183200/thumbnail/entry_id/1_xvwn4fvx/version/100021/600/600/height/0", id:"audio-video-stage_shanti_virginia_edu-22741"},
			{ title:"Tongue Twister in the Kheng Language", 
			text:"In the past, parents taught their kids tongue twisters as a way to practice pronunciation. Rinchen Drakpa from Sharigang presents two tongue twisters in his local language, Khengkha. Rinchen Drakpa says that in his childhood he witnessed villagers competing to be the one who could say the tongue twisters with the most perfect pronunciation.",
			pic:"https://cfvod.kaltura.com/p/381832/sp/38183200/thumbnail/entry_id/0_ou7n6lp9/version/100021/600/600/height/0", id:"audio-video-stage_shanti_virginia_edu-3806"},
			{ title:"Seven Limbs of Practice: Chöpa", 
			text:"Most Bhutanese Buddhist rituals contain the set of seven practices known as yoen lak duen pa (ཡན་ལག་བདུན་པ་). The seven practices prostration (ཕྱག་), offering (མཆོད་པ་), confession (བཤགས་པ་), rejoicing (རྗེས་སུ་ཡི་རང་བ་), request to live long (བཞུགས་པར་གསོལ་བ་འདེབས་པ་), request to turn the wheel of Dharma (ཆོས་ཀྱི་འཁོར་ལོ་སྐོསྐོར་བར་བསྐུལ་བ་) and to dedicate the merits (བསྔོ་བ་).This piece was initially published in Bhutan’s national newspaper Kuensel..",
			pic:"https://mms.thlib.org/images/0050/8753/63691_large.jpg", id:"texts-stage_shanti_virginia_edu-38836"},
			{ title:"A Story of a Rich and a Poor Girl", 
			text:"Ap Tempo of Karna Gewog, Dagana narrates a story of a poor girl who is straight forward and faithful. Her rich friend was always insecure. The poor girl gets rewarded by a deity for her kind heart and good attitude; she suddenly becomes rich, and her rich friend became insecure about her. She tries to achieve what the poor girl has achieved, but gets punished due to her jealousy and greediness.",
			pic:"https://cfvod.kaltura.com/p/381832/sp/38183200/thumbnail/entry_id/1_607tfowl/version/100031/600/600/height/0", id:"audio-video-stage_shanti_virginia_edu-24651"},
			{ title:"An Exchange of Tsangmo Poems", 
			text:"Tsangmo is a type of song used to express individual's emotions, conveying their inner warmth and affection to another person, through numerious lyrical tunes. Tsangmo can be sung to express love, hatred and any other feelings. While it is sung, the Tsangmo songs are never sung with dance, as it is a poetry song for a singing expression without a dance. It is usually a composition limited to a verse of four lines for an expression.",
			pic:"https://cfvod.kaltura.com/p/381832/sp/38183200/thumbnail/entry_id/1_zk9hsnff/version/100011/609/600/height/0", id:"audio-video-stage_shanti_virginia_edu-22596"},
			];		
				
		let str=`<div class='sui-caroBox'>
		<div class='sui-caroButL' id='sui-caroButL'>&#xe640</div>
		<div class='sui-caroButR' id='sui-caroButR'>&#xe641</div>
		<div class='sui-caroHeader'>&nbsp;</div>
			<div class='sui-caroLeft'>
				<div class='sui-caroTitle' id='sui-caroTitle'></div>
				<div class='sui-caroText' id='sui-caroText'></div>
			</div>
			<img class='sui-caroPic' id='sui-caroPic' src=''><br>
			<a class='sui-caroRes' id='sui-caroRes')' href='#p=${content[curCon].id}'>
			<i>View Resource</i>&nbsp;&nbsp;&#xe683</a>
			<div class='sui-caroDots'>`;
				for (i=0;i<content.length;++i) 													// For each panel
					str+=`<div class='sui-caroDot' id='sui-caroDot-${i}'></div>`;				// Add dot
		str+="</div></div>";
		$(this.div).append(str.replace(/\t|\n|\r/g,""));									// Remove format and add to div

		// TIMERS
		clearInterval(this.carouselTimer);														// Kill timer
		this.carouselTimer=setInterval(()=> { $("#sui-caroButR").trigger("click"); },8000);		// Change panel every 8 secs

		// OUTPUT
		setPanel(curCon);																		// Set 1st pane;
		function setPanel(num) {																// SET PANEL CONTENTS															
			$("#sui-caroTitle").html("&#xe633&nbsp;&nbsp;" + content[num].title);					// Set title
			$("#sui-caroText").html(content[num].text);											// Set text
			$("#sui-caroPic").prop("src", content[num].pic);										// Set pic
			$("[id^=sui-caroDot-]").css({"background-color": "#fff"});							// Reset dot
			$("#sui-caroDot-" + num).css({"background-color": "#5d68cc"});							// Highlight current
		}

		// HANDLERS
		$("#sui-caroRes").on("click", (e)=>{													// ON SEE RESOURCE CLICK
			sui.GetKmapFromID(content[curCon].id,(kmap)=>{ sui.SendMessage("",kmap); });		// Get kmap and show page
			return false;																		// Don't propagate
		});

		$("#sui-caroButL").on("click", (e)=>{													// ON BACK CLICK
			curCon=curCon ? curCon-1 : content.length-1;										// Go back or wrap
			setPanel(curCon);																	// Draw panel
			});

		$("#sui-caroButR").on("click", (e)=>{													// ON FORWARD CLICK
			curCon=(curCon == content.length-1) ? 0 : curCon+1;									// Go forward or wrap
			setPanel(curCon);																	// Draw panel
			});
		
		$("[id^=sui-caroDot-]").on("click", (e)=>{												// ON DOT CLICK
			curCon=e.target.id.substring(12);													// Get number
			curCon=Math.min(content.length-1,Math.max(curCon,0));								// Cap
			setPanel(curCon);																	// Draw panel
			});
	}


	// NO SIDE EFFECTS
	DrawItem(icon, label, value, def, style, bold)											// DRAW ITEM
	{
		let i,str="<p>";
		if ((value == null) || (value == undefined))	return "";								// Return nothing
		if (icon)	str+=icon+"&nbsp;&nbsp;";													// Add icon
		str+="<span class='sui-pageLab'";														// Label head
		if (bold)	str+=" style='font-weight:600'";											// Bold?
		str+=">"+label+":&nbsp;&nbsp;</span>";													// Add label
		str+="<span class='";																	// Add value span
		str+=(style ? style : "sui-pageVal")+"'>";												// Default, or special style
		if (typeof(value) == "object") {														// If an array
			for (i=0;i<value.length;++i)	{													// For each item
				if (value[i].header)		str+=value[i].header;								// Use .header
				else if (value[i].value)	str+=value[i].value;								// .value
				else if (value[i].val)		str+=value[i].val;									// .val
				else if (value[i].title)	str+=value[i].title;								// .title
				else 						str+=value[i];										// Plain	
				if (i != value.length-1)	str+=", ";											// Add separator
				}
			}
		else str+=(value && (!value.match(/undefined/))) ? value : def;							// Add def if bad value or show value
		return str+"</span></p>";																// Return item
	}

	// NO SIDE EFFECTS
	FormatDate(date)																		// FRIENDLY FORMAT OF DATE
	{
		let d=new Date(date);																	// Parse date
		if (d)	date=(d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();						// Remake it
		return date;
	}		

	// !!!!  WRITES sui TO GLOBAL WINDOW IN ORDER TO IMPLEMENT POPOVERS...   !!!!
	AddPop(id, small)																		// ADD KMAP POPOVER
	{
		const sui = this.sui;
		window.sui = this.sui;

		let str=`&nbsp;<img style='display:inline-block' src='/popover.png' ${small ? "style='width:13px'" : ""}
		onmouseenter='sui.pages.ShowPopover("${id}",event); return false;' 
		onmousemove='sui.pages.ShowPopover("${id}",event); return false;' 
		onmousedown='sui.pages.ShowPopover("${id}",event) return false;'>`;									// Make image call to show popover
		return str.replace(/\t|\n|\r|/g,"");													// Return markup
	}

	// ARGUMENT  div
	// ARGUMENT facet (string) e.g. "places"
	// USES this.sui
	// SETS sui.curTree
	// CALLS sui.LazyLoad()
	// CALLS sui.GetTopRow()
	// OUTPUT: alters CSS of passed div
	DrawTree(div, facet)  																		// DRAW FACET TREE
	{
		const sui = this.sui;
		sui.curTree=facet;																		// Save current facet
		if (facet == "places") 		 	sui.LazyLoad(div,null,facet,13735);						// Embedded top layer for places
		else 							sui.GetTopRow(div,facet);								// Constructed top layers

		if ($("#sui-footer").offset() && $(div).offset()) {
			$(div).css("max-height", $("#sui-footer").offset().top - $(div).offset().top - 120 + "px");	// Fill space
		} else {
			console.error("no footer");
		}
	}

	
} // Pages class closure