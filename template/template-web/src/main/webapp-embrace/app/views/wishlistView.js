define(["text!templates/wishlist.html", "backbone","app",
        "collections/wishlistCollection","views/myInvestorView","collections/wishlistCollection","models/myInvestorsModel"],
        function(wishlistPage, Backbone,app,wishlists,myInvestorView,wishlistCollection,myInvestorsModel){

	var WishlistView = Backbone.View.extend( {
		initialize: function(){
		},

		model : {},
		models:{},
		el:"#wishlistTab",
		self:this,
		collection:null,
		propertyIdToBeDeleted:{},
		investorIdAssociateWithDeletedPropertyId:{},
		investorIdAssociateWithInvestedProperty:{},
		propertyIdToBeInvested:{},
		opportunityId:"",
		events          : {
			"click a[name='initiateClosingWL']":"showinitiateClosingModal",
			"click #submitInitiateClosingWL":"submitInitiateClosing",
			"click .removeWishlist":"openDeleteWishlist",
			'click #confirmDeleteWishtlist'  : 'removeFromWishlist',
			"click .readyToInvestWishlist":"openReadyToInvestPopUp",
			"click .moveToRecommended":"moveToRecommended",
			'click #confirmInvest'  : 'readyToInvestFromWishlist',
			'click #confirmRecommended'  : 'confirmMoveToRecommended',
			"click .ippropertypage":"showippropertypage"
		},

		render : function () {

			var thisPtr=this;
			thisPtr.collection.fetch({async:false,
				success: function (data) {
					thisPtr.models=data.models;
				},
				error   : function () {
					$('.alert-danger').show();
				}
			});

			this.template = _.template( wishlistPage );
			this.$el.html("");

			var wishlistdata=[];
			if(thisPtr.models!=null){
				for(var i=0; i < thisPtr.models.length; i++) {
					wishlistdata.push(thisPtr.models[i].attributes);
			    }
			}
			var showMoveToRecommend = false;
			if(thisPtr.opportunityId!=""){
				showMoveToRecommend = true;
			}
			this.$el.html(this.template({wishlistModel:wishlistdata,showRecommend:showMoveToRecommend}));

			$('#wishlistTable').on( 'draw.dt', function () {
			    thisPtr.trigger('WishlistTableDrawn');

			    $(".amount").formatCurrency();
				$(".dataAdded").val();
			});

			var table =$('#wishlistTable').dataTable({
				"bPaginate":true,
				"bInfo":true,
				"bFilter":false,
				//"deferRender": true,
				"bStateSave": true,
				"aoColumnDefs": [
				                 { "aTargets": [ 0 ], "bSortable": false },
				                 { "aTargets": [ 1 ], "bSortable": false }
				                 ],
				"aaSorting":[]
			});
			$('#wishlistTable_wrapper .table-scrollable').addClass("data-table-popup-overflow");
			$(".amount").formatCurrency();
            $('select[name=wishlistTable_length]').addClass('form-control');
			/*$('#wishlistTable').bind( 'draw', function () {
				$(".amount").formatCurrency();
				$(".dataAdded").val();
				
			   } );*/
			return this;
		},
		
		showinitiateClosingModal : function(evt){
			var myInvView= new myInvestorView();
			myInvView.collection= new wishlistCollection();
			myInvView.collection.model=myInvestorsModel;
			console.log(app.sessionModel.get("userId"));
			var thisPtr=this;
			var investorId=$(evt.currentTarget).attr('investorid');
			var propertyId=$(evt.currentTarget).attr('propertyid');
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
		},
		
		submitInitiateClosing: function(){
			var myInvView= new myInvestorView();
			myInvView.submitInitiateClosing();
		},
		
		openDeleteWishlist : function(evt) {
			this.propertyIdToBeDeleted=$(evt.currentTarget).attr('propertyId');
			this.investorIdAssociateWithDeletedPropertyId=$(evt.currentTarget).attr('investorid');
			
		},
		
		removeFromWishlist: function(){
			var thisPtr= this;
			var myInvView= new myInvestorView();
			myInvView.investorModel= new myInvestorsModel();
			
			var propId=this.propertyIdToBeDeleted;
			var investorId= this.investorIdAssociateWithDeletedPropertyId;
			
			myInvView.investorModel.deleteWishlist(investorId,propId,{
				success : function ( mod, res ) {
					thisPtr.render();
				},
				error   : function ( mod, res ) {
					$('.alert-danger').show();
				}
			});
			$('#form-delete1').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
		},
		
		openReadyToInvestPopUp : function(evt){
			this.propertyIdToBeInvested=$(evt.currentTarget).attr('propertyId');
			this.investorIdAssociateWithInvestedProperty=$(evt.currentTarget).attr('investorid');
		},
		
		readyToInvestFromWishlist : function(){
			var thisPtr=this;
			$.ajax({
                url: app.context()+'/myinvestors/readyToInvest/member/'+this.investorIdAssociateWithInvestedProperty+'/property/'+this.propertyIdToBeInvested,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async:true,
                
                success: function(res){
                	//alert(res);
                    thisPtr.render();
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
		moveToRecommended:function(evt){
			this.propertyIdToBeInvested=$(evt.currentTarget).attr('propertyId');
			this.investorIdAssociateWithInvestedProperty=$(evt.currentTarget).attr('investorid');
		},
		confirmMoveToRecommended:function(evt){
			var self = this;
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
			$.ajax({
                url: app.context()+'/myinvestors/moveToRecommended/'+self.investorIdAssociateWithInvestedProperty+'/'+self.propertyIdToBeInvested+'/'+self.opportunityId,
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                async:true,
                success: function(res){
                	$.unblockUI();
                	console.log(res);
                	self.render();
                },
                error: function(res){
                	$.unblockUI();
                	var errorEl = self.$el.find('.alert-danger');
                	errorEl.show();
                	errorEl.find('text').html(JSON.parse(res.responseText).message);
			        App.scrollTo(errorEl, -200);
			        errorEl.delay(2000).fadeOut(4000);
                	console.log("Error in moving property to recommended");
                }
            });
			$(evt.currentTarget).closest(".modal").modal('hide');
		},
		showippropertypage: function(evt){
			var propertyId = $(evt.currentTarget).data("objectid");
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
			var wlIPPropertyPopup = window.open("","_blank");
			$.ajax({
				url: app.context()+'/property/getipproperty/'+propertyId,
				type: 'GET',
				success: function(res){
					$.unblockUI();
					wlIPPropertyPopup.location = res;
				},
				error: function(res){
					$.unblockUI();
					console.log('failed to get Investor Portal Link:'+res);
				}
			});
		}
	});

	return WishlistView;
});