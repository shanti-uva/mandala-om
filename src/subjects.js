/* 	SUBJECTS PAGES ****************************************************************************************************************************

	This module draws the subjects page based on a kmap from SOLR. Some information comes from the kmap
	passed in and some from the a second query from the child data in the Terms index. 
	
	The related resources menu is drawn, which pulls data via another SOLR call. If an image is present
	it is drawn there. Below that is a browsable index of subjects. Clicking on one will bring up that page.
	
	A tabbed menu shows the CONTEXT, where the page fits in the tree. Clicking on one will bring up that page.
	You can drill down further in the tree by clicking on a '+' dot or collapse branches with th '-'. The SUMMARY,
	which lists the related subjects to this page, catagorized by their type and alpabetically sorted. 	Clicking 
	on one will bring up that page. Hovering over a blue popover icon will show more information about it.

	Requires: 	jQuery 												// Almost any version should work
	CSS:		searchui.css										// All styles are prefixed with 'sui-'
	JS:			ECMA-6												// Uses lambda (arrow) functions
	JSON:		From Drupal site
	Globals:	Looks for sui and sui.pages
	Dependents:	pages.js, searchui.js								// JS modules called

*********************************************************************************************************************************************/

class Subjects  {

	constructor()   																		// CONSTRUCTOR
	{
		this.div=sui.pages.div;																	// Div to hold page (same as Pages class)
		this.content=["...loading","...loading"];												// Content pages for relateds
		this.content2=["<br>","<br>"];
		this.kmap=null;																			// Holds kmap
		this.relatedPlaceData=null;																// Holds related places
		this.relatedSubjectData=null;															// Holds related subjects
		}

	Draw(o, related)																			// DRAW SOURCE PAGE FROM KMAP
	{
		this.kmap=o;																			// Save kmap
		$("#sui-results").css({ "padding-left":"12px", width:"calc(100% - 24px"});				// Reset to normal size
		this.GetSubjectData(o);																	// Get related subjects content	
		this.DrawContent(o,related);															// Draw content
		sui.pages.DrawRelatedAssets(o);															// Draw related assets menu
	}

	DrawContent(o, related)																	// DRAW CONTENT
	{
		let str=`<div class='sui-subjects' id='sui-subConDiv'>
		<div><span class='sui-subIcon'>${sui.assets[o.asset_type].g}</span>
		<span class='sui-subText'>${o.title[0]}</span>
		<hr style='border-top: 1px solid ${sui.assets[o.asset_type].c}'>`;
		if (o.caption)	str+="<p id='sui-spCap'>"+o.caption+"</p></div>";
		if (related == 1) 		str="<div style='margin-left:192px'>"+sui.pages.DrawTabMenu(["SUBJECT CONTEXT","RELATED SUBJECTS"]);  // If subjects, add tab menu
		else if (related == 2)	str="<div id='sui-topCon' style='margin-left:216px'>"+this.GetPlaceData(o);							  // If places, get data
		$(this.div).html(str+"</div>".replace(/\t|\n|\r/g,""));									// Remove format and add to div				
		;
		$("[id^=sui-tabTab]").on("click", (e)=> {												// ON TAB CLICK
			var id=e.currentTarget.id.substring(10);											// Get index of tab	
			this.ShowTab(id);																	// Draw it
			});
	}

