/* 	IMAGE PAGES ****************************************************************************************************************************

	This module draws the images page based on a kmap from SOLR. The image can be zoomed into an panned 
	by clicking the magnifier icon.	A row of thumbnails of all the imges in the search results appears in
	 a scrollable window below the picture.	Clicking one shows that picture's page.
		
	Some metadata is displyed under the image along with the summary. Images can be downloaded by clicking
	on the DOWNLOAD IMAGE label.

	Requires: 	jQuery 												// Almost any version should work
	CSS:		searchui.css										// All styles are prefixed with 'sui-'
	JS:			ECMA-6												// Uses lambda (arrow) functions
	JSON:		From Drupal site
	Globals:	looks for sui and sui.pages
	Dependents:	pages.js, searchui.js								// JS modules called

**********************************************************************************************************************************************/
/* eslint-disable */
import $ from 'jquery';
export default class Images  {
	constructor(sui)   																		// CONSTRUCTOR
	{
		if (!sui) {
			throw new Error("SearchUI must be passed to constructor");
		}
		this.sui = sui;
		this.div=sui.pages.div;																	// Div to hold page (same as Pages class)
	}

	Draw(o)																					// DRAW IMAGE PAGE FROM KMAP
	{
		const sui = this.sui;
		var i,j,mid;
		var asp=o.url_thumb_height/o.url_thumb_width;
		var w=$(this.div).width()/2;
		var h=w*asp;
		if (o.url_thumb)	 o.url_thumb=o.url_thumb.replace(/images-test/i,"images");			// Force to prod
		for (i=0;i<sui.curResults.length;++i) {	if (o.id == sui.curResults[i].id)	mid=i; }

		var str=`<div class='sui-imagesBox' id='sui-imagesBox' style='margin:${(sui.ss.mode == "related") ? "-12px 0 0 0" : "-12px -12px 0 -12px"}'>
		<div id='sui-picEnlarge' style='cursor:pointer;font-size:18px' title='Click to enlarge and pan'>&#xe650</div></p>
		<div id='sui-imageDiv' class='sui-imageDiv' style='height:${h}px'>
			<img id='sui-thisPic' src='${o.url_thumb.replace(/200,200/,"2000,2000")}' style='width:100%'> 
		</div><br>
		<div><span style='max-width:900px;font-size:20px;vertical-align:-2px;color:#ccc'>&#xe62a&nbsp;&nbsp;${o.title[0]}</span></div>
		<div style='color:#ccc;margin-bottom:24px'>${o.creator}&nbsp;&nbsp;|&nbsp;&nbsp;${o.img_width_s} x ${o.img_height_s} px</div>
		<div class='sui-imageGal'id='sui-imageGal'>`;
		for (i=0;i<mid;++i) 																	// For each image up mid point
			if (sui.curResults[i].asset_type == "images")
				str+=`<div class='sui-pageThumb'><img id='sui-pageThumb-${i}' src='${sui.curResults[i].url_thumb}' style='height:100%'></div>`;
		str+=`<div class='sui-pageThumb' style=' border-color:#fff'><img id='sui-pageThumb-${mid}' src='${o.url_thumb}' style='height:100%'></div>`;	
		for (i=mid+1;i<sui.curResults.length;++i) 												// For each after mid point
			if (sui.curResults[i].asset_type == "images")
				str+=`<div class='sui-pageThumb'><img id='sui-pageThumb-${i}' src='${sui.curResults[i].url_thumb}' style='height:100%'></div>`;
		str+="</div></div>";
		
		sui.GetJSONFromKmap(o, (d)=> { drawDetails(d); });										// Load detaill from JSON
		$(this.div).html(str.replace(/\t|\n|\r/g,""));											// Remove format and add to div	
		sui.pages.DrawRelatedAssets();															// Draw related assets menu if active
		$("#sui-imageGal").scrollLeft($("#sui-pageThumb-"+mid).offset().left-w+25);				// Scroll to center

		let s, places=[],subjects=[],terms=[];
		try{
			for (i=0;i<o.kmapid_strict.length;++i) {
				if (o.kmapid_strict[i].match(/places/))		places.push(o.kmapid_strict_ss[i]+sui.pages.AddPop(o.kmapid_strict[i]));
				if (o.kmapid_strict[i].match(/subjects/))	subjects.push(o.kmapid_strict_ss[i]+sui.pages.AddPop(o.kmapid_strict[i]));
				if (o.kmapid_strict[i].match(/terms/))	{										// If a term
					s=o.kmapid_strict_ss[i];													// Add term
					let r=RegExp(o.kmapid_strict[i]+"_definitions-(\d*)","g");					// Get any definitions for this term
					r=o.kmapid.join().match(r);													// Count
					if (r) {																	// If any
						s+="<span><i><sup> (";													// Start superscript
						for (j=1;j<=r.length;++j) {												// For each def
							s+=j;																// Add number
							if (j < r.length) s+=",";											// Add comma
							}
						s+=")</sup></i></span>";												// End super
						}
					s+=sui.pages.AddPop(o.kmapid_strict[i]);									// Add popover
					terms.push(s);																// Add term
					}
				}
		} catch(e) {}
	
		str=`<br><table class='sui-imageMid'>
			<tr class='sui-pageLab' style='font-size:16px;padding-bottom:4px'><td style='width:50%'>MANDALA COLLECTIONS</td><td>CLASSIFICATION</td></tr>
			<tr class='sui-pageLab' style='padding-bottom:8px'><td>&#xe633&nbsp;&nbsp;<i>`;
			if (o.collection_title) 															// If a collection	
				str+=`${o.collection_title}${sui.pages.AddPop(o.collection_uid_s)}`;			// Show name and popup
			else str+="None";
			str+="</td><td><i>";  																// Close left side
			if (subjects.length) {																// If subjects	
				str+="<span style='color:#cc4c39'>&#xe634</span>&nbsp;&nbsp";					// Add icon
				for (i=0;i<subjects.length;++i) str+=subjects[i]+", ";							// Add item
				str=str.slice(0,-2)+"<br>";														// Remove last comma
				}	
			if (places.length) {																// If places	
				str+="<span style='color:#6faaf1'>&#xe62b</span>&nbsp;&nbsp";					// Add icon
				for (i=0;i<places.length;++i) str+=places[i]+", ";								// Add item
				str=str.slice(0,-2)+"<br>";														// Remove last comma
				}	
			if (terms.length) {																	// If terms	
				str+="<span style='color:#a2733f'>&#xe635</span>&nbsp;&nbsp";					// Add icon
				for (i=0;i<terms.length;++i) str+=terms[i]+", ";								// Add item
				str=str.slice(0,-2)+"<br>";														// Remove last comma
				}	
			str+="</td></tr></i></table>";

		var d=this.DrawItem;																	// Point at this item drawer
		function drawDetails(j) {	
			// trace(j)
			str+="<div class='sui-images'>";
			str+="<div style='width:calc(49% - 24px);display:inline-block;margin-right:16px;vertical-align:top;height:100%;'><table style='width:100%'>";
				try{ str+=d(sui.assets[o.asset_type].g,"CAPTION",o.caption,"Untitled"); } catch(e){}
				str+="<tr><td colspan='2'><hr></td></tr>";
				try{ str+=d("&#xe600","CREATOR",o.creator) } catch(e){}
				try{ str+=d("&#xe66d","TYPE",j.field_image_type.und[0].value.charAt(0).toUpperCase()+j.field_image_type.und[0].value.slice(1)); } catch(e){}
				try{ str+=d("&#xe665","SIZE", o.img_width_s+" x "+o.img_height_s+" px"); } catch(e){}
				str+="<tr><td colspan='2'><hr></td></tr>";
				try{ str+="<p class='sui-pageLab'>";
					for (i=0;i<j.field_image_descriptions.und.length;++i) 							// For each note
						str+=j.field_image_descriptions.und[i].title+"<br>";						// Add it
					str+="</p>";  
					} catch(e){}
				try{ str+=d("&#xe600",j.field_image_agents.und[0].field_agent_role.und[0].value.toUpperCase(),
						j.field_image_agents.und[0].title+" ("+sui.pages.FormatDate(j.field_image_agents.und[0].field_agent_dates.und[0].value)+")"
					); } 	catch(e) {}
				try{ str+="</table><p>";															// A sub description
				str+=j.field_image_descriptions.und[0].field_description.und[0].value+"<br></p>";  } 		catch(e){}
				str+="</div><div style='width:49%;display:inline-block;vertical-align:top;border-left:1px solid #ddd;padding-left:16px'><br><table style='width:100%'>";
				try{ str+=d("&#xe67f","ONLY DIGITAL",j.field_image_digital.und[0].value ? "Yes" : "No"); } 	catch(e){}
				try{ str+=d("&#xe67f","COLOR",j.field_image_color.und[0].value ? "Yes" : "No"); } 			catch(e){}
				try{ str+=d("&#xe67f","QUALITY",j.field_image_quality.und[0].value); } 						catch(e){}
				try{ str+=d("&#xe67f","ROTATION",j.field_image_rotation.und[0].value+"&deg;"); } 			catch(e){}
				try{ str+=d("&#xe665","PHYSICAL&nbsp;SIZE",j.field_physical_size.und[0].value); } 			catch(e){}
				try{ str+=d("&#xe659","CAPURE&nbsp;DEVICE",j.field_image_capture_device.und[0].value); } 	catch(e){}
				try{ str+=d("&#xe65f","MATERIALS",j.field_image_materials.und[0].value); } 					catch(e){}
				try{ str+=d("&#xe66c","ENHANCEMENT",j.field_image_enhancement.und[0].value); } 				catch(e){}
				try{ str+="<tr><td>&#xe62B&nbsp;&nbsp;<span class='sui-pageLab'>LOCATION</span>:</td><td>"+j.field_longitude.und[0].value+"&nbsp;&nbsp;&nbsp;"+j.field_latitude.und[0].value+"</td></tr>"; } 									catch(e){}
				try{ str+=d("&copy;","COPYRIGHT&nbsp;HOLDER",j.field_copyright_holder.und[0].value); } 		catch(e){}
				try{ str+=d("&copy;","COPYRIGHT&nbsp;STATEMENT",j.field_copyright_statement.und[0].value);} catch(e){}
				try{ str+=d("&#xe614","ORIGINAL&nbsp;FILE",j.field_original_filename.und[0].value); } 		catch(e){}
				try{ str+=d("&#xe678","TECHNICAL&nbsp;NOTES",j.field_technical_notes.und[0].value); } 		catch(e){}
				try{ str+=d("&#xe639","UPLOADED&nbsp;BY",o.node_user_full_s); } 							catch(e){}
				try{ str+=d("&#xe67f","LICENSE","<a style='font-weight:400' target='_blank' href='"+j.field_license_url.und[0].value+"'>"+j.field_license_url.und[0].value+"</a>"); } catch(e){} 
				
				let asp=o.img_height_s/o.img_width_s;
				str+=`</table><p class='sui-pageLab' style='cursor:pointer' onclick='$("#sui-dlOps").toggle()'>
				&#xe616&nbsp;&nbsp;<a>DOWNLOAD IMAGE</a>
					<div id='sui-dlOps' style='display:none;margin-left:24px;font-size:12px'>			
					<a target='_blank' href='${o.url_thumb.replace(/200,200/,o.img_width_s+","+o.img_width_s)}'
					style='display:inline-block;cursor:pointer'>Original (${o.img_width_s}x${o.img_height_s})</a><br>
					<a target='_blank' href='${o.url_thumb.replace(/200,200/,"1200,1200")}'
					style='display:inline-block;cursor:pointer'>Large (1200x${1200*asp}))</a><br>
					<a target='_blank' href='${o.url_thumb.replace(/200,200/,"800,800")}'
					style='display:inline-block;cursor:pointer'>Medium (800x${800*asp})</a><br>
					<a target='_blank' href='${o.url_thumb.replace(/200,200/,"400,400")}'
					style='display:inline-block;cursor:pointer'>Small (400x${400*asp})</a>
					<p><i>Right-click and select "Download/Save Linked File"</i></p>
					</div>
				</p></div></div></div>`;
				$(sui.pages.div).append(str.replace(/\t|\n|\r/g,""));								// Remove format and add to div
				
				$("#sui-imgCol").on("click",()=> {													// ON COLLECTION CLICK
					sui.GetKmapFromID(o.collection_uid_s,(kmap)=>{ sui.SendMessage("",kmap); });	// Get kmap and show page
					return false;																	// Stop propagation
					});
			}
	
		$("[id^=sui-pageThumb-]").on("click",(e)=> {												// ON THUMBNAIL CLICK
			let id=e.currentTarget.id.split("-")[2];												// Get id
			sui.pages.Draw(sui.curResults[id]);														// Show image
			});

		$("#sui-picEnlarge").on("click",()=> {														// ON RESIZE PIC
			let sx,sy,px,py;
			let pic=$("#sui-legacy")[0];															// Point at image
			let h=$(this.div).width()/2*asp;														// Make heighr
			$("#sui-imagesBox").css({"padding-top":"12px"});										// Thinner top
			$("#sui-imageDiv").css({width:"100%", height:$("#sui-legacy").height()+"px"});			// Full screen
			if ($("#sui-picEnlarge").html().match(/Zoom/)) {										// If zoomed already
				$("#sui-picEnlarge").html("&#xe650");												// Restore icon
				$("#sui-thisPic").offset($("#sui-imageDiv").offset());								// Restore offset
				$("#sui-imageDiv").css({width:"50%",height:h+"px"});								// Back to half screen
				$("#sui-imagesBox").css({"padding-top":"60px"});									// Restore spacing
				pic.onmousedown=pic.onwheel=null;													// Remove listeners
				return;																				// Quit
				}
			$("#sui-picEnlarge").html("Zoom &nbsp; &#xe651  &nbsp; out ");							// Zoom out icon
			$("#sui-thisPic").css("width","auto");													// True size

			pic.style.cursor="grab";																// Grab cursor
			pic.onwheel=(e)=> {																		// On wheel foir trackpad moving
				e=e||window.event;						e.preventDefault();							// Set event locally									
				sx=$("#sui-thisPic").offset();														// Current pos
				$("#sui-thisPic").offset({left:(e.deltaX ? e.deltaX : 0)/5+sx.left,top:(e.deltaY ? e.deltaY : 0)/3+sx.top}); // Set image via offset
				};

			pic.onmousedown=(e)=> {																	// On click for mouse moving
				e=e||window.event;						e.preventDefault();							// Set event locally									
				sx=e.pageX;    							sy=e.pageY;									// Start of drag
				px=$("#sui-thisPic").offset().left;		py=$("#sui-thisPic").offset().top;			// Start image offset
				pic.onmousemove=(e)=> {																// On drag
					e=e||window.event;		e.preventDefault();										// Set event
					var dx=e.pageX-sx;   	var dy=e.pageY-sy;										// Get delta
					$("#sui-thisPic").offset({left:px+dx,top:py+dy});								// Set image via offset
					};
				pic.onmouseup=(e)=> {	pic.onwheeel=pic.onmouseup=pic.onmousemove=null; }; 		// Remove listeners
				};
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
	


} // Images class closure
