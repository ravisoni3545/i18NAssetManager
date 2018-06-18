
/*
This is the main function which will return the data in required format.

GetDataForStackbarChart function returns an array which will be used as stackchart data source. Arrangement of data is such that all values will be available in an object array for each time period.
Required Inputs:
1. investAmount: amound which user wants to invest ($ amount, should be passed as value)
2. gReturn: gross return (just pass the value which will be % e.g. 7% should be passed as 7 and so on)
3. intRate: interest rate (in %)
4. loanAmount: Loan amount in case of leveraged and 0 in case of all cash

To calculate gross return % use the following formula
in case of leveraged: annual_noi/(Total Investment) where [Total Investment = investmentAmount + Loan amount]
in case of all cash: allcash_oncash_return
*/
define([],
    function () {
        return {
            calculateFinanceReturns: function (ann_mgmt_fee,prop_mgmt_percent,ann_lease_freq,lease_pro,cflag) {
//function GetDataForStackbarChart(investAmount, gReturn, intRate, loanAmount)
//{
                    //Property price 
                    var price = $("#text_price_val").val().replace(/,/g, "").replace("$", "");
                    price = parseFloat(price);
                    $("#price_val").text("$" + addCommas(Math.round(price)));
                    $("#price_val1").text("$" + addCommas(Math.round(price)));
                    //Property tax            
                    //Yearly
                    var propertTax = parseFloat($("#text_property_tax").val().replace(/,/g, "").replace("$", ""));
                    $("#financing_property_tax").text("$" + addCommas(Math.round(propertTax)));
                    $("#withoutfinancing_property_tax").text("$" + addCommas(Math.round(propertTax)));
                    //var propertTax = parseFloat($.trim($("#financing_property_tax").text()).substr(1).replace(/,/g,''));

                    //Property insurance
                    var insurance = parseFloat($("#text_financing_insurance").val().replace(/,/g, "").replace("$", ""));
                    $("#financing_insurance").text("$" + addCommas(Math.round(insurance)));
                    $("#withoutfinancing_insurance").text("$" + addCommas(Math.round(insurance)));
                    //var insurance = parseFloat($.trim($("#financing_insurance").text()).substr(1).replace(/,/g,''));
                    
                    //Property monthly rent
                    var rental_income = $("#text_rent_val").val().replace(/,/g, "").replace("$", "");
                    if (Trim(rental_income) == '')
                        rental_income = 0;

                    rental_income = parseFloat(rental_income);
                    $("#financing_rent_val").text("$" + addCommas(Math.round(rental_income)));
                    $("#withoutfinancing_rent_val").text("$" + addCommas(Math.round(rental_income)));
                    
                    //75 % of One Month Rent
/*                    var leasingfee = lease_fee; // was $("#financing_leasing_fee").text().replace(",", "").replace("$", "");
                    if (Trim(leasingfee) == '')
                        leasingfee = 0;        
                    leasingfee=parseFloat(leasingfee); */  
                    
                    var leasingfee = rental_income/12*ann_lease_freq*lease_pro/100;
                    $("#financing_leasing_fee").text("$" + addCommas(Math.round(leasingfee)));
                    $("#withoutfinancing_leasing_fee").text("$" + addCommas(Math.round(leasingfee)));
                   

                    //Property downpayment percent
                    var downpayment_val = $("#text_downpayment_val").val();
                    
                    if (Trim(downpayment_val) == '')
                        downpayment_val = 0;
                    
                    downpayment_val = parseFloat(downpayment_val);  
                    
                    //Rehab value
                    var rehab_val = $("#text_rehab_val").val().replace(/,/g, "").replace("$", "");
//                    console.log("rehab_val",rehab_val);
                    if (Trim(rehab_val) == '')
                        rehab_val = 0;

                    rehab_val = parseFloat(rehab_val);
                    $("#rehab_val").text("$" + addCommas(Math.round(rehab_val)));
                    $("#rehab_val1").text("$" + addCommas(Math.round(rehab_val)));
                              
                   //Down payment
                    var down_payment = price * (downpayment_val / 100);
//f                    down_payment = Math.round(down_payment);
                    $("#downpayment_amount").text("$" + addCommas(Math.round(down_payment)));
                    $("#financing_downpayment_val").text( addCommas(Math.round(downpayment_val))+"%");
                    $("#downpayment_val").text(addCommas(Math.round(down_payment))+"%");
                    //$("#text_closing_val").trigger('change');
                    //Closing cost

                    var closing_cost = parseFloat($.trim($("#closing_val").text()).substr(1).replace(/,/g,''));
                    var closing_cost1 = parseFloat($.trim($("#closing_val1").text()).substr(1).replace(/,/g,''));

                    if(cflag == 1){
                        var closing = $("#text_closing_val").val().replace(/,/g, "").replace("$", "");
                        $("#closing_val").text("$" + addCommas(Math.round(closing)));
                        $("#closing_val1").text("$" + addCommas(Math.round(closing)));
                    }
                    
        
                    //Investment with financing
                    var investment = down_payment + rehab_val + closing_cost;
//f                    investment = Math.round(investment);
//                    console.log("down_payment, rehab_val, closing_cost, investment",down_payment,rehab_val,closing_cost,investment);
                    $("#invest").text("$" + addCommas(Math.round(investment)));
                    $("#invest_val").text("$" + addCommas(Math.round(investment)));            

                    //Investment without financing
                    var investment_withoutfinancing = price + rehab_val + closing_cost1;
//f                    investment_withoutfinancing = Math.round(investment_withoutfinancing);
//                    console.log("price, rehab_val, closing_cost1, investment",price,rehab_val,closing_cost1,investment_withoutfinancing);
                    $("#invest_val1").text("$" + addCommas(Math.round(investment_withoutfinancing)));
                    
                    //Loan amount
                    var loanAmount = price - down_payment;
//f                    loanAmount = Math.round(loanAmount);
                    $("#loan_val2").text("$" + addCommas(Math.round(loanAmount)));
                    $("#loan_val").text("$" + addCommas(Math.round(loanAmount)));
                   
                    //Assesment managment fee
                    var assesment_management_fee = ((rental_income * parseFloat(prop_mgmt_percent)/100 ) + parseFloat(ann_mgmt_fee));//Yearly
//f                    assesment_management_fee = Math.round(assesment_management_fee);
                    $("#financing_amf").text("$" + addCommas(Math.round(assesment_management_fee)));
                    $("#withoutfinancing_amf").text("$" + addCommas(Math.round(assesment_management_fee)));

                    //Maintenance provision
                    var txtMaintenanceProvision = $("#txtMaintenanceProvision").val();
                    if (Trim(txtMaintenanceProvision) == "")
                        txtMaintenanceProvision = 0;

                    var maintenanceProvision = rental_income * (parseFloat(txtMaintenanceProvision) / 100);
//f                    maintenanceProvision = Math.round(maintenanceProvision);
                    $("#financing_maintenanceprovision").text("$" + addCommas(Math.round(maintenanceProvision)));
                    $("#withoutfinancing_maintenanceprovision").text("$" + addCommas(Math.round(maintenanceProvision)));

                    //Vacancy provision
                    var txtVacancyProvision = $("#txtVacancyProvision").val();
                    if (Trim(txtVacancyProvision) == "")
                        txtVacancyProvision = 0;

                    var vacancyProvision = rental_income * (parseFloat(txtVacancyProvision) / 100);
//f                    vacancyProvision = Math.round(vacancyProvision);
                    $("#financing_vacancyprovision").text("$" + addCommas(Math.round(vacancyProvision)));
                    $("#withoutfinancing_vacancyprovision").text("$" + addCommas(Math.round(vacancyProvision)));

                    //var hoa = $("#financing_hoa").text().replace(new RegExp(',','g'), "").replace("$", "");
                    var hoa = $("#text_financing_hoa").val().replace(/,/g, "").replace("$", "");
                    $("#financing_hoa").text("$" + addCommas(Math.round(hoa)));
                    $("#withoutfinancing_hoa").text("$" + addCommas(Math.round(hoa)));
                    if (Trim(hoa) == "")
                        hoa = 0;
                    
                    hoa = parseFloat(hoa);
                    
                    //Total expence and provision
                    var total_expenceandprovision = propertTax + hoa +insurance + leasingfee +assesment_management_fee + maintenanceProvision + vacancyProvision;
//console.log("propertTax,hoa +insurance,leasingfee +assesment_management_fee,maintenanceProvision,vacancyProvision",propertTax,hoa +insurance,leasingfee +assesment_management_fee,maintenanceProvision,vacancyProvision);
//f                    total_expenceandprovision = Math.round(total_expenceandprovision);
                    $("#financing_tep").text("$" + addCommas(Math.round(total_expenceandprovision)));
                    $("#withoutfinancing_tep").text("$" + addCommas(Math.round(total_expenceandprovision)));
                    $("#less_expense_val").text("$(" + addCommas(Math.round(total_expenceandprovision)) + ")");
                    $("#less_expense_val1").text("$(" + addCommas(Math.round(total_expenceandprovision)) + ")");            
                   
                    //Yearly net operating income
                    var monthlynetoperating_income = rental_income - total_expenceandprovision;            
                    $("#ynoi").text("$" + addCommas(Math.round(monthlynetoperating_income)));
                    $("#ynoi1").text("$" + addCommas(Math.round(monthlynetoperating_income)));            

                    //Interest rate
                    var rate = $("#text_rate_val").val();
                    if (Trim(rate) == '')
                        rate = 0;
                    
                    $("#rate_val").text(addCommas(rate)+"%");
                    rate=parseFloat(rate);
                    //Loan terms (month)    
                    var terms = $("#text_terms_val").val();
                    if (Trim(terms) == '')
                        terms = 30;
                    $("#terms_val").text(addCommas(terms));
                    terms=parseFloat(terms);
//                  console.log("rate,terms",rate,terms );
                    if (rate > 0 && terms > 0) {
                        //var rate_per_period = parseFloat(rate / 1200);
                        var rate_per_period = rate / 1200;
                        var num_of_payments = terms * 12;
                        var present_value1 = (1 - (downpayment_val / 100)) * price;
                        var future_value = 0;
                        var type = 0;

                        var pmt_value = PMT(rate_per_period, num_of_payments, present_value1, future_value, type);
                        pmt_value = -pmt_value;                
                        if (pmt_value > 0)
                            {
                                $("#pi_yearly").text("$" + addCommas(Math.round(pmt_value*12)));
                            }

                        var cumipmt_value = CUMIPMT(rate_per_period, num_of_payments, present_value1, 1, 12, 0)/12;//Yearly
                        cumipmt_value = -cumipmt_value;                
                        if (cumipmt_value > 0) {
//console.log("rate_per_period,num_of_payments,present_value1,pmt_value,cumipmt_value",rate_per_period,num_of_payments,present_value1,pmt_value,cumipmt_value);
                            $("#pi_year").text("$" + addCommas(Math.round(cumipmt_value*12)));
                            $("#less_intrest").text("$(" + addCommas(Math.round(cumipmt_value*12)) + ")");
                            $("#principla_paydown_val").text("$" + addCommas(Math.round((pmt_value - cumipmt_value)*12)));

                            //Set net income
                            var less_intrest = cumipmt_value*12;
                            var netincome = monthlynetoperating_income - less_intrest;                   
                            $("#net_income").text("$" + addCommas(Math.round(netincome)));
                            $("#net_income1").text("$" + addCommas(Math.round(monthlynetoperating_income)));
                           
                            //Set monthly cash flow
                            var monthly_cash_flow = Math.round(netincome) - Math.round((pmt_value - cumipmt_value)*12);
//f                            monthly_cash_flow = Math.round(monthly_cash_flow);
                            if (monthly_cash_flow > 0)
                                $("#yearly_cash_flow").text("$" + addCommas(Math.round(monthly_cash_flow)));

                            else if (monthly_cash_flow < 0)
                                $("#yearly_cash_flow").text("$(" + addCommas(Math.round(monthly_cash_flow)).replace("-", "") + ")");

                            $("#yearly_cash_flow1").text("$" + addCommas(Math.round(monthlynetoperating_income)));

                            //Set yearly cash flow
                            var cash_flow_yearly = monthly_cash_flow*12;//Yearly
                            if (cash_flow_yearly > 0)
                                $("#cashflow").text("$" + addCommas(Math.round(cash_flow_yearly)));

                            else if (cash_flow_yearly < 0)
                                $("#cashflow").text("$(" + addCommas(Math.round(cash_flow_yearly)).replace("-", "") + ")");

                            //Set return percentage
                            //var perReturn = ((netincome * 12) / investment) * 100;
                            var perReturn = (netincome / investment) * 100;//Yearly
                            var perReturn1 = (monthlynetoperating_income / investment_withoutfinancing) * 100;//Yearly
                            $("#returnPercentage").text(perReturn.toFixed(2) + "%");
                            $("#returnPercentage1").text(perReturn1.toFixed(2) + "%");
                            $("#return_value").text(perReturn.toFixed(2) + "%");
//console.log("less_intrest,netincome,monthly_cash_flow,cash_flow_yearly,perReturn,perReturn1",less_intrest,netincome,monthly_cash_flow,cash_flow_yearly,perReturn,perReturn1);
                        }
                    }
                //}
                
                function CUMIPMT(rate, periods, value, start, end, type) {
                    // Credits: algorithm inspired by Apache OpenOffice
                    // Credits: Hannes Stiebitzhofer for the translations of function and variable names
                    // Requires Formula.FV() and Formula.PMT() from Formula.js [http://stoic.com/formula/]

                    // Evaluate rate and periods (TODO: replace with secure expression evaluator)
//                    rate = eval(rate);
//                    periods = eval(periods);

                    // Return error if either rate, periods, or value are lower than or equal to zero
                    if (rate <= 0 || periods <= 0 || value <= 0) {
                        return '#NUM!';
                    }

                    // Return error if start < 1, end < 1, or start > end
                    if (start < 1 || end < 1 || start > end) {
                        return '#NUM!';
                    }

                    // Return error if type is neither 0 nor 1
                    if (type !== 0 && type !== 1) {
                        return '#NUM!';
                    }

                    // Compute cumulative interest
                    var payment = PMT(rate, periods, value, 0, type);
                    var interest = 0;

                    if (start === 1) {
                        if (type === 0) {
                            interest = -value;
                            start++;
                        }
                    }

                    for (var i = start; i <= end; i++) {
                        if (type === 1) {
                            interest += FV(rate, i - 2, payment, value, 1) - payment;
                        } else {
                            interest += FV(rate, i - 1, payment, value, 0);
                        }
                    }
                    interest *= rate;

                    // Return cumulative interest
                    return interest;
                }

                function PMT(rate, periods, present, future, type) {
                    // Credits: algorithm inspired by Apache OpenOffice

                    // Initialize type
                    type = (typeof type === 'undefined') ? 0 : type;

                    // Evaluate rate and periods (TODO: replace with secure expression evaluator)
//                    rate = eval(rate);
//                    periods = eval(periods);

                    // Return payment
                    var result;
                    if (rate === 0) {
                        result = (present + future) / periods;
                    } else {
                        var term = Math.pow(1 + rate, periods);
                        if (type === 1) {
                            result = (future * rate / (term - 1) + present * rate / (1 - 1 / term)) / (1 + rate);
                        } else {
                            result = future * rate / (term - 1) + present * rate / (1 - 1 / term);
                        }
                    }
                    return -result;
                }

                function FV(rate, periods, payment, value, type) {
                    // Credits: algorithm inspired by Apache OpenOffice

                    // Initialize type
                    type = (typeof type === 'undefined') ? 0 : type;

                    // Evaluate rate (TODO: replace with secure expression evaluator)
//                    rate = eval(rate);

                    // Return future value
                    var result;
                    if (rate === 0) {
                        result = value + payment * periods;
                    } else {
                        var term = Math.pow(1 + rate, periods);
                        if (type === 1) {
                            result = value * term + payment * (1 + rate) * (term - 1.0) / rate;
                        } else {
                            result = value * term + payment * (term - 1) / rate;
                        }
                    }
                    return -result;
                }

                function CUMPRINC(rate, periods, value, start, end, type) {
                    // Credits: algorithm inspired by Apache OpenOffice
                    // Credits: Hannes Stiebitzhofer for the translations of function and variable names
                    // Requires Formula.FV() and Formula.PMT() from Formula.js [http://stoic.com/formula/]

                    // Evaluate rate and periods (TODO: replace with secure expression evaluator)
//                    rate = eval(rate);
//                    periods = eval(periods);

                    // Return error if either rate, periods, or value are lower than or equal to zero
                    if (rate <= 0 || periods <= 0 || value <= 0) {
                        return '#NUM!';
                    }

                    // Return error if start < 1, end < 1, or start > end
                    if (start < 1 || end < 1 || start > end) {
                        return '#NUM!';
                    }

                    // Return error if type is neither 0 nor 1
                    if (type !== 0 && type !== 1) {
                        return '#NUM!';
                    }

                    // Compute cumulative principal
                    var payment = PMT(rate, periods, value, 0, type);
                    var principal = 0;
                    if (start === 1) {
                        if (type === 0) {
                            principal = payment + value * rate;
                        } else {
                            principal = payment;
                        }
                        start++;
                    }
                    for (var i = start; i <= end; i++) {
                        if (type > 0) {
                            principal += payment - (FV(rate, i - 2, payment, value, 1) - payment) * rate;
                        } else {
                            principal += payment - FV(rate, i - 1, payment, value, 0) * rate;
                        }
                    }

                    // Return cumulative principal
                    return principal;
                }

                //Add commas
                function addCommas(nStr) {
                    nStr += '';
                    x = nStr.split('.');
                    x1 = x[0];
                    x2 = x.length > 1 ? '.' + x[1] : '';
                    var rgx = /(\d+)(\d{3})/;
                    while (rgx.test(x1)) {
                        x1 = x1.replace(rgx, '$1' + ',' + '$2');
                    }
                    return x1 + x2;
                }

                function formatNumber (num) {
                    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
                }

                //Trim string
                function Trim(stringToTrim) {
                    return stringToTrim.replace(/^\s+|\s+$/g, "");
                }

                function isNumberKey(evt) {
                    var charCode = (evt.which) ? evt.which : event.keyCode
                    if (charCode > 31 && (charCode < 48 || charCode > 57))
                        return false;

                    return true;
                }

                function isNumberKeyWithDecimal(evt) {
                    var charCode = (evt.which) ? evt.which : event.keyCode
                    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                        if (charCode === 46) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        return true;
                    }
                }
                
                return ;

            }
        }
    });