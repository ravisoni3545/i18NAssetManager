define([
"backbone",
"app",
"text!templates/propertyFinancialCalDetail.html",
"models/propertyModel",
"models/listingModel",
"business/FinancialCalculatorUtil",
"accounting",
], function(Backbone,app,propertyFinancialCalDetailTpl,propertyModel,listingModel,CalculatorUtil,accounting){
	var financialReturnsCalculatorDetailView = Backbone.View.extend({

		initialize: function(){
			_.bindAll(this);
		},
		el:"#financialCal",
    template: _.template(propertyFinancialCalDetailTpl),
		model:listingModel,
	    events: {
            'keyup .calc-input-field': 'calculateFinanceReturns',
            'click #reset_financial_calc': 'resetFinancialCalc',
            'click #export_excel' : 'export2excel'
        },
	     render : function (options) {
	    	 this.fetchFinancialsData(app.listingModel.toJSON().listingDetails);
	     	return this;
	    },
	    fetchFinancialsData : function(data){
	    	var self=this;
	    	var obj={};
			var propertyInput={};
			propertyInput.hil=data.hil;
			propertyInput.source=data.source;
			propertyInput.propertyTypeCode=data.propertyTypeCode;
			propertyInput.price=data.askingPrice;
			propertyInput.rehabCost=data.rehabEstimate;
			propertyInput.rent=data.leasedRent;
			propertyInput.tax=data.propertyTaxesAnnual;
			propertyInput.insurance=data.propertyInsuranceAnnual;
			propertyInput.hoa=data.hoaFeeAnnual;
			propertyInput.zillowAppreciation=data.appreciationRate;
			propertyInput.calculationFreezeDate=data.calculationFreezeDate;
			var userInput={};
			obj.propertyInput=propertyInput;
			obj.userInput=userInput;
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
	    	  $.ajax({
	                url: app.context()+ "/property/getfinancialsDetails",
	                contentType: 'application/json',
	                dataType:'json',
	                async:true,
	                data: JSON.stringify(obj),
	                type: 'POST',
	                success: function(res){
	                	$.unblockUI();
	                	if(res.successFlag){
	                		self.template = _.template( propertyFinancialCalDetailTpl );
	                		self.$el.html("");
	                		self.$el.html(self.template({theData:res,tblpropertyPropertyid:data.tblpropertyPropertyid,input:obj,accounting:accounting}));
	                		$(".currency").formatCurrency({symbol:""});
	                		app.currencyFormatter();
	                	}else{
	                		console.log("error response:"+res.errorMsg);
	                		self.$el.html("");
	                		self.$el.html("<div class='pad_top30'><span class='font18' style='color: #a94442;'>Failed to get Financials Details : "+res.errorMsg+"</span></div>");
	                	}
	                },
	                error: function(res){
	                	$.unblockUI();
	                	self.$el.html("");
	                	self.$el.html("<div class='col-md-4'></div><div class='col-md-5 pad_top30'><span class='font18' style='color: #a94442;'>Failed to get Financials Details</span></div>");
	                	console.log("Failed to make request for financialsData");
	                }
	            });
	    },
	    calculateFinancialsData : function(data){
	    	var self=this;
	    	var obj={};
			var propertyInput={};
			propertyInput.hil=data.hil;
			propertyInput.source=data.source;
			propertyInput.propertyTypeCode=data.propertyTypeCode;
			propertyInput.price=data.askingPrice;
			propertyInput.rehabCost=data.rehabEstimate;
			propertyInput.rent=data.leasedRent;
			propertyInput.tax=data.propertyTaxesAnnual;
			propertyInput.insurance=data.propertyInsuranceAnnual;
			propertyInput.hoa=data.hoaFeeAnnual;
			propertyInput.zillowAppreciation=data.appreciationRate;
			propertyInput.calculationFreezeDate=data.calculationFreezeDate;
			var userInput={};
			
			var text_price_val = $('#text_price_val').val();
			var text_closing_val = $('#text_closing_val').val();
			var text_rehab_val = $('#text_rehab_val').val();
			var text_rent_val = $('#text_rent_val').val();
			var text_property_tax = $('#text_property_tax').val();
			var text_financing_insurance = $('#text_financing_insurance').val();
			var text_financing_hoa = $('#text_financing_hoa').val();
			var txtMaintenanceProvision = $('#txtMaintenanceProvision').val();
			var txtVacancyProvision = $('#txtVacancyProvision').val();
			
			var text_downpayment_val = $('#text_downpayment_val').val();
			var text_rate_val = $('#text_rate_val').val();
			var text_terms_val = $('#text_terms_val').val();
			
			propertyInput.price=text_price_val;
			propertyInput.rehabCost=text_rehab_val;
			propertyInput.rent=text_rent_val;
			propertyInput.tax=text_property_tax;
			propertyInput.insurance=text_financing_insurance;
			propertyInput.hoa=text_financing_hoa;
			//commenting now since it is 1.5% of purchase price
		//	userInput.closingCostPercent=(text_closing_val*100)/text_price_val;
			
			userInput.repairAndMaintenanceFeePercent=txtMaintenanceProvision;
			userInput.vacancyPercent=txtVacancyProvision;
			userInput.downpaymentPercent=text_downpayment_val;
			userInput.interestRate=text_rate_val;
			userInput.loanTerm=text_terms_val*12;
			 
			obj.propertyInput=propertyInput;
			obj.userInput=userInput;
			
	    	  $.ajax({
	                url: app.context()+ "/property/getfinancialsDetails",
	                contentType: 'application/json',
	                dataType:'json',
	                async:true,
	                data: JSON.stringify(obj),
	                type: 'POST',
	                success: function(res){
	                	if(res.successFlag){
	                			$("#price_val").text(accounting.formatMoney(res.financedProjection.price,"$",0));
		                		$("#price_val1").text(accounting.formatMoney(res.allCashProjection.price,"$",0));
		                		
		                		$("#closing_val").text(accounting.formatMoney(res.financedProjection.closingCost,"$",2));
		                		$("#closing_val1").text(accounting.formatMoney(res.allCashProjection.closingCost,"$",2));
		                		
		                		$("#rehab_val").text(accounting.formatMoney(res.financedProjection.rehabCost,"$",2));
		                		$("#rehab_val1").text(accounting.formatMoney(res.allCashProjection.rehabCost,"$",2));
		                		
		                		
		                		$("#loan_fee_cost").text(accounting.formatMoney(res.financedProjection.loanFee,"$",2));
		                		$("#loan_fee_cost1").text(accounting.formatMoney(res.allCashProjection.loanFee,"$",2));
		                		$("#acquisition_fee").text(accounting.formatMoney(res.financedProjection.acquisitionFee,"$",2));
		                		$("#acquisition_fee1").text(accounting.formatMoney(res.allCashProjection.acquisitionFee,"$",2));
		                		$("#repair_maintainance_reserve").text(accounting.formatMoney(res.financedProjection.repairAndMaintenanceReserve,"$",2));
		                		$("#repair_maintainance_reserve1").text(accounting.formatMoney(res.allCashProjection.repairAndMaintenanceReserve,"$",2));
		                		
		                		
		                		
		                		
		                		$("#invest_val").text(accounting.formatMoney(res.financedProjection.investment,"$",0));
		                		$("#invest_val1").text(accounting.formatMoney(res.allCashProjection.investment,"$",0));
		                		
		                		$("#loan_val").text(accounting.formatMoney(res.financedProjection.loanAmount,"$",0));
		                		
		                		$("#financing_rent_val").text(accounting.formatMoney(res.financedProjection.rentalIncome.average,"$",0));
		                		$("#withoutfinancing_rent_val").text(accounting.formatMoney(res.allCashProjection.rentalIncome.average,"$",0));
		                		
		                		$("#less_expense_val").html('<span style="color:#ff0000;">'+accounting.formatMoney(res.financedProjection.totalExpenses.average,{symbol:"$", format:"%s (%v)",precision:0})+'</span>');
		                		$("#less_expense_val1").html('<span style="color:#ff0000;">'+accounting.formatMoney(res.allCashProjection.totalExpenses.average,{symbol:"$", format:"%s (%v)",precision:0})+'</span>');
		                		
		                		$("#ynoi").text(accounting.formatMoney(res.financedProjection.netOperatingIncome.average,"$",0));
		                		$("#ynoi1").text(accounting.formatMoney(res.allCashProjection.netOperatingIncome.average,"$",0));
		                		
		                		$("#less_intrest").html('<span style="color:#ff0000;">'+accounting.formatMoney(res.financedProjection.loanInterest.average,{symbol:"$", format:"%s (%v)",precision:0})+'</span>');
		                		
		                		$("#net_income").text(accounting.formatMoney(res.financedProjection.netIncome.average,"$",0));
		                		$("#net_income1").text(accounting.formatMoney(res.allCashProjection.netIncome.average,"$",0));
		                		
		                		$("#returnPercentage").text(accounting.formatNumber(res.financedProjection.yield.average,2)+"%");
		                		$("#returnPercentage1").text(accounting.formatNumber(res.allCashProjection.yield.average,2)+"%");
		                		
		                		
		                		$("#principla_paydown_val").text(accounting.formatMoney(res.financedProjection.loanPaydown.average,"$",0));
		                		
		                		$("#yearly_cash_flow").text(accounting.formatMoney(res.financedProjection.cashflow.average,"$",0));
		                		$("#yearly_cash_flow1").text(accounting.formatMoney(res.allCashProjection.cashflow.average,"$",0));
		                		
		                		$("#financing_property_tax").text(accounting.formatMoney(res.financedProjection.propertyTax.average,"$",0));
		                		$("#withoutfinancing_property_tax").text(accounting.formatMoney(res.allCashProjection.propertyTax.average,"$",0));
		                		
		                		$("#financing_insurance").text(accounting.formatMoney(res.financedProjection.propertyInsurance.average,"$",0));
		                		$("#withoutfinancing_insurance").text(accounting.formatMoney(res.allCashProjection.propertyInsurance.average,"$",0));
		                		
		                		$("#financing_hoa").text(accounting.formatMoney(res.financedProjection.hoa.average,"$",0));
		                		$("#withoutfinancing_hoa").text(accounting.formatMoney(res.allCashProjection.hoa.average,"$",0));
		                		
		                		$("#financing_leasing_fee").text(accounting.formatMoney(res.financedProjection.leasingFee.average,"$",0));
		                		$("#withoutfinancing_leasing_fee").text(accounting.formatMoney(res.allCashProjection.leasingFee.average,"$",0));
		                		
		                		
		                		$("#financing_amf").text(accounting.formatMoney(res.financedProjection.assetManagementFee.average,"$",0));
		                		$("#withoutfinancing_amf").text(accounting.formatMoney(res.allCashProjection.assetManagementFee.average,"$",0));
		                		
		                		
		                		$("#financing_maintenanceprovision").text(accounting.formatMoney(res.financedProjection.repairAndMaintenanceFee.average,"$",0));
		                		$("#withoutfinancing_maintenanceprovision").text(accounting.formatMoney(res.allCashProjection.repairAndMaintenanceFee.average,"$",0));
		                		
		                		$("#financing_vacancyprovision").text(accounting.formatMoney(res.financedProjection.vacancyLoss.average,"$",0));
		                		$("#withoutfinancing_vacancyprovision").text(accounting.formatMoney(res.allCashProjection.vacancyLoss.average,"$",0));
		                		
		                		$("#financing_tep").text(accounting.formatMoney(res.financedProjection.totalExpenses.average,"$",0));
		                		$("#withoutfinancing_tep").text(accounting.formatMoney(res.allCashProjection.totalExpenses.average,"$",0));
		                		
		                		$("#financing_downpayment_val").text(accounting.formatNumber(res.financedProjection.downpaymentPercent,2)+"%");
		                		$("#downpayment_amount").text(accounting.formatMoney(res.financedProjection.downpaymentAmount,"$",0));
		                		$("#loan_val2").text(accounting.formatMoney(res.financedProjection.loanAmount,"$",0));
		                		$("#rate_val").text(accounting.formatNumber(res.financedProjection.interestRate,2)+"%");
		                		
		                		$("#terms_val").text(accounting.formatNumber(res.financedProjection.loanTerm/12,0));
		                		$("#pi_yearly").text(accounting.formatMoney(res.financedProjection.principalAndInterest,"$",0));
		                		$("#pi_year").text(accounting.formatMoney(res.financedProjection.loanInterest.yearlyValues[0],"$",0));
		                		
		                		
		                		
	                		}else{
	                			console.log("Failed to recalculate financials for input changes"+res.errorMsg);
	    	  					//alert(res.errorMsg);
	                		}
	                },
	                error: function(res){
	                	console.log("Failed to make request for financialsData");
	                }
	            });
	    },
      calculateFinanceReturns: function(evt) {
    	  var self=this;
          //$(".calc-input-field").formatCurrency({roundToDecimalPlace: 2});
           //$(this).val().formatCurrency({roundToDecimalPlace: 2});
           var curr_el = $(evt.target);
           var curr_val = curr_el.val();
           var closing_flag = 0;

          /* if(curr_el.hasClass('currency')){
                curr_el.toNumber().formatCurrency({roundToDecimalPlace: 0}); 
           }*/

           if(evt.target.id == "text_closing_val"){
              closing_flag = 1;
           }
               var down_p = $('.down_payment_ip').val();
               var m_provision_ip = $('.m_provision_ip').val();
               var v_provision_ip = $('.v_provision_ip').val();
               var rate_ip = $('.rate_ip').val();
               var text_terms_val = $('#text_terms_val').val();
               var text_closing_val = $('#text_closing_val').val();
               var text_price_val = $('#text_price_val').val();
               
               var err_count = 0;
               
               if(Number(text_closing_val) > Number(text_price_val)){
                   $('.text_closing_val').siblings('.calc_err').html('Closing Cost must be less than Price').show();
                   err_count ++;
               }else{
                   $('.text_closing_val').siblings('.calc_err').html("");
               }
               
               if((!(down_p>=20 && down_p <=90) || down_p=='')){
                   $('.down_payment_ip').siblings('.calc_err').html('Please enter a value between 20% and 90%.').show();
                   err_count ++;
               }else{
                   $('.down_payment_ip').siblings('.calc_err').html("");
               } 

              if((!(m_provision_ip>=0 && m_provision_ip <=20) || m_provision_ip=='')){
                   $('.m_provision_ip').siblings('.calc_err').html('Please enter a value between 0% and 20%.').show();
                    err_count ++;
               }else{
                   $('.m_provision_ip').siblings('.calc_err').html("");
               } 
               
                if((!(v_provision_ip>=0 && v_provision_ip <=100)|| v_provision_ip=='')){
                   $('.v_provision_ip').siblings('.calc_err').html('Please enter a value between 0% and 100%.').show();
                    err_count ++;
               }else{
                   $('.v_provision_ip').siblings('.calc_err').html("");
               } 
               
               if((!(rate_ip>=0 && rate_ip <=20))|| rate_ip==''){
                   $('.rate_ip').siblings('.calc_err').html('Please enter a value between 0% and 20%.').show();
                   err_count ++;
               }else{
                   $('.rate_ip').siblings('.calc_err').html("");
               }
               
               var regex_int = /^\d+$/;
              if((text_terms_val>=1) && (text_terms_val<=30)){
                   $('#text_terms_val').siblings('.calc_err').html("");
              }else{
                   $('#text_terms_val').siblings('.calc_err').html('Please enter a value between 1 and 30.').show();
                   err_count ++;
              }
              
           if( err_count ==0){
        	   self.calculateFinancialsData(app.listingModel.toJSON().listingDetails);
        	   /*CalculatorUtil.calculateFinanceReturns(
                  app.listingModel.toJSON().listingInfo.assetManagementFeeAnnual,
                  app.listingModel.toJSON().listingInfo.propertyManagementPercentage,
                  app.listingModel.toJSON().listingInfo.leasingFeeAnnualFrequency,
                  app.listingModel.toJSON().listingInfo.leasingFeeProportion,
                  closing_flag
               );*/
           }
           
      },
      resetFinancialCalc: function() {
             var from_page = null;
               if (app.from_page) {
                   from_page = app.from_page;
               }
               //console.log(app.listingModel.toJSON());
             //this.$el.html(this.template({ theData : app.listingModel.toJSON(),calculatorUtil:CalculatorUtil,accounting:accounting,lang_is_en:app.lang_is_en}));
               this.fetchFinancialsData(app.listingModel.toJSON().listingDetails);
            return this;
      },
      export2excel: function() {

        var tableList = [{"id":"finance1","title":"Investment Summary"},{"id":"finance2","title":"Annual Return Calculations"},{"id":"finance3","title":"Expenses"},{"id":"finance4","title":"Loan Term"}];
        var jsonString = this.table2Json(tableList);
        var postdata = {};
        postdata.dataStr = JSON.stringify(jsonString);
        var self = this;
        $.ajax({
            url: app.context()+'/financialCal/genHash',
                    contentType: 'application/json',
                    //async : false,
                    dataType:'json',
                    type: 'POST',
                    data: JSON.stringify(postdata),
                    success: function(res){
                      $("#export_link").attr("href","financialCal/dataExport2Excel/"+res.returnHash);
                      $("#export_link").get(0).click();

                    },
                    error: function(res){
                      console.log(res);
                      console.log('Error in creating export file.');
                    }
            
        });

      },
      table2Json: function(tableList) {
        
        var tableJson = [];
        $.each(tableList, function(klist,vlist){
            var trs = $("#"+tableList[klist]["id"]+" tbody tr");
            var tt = '';
            var obj = {};
            obj.title = {};
            obj.title.value = vlist.title;
            obj.title.style = "bold&size-14";
            obj["tbody"] = [];  
            trs.each(function(ktr,vtr){
                obj["tbody"][ktr] = [];
                $(this).find('td').each(function(ktd,vtd){
                  obj["tbody"][ktr][ktd] = [];
                  var v = {};
                  v.value = $.trim($(this).text());
                  if(ktr == 0 && v.value.length > 0)
                    v.style = "bold";
                  obj["tbody"][ktr][ktd] = v;
                });

            });
            tableJson[klist] = obj;
        });
        return tableJson;
      },
      tableToExcel: function(name) {
        var tables=[];
        $('div[id^="financialDetails"]').each(function(){
            console.log($(this).attr('id'));
            tables.push($(this).attr('id'));
        });

        var uri = 'data:application/vnd.ms-excel;base64,'
        , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>'
        , base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
        , format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }
        var i;
        completeTables=[];
        for (i = 0; i < tables.length; ++i) {
            var table = tables[i];
            completeTables.push($("#financialDetails"+i).html());
            console.log(completeTables);
        }
        if (!table.nodeType) table = table
            var ctx = {worksheet: name || 'Worksheet', table: completeTables}
            window.location.href = uri + base64(format(template, ctx))

        return window.location.href;
      }


	 });
	 return financialReturnsCalculatorDetailView;
});