	ShowTab(which) 																			// SHOW TAB
	{
		let _this=this;
		$("[id^=sui-spLab-]").off("click");														// Kill handler
		$("[id^=sui-spDot-]").off("click");														// Kill handler
		$("[id^=sui-spItem-]").off("click");													// Kill handler
		$("[id^=sui-togCat-]").off("click");													// Kill handler
		$("[id^=sui-spCatUL-]").off("click");													// Kill handler
		$("[id^=sui-tabTab]").css({"background-color":"#999",color:"#fff" });					// Reset all tabs
		$("#sui-tabContent").css({display:"block","background-color":"#eee"});					// Show content
		$("#sui-tabTab"+which).css({"background-color":"#eee",color:"#000"});					// Active tab
		$("#sui-tabContent").html(this.content[which]);											// Set content
		if (which == 0)	{																		// If SUBJECT CONTEXT
			$("#sui-spLab-"+this.kmap.uid).css({ "font-weight":"bold", "text-decoration": "underline"  });	// Highlight current one	
			$("[id^=sui-spLab-]").on("click", function(e) {return false;	});					// ON CONTEXT LINE CLICK, INHIBIT
			$("[id^=sui-spDot-]").on("click", function(e) {										// ON RELATIONSHIP TREE DOT CLICK
				let path=e.currentTarget.id.substring(10);										// Get id
				if (path != "null") sui.pages.AddRelBranch(_this.kmap.asset_type,path,$(this));	// Lazy load branch
				$(this).html("&ndash;"); 														// Change label
				$(this).parent().find('ul').slideToggle();            							// Slide into place
				});
			}
		else if (which == 1) {																	// If RELATED SUBJECTS
			$("[id^=sui-spItem-]").on("click", function(e) {return false;	});					// ON CONTEXT LINE CLICK, INHIBIT
			$("[id^=sui-spCatUL-]").slideDown();												// All down
			$("[id^=sui-spCat-]").on("click", (e)=> {											// ON CATEGORY CLICK
				let id=e.currentTarget.id.substring(9);											// Get id
				if ($("#sui-spCatUL"+id).css("display") == "none")								// If hidden
					$("#sui-spCatUL"+id).slideDown();											// Show
				else																			// If showing
					$("#sui-spCatUL"+id).slideUp();												// Hide
				});

			$("#sui-togCatA").on("click", ()=> {												// ON EXPAND ALL
				$("[id^=sui-spCatUL-]").slideDown();											// All down
				});
			$("#sui-togCatN").on("click", ()=> {												// ON COLLAPSE ALL
				$("[id^=sui-spCatUL-]").slideUp();												// All down
				});
			}
	}

	GetPlaceData(o)																			// GET RELATED PLACES
	{
		sui.GetRelatedPlaces(o.uid, (d)=>{														// Get related place data
			this.relatedPlaceData=d;															// Save data															
			this.DrawRelatedPlaces("tree",1);													// Display related places
			});	
		return "Loading...";																	// Say we're loading...
	}	
			
