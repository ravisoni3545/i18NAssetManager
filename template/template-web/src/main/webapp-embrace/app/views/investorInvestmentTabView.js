define(["text!templates/investorInvestmentTab.html", "backbone","app"],
		function(investorInvestmentTabPage, Backbone, app, investorInvestmentTabModel){

	var InvestorInvestmentTabView = Backbone.View.extend( {
		initialize: function(){
		},

		el:"#investorInvestmentDetailsTab",
		self:this,
		investorId:{},
		events : {},
		render : function () {
			var thisPtr=this;
			$.ajax({
			    url: app.context()+'investorInvestmentDetails/getInvestmentDetails/'+thisPtr.investorId,
			    contentType: 'application/json',
			    async:false,
			    type: 'GET',
					success: function (res) {
						thisPtr.data=res.invDetails;
					},
					error   : function () {
						console.log("InvestorInvestment Error");
						$('.alert-danger').show();
					}
				});
			this.template = _.template( investorInvestmentTabPage );
			this.$el.html("");
			this.$el.html(this.template({investmentDetails:thisPtr.data}));
			$(".amount").formatCurrency({symbol:"",roundToDecimalPlace:0});
			
			var table =$('#investorInvestmentTable').dataTable({
				"bFilter":false,
				"deferRender": true
			});
			return this;
		}
	});
	return InvestorInvestmentTabView;
});