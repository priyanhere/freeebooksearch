var gebooksearchBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
var mystrings = gebooksearchBundle.createBundle("chrome://ebooksearch/locale/ebooksearch.properties");
var ebksfreeebooks = mystrings.GetStringFromName("ebksfreeebooks");
var searchquery = mystrings.GetStringFromName("searchquery");
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
   var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
   var bool = pref.getBoolPref("ebooksearch.firstrun");
   
     if (bool)
     {
      window.open("javascript:window.external.AddSearchProvider('http://www.freebookzone.com/opensearch.xml');","Search Engine", "chrome,centerscreen");
      pref.setBoolPref("ebooksearch.firstrun", false); 
     }
   },
   
   sel: function() { 
    //var t=((window.getSelection && window.getSelection())||(document.getSelection && document.getSelection())||(document.selection && document.selection.createRange && document.selection.createRange().text));
    var t = document.commandDispatcher.focusedWindow.getSelection().toString();

    if (this.promptPref())
    {
      while (t=='')
      {
        t=prompt(searchquery);
      }
     } 
    return String(t);
   }
}

//init main
window.addEventListener("load", ebooksearchMain.init, false);
