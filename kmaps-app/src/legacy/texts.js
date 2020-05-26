/* 	TEXT PAGES ****************************************************************************************************************************

	This module draws the Texts page based on a kmap from SOLR. Some information comes from the kmap
	passed in and some from the a second query from the JSON data coming from Drupal. The formatted 
	table of contents and text content are tsaken directly from the JSON markup.

	A tabbed interface shows that TOC, descriptive metadata. and links to alternative ways to view 
	the text in other formats. 

	Requires: 	jQuery 												// Almost any version should work
	CSS:		searchui.css										// All styles are prefixed with 'sui-'
				https://texts-dev.shanti.virginia.edu/sites/all/themes/shanti_sarvaka_texts/css/shanti_texts.css		// For contents formatting		
	JS:			ECMA-6												// Uses lambda (arrow) functions
	JSON:		From Drupal site
	Globals:	Looks for sui and sui.pages
	Dependents:	pages.js, searchui.js								// JS modules called

******************************************************************************************************************************************/
/* eslint-disable */
import $ from 'jquery';
export default class Texts  {

	constructor(sui)   																		// CONSTRUCTOR
	{
		if (!sui) {
			throw new Error("SearchUI must be passed to constructor");
		}
		this.sui=sui;
		this.div=sui.pages.div;															// Div to hold page (same as Pages class)
		this.content=["...loading","...loading","...loading"];									// Content pages
	}

