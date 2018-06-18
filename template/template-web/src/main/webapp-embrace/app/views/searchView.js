define(["text!templates/search.html", "backbone","app","views/geographiesView","views/searchServicesView","views/codesView","models/searchModel","views/productsView","text!templates/searchResults.html"],
	function(searchPage, Backbone,app,geographiesView,servicesView,codesView,searchmodel,productsView,searchResults){
	 var SearchView = Backbone.View.extend( {
		 initialize: function(){
			 this.servicesView= new servicesView();
			 this.codesView = new codesView({codeGroup:'ORG_STATUS'});
			 
			},
		 el:"#maincontainer",
		 events          : {
	         'click #searchContact' : 'searchVendor',
	         'change .servicesDropdown' : 'populateProductDropdown'
	      	         
	     },
	     data:{},
	     model:{},
	     
	     render : function () {

	    	 this.template = _.template( searchPage );
	     	 this.$el.html("");
	     	 this.$el.html(this.template({searchResult:this.data}));
	     	 
	     	if(!this.geographiesView) {
	     	     this.geographiesView = new geographiesView({'minInput':3});
	     	    }
	     	    this.geographiesView.setElement(this.$('#geographies')).render();
	     	    this.servicesView.render({el:$('#servicesList')});
	     	    this.codesView.render({el:$('#status'),codeParamName:"statusId"});
	     	    this.populateProductDropdown();

	     	   var myOptions = {
	     			    val1 : 'Select'
	     			};
	     			var mySelect = $('.codeType');
	     			$.each(myOptions, function(val, text) {
	     			    mySelect.append(
	     			        $('<option></option>').val("").html(text)
	     			    );
	     			});
	     			$('.codeType').val("");
	     			var options = $('.codeType option' );

	     			$( options[$('.codeType > option').length-1] ).insertBefore( $( options[ 0 ] ) );
	     			
	     	 return this;
	     },
	     
	     url :function (){
				var gurl=app.context();
				return gurl;
			},
	     
	     searchVendor:function(){
	    	 			var self=this;
	    	 			var searchModel= new searchmodel();
			    	    var unindexed_array = $('#search_form').serializeArray();
			    	    $.map(unindexed_array, function(n, i){
			    	    	var value=n['value'];
			    	    	var name=n['name'];
  	    	
			    	    	searchModel.set(name,value);
			    	    	
			    	    });

			    	    this.model=searchModel;

			    	    searchModel.searchVendor(searchModel,{
		                    success : function ( mod, res ) {
		                    	self.data=res;
		                    	$('#searchResults').html(_.template( searchResults )({searchResult:res}));
		                    },
		                    error   : function ( mod, res ) {
		                    	$('.alert-danger').show();
		                    }
		                });

		     },
			     
			populateProductDropdown: function() {

				 if(!this.productsView) {
	     		     this.productsView = new productsView();
	     		    }
	     		    this.productsView.all=true;
	     		    this.productsView.setElement($('#productsList')).renderForSearch($('.servicesDropdown').val());
			}
	     
	      
	 });
	 return SearchView;
});