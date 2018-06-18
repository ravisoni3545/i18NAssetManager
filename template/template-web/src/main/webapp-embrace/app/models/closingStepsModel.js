define([ "backbone", "app" ], function(Backbone, app) {
    var closingStepsModel = Backbone.Model.extend({

        initialize: function () {

        },
        defaults : {
            //investmentId : null,
        },
        url :function (){
            var gurl=app.context()+ "/closing";
            return gurl;
        },
        getClosingInfo: function(investmentId,callback){
            $.ajax({
                url: this.url()+'/'+investmentId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
//      updateClosingInfo: function(updateRequestData,callback){
//          var postdata = updateRequestData;
//          $.ajax({
//                url: this.url()+'/update',
//                contentType: 'application/json',
//                dataType:'json',
//                type: 'PUT',
//                data: JSON.stringify(postdata),
//                success: function(res){
//                  callback.success({},res);
//                },
//                error: function(res){
//                    callback.error({},res);
//                }
//            });
//        },
        cancelClosing: function(postdata,callback){
            $.ajax({
                url: this.url()+'/cancel',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                async: true,
                data: JSON.stringify(postdata),
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        completeClosing: function(object,objectId,callback){
            $.ajax({
                url: this.url()+'/complete'+'/'+object+'/'+objectId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: true,
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        submitTaskData: function(form,callback){
            form.attr("enctype","multipart/form-data");
            form.ajaxSubmit({
                url: this.url()+'/process',
                async:true,
                contentType: 'application/json',
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        loadTaskData: function(taskKey,object,objectId,callback){
            $.ajax({
                url: this.url()+'/task/'+object+'/'+objectId+'/'+taskKey,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        loadEachTaskDocument: function(taskKey,object,objectId,subTask,callback){
            $.ajax({
                url: this.url()+'/task/documents/'+object+'/'+objectId+'/'+taskKey+'/'+subTask,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        loadEachTaskMessage: function(taskKey,object,objectId,callback) {
            $.ajax({
                url: app.context()+'/messages/task/'+object+'/'+objectId+'/'+taskKey,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        loadAllMessagesAndDocuments: function(object,objectId,callback) {
            $.ajax({
                url:this.url()+'/tasks/allDocumentsAndMessages/'+object+'/'+objectId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        loadTaskSubObjectDocuments: function(taskKey,object,objectId,subObject,subObjectId,callback){
            $.ajax({
                url: this.url()+'/task/subObjectDocuments/'+object+'/'+objectId+'/'+taskKey+'/'+subObject+'/'+subObjectId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        
        loadTaskSubObjectMessages : function(taskKey,object,objectId,subObject,subObjectId,callback){
            $.ajax({
                url: app.context()+'/messages/subObjectMessages/'+object+'/'+objectId+'/'+taskKey+'/'+subObject+'/'+subObjectId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        submitRentalAgreementData:function(currentForm,callback){
            currentForm.attr("enctype","multipart/form-data");
            currentForm.ajaxSubmit({
                url: this.url()+'/submitRentalAgreement',
                async:true,
                success: function(res){
                    callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
            /*$.ajax({
                url: this.url()+'/complete1'+'/'+object+'/'+objectId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });*/
        },
        submitIlmInspectionCategoryData: function(currentForm,extraData,callback){
            currentForm.ajaxSubmit({
                url: this.url()+'/submitIlmInspectionCategoryData',
                async:true,
                data:extraData,
                success: function(res){
                    callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
        },
        submitSellerResponseForRepairs: function(postdata,callback){
             $.ajax({
                url: this.url()+'/submitSellerResponseForRepairs/',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                async: false,
                data: JSON.stringify(postdata),
                success: function(res){
                    callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
        },
        fetchIlmInspectionCategoryData: function(object,objectId,callback){
            $.ajax({
                url: this.url()+'/fetchIlmInspectionCategoryData/'+object+'/'+objectId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
        },
        fetchInspectionIssueSourcesData: function(callback){
            $.ajax({
                url: app.context()+'/code/all/ISSUE_SRC',
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
        },
        deleteInspectionIssue: function(inspectionIssueId,callback){
            $.ajax({
                    url: app.context()+'/closing/deleteInspectionIssue/'+inspectionIssueId,
                    contentType: 'application/json',
                    dataType:'json',
                    type: 'DELETE',
                    success: function(res){
                        callback.success(res);
                    },
                    error: function(res){
                        callback.error(res);
                    }
                });
        },
        submitInspectionResponseData: function(currentForm,extraData,callback){
            currentForm.ajaxSubmit({
                url: this.url()+'/submitInspectionResponseData',
                async:true,
                data:extraData,
                success: function(res){
                    callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
        },
        fetchAllInvestorsDetails: function(object,objectId,callback){
            $.ajax({
                url: app.context()+'/closing/fetchAllInvestorsDetails/'+object+'/'+objectId,
                async:false,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                success: function(res){
                    callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
       },
       submitAppointmentData: function(currentForm,extraData,callback){
    	   currentForm.attr("enctype","multipart/form-data");
           currentForm.ajaxSubmit({
               url: this.url()+'/submitClosingAppointment',
               async:true,
               data:extraData,
               success: function(res){
                   callback.success(res);
               },
               error: function(res){
                   callback.error(res);
               }
           });
       },
       deleteAppointment: function(appointmentId,callback){
           $.ajax({
                   url: app.context()+'/closing/deleteAppointment/'+appointmentId,
                   contentType: 'application/json',
                   dataType:'json',
                   type: 'DELETE',
                   success: function(res){
                       callback.success(res);
                   },
                   error: function(res){
                       callback.error(res);
                   }
               });
       },
       getAppointments : function(object,objectId,investorId,callback){
           $.ajax({
               url: app.context()+'/closing/getAppointments/'+object+'/'+objectId+'/'+investorId,
               contentType: 'application/json',
               dataType:'json',
               type: 'GET',
               async: false,
               success: function(res){
                   callback.success({},res);
               },
               error: function(res){
                   callback.error({},res);
               }
           });
       }

        
    });

    return closingStepsModel;
});
