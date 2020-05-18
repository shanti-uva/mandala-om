# Search UI Mandala Search Tool 
This tool is implelemented in Javascript as a module to search for resources using 
the Solr index. 

### Dependencies 

It needs jQuery. 

### Implementation

	When allocated, attaches a <div> framework containing a search button in the top white bar of the Mandala app.
	When clicked, it will expand to cover the entire screen. 
	An sui=open message is sent to host.
	When a SOLR query is needed, a JSON formatted version of the search object is sent to host uoing a sui=query message.
	The host responds with a SOLR query.
	When an item has been selected, a sui=page message is sent to host and the host navigates there.
	The UI retreats to only the search button.
	A sui=close message is sent to host.

	Requires: 	jQuery 												// Almost any version should work
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
			

License
=====

This is released under the MIT License:

Copyright (c) The Rector and Board of Visitors, University of Virginia

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.# kmap