	DrawRelatedPlaces(mode, sortMode)														// DRAW RELATED PLACES
	{			
		let i,j,id,tops=[];
		let d=this.relatedPlaceData;															// Point at realte placev data
		let o=this.kmap;																		// Point at kmap
		let str=`<br><div class='sui-spHead'>Places related to ${o.title}</div>
		<p style='color:#666'>
		<input id='sui-rpSearch' placeholder='&nbsp;Search places' 
		style='width:100px;border:1px solid #999;border-radius:12px;padding-left:8px'> &nbsp;
		<span class='sui-advEditBut' style='color:${mode == "tree" ? "#668eec" : "#666"}' 
		id='sui-rpTree' title='Tree view'>&#xe638</span> | 
		<span class='sui-advEditBut' style='color:${mode != "tree" ? "#668eec" : "#666"}'
		id='sui-rpList' title='List view'>&#xe61f</span>`;
		if (mode != "tree") {																	// If drawing as a list
			j=$("#sui-footer").offset().top-$("#sui-results").offset().top-150;					// Fill space
			str+=` | <span class='sui-advEditBut' id='sui-rpSort' title='Sort'>
			${(sortMode == 1) ? "&#xe653" : "&#xe652"}</span>		
			</p><div class='sui-rpList' style='height:${j}px'>`;								// Add container			
			d=d.sort((a,b)=>{ return a.title < b.title ? -sortMode : sortMode })				// Sort by title acending
			for (i=0;i<d.length;++i) {															// For each related place
				str+=`<div id='sui-rpLine-${i}' style='width:300px' title='${d[i].ancestors_txt.join("/")}'>${d[i].title}</div>`; 	// Add line
				}
			$("#sui-topCon").html(str+"</div>");												// Draw as list
			$("#sui-rpTree").on("click", ()=> {	this.DrawRelatedPlaces("tree",sortMode); });	// HANDLE TREE CLICK
			$("#sui-rpSort").on("click", ()=> {	this.DrawRelatedPlaces("list",sortMode*-1);	});	// HANDLE SORT
			$("#sui-rpSearch").on("keydown",(e)=> {												// ON SEARCH
				let line;
				let r=$("#sui-rpSearch").val();													// Get filter text
				if ((e.keyCode > 31) && (e.keyCode < 91)) 	r+=e.key;							// Add current key if a-Z
				if ((e.keyCode == 8) && r.length)			r=r.slice(0,-1);					// Remove last char on backspace
				r=RegExp(r,"i");																// Turn into regex
				for (i=0;i<d.length;++i) {														// For each item
					line=$("#sui-rpLine-"+i);													// Point at line
					if (line.text().match(r))	line.css("display","block");					// Show item if it matches
					else						line.css("display","none");						// Hide
					}
				});
			return;																				// Quit
			}
		str+=` | <span class='sui-advEditBut' style='vertical-align:0' 
		id='sui-togCatA' title='Expand all'<b>&#x2295</b></span> | 
		<span class='sui-advEditBut' style='vertical-align:0'
		id='sui-togCatN' title='Collapse all'><b>&#x2296</b></span> 
		</p><div style='width:100%'><div style='display:inline-block'>
		<ul style='list-style-type:none;margin-left:-24px'>`;									// Top-most <ul>
		let n=d.length;																			// Number of places
		for (i=0;i<n;++i) {																		// For each related place	
			id="places-";																		// Start id
			for (j=0;j<d[i].ancestor_ids_is.length;++j) {										// For each level	
				id+=d[i].ancestor_ids_is[j]+"-";												// Add levels
				tops.push({ lab:d[i].ancestors_txt[j], level:j, id:id.slice(0,-1), uid:"places-"+d[i].ancestor_ids_is[j]});		// Add to list
				tops[tops.length-1].parent=id.split("-").slice(0,-2).pop();						// Add parent
				}
			}
		
		tops=tops.sort((a,b)=>{ return a.id < b.id ? -1 : 1 })									// Sort by path
		i=tops[tops.length-1];																	// Save last
		tops=tops.filter((a,ind)=>{ try { return a.id != tops[ind+1].id } catch(e){} })			// Only uniques
		tops.push(i);																			// Add it back
		n=tops.length;																			// New n
		for (i=0;i<n;++i) 																		// For place	
			if (tops[i].level == 0) 															// Add top row
				str+=addTreeLine(tops[i].lab,tops[i].id,tops[i].id,"&ndash;");					// Add tree line

		$("#sui-topCon").html(str+"</ul></div>");												// Draw it

		$("#sui-rpList").on("click", ()=> {	this.DrawRelatedPlaces("list",sortMode); });		// HANDLE LIST CLICK
		$("#sui-rpSearch").on("keyup", ()=> {													// HANDLE SEARCH WORD ENTRY
			let t=$("#sui-rpSearch").val();														// Get value entered
			this.DrawRelatedPlaces("list",sortMode); 											// Draw as list										
			$("#sui-rpSearch").val(t);															// Restore value
			$("#sui-rpSearch").focus();															// Set focus
			$("#sui-rpSearch").trigger("keydown",{ keyCode:13 });								// Filter matches
			});

		for (i=0;i<n;++i) tops[i].n=countChildren(tops[i].id);									// For each place, count children
		for (i=0;i<n;++i) if (tops[i].level == 0) addChildren(tops[i].id,1);					// For each place, add top row children and recurse
	
		$('#sui-topCon').find('li').each(function() { 											// For each line
			j=$(this).parent().find('li').find('b').length;										// Get count
			if (j && !$(this).find('b').length)													// If something
				$(this).find('img').before("("+j/2+") "); 										// Add it before popover
			});
	
		function countChildren(id) {															// COUNT NODE'S CHILDREN
			let i,num=0;
			id=id.split("-").pop();																// Get last id
			for (i=0;i<n;++i) 																	// For each place	
				if (tops[i].parent == id)	++num;												// Has them
			return num;																			// Return count
			}

		function addChildren(id, level) {														// ADD CHILDREN TO NODE RECURSIVELY
			let i,marker,str="";
			for (i=0;i<n;++i) {																	// For each place
				if (tops[i].id.match(id) && (tops[i].level == level)) {							// A child
					marker=tops[i].n > 0 ? "+" : "&bull;";										// Set marker type
					str="<ul style='list-style-type:none;display:none;padding:2px 0 0 24px'>";	// Enclosing <ul> if not a loner
					str+=addTreeLine(tops[i].lab,tops[i].id,tops[i].uid,marker);				// Add tree line
					str+="</ul>";																// Close <ul>
					$("#sui-rpDot-"+id).parent().parent().append(str);							// Add it
					addChildren(tops[i].id,level+1);											// Recurse
					}
				}
			}

		function addTreeLine(lab, id, uid, marker) {											// ADD LINE TO TREE
			let s=`<li>`;																		// Header
			if (marker != "&bull;")	s+=`<div class='sui-spDot' id='sui-rpDot-${id}'>${marker}</div>`;		// If a dot, add it
			else					s+=`<div class='sui-spDot' id='sui-rpDot-${id}' style='display:none;color:#5b66cb'><b>&bull;</div>&bull;&nbsp;&nbsp;`;	// If a loner
			s+=`<a class='sui-noA' href='#p=${uid}'>${lab}</b>${sui.pages.AddPop(uid)}</a>`;	// Add line
			return s;																			// Return line
			}
		
		$("[id^=sui-rpDot-]").off("click");														// Kill old handlers
		$("[id^=sui-rpDot-]").on("click", function(e) {											// ON RELATIONSHIP TREE DOT CLICK
			let container=$(this).parent().parent();											// Point a container
			let c=$(this).html();																// Get char
			$(this).html(c == "+" ? "&ndash;" : "+"); 											// Toggle label
			$(container).children('ul').slideToggle();            								// Slide into place
			});

		$("#sui-togCatA").on("click", ()=> {													// ON EXPAND ALL
			let i,container;
			for (i=0;i<n;++i) {																	// For each place	
				container=$("#sui-rpDot-"+tops[i].id).parent();									// Point a container
				$("#sui-rpDot-"+tops[i].id).html("&ndash;");									// If not a loner, change label 
				container.parent().css("display","block");										// Show	parent ul
				container.css("display","block");												// Show	
				}
			});

		$("#sui-togCatN").on("click", ()=> {													// ON COLLAPSE, INIT TO STARTING STATE
			let i,p;
			for (i=0;i<n;++i) {																	// For each place	
				p=$("#sui-rpDot-"+tops[i].id);													// Point at dot
				if (p.html() != "&bull;")	p.html("+"); 										// Change label
				p.parent().parent().css("display","none");										// Hide	
				if (tops[i].level < 3) {														// If 2nd level
					if (tops[i].level < 2) p.html("&ndash;" ); 									// Change label is past 1st rows
					p.parent().parent().css("display","block");									// Show	
					}
				}
			});
		$("#sui-togCatN").trigger("click");														// Collapse to starting point
	}

