var gebookOptions;

function ebookoptions_init() {
  gebookOptions = new ebookOptions;
	gebookOptions.loadOptions();
}

function ebookOptions() {
	this.ID_PrefService	= "@mozilla.org/preferences-service;1";
	this.PrefService	= Components.classes[this.ID_PrefService].getService(Components.interfaces.nsIPrefService).getBranch("");
}

ebookOptions.prototype = {

	saveOptions: function () {
	
	  var ebooksearch_newtab   = document.getElementById('ebooksearch.newtab');
    var ebooksearch_prompt   = document.getElementById('ebooksearch.prompt');
  	this.PrefService.setBoolPref('ebooksearch.newtab',ebooksearch_newtab.checked);
    this.PrefService.setBoolPref('ebooksearch.prompt',ebooksearch_prompt.checked);
	},
	
	loadOptions: function() {
	
	  var ebooksearch_newtab   = document.getElementById('ebooksearch.newtab');
    var ebooksearch_prompt   = document.getElementById('ebooksearch.prompt');
    
    try
		{
			ebooksearch_newtab.checked     = this.PrefService.getBoolPref('ebooksearch.newtab');
		}
		catch (ignored)	{
		  ebooksearch_newtab.checked=true;
    }
    try
		{
			ebooksearch_prompt.checked     = this.PrefService.getBoolPref('ebooksearch.prompt');
		}
		catch (ignored)	{
		  ebooksearch_prompt.checked=true;
    }

	}
}
