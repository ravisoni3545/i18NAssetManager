define(["backbone","app","views/documentUploadView","views/documentFileTypeView","views/emailView"],
		function(Backbone,app,documentUploadView,documentFileTypeView,emailView){
	
	var EssentialView = Backbone.View.extend( {
		initialize: function(){
			if(!app.documentUploadView){
				app.documentUploadView = new documentUploadView();
			}
			
			if(!app.documentFileTypeView){
				app.documentFileTypeView = new documentFileTypeView();
			}

			if(!app.emailView){
				app.emailView=new emailView();
			}
		},
		events:{
			'hide.bs.modal .modal': 'bsModalHide'
		},
		el:"#maincontainer",
		render:function () {
		
		},
		bsModalHide:function(){
			$(".datepicker.datepicker-dropdown").remove();
		}
	});
	return EssentialView;
});