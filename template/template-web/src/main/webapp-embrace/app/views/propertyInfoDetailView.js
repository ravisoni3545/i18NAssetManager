define([
"backbone",
"app",
"SecurityUtil",
"views/lastEditModalView",
"views/propertyCodesView",
"text!templates/propertyInfoDetail.html","text!templates/propertyGeneralInfoDetail.html",
"text!templates/propertyAmenitiesDetails.html","text!templates/propertyListingInfoDetails.html",
"text!templates/codes.html","text!templates/originalRehabEditPopup.html",
"models/propertyModel",
"models/listingModel",
"accounting"
], function(Backbone,app,securityUtil,lastEditModalView,propertyCodesView,propertyInfoDetailTpl,propertyGeneralInfoEditTpl,propertyAmenitiesEditTpl,propertyListingInfoEditTpl,
		codesTemplate,originalRehabEditPopup,propertyModel,listingModel,accounting){
	var propertyInfoDetailView = Backbone.View.extend({

		initialize: function(){

			var propertyDetailEdit=["PropertyDetailEdit"];
			this.viewpermissions = {
									'propertyDetailEdit':securityUtil.isAuthorised(propertyDetailEdit, app.sessionModel.attributes.permissions)			                        
			 };
			this.propertyClassTypes = new propertyCodesView({codeGroup:'ACS'});
			this.propertyTypes = new propertyCodesView({codeGroup:'PRP'});
			this.propertyModelRatingTypes = new propertyCodesView({codeGroup:'CHL'});
			this.localtionModelClassTypes = new propertyCodesView({codeGroup:'EAE'});
		},
		el:"#propertyInfoTab",
		propertyId:"",
		events : {
	        "click #generalInfoEditButton":"generalInfoEdit",
	        "click #amenitiesEditButton":"amenitiesEdit",
	        "click #listingInfoEditButton":"listingInfoEdit",
	        
	        "click #saveGeneralInfoModalBtn":"saveGeneralInfoModal",
	        "click #saveAmenitiesModalBtn":"saveAmenitiesModal",
	        "click #saveListingInfoModalBtn":"saveListingInfoModal",
	        'keyup .persqftPrice': "calculatePricePersqft",
	        'keyup .monthlyPrices': "calculateMonthlyPrices",
	        'keyup .calcrehabbucket': "calculateRehabBucket",
	        "click #saveGeneralInfoButton":"saveGeneralInfo",
	        "click #saveAmenitiesButton":"saveAmenities",
	        "click #saveListingInfoButton":"saveListingInfo",
	        
	        "click button[name=cancelBtn]": "cancelGeneralInfo",
	        //"focusout input": "contentChanged",
	        //"keyup input" : "upChanged",
	        //"click button[name=saveBtn]": "saveGeneral",
	        "click a[href='lastEditModal']" : "showLastEditModal",
	        "click #originalRehab":"showOriginalRehabHistory",
	        "click #editHistoryButton":"saveEditHistory"
	    },
	    render : function (options) {
	    	if(!app.propertyModel){
	    		app.propertyModel = new propertyModel();
	    	}
	    	this.propertyId = options.propertyId;
	    	app.propertyModel.set({"propertyId":this.propertyId});
		    app.propertyModel.fetch({async:false});
	     	if(!app.listingModel){
	     		app.listingModel = new listingModel();
	     	}
	     	app.listingModel.set({propertyId:options.propertyId,urlParam:"byProperty"});
	     	app.listingModel.fetch({async:false});

	     	var dataFinal = app.propertyModel.toJSON();
	    	var propModel=app.propertyModel.toJSON();
	     	$.extend(dataFinal,app.listingModel.toJSON());
	    	this.template = _.template(propertyInfoDetailTpl );
	     	this.$el.html("");
	     	this.$el.html(this.template({theData:dataFinal,accounting:accounting,viewpermissions:this.viewpermissions}));
	     	App.handleUniform();
	     	return this;
	    },
	    polupategeneralInfoTemplate: function(options){
	    	if(!app.propertyModel){
	    		app.propertyModel = new propertyModel();
	    	}
	    	this.propertyId = options.propertyId;
	    	app.propertyModel.set({"propertyId":this.propertyId});
		    app.propertyModel.fetch({async:false});
	     	if(!app.listingModel){
	     		app.listingModel = new listingModel();
	     	}
	     	app.listingModel.set({propertyId:options.propertyId,urlParam:"byProperty"});
	     	app.listingModel.fetch({async:false});
	    	
	    	var dataFinal = app.propertyModel.toJSON();
	    	var propModel=app.propertyModel.toJSON();
	     	$.extend(dataFinal,app.listingModel.toJSON());
	     	$('#propertyAddressSpan').text(propModel.propertyFullAddress);
	     	$('#otherSpan').text(propModel.otherInfo);
	     	$('#priceSpan').text(accounting.formatMoney(propModel.propertyDetails.askingPrice,"$",2));
	     	$('#rentSpan').text(accounting.formatMoney(propModel.propertyDetails.leasedRent,"$",2));
	     	$('#tenantedSpan').text(propModel.tenantedProperty?"Y" :"N");
	     	$('#bidRangeSpan').text(accounting.formatMoney(propModel.propertyDetails.minBid,"$",2)+"-"+accounting.formatMoney(propModel.propertyDetails.maxBid,"$",2));
	    	if(propModel.recalculationPending){
	    		$('#finRecalculationStatus').html('<strong style="color: red;">PENDING</strong>');
	    	}else{
	    		$('#finRecalculationStatus').html('<strong style="color: #428BCA;">UP TO DATE</strong>');
	    	}
	     	this.template = _.template( propertyInfoDetailTpl );
	     	this.$el.html("");
	     	this.$el.html(this.template({theData:dataFinal,accounting:accounting,viewpermissions:this.viewpermissions}));
	     	App.handleUniform();
	    },
	    cancelRenderInfoTemplate:function(){
	    	var dataFinal = app.propertyModel.toJSON();
	    	$.extend(dataFinal,app.listingModel.toJSON());
	    	this.template = _.template( propertyInfoDetailTpl );
 	     	this.$el.html("");
 	     	this.$el.html(this.template({theData:dataFinal,accounting:accounting,viewpermissions:this.viewpermissions}));
 	     	App.handleUniform();
	    	
	    },
	    generalInfoEdit : function(evt){
	    	var self=this;
	    	var template = _.template( propertyGeneralInfoEditTpl );
	    	$("#generalInfoDiv").html("");
	    	$("#generalInfoDiv").html(template({theData:app.propertyModel.toJSON(),accounting:accounting}));
	    	self.fetchAllRehabBuckets();
	    	self.propertyTypes.render({el:$('#propertyTypeDropdown'),codeParamName:"propertyType",addBlankFirstOption:true});
	    	$("#propertyTypeDropdown [name=propertyType]").val(app.propertyModel.toJSON().propertyDetails.propertyType);
	    	$(".currency").formatCurrency({symbol:""});
			app.currencyFormatter();
			self.generalInformationValidation($('#generalInfoForm'));
			$(':input').each(function() { 
			    $(this).data('initialValue', $(this).val()); 
			}); 
	    },
	    fetchAllRehabBuckets: function(){
			var self = this;
			$.ajax({
				url: app.context()+'/rehabbucket/getrehabbucketarray',
				contentType: 'application/json',
				async : true,
				dataType:'json',
				type: 'GET',
				success: function(res){
					var rehabBucket=app.propertyModel.toJSON().propertyDetails.rehabBucket;
					var types=res.type;
					var rehabFrom=res.rehabFrom;
					var rehabTo=res.rehabTo;
					app.propertyModel.set('rehabBucketArray',res);
					self.calculateRehabBucket();
				},
				error: function(res){
					console.log("Error fetching rehab buckets");
				}

			});
		},
		calculateRehabBucket :function(){
			var res=app.propertyModel.get('rehabBucketArray');
			var types=res.type;
			var rehabFrom=res.rehabFrom;
			var rehabTo=res.rehabTo;
			var rehabEstimate = $('#rehabEstimate').val();
			if(rehabEstimate!='' && rehabEstimate>0){
				$("#rehabBucket_text").val("");
				$("#rehabBucket").val("");
				for(var i = 0; i < types.length; i++){
					if(rehabEstimate>rehabFrom[i] && rehabEstimate<=rehabTo[i]){
						$("#rehabBucket_text").val(types[i] +" ("+rehabFrom[i]+"-"+rehabTo[i]+") ");
						$("#rehabBucket").val(types[i]);
						break;
					}
				}
			}else{
				$("#rehabBucket_text").val(types[0] +" ("+rehabFrom[0]+"-"+rehabTo[0]+") ");
				$("#rehabBucket").val(types[0]);
			}
		},
	    amenitiesEdit : function(evt){
	    	var self=this;
	    	var template = _.template( propertyAmenitiesEditTpl );
	    	$("#amenitiesInfoDiv").html("");
	    	$("#amenitiesInfoDiv").html(template({theData:app.propertyModel.toJSON(),accounting:accounting}));
	    },
	    listingInfoEdit : function(evt){
	    	var self=this;
	    	var template = _.template( propertyListingInfoEditTpl );
	    	$("#listingInfoDiv").html("");
	    	$("#listingInfoDiv").html(template({theData:app.listingModel.toJSON(),accounting:accounting}));
	    	$(".currency").formatCurrency({symbol:""});
			app.currencyFormatter();
			self.listingInfoValidation($('#listingInfoForm'));
	    },
	    saveGeneralInfoModal:function(){
	    	if($('#generalInfoForm').validate().form()){
	    		$('#saveGeneralInfoModal').modal("show");
	    	}
	    },
	    saveAmenitiesModal:function(){
	 		$('#saveAmenitiesModal').modal("show");
	    },
	    saveListingInfoModal:function(){
	    	if($('#listingInfoForm').validate().form()){
	    		$('#saveListingInfoModal').modal("show");
	    	}
	    },
	    saveGeneralInfo:function(){
	    	var self = this;
	    	var obj={};
	    	var unindexed_array = $("#generalInfoForm").serializeArray();
	    	$.map(unindexed_array, function(n, i){
    	    	var value=n['value'];
    	    	var name=n['name'];
    	    	obj[name]=value;
    	    });
	    	var fields_modified_array=[];
	    	obj['showOnweb']=$("#showOnweb").prop("checked");
	    	obj['tenantedProperty']=$("#tenantedProperty").prop("checked");
	    	obj['rehabBucket']=$("#rehabBucket").val();
    	    obj['propertyId']=self.propertyId;
    	    
    	    $(':input').each(function () { 
    	        if($(this).data('initialValue') != $(this).val()){ 
    	        	if($(this).attr('name')!=undefined){
    	        		fields_modified_array.push($(this).attr('name'));
        	        	//console.log($(this).attr('name'));
        	        	//console.log($(this).data('initialValue'));
        	        	//console.log($(this).val());
    	        	}
    	        }
    	    }); 
    	    console.log(fields_modified_array);
    	    obj['fieldsModified']=fields_modified_array;
	    	$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
	    	$.ajax({
				url: app.context()+'/property/editgeneralInfo',
				contentType: 'application/json',
				dataType:'json',
				type: 'POST',
				async: true,
				data: JSON.stringify(obj),
			success: function(res){
				$.unblockUI();
				$(".modal-backdrop.fade").remove();
				self.polupategeneralInfoTemplate({"propertyId":self.propertyId});
				$('#propertyInfoSuccessMessage').show();
				$('#propertyInfoSuccessMessage > text').html('');
				$('#propertyInfoSuccessMessage > text').html("Successfully Update Information");
				App.scrollTo($('#propertyInfoSuccessMessage'), -200);
				$('#propertyInfoSuccessMessage').delay(2000).fadeOut(3000);
			},
			error: function(res){
				$.unblockUI();
				$('#saveGeneralInfoModal').modal("hide");
				$(".modal-backdrop.fade").remove();
				$('#generalInfoErrorMessage').show();
				$('#generalInfoErrorMessage > text').html('');
				$('#generalInfoErrorMessage > text').html("Failed Update General Information");
				App.scrollTo($('#generalInfoErrorMessage'), -200);
				$('#generalInfoErrorMessage').delay(2000).fadeOut(3000);
			}
			});
	 			 		
	    },
	    calculatePricePersqft:function(){
			var self=this;
			if($('#generalInfoForm').validate().form()){
				var totalSqft = $('#totalSqft').val();
				var askingPrice = $('#askingPrice').val();
				var leasedRent = $('#leasedRent').val();
				var askingPricepersqft = 0;
				var leasedRentpersqft = 0;
				if(askingPrice!='' && askingPrice>0 && totalSqft!='' && totalSqft>0){
					askingPricepersqft=askingPrice/totalSqft;
				}
				if(leasedRent!='' && leasedRent>0 && totalSqft!='' && totalSqft>0){
					leasedRentpersqft=leasedRent/totalSqft;
				}
				$("#pricePersqft").val(askingPricepersqft);
				$("#pricePersqft_currency").val(accounting.formatMoney(askingPricepersqft,'',2));
				$("#rentPersqft").val(leasedRentpersqft);
				$("#rentPersqft_currency").val(accounting.formatMoney(leasedRentpersqft,'',2));
			}
		},
		calculateMonthlyPrices:function(){
			var self=this;
			if($('#generalInfoForm').validate().form()){
				var propertyTaxesAnnual = $('#propertyTaxesAnnual').val();
				var propertyInsuranceAnnual = $('#propertyInsuranceAnnual').val();
				var hoaFeeAnnual = $('#hoaFeeAnnual').val();
				var propertyTaxesMonthly = 0;
				var propertyInsuranceMonthly = 0;
				var hoaFeeMonthly = 0;
				if(propertyTaxesAnnual!='' && propertyTaxesAnnual>0){
					propertyTaxesMonthly=propertyTaxesAnnual/12;
				}
				if(propertyInsuranceAnnual!='' && propertyInsuranceAnnual>0){
					propertyInsuranceMonthly=propertyInsuranceAnnual/12;
				}
				if(hoaFeeAnnual!='' && hoaFeeAnnual>0){
					hoaFeeMonthly=hoaFeeAnnual/12;
				}
				$("#propertyTaxesMonthly").val(propertyTaxesMonthly);
				$("#propertyTaxesMonthly_currency").val(accounting.formatMoney(propertyTaxesMonthly,'',2));
				$("#propertyInsuranceMonthly").val(propertyInsuranceMonthly);
				$("#propertyInsuranceMonthly_currency").val(accounting.formatMoney(propertyInsuranceMonthly,'',2));
				$("#hoaFeeMonthly").val(hoaFeeMonthly);
				$("#hoaFeeMonthly_currency").val(accounting.formatMoney(hoaFeeMonthly,'',2));
			}
		},
	    generalInformationValidation:function(currentForm){
			var self= this;
			var form1 = currentForm;
			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					bedRooms: {
						required: false
					},
					bathRooms: {
						required: false
					},
					yearBuilt: {
						required: false,maxlength:4,number: true
					},
					totalSqft: {
						required: false,number: true
					},
					lotSize: {
						required: false
					},
					lotMeasure: {
						required: false
					},
					askingPrice: {
						required: false,number: true
					},
					minBid: {
						required: false,number: true
					},
					maxBid: {
						required: false,number: true
					},
					leasedRent: {
						required: false,number: true
					},
					propertyTaxesAnnual: {
						required: false,number: true
					},
					propertyInsuranceAnnual: {
						required: false,number: true
					},
					hoaFeeAnnual: {
						required: false,number: true
					},
					rehabEstimate: {
						required: false,number: true
					}
					
			/*,
							lpoahuSignerid:{
								required: true
							}*/
			/*minBid: {
								required: true,number: true
							},
							maxBid: {
								required: true,number: true
							}*/
			},

			invalidHandler: function (event, validator) { //display error alert on form submit              

			},

			highlight: function (element) { // hightlight error inputs
				$(element)
				.closest('.form-group').addClass('has-error'); // set error class to the control group
			},

			unhighlight: function (element) { // revert the change done by hightlight
				$(element)
				.closest('.form-group').removeClass('has-error'); // set error class to the control group
			},

			success: function (label) {
				label
				.closest('.form-group').removeClass('has-error'); // set success class to the control group
			}
			});

		},
		
		
		editHistoryFormValidation:function(currentForm){
			var self= this;
			var form1 = currentForm;
			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
				comments: {
						required: true
					},
					
					originalRehab :{
						required:true,number:true
					}
			},

			invalidHandler: function (event, validator) { //display error alert on form submit              

			},

			highlight: function (element) { // hightlight error inputs
				$(element)
				.closest('.form-group').addClass('has-error'); // set error class to the control group
			},

			unhighlight: function (element) { // revert the change done by hightlight
				$(element)
				.closest('.form-group').removeClass('has-error'); // set error class to the control group
			},

			success: function (label) {
				label
				.closest('.form-group').removeClass('has-error'); // set success class to the control group
			}
			});

		},
		
	    saveAmenities: function(){
	    	var self = this;
	    	var obj={};
	    	var unindexed_array = $("#amenitiesForm").serializeArray();
	    	$.map(unindexed_array, function(n, i){
    	    	var value=n['value'];
    	    	var name=n['name'];
    	    	obj[name]=value;
    	    });
    	    obj['propertyId']=self.propertyId;
	    	$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
	    	$.ajax({
				url: app.context()+'/property/editAmenities',
				contentType: 'application/json',
				dataType:'json',
				type: 'POST',
				async: true,
				data: JSON.stringify(obj),
			success: function(res){
				$.unblockUI();
				$(".modal-backdrop.fade").remove();
				self.polupategeneralInfoTemplate({"propertyId":self.propertyId});
				$('#propertyInfoSuccessMessage').show();
				$('#propertyInfoSuccessMessage > text').html('');
				$('#propertyInfoSuccessMessage > text').html("Successfully Update Information");
				App.scrollTo($('#propertyInfoSuccessMessage'), -200);
				$('#propertyInfoSuccessMessage').delay(2000).fadeOut(3000);
			},
			error: function(res){
				$.unblockUI();
				$('#saveAmenitiesModal').modal("hide");
				$(".modal-backdrop.fade").remove();
				$('#amenitiesErrorMessage').show();
				$('#amenitiesErrorMessage > text').html('');
				$('#amenitiesErrorMessage > text').html("Failed Update Amenities Information");
				App.scrollTo($('#amenitiesErrorMessage'), -200);
				$('#amenitiesErrorMessage').delay(2000).fadeOut(3000);
			}
			});
	    },
	    saveListingInfo: function(){
	    	var self = this;
	    	var obj={};
	    	var unindexed_array = $("#listingInfoForm").serializeArray();
    	    $.map(unindexed_array, function(n, i){
    	    	var value=n['value'];
    	    	var name=n['name'];
    	    	obj[name]=value;
    	    });
    	    obj['propertyId']=self.propertyId;
	    	$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
	    	$.ajax({
				url: app.context()+'/listing/editlistingInfo',
				contentType: 'application/json',
				dataType:'json',
				type: 'POST',
				async: true,
				data: JSON.stringify(obj),
				success: function(res){
				$.unblockUI();
				$(".modal-backdrop.fade").remove();
				self.polupategeneralInfoTemplate({"propertyId":self.propertyId});
				$('#propertyInfoSuccessMessage').show();
				$('#propertyInfoSuccessMessage > text').html('');
				$('#propertyInfoSuccessMessage > text').html("Successfully Update Information");
				App.scrollTo($('#propertyInfoSuccessMessage'), -200);
				$('#propertyInfoSuccessMessage').delay(2000).fadeOut(3000);
			},
			error: function(res){
				$.unblockUI();
				$('#saveListingInfoModal').modal("hide");
				$(".modal-backdrop.fade").remove();
				$('#listingInfoErrorMessage').show();
				$('#listingInfoErrorMessage > text').html('');
				$('#listingInfoErrorMessage > text').html("Failed Update Listing Information");
				App.scrollTo($('#listingInfoErrorMessage'), -200);
				$('#listingInfoErrorMessage').delay(2000).fadeOut(3000);
			}
			});
	    },
	    listingInfoValidation:function(currentForm){
			var self= this;
			var form1 = currentForm;
			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					listingAgentemail: {
						required: false,
						email: true
					}
					
			/*,
							lpoahuSignerid:{
								required: true
							}*/
			/*minBid: {
								required: true,number: true
							},
							maxBid: {
								required: true,number: true
							}*/
			},

			invalidHandler: function (event, validator) { //display error alert on form submit              

			},

			highlight: function (element) { // hightlight error inputs
				$(element)
				.closest('.form-group').addClass('has-error'); // set error class to the control group
			},

			unhighlight: function (element) { // revert the change done by hightlight
				$(element)
				.closest('.form-group').removeClass('has-error'); // set error class to the control group
			},

			success: function (label) {
				label
				.closest('.form-group').removeClass('has-error'); // set success class to the control group
			}
			});

		},
	    cancelGeneralInfo : function(evt) {
	    	var self=this;
	    	$(".modal-backdrop.fade").remove();
	    	self.cancelRenderInfoTemplate();
	    },
	    contentChanged : function(evt) {

	    	var oldValue = evt.target.defaultValue.replace("$","").replace(/,/g,"");
	    	var fieldName = $(evt.target).attr('id');
	    	var newValue = $(evt.target).val().replace("$","").replace(/,/g,"");
	    	var temp = this.model.get('dataStr');
	    	if(oldValue!=newValue){
	    		temp[fieldName] = {oldValue:oldValue,newValue:newValue};
                console.log("details temp fieldname: " + fieldName + ' old ' + oldValue+ ' new '+ newValue + " whole " +temp[fieldName]);
	    		this.model.set('dataStr',temp);
	    	}
	    	
	    	$(".currency2").formatCurrency();

	    },
	    upChanged : function(evt) {	
	    	if(evt.keyCode != 8 && evt.keyCode!=46)
		    	$(".currency").formatCurrency({roundToDecimalPlace: 0});
	    },
	    saveGeneral : function(evt) {
	    	
	    	var self = this;

	    	if(jQuery.isEmptyObject(this.model.get("dataStr")))
	    		alert("There is no new changes");
	    	else{	
	    		this.model.updateModel({
	    			success: function(res){
	    				if(res.statusCode == "200"){
	    					console.log("success");
	    					self.render({"propertyId":self.propertyId});
	    				}
	    				else{
	    					console.log(res);	
	    					console.log("failed to update");
	    				}
	    			},
	    			error: function(res){
	    				console.log(res);
	    				console.log("error in saving the object");
	    			}
	    		});
	    	}
	    	evt.preventDefault();		
	    },
	    showLastEditModal : function(evt){

	    	if(!app.propertyInfoDetailView.lastEditModalView)
	    		app.propertyInfoDetailView.lastEditModalView = new lastEditModalView();
	    	app.propertyInfoDetailView.lastEditModalView.setElement($("#lastEditModalDiv"));
	    	$(evt.target).parents('portlet-body').css("border","soild red 1px");
			var option = $(evt.target).parents('.portlet-body').find('table').attr('name');
	    	app.propertyInfoDetailView.lastEditModalView.render((option == 'property')?app.propertyModel:app.listingModel);	
	    	evt.preventDefault();		
	    },
	    
	    showOriginalRehabHistory:function(evt){
	    	var self=this;
	    	var isAdmin;
	    	
	    	$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
	    	
	    	if(app.sessionModel.attributes.roles.indexOf("Administrator")!=-1){
	    		isAdmin=true;
	    	}else{
	    		isAdmin=false;
	    	}
	    	
	    	
	    	$.ajax({
				url: app.context()+'/auditHistory/fetchAttributeHistory'+"/originalRehab"+'/'+self.propertyId,
				contentType: 'application/json',
				async : true,
				dataType:'json',
				type: 'GET',
				success: function(res){
	    			$.unblockUI();
			    	var originalRehabEditTemplate=_.template(originalRehabEditPopup);
			    	var templateData = {title:"Original Rehab Edit",label:"Original Rehab", name:"originalRehab"};
			    	self.$el.find("#orgRehbEdit").html(originalRehabEditTemplate({data:templateData,accounting:accounting,historyDatas:res,isAdmin:isAdmin}));
			    	self.$el.find("#originalRehabEditModal").modal('show');
			    	$(".currency").formatCurrency({symbol:""});
					app.currencyFormatter();
			    	self.editHistoryFormValidation($("#editHistoryForm"));
				},
				error: function(res){
					$.unblockUI();
					console.log("Error fetching audit history");
				}

			});
	    	
	    	$(':input').each(function() { 
			    $(this).data('initialValueRehab', $(this).val()); 
			}); 
	    },
	    
	    saveEditHistory:function(evt){
	    	var self = this;
	    	var obj={};
	    	var unindexed_array = $("#editHistoryForm").serializeArray();
	    	$.map(unindexed_array, function(n, i){
    	    	var value=n['value'];
    	    	var name=n['name'];
    	    	obj[name]=value;
    	    });
	    	var fields_modified_array=[];
    	    obj['propertyId']=self.propertyId;
        
    	  
    	    
    	    $(':input').each(function () { 
    	        if($(this).data('initialValueRehab') != $(this).val()){ 
    	        	if($(this).attr('name')!=undefined){
    	        		fields_modified_array.push($(this).attr('name'));
        	        	//console.log($(this).attr('name'));
        	        	//console.log($(this).data('initialValue'));
        	        	//console.log($(this).val());
    	        	}
    	        }
    	    });
    	    
           
        	        	
    	       
    	    
    	    console.log(fields_modified_array);
    	    obj['fieldsModified']=fields_modified_array;
    	    
    	    var previousOrgRehb=$("#originalRehabValue").val().trim();
    	    var currentOrgRehb=obj["originalRehab"].trim();
    	    var isOrginalRehbChanged;
    	    
    	    if(previousOrgRehb==currentOrgRehb){
    	    	isOrginalRehbChanged=false;
    	    	 $('#EditOrgRehabMsgFailure').show();
                 $('#EditOrgRehabMsgFailure > text').html("Original rehab entered is same as existing Original rehab.");
				// App.scrollTo($('#EditOrgRehabMsgFailure'), -200);
				 $('#EditOrgRehabMsgFailure').delay(3000).fadeOut(3000);
    	    }else{
    	    	isOrginalRehbChanged=true;
    	    }
    	    
    	    
	    	
	    	if (isOrginalRehbChanged && $('#editHistoryForm').validate().form()){	
	    		
	    		$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				});
	    	$.ajax({
				url: app.context()+'/property/editgeneralInfoAtFieldLevel',
				contentType: 'application/json',
				dataType:'json',
				type: 'POST',
				async: true,
				data: JSON.stringify(obj),
			success: function(res){
				$.unblockUI();
				$(".modal-backdrop.fade").remove();
				self.polupategeneralInfoTemplate({"propertyId":self.propertyId});
				$('#propertyInfoSuccessMessage').show();
				$('#propertyInfoSuccessMessage > text').html('');
				$('#propertyInfoSuccessMessage > text').html("Successfully Update Information");
				App.scrollTo($('#propertyInfoSuccessMessage'), -200);
				$('#propertyInfoSuccessMessage').delay(2000).fadeOut(3000);
			},
			error: function(res){
				$.unblockUI();
				$('#originalRehabEditModal').modal("hide");
				$(".modal-backdrop.fade").remove();
				$('#generalInfoErrorMessage').show();
				$('#generalInfoErrorMessage > text').html('');
				$('#generalInfoErrorMessage > text').html("Failed Update General Information");
				App.scrollTo($('#generalInfoErrorMessage'), -200);
				$('#generalInfoErrorMessage').delay(2000).fadeOut(3000);
			}
			});
	    	}
	 			 		
	    },
	    

	 });
	 return propertyInfoDetailView;
});