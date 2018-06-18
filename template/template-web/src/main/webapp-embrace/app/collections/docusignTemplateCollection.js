define([ "backbone" ,"models/docusignTemplateModel","app"], function(Backbone,docusignTemplateModel,app) {
	
	var DocusignTemplateCollection = Backbone.Collection.extend({

		initialize: function () {
	    },
	    model : docusignTemplateModel,
	    url: function() {
            return app.context()+'/docusign/getdocusigntemplates';
          },
        parse : function(response,options) {
        	var mdlarray = [];
        	for (var item in response.envelopeTemplates) {
        		if (response.envelopeTemplates[item].folderName=="DocumentTemplates") {
        			var mdlObj = {templateName : response.envelopeTemplates[item].name,templatePath : response.envelopeTemplates[item].folderName+"/"+response.envelopeTemplates[item].name, 
        					templateId : response.envelopeTemplates[item].templateId};
        			var recips = [];
        			for (recip in response.envelopeTemplates[item].recipients) {
        				var curRecip = response.envelopeTemplates[item].recipients[recip];
        				if (curRecip.length>0 && recip!="recipientCount") {
	        				for (r in curRecip) {
	        					recips.push({recipient : curRecip[r].roleName, type : recip});
	        				}
        				}
        			}
        			mdlObj.recipients = recips;
        			mdlarray.push(mdlObj);
        		}
        			
        	}
        	return mdlarray;
        }
	});
	return DocusignTemplateCollection;
})