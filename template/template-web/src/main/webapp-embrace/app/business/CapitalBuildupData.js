
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
            getDataForStackbarChart: function (investAmount, gReturn, intRate, loanAmount) {
//function GetDataForStackbarChart(investAmount, gReturn, intRate, loanAmount)
//{
//    debugger;
            var inputdata = new Array();
            var investmentAmt = investAmount;
                investmentAmt= parseFloat(investmentAmt.replace(/,/g, ''));
            var grossReturn = gReturn;
            var capitalAppreciation = 0;
            var inerestRate = intRate;
            var term = 5;    
                grossReturn = grossReturn/100;
                capitalAppreciation = capitalAppreciation/100;
                inerestRate = inerestRate/100;

            var loans=loanAmount;
            var totalInvestment =(parseFloat(investmentAmt) + parseFloat(loans)).toFixed(0);

                inputdata[0]=investmentAmt;
                inputdata[1]=grossReturn;
                inputdata[2]=capitalAppreciation;
                inputdata[3]=inerestRate;
                inputdata[4]=term;
                inputdata[5]=0;
                inputdata[6]=loans;
                inputdata[7]=totalInvestment;     
      
//    return ProcessInvestmentData(inputdata);
//}

/*
This is privately used function by GetDataForStackBarChart. It is reponsible for calculating cash flows, leveraged return and equity buildup.
*/
function ProcessInvestmentData(inputData)
{
    var inputdataArr = new Array();
    inputdataArr=inputData;
    investmentAmt= inputdataArr[0];
    grossReturn=inputdataArr[1];
    capitalAppreciation=inputdataArr[2];
    inerestRate=inputdataArr[3];
    term=inputdataArr[4];    
    loans=inputdataArr[6];
    totalInvestment=inputdataArr[7];
    
    var ir=inerestRate/12;
    var np= 360;// term*12;
    var pv=-loans;
    var fv=0;
    var ty=0;
    var pmt=PMT (ir, np, pv, fv,ty );
    pmt=pmt*12;
    
    investmentAmt=parseFloat(investmentAmt);
    totalInvestment=parseFloat(totalInvestment.replace(/,/g, ''));
    
   
    var LeveragedScenArr = [[],[],[],[],[],[],[],[],[],[],[],[],[]];
    var LeveragedArr = [[],[],[],[]];
    var DataArr = [[],[],[],[],[]];    
    var j=0;
    for (var i = 0; i < term; i++) 
    {    j=j+1;
        if(i==0)
        {    
       
               
        LeveragedScenArr[0][i]= parseFloat(totalInvestment);
        LeveragedScenArr[1][i]=LeveragedScenArr[0][i]*grossReturn;
        var start=j;
        var end=12*j;
        LeveragedScenArr[2][i]=CUMIPMT(ir, np, loans, start, end, 0);
        LeveragedScenArr[3][i]=pmt-LeveragedScenArr[2][i];
        LeveragedScenArr[4][i]=LeveragedScenArr[1][i]-LeveragedScenArr[2][i];
        LeveragedScenArr[5][i]=LeveragedScenArr[1][i]-pmt;
        LeveragedScenArr[6][i]=LeveragedScenArr[5][i];
        LeveragedScenArr[7][i]=investmentAmt;
        LeveragedScenArr[8][i]=LeveragedScenArr[3][i];
        LeveragedScenArr[9][i]=LeveragedScenArr[8][i];
        LeveragedScenArr[10][i]=eval(LeveragedScenArr[0][i]*capitalAppreciation);
        LeveragedScenArr[11][i]=LeveragedScenArr[10][i];
        LeveragedScenArr[12][i]=eval(LeveragedScenArr[0][i]+LeveragedScenArr[10][i]);        
        LeveragedArr[0][i]=investmentAmt;
        LeveragedArr[1][i]=LeveragedScenArr[6][i];
        LeveragedArr[2][i]=LeveragedScenArr[9][i];
        LeveragedArr[3][i]=LeveragedScenArr[11][i];        
        }
        else
        {
           LeveragedScenArr[0][i]=LeveragedScenArr[0][i-1];
           LeveragedScenArr[1][i]=LeveragedScenArr[0][i]*grossReturn;
           var start=12*i+1;
           var end=12*j;
           LeveragedScenArr[2][i]=CUMIPMT(ir, np, loans, start, end, 0);
           LeveragedScenArr[3][i]=pmt-LeveragedScenArr[2][i];
           LeveragedScenArr[4][i]=LeveragedScenArr[1][i]-LeveragedScenArr[2][i];
           LeveragedScenArr[5][i]=LeveragedScenArr[1][i]-pmt;
           LeveragedScenArr[6][i]=eval(LeveragedScenArr[6][i-1]+LeveragedScenArr[5][i]);
           LeveragedScenArr[7][i]=LeveragedScenArr[7][i-1];
           LeveragedScenArr[8][i]=LeveragedScenArr[3][i];
           LeveragedScenArr[9][i]=eval(LeveragedScenArr[9][i-1]+LeveragedScenArr[8][i]);
           LeveragedScenArr[10][i]=LeveragedScenArr[12][i-1]*capitalAppreciation;
           LeveragedScenArr[11][i]=eval(LeveragedScenArr[11][i-1]+LeveragedScenArr[10][i]);
           LeveragedScenArr[12][i]=eval(LeveragedScenArr[12][i-1]+LeveragedScenArr[10][i]);           
           LeveragedArr[0][i]=LeveragedArr[0][i-1];
           LeveragedArr[1][i]=LeveragedScenArr[6][i];
           LeveragedArr[2][i]=LeveragedScenArr[9][i];
           LeveragedArr[3][i]=LeveragedScenArr[11][i];
        }
    }
    
    var year=0;
    var i=0;
    var j=0;
    var k=0;
    var l=0;
    var x=0;
          
        //Fill data for start (0) year
        DataArr[0][l] = year;    
        DataArr[1][l] = LeveragedArr[0][x];
        DataArr[2][l] = 0;
        DataArr[3][l] = 0;
        DataArr[4][l] = 0;
        
        while(x<LeveragedArr[0].length)
        {
            year=year+1;
        
            if(year>0)
            {
                l+=1;
               
                DataArr[0][l] = year;    
                DataArr[1][l] = LeveragedArr[0][x];
                DataArr[2][l] = LeveragedArr[1][x];
                DataArr[3][l] = LeveragedArr[2][x];
                DataArr[4][l] = LeveragedArr[3][x];                            
            }
            x++;       
        }          
    
    return ConvertDataArrayAsObject(DataArr);
}

//This function converts data array similar to JSON format
function ConvertDataArrayAsObject(DataArr)
{
    var dataArr = new Array();
    for (i=0;i<DataArr[0].length;i++){
        var as_arr = new Object(); 
        as_arr['Year']= DataArr[0][i];
        as_arr['Investment'] = DataArr[1][i];
        as_arr['Capital appreciation'] = DataArr[4][i];
        as_arr['Cash flows'] = DataArr[2][i];
        as_arr['Equity build up'] = DataArr[3][i];
        dataArr[i] = as_arr;
     }    
     return dataArr;
}

//Financial function to calculate loan payment on the basis of constant payments and constant interst
function PMT (ir, np, pv, fv,ty ) {
            if (( np == 0 ) || ( pv == 0 )){ return(0);}
           else{pmt = -((ir * (fv + Math.pow(1 + ir,np) * pv))/(-1 + Math.pow(1 + ir,np)));return pmt;}
        }
        
//Calculate cumulative interests between two payment term
 function CUMIPMT (rate, periods, value, start, end, type) {
       
    rate = eval(rate);
    periods = eval(periods);
  
    if (rate <= 0 || periods <= 0 || value <= 0) {
      return(0);
    }

    if (start < 1 || end < 1 || start > end) {
      return(0);
    }

    if (type !== 0 && type !== 1) {
      return(0);
    }

    // Compute cumulative interest
    var payment = PMT(rate, periods, value, 0, 0);
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
    return -interest;
  };
  
  //Calculates future value depends on payment, rate, period etc.
  function FV(rate, periods, payment, value, type) {
    
    type = (typeof type === 'undefined') ? 0 : type;

     rate = eval(rate);

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
  };
  
   return ProcessInvestmentData(inputdata);

            }
        }
    });