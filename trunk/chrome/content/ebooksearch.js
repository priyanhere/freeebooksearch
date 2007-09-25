var ebooksearchMain = {
  
   newtabPref : function(){
     try{
       var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
       var bool = pref.getBoolPref("ebooksearch.newtab");
	return bool;
      }
     catch(e){   return true;}
   },

   promptPref : function(){
     try{
       var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
       var bool = pref.getBoolPref("ebooksearch.prompt");
	return bool;
      }
     catch(e){   return true;}
   },
   
   
   init : function(){
     if(!ebooksearchMain.isEngineInstalled()){
     	ebooksearchMain.installEngine();
     }
     else if(ebooksearchMain.shouldShowTmpEngine()){
        ebooksearchMain.addTmpEngine();
     }
   },
   
   sel: function() { 
    //var t=((window.getSelection && window.getSelection())||(document.getSelection && document.getSelection())||(document.selection && document.selection.createRange && document.selection.createRange().text));
    var t = document.commandDispatcher.focusedWindow.getSelection().toString();

    if (this.promptPref())
    {
      while (t=='')
      {
        t=prompt("Enter search query");
      }
     } 
    return String(t);
   },
   
   isEngineInstalled : function(){
     try{
       var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
       var bool = pref.getBoolPref("ebooksearch.engine.installed");
       if(bool){
	       return true;
       }
       }
     catch(e){}
     
   return false;
   },
   
   installEngine : function(){

      var dirService = Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties);		
      var srcfile = dirService.get("SrchPlugns", Components.interfaces.nsILocalFile);	
      srcfile.append("ebooksearch.src");

      var prosrcfile = dirService.get("ProfD", Components.interfaces.nsILocalFile);	
      prosrcfile.append("searchplugins");
      prosrcfile.append("ebooksearch.src");
      
      //extract src and graphic if necessary
      if(!srcfile.exists() && !prosrcfile.exists()){

         var jarfile = dirService.get("ProfD", Components.interfaces.nsILocalFile);	
         jarfile.append("extensions");
         jarfile.append("{7585C31E-1E94-4498-ACEC-CB913A05FC52}");
         jarfile.append("chrome");
         jarfile.append("ebooksearch.jar");
       
         var zipReader = Components.classes["@mozilla.org/libjar/zip-reader;1"].createInstance(Components.interfaces.nsIZipReader); 
         zipReader.init(jarfile);
         zipReader.open();
	    
         var entries = zipReader.findEntries("*.src");
         if(entries){
  	    
  	    var nsIZipEntry = Components.interfaces.nsIZipEntry;
	    while(entries.hasMoreElements()) {
		    
		var entry = entries.getNext().QueryInterface(nsIZipEntry);
		//remove searchplugins and path separator		
		var filename = entry.name.substring(14);

		var target = dirService.get("SrchPlugns", Components.interfaces.nsILocalFile);	
		target.append(filename);

		if(!target.exists()){
		        
		    try{
		  	target.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);
		    	if(target.exists() && target.isFile())
				zipReader.extract(entry.name, target);
		    }
		    catch(e){}
		}
		    
		var oEntry = zipReader.getEntry(entry.name.replace(".src",".gif"));
		if(oEntry != null){
		
		   filename = oEntry.name.substring(14);
	    	   target = target.parent;
	 	   target.append(filename);
		    	 
	   	   if(!target.exists()){ 
	   	      
	   	       try{
	 	          target.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);
		          if(target.exists() && target.isFile())	    
			      zipReader.extract(oEntry.name, target);
		       }
		       catch(e){}
		   }   
		}
      	     }
	 }    
	
	 zipReader.close();
         
        //need this function to show the engine after restarting the browser for the first time
        setTimeout("ebooksearchMain.addTmpEngine()", 500);
      }	
      
      this.setEngineInList();   
      this.overwriteOwnDefaultPref("ebooksearch.engine.installed", "pref(\"ebooksearch.engine.installed\",true);");
   },

   setEngineInList : function(){
   
     try{
      var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
      pref.setCharPref("browser.search.order.1","ebooksearch");
      pref.setCharPref("browser.search.order.2","Google");
      pref.setCharPref("browser.search.order.3","Yahoo");
     }
     catch(e){}
   },

   //restart after installing the extension, the ebooksearch engine does not appear, this is a function to fix it
  addTmpEngine : function(){
 
        var rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"]
                                 .getService(Components.interfaces.nsIRDFService);
        
        const kNC_Name= rdfService.GetResource("http://home.netscape.com/NC-rdf#Name");
        const kNC_Icon= rdfService.GetResource("http://home.netscape.com/NC-rdf#Icon");
        var dirService = Components.classes['@mozilla.org/file/directory_service;1']
              	  	  	.getService(Components.interfaces.nsIProperties);		
        var handler = Components.classes["@mozilla.org/network/protocol;1?name=file"].
       	               createInstance(Components.interfaces.nsIFileProtocolHandler);
        var searchbar = document.getElementById("searchbar");       	               
        var menupopup = document.getAnonymousElementByAttribute (searchbar, 'anonid', 'searchbar-popup');
        var ds = Components.classes["@mozilla.org/rdf/rdf-service;1"]
                                 .getService(Components.interfaces.nsIRDFService).GetDataSource("rdf:internetsearch");        
     	if(!menupopup) return;
     
	var srcfile = dirService.get("SrchPlugns", Components.interfaces.nsILocalFile);	
     	srcfile.append("ebooksearch.src");
     	     	
     	if(srcfile.exists()){

     	   var grpfile = dirService.get("SrchPlugns", Components.interfaces.nsILocalFile);	
           grpfile.append("ebooksearch.gif");
   	    
   	   var id = "engine://"+encodeURIComponent(srcfile.path);
      	   var menuitem = document.createElement("menuitem");   		
     	   menuitem.setAttribute("type", "checkbox");
     	   menuitem.setAttribute("id", id);
     	   menuitem.setAttribute("value", id);
     	   if(grpfile.exists())
     	     	menuitem.setAttribute("src", handler.getURLSpecFromFile(grpfile));
     	   else
     	        menuitem.setAttribute("src", "");
     	   menuitem.setAttribute("label", "Free eBooks");
   	   if(!document.getElementById(id)){
     	     var child = menupopup.childNodes;
     	     if(child.length>0)
     		menupopup.insertBefore(menuitem, menupopup.firstChild);
     	     else
     		menupopup.appendChild(menuitem);
     	     
     	     //in order to fix the icons does not display on the rdf:
     	     var rEngine = rdfService.GetResource(id);	     
     	     ds.Assert(rEngine, kNC_Name, rdfService.GetLiteral("ebooksearch"),true);
     	     if(grpfile.exists())
     	        ds.Assert(rEngine, kNC_Icon, rdfService.GetLiteral(handler.getURLSpecFromFile(grpfile)) ,true);
     	     else    
     	        ds.Assert(rEngine, kNC_Icon, rdfService.GetLiteral("") ,true);
     	   }
     	}
   },
   
   shouldShowTmpEngine : function(){
   
       var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                      .getService(Components.interfaces.nsIWindowMediator);
       var enumerator = wm.getEnumerator("navigator:browser");
       while(enumerator.hasMoreElements()) {
          var win = enumerator.getNext();
          if(win != window){
             if(win.ebooksearchMain){
                return win.ebooksearchMain.showTmpEngine;
             }
          }
       }
   
   return false;
   },
     
  overwriteOwnDefaultPref : function(aPrefName, aNewPrefStr){
   	  
      //this does not save the bool pref into the extension 1.0.X
      //so we need to open the file and rewrite it.
      //the ebooksearch.js on Mac has read-only permission so we cannot rewrite it
      var dirService = Components.classes['@mozilla.org/file/directory_service;1']
      			.getService(Components.interfaces.nsIProperties);		
      var file = dirService.get("ProfD", Components.interfaces.nsILocalFile);	
      file.append("extensions");
      file.append("{5a2b4e34-ce62-42e9-a658-06ba4490adf8}");
      file.append("defaults");
      file.append("preferences");
      file.append("ebooksearch.js");
	
      var prefName = aPrefName;
      var prefStr = aNewPrefStr;
      var oString = "";
      if (file.exists()){
	
 	    var is = Components.classes["@mozilla.org/network/file-input-stream;1"]
                        .createInstance(Components.interfaces.nsIFileInputStream);
	    is.init(file, 0x01, 0444, 0);
            is.QueryInterface(Components.interfaces.nsILineInputStream);
	    
	    var line = {};
            var lines = [], hasmore;
            do {
	        hasmore = is.readLine(line);
	        lines.push(line.value); 
	    } while(hasmore);
	
            var replaced = false;
            for(var i=0; i<lines.length; i++){
            
		if(lines[i].indexOf(prefName)>-1){
		   oString += prefStr+"\r\n";
		   replaced = true;
		}   
		else
		   oString += lines[i]+"\r\n";
            }
            
            is.close();
      }
	      	
      if(oString.length ==0 || !replaced)
        oString += prefStr+"\r\n";

      try{
        var os = Components.classes["@mozilla.org/network/file-output-stream;1"]
		.createInstance( Components.interfaces.nsIFileOutputStream);
        os.init(file, 0x04 | 0x08 | 0x20, 0664, 0);
        os.write(oString, oString.length);
        os.close();
      }
      catch(e){  
        //should not have this error except for mac
      }
      
      try{      
        var prefInt = Components.classes["@mozilla.org/preferences;1"]
    			.getService(Components.interfaces.nsIPref);
        prefInt.SetDefaultBoolPref(aPrefName, true); 
      }
      catch(e){}
   }
 
}
//init main
window.addEventListener("load", ebooksearchMain.init, false);