	GetSubjectData(o)																		// GET TAB DATA FOR CONTEXT
	{
		sui.GetRelatedFromID(o.uid,(data)=> { 													// Load data
			let d,i,k=0,str="<table>";
			if (!data)	return;																	// Quit if no data
			this.relatedSubjectData=data;														// Save subject data
				if (data[0].illustration_external_url && data[0].illustration_external_url[0]) { // If an image spec'd
				$("#sui-relatedImg").addClass("sui-relatedImg");								// Set style
				$("#sui-relatedImg").prop("src",data[0].illustration_external_url[0]);			// Show it
				}
			else if (data[0].illustration_mms_url && data[0].illustration_mms_url[0]) {			// If an image spec'd
				$("#sui-relatedImg").addClass("sui-relatedImg");								// Set style
				$("#sui-relatedImg").prop("src",data[0].illustration_mms_url[0]);				// Show it
				}
			if (data[0].summary_eng && data[0].summary_eng[0]) 									// If an summary spec'd
			$("#sui-spCap").html(data[0].summary_eng[0]);										// Replace caption
			if (o.names_txt && o.names_txt.length) {											// If names
				for (i=0;i<o.names_txt.length;++i) 												// For each name
					if (o.names_txt[i].match(/lang="bo"/i))										// Language id - bo
						str+="<tr><td style='color:#000099;font-size:20px'><b>"+o.names_txt[i]+"</b>&nbsp;&nbsp;&nbsp;</td><td span='2'><i>Dzongkha, Tibetan script, Original</i></td></tr>";	// Add it
				}
			for (i=0;i<data.length;++i) {														// For each doc
				d=data[i];																		// Point at it
				if (d.block_child_type != "related_names")	continue;							// Not a name
				if (!k) d.related_names_level_i=0;
				str+=`<tr><td style='padding-left:${d.related_names_level_i*16}px'>
				${k++ ? ">&nbsp;" : ""}
				<b>${d.related_names_header_s}&nbsp;&nbsp;&nbsp;</b></td><td>
				<i>${d.related_names_language_s}, ${d.related_names_writing_system_s}, ${d.related_names_relationship_s}
				</i></td></tr>`;																// Add it
				}
			str+="</table><br>";		
			$("#sui-subConDiv").append(str.replace(/\t|\n|\r/g,""));							// Remove format and add to div				
			this.AddRelatedSubjects(o,data);													// Add related subjects html
			this.AddSubjectContext(o,data);														// Add context html
		});
	}

