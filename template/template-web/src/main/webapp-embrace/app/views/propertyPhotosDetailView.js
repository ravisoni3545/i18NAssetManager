define([
"backbone",
"app",
"text!templates/propertyDetailsPhotoCarousel.html",
"models/propertyModel",
"models/listingModel",
"models/propertyPreselectModel",
"accounting",
"jcarousel",
"SecurityUtil"
], function(Backbone,app,propertyPhotosDetailTpl,propertyModel,listingModel, propertyPreselectModel,accounting,jcarousel, securityUtil){
	var propertyPhotosDetailView = Backbone.View.extend({

		initialize: function(){
             _.bindAll(this);
              window.successFunction = this.successFunction;
             this.loadScript('https://maps.googleapis.com/maps/api/js?v=3&sensor=false&callback=successFunction',
              function(){console.log('google-loader has been loaded, but not the maps-API ');});

            var propertyManagement=["PropertyManagement"];
            var propertyDetailEdit=["PropertyDetailEdit"];
            this.viewpermissions = {'propertyManagement':securityUtil.isAuthorised(propertyManagement, app.sessionModel.attributes.permissions),'propertyDetailEdit':securityUtil.isAuthorised(propertyDetailEdit, app.sessionModel.attributes.permissions)};
            
            if(!app.propertyModel){
                app.propertyModel = new propertyModel();
            }

            if(!app.propertyPreselectModel){
                app.propertyPreselectModel = new propertyPreselectModel();

            }
            if(!app.listingModel){
                app.listingModel = new listingModel();
            }
            var photoLinks;
            var tourLinks;
            var videoLinks;
            this.apilink = app.context() + 'listing/photos/add';
            var vidDisabled = false;
            var tourDisabled = false;

		 },
		 el:"#propertyPhotosTab",
		 model:propertyModel,
		 events          : {
            "click li[data-target-item=photo]"          : "showPhotosTab",
            "click li[data-target-item=video]"          : "showVideosTab",
            "click li[data-target-item=map]"            : "showMapTab",
            //"click li[data-target-item=street_view]"    : "showStreetViewTab",
            "click li[data-target-item=tour]"           : "showToursTab",
            "click button[name=addFilesBtn]"            : "addFiles",
            "click a[name=toggleShowOnWeb]"             : "editShowOnWeb",
            "click a[name=makeDefaultPhoto]"            : "preparePhotoForDefault",
            "click a[name=deletePhotoBtn]"              : "preparePhotoforDelete",
            "click button[name=deletePhotoConfirm]"     : "deleteSelectedPhoto",
            "click button[name=defaultPhotoConfirm]"    : "editDefaultPhoto"
	     },
	     render : function (options) {
 
          this.propertyId = options.propertyId;

            app.propertyModel.set({"propertyId":options.propertyId});
            app.propertyModel.fetch({async:false});
            app.listingModel.set({"propertyId":options.propertyId, urlParam:"byProperty"});
            app.listingModel.fetch({async:false});
            app.propertyPreselectModel.set({"propertyId":options.propertyId});
            app.propertyPreselectModel.fetch({async:false});
            this.photoCount = app.listingModel.toJSON().iTotalRecords;
            console.log("photoCount: " + this.photoCount);
            var vidnav;
            var tournav;
            var preSelectMediaLinks;
            var preSelectId;

            if(app.propertyPreselectModel.toJSON().huselect != null)
                {
                this.huSelectId = app.propertyPreselectModel.toJSON().huselect.selectId;
                preSelectId=this.huSelectId;
                app.propertyPreselectModel.set({"huSelectId" : this.huSelectId});
                console.log("property is preselected");
                console.log("preselectId: " + this.huSelectId);
                 app.propertyPreselectModel.getPreselectMedia('photo',{
                    success: function(res){
                        
                       if(res.photoLinks===null){
                            photoLinks =[];
                       }
                       else{
                            photoLinks = res.photoLinks;
                       }                       
                    },
                    error: function(res){
                        console.log(res);
                        console.log("error in getting photos");
                    }
                 });

                 app.propertyPreselectModel.getPreselectMedia('tour',{
                    success: function(res){
                       
                        if(res.tourLinks===null){
                            tourLinks =[];
                       }
                       else{
                            tourLinks = res.tourLinks;
                       }                       
                        
                    },
                    error: function(res){
                        console.log(res);
                        console.log("error in getting tours");
                    }
                 });

                 app.propertyPreselectModel.getPreselectMedia('video',{
                    success: function(res){
                       
                       if(res.videoLinks===null){
                            videoLinks =[];
                       }
                       else{
                            videoLinks = res.videoLinks;
                       }                       
                    },
                    error: function(res){
                        console.log(res);
                        console.log("error in getting videos");
                    }
                 });
                
                preSelectMediaLinks = options.filter=="photo"? photoLinks : options.filter=="video"? videoLinks : tourLinks;

                     vidnav = (videoLinks === null || Object.keys(videoLinks).length===0)? "disabled" : "";
                     tournav = (tourLinks === null ||Object.keys(tourLinks).length===0)? "disabled" : "";
                     vidDisabled = (videoLinks === null || Object.keys(videoLinks).length==0)? true : false;
                     tourDisabled = (tourLinks === null ||Object.keys(tourLinks).length===0)? true : false;
            } else{
                console.log("not preselected");
                console.log("app.propertyPreselectModel: " + app.propertyPreselectModel.toJSON());
                vidnav = "disabled";
                vidDisabled = true;
                tournav = "disabled";
                tourDisabled = true;  
            }

            

	     	if(!app.listingModel){
	     		app.listingModel = new listingModel();
	     		app.listingModel.set({propertyId:options.propertyId,urlParam:"byProperty"});
	     		app.listingModel.fetch({async:false});
	     	}
        
           
        

	    	this.template = _.template( propertyPhotosDetailTpl );
	     	this.$el.html("");
	     	this.$el.html(this.template({ viewpermissions:this.viewpermissions, apiLink:this.apilink,preSelectMedia:preSelectMediaLinks,dataCar:app.listingModel.toJSON().listingPhotos, filter:options.filter, vidNavClass:vidnav, tourNavClass:tournav, propId:this.propertyId,isPreSelect:preSelectId}));
            this.addJcar();
            if(this.viewpermissions.propertyManagement )
            {
                this.showDataTable();
                $('#editNotes').show();
            }
           
	     	return this;
	    },
        editShowOnWeb : function(evt){
            var self=this;
            console.log("sow");
            console.log("showOnWebChanged for photo: " + $(evt.target).attr("photo-id"));
             var data = {};
            data["photoid"]=$(evt.target).attr('photo-id');
            //toggle show on web value
            data["showonWeb"] = ($(evt.target).attr('showonWeb') === '1')?0:1;
           

            app.listingModel.toggleShowOnWeb(data, {
                success: function(res){
                    console.log("success");
                    self.render({"filter":"photo","propertyId":self.propertyId});

                },
                error: function(res){
                    console.log("error: " + res);
                }
            });
        },
        preparePhotoForDefault : function(evt){
              // console.log("dfc");
            // console.log("defaultPhotoChanged for photo: " + $(evt.target).attr("photo-id"));
            this.photoToMakeDefualt=$(evt.target).attr('photo-id');
        },
        editDefaultPhoto : function(){
           
            var self=this;
            var data = {};
            data["photoid"]= self.photoToMakeDefualt;
            data["propertyId"]= self.propertyId;
           
            app.listingModel.makeDefaultPhoto(data, {
                success: function(res){
                    console.log("success");
                    self.render({"filter":"photo","propertyId":self.propertyId});

                },
                error: function(res){
                    console.log("error: " + res);
                }
            });
           // $('#deletePhotoConfirmationModal').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove(); 
        },
        preparePhotoforDelete : function(evt){
             console.log("delPhoto");
             console.log("photoToDelete: " +  $(evt.target).attr('photo-id'));
            this.photoToDelete = $(evt.target).attr('photo-id');

           
            
        },
        deleteSelectedPhoto: function(){
            var self=this;
            var data = {};
            data["photoid"]=self.photoToDelete;
            
          
            app.listingModel.deletePhoto(data, {
                success: function(res){
                    console.log("success");
                    self.render({"filter":"photo","propertyId":self.propertyId});
                },
                error: function(res){
                    console.log("error: " + res);
                }
            });
             $('body').removeClass('modal-open');
            $('.modal-backdrop').remove(); 
        },
     
        showDataTable : function(){
            var self = this;
            var model = app.listingModel;
            var preSelect=null;     
             if(app.propertyPreselectModel.toJSON().huselect!=null){       
               preSelect= app.propertyPreselectModel.toJSON().huselect.selectId;       
             }
            var url = app.context()+"/listing/"+((model.get("urlParam") == null || model.get("urlParam") == '')?"":model.get("urlParam")+"/")+((model.get("urlParam") == null || model.get("urlParam") == '')?encodeURIComponent(model.get("listingId")):encodeURIComponent(model.get("propertyId")));
            var formatDate = function(date){
           var d = new Date(date),
            dformat = [ d.getFullYear(),
            (("00" + (d.getMonth()+1))).slice(-2),
                        d.getDate(),
                        ].join('-')+
                        ' ' +
                      [ ("00" + d.getHours()).slice(-2),
                        ("00" + d.getMinutes()).slice(-2),
                        ("00" + d.getSeconds()).slice(-2)].join(':');
            return dformat;
        };
            console.log("url: " + url);
            console.log("photocount show data table: " + this.photoCount);
            // ----------------------------DataTable
            // start-----------------------------------
            var oTable = $('#photoDetailTable').dataTable(
                            {
                                "bServerSide" : false,
                                "bProcessing" : true,
                                "bFilter": false,
                                //"scrollY" : "300px",
                                //"scrollX" : "100%",
                                "sAjaxSource" : app.context()+"/listing/"+((model.get("urlParam") == null || model.get("urlParam") == '')?"":model.get("urlParam")+"/")+((model.get("urlParam") == null || model.get("urlParam") == '')?encodeURIComponent(model.get("listingId")):encodeURIComponent(model.get("propertyId"))),
                                "sAjaxData" : 'aaData',
                                //"pagingType" : "simple",
                                "sServerMethod":"GET",
                                "oLanguage" : {
                                    "sLengthMenu" : "_MENU_ records",
                                    "sZeroRecords" : "No matching records found",
                                    "sInfo" : "Showing _START_ to _END_ of _TOTAL_ entries",
                                    "sInfoEmpty" : "No records available",
                                    "sInfoFiltered" : "(filtered from _MAX_ total entries)",
                                },

                                "aoColumns" : [
                                        {
                                            "mData" : "photoid",
                                            "sTitle" : "Action"
                                        },
                                        {
                                            "mData" : "thumbnailLink",
                                            "sTitle" : "Thumbnail"
                                        },{
                                            "mData" : "dateCreated",
                                            "sTitle" : "Created Date"
                                        },{
                                            "mData" : "dateModified",
                                            "sTitle" : "Last Modified Date"
                                        },{
                                            "mData" : "modifiedBy",
                                            "sTitle" : "Last Modified By"
                                        },{
                                            "mData" : "showonWeb",
                                            "sTitle" : "Show On Web"
                                        },{
                                            "mData" : "defaultImage",
                                            "sTitle" : "Default Image"
                                        }],

                                "aoColumnDefs" : [
                                        
                                        {
                                            "aTargets" : [ 0 ],
                                            "bSortable": false,
                                            "mRender" : function(
                                                    data, type,
                                                    full) {
                                                    var webLi = '';
                                                    var defaultLi = '';
                                                    var deleteLi = '';

                                                    //not shown on web and able to delete
                                                    if(full.showonWeb === 0)
                                                    {
                                                        webLi = '<li><a name="toggleShowOnWeb" photo-id="'+full.photoid+'" showonWeb="'+full.showonWeb+'" class="btn btn-xs blue textalignleft"> <i class="fa fa-toggle-on"></i> Toggle Show On Web</a></li>';
                                                        deleteLi = '<li><a name="deletePhotoBtn" href="#deletePhotoConfirmationModal" data-toggle="modal" photo-id="'+full.photoid+'"  class="btn btn-xs red textalignleft"> <i class="fa fa-trash-o"></i> Delete Photo</a></li>';

                                                    //shown on web
                                                    }
                                                    else
                                                    {                                                          
                                                        //only allow image to be deleted if its not default
                                                        //only allow to show default image if the image is shown on web
                                                        if(full.defaultImage === 0)
                                                        {
                                                            webLi = '<li><a name="toggleShowOnWeb" photo-id="'+full.photoid+'" showonWeb="'+full.showonWeb+'" class="btn btn-xs blue textalignleft"> <i class="fa fa-toggle-off"></i> Toggle Show On Web</a></li>';
                                                            defaultLi = '<li><a name="makeDefaultPhoto" href="#defaultPhotoConfirmationModal" data-toggle="modal" photo-id="'+full.photoid+'"  class="btn btn-xs purple textalignleft"> <i class="fa fa-toggle-on"></i>Make Default Photo</a></li>';
                                                            deleteLi = '<li><a name="deletePhotoBtn" href="#deletePhotoConfirmationModal" data-toggle="modal" photo-id="'+full.photoid+'"  class="btn btn-xs red textalignleft"> <i class="fa fa-trash-o"></i> Delete Photo</a></li>';

                                                        }
                                                        else
                                                        {
                                                            //allow to delete default image if there is only one record and its the default image
                                                            if(model.toJSON().iTotalRecords === 1)
                                                            {
                                                                deleteLi = '<li><a name="deletePhotoBtn" href="#deletePhotoConfirmationModal" data-toggle="modal" photo-id="'+full.photoid+'"  class="btn btn-xs red textalignleft"> <i class="fa fa-trash-o"></i> Delete Photo</a></li>';

                                                            }
                                                            else
                                                            {
                                                                defaultLi = '<div class="alert alert-danger">You must select another default before modifying this photo.</div>';
                                                            }  
                                                        }
                                                    }
                                                return '<div class="btn-group" style="text-align:left!important;">'
                                                        +'<button data-toggle="dropdown" class="btn dropdown-toggle gear2button myaction" type="button"><i class="fa fa-gear"></i></button>'
                                                        +'<ul photo-id="'+full.photoid+'" role="menu" class="dropdown-menu" style="margin-left:30px!important;margin-top:-20px!important; padding:5px; ">'
                                                        + deleteLi
                                                        + webLi
                                                        + defaultLi
                                                        +'</ul></div>';
                                            }
                                        },
                                        {
                                            "aTargets": [ 1 ],
                                            "bSortable":false,
                                            "mRender" : function(
                                                    data, type,
                                                    full) {
                                                return '<div class="pull-left preselectOverlay">'
                                                +'<img src="'+full.thumbnailLink+'"></img>'+(full.isPreSelect?'<div class="preselect-ico"><img src="assets/img/been.png"></div>':"")+'</div>';

                                            }


                                        },
                                     
                                        {
                                            "aTargets": [ 2 ],
                                            "mRender" : function(
                                                    data, type,
                                                    full) {
                                                if(full.dateCreated !== null)
                                                    {
                                                       return formatDate(full.dateCreated);
                                                    }
                                                else
                                                    return "";
                                            }


                                        },
                                        {
                                            "aTargets": [ 3 ],
                                            "mRender" : function(
                                                    data, type,
                                                    full) {
                                                if(full.dateModified !== null)
                                                    return formatDate(full.dateModified);
                                                else
                                                    return "";
                                            }


                                        },
                                        {
                                            "aTargets": [ 5 ],
                                            "mRender" : function(
                                                    data, type,
                                                    full) {
                                                if(full.showonWeb === 0)
                                                    return 'No';
                                                else
                                                    return 'Yes';
                                            }


                                        },
                                        {
                                            "aTargets": [ 6 ],
                                            "mRender" : function(
                                                    data, type,
                                                    full) {
                                                 if(full.defaultImage === 1)
                                                    return 'Yes';
                                                else
                                                    return 'No';
                                            }


                                        }
                                           
                                ],


                            });
            $('select[name="photoDetailTable_length"]').addClass("form-control");
        },
        successFunction : function(){
            console.log("success gmaps function");
        },
        loadScript : function(src,callback){
            var script = document.createElement("script");
            script.type = "text/javascript";
            if(callback)script.onload=callback;
            document.getElementsByTagName("head")[0].appendChild(script);
            script.src = src;
          
        },
        addFiles : function(){
            var self = this;
            console.log('add files');
            var options = { 
                target: '#response', 
                url:        this.apilink,
                success:    function() { 
                    console.log('success in uploading photos');
                },
                error: function(){
                    console.log("error in uploading photos");
                } 
            };
             
            $('#uploadForm').ajaxForm(function(options) { 
                console.log("success");
                self.render({"propertyId":self.propertyId, filter:"photo"});
            }); 
            $('#fileuploadbox').show();
        },
        addJcar: function() {
            console.log("addJCAR");

            var connector = function(itemNavigation, carouselStage) {
                return carouselStage.jcarousel('items').eq(itemNavigation.index());
            };


            // Setup the carousels. Adjust the options for both carousels here.
            var carouselStage = $('.carousel-stage').jcarousel({
                wrap: 'circular'
            });

            var carouselNavigation = $('.carousel-navigation').jcarousel({
                start:1,
            });

            // We loop through the items of the navigation carousel and set it up
            // as a control for an item from the stage carousel.
            carouselNavigation.jcarousel('items').each(function() {
                var item = $(this);

                // This is where we actually connect to items.
                var target = connector(item, carouselStage);

                item
                        .on('jcarouselcontrol:active', function() {
                            carouselNavigation.jcarousel('scrollIntoView', this);
                            item.addClass('active');
                        })
                        .on('jcarouselcontrol:inactive', function() {
                            item.removeClass('active');
                        })
                        .jcarouselControl({
                            target: target,
                            carousel: carouselStage
                        });
            });

            // Setup controls for the stage carousel
            $('.prev-stage')
                    .on('jcarouselcontrol:inactive', function() {
                        $(this).addClass('inactive');
                    })
                    .on('jcarouselcontrol:active', function() {
                        $(this).removeClass('inactive');
                    })
                    .jcarouselControl({
                        target: '-=1'
                    });

            $('.next-stage')
                    .on('jcarouselcontrol:inactive', function() {
                        $(this).addClass('inactive');
                    })
                    .on('jcarouselcontrol:active', function() {
                        $(this).removeClass('inactive');
                    })
                    .jcarouselControl({
                        target: '+=1'
                    });

            // Setup controls for the navigation carousel
            $('.prev-navigation')
                    .on('jcarouselcontrol:inactive', function() {
                        $(this).addClass('inactive');
                    })
                    .on('jcarouselcontrol:active', function() {
                        $(this).removeClass('inactive');
                    })
                    .jcarouselControl({
                        target: '-=1'
                    });

            $('.next-navigation')
                    .on('jcarouselcontrol:inactive', function() {
                        $(this).addClass('inactive');
                    })
                    .on('jcarouselcontrol:active', function() {
                        $(this).removeClass('inactive');
                    })
                    .jcarouselControl({
                        target: '+=1'
                    });
                    //issue with carousel starting on second element
                    $('#leftcar').click();
        },
        showVideosTab : function(){

            if(!vidDisabled){
            var self = this;
            //console.log('videos Tab');
            self.render({"propertyId":self.propertyId,"filter":"video"});
        }else{
            //console.log("disabled");
        }

        },
        showToursTab : function(){
                 if(!tourDisabled){
             var self = this;
            //console.log('tours Tab');
            self.render({"propertyId":self.propertyId,"filter":"tour"});
        }else{
            //console.log("tours 0 disabled");
        }

        },
        showMapTab : function(){
            console.log('show map Tab');
            var self= this;
           self.render({"propertyId":self.propertyId,"filter":"map"});
           this.showPlainMap();

        },
        showStreetViewTab : function(){
            console.log('show street view tab');
            var self=this;
            self.render({"propertyId":self.propertyId,"filter":"street"});
            this.showPanoView();
        },
        showPhotosTab: function(){
           if(app.listingModel.toJSON().listingPhotos && app.listingModel.toJSON().listingPhotos !== undefined)
           { 
               if(Object.keys(app.listingModel.toJSON().listingPhotos).length != 0){            
                     var self = this;
                    console.log('photos Tab');
                    self.render({"propertyId":self.propertyId,"filter":"photo"});
                }
                else
                {
                    //console.log("disabled");
                }
            }
        },
         loadStreetView: function() {
            var self = this;
            var req = require;
            req(['async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true&libraries=places'],
                    function() {
                        console.log('gmaps loaded');
                        self.showPanoView();
                        self.showPlainMap();
//                        self.showStreetView();
                    });
        },
        loadMap : function(){
            window.showPlainMap = this.showPlainMap;
            this.loadScript('https://maps.googleapis.com/maps/api/js?v=3&sensor=false&callback=-ction',
              function(){console.log('google-loader has been loaded, but not the maps-API ');});
        },
        loadStreetView : function(){
             window.showPanoView = this.showPanoView;
            this.loadScript('https://maps.googleapis.com/maps/api/js?v=3&sensor=false&callback=showPanoView',
              function(){console.log('google-loader has been loaded, but not the maps-API ');});
        },
        showPlainMap : function(){
       var geocoder = new google.maps.Geocoder();
            geocoder.geocode({'address': app.propertyModel.toJSON().propertyFullAddress}, function(results, status) {
            var self = this;
            var mapCanvas = document.getElementById('plain-map');
            var lat = results[0].geometry.location.lat();
            var lng = results[0].geometry.location.lng();
            console.log("lat/lng: " + lat + " / " + lng);


            if (lat != null && lng != null) {
                myLatlng = new google.maps.LatLng(lat, lng);
                var mapOptions = {
                    center: myLatlng,
                    zoom: 12,
                    zoomControlOptions: {
                        style: google.maps.ZoomControlStyle.SMALL,
                        position: google.maps.ControlPosition.RIGHT_BOTTOM
                    },
                    styles: [{
                        "featureType": "all",
                        "stylers": [{
                            "weight" : 1.5
                        },{
                            "saturation": 90
                        }, /*{"hue": "#e7ecf0"}*/ ]
                    }, {
                        "featureType": "road",
                        "stylers": [{
                            "saturation": -70
                        }]
                    }, {
                        "featureType": "transit",
                        "stylers": [{
                            "visibility": "on"
                        }]
                    }, {
                        "featureType": "poi",
                        "stylers": [{
                            "visibility": "off"
                        }]
                    }, {
                        "featureType": "water",
                        "stylers": [{
                            "visibility": "simplified"
                        }, {
                            "saturation": -60
                        }]
                    }],
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    scrollwheel: false
                };

                map = new google.maps.Map(mapCanvas, mapOptions);
                // To add the marker to the map, use the 'map' property
                var marker = new google.maps.Marker({
                    position: myLatlng,
                    map: map,
                    title: "Property Location"
                });

            }
            google.maps.event.trigger(map, 'resize');

        });

        },
        loadGmapScripts: function() {
            var self = this;
            var reqq = require;
            reqq(['async!https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,places&sensor=false'],
                function() {
                    console.log('gmaps loaded');
                    reqq(['app/business/gmap.inverted.circle.js'],
                       function() {
                        console.log('Inverted function loaded');
                        self.renderGmap();
                     });
                });
        },
        renderGmap: function() {
            var self = this;
            var mapCanvas = document.getElementById('map');
            
 //           var lat = app.propertyModel.get('latitude'), lng = app.propertyModel.get('longitude');
                var lat = this.model[0].lat,lng = this.model[0].lng;
//              console.log("lat long"+lat+" "+lng);
//            var lat = 30.18, lng = -81.75;
                 var radius = 5000;

            if (lat != null && lng != null) {
                myLatlng = new google.maps.LatLng(lat, lng);
                var mapOptions = {
                    center: myLatlng,
                    zoom: 12,
                    zoomControlOptions: {
                        style: google.maps.ZoomControlStyle.SMALL,
                        position: google.maps.ControlPosition.RIGHT_BOTTOM
                    },
                    styles: [{
                        "featureType": "all",
                        "stylers": [{
                            "weight" : 1.5
                        },{
                            "saturation": 90
                        }, /*{"hue": "#e7ecf0"}*/ ]
                    }, {
                        "featureType": "road",
                        "stylers": [{
                            "saturation": -70
                        }]
                    }, {
                        "featureType": "transit",
                        "stylers": [{
                            "visibility": "on"
                        }]
                    }, {
                        "featureType": "poi",
                        "stylers": [{
                            "visibility": "off"
                        }]
                    }, {
                        "featureType": "water",
                        "stylers": [{
                            "visibility": "simplified"
                        }, {
                            "saturation": -60
                        }]
                    }],
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    scrollwheel: false
                };


                map = new google.maps.Map(mapCanvas, mapOptions);
                // To add the marker to the map, use the 'map' property
                var marker = new google.maps.Marker({
                    position: myLatlng,
                    map: map,
                    title: "Property Location"
                });
                
                    placeCircle = new InvertedCircle({
                    center: myLatlng,
                    map: map,
                    radius: radius,
                    editable: true,
                    stroke_weight: 2,
                    always_fit_to_map: false,
                    resize_updown: 'assets/img/resize_updown.png',
                    resize_leftright:  'assets/img/resize_leftright.png'
                });

                

                google.maps.event.addListener(placeCircle, 'radius_changed', function () {
                    if (placeCircle.getDragging() == false ){
                        console.log("distance Changed -- "+ this.getRadius());
                        /*map.fitBounds(placeCircle.getBounds());*/
                        radius = this.getRadius();
                        if(options.length > 0){
                            self.clearMarkers(options);
                            self.findlocalPlaces(myLatlng, this.getRadius(), options);
                            if($.inArray("major-employer2", options) !== -1){
                                self.getEmployers(myLatlng, placeCircle.getRadius());
                            }
                            if($.inArray("Starbucks", options) !== -1) {
                                self.getLocations("Starbucks");
                            }
                            if($.inArray("Walmart", options) !== -1) {
                                self.getLocations("Walmart");
                            }
                        }
                    }
                });  
                
                if (!app.propertyDetailModel) {
                    app.propertyDetailModel = new PropertyDetailModel();
                }
                app.propertyDetailModel.getPropertyGeom();
                var geom =  app.propertyDetailModel.geom;

              
                if(geom !=null){
                var geom_temp = geom.replace("MULTIPOLYGON(((", "").replace(")))", "");
                var geom_arr = geom_temp.split(',');
                    var arrayLength = geom_arr.length;
                    var polyCoords = [];
                    for (var i = 0; i < arrayLength; i++) {
                        var latlang = geom_arr[i].split(" ");
                        polyCoords.push(new google.maps.LatLng(latlang[1], latlang[0]));
                    }
                    
                polygonMap = new google.maps.Polygon({
                    paths: polyCoords,
                    strokeColor: '#416984',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#ABDDE9',
                    fillOpacity: 0.35
                });
                
                polygonMap.setMap(map);
            }

            }
            google.maps.event.trigger(map, 'resize');
        },
        showStreetView: function() {
            
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({'address': app.propertyModel.toJSON().propertyFullAddress}, function(results, status) {

                if (status == google.maps.GeocoderStatus.OK) {
                    var lat = results[0].geometry.location.lat();
                    var lng = results[0].geometry.location.lng();
                    console.log("lat:" + lat + " lng:" + lng);
                    var fenway = new google.maps.LatLng(lat, lng);

                    var mapOptions = {
                        center: fenway,
                        zoom: 14,
                        scrollwheel: false
                    };

                    //if(map == undefined) {
                    map = new google.maps.Map(
                            document.getElementById('map-canvas'), mapOptions);

                    var panoramaOptions = {
                        position: fenway,
                        scrollwheel: false
                    };
                    //if(panorama == undefined) {
                    var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
                    var service = new google.maps.StreetViewService;

                    service.getPanoramaByLocation(panorama.getPosition(), 50, function(panoData, status) {
                        console.log(panoData);
                        console.log(status);
                        console.log("panoData");
                        if (status == 'OK') {
                            console.log("inside");
                            var panoCenter = panoData.location.latLng;
                            var pov = panorama.getPov();
                            pov.heading = google.maps.geometry.spherical.computeHeading(panoCenter, fenway);
                            panorama.setPov(pov);

                        }
                        else {
//                            alert($.i18n.t('app.prop_detail.gmaps_msg'));
                               console.log($.i18n.t('app.prop_detail.gmaps_msg'));
                               $('.map_error_msg').html('<h2 class="l-h-416">'+$.i18n.t('app.prop_detail.gmaps_msg')+'</h2>').show();

                        }

                    });

                    map.setStreetView(panorama);
                    //}
                  //  google.maps.event.trigger(map, 'resize');
                    //}
                }

            });
        },
        showPanoView: function() {
                        var geocoder = new google.maps.Geocoder();

               var propertySummary = app.propertyModel.toJSON().propertyInfo;
            var address = propertySummary.address + " " + propertySummary.city + " " + propertySummary.state + " " + propertySummary.zip;
            var mapCanvas = document.getElementById('map-canvas');
            var panoDiv = document.getElementById('pano');
            
            if(mapCanvas == null || panoDiv == null){return false;}
            
            geocoder.geocode({'address': address}, function(results, status) {

                if (status == google.maps.GeocoderStatus.OK) {
                    var lat = results[0].geometry.location.lat();
                    var lng = results[0].geometry.location.lng();
                    console.log("lat:" + lat + " lng:" + lng);
                    var fenway = new google.maps.LatLng(lat, lng);

                    var mapOptions = {
                        center: fenway,
                        zoom: 14,
                        scrollwheel: false
                    };
                    map = new google.maps.Map(mapCanvas, mapOptions);

                    var panoramaOptions = {
                        position: fenway,
                        scrollwheel: false
                    };
                    var panorama = new google.maps.StreetViewPanorama(panoDiv, panoramaOptions);
                    var service = new google.maps.StreetViewService;

                    service.getPanoramaByLocation(panorama.getPosition(), 50, function(panoData, status) {
                        if (status == 'OK') {
                            var panoCenter = panoData.location.latLng;
                            var pov = panorama.getPov();
                            pov.heading = google.maps.geometry.spherical.computeHeading(panoCenter, fenway);
                            panorama.setPov(pov);
                        }
                        else {
                               //$('.map_error_msg').html('<h2 class="l-h-416">'+$.i18n.t('app.prop_detail.gmaps_msg')+'</h2>').show();
                        }

                    });

                    map.setStreetView(panorama);
                }

            });


        },
      


	 });
	 return propertyPhotosDetailView;
});
