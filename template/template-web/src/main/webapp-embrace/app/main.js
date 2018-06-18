require([ "app","backbone", "underscore", "routers/AppRouter", "models/SessionModel", "polyglot" ],
function(app,Backbone,_, WebRouter, sessionmodel, polyglot) {

	console.log("main.js called here");
	console.log(app.sessionModel);

	var buildSessionModel = function() {
		var sessionData = null;
		app.sessionModel = new sessionmodel();
		sessionData = app.sessionModel.getUser();
		app.sessionModel.set({
			userId : sessionData.userId,
			firstName : sessionData.firstName,
			isDeleted : sessionData.isDeleted,
			isInactive : sessionData.isInactive,
			isLocked : sessionData.isLocked,
			lastName : sessionData.lastName,
			userName : sessionData.userName,
			permissions : sessionData.permissions,
			statusCode : sessionData.statusCode,
			message : sessionData.message,
			roles : sessionData.roles,
			forceReset:sessionData.forceReset,
			landingPage:sessionData.landingPage
		});
		console.log(app.sessionModel)
	};
	buildSessionModel();
	console.log(app.sessionModel);


	if(app.sessionModel.attributes.forceReset=="Y"){
		//alert("Please reset your password");
		window.location.assign("login?resetPassword=1");
		return ;
	}

	// Utility functions are added below
	app.currencyFormatter = function(currencySymbol, currencyClass) {

		if(currencySymbol == undefined) {
			currencySymbol ="";
		}
		if(currencyClass == undefined) {
			currencyClass = 'currency';
		}

		var originalID;
		var originalName;
		var originalValue;
		$('.' + currencyClass).each(function() {
			originalID = $(this).attr('id');

			if( !(new RegExp("currency").test(originalID)) ) {
				originalName = $(this).attr('name');
				originalValue = $(this).attr('value');

				if(originalID === undefined) {
					originalID = originalName;
				}

				$(this).attr("id",originalID + "_currency");
				$(this).removeAttr("name");

				$('<input/>', {
					id: originalID ,
					name:originalName,
					class:originalID,
					value:originalValue,
					type:"hidden"
				}).appendTo($(this).parent());

			}
		});

		var curr=0;
		$('.' + currencyClass).focus(function(evt) {
			curr=this.value.length;
		});
		
		$('.' + currencyClass).keyup(function(evt) {
			var keyCode = evt.keyCode || evt.which;
			
			var start = this.selectionStart,
	        end = this.selectionEnd;
			
			if(!$(this).asNumber({ parseType: 'int' }) == 0){
				$('.' + currencyClass).formatCurrency({roundToDecimalPlace: -1, symbol:currencySymbol});
			}
		     
		    
		    if(this.value.length == 2){ //special case handled while navigating using tab key
		    	if( (new RegExp("\\$").test(this.value)) ){
		    		curr = 0;
		    	}
		    }
		    
			if(this.value.length > curr+1) {
				start = start + 1;
				end = end + 1;
			}
			
			curr = this.value.length;
				
		     var id = $(this).attr('id').replace('_currency','');
		     
		    if(keyCode != 9 && keyCode != 16){ // Avoid setting values for tab and shift key
		    	if(currencyClass == "currencyTable") {
			    	 $(this).closest('tr').find('#'+id).val($(this).asNumber({ parseType: 'float' })); // only for tables with similar ids in each row
			    
		    	}
		    	else if (currencyClass == "currencyInsurance"){
		    		if($(this).val().length==0){
		    			$(this).closest('div').find('#'+id).val(""); // Avoid setting zero value
		    		} else {
		    			$(this).closest('div').find('#'+id).val($(this).asNumber({ parseType: 'float' })); // general
		    		}
		    	}
		    	else if(currencyClass == "currencyInsuranceTable"){
		    		if($(this).val().length==0){
		    			$(this).closest('tr').find('#'+id).val(""); //Avoid setting zero value
		    		} else {
		    			$(this).closest('tr').find('#'+id).val($(this).asNumber({ parseType: 'float' })); // only for tables with similar ids in each row
		    		}
		    	}
		    	else {
		    		if($(this).val().length==0){
		    			$(this).closest('div').find('#'+id).val(""); // Avoid setting zero value
		    		} else {
			    	 	$(this).closest('div').find('#'+id).val($(this).asNumber({ parseType: 'float' })); // general
			    	}
			    }
			}
		     
		    this.setSelectionRange(start, end);
		});
	};

	//Utility function for Number to Words.
	// Convert numbers to words
	// copyright 25th July 2006, by Stephen Chapman http://javascript.about.com
	// permission to use this Javascript on your web page is granted
	// provided that all of the code (including this copyright notice) is
	// used exactly as shown (you can change the numbering system if you wish)

	// American Numbering System
	var th = ['','thousand','million', 'billion','trillion'];
	// uncomment this line for English Number System
	// var th = ['','thousand','million', 'milliard','billion'];

	var dg = ['zero','one','two','three','four', 'five','six','seven','eight','nine']; var tn = ['ten','eleven','twelve','thirteen', 'fourteen','fifteen','sixteen', 'seventeen','eighteen','nineteen']; var tw = ['twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety']; 
	app.toWords = function(s){s = s.toString(); s = s.replace(/[\, ]/g,''); if (s != parseFloat(s)) return 'not a number'; var x = s.indexOf('.'); if (x == -1) x = s.length; if (x > 15) return 'too big'; var n = s.split(''); var str = ''; var sk = 0; for (var i=0; i < x; i++) {if ((x-i)%3==2) {if (n[i] == '1') {str += tn[Number(n[i+1])] + ' '; i++; sk=1;} else if (n[i]!=0) {str += tw[n[i]-2] + ' ';sk=1;}} else if (n[i]!=0) {str += dg[n[i]] +' '; if ((x-i)%3==0) str += 'hundred ';sk=1;} if ((x-i)%3==1) {if (sk) str += th[(x-i-1)/3] + ' ';sk=0;}} if (x != s.length) {var y = s.length; str += 'point '; for (var i=x+1; i<y; i++) str += dg[n[i]] +' ';} return str.replace(/\s+/g,' ');}
	//DataTable Custom Filter for MessagesView, Opportunities Properties View
	app.selectedHilGroupList = [];
	/*$.fn.dataTableExt.afnFiltering.push(function( oSettings, aData, iDataIndex ){
		if(oSettings.nTable.id == "messagesTable"){
			if($(oSettings.nTable).data("msgType")){
				if($(oSettings.nTable).data("msgType")=="comments"){
					if( $(aData[0]).hasClass("commentTypeMessage")) {
						return true;
					} else {
						return false;
					}
				}
		        
				if($(oSettings.nTable).data("msgType")=="all")
				   return true;
			}
        } 
        else if(oSettings.nTable.id == "hilOppPropertyTable"){
        	if(!$(oSettings.nTable).data("statusid") || $(oSettings.nTable).data("statusid") == "showAll" || $(oSettings.nTable).data("statusid") == $(aData[0]).data("statusid") ){ 
        		if (!app.selectedHilGroupList.length || app.selectedHilGroupList.indexOf($(aData[0]).data("hilgroupid")) > -1 ) {
        			return true;
        		}
        	}
			return false;
        }

		return true;
    });*/
	$.fn.dataTable.ext.search.push(
	    function( settings, data, dataIndex, rowData, counter ) {
	        if(settings.nTable.id == "messagesTable"){
				if($(settings.nTable).data("msgType")){
					if($(settings.nTable).data("msgType")=="comments"){
						if( $(rowData[0]).hasClass("commentTypeMessage")) {
							return true;
						} else {
							return false;
						}
					}
			        
					if($(settings.nTable).data("msgType")=="all")
					   return true;
				}
	        } 
	        else if(settings.nTable.id == "hilOppPropertyTable"){
	        	if(!$(settings.nTable).data("statusid") || $(settings.nTable).data("statusid") == "showAll" || $(settings.nTable).data("statusid") == $(rowData[0]).data("statusid") ){ 
	        		if (!app.selectedHilGroupList.length || app.selectedHilGroupList.indexOf($(rowData[0]).data("hilgroupid")) > -1 ) {
	        			return true;
	        		}
	        	}
				return false;
	        }

	        return true;
	    }
	);

 	// Utility functions for jQuery validations
 	$.validator.addMethod("percentage", function(value, element) {
		return this.optional(element) || /^\d{1,3}(\.\d{0,3})?$/i.test(value);
	}, "Maximum 3 digits and 3 decimal places allowed");
	
	$.validator.addMethod("dollarsscents", function(value, element) {
		return this.optional(element) || /^\d{1,8}(\.\d{0,2})?$/i.test(value);
	}, "Maximum 8 digits and 2 decimal places allowed");

	// Utility functions Ends Here


	//One time initialized functions
	App.handlePortletTools();



	// var locale = localStorage.getItem('locale') || 'en';
	var userLang = navigator.language || navigator.userLanguage; 
	if(userLang =='undefined' ||userLang!="en-US"){
		userLang = "en-US";
	}
	var myUrl = app.context()+'locales/' + userLang.toLowerCase() + '.json';

	$.ajax({
		url: myUrl,
		dataType: 'json',
		async: false,
		success: function(data) {
			window.polyglot = new Polyglot({phrases: data});
		} });
	 
	 // Global ajax logout handler
	 $(document).ajaxError(function( event, jqxhr, settings, thrownError ) {
		if(jqxhr.status) {
			if(jqxhr.status===419) {
				
				var index = window.location.href.indexOf('#');
				var finalUrl="";
				if(index>0 && window.location.href.indexOf('#logout')<0){
					finalUrl=finalUrl+window.location.href.substring(index);
				}
				window.location.assign("login?timeout=1"+finalUrl);
			}
		}
	});

	//window.CKEDITOR_BASEPATH = '/assets/js/lib/ckeditor/'
	/*change start*/
	/* app.websocketClient = {};
	 app.websocketClient.stompClient=null;
	 function connect() {
         var socket = new SockJS("/com.homeunion");
         app.websocketClient.stompClient = Stomp.over(socket);            
         app.websocketClient.stompClient.connect({}, function(frame) {
            // setConnected(true);
        	 //Ajax call to get the list of unread msg for notification display
             console.log('Connected: ' + frame);
             app.websocketClient.stompClient.subscribe('/user/topic/greetings', function(greeting){
                 showGreeting(JSON.parse(greeting.body).content);
             });
         });
     }
	  function showGreeting(message) {
          var response = document.getElementById('response');
          var p = document.createElement('p');
          p.style.wordWrap = 'break-word';
          p.appendChild(document.createTextNode(message));
          response.appendChild(p);
      }
     
     function disconnect() {
         if (app.websocketClient.stompClient != null) {
        	 app.websocketClient.stompClient.disconnect();
        	 
         }
        // setConnected(false);
         console.log("Disconnected");
     }
     
     
     app.websocketClient.sendName = function(sendData) {
         var name = document.getElementById('name').value;
    	 console.log(sendData);
         app.websocketClient.stompClient.send("/app/com.homeunion", {}, JSON.stringify({ 'name': sendData }));
     }
     connect();*/
     
     
	app.router=new WebRouter();
	Backbone.history.start();
	app.router.navigateToLandingPage();

	 });