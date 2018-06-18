define(["backbone","app","text!templates/closingDashboard.html","text!templates/closingDashboardData.html",
		"text!templates/closingDashboardDataNew.html","text!templates/closingDashboardPropertiesBox.html",
		"text!templates/closingDashboardUsersBox.html","views/myClosingView","collections/myClosingCollection",
        "jquery.slimscroll.min","flot","flot-pie","flot-resize","moment","fullcalendar"],
		function(Backbone,app,closingDashboardPage,closingDashboardDataPage,closingDashboardDataPageNew,
			closingDashboardPropertiesBox,closingDashboardUsersBox,myClosingView,myClosingCollection){
	var closingDashboardView=Backbone.View.extend({
		initialize: function(){

		},
		events : {
			'click .showClosings':'showClosingSearchPage',
			'click  .viewClosings':'showClosingSearchPageForViewMore',
			'change input[name=filter]':'getClosingsByFilter',
			'change input[name=status]':'getClosingsByStatus'
		},
		self:this,
		el:"#maincontainer",
		render : function () {
			var thisPtr = this;
			
			thisPtr.template = _.template(closingDashboardPage);
			thisPtr.$el.html("");
			this.$el.html(thisPtr.template({app:app}));
			self.userId="all";
			self.status="Closing";
			this.getDashBoardData();
//	        this.initCharts(self.dashboardResponse.statusProperties,self.dashboardResponse.zonalProperties);
			this.initCalendar();
			
			return this;
		},
		getDashBoardData : function(){
			var thisPtr = this;
			var dashboardEl = thisPtr.showDashboardData();
			thisPtr.showLoaderImage(dashboardEl);
			thisPtr.sentRequestForData();
		},
		showLoaderImage: function(dashboardEl){
			/*
			 *	Loading image height and width is hardcoded.
			 *	Current image is app.loading_img_base64_70x5.
			 *	Change the height and width if the image is changed.
			 */
			var imgHeight = 50;
			var imgWidth = 70;
			_.each(dashboardEl.find('.loading-dimmer'),function(dimmerEl){
				var top = 0, left = 0,
					parentHeight = parseInt($(dimmerEl).parent().find('.loading-dimmer-sibling').css('height')),
					parentWidth = parseInt($(dimmerEl).parent().find('.loading-dimmer-sibling').css('width'));
					/*imgHeight = parseInt($(dimmerEl).find('img').css('height')),
					imgWidth = parseInt($(dimmerEl).find('img').css('width'));*/
				top =  parentHeight/2 - imgHeight/2;
				left = 	parentWidth/2 - imgWidth/2;
				$(dimmerEl).css('top',top);			
				$(dimmerEl).css('left',left+5); //5px correction
			});
		},
		showDashboardData:function(){
			this.dashboardtemplate = _.template(closingDashboardDataPageNew);
	     	var dashboardEl = this.$el.find('#dashboardData');
	     	dashboardEl.html("");
			dashboardEl.html(this.dashboardtemplate({closingDashboardResponse:{}}));


			dashboardEl.find('.loading-dimmer-sibling').addClass('disable-field');
			var loadingImage = app.loading_img_base64_70x50;
			// var image  = '<img src='+loadingImage+' style="position:relative;left:0px;top:0px;">';
			var image  = '<img src='+loadingImage+'>';
			dashboardEl.find('.loading-dimmer').html(image);

            /*this.dashboardtemplate = _.template(closingDashboardDataPage);
	     	var dashboardEl = this.$el.find('#dashboardData');
	     	dashboardEl.html("");
			dashboardEl.html(this.dashboardtemplate({closingDashboardResponse:self.dashboardResponse}));*/
			$(".amount").formatCurrency({roundToDecimalPlace: 0});
			this.addScrollBar();
			if(self.status=='Completed') {
				$('.dashboard-stat.blue a').bind('click', false);
				$('.dashboard-stat.blue a').fadeTo(1000, 0.2);
				$('.dashboard-stat.blue a').css('cursor', 'default');
				$('.dashboard-stat.green a').bind('click', false);
				$('.dashboard-stat.green a').fadeTo(1000, 0.2);
				$('.dashboard-stat.green a').css('cursor', 'default');
			} else {
				$('.dashboard-stat.blue a').bind('click', true);
				$('.dashboard-stat.blue a').fadeTo(1000, 1);
				$('.dashboard-stat.blue a').css('cursor', 'pointer');
				$('.dashboard-stat.green a').bind('click', true);
				$('.dashboard-stat.green a').fadeTo(1000, 1);
				$('.dashboard-stat.green a').css('cursor', 'pointer');
			}

			return dashboardEl;
		},
		loadDashboardStat: function(res, id, isAmount){
			var thisPtr = this;
			var requiredEl = thisPtr.$el.find('#'+id);
			requiredEl.find(".loading-dimmer-set-value").text(res);
			if(isAmount){
				requiredEl.find(".loading-dimmer-set-value").formatCurrency({roundToDecimalPlace: 0});	
			}
			thisPtr.removeDimmer(requiredEl);
		},
		loadDashboardPropertiesBox: function(res, id, dataType){
			var thisPtr = this;
			var template = _.template(closingDashboardPropertiesBox)({dataArray:res,dataType:dataType});
			var requiredEl = thisPtr.$el.find('#'+id);
			requiredEl.html(template);
			thisPtr.removeDimmer(requiredEl);
		},
		loadDashboardUsersBox: function(res, id, dataType){
			var thisPtr = this;
			var template = _.template(closingDashboardUsersBox)({dataArray:res,dataType:dataType});
			var requiredEl = thisPtr.$el.find('#'+id);
			requiredEl.html(template);
			thisPtr.removeDimmer(requiredEl);
		},
		removeDimmer: function(requiredEl){
			requiredEl.removeClass('disable-field');
			requiredEl.closest('.loading-dimmer-parent').find('.loading-dimmer').remove();
		},
		sentRequestForData:function(){
			var thisPtr = this;
  			self.dashboardResponse = {};
  			/*
  			 *	Using promise below to synchronise all ajax. 
  			 *	The purpose is to call some functions which need the complete data available.
  			 */
			$.when(
				thisPtr.getClosingProperties(),
				thisPtr.getCurrentMonthProperties(),
				thisPtr.getTotalInvestment(),
				thisPtr.getTotalRevenue(),
				thisPtr.getClosingDurationProperties(),
				thisPtr.getFinancialTypeProperties(),
				thisPtr.getDealTypeProperties(),
				thisPtr.getCloserProperties(),
				thisPtr.getIlmProperties(),
				thisPtr.getSSProperties()
            ).then( 
            	function(){
            		thisPtr.addScrollBar();
            	}, 
            	function(){
            		console.log("Failed to fetch all dashboard data.");
            		//self.dashboardResponse = null;
            		thisPtr.showDashboardFailure();
            	}
        	);

        	/*
        	 * 	Old code below
        	 */
        	/*
        	$.ajax({
                url: 'closingDashboard/get/'+self.userId+'/'+self.status,
                dataType:'json',
                type: 'GET',
                async:true,
                success: function(res){
                	self.dashboardResponse =res;
                	thisPtr.showDashboardData();
               },
                error: function(res){
                   self.dashboardResponse = null;
                   thisPtr.showDashboardFailure();
                }
            });
			*/
		},
		getClosingsByFilter:function(evt){
			userId=$(evt.currentTarget).val();
			self.userId=userId;
			this.getDashBoardData();
			if (userId!='all'){
				this.myClosingsCalendarSource.url = this.myClosingsCalendarSource.url.replace('{userId}',userId);
				this.calendar.fullCalendar('removeEvents');
				this.calendar.fullCalendar('removeEventSource',this.allClosingsCalendarSource.url);
				this.calendar.fullCalendar('removeEventSource',this.myClosingsCalendarSource.url);
				if(this.calendar.fullCalendar( 'clientEvents') == "") {
					this.calendar.fullCalendar( 'addEventSource', this.myClosingsCalendarSource.url );
				}
				//this.calendar.fullCalendar( 'refetchEvents' );
                                  
            } else {
            	this.calendar.fullCalendar('removeEvents');
				this.calendar.fullCalendar('removeEventSource',this.allClosingsCalendarSource.url);
				this.calendar.fullCalendar('removeEventSource',this.myClosingsCalendarSource.url);
				if(this.calendar.fullCalendar( 'clientEvents') == "") {
					this.calendar.fullCalendar( 'addEventSource', this.allClosingsCalendarSource.url );
				}
				//this.calendar.fullCalendar( 'refetchEvents' );
            }
		},
		getClosingsByStatus:function(evt){
			self.status=$(evt.currentTarget).val();
			this.getDashBoardData();
		},
		showDashboardFailure : function(){
		   $('#dashboardFailure').show();
		   App.scrollTo($('#dashboardFailure'), -200);
//		   $('#dashboardFailure').delay(2000).fadeOut(2000);
		},
		initCharts :function(data,data2){
			var self =this;

			$.plot('#pie_chart_3', data, {
//		        series: {
//		            pie: {
//		                show: true,
//		                radius: 1,
//		                label: {
//		                    show: true,
//		                    radius: 3/4,
//		                    formatter: self.labelFormatter,
//		                    background: {
//		                        opacity: 0.5
//		                    }
//		                }
//		            }
//		        },
//		        legend: {
//		            show: false
//		        }
				series: {
			        pie: {
			            show: true,
			            radius: 3/4
			        }
			    }
		    });
			
		    $.plot('#pie_chart_4', data2, {
//		        series: {
//		            pie: {
//		                show: true,
//		                radius: 1,
//		                label: {
//		                    show: true,
//		                    radius: 3/4,
//		                    formatter: self.labelFormatter,
//		                    background: {
//		                        opacity: 0.5
//		                    }
//		                }
//		            }
//		        },
//		        legend: {
//		            show: false
//		        }
		    	series: {
			        pie: {
			            show: true,
			            radius: 3/4
			        }
			    }
		    });
		},

	    labelFormatter: function(label, series) {
	        return "<div style='font-size:8pt; text-align:center; padding:2px; color:white;'>" + label + "<br/>" + Math.round(series.percent) + "%</div>";
	    },
	    
		initCalendar :function(){
            if (!jQuery().fullCalendar) {
                return;
            }

            var date = new Date();
            var d = date.getDate();
            var m = date.getMonth();
            var y = date.getFullYear();

            var h = {};

            if ($('#calendar').width() <= 400) {
                $('#calendar').addClass("mobile");
                h = {
                    left: 'title, prev, next',
                    center: '',
                    right: 'today,month,agendaWeek,agendaDay'
                };
            } else {
                $('#calendar').removeClass("mobile");
//                if (App.isRTL()) {
//                    h = {
//                        right: 'title',
//                        center: '',
//                        left: 'prev,next,today,month,agendaWeek,agendaDay'
//                    };
//                } else {
                    h = {
                        left: 'title',
                        center: '',
                        right: 'prev,next,today,month,agendaWeek,agendaDay'
                    };
//                }
            }
            
            this.allClosingsCalendarSource = {
    			url: 'closingDashboard/getCalendarData',
    	        type: 'GET'
            };
            var allClosingsCalendarSource = this.allClosingsCalendarSource;
            
            this.myClosingsCalendarSource = {
                url: 'closingDashboard/getCalendarData/{userId}',
                type: 'GET'
    		};
            
            $('#calendar').fullCalendar('destroy'); // destroy the calendar
            this.calendar = $('#calendar').fullCalendar({ //re-initialize the calendar
                disableDragging: false,
                header: h,
                editable: true,
                eventRender: function(copiedEventObject,element) {
                    var icon = $(document.createElement('div'));
                    icon.css('background-image',"url(HU-favicon.png)");
                    element.find('.fc-content').html('<a href="#closing/'+copiedEventObject.investmentId+'"><p style="text-decoration:'+copiedEventObject.textDecoration+'"><font color="'+copiedEventObject.color+'"><i class="fa fa-clock-o marg_right5 marg_left5"></i>'+copiedEventObject.investorName+':'+copiedEventObject.title+'</font></p></a>');
                },
//                events:  {
//    	            url: 'closingDashboard/getCalendarData',
//    	            type: 'GET'
//                },
                eventSources: [ allClosingsCalendarSource ],
                eventMouseover: function(calEvent, jsEvent) {
                    var tooltip = '<div class="tooltipevent" style="padding:10px; width:200px;height:100px;background:#000000;color:#fff;position:absolute;z-index:10001;">' + '<b><i class="fa fa-clock-o"></i> ' + calEvent.title +': '+'</b>' + calEvent.status +'<div><b>Status: </b>'+calEvent.description+'</div></div>';
                    $("body").append(tooltip);
                    $(this).mouseover(function(e) {
                        $(this).css('z-index', 10000);
                        $('.tooltipevent').fadeIn('500');
                        $('.tooltipevent').fadeTo('10', 1.9);
                    }).mousemove(function(e) {
                        $('.tooltipevent').css('top', e.pageY + 20);
                        $('.tooltipevent').css('left', e.pageX - 70);
                    });
                },

                eventMouseout: function(calEvent, jsEvent) {
                    $(this).css('z-index', 8);
                    $('.tooltipevent').remove();
                },
                eventClick:  function(calEvent, jsEvent) {
                	$('.tooltipevent').remove();
                }
            });

		},
		addScrollBar : function(){

             $('.custom-scroll-dash').slimScroll({
                 height: '133px',
                 width: '100%',
                 alwaysVisible: true,
                 railColor: '#000',
                 railVisible: true
             });


         },
         
      showClosingSearchPage : function(evt){
    	  var target=$(evt.target);
    	  var type=target.data('type');
    	  var val=target.parent().parent().find('.sale-info').text().trim();
    	      	  
    	  if(!app.myClosingView){
	    		 app.myClosingView=new myClosingView({collection:new myClosingCollection()});
			}
	    	app.myClosingView.render2(val,type,self.userId,self.status); 
      },
      
      showClosingSearchPageForViewMore : function(evt){
    	  var target = $(evt.target);
    	  var val={};
    	  var type=target.data('type');
    	  
    	  if(!app.myClosingView){
	    		 app.myClosingView=new myClosingView({collection:new myClosingCollection()});
			}
	    	app.myClosingView.render2(val,type,self.userId,self.status); 
      },
      getClosingProperties: function(){
      	var thisPtr = this;
      	return $.ajax({
            url: 'closingDashboard/getClosingProperties/'+self.userId+'/'+self.status,
            dataType:'json',
            type: 'GET',
            async:true,
            success: function(res){
            	self.dashboardResponse.closingProperties =res;
            	thisPtr.loadDashboardStat(res,"closedProperties",false);
           },
            error: function(res){
               self.dashboardResponse.closingProperties = null;
            }
        });
      },
      getCurrentMonthProperties: function(){
      	var thisPtr = this;
      	return $.ajax({
            url: 'closingDashboard/getCurrentMonthProperties/'+self.userId+'/'+self.status,
            dataType:'json',
            type: 'GET',
            async:true,
            success: function(res){
            	self.dashboardResponse.currentMonthProperties =res;
            	thisPtr.loadDashboardStat(res,"closingScheduled",false);
           	},
            error: function(res){
               self.dashboardResponse.currentMonthProperties = null;
            }
        });
      },
      getTotalInvestment: function(){
      	var thisPtr = this;
  	 	return $.ajax({
            url: 'closingDashboard/getTotalInvestment/'+self.userId+'/'+self.status,
            dataType:'json',
            type: 'GET',
            async:true,
            success: function(res){
            	self.dashboardResponse.totalInvestment =res;
            	thisPtr.loadDashboardStat(res,"totalInvestment",true);
           	},
            error: function(res){
               self.dashboardResponse.totalInvestment = null;
            }
        });
      },
      getTotalRevenue: function(){
      	var thisPtr = this;
        return $.ajax({
            url: 'closingDashboard/getTotalRevenue/'+self.userId+'/'+self.status,
            dataType:'json',
            type: 'GET',
            async:true,
            success: function(res){
            	self.dashboardResponse.totalRevenue =res;
            	thisPtr.loadDashboardStat(res,"totalRevenue",true);
           	},
            error: function(res){
               	self.dashboardResponse.totalRevenue = null;
            }
        });
      },
   	  getClosingDurationProperties: function(){
      	var thisPtr = this;
        return $.ajax({
            url: 'closingDashboard/getClosingDurationProperties/'+self.userId,
            dataType:'json',
            type: 'GET',
            async:true,
            success: function(res){
            	self.dashboardResponse.closingDurationProperties =res;
            	thisPtr.loadDashboardPropertiesBox(res,"closingDuration","closingDuration");
           },
            error: function(res){
               self.dashboardResponse.closingDurationProperties = null;
            }
        });
      },
      getFinancialTypeProperties:function(){
      	var thisPtr = this;
      	return $.ajax({
            url: 'closingDashboard/getFinancialTypeProperties/'+self.userId+'/'+self.status,
            dataType:'json',
            type: 'GET',
            async:true,
            success: function(res){
            	self.dashboardResponse.financingTypeProperties =res;
            	thisPtr.loadDashboardPropertiesBox(res,"financingType","financingType");
           },
            error: function(res){
               self.dashboardResponse.financingTypeProperties = null;
            }
        });
      },
      getDealTypeProperties:function(){
      	var thisPtr = this;
      	return $.ajax({
            url: 'closingDashboard/getDealTypeProperties/'+self.userId+'/'+self.status,
            dataType:'json',
            type: 'GET',
            async:true,
            success: function(res){
            	self.dashboardResponse.dealTypeProperties =res;
            	thisPtr.loadDashboardPropertiesBox(res,"dealType","dealType");
           },
            error: function(res){
               self.dashboardResponse.dealTypeProperties = null;
            }
        });
      },
      getCloserProperties: function(){
      	var thisPtr = this;
      	return $.ajax({
            url: 'closingDashboard/getCloserProperties/'+self.userId+'/'+self.status,
            dataType:'json',
            type: 'GET',
            async:true,
            success: function(res){
            	self.dashboardResponse.closerProperties =res;
            	thisPtr.loadDashboardUsersBox(res,"closerProperties","closer");
           },
            error: function(res){
               self.dashboardResponse.closerProperties = null;
            }
        });
      },
      getIlmProperties:function(){
      	var thisPtr = this;
      	return $.ajax({
            url: 'closingDashboard/getIlmProperties/'+self.userId+'/'+self.status,
            dataType:'json',
            type: 'GET',
            async:true,
            success: function(res){
            	self.dashboardResponse.ilmProperties =res;
            	thisPtr.loadDashboardUsersBox(res,"ilmProperties","ilmProperties");
           },
            error: function(res){
               self.dashboardResponse.ilmProperties = null;
            }
        });
      },
      getSSProperties:function(){
      	var thisPtr = this;
      	return $.ajax({
            url: 'closingDashboard/getSSProperties/'+self.userId+'/'+self.status,
            dataType:'json',
            type: 'GET',
            async:true,
            success: function(res){
            	self.dashboardResponse.solutionSpecialistProperties =res;
            	thisPtr.loadDashboardUsersBox(res,"solutionSpecialistProperties","solutionSpecialistProperties");
           },
            error: function(res){
               self.dashboardResponse.solutionSpecialistProperties = null;
            }
        });
      }
	});
	return closingDashboardView;
});