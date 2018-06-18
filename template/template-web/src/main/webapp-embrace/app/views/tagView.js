define(["backbone","app","models/tagsModel","text!templates/tags.html"],
	function(Backbone,app,tagsModel,tagsTemplate){
		var tagView = Backbone.View.extend({
			events: {
				"click #addTag":"addTag",
				"click .deleteTag":"saveTagToDelete",
				"click #deleteTagConfirm":"deleteTag",
				"click #editTags":"editTags",
				"click #finishEditTags":"finishEditTags",
				"change #tagSelect":"addTag",
				"click .tagSelect":"addTag"

			},
			initialize: function(){
				this.isEdit = false;
			},
			investorProfile : false,
			render : function(){
				if(this.canView=== true || this.canEdit === true){

					var self = this;
					if(!this.tagsModel){
						this.tagsModel = new tagsModel();
					}
					this.tagsModel.getAvailableTags(this.object,this.objectId,{
						success: function(res){
							console.log('succes in fetching available tags');
							self.availableTags = res.tags;
						},
						error: function(res){
							console.log("error fetching available tags: " + res);
						}
					});
					this.tagsModel.getObjectTags(this.object,this.objectId,{
						success: function(res){
							console.log('succes in fetching tags');
							self.tags = res.tags;
						},
						error: function(res){
							console.log("error fetching tags: " + res);
						}
					});
					this.template = _.template( tagsTemplate );
			     	this.$el.html("");
			     	this.$el.html(this.template({canEdit:this.canEdit,availableTags:self.availableTags,tags:self.tags,isProfile : self.investorProfile}));
			     	if(this.investorProfile && !self.availableTags) $(".btn-group > ul").toggleClass("dropdown-menu");
			     
			     }
			},
			editTags : function(){
				$('.editShow').show()
				$('#editTags').replaceWith('<i  id="finishEditTags" class ="pull-right fa fa-check-square-o"></i>');
				//this.isEdit=true;
			},
			finishEditTags : function(){
				$('#tagSelect').val('0');
				$('.editShow').hide()
				$('#finishEditTags').replaceWith('<i  id="editTags"style="margin-left:15px" class ="fa fa-edit"></i>');
				//this.isEdit=false;
			},
			addTag: function(evt){
				var self=this;
				var tagId= $(evt.target).val();
				if(self.investorProfile)
					tagId= $(evt.target).data('value');
				var data={};
				data["tagId"]=tagId;
				data["object"]=self.object;
				data["objectId"]=self.objectId;
			
				console.log("tagId: " + tagId);
				self.tagsModel.addTag(data,{
					success: function(res){
						console.log("succcess in adding new tag");
						self.render();
					},
					error: function(res){
						console.log("error in adding new tag: " + res);
					}
				});

			},
			saveTagToDelete : function(evt){
				var self=this;
				self.tagToDelete = $(evt.target).closest('a').attr('object-tag-id');
				console.log('tag To Delete: ' + self.tagToDelete);

			},
			deleteTag: function(evt){
				var self=this;
				console.log('deleteTag');
				var objectId= self.tagToDelete;
				console.log("objectId: " + objectId);
				self.tagsModel.deleteTag(objectId,{
					success: function(res){
						console.log("succcess in deleting tag");
						self.render();
					},
					error: function(res){
						console.log("error in deleteing tag: " + res);
					}
				});
			$('#deleteTagConfirmationModal').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
			}
		});
		return tagView;
	});