	AddRelatedSubjects(o,c)																	// ADD RELATED SUBJECTS TAB CONTENTS 	
	{	
		let f,i,subs=0,s=[];
		let n=c.length;																			// Get number of subjects
		for (i=0;i<n;++i) {																		// For each subject get data as 's=[category[{title,id}]]' 
			if (c[i].block_child_type != "related_subjects") continue;							// Add only related subjects
			if (!s[c[i].related_subjects_relation_label_s])										// If first one of this category 
				s[c[i].related_subjects_relation_label_s]=[];									// Alloc category array
			s[c[i].related_subjects_relation_label_s].push({									// Add subject to category 
				title:c[i].related_subjects_header_s,											// Add title
				id:c[i].related_uid_s });														// Add id
			}											
		let biggest=Object.keys(s).sort((a,b)=>{return a.length > b.length ? -1 : 1;})[0];		// Find category with most elements	 
		let str=`<br><div class='sui-spHead'>Subjects related to ${o.title}</div>
		<div style='max-width:900px'>
		${o.title[0]}</b> has <b>~|~</b> other subject${(n > 1) ? "s": ""} directly related to it, which is presented here. 
		See the SUBJECT CONTEXT tab if you instead prefer to browse all subordinate and superordinate categories for ${o.title[0]}.</div>
		<p><a class='sui-advEditBut' id='sui-togCatA'>Expand all</a> / <a class='sui-advEditBut' id='sui-togCatN'>Collapse all</a>
		</p><div style='width:100%'><div style='width:50%;display:inline-block'>`;
		str+=drawCat(biggest)+"</div><div style='display:inline-block;width:50%;vertical-align:top'>";	// Add biggest to 1st column, set up 2nd	 
		for (f in s) if (f != biggest)	str+=drawCat(f);										// For each other category, draw it in 2nd column
		str+="</div></div>";
		str=str.replace(/~\|~/,subs);															// Set subjects count
		this.content[1]=str;																	// Set tab

		function drawCat(f) {																	// DRAW CATEGORY
			if (!s || !s[f]) return "</ul>";													// Bad data 
			s[f]=s[f].sort((a,b)=>{ return a.title < b.title ? -1 : 1;});						// Sort
			let str="<div id='sui-spCat-"+f.replace(/ /g,"_")+"' class='sui-spCat'>"+o.title+" "+f+"</div><ul id='sui-spCatUL-"+f.replace(/ /g,"_")+"' style='display:none'>";// Add category header
			for (i=0;i<s[f].length;++i)	{														// For each item
				str+="<li><a class='sui-noA' id='sui-spItem-"+s[f][i].id;						// Line
				str+="' href='#p="+s[f][i].id+"'>";												// Href
				str+=s[f][i].title+"</a>"+sui.pages.AddPop(s[f][i].id)+"</li>";					// Add popover
				++subs;
			}
		return str+"</ul>";																		// Close category
		}
	}

	AddSubjectContext(o,d)																	// ADD SUNJECYCONTEXT TAB CONTENTS 	
	{	
		let i,n=0,subs=0;
		for (i=0;i<d.length;++i) {																// For each child
			subs+=d[i].child_count.numFound;													// Add children
			}

subs="(TBD)"

	let str=`<br><div class='sui-spHead'>Subjects related to ${o.title}</div>
		<div style='max-width:900px'>
		<b>${o.title[0]}</b> has <b> ${d[0].ancestors.length-1} </b>superordinate subjects 
		and <b> ${subs} </b>subordinate subjects. 
		You can browse these subordinate subjects as well as its superordinate categories with the tree below. 
		See the RELATED SUBJECTS tab if you instead prefer to view only its immediately 
		subordinate subjects grouped together in useful ways, as well as subjects non-hierarchically related to it.</div><br>
		<ul class='sui-spLin' id='sui-spRows'>`;
		
		for (n=0;n<d[0].ancestors.length;++n) {													// For each ancestor 
			str+="<ul style='list-style-type:none'>";											// Add header
			str+=sui.pages.AddRelTreeLine(d[0].ancestors[n],d[0].ancestor_uids_generic[n],"&ndash;",null); // Add it 
			}

		sui.GetTreeChildren(o.asset_type,d[0].ancestor_id_path,(res)=>{							// Get children
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
				str+=sui.pages.AddRelTreeLine(res[i].header,res[i].id,m,path)+"</li></ul>"; 			// Add it
				}
			
			str=str.replace(/~~/,n+res.length);													// Set total count
			for (i=0;i<d[0].ancestors.length;++i) str+="</li></ul>";							// Close chain
			this.content[0]=str.replace(/\t|\n|\r/g,"")+"</ul><br>";							// Set 1st content array member with html
			this.ShowTab(0);																	// Draw it
			});
		}

} // CLASS CLOSURE

module.exports = Subjects;