define(["backbone","app","text!templates/investorPreferences.html", "text!templates/investorPreferencesEdit.html", 
        "models/investorPreferencesModel"],
		function(Backbone,app,investorPreferencesPage, investorPreferencesEditPage, investorPreferencesModel){

	var InvestorPreferencesView = Backbone.View.extend( {
		initialize: function(){

		},
		el:"#investorPreferencesTab",
		preferencesModel: new investorPreferencesModel(),
		events : {
			"click .showEditInvestorPreferences":"showEditInvestorPreferences",
			"click #investorPreferencesSaveBtn":"investorPreferencesSave",
			"click #investorPreferencesCancelBtn":"investorPreferencesCancel",
			"click .transfer-radio-btn":"showOrHideDateTransferred"
		},
		render : function () {
			console.log("investorPreferences Tab reached");
			var self = this;
			var preferenceData = self.preferencesModel.toJSON();
			var preferenceTemplate = _.template(investorPreferencesPage)({preferenceData:preferenceData});
			self.$el.html("");
			self.$el.html(preferenceTemplate);
			self.$el.find("input[name=preferredCommunicationDisplay][value='"+preferenceData.preferredCommunication+"']").prop("checked",true);

	     	ComponentsPickers.init();
	     	App.handleUniform();
		},
		showEditInvestorPreferences: function(){
			var self = this;
			var preferenceData = self.preferencesModel.toJSON();
			var editTemplate = _.template(investorPreferencesEditPage)({preferenceData:preferenceData});
			self.$el.find(".investorPreferencesEdit #investorPreferencesEditDiv").html("");
			self.$el.find(".investorPreferencesEdit #investorPreferencesEditDiv").html(editTemplate);
			self.$el.find("input[name=preferredCommunication][value='"+preferenceData.preferredCommunication+"']").prop("checked",true);
			self.$el.find(".investorPreferencesDisplay").hide();
			self.$el.find(".investorPreferencesEdit").show();
			self.$el.find('.transfer-field .date-picker').datepicker('setEndDate',new Date()).datepicker('update');
			
	     	ComponentsPickers.init();
	     	App.handleUniform();
		},
		investorPreferencesCancel: function(){
			var self = this;
			self.$el.find(".investorPreferencesDisplay").show();
			self.$el.find(".investorPreferencesEdit").hide();
		},
		investorPreferencesSave: function(){
			var self = this;
			var postData = {};
			var unindexed_array = self.$el.find('#investorPreferencesEditForm').serializeArray();
			$.map(unindexed_array, function(n, i){
				var value=n['value'];
				var name=n['name'];
				postData[name]=value;
			});
			postData.investorId = self.preferencesModel.investorId;
			console.log(postData);
			self.preferencesModel.saveInvestorPreference(postData,{
				success:function(res){
					console.log(res);
					self.render();
					$('#investorPreferencesSuccessMessage').show().delay(2000).fadeOut(3000);
				},
				error:function(res){
					console.log("Saving of investor preferences failed");
					$('#investorPreferencesErrorMessage').show().delay(2000).fadeOut(3000);
				}
			});
		},
		fetchInvestorPreferences: function(){
			var self = this;
			self.preferencesModel.fetchInvestorPreferences({
				success:function(res){
					console.log(res);
					self.render();
				},
				error:function(){
					console.log("Failed to fetch investor preferences");
				}
			});
		},
		showOrHideDateTransferred: function(evt){
			var self = this;
			var currentTarget = $(evt.currentTarget);
			if(currentTarget.val()=='Y'){
				currentTarget.closest('.transfer-field').find('.transfer-date-field').show();
			} else {
				currentTarget.closest('.transfer-field').find('.transfer-date-field').hide();
			}
		}
	});
	return InvestorPreferencesView;
});