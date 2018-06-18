define(["text!templates/header.html","SecurityUtil","views/messageNotificationView","app","backbone"],
		function(headerPage, securityUtil, messageNotificationView,app, Backbone){
	
	var HeaderView = Backbone.View.extend( {
		initialize: function(){
			var investorManagement = ["InvestorManagement"];
			var assetManagement = ["AssetManagement","AssetView"];
			var closingManagement = ["ClosingManagement"];
			var opportunityManagement = ["OpportunityManagement"]; 
			var rehabManagement=["RehabManagement"];
			var marketingManagement = ["MarketingManagement"];
			var propertyManagement = ["PropertyManagement"];
			var vendorManagement = ["VendorManagement"];

			this.headerPermissions = {
									'investorManagement':securityUtil.isAuthorised(investorManagement, app.sessionModel.attributes.permissions),
									'assetManagement':securityUtil.isAuthorised(assetManagement, app.sessionModel.attributes.permissions),
									'closingManagement':securityUtil.isAuthorised(closingManagement, app.sessionModel.attributes.permissions),
									'rehabManagement':securityUtil.isAuthorised(rehabManagement, app.sessionModel.attributes.permissions),
									'opportunityManagement':securityUtil.isAuthorised(opportunityManagement, app.sessionModel.attributes.permissions),
									'marketingManagement':securityUtil.isAuthorised(marketingManagement, app.sessionModel.attributes.permissions),
									'propertyManagement':securityUtil.isAuthorised(propertyManagement, app.sessionModel.attributes.permissions),
									'vendorManagement':securityUtil.isAuthorised(vendorManagement, app.sessionModel.attributes.permissions)
								};					
		},
		el:"#header",
		placeHolder:"",
        events          : {
            "click #nav-min-icon":"showHideSideBar",
            "click #gList > li":"selectOptions",
            "click #globe-search-box > .input-icon > i" : "clearVal"

        },
		render : function (msg) {

			var self = this;

	    	if(!msg){
	    		msg="";
	    	}
			this.template = _.template( headerPage );
			this.$el.html("");
			var imglink=this.fetchUserImage();
			this.$el.html(this.template({userName:msg,imageLink:imglink,headerPermissions:this.headerPermissions}));
			//this.fetchUserMessageNotificationCount();
			if(!app.messageNotificationView){
				app.messageNotificationView=new messageNotificationView();
				
			}
			//app.messageNotificationView.render();
			
			var notificationCount=app.messageNotificationView.fetchUserMessageNotificationCount();
		
			 this.showNotification(notificationCount);

			_.defer(function () {
      		  self.JqueryLoader();
      		});

			return this;
	    },

		
		fetchUserImage: function() {
			var object="User";
			var response = $.ajax({
				type : "GET",
				url : app.context()+ "/image/link/"+object+"/"+app.sessionModel.get("userId"),
				async : false
			});
			
			var imglink=response.responseText
			return imglink;
		},
        showHideSideBar : function(evt){
            console.log("showHideSideBar1");
            var self = this;
            self.trigger('showHideSideBar',$(evt.currentTarget));
        },
		fetchUserMessageNotificationCount :function(){
                 $.ajax({
                	type : "GET",
                	url  : app.context()+"/notifications/messageNotificationCount/"+app.sessionModel.get("userId"),
                	async:false,
                	success:function(res)
                	{
                		console.log(res);
                		if(res>0){
                		$("#msgNotificationCount").html(res);
                		$(".MsgNotfy").show();
                		//$("#msgnotification").show();
                	}
                	},
                	error: function(){
                		console.log('fail to retrieve the notification count');
                	}		

                    });



		},
		fetchUserMessageNotifications :function(){
        // create a view for message page and populate the response in the id of this view
				console.log("inside fetchusernot");

		},
		
		showNotification :function(res){
			if(res){
				console.log(res);
				var newres=parseInt($("#msgNotificationCount").html());
				var value;
				if(isNaN(newres)){
				 value=res;
				}else{
					 value=newres+res;
				}
        		$("#msgNotificationCount").html(value);
        		$(".MsgNotfy").show();
        	}
			
		},

		selectOptions:function(evt){
			$("#gOption").find("i").replaceWith($(evt.target).find("i").clone());
		},
		JqueryLoader: function () {
	      	//$('.content-wrapper').css('background-color', '#fff');
	      	var gWidget = $( "#globe-search-input" ).autocomplete({
	      		delay: 0,
	        	source: function (request, response) {
	          	//var url = app.gslink().replace('%param',$("#globe-search-input").val().trim());
	          	var type = $("#gOption").find('i').attr("type");
				var url = app.context()+'globe/search/';
	          	$.ajax({
	          		url:url,
	          		contentType: 'application/json',
                	dataType:'json', 
                	type: 'POST',
                	data:JSON.stringify({"searchStr": $("#globe-search-input").val().trim(),"type":type}),
                	success: function(theRes){
                		var data=[];
                		data.push({"type":theRes.type});
                		if(theRes.groupDocuments!=null){
	                		//var obj = $.parseJSON(theRes.groupDocuments);
	                		var obj = theRes.groupDocuments;
		                		if(theRes.type == "all" && theRes.groupDocuments.length > 0){

		                			$.each(theRes.groupDocuments, function (key1, val1) {

		                				$.each(val1.result, function (key2, val2) {

		                					data.push({
						              			"label" : val2.document_desc_en,
						              			"category" : val1.groupValue.toUpperCase(),
						              			"id" : val2.id
					              			});

		                				});

		                			});	
		                		}
		                		else if(theRes.type != "all" && theRes.groupDocuments.length == 1){
			                		$.each(theRes.groupDocuments[0].result, function (index, item) {
					              		
					              		data.push({
					              			"label" : item.document_desc_en,
					              			"category" : theRes.groupDocuments[0].groupValue.toUpperCase(),
					              			"id" : item.id
					              		});
					            	});	
		                		}
		                		else
		                			data[0]["numFound"] = 0;
		                	
                		}else{
                			data[0]["numFound"] = 0;
                		}
                		response(data);
               	 	},
                	error: function(res){
                    	console.log("Error When querying solr");
                	}	 

	          	});
	        	},
	        	create: function (e) {
        			$(this).prev('.ui-helper-hidden-accessible').remove();
    			},
    			select: function( event, ui ) {
    				this.value = "";
    				return false;	
    			},
	        	minLength: 3//,

      		})
			.data( "ui-autocomplete" );

			var genItem = function( item ) {

				var logo = "",link = "", prelink = (app.env=="dev")?"index1":"index";

					switch (item.category){

						case "PROPERTY":
							logo="fa fa-home"
							link=app.context()+prelink+"#property/"+item.id;
							break;
						case "INVESTOR":
							logo="fa fa-user";
							link=app.context()+prelink+"#investorProfile/"+item.id;
							break;
						case "OPPORTUNITY":
							logo="fa fa-search";
							link=app.context()+prelink+"#opportunity/"+item.id;
							break;
						case "CLOSING":
							logo="fa fa-shopping-cart";
							link=app.context()+prelink+"#closing/"+item.id;
							break;
						case "ASSET":
							logo="fa fa-building-o";
							link=app.context()+prelink+"#myProperties/"+item.id;
							break;
						case "REHAB":
							logo="fa fa-legal";
							link=app.context()+prelink+"#rehab/"+item.id;
							break;
						case "MARKETING":
							logo="fa fa-signal";
							link=app.context()+prelink+"#marketing/"+item.id;
							break;		
						case "VENDOR":
							logo="fa fa-users";
							link=app.context()+prelink+"#vendor/"+item.id;
							break;	
						default:
							break;				
					}
					var str = "<a href='"+link+"'><i class='"+logo+"'></i>&nbsp;" + item.label + "</a>";

				    return $( "<li>" )
				        .append( str );
			    
			}

			gWidget._renderMenu = function( ul, items ) {

				
    			var self = this, currentCategory = "";
    			var type = "";

    			ul.append("<br>");

    			if(items[0]["numFound"] != null){
    				ul.append("<li>No result found.</li>");
    			}
    			else{
	    			$.each( items, function( index, item ) {

	    				if(index == 0)
	    					type = item.type;
	    				else{
	    					if(type == "all"){
	    						var li;
	    						if( item.category != currentCategory){
	    							ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
	    							currentCategory = item.category
	    						}	

	    						li = genItem(item);
	    						ul.append(li);
	    						if(item.category)
	    							li.attr("aria-label", item.category + " : " + item.label);
	    					}	
	    					else
	    						ul.append(genItem(item));								
	    				}
	    				
	    			});
    			}
    		};
			
    	},
		/*JqueryLoader: function () {
	      	//$('.content-wrapper').css('background-color', '#fff');
	      	var gWidget = $( "#globe-search-input" ).autocomplete({
	      		delay: 0,
	        	source: function (request, response) {
	          	//var url = app.gslink().replace('%param',$("#globe-search-input").val().trim());
	          	var type = $("#gOption").find('i').attr("type");
				var url = app.context()+'globe/search/';
	          	$.ajax({
	          		url:url,
	          		contentType: 'application/json',
                	dataType:'json', 
                	type: 'POST',
                	data:JSON.stringify({"searchStr": $("#globe-search-input").val().trim(),"type":type}),
                	success: function(theRes){
                		var data=[];

                		data.push({"type":theRes.type});
                		if(theRes.res!=null){
	                		var obj = $.parseJSON(theRes.res);
	                		//var obj=theRes.res;
	                		if(obj.responseHeader.status === 0){
		                		
		                		if(theRes.type == "all" && obj.grouped.document_type_s.groups.length > 0){

		                			$.each(obj.grouped.document_type_s.groups, function (key1, val1) {

		                				$.each(val1.doclist.docs, function (key2, val2) {

		                					data.push({
						              			"label" : val2.document_desc_en,
						              			"category" : val1.groupValue.toUpperCase(),
						              			"id" : val2.id
					              			});

		                				});

		                			});	
		                		}
		                		else if(theRes.type != "all" && obj.response.docs.length > 0){
			                		$.each(obj.response.docs, function (index, item) {
					              		
					              		data.push({
					              			"label" : item.document_desc_en,
					              			"category" : item.document_type_s.toUpperCase(),
					              			"id" : item.id
					              		});
					            	});	
		                		}
		                		else
		                			data[0]["numFound"] = 0;
		                	}
                		}
                		
                		response(data);
               	 	},
                	error: function(res){
                    	console.log("Error When querying solr");
                	}	 

	          	});
	        	},
	        	create: function (e) {
        			$(this).prev('.ui-helper-hidden-accessible').remove();
    			},
    			select: function( event, ui ) {
    				this.value = "";
    				return false;	
    			},
	        	minLength: 3//,

      		})
			.data( "ui-autocomplete" );

			var genItem = function( item ) {

				var logo = "",link = "", prelink = (app.env=="dev")?"index1":"index";

					switch (item.category){

						case "PROPERTY":
							logo="fa fa-home"
							link=app.context()+prelink+"#property/"+item.id;
							break;
						case "INVESTOR":
							logo="fa fa-user";
							link=app.context()+prelink+"#investorProfile/"+item.id;
							break;
						case "OPPORTUNITY":
							logo="fa fa-search";
							link=app.context()+prelink+"#opportunity/"+item.id;
							break;
						case "CLOSING":
							logo="fa fa-shopping-cart";
							link=app.context()+prelink+"#closing/"+item.id;
							break;
						case "ASSET":
							logo="fa fa-building-o";
							link=app.context()+prelink+"#myProperties/"+item.id;
							break;
						case "REHAB":
							logo="fa fa-legal";
							link=app.context()+prelink+"#rehab/"+item.id;
							break;
						case "MARKETING":
							logo="fa fa-signal";
							link=app.context()+prelink+"#marketing/"+item.id;
							break;		
						case "VENDOR":
							logo="fa fa-users";
							link=app.context()+prelink+"#vendor/"+item.id;
							break;	
						default:
							break;				
					}
					var str = "<a href='"+link+"'><i class='"+logo+"'></i>&nbsp;" + item.label + "</a>";

				    return $( "<li>" )
				        .append( str );
			    
			}

			gWidget._renderMenu = function( ul, items ) {

				
    			var self = this, currentCategory = "";
    			var type = "";

    			ul.append("<br>");

    			if(items[0]["numFound"] != null){
    				ul.append("<li>No result found.</li>");
    			}
    			else{
	    			$.each( items, function( index, item ) {

	    				if(index == 0)
	    					type = item.type;
	    				else{
	    					if(type == "all"){
	    						var li;
	    						if( item.category != currentCategory){
	    							ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
	    							currentCategory = item.category
	    						}	

	    						li = genItem(item);
	    						ul.append(li);
	    						if(item.category)
	    							li.attr("aria-label", item.category + " : " + item.label);
	    					}	
	    					else
	    						ul.append(genItem(item));								
	    				}
	    				
	    			});
    			}
    		};
			
    	},*/
    	clearVal : function(evt) {
    		$("#globe-search-input").val('');
    	}

	});
	return HeaderView;
});