	Draw(o)																					// DRAW TEXTS PAGE FROM KMAP
	{
		console.error("texts.Draw()");
		const sui = this.sui;
		let _this=this;
		if (!$(".shanti-texts-section-content").length)											// No CSS yet
			$("<link/>", { rel:"stylesheet", type:"text/css", href:"https://texts-dev.shanti.virginia.edu/sites/all/themes/shanti_sarvaka_texts/css/shanti_texts.css" }).appendTo("head"); 	// Load CSS
		var url=o.url_ajax.replace(/node_ajax/i,"node_embed")+"?callback=pfunc";				// Make url
		$(this.div).html();// Clear page
		var str=`<div id='sui-textCon' class='sui-texts'></div>
		<div style='display:inline-block;width:calc(34% + 3px);margin-left:-8px;vertical-align:top'>
		<div class='sui-textTop' id='sui-textTop'>
			<div class='sui-textTab' id='sui-textTab0'>CONTENTS</div>
			<div class='sui-textTab' id='sui-textTab1'>DESCRIPTION</div>
			<div class='sui-textTab' id='sui-textTab2'>VIEWS</div>
		</div>
		<div class='sui-textContent' id='sui-textContent'></div></div>`;
		$(this.div).html(str.replace(/\t|\n|\r/g,""));											// Remove format and add to div	

		// sui.pages.DrawRelatedAssets(o);															// Draw related assets menu if active

		sui.LoadingIcon(true,64);																// Show loading icon

		$.ajax( { url:url, dataType:'jsonp'}).done((data)=> {									// Get json
			sui.LoadingIcon(false);																// Hide loading icon
			$("#sui-textCon").html(data);														// Add text content
			$("#shanti-texts-container").height($("#sui-content").height()-80);					// Reset text height
			$("#shanti-texts-body").height($("#sui-content").height()-110);						// Reset text height
			this.content[0]=$("#shanti-texts-toc").html();										// Save TOC
			$("#shanti-texts-sidebar").remove();												// Remove original sidebar
			showTab(0);																			// Show TOC
	
			$("#shanti-texts-container").append("xxxxxxxxxxxxx<br><br>")
			$(".kmap-tag-group").each(function() {												// For each tag group
				let facet=$(this).data("kmdomain");												// Get facet
				let id=facet+"-"+$(this).data("kmid");											// Make id
				let str=`<span style='font-family:"Open Sans",shanticon;color:${sui.assets[facet].c}'>
					${sui.assets[facet].g}&nbsp;</span>
					${$(this.children[0]).text()}
					${sui.pages.AddPop(id)}&nbsp;&nbsp;`;
				$(this.children[0]).html(str.replace(/\t|\n|\r/g,""));
				})

			let s=`<p><b>ALTERNATIVE FORMATS</b></p>
			<p>&nbsp;&nbsp;&nbsp;&nbsp;<a target='_blank' href='https://texts.shanti.virginia.edu/book_pubreader/${o.id}'>&#xe678&nbsp;&nbsp;View in PubReader</a></p>
			<p>&nbsp;&nbsp;&nbsp;&nbsp;<a target='_blank' href='https://texts.shanti.virginia.edu/shanti_texts/voyant/${o.id}'>&#xe678&nbsp;&nbsp;View in Voyant</a></p>
			<p>&nbsp;&nbsp;&nbsp;&nbsp;<a target='_blank' href='https://texts.shanti.virginia.edu/shanti_texts/node_ajax_text/${o.id}'>&#xe678&nbsp;&nbsp;View as raw text</a></p>`;
			this.content[2]=s.replace(/\t|\n|\r/g,"");											// Set view content

			sui.GetJSONFromKmap(o, (d)=> { 														// Get JSON
				let i,str="";
				str+="<table style='width:100%'>";												// Start data table		
				try { s=`<a title='Collection' id='sui-txtCol' href='#p=${o.collection_uid_s}'>${o.collection_title}</a>${sui.pages.AddPop(o.collection_uid_s)}`;
				if (o.collection_title)	str+=this.DrawItem("&#xe633","COLLECTION",s) }		 catch(e) {}
				str+=this.DrawItem("&#xe67c","VISIBILITY","Public - accessible to all site users");
				if (o.summary) str+="<tr><hr><td colspan='2' style='max-width:"+$("#sui-content").width()/4+"px'>"+o.summary+"<hr><td></tr>";		// Add summary
				try { str+=this.DrawItem("&#xe600","AUTHOR",d.field_book_author.und,"","sui-pageLab"); } 													catch(e) {}
				try { str+=this.DrawItem("&#xe675","EDITOR",d.field_book_editor.und,"","sui-pageLab"); }													catch(e) {}
				try { str+=this.DrawItem("&#xe633","YEAR&nbsp;PUBLISHED", d.field_dc_date_publication_year.und[0].value.substr(0,4),"sui-pageLab"); }		catch(e) {}
				try { str+=this.DrawItem("&#xe633","ORIGINAL&nbsp;YEAR PUBLISHED", d.field_dc_date_orginial_year.und[0].value.substr(0,4),"sui-pageLab"); }	catch(e) {}
				if (d.field_kmap_places && d.field_kmap_places.und) {							// If places
					str+="<tr><td style='vertical-align:top'><span class='sui-pageLab'>&#xe62b&nbsp;&nbspPLACES:</td><td>" ;// Add header
					for (i=0;i<d.field_kmap_places.und.length;++i) {							// For each item
						str+=d.field_kmap_places.und[i].header;									// Add name
						str+=sui.pages.AddPop(d.field_kmap_places.und[i].domain+"-"+d.field_kmap_places.und[i].id);	// Add drop
						if (i < d.field_kmap_places.und.length-1)	str+="<br>";				// Add separator
						}
					str+="</td></tr>";															
					}
				if (d.field_kmap_subjects && d.field_kmap_subjects.und) {						// If subjects
					str+="<tr><td style='vertical-align:top'><span class='sui-pageLab'>&#xe634&nbsp;&nbspPLACES:</td><td>" ; // Add header
					for (i=0;i<d.field_kmap_subjects.und.length;++i) {							// For each item
						str+=d.field_kmap_subjects.und[i].header;								// Add name
						str+=sui.pages.AddPop(d.field_kmap_subjects.und[i].domain+"-"+d.field_kmap_subjects.und[i].id);	// Add drop
						if (i < d.field_kmap_subjects.und.length-1)	str+="<br>";				// Add separator
						}
					str+="</td></tr>";															
					}
				if (d.field_kmap_terms && d.field_kmap_terms.und) {								// If terms
					str+="<tr><td style='vertical-align:top'><span class='sui-pageLab'>&#xe635&nbsp;&nbspTERMS:</td><td>" ; // Add  header
					for (i=0;i<d.field_kmap_terms.und.length;++i) {								// For each item
						str+=d.field_kmap_terms.und[i].header;									// Add name
						str+=sui.pages.AddPop(d.field_kmap_termss.und[i].domain+"-"+d.field_kmap_terms.und[i].id);	// Add drop
						if (i < d.field_kmap_terms.und.length-1)	str+="<br>";				// Add separator
						}
					str+="</td></tr>";															
					}
					try { str+=this.DrawItem("&#xe674","TRANSLATOR",d.field_book_translator.und,"sui-pageLab"); }	catch(e) {}
				try { str+=this.DrawItem("&#xe670","LANGUAGE",d.field_dc_language_original.und,"sui-pageLab"); }	catch(e) {}
				try { str+=this.DrawItem("&copy;","RIGHTS", d.field_dc_rights_general.und,"sui-pageLab"); }			catch(e) {}
				str+="</table>"
				this.content[1]=str.replace(/\t|\n|\r/g,"");									// Set view content
				try{ this.content[2]+="<p>&nbsp;&nbsp;&nbsp;&nbsp;<a target='_blank' href='"+d.field_pdf_version.und[0].url+"'>&#xe678&nbsp;&nbsp;View as PDF</a></p>"; } catch(e) {}
			});
			
			$("[id^=sui-textTab]").on("click", (e)=> {											// ON TAB CLICK
				var id=e.currentTarget.id.substring(11);										// Get index of tab	
					showTab(id);																// Draw it
				});
	
			function showTab(which) {															// SHOW TAB CONTENTS
				$("#sui-textContent").html("<div class='sui-sourceText' style='font-size:18px;color:#000'>"+o.title+"<div><hr>");	// Set title
				$("[id^=sui-textTab]").css({"background-color":"#eee"});
				$("#sui-textTab"+which).css({"background-color":"#fff"});
				$("#sui-textContent").append(_this.content[which]);								// Set content
				$("#sui-txtCol").off("click");													// Clear old handler
				$("#sui-txtCol").on("click",()=>	{											// ON COLLECTION CLICK
					sui.GetKmapFromID(o.collection_uid_s,(kmap)=>{ sui.SendMessage("",kmap); }); // Get kmap and show page
					return false;																// Stop propagation
					});
	
			}
		});							
	}

	DrawItem(icon, label, value, def, style, bold)											// DRAW ITEM
	{
		let i,str="<tr><td>";
		if ((value == null) || (value == undefined) || (value == ""))	return "";				// Return nothing
		if (icon)	str+=icon+"&nbsp;&nbsp;";													// Add icon
		str+="<span class='sui-pageLab'";														// Label head
		if (bold)	str+=" style='font-weight:600'";											// Bold?
		str+=">"+label+":&nbsp;&nbsp;</span>";													// Add label
		str+="</td><td><span class='";															// Add value span
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
		return str+"</span></td></tr>";															// Return item
	}


} // Texts class closure
