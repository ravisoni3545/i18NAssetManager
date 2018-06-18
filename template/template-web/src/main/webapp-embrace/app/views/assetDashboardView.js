define(["backbone","app","text!templates/assetDashboard.html","text!templates/assetDashboardData.html","views/myAssetsView","collections/myAssetsCollection",
        "text!templates/hilData.html","text!templates/incomeDistribution.html","text!templates/investorData.html",
        "jquery.slimscroll.min","d3","nvd3"],
		function(Backbone,app,assetDashboardPage,assetDashboardDataPage,myAssetsView,myAssetsCollection,
				hilDataPage, incomeDistributionPage,investorDataPage){
	var assetDashboardView=Backbone.View.extend({
		initialize: function(){

		},
		events : {
			'click .showAssetPage':'showAssetSearchPage'
		},
		self:this,
		el:"#maincontainer",
		render : function () {
			var thisPtr = this;
			thisPtr.template = _.template(assetDashboardPage);
			thisPtr.$el.html("");
			this.$el.html(thisPtr.template({app:app}));
			
//			FUTURE FILTER Implementation
//			self.assetManagerId = null;
//			self.propertyManagerName = null;
//			self.hil = null;
			
			this.getDashBoardData();
			_.defer(function () {
				thisPtr.addScrollBar();
				$(".amount").formatCurrency({roundToDecimalPlace: 0});
			});
			
			setInterval(function () {
				thisPtr.reRender(thisPtr);
			},300000);
			
			return this;
		},
		reRender : function(thisPtr){
			thisPtr.getDashBoardData();
			_.defer(function () {
				thisPtr.addScrollBar();
				$(".amount").formatCurrency({roundToDecimalPlace: 0});
			});
		},
		getDashBoardData : function(){
			var thisPtr = this;
        	
			$.ajax({
//                url: 'assetDashboard/get/'+self.assetManagerId+'/'+self.propertyManagerName+'/'+self.hil,
				url: 'assetDashboard/get',
                dataType:'json',
                type: 'GET',
                async:true,
                success: function(res){
                	self.dashboardResponse =res;
                	thisPtr.showDashboardData();
                	thisPtr.getRentData();
               },
                error: function(res){
                   self.dashboardResponse = null;
                   thisPtr.showDashboardFailure();
                },
                complete: function(){
    			  thisPtr.addScrollBar();
    			  $(".amount").formatCurrency({roundToDecimalPlace: 0});
                }
            });
			$.ajax({
				url: 'assetDashboard/getIncomeDistributionData',
              dataType:'json',
              type: 'GET',
              async:true,
              success: function(res){
            	  if (!jQuery.isEmptyObject(res.chartResponseList)) {
//                	  self.incomeDistributionResponse = null;
//                    thisPtr.showDashboardFailure();
//                } else {
                	   self.incomeDistributionResponse =res.chartResponseList;
                       thisPtr.initCharts(self.incomeDistributionResponse);
                   }
             },
              error: function(res){
                 self.dashboardResponse = null;
                 thisPtr.showDashboardFailure();
              },
              complete: function(){
  				thisPtr.addScrollBar();
  				$(".amount").formatCurrency({roundToDecimalPlace: 0});
              }
			});
			$.ajax({
				url: 'assetDashboard/getHilData',
              dataType:'json',
              type: 'GET',
              success: function(res){
              	 if ($.isEmptyObject(res.locationResponseList)) {
              		self.investmentLocationData = null;
                    thisPtr.showDashboardFailure();
                 } else {
                	 self.investmentLocationData =res;
                   	 thisPtr.setInvestmentLocationData();
                 }
             },
              error: function(res){
                 self.investmentLocationData = null;
                 thisPtr.showDashboardFailure();
              },
              complete: function(){
  				thisPtr.addScrollBar();
  				$(".amount").formatCurrency({roundToDecimalPlace: 0});
              }
			});
			$.ajax({
				url: 'assetDashboard/getInvestorData',
              dataType:'json',
              type: 'GET',
              success: function(res){
              	 if ($.isEmptyObject(res.locationResponseList)) {
              		self.investorData = null;
                    thisPtr.showDashboardFailure();
                 } else {
                	 self.investorData =res;
                   	 thisPtr.setInvestorData();
                 }
             },
              error: function(res){
                 self.investorData = null;
                 thisPtr.showDashboardFailure();
              },
              complete: function(){
  				thisPtr.addScrollBar();
  				$(".amount").formatCurrency({roundToDecimalPlace: 0});
              }
			});
			
		},
		showDashboardData:function(){
            this.dashboardtemplate = _.template(assetDashboardDataPage);
	     	var dashboardEl = this.$el.find('#assetDashboardData');
	     	dashboardEl.html("");
			dashboardEl.html(this.dashboardtemplate({assetDashboardResponse:self.dashboardResponse}));
		},
		showDashboardFailure : function(){
		   $('#dashboardFailure').show();
		   App.scrollTo($('#dashboardFailure'), -200);
//		   $('#dashboardFailure').delay(2000).fadeOut(2000);
		},
		getRentData : function(){
			var thisPtr = this;
			$.ajax({
				  url: 'assetDashboard/getRentData',
	              dataType:'json',
	              type: 'GET',
	              success: function(res){
	              	 self.rentDataResponse =res;
	               	 thisPtr.setRentData();
	             },
	              error: function(res){
	                 self.dashboardResponse = null;
	                 thisPtr.showDashboardFailure();
	              },
	              complete: function(){
	  				thisPtr.addScrollBar();
	  				$(".amount").formatCurrency({roundToDecimalPlace: 0});
	              }
				});
		},
		setRentData : function(){
			$('#rentCollectedMTD').text(self.rentDataResponse.rentCollectedMTD);
			$('#rentCollectedYTD').text(self.rentDataResponse.rentCollectedYTD);
			$('#rentOutstanding').text(self.rentDataResponse.rentOutstanding);
		},
		setInvestmentLocationData:function(){
			this.dashboardtemplate = _.template(hilDataPage);
	     	var dashboardEl = this.$el.find('#hilData');
	     	dashboardEl.html("");
			dashboardEl.html(this.dashboardtemplate({investmentLocationData:self.investmentLocationData}));
		},
		setInvestorData:function(){
			this.dashboardtemplate = _.template(investorDataPage);
	     	var dashboardEl = this.$el.find('#investorData');
	     	dashboardEl.html("");
			dashboardEl.html(this.dashboardtemplate({investorData:self.investorData}));
		},
		initCharts: function (data) {
			this.dashboardtemplate = _.template(incomeDistributionPage);
	     	var dashboardEl = this.$el.find('#pieChartDiv');
	     	dashboardEl.html("");
			dashboardEl.html(this.dashboardtemplate());
	
			var total = 0;
			_.each(data, function(d) {	
			    total = total + d.value;
			});
			var colors = ['#7FFF00','#FF7F50','#00FFFF','#FFFF00','#9ACD32','#FF0000','#87CEEB','#EE82EE','#40E0D0','#FA8072','#DB7093','#A52A2A'];
			nv.addGraph(function() {
				  var chart = nv.models.pieChart()
				      .x(function(d) { return d.label })
				      .y(function(d) { return d.value })
				      .showLabels(true)
				      .labelType("percent")
				      .pieLabelsOutside(false)
				      .color(colors)
				      .tooltipContent(function(key, y, e, graph) {
				    	  	var inPercent = (e.value*100)/total;
//				    	  	console.log(e.color);
						    return '<div style="background-color:'+e.color+';"><b><p>' + key + '</p></b></div>'+'<p> $'+ y + '</p><p>' + inPercent.toFixed(3) +'% </p>';
						});
	
				    d3.select("#pieChart svg")
				        .datum(data)
				        .transition().duration(350)
				        .call(chart);
				  
	//			  chart.radioButtonMode(true);
	//			  chart.legend.dispatch.legendClick = function(d, i){
	//				return;
	//				};
					
	//			  chart.legend.disptach.legendClick=function() { 
	//				  return; //do nothing
	//				  };
					
	//			  var chart = nv.models.pieChart()
	//		       .x(function(d) { return d.label })
	//			    .y(function(d) { return d.value })
	//		        .width(420)
	//		        .height(420)
	//		        .showLegend(false)
	//			    .showLabels(true);
	//		    	.labelType("percent");
				    
	//			    d3.select(".nv-legendWrap")
	//			    .attr("transform", "translate(0,50)");
				    
				  return chart;
				});
		},
		
//		initCharts: function (data) {
//			this.dashboardtemplate = _.template(incomeDistributionPage);
//	     	var dashboardEl = this.$el.find('#pieChartDiv');
//	     	dashboardEl.html("");
//			dashboardEl.html(this.dashboardtemplate());
//			var pie = new d3pie("pieChart", {
//				"size": {
//					"canvasHeight":300,
//					"canvasWidth": 450,
//					"pieOuterRadius": "80%"
//				},
//				"data": {
//					"sortOrder": 'value-desc',
//					"content" : data
//				},
//				"labels": {
//					"outer": {
//						"pieDistance": 17
//					},
//					"inner": {
//						"hideWhenLessThanPercentage": 3
//					},
//					"mainLabel": {
//						"fontSize": 11
//					},
//					"percentage": {
//						"color": "#ffffff",
//						"decimalPlaces": 0
//					},
//					"value": {
//						"color": "#adadad",
//						"fontSize": 11
//					},
//					"lines": {
//						"enabled": true
//					},
//					"truncation": {
//						"enabled": true,
//						"length": 17
//					}
//				},
//				"effects": {
//					"pullOutSegmentOnClick": {
//						"effect": "linear",
//						"speed": 400,
//						"size": 8
//					}
//				},
//				"misc": {
//					"gradient": {
//						"enabled": true,
//						"percentage": 100
//					}
//				}
//			});
//			
//			
//		},
		addScrollBar : function(){
             $('.custom-scroll-dash').slimScroll({
                 height: '133px',
                 width: '100%',
                 alwaysVisible: true,
                 railColor: '#000',
                 railVisible: true
             });
             $('.custom-scroll-dash2').slimScroll({
                 height: '200px',
                 width: '100%',
                 alwaysVisible: true,
                 railColor: '#000',
                 railVisible: true
             });
         },
         showAssetSearchPage : function(evt){
       	  var target=$(evt.target);
       	  var type=target.data('type');
       	  var val=target.data('val');
       	      	  
       	  if(!app.myAssetsView){
   	    		 app.myAssetsView=new myAssetsView({collection:new myAssetsCollection()});
   			}
//   	  app.myAssetsView.render2(val,type,self.assetManagerId,self.propertyManager,self.hil);
       	  app.myAssetsView.val=val;
       	  app.myAssetsView.type=type;
//        app.assetManagerId=self.assetManagerId;
       	  app.myAssetsView.showRender2=true;
         }
	});
	return assetDashboardView;
});