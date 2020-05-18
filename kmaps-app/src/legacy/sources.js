/* 	SOURCE PAGES ****************************************************************************************************************************

	This module draws the sources page based on a kmap from SOLR. Some information comes from the kmap
	passed in and some from the a second query from the JSON data coming from Drupal. 	
	
	Requires: 	jQuery 												// Almost any version should work
	CSS:		searchui.css										// All styles are prefixed with 'sui-'
	JS:			ECMA-6												// Uses lambda (arrow) functions
	JSON:		From Drupal site
	Globals:	Looks for sui and sui.pages
	Dependents:	pages.js, searchui.js								// JS modules called

*********************************************************************************************************************************************/
/* eslint-disable */
import $ from 'jquery';
export default class Sources  {

	constructor(sui)   																		// CONSTRUCTOR
	{
		if (!sui) {
			throw new Error("SearchUI must be passed to constructor");
		}
		this.sui = sui;
		this.div=sui.pages.div;																	// Div to hold page (same as Pages class)
	}

	Draw(o)																					// DRAW SOURCE PAGE FROM KMAP
	{
		const sui = this.sui;
		var i;
		var str=`<div class='sui-sources' id='sui-sources'>
		<span style='font-size:24px;color:${sui.assets[o.asset_type].c};vertical-align:-4px'>${sui.assets[o.asset_type].g}</span>
		&nbsp;&nbsp;<span class='sui-sourceTitle'>${o.title[0]}</span>
		<hr style='border-top: 1px solid ${sui.assets[o.asset_type].c}'>
		<div class='sui-sourceSec' id='sui-srcSec'></div><br>`;
		if (o.creator && o.creator.length) {
			str+=`<span class='sui-pageLab' style='color:${sui.assets[o.asset_type].c}'>&#xe600</span>
			&nbsp;&nbsp;${o.creator.join(", ")}<br><br>`;
			}
		if (o.url_thumb && !o.url_thumb.match(/gradient.jpg/)) str+="<img src='"+o.url_thumb+"' style='float:right;width:33%; padding:0 0 12px 12px'>";
		if (o.collection_title) str+=`<p>COLLECTION:&nbsp;&nbsp<a id='sui-imgCol' href='#p=${o.collection_uid_s}'>${o.collection_title}</a></p>`;
		if (o.asset_subtype) str+="<p>FORMAT:&nbsp;&nbsp<span class='sui-sourceText'>"+o.asset_subtype+"</span></p>";
		str+="<p class='sui-pageLab' id='sui-p2'>PUBLICATION YEAR:&nbsp;&nbsp<span class='sui-sourceText' id='sui-srcYear'></span>";
		if (o.publisher_s) str+="<p>PUBLISHER:&nbsp;&nbsp<span class='sui-sourceText'>"+o.publisher_s+"</span></p>";
		str+="<p class='sui-pageLab' id='sui-p3'>PLACE OF PUBLICATION:&nbsp;&nbsp<span class='sui-sourceText' id='sui-srcPlc'></span>";
		str+="<p class='sui-pageLab' id='sui-p1'>PAGES:&nbsp;&nbsp<span class='sui-sourceText' id='sui-srcPages'></span>";
		str+="<p class='sui-pageLab'>SOURCE ID:&nbsp;&nbsp<span class='sui-sourceText'>sources-"+o.id+"</span></p>";
		if (o.summary) str+="<p>ABSTRACT:<div class='sui-sourceText'>"+o.summary+"</div></p>";
		str+="</div>";
		$(this.div).html(str.replace(/\t|\n|\r/g,""));											// Remove format and add to div	
		sui.pages.DrawRelatedAssets();															// Draw related assets menu if active

		$("#sui-imgCol").on("click",()=> {														// ON COLLECTION CLICK
			sui.GetKmapFromID(o.collection_uid_s,(kmap)=>{ sui.SendMessage("",kmap); });		// Get kmap and show page
			return false;																		// Stop propagation
			});

		sui.GetJSONFromKmap(o, (d)=> {															// Get details from JSON
			let i,str="";
			if (d.biblio_pages) 			$("#sui-srcPages").html(d.biblio_pages);			// Add pages
			else							$("#sui-sp1").hide();								// Hide
			if (d.biblio_year) 				$("#sui-srcYear").html(d.biblio_year);				// Year
			else							$("#sui-sp2").hide();								// Hide
			if (d.biblio_secondary_title) 	$("#sui-srcSec").html(d.biblio_secondary_title);	// Pub
			else							$("#sui-srcSec").hide();							// Hide
			if (d.biblio_place_published) 	$("#sui-srcPlc").html(d.biblio_place_published);	// Pub place
			else							$("#sui-sp3").hide();								// Hide
			if (d.field_kmaps_subjects && d.field_kmaps_subjects.und) {							// If subjects
				str+="<p class='sui-pageLab'>SUBJECTS:&nbsp;&nbsp;";							// Add header
				for (i=0;i<d.field_kmaps_subjects.und.length;++i) {								// For each item
					str+=d.field_kmaps_subjects.und[i].header;									// Add name
					str+=sui.pages.AddPop(d.field_kmaps_subjects.und[i].domain+"-"+d.field_kmaps_subjects.und[i].id);	// Add drop
					if (i < d.field_kmaps_subjects.und.length-1)	str+=", ";					// Add separator
					}
				str+="</p>";																	// End TERMS
				}
			if (d.field_kmaps_places && d.field_kmaps_places.und) {								// If places
				str+="<p class='sui-pageLab'>TERMS:&nbsp;&nbsp;";								// Add header
				for (i=0;i<d.field_kmaps_places.und.length;++i) {								// For each item
					str+=d.field_kmaps_places.und[i].header;									// Add name
					str+=sui.pages.AddPop(d.field_kmaps_places.und[i].domain+"-"+d.field_kmaps_places.und[i].id);	// Add drop
					if (i < d.field_kmaps_places.und.length-1)	str+=", ";						// Add separator
					}
				str+="</p>";																	// End PLACES
				}
			if (d.field_kmap_terms && d.field_kmap_terms.und) {									// If terms
				str+="<p class='sui-pageLab'>TERMS:&nbsp;&nbsp;";								// Add TERMS header
				for (i=0;i<d.field_kmap_terms.und.length;++i) {									// For each item
					str+=d.field_kmap_terms.und[i].header;										// Add name
					str+=sui.pages.AddPop(d.field_kmap_terms.und[i].domain+"-"+d.field_kmap_terms.und[i].id);	// Add drop
					if (i < d.field_kmap_terms.und.length-1)	str+=", ";						// Add separator
					}
				str+="</p>";																	// End TERMS
				}
			if (d.biblio_url) str+="<p class='sui-pageLab'>URL:&nbsp;&nbsp;<a target='_blank' href='"+d.biblio_url+"'>"+d.biblio_url+"</a></p>";	// URL
			$("#sui-sources").append(str);
			});									
	}

} // Sources class closure
