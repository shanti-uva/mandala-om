/* 	VISUAL PAGES ****************************************************************************************************************************

	This module draws the visuals page based on a kmap from SOLR. An iframe displays the visualization 
	based on a url and the metadata associated with it appears below. The various methods of sharing
	the viz with other are revealed aa they are clicked on.

	Requires: 	jQuery 												// Almost any version should work
	CSS:		searchui.css										// All styles are prefixed with 'sui-'
	JS:			ECMA-6												// Uses lambda (arrow) functions
	JSON:		From Drupal site
	Globals:	looks for sui and sui.pages
	Dependents:	pages.js, searchui.js								// JS modules called

********************************************************************************************************************************************/
/* eslint-disable */
import $ from 'jquery';
export default class Visuals  {

	constructor(sui)   																		// CONSTRUCTOR
	{
		if (!sui) {
			throw new Error("SearchUI must be passed to constructor");
		}
		this.sui = sui;
		this.div=sui.pages.div;																	// Div to hold page (same as Pages class)
	}

	Draw(o)																			// DRAW VISUAL PAGE FROM KMAP
	{
		const sui = this.sui;
		sui.GetJSONFromKmap(o, (d)=> { drawDetails(d); });										// Gert JSON
		var url="//visuals.shanti.virginia.edu/sites/all/libraries/SHIVA/go.htm?m=//visuals.shanti.virginia.edu/data/json/";
		url+=o.id;																				// Full url
		var d=sui.pages.DrawItem;																// Point at item drawer
	
		function drawDetails(j) {																// Draw details
			let s;
			var shivaNode=$.parseJSON(j.shivanode_json.und[0].value);							// Get shiva data
			var wid=shivaNode.width ? shivaNode.width+"px" : "100%";							// If width set use it 
			var hgt=shivaNode.height ? shivaNode.height+"px" : "calc(100% - 155px)";			// Height 
			var src=shivaNode.dataSourceUrl ? shivaNode.dataSourceUrl : "";						// Data source
			var str=`<iframe id='sui-iframe' frameborder='0' scrolling='no' src='${url}' 
			style='margin-left:auto;margin-right:auto;height:${hgt};width:${wid};display:block;overflow:hidden'></Iframe><br>`;	
			str+="<div class='sui-sources' style='padding-top:0'>";
			try{ if (o.collection_title)	s=`<a title='Collection' id='sui-imgCol'	href='#p=${o.collection_uid_s}'>${o.collection_title}</a>`;
			else							s="None"; }  catch(e) {}
			str+="<div style='text-align:center'>"+d("&#xe633","MANDALA COLLECTION",s)+"</div>";
			str+="<hr style='border-top: 1px solid #6e9456;margin-top:12px'>";
			try{ str+=d("&#xe63b","TITLE",o.title[0],"Untitled"); } catch(e){}
			try{ str+=d("&#xe65f","TYPE",o.asset_subtype.replace(/:/g," | ")) } catch(e){}
			try{ str+=d("&#xe60c","DATE",o.node_created.substr(0,10)) } catch(e){}
			try{ str+="&#xe600&nbsp;&nbsp;<span class='sui-pageLab'>CREATOR</span>:&nbsp;&nbsp;<span class='sui-pageVal'>";
				str+=(o.node_user_full) ? o.node_user_full+"&nbsp;&nbsp" : "" +"";
				str+=(o.node_user) ? o.node_user : ""; str+="</span>"; } catch(e) {}
				if (j.field_kmaps_subjects && j.field_kmaps_subjects.und) {							// If subjects
					str+="<p class='sui-pageLab'>SUBJECTS:&nbsp;&nbsp;";							// Add header
					for (let i=0;i<j.field_kmaps_subjects.und.length;++i) {								// For each item
						str+=j.field_kmaps_subjects.und[i].header;									// Add name
						str+=sui.pages.AddPop(j.field_kmaps_subjects.und[i].domain+"-"+j.field_kmaps_subjects.und[i].id);	// Add drop
						if (i < j.field_kmaps_subjects.und.length-1)	str+=", ";					// Add separator
						}
					str+="</p>";																	// End TERMS
					}
				if (j.field_kmaps_places && j.field_kmaps_places.und) {								// If places
					str+="<p class='sui-pageLab'>TERMS:&nbsp;&nbsp;";								// Add header
					for (let i=0;i<j.field_kmaps_places.und.length;++i) {								// For each item
						str+=j.field_kmaps_places.und[i].header;									// Add name
						str+=sui.pages.AddPop(j.field_kmaps_places.und[i].domain+"-"+j.field_kmaps_places.und[i].id);	// Add drop
						if (i < j.field_kmaps_places.und.length-1)	str+=", ";						// Add separator
						}
					str+="</p>";																	// End PLACES
					}
				if (j.field_kmap_terms && j.field_kmap_terms.und) {									// If terms
					str+="<p class='sui-pageLab'>TERMS:&nbsp;&nbsp;";								// Add TERMS header
					for (let i=0;i<j.field_kmap_terms.und.length;++i) {									// For each item
						str+=j.field_kmap_terms.und[i].header;										// Add name
						str+=sui.pages.AddPop(j.field_kmap_terms.und[i].domain+"-"+j.field_kmap_terms.und[i].id);	// Add drop
						if (i < j.field_kmap_terms.und.length-1)	str+=", ";						// Add separator
						}
					str+="</p>";																	// End TERMS
					}		
			if (src) 		str+="<p>&#xe678&nbsp;&nbsp;<a target='_blank' href='"+src+"'>External spreadsheet</a></p>"; 
			if (o.caption)	str+=o.caption;		
	
			var urlw=`[iframe src="${url}" width="${wid}" height="${hgt}"]`;					// Wordpress embed code
			var urli=`&lt;iframe src=\"${url}\" width=\"${wid}\" height=\"${hgt}\"&gt;`;		// Iframe
			str+=`<hr>&#xe600&nbsp;&nbsp;<span class='sui-pageLab'>SHARE AS</span>:&nbsp;&nbsp;
				<a id='sui-share-1' style='display:inline-block;cursor:pointer'>Link&nbsp;&nbsp;&nbsp;</a>
				<a id='sui-share-2' style='display:inline-block;cursor:pointer'>WordPress&nbsp;&nbsp;&nbsp;</a>
				<a id='sui-share-3' style='display:inline-block;cursor:pointer'>Iframe&nbsp;&nbsp;&nbsp;</a>
				<p id='sui-resShare' style='border-radius:4px;background-color:#fff;padding:8px;display:none;border:1px solid #ccc'></p>
				</div>`;

			$("#sui-resShare").html("<b>LINK</b>: ${url}"); $("#sui-resShare").toggle();
			$(sui.pages.div).html(str.replace(/\t|\n|\r/g,""));									// Remove format and add to div	
			sui.pages.DrawRelatedAssets(o);														// Draw related assets menu if active
		
			$("[id^=sui-share-]").on("click",(e)=> {											// ON THUMBNAIL CLICK
				var id=e.currentTarget.id.split("-")[2];										// Get id
				if (id == "1")		$("#sui-resShare").html(url);								// Link
				else if (id == "2")	$("#sui-resShare").html(`[iframe src="${url}" width="${wid}" height="${hgt}"]`);		// Wordpress embed code
				else if (id == "3")	$("#sui-resShare").html(`&lt;iframe src="${url}" width="${wid}" height="${hgt}"&gt;`);	// Iframe
				$("#sui-resShare").show();														// Toggle state
				});
			}
	}

} // Visuals class closure