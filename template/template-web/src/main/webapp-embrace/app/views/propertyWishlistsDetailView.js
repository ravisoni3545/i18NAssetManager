define([
"backbone",
"app",
"SecurityUtil",
"text!templates/propertyWishlistsDetail.html",
"text!templates/investorWishlistResults.html",
"collections/wishlistCollection",
"views/myInvestorView",
"models/myInvestorsModel",
"models/propertyModel",
"models/investorModel",
"models/investorWishlistModel"
], function(Backbone,app,securityUtil,propertyWishlistsDetailTpl,investorWishlistResultsTpl,wishlistCollection,myInvestorView,myInvestorsModel,propertyModel,investorModel,investorWishlistModel){
	var propertyWishlistsDetailView = Backbone.View.extend({

		initialize: function(){
			var wishlistManagement = ["WishlistManagement"];
			this.viewpermissions = {
										'wishlistManagement':securityUtil.isAuthorised(wishlistManagement, app.sessionModel.attributes.permissions)                    
									}
		 },
		 el:"#proeprtyWishlistsTab",
		 model: new propertyModel(),
		 events          : {
		 	"click a[href=#wishlistInvestorModal]" : "showRemoveInvestorModal",
		 	"click #removeInvestor":"removeInvestor",
		 	"click a[href=#inventToBuyModal]" : "showInvestorToBuyModal",
		 	"click #confirmInvest" : "readyToInvestFromWishlist",
		 	"click a[href=#initiateClosingModal]" : "showInitiateClosingModal",
		 	"click #submitInitiateClosingWL":"submitInitiateClosing",
		 	'click #investorSearch' : 'investorSearch',
		 	'click #addWishInvestor' : 'addInvestorWishlist2',
		 	'keypress .insrch' : 'keyHandle'
	     },
	     render : function (options) {

	     	this.model.set({"propertyId":options.propertyId});
	     	this.propertyId=options.propertyId;
	     	this.address=options.address;
	    	this.template = _.template( propertyWishlistsDetailTpl );
	     	this.$el.html("");
	     	this.$el.html(this.template());
	     	$(".modal-body #address").html(options.address);
	     	this.showDataTable();
	     	$('#investorWishlistSearchResults').html(
					_.template(investorWishlistResultsTpl)({
						templateData : null
			}));
			$('#investor_fname').val('');
	     	return this;
	    },
	    showDataTable : function() {
			var self = this;
			// ----------------------------DataTable
			// start-----------------------------------
			var oTable = $('#propertyWishlistTable')
					.dataTable(
							{
								"bServerSide" : true,
								'bProcessing' : true,
								"bFilter": false,
								//"scrollY" : "300px",
								//"scrollX" : "100%",
								//"scrollCollapse" : true,
								//"paging" : false,
								"sAjaxSource" : app.context()
										+ '/property/search/wishlistByProperty/',
								"sAjaxData" : 'aaData',
								//"pagingType" : "simple",
								"oLanguage" : {
									"sLengthMenu" : "_MENU_ records",
									"sZeroRecords" : "No matching records found",
									"sInfo" : "Showing _START_ to _END_ of _TOTAL_ entries",
									"sInfoEmpty" : "No records available",
									"sInfoFiltered" : "(filtered from _MAX_ total entries)",
								},

								"aoColumns" : [
										{
											"mData" : "wishlistId",
											"sTitle" : "Action"
										},
										{
											"mData" : "investorName",
											"sTitle" : "Investor"
										},
										{
											"mData" : "investmentStatus",
											"sTitle" : "WishList Status"
										},
										{
											"mData" : "dateAdded",
											"sTitle" : "Date Added"
										}, {
											"mData" : "addedBy",
											"sTitle" : "Added By"
										}],

								"aoColumnDefs" : [
										{
											"aTargets" : [ 0 ],
											"bSortable": false,
											"mRender" : function(
													data, type,
													full) {
												var wishlistStr = '<div class="btn-group" style="text-align:left!important;">'
 								                      	+'<button data-toggle="dropdown" class="btn dropdown-toggle gear2button" type="button"><i class="fa fa-gear"></i></button>'
			                       					  	+'<ul role="menu" class="dropdown-menu" style="margin-left:30px!important;margin-top:-20px!important; padding:5px;">'
			                       						+'<li><a href="#wishlistInvestorModal" data-toggle="modal" data-id="'+full.wishlistId+'" style="cursor: pointer" class="btn btn-xs pad5_left_right textalignleft"><i class="fa fa-trash-o"></i> Remove Investor from Wishlist </a></li>';
			                       					if(full.propertyStatus=="Available"){
			                       						if(full.investmentStatus=="Intend to buy"){
			                       							wishlistStr+='<li><a href="#initiateClosingModal" data-toggle="modal" data-id="'+full.wishlistId+'" data-investorId="'+full.investorId+'" investorid="'+full.investorId+'" propertyId="'+full.propertyId+'" style="cursor: pointer" class="btn btn-xs green pad5_left_right textalignleft"><i class="fa fa-shopping-cart"></i> Initiate Closing </a></li>';	
				                       					}  	
														if(full.investmentStatus=="Added"){	
															wishlistStr+='<li><a href="#inventToBuyModal" data-toggle="modal" data-id="'+full.wishlistId+'" data-investorId="'+full.investorId+'" style="cursor: pointer" class="btn btn-xs green pad5_left_right textalignleft"><i class="fa fa-shopping-cart"></i> Ready to Invest </a></li>';
														}	
													}
                        							wishlistStr +='</ul></div>';
                        						return (full.investmentStatus=="Added" || full.investmentStatus=="Intend to buy")?wishlistStr:'';		
											}
										},
										{
											"aTargets" : [ 1 ],
											"mRender" : function(
													data, type,
													full) {
												return '<a href="#investorProfile/'
														+ full.investorId
														+ '">'
														+ full.investorName
														+ '</a>';
											}
										}
								],

								"fnServerData" : function(
										sSource, aoData,
										fnCallback, oSettings) {
									var paramMap = {};
									for (var i = 0; i < aoData.length; i++) {
										paramMap[aoData[i].name] = aoData[i].value;
									}
									var pageSize = oSettings._iDisplayLength;
									var start = (paramMap.iDisplayStart>0)?paramMap.iDisplayStart:0;

									var pageNum = (start / pageSize);
									var sortCol = paramMap.iSortCol_0;
									var sortDir = paramMap.sSortDir_0;
									var sortName = paramMap['mDataProp_'
											+ sortCol];
									self.model.set("sortDir",
											sortDir);
									self.model.set("sortName",
											sortName);
									self.model.set("pageNum",
											pageNum);
									self.model.set("pageSize",
											pageSize);
									
									$.ajax({
												"dataType" : 'json',
												"contentType" : "application/json",
												"type" : "POST",
												"url" : sSource,
												"data" : JSON.stringify(self.model.attributes),
												"success" : function(
														res) {
													res.iTotalDisplayRecords = res.iTotalRecords;
													fnCallback(res);
													
												},
												"error" : function(res) {
													console.log("failed to get the wishlist");
									                 												}
											});
									}

								});
			$('#propertyWishlistTable_wrapper .table-scrollable').addClass("data-table-popup-overflow");
            $('select[name="propertyWishlistTable_length"]').addClass("form-control");
		},
		showRemoveInvestorModal :function(evt) {
 
			if(this.viewpermissions.wishlistManagement){
				this.wishlistId = $(evt.target).data('id');
				this.targetRow = $(evt.target).closest('tr').get(0);
				$('#wishlistInvModal').modal('show');	
			}
			else{
				alert("You don't have the permission for this action.");
			}
			
			

		},
		removeInvestor: function(evt) {
			var self=this;
			var oTable=$('#propertyWishlistTable').dataTable();
			var aPos = oTable.fnGetPosition(this.targetRow);

			if(!app.investorModel){
		    		app.investorModel = new investorModel();
		    }
			app.investorModel.removeInvestorWishlist(this.wishlistId,{
					success:function(res){

						$('#wishlistInvModal').modal('hide');
						$('#wishlistInvModal').on('hidden.bs.modal',function(){
							oTable.fnDeleteRow(aPos);
						});
						$('#generalError').show();
						if(res.statusCode == 200)
							$('#generalError').removeClass("alert-danger").addClass("alert-success");
						else
							$('#generalError').removeClass("alert-success").addClass("alert-danger");
						$('#generalError > text').html(res.message);
						App.scrollTo($('#generalError'), -200);
						$('#generalError').delay(2000).fadeOut(2000);
					},
					error:function(res){
						console.log('Error in deleting wishlist'+res);
						$('#generalError').show();
						$('#generalError > text').html("Error in deleting wishlist.");
						App.scrollTo($('#generalError'), -200);
						$('#generalError').delay(2000).fadeOut(2000);
					}
				});	
		},
		showInvestorToBuyModal: function(evt){

			if(this.viewpermissions.wishlistManagement){
				this.wishlistId = $(evt.target).data('id');
				this.investorId = $(evt.target).data('investorid');
				$('#invToBuyModal').modal('show');	
			}
			else{
				alert("You don't have the permission for this action.");
			}
		},
		readyToInvestFromWishlist : function(){
			var thisPtr=this;
			$.ajax({
                url: app.context()+'/myinvestors/readyToInvest/member/'+this.investorId+'/property/'+this.propertyId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async:true,
                
                success: function(res){
                	//alert(res);
                    thisPtr.render({propertyId:thisPtr.propertyId});
                },
                error: function(res){
                	$('.alert-danger').show();
                	console.log("Error in changing the status from 'added' to 'intend to buy' of wishlist");
                }
            });
			
			$('#form-ready-invest').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
		},
		showInitiateClosingModal: function(evt) {
			
			if(this.viewpermissions.wishlistManagement){
				
				var myInvView= new myInvestorView();
				myInvView.collection= new wishlistCollection();
				myInvView.collection.model=myInvestorsModel;
				console.log(app.sessionModel.get("userId"));
				var thisPtr=this;
				var investorId=$(evt.target).data('investorid');
				var propertyId=this.propertyId;

				$.ajax({
		                url: app.context()+'/myinvestors/investor/'+investorId+'/'+propertyId,
		                contentType: 'application/json',
		                dataType:'json',
		                type: 'GET',
		                async:false,
		                success: function(res){
		                	myInvView.collection.add(res);   
		                },
		                error: function(res){
		                    console.log("couldn't fetch the investors");
		                }
		        });
				
				myInvView.showinitiateClosingModal(evt);	
			}
			else{
				alert("You don't have the permission for this action.");
			}
		},
		submitInitiateClosing: function(){
			var myInvView= new myInvestorView();
			myInvView.submitInitiateClosing();
		},
		investorSearch: function(){

			var forlname = $.trim($("#investor_fname").val());

			if(forlname == ''){
				console.log("investor input failed");	
				$('#generalInvestorError').show();
				$('#generalInvestorError > text').html("Investor Name cannot be blank.");
				App.scrollTo($('#generalInvestorError'), -200);
				$('#generalInvestorError').delay(2000).fadeOut(2000);
			}
			else{

				if(!app.invWishlistModel){
		    		app.invWishlistModel = new investorWishlistModel();
		    	}
		    	app.invWishlistModel.set("fname",forlname);
		    	app.invWishlistModel.set("propertyId",this.propertyId);

				this.invModel=app.invWishlistModel;
				this.showInvestorDataTable();
	    	
			}

		},
		showInvestorDataTable : function() {
			var self = this;
			// ----------------------------DataTable
			// start-----------------------------------
			var oTable = $('#investorSearchResultsTable')
					.dataTable(
							{
								"bServerSide" : true,
								'bProcessing' : true,
								"bFilter": false,
								//"scrollY" : "300px",
								//"scrollX" : "100%",
								//"scrollCollapse" : true,
								//"paging" : false,
								"bDestroy" : true,
								"sAjaxSource" : app.context()
										+ '/investors/searchInvestorsWishlist/',
								"sAjaxData" : 'aaData',
								//"pagingType" : "simple",
								"oLanguage" : {
									"sLengthMenu" : "_MENU_ records",
									"sZeroRecords" : "No matching records found",
									"sInfo" : "Showing _START_ to _END_ of _TOTAL_ entries",
									"sInfoEmpty" : "No records available",
									"sInfoFiltered" : "(filtered from _MAX_ total entries)",
								},

								"aoColumns" : [
										{
											"mData" : "investorName",
											"sTitle" : "Investor Name"
										},
										{
											"mData" : "investorEmail",
											"sTitle" : "Email"
										},
										{
											"mData" : "wpropcnt",
											"sTitle" : "Properties in Wishlist"
										}, {
											"mData" : "investorId",
											"sTitle" : "Select"
										}],

								"aoColumnDefs" : [

										{
											"aTargets" : [ 3 ],
											"bSortable": false,
											"mRender" : function(
													data, type,
													full) {
												return '<input type="checkbox" class="wprop" investorid="'+full.investorId+'">';
											}
										}

								],

								"fnServerData" : function(
										sSource, aoData,
										fnCallback, oSettings) {
									var paramMap = {};
									for (var i = 0; i < aoData.length; i++) {
										paramMap[aoData[i].name] = aoData[i].value;
									}
									var pageSize = oSettings._iDisplayLength;
									var start = (paramMap.iDisplayStart>0)?paramMap.iDisplayStart:0;

									var pageNum = (start / pageSize);
									var sortCol = paramMap.iSortCol_0;
									var sortDir = paramMap.sSortDir_0;
									var sortName = paramMap['mDataProp_'
											+ sortCol];
									self.invModel.set("sortDir",
											sortDir);
									self.invModel.set("sortName",
											sortName);
									self.invModel.set("pageNum",
											pageNum);
									self.invModel.set("pageSize",
											pageSize);
									
									$("#investorSearch").attr('disabled','disabled');
									$.ajax({
												"dataType" : 'json',
												"contentType" : "application/json",
												"type" : "POST",
												"url" : sSource,
												"data" : JSON.stringify(self.invModel.attributes),
												"success" : function(
														res) {
													res.iTotalRecords = res.iTotalRecords;
													res.iTotalDisplayRecords = res.iTotalRecords;
													fnCallback(res);
													$("#investorSearch").removeAttr('disabled');
												},
												"error" : function(res) {
													 console.log("Failed in investor search View");
													 console.log(res);
													 $("#investorSearch").removeAttr('disabled');	
													 $('#generalInvestorError').show();
									                 $('#generalInvestorError > text').html("Error in searching investor information.");
									                 App.scrollTo($('#generalInvestorError'), -200);
									                 $('#generalInvestorError').delay(2000).fadeOut(2000);
									                 
												}
											});
								}

							});
			$('#investorSearchResultsTable_wrapper .table-scrollable').addClass("data-table-popup-overflow");
			$('select[name=investorSearchResultsTable_length]').addClass('form-control');
		},
		addInvestorWishlist2: function() {
			var self = this;
			var checkedVals = $('.wprop:checkbox:checked').map(function(){
				checkedTD = $(this).closest('td').prev('td');
				return $(this).attr("investorid");
			}).get();

			if(checkedVals == null || jQuery.isEmptyObject(checkedVals)){	
				$('#generalInvestorError').show();
				$('#generalInvestorError > text').html("No investor has been selected. Please search and select an investor first.");
				App.scrollTo($('#generalInvestorError'), -200);
				$('#generalInvestorError').delay(2000).fadeOut(2000);
			}
			else{
				var addInvestorWishlistData = {};
				addInvestorWishlistData.propertyId = this.propertyId;
				addInvestorWishlistData.investorIds = checkedVals.join(",");
				addInvestorWishlistData.leveragedPercent = null;
				addInvestorWishlistData.investmentAmount = null;
				addInvestorWishlistData.userId = app.sessionModel.get("userId");
		    	this.investorModel = new investorModel();
		    	
		    	this.investorModel.addInvestorWishlist2(addInvestorWishlistData,{
					success:function(res){

						$('#generalInvestorError').show();
						if(res.statusCode == 200)
							$('#generalInvestorError').removeClass("alert-danger").addClass("alert-success");
						else
							$('#generalInvestorError').removeClass("alert-success").addClass("alert-danger");
						$('#generalInvestorError > text').html(res.message);
						App.scrollTo($('#generalInvestorError'), -200);
						$('#generalInvestorError').delay(2000).fadeOut(2000);
						
						console.log('Successful adding wishlist for property');
						$('#wishlistmodal2').modal('hide');
						$('#wishlistmodal2').on('hidden.bs.modal',function(){
							self.render({"propertyId":self.propertyId,"address":self.address});
						});
					},
					error:function(res){
						console.log('Error in adding wishlist'+res);
					}
				});	
			}
		},
		keyHandle : function(e){
			if(e.keyCode == 13){
				this.investorSearch();
			}
		}

	 });
	 return propertyWishlistsDetailView;
});