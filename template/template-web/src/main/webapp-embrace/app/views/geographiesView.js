define(["text!templates/geographies.html", "backbone", "app"],
		function(geographiesTemplate, Backbone, app){
	
	var geographiesView = Backbone.View.extend( {
		initialize: function(options){
			if(options.minInput) {
				this.minInput = options.minInput;
			}
		},
		//This is Id of the div in which bootstrap select2 box with geography records will be loaded. 
		el:"#geographies",
		
		events : {
			'select2-removed #geographiesList':'changeBootStrap'
		},
		render : function (context) {
			var templateOptions = {};
			if(context) {
				this.$el = context.el;
			}
			this.template = _.template( geographiesTemplate, templateOptions);
			this.$el.html("");
			this.$el.html(this.template);
			this.setupBootstrapSelect(this);
	     	return this;
		},
		setupBootstrapSelect : function(view) {
			 this.geographiesSelect = $('#geographiesList').select2({
				 placeholder: "Enter geographical area",
				 multiple: true,
				 minimumInputLength: view.minInput,
				 query: function (query) {
					 var data = {results: []};
					 var allGeographiesResponseObject = $.ajax({
						type : "GET",
						url : app.context()+ "/zipcode/all/"+query.term,
						async : false
					 });
					 allGeographiesResponseObject.done(function(response) {
						_.each(response, function(state){
							var id = state[0];
							if(state[1]!='') {
								id += ', '+state[1];
							}
							var text = id+' ('+state[2]+')';
							data.results.push({id: text, text: text});
						});
					 });
					 allGeographiesResponseObject.fail(function(response) {
						console.error("Error in retrieving geographies "+response);
					 });
					 
					 query.callback(data);
				 }
			 });
			 
			 $('#geographiesList').on('change',function(event){
				 var values = $('#geographiesList').val();
				 if(values.length > 0) {
					 $('#addGeographiesButton').removeAttr('disabled');
				 } else {
					 $('#addGeographiesButton').attr('disabled','disabled');
				 }
			 });

		},
		
		changeBootStrap : function(e){
			//console.log("removed val="+e.val);
			var values=$('#geographiesList').val();
			var val=e.val;
			
			//console.log("before changing values"+values);
			
			val=val.replace(", ",",");
			values=values.replace(", ",",");
			
			var index=values.indexOf(val);
			if(index>-1){
				
				values=values.replace(val+",","");
				values=values.replace(","+val,"");
				values=values.replace(val,"");
			}
			$('#geographiesList').val(values);

			//console.log("after changing values"+values);
		}
	});
	return geographiesView